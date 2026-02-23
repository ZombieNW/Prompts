import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { hashPassword, randomToken } from '$lib/server/auth/crypto';
import { createSession } from '$lib/server/auth/session';
import { sendVerificationEmail } from '$lib/server/email';
import type { RegisterBody } from '$lib/types';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { email, username, password } = (await request.json()) as RegisterBody;

	if (!email || !username || !password)
		return json({ error: 'All fields required' }, { status: 400 });

	if (password.length < 8)
		return json({ error: 'Password must be at least 8 characters' }, { status: 400 });

	const existing = db
		.prepare(
			`
    SELECT email, username FROM users WHERE email = ? OR username = ?
  `
		)
		.get(email, username) as { email: string; username: string } | undefined;

	if (existing) {
		return json(
			{ error: existing.email === email ? 'Email already in use' : 'Username already taken' },
			{ status: 409 }
		);
	}

	const now = Date.now();
	const result = db
		.prepare(
			`
    INSERT INTO users (email, username, password_hash, created_at, last_verification_sent)
    VALUES (?, ?, ?, ?, ?)
  `
		)
		.run(email, username, hashPassword(password), now, now);

	const userId = Number(result.lastInsertRowid);
	const token = randomToken();

	db.prepare(
		`
    INSERT INTO email_tokens (token, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `
	).run(token, userId, now + 86400000, now);

	sendVerificationEmail(email, token).catch(console.error);

	const session = createSession(userId);
	cookies.set('session', session, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production'
	});

	return json({ success: true });
};
