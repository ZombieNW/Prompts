import type { LayoutServerLoad } from './$types';
import { getTodaysPrompt } from '$lib/server/prompts';
import { getUserResponse } from '$lib/server/responses';

export const load: LayoutServerLoad = ({ locals }) => {
	const prompt = getTodaysPrompt();
	const userResponse = locals.user ? getUserResponse(locals.user?.id, prompt.id) : null;

	return { user: locals.user ?? null, prompt, userResponse };
};
