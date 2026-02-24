import { createPrompt, getUnusedPrompts, deleteUnusedPrompt } from '$lib/server/prompts';
import { requireAdmin } from '$lib/server/auth/guards';

export const load = async (event) => {
	const user = requireAdmin(event);
	const prompts = getUnusedPrompts();

	return {
		user,
		prompts
	};
};

export const actions = {
	createPrompt: async (event) => {
		const { request } = event;
		const user = requireAdmin(event);

		const data = await request.formData();

		const body = data.get('body') as string;
		const scheduledFor = data.get('scheduledFor') as string | undefined;

		const prompt = await createPrompt(body, user.id, scheduledFor);

		return {
			success: true,
			prompt
		};
	},

	deletePrompt: async (event) => {
		const { request } = event;
		const user = requireAdmin(event);

		const data = await request.formData();
		const id = data.get('id') as string;

		deleteUnusedPrompt(parseInt(id));

		return {
			success: true,
			id
		};
	}
};
