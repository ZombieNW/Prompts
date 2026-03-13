import { getResponseById } from '$lib/server/responses';
import { error } from '@sveltejs/kit';

export const load = async (event) => {
	const user = event.locals.user;
	const response = getResponseById(Number(event.params.id)) ?? null;

	if (!response) {
		throw error(404, 'prompt not found');
	}

	return {
		user,
		response
	};
};
