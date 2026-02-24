import { db } from '../db';
import { randomToken } from './crypto';
import type { EmailToken } from '../../types';

const ONE_MINUTE = 60000;
const ONE_DAY = 86400000;

export function verifyEmail(token: string): boolean {
	const record = db.prepare(`SELECT * FROM email_tokens WHERE token = ?`).get(token) as
		| EmailToken
		| undefined;

	// make sure email token is valid and hasn't expired
	if (!record || record.expires_at < Date.now()) return false;

	// verify user and delete email token
	const transaction = db.transaction(() => {
		db.prepare(`UPDATE users SET verified = 1 WHERE id = ?`).run(record.user_id);
		db.prepare(`DELETE FROM email_tokens WHERE user_id = ?`).run(record.user_id);
	});

	// execute transaction
	transaction();
	return true;
}

type ResendResult =
	| { type: 'success'; token: string }
	| { type: 'rate_limited'; secondsLeft: number }
	| { type: 'already_verified' };

export function requestNewVerification(
	userId: number,
	userEmail: string,
	lastSent: number | null,
	isVerified: boolean
): ResendResult {
	if (isVerified) return { type: 'already_verified' };

	// make sure email hasn't been verified recently
	const now = Date.now();
	if (lastSent && now - lastSent < ONE_MINUTE) {
		const secondsLeft = Math.ceil((ONE_MINUTE - (now - lastSent)) / 1000);
		return { type: 'rate_limited', secondsLeft };
	}

	// create new email token
	const token = randomToken();
	const executeResend = db.transaction(() => {
		db.prepare(`DELETE FROM email_tokens WHERE user_id = ?`).run(userId);
		db.prepare(
			`
            INSERT INTO email_tokens (token, user_id, expires_at, created_at)
            VALUES (?, ?, ?, ?)
        `
		).run(token, userId, now + ONE_DAY, now);
		db.prepare(`UPDATE users SET last_verification_sent = ? WHERE id = ?`).run(now, userId);
	});

	// execute transaction
	executeResend();
	return { type: 'success', token };
}
