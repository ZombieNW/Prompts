import type { LayoutServerLoad } from './$types';
import { getTodaysPrompt, assignDailyPrompt } from '$lib/server/prompts';

const errorMessage = 'no prompt found';

export const load: LayoutServerLoad = ({ locals }) => {
	let prompt = getTodaysPrompt() ?? { body: errorMessage };

	// if there's no prompt for today, assign one
	if (!prompt || prompt.body === errorMessage) {
		assignDailyPrompt();
		prompt = getTodaysPrompt() ?? { body: errorMessage };
	}

	return { user: locals.user ?? null, prompt };
};
