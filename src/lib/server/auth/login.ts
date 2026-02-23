import { db } from '../db';
import { hashPassword } from './crypto';
import { createSession } from './session';
import type { User } from '../../types';

export function login(email: string, password: string): { user: User; sessionId: string } | null {
	const user = db
		.prepare(
			`
    SELECT * FROM users WHERE email = ?
  `
		)
		.get(email) as User;

	if (!user) return null;

	if (user.password_hash !== hashPassword(password)) return null;

	const sessionId = createSession(user.id);

	return { user, sessionId };
}
