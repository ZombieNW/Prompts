import { db } from '../db';
import { hashPassword } from './crypto';

const LOCKOUT_DURATION = 1000 * 60 * 10; // 15 minutes
const MINUTE_DIVISOR = 1000 * 60; // 1 minute
const ALLOWED_ATTEMPTS = 5;

type LoginResponse =
	| { type: 'success'; userId: number }
	| { type: 'locked'; remainingMinutes: number }
	| { type: 'invalid' };

export function attemptLogin(email: string, password: string): LoginResponse {
	// find user
	const user = db
		.prepare(
			`
                SELECT id, password_hash, login_attempts, login_locked_until 
                FROM users WHERE email = ?
            `
		)
		.get(email) as
		| { id: number; password_hash: string; login_attempts: number; login_locked_until: number }
		| undefined;

	if (!user) return { type: 'invalid' };
	const now = Date.now();

	// make sure account wasn't locked
	if (user.login_locked_until > now) {
		const remainingMinutes = Math.ceil((user.login_locked_until - now) / MINUTE_DIVISOR);
		return { type: 'locked', remainingMinutes };
	}

	// verify password
	if (user.password_hash !== hashPassword(password)) {
		const attempts = user.login_attempts + 1;
		const lockUntil = attempts >= ALLOWED_ATTEMPTS ? now + LOCKOUT_DURATION : 0;

		db.prepare(
			`
                UPDATE users SET login_attempts = ?, login_locked_until = ? WHERE id = ?
            `
		).run(attempts, lockUntil, user.id);

		return { type: 'invalid' };
	}

	// reset attempts after success
	db.prepare(
		`
            UPDATE users SET login_attempts = 0, login_locked_until = 0 WHERE id = ?
        `
	).run(user.id);

	return { type: 'success', userId: user.id };
}
