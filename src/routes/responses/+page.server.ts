import { getTodaysPrompt } from '$lib/server/prompts';
import { redirect } from '@sveltejs/kit';

export const load = async (event) => {
	const todaysPrompt = getTodaysPrompt();
	redirect(303, `/prompts/${todaysPrompt.id}`);
};
