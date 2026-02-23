import { getUserFromSession } from '$lib/server/db';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('session');

	if (sessionId) {
		const user = getUserFromSession(sessionId);
		if (user) {
			event.locals.user = user;
		} else {
			event.cookies.delete('session', { path: '/' });
		}
	}

	return resolve(event);
};
