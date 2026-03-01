import type { LayoutServerLoad } from './$types';
import { getTodaysPrompt } from '$lib/server/prompts';

export const load: LayoutServerLoad = ({ locals }) => {
	let prompt = getTodaysPrompt();

	return { user: locals.user ?? null, prompt };
};
