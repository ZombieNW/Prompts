import { deleteSession } from '$lib/server/auth/session';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ cookies }) => {
		const sessionId = cookies.get('session');

		if (sessionId) {
			await deleteSession(sessionId);
		}

		// Clear the cookie and redirect to home
		cookies.delete('session', { path: '/' });

		throw redirect(303, '/');
	}
};
