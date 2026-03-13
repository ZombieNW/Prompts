import { requireAuth } from '$lib/server/auth/guards';
import { getResponsesByUser } from '$lib/server/responses';

export const load = async (event) => {
	const user = requireAuth(event);
	const userResponses = getResponsesByUser(user.id);

	return {
		user,
		userResponses
	};
};
