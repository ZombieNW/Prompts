import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { hashPassword } from '$lib/server/auth/crypto';
import { createSession } from '$lib/server/auth/session';
import type { RequestHandler } from './$types';

interface DBUser {
	id: number;
	password_hash: string;
	login_attempts: number;
	login_locked_until: number;
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { email, password } = await request.json();

	if (!email || !password) return json({ error: 'Email and password required' }, { status: 400 });

	const user = db
		.prepare(
			`
    SELECT id, password_hash, login_attempts, login_locked_until
    FROM users WHERE email = ?
  `
		)
		.get(email) as DBUser | undefined;

	if (!user) return json({ error: 'Invalid credentials' }, { status: 401 });

	const now = Date.now();

	if (user.login_locked_until > now) {
		const mins = Math.ceil((user.login_locked_until - now) / 60000);
		return json({ error: `Too many attempts. Try again in ${mins} minute(s).` }, { status: 429 });
	}

	if (user.password_hash !== hashPassword(password)) {
		const attempts = user.login_attempts + 1;
		const locked = attempts >= 5 ? now + 10 * 60 * 1000 : 0;
		db.prepare(
			`
      UPDATE users SET login_attempts = ?, login_locked_until = ? WHERE id = ?
    `
		).run(attempts, locked, user.id);
		return json({ error: 'Invalid credentials' }, { status: 401 });
	}

	db.prepare(
		`
    UPDATE users SET login_attempts = 0, login_locked_until = 0 WHERE id = ?
  `
	).run(user.id);

	const session = createSession(user.id);

	cookies.set('session', session, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production'
	});

	return json({ success: true });
};
