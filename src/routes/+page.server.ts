import { requireAuth } from '$lib/server/auth/guards';
import { upsertResponse } from '$lib/server/responses';
import { getTodaysPrompt } from '$lib/server/prompts.js';

export const actions = {
	createResponse: async (event) => {
		const { request } = event;
		const user = requireAuth(event);
		const todaysPrompt = getTodaysPrompt();

		if (!todaysPrompt) return { error: 'no prompt found' };

		const data = await request.formData();

		const body = data.get('body') as string;

		const response = upsertResponse(user.id, todaysPrompt.id, body, true);

		return { response };
	}
};
