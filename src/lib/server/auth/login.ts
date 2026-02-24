import { db } from '../db';
import { hashPassword } from './crypto';
import { recordFailedLogin, resetLoginAttempts, isLoginLocked } from '$lib/server/users';
import type { User } from '$lib/types';

const MINUTE_DIVISOR = 1000 * 60;

type LoginResponse =
	| { type: 'success'; userId: number }
	| { type: 'locked'; remainingMinutes: number }
	| { type: 'invalid' };

export function attemptLogin(email: string, password: string): LoginResponse {
	// try to find the user
	const user = db
		.prepare(
			`SELECT id, password_hash, login_attempts, login_locked_until FROM users WHERE email = ?`
		)
		.get(email) as User | undefined;

	// user not found
	if (!user) return { type: 'invalid' };

	// if user is locked out
	const now = Date.now();
	if (isLoginLocked(user)) {
		const remainingMinutes = Math.ceil((user.login_locked_until - now) / MINUTE_DIVISOR);
		return { type: 'locked', remainingMinutes };
	}

	// verify password
	if (user.password_hash !== hashPassword(password)) {
		recordFailedLogin(user.id);
		return { type: 'invalid' };
	}

	// reset login attempts and log in
	resetLoginAttempts(user.id);
	return { type: 'success', userId: user.id };
}
