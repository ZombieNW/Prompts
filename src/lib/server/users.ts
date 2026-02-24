import type { User, SafeUser, Session } from '$lib/types';
import { db } from './db';

export function toSafeUser(user: User): SafeUser {
	const { password_hash, ...safe } = user;
	return safe;
}

export function getUserById(id: number): User | null {
	return db.prepare<number, User>(`SELECT * FROM users WHERE id = ?`).get(id) ?? null;
}

export function getUserByEmail(email: string): User | null {
	return db.prepare<string, User>(`SELECT * FROM users WHERE email = ?`).get(email) ?? null;
}

export function getUserByUsername(username: string): User | null {
	return db.prepare<string, User>(`SELECT * FROM users WHERE username = ?`).get(username) ?? null;
}

export function getUserProfile(
	username: string
): (SafeUser & { response_count: number; prompt_submission_count: number }) | null {
	return (
		db
			.prepare<string, SafeUser & { response_count: number; prompt_submission_count: number }>(
				`SELECT u.id, u.username, u.created_at, u.is_admin,
					(SELECT COUNT(*) FROM responses r WHERE r.user_id = u.id AND r.published = 1) AS response_count,
					(SELECT COUNT(*) FROM user_prompts up WHERE up.created_by = u.id) AS prompt_submission_count
				FROM users u
				WHERE u.username = ?`
			)
			.get(username) ?? null
	);
}

export function validateSession(sessionId: string): { session: Session; user: User } | null {
	const now = Date.now();

	const session = db
		.prepare<[string, number], Session>(`SELECT * FROM sessions WHERE id = ? AND expires_at > ?`)
		.get(sessionId, now);

	if (!session) return null;

	const user = getUserById(session.user_id);
	if (!user) return null;

	return { session, user };
}

export function recordFailedLogin(userId: number): void {
	const LOCK_AFTER = 5;
	const LOCK_DURATION_MS = 15 * 60 * 1000;

	const user = getUserById(userId);
	if (!user) return;

	const attempts = user.login_attempts + 1;
	const lockedUntil = attempts >= LOCK_AFTER ? Date.now() + LOCK_DURATION_MS : 0;

	db.prepare(`UPDATE users SET login_attempts = ?, login_locked_until = ? WHERE id = ?`).run(
		attempts,
		lockedUntil,
		userId
	);
}

export function resetLoginAttempts(userId: number): void {
	db.prepare(`UPDATE users SET login_attempts = 0, login_locked_until = 0 WHERE id = ?`).run(
		userId
	);
}

export function isLoginLocked(user: User): boolean {
	return user.login_locked_until > Date.now();
}
