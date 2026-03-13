import { requireAuth } from '$lib/server/auth/guards';
import { getTodaysPrompt, getPastPrompts } from '$lib/server/prompts';
import { getResponsesForPrompt, getUserResponse } from '$lib/server/responses.js';

export const load = async (event) => {
	const user = requireAuth(event);
	const todaysPrompt = getTodaysPrompt();
	const prompts = getPastPrompts();

	return {
		user,
		prompts,
		todaysPrompt
	};
};
