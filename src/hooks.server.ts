import { toSafeUser, validateSession } from '$lib/server/users';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('session');

	if (sessionId) {
		const sessionResult = validateSession(sessionId);
		if (sessionResult) {
			event.locals.user = toSafeUser(sessionResult.user);
		} else {
			event.cookies.delete('session', { path: '/' });
		}
	}

	return resolve(event);
};
