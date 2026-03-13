import { requireAuth } from '$lib/server/auth/guards';
import { getResponsesByUser } from '$lib/server/responses';
import { getUserById } from '$lib/server/users.js';
import { error } from '@sveltejs/kit';

export const load = async (event) => {
	const user = getUserById(Number(event.params.id));

	if (!user) {
		throw error(404, 'user not found');
	}
	const userResponses = getResponsesByUser(user.id);

	return {
		user,
		userResponses
	};
};
