import { db } from '../db';
import { hashPassword, randomToken } from './crypto';

const VERIFICATION_TOKEN_DURATION = 1000 * 60 * 60 * 24; // 1 day

interface RegistrationResult {
	userId: number;
	token: string;
}

export function registerUser(
	email: string,
	username: string,
	password: string
): RegistrationResult {
	const hash = hashPassword(password);
	const now = Date.now();

	// create user
	const userResult = db
		.prepare(
			`
                INSERT INTO users (email, username, password_hash, created_at, last_verification_sent)
                VALUES (?, ?, ?, ?, ?)
            `
		)
		.run(email, username, hash, now, now);

	const userId = Number(userResult.lastInsertRowid);
	const token = randomToken();

	// verification token email
	db.prepare(
		`
            INSERT INTO email_tokens (token, user_id, expires_at, created_at)
            VALUES (?, ?, ?, ?)
        `
	).run(token, userId, now + VERIFICATION_TOKEN_DURATION, now);

	return { userId, token };
}
