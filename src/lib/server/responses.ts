import type { Response, ResponseWithMeta } from '$lib/types';
import { db } from './db';

export function getUserResponse(userId: number, promptId: number): ResponseWithMeta | null {
	const query = `
        SELECT 
            r.*, 
            u.username, 
            p.body AS prompt_body,
            (SELECT COUNT(*) FROM response_likes WHERE response_id = r.id) AS like_count,
            EXISTS(SELECT 1 FROM response_likes WHERE response_id = r.id AND user_id = :userId) AS user_has_liked
        FROM responses r
        JOIN users u ON r.user_id = u.id
        JOIN prompts p ON r.prompt_id = p.id
        WHERE r.user_id = :userId AND r.prompt_id = :promptId
    `;

	const row = db.prepare(query).get({ userId, promptId }) as any;

	if (!row) return null;

	return {
		...row,
		user_has_liked: !!row.user_has_liked,
		like_count: Number(row.like_count)
	};
}

export function getResponseById(responseId: number): ResponseWithMeta | null {
	return (
		db
			.prepare<number, ResponseWithMeta>(
				`SELECT r.*, u.username, p.body AS prompt_body,
					(SELECT COUNT(*) FROM response_likes rl WHERE rl.response_id = r.id) AS like_count
				FROM responses r
				JOIN users u ON u.id = r.user_id
				JOIN prompts p ON p.id = r.prompt_id
				WHERE r.id = ?`
			)
			.get(responseId) ?? null
	);
}

export function upsertResponse(
	userId: number,
	promptId: number,
	body: string,
	published: boolean
): Response {
	const now = Date.now();

	// check for existing
	const existing = getUserResponse(userId, promptId);

	if (existing) {
		db.prepare(`UPDATE responses SET body = ?, updated_at = ?, published = ? WHERE id = ?`).run(
			body,
			now,
			published ? 1 : 0,
			existing.id
		);

		return db.prepare<number, Response>(`SELECT * FROM responses WHERE id = ?`).get(existing.id)!;
	}

	const result = db
		.prepare(
			`INSERT INTO responses (user_id, prompt_id, body, created_at, updated_at, published)
			VALUES (?, ?, ?, ?, ?, ?)`
		)
		.run(userId, promptId, body, now, now, published ? 1 : 0);

	return db
		.prepare<number, Response>(`SELECT * FROM responses WHERE id = ?`)
		.get(result.lastInsertRowid as number)!;
}

export function publishResponse(responseId: number, userId: number): boolean {
	const result = db
		.prepare(`UPDATE responses SET published = 1, updated_at = ? WHERE id = ? AND user_id = ?`)
		.run(Date.now(), responseId, userId);
	return result.changes > 0;
}

export function unpublishResponse(responseId: number, userId: number): boolean {
	const result = db
		.prepare(`UPDATE responses SET published = 0, updated_at = ? WHERE id = ? AND user_id = ?`)
		.run(Date.now(), responseId, userId);
	return result.changes > 0;
}

export function deleteResponse(responseId: number, userId: number, isAdmin = false): boolean {
	const query = isAdmin
		? `DELETE FROM responses WHERE id = ?`
		: `DELETE FROM responses WHERE id = ? AND user_id = ?`;
	const args = isAdmin ? [responseId] : [responseId, userId];
	const result = db.prepare(query).run(...args);
	return result.changes > 0;
}

export function metaResponseFromResponse(response: Response): ResponseWithMeta {
	const likeCountResult = db
		.prepare(`SELECT COUNT(*) AS count FROM response_likes WHERE response_id = ?`)
		.get(response.id) as { count: number } | undefined;

	const like_count = likeCountResult?.count ?? 0;

	const userHasLikedResult = db
		.prepare(`SELECT id FROM response_likes WHERE response_id = ? AND user_id = ?`)
		.get(response.id, response.user_id);

	const userResult = db.prepare(`SELECT username FROM users WHERE id = ?`).get(response.user_id) as
		| { username: string }
		| undefined;

	const promptResult = db
		.prepare(`SELECT body FROM prompts WHERE id = ?`)
		.get(response.prompt_id) as { body: string } | undefined;

	return {
		...response,
		username: userResult?.username ?? 'unknown',
		prompt_body: promptResult?.body ?? 'unknown',
		like_count,
		user_has_liked: !!userHasLikedResult
	};
}

export function getResponsesForPrompt(
	promptId: number,
	viewingUserId?: number,
	limit = 50,
	offset = 0
): ResponseWithMeta[] {
	const userId = viewingUserId ?? null;

	return db
		.prepare<[number | null, number | null, number, number, number], ResponseWithMeta>(
			`SELECT r.*, u.username, p.body AS prompt_body,
                (SELECT COUNT(*) FROM response_likes rl WHERE rl.response_id = r.id) AS like_count,
                CASE WHEN ? IS NOT NULL THEN
                    EXISTS(SELECT 1 FROM response_likes rl WHERE rl.response_id = r.id AND rl.user_id = ?)
                ELSE 0 END AS user_has_liked
            FROM responses r
            JOIN users u ON u.id = r.user_id
            JOIN prompts p ON p.id = r.prompt_id
            WHERE r.prompt_id = ? AND r.published = 1
            ORDER BY like_count DESC, r.created_at ASC
            LIMIT ? OFFSET ?`
		)
		.all(userId, userId, promptId, limit, offset);
}

export function getResponsesByUser(userId: number, limit = 50, offset = 0): ResponseWithMeta[] {
	return db
		.prepare<[number, number, number], ResponseWithMeta>(
			`SELECT r.*, u.username, p.body AS prompt_body,
				(SELECT COUNT(*) FROM response_likes rl WHERE rl.response_id = r.id) AS like_count
			FROM responses r
			JOIN users u ON u.id = r.user_id
			JOIN prompts p ON p.id = r.prompt_id
			WHERE r.user_id = ?
			ORDER BY r.created_at DESC
			LIMIT ? OFFSET ?`
		)
		.all(userId, limit, offset);
}

export function toggleLike(
	responseId: number,
	userId: number
): { liked: boolean; likeCount: number } {
	const toggle = db.transaction(() => {
		const existing = db
			.prepare<
				[number, number],
				{ id: number }
			>(`SELECT id FROM response_likes WHERE response_id = ? AND user_id = ?`)
			.get(responseId, userId);

		if (existing) {
			db.prepare(`DELETE FROM response_likes WHERE response_id = ? AND user_id = ?`).run(
				responseId,
				userId
			);
		} else {
			db.prepare(
				`INSERT INTO response_likes (response_id, user_id, created_at) VALUES (?, ?, ?)`
			).run(responseId, userId, Date.now());
		}

		const { count } = db
			.prepare<
				number,
				{ count: number }
			>(`SELECT COUNT(*) AS count FROM response_likes WHERE response_id = ?`)
			.get(responseId)!;

		return { liked: !existing, likeCount: count };
	});

	return toggle();
}

export function getResponseLikeStatus(
	responseId: number,
	userId?: number
): { likeCount: number; userHasLiked: boolean } {
	const { count } = db
		.prepare<
			number,
			{ count: number }
		>(`SELECT COUNT(*) AS count FROM response_likes WHERE response_id = ?`)
		.get(responseId)!;

	let userHasLiked = false;
	if (userId) {
		const existing = db
			.prepare<
				[number, number],
				{ id: number }
			>(`SELECT id FROM response_likes WHERE response_id = ? AND user_id = ?`)
			.get(responseId, userId);
		userHasLiked = !!existing;
	}

	return { likeCount: count, userHasLiked };
}
