import { requireAuth } from '$lib/server/auth/guards';
import { getTodaysPrompt, getPastPrompts } from '$lib/server/prompts';
import { getResponsesForPrompt, getUserResponse } from '$lib/server/responses.js';

export const load = async (event) => {
	const user = event.locals.user;
	const todaysPrompt = getTodaysPrompt();

	const limit = 5;

	const offsetParam = event.url.searchParams.get('offset');
	const currentOffset = offsetParam ? Number(offsetParam) : 0;

	const prompts = getPastPrompts(limit, currentOffset);

	return {
		user,
		prompts,
		offset: currentOffset,
		limit,
		todaysPrompt
	};
};
