import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export function requireAuth(event: RequestEvent) {
	if (!event.locals.user) {
		throw redirect(302, `/login?next=${encodeURIComponent(event.url.pathname)}`);
	}
	return event.locals.user;
}

export function requireVerified(event: RequestEvent) {
	const user = requireAuth(event);
	if (!user.verified) throw redirect(302, '/verify-notice');
	return user;
}

export function requireAdmin(event: RequestEvent) {
	const user = requireAuth(event);
	if (!user.is_admin) throw redirect(302, '/');
	return user;
}
