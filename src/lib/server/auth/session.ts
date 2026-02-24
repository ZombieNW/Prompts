import { db } from '../db';
import { randomToken } from './crypto';

const SESSION_DURATION = 1000 * 60 * 60 * 24 * 30; // 30 days

export function createSession(userId: number): string {
	const id = randomToken();
	const now = Date.now();

	db.prepare(
		`
    INSERT INTO sessions (id, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `
	).run(id, userId, now + SESSION_DURATION, now);

	return id;
}

export function deleteSession(sessionId: string): void {
	db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

export function deleteAllUserSessions(userId: number): void {
	db.prepare(`DELETE FROM sessions WHERE user_id = ?`).run(userId);
}

export function purgeExpiredSessions(): number {
	const result = db.prepare(`DELETE FROM sessions WHERE expires_at <= ?`).run(Date.now());
	return result.changes;
}

export function validateSession(sessionId: string): boolean {
	const now = Date.now();
	const session = db
		.prepare(`SELECT * FROM sessions WHERE id = ? AND expires_at > ?`)
		.get(sessionId, now);
	return !!session;
}
