import { deleteSession } from '$lib/server/auth/session';

export async function POST({ cookies }) {
	const sessionId = cookies.get('session');

	if (sessionId) {
		await deleteSession(sessionId);
	}

	cookies.delete('session', { path: '/' });

	return new Response();
}
