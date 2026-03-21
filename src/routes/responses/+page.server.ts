import { requireAuth } from '$lib/server/auth/guards';
import { getTodaysPrompt } from '$lib/server/prompts';
import { getResponsesForPrompt, getUserResponse } from '$lib/server/responses.js';

export const load = async (event) => {
	const user = requireAuth(event);
	const todaysPrompt = getTodaysPrompt();
	const responses = getResponsesForPrompt(todaysPrompt?.id);
	const userResponse = getUserResponse(user.id, todaysPrompt.id);

	return {
		user,
		responses,
		userResponse,
		todaysPrompt
	};
};
