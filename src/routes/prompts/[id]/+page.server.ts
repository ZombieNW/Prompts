import { getPromptById } from '$lib/server/prompts';
import { error } from '@sveltejs/kit';

export const load = async (event) => {
	const user = event.locals.user;
	const prompt = getPromptById(Number(event.params.id)) ?? null;

	if (!prompt) {
		throw error(404, 'prompt not found');
	}

	return {
		user,
		prompt
	};
};
