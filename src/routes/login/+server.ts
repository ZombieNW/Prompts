import { json } from '@sveltejs/kit';
import { attemptLogin } from '$lib/server/auth/login';
import { createSession } from '$lib/server/auth/session';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { email, password } = await request.json();

	// make sure we have all the required fields
	if (!email || !password) {
		return json({ error: 'email and password required' }, { status: 400 });
	}

	// attempt to login
	const result = attemptLogin(email, password);

	// handle login results
	switch (result.type) {
		case 'invalid':
			return json({ error: 'invalid email or password' }, { status: 401 });

		case 'locked':
			return json(
				{
					error: `too many attempts. try again in ${result.remainingMinutes} min(s).`
				},
				{ status: 429 }
			);

		case 'success':
			const session = createSession(result.userId);

			cookies.set('session', session, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production'
			});

			return json({ success: true });
	}
};
