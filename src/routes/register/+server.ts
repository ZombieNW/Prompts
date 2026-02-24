import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { registerUser } from '$lib/server/auth/register';
import { createSession } from '$lib/server/auth/session';
import { sendVerificationEmail } from '$lib/server/email';
import type { RegisterBody } from '$lib/types';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { email, username, password } = (await request.json()) as RegisterBody;

	// make sure we have all the required fields
	if (!email || !username || !password) {
		return json({ error: 'All fields required' }, { status: 400 });
	}

	// password must be at least 8 characters
	if (password.length < 8) {
		return json({ error: 'Password must be at least 8 characters' }, { status: 400 });
	}

	// check if email or username already exists
	const existing = db
		.prepare(
			`
                SELECT email, username FROM users WHERE email = ? OR username = ?
            `
		)
		.get(email, username) as { email: string; username: string } | undefined;

	if (existing) {
		const message = existing.email === email ? 'Email already in use' : 'Username already taken';
		return json({ error: message }, { status: 409 });
	}

	// register user
	const { userId, token } = registerUser(email, username, password);

	// send verification email
	sendVerificationEmail(email, token).catch(console.error);

	// create session
	const session = createSession(userId);
	cookies.set('session', session, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production'
	});

	return json({ success: true });
};
