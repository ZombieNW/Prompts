import { requireAuth } from '$lib/server/auth/guards';

export const load = async (event) => {
	const user = requireAuth(event);

	return {
		user
	};
};
