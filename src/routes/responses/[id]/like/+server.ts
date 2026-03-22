import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { toggleLike, getResponseLikeStatus } from '$lib/server/responses';
import { requireAuth } from '$lib/server/auth/guards';

export const POST: RequestHandler = async (event) => {
	const user = requireAuth(event);
	if (!user) {
		throw error(401, 'Unauthorized');
	}

	const responseId = event.params.id;

	try {
		const result = toggleLike(Number(responseId), user.id);

		return json({
			success: true,
			liked: result.liked,
			likeCount: result.likeCount
		});
	} catch (err) {
		console.error('Failed to toggle like:', err);
		throw error(500, 'Internal Server Error');
	}
};

export const GET: RequestHandler = async (event) => {
	const user = requireAuth(event);
	if (!user) {
		throw error(401, 'Unauthorized');
	}

	const responseId = event.params.id;

	const result = getResponseLikeStatus(Number(responseId), user.id);

	return json(result);
};
