import { requireAuth } from '$lib/server/auth/guards';
import { getTodaysPrompt, getPastPrompts } from '$lib/server/prompts';
import { getResponsesForPrompt, getUserResponse } from '$lib/server/responses.js';

export const load = async (event) => {
	const user = event.locals.user;
	const todaysPrompt = getTodaysPrompt();
	const prompts = getPastPrompts();

	return {
		user,
		prompts,
		todaysPrompt
	};
};
