import type { UserPrompt, Prompt } from '$lib/types';
import { db } from '$lib/server/db';

export function submitUserPrompt(body: string, userId: number): UserPrompt {
	const now = Date.now();

	const result = db
		.prepare(
			`INSERT INTO user_prompts (body, created_by, created_at)
			VALUES (?, ?, ?)`
		)
		.run(body, userId, now);

	return db
		.prepare<number, UserPrompt>(`SELECT * FROM user_prompts WHERE id = ?`)
		.get(result.lastInsertRowid as number)!;
}

export function getPendingUserPrompts(): (UserPrompt & { username: string })[] {
	return db
		.prepare<[], UserPrompt & { username: string }>(
			`SELECT up.*, u.username
			FROM user_prompts up
			LEFT JOIN users u ON u.id = up.created_by
			WHERE up.promoted_at IS NULL
			ORDER BY up.created_at ASC`
		)
		.all();
}

export function getUserPromptsByUser(userId: number): (UserPrompt & { promoted: boolean })[] {
	return db
		.prepare<number, UserPrompt & { promoted: boolean }>(
			`SELECT *, (promoted_at IS NOT NULL) AS promoted
			FROM user_prompts
			WHERE created_by = ?
			ORDER BY created_at DESC`
		)
		.all(userId);
}

export function promoteUserPrompt(
	userPromptId: number,
	adminId: number,
	scheduledFor?: string
): Prompt | null {
	const userPrompt = db
		.prepare<number, UserPrompt>(`SELECT * FROM user_prompts WHERE id = ? AND promoted_at IS NULL`)
		.get(userPromptId);

	if (!userPrompt) return null;

	const now = Date.now();

	const promoted = db.transaction(() => {
		// Add to main prompts pool
		const result = db
			.prepare(
				`INSERT INTO prompts (body, created_by, created_at, scheduled_for, source)
				VALUES (?, ?, ?, ?, 'community')`
			)
			.run(userPrompt.body, userPrompt.created_by, now, scheduledFor ?? null);

		const newPromptId = result.lastInsertRowid as number;

		// Mark the user prompt as promoted
		db.prepare(`UPDATE user_prompts SET promoted_at = ?, promoted_by = ? WHERE id = ?`).run(
			now,
			adminId,
			userPromptId
		);

		return db.prepare<number, Prompt>(`SELECT * FROM prompts WHERE id = ?`).get(newPromptId)!;
	});

	return promoted();
}

export function rejectUserPrompt(userPromptId: number): boolean {
	const result = db
		.prepare(`DELETE FROM user_prompts WHERE id = ? AND promoted_at IS NULL`)
		.run(userPromptId);
	return result.changes > 0;
}

export function getPendingUserPromptCount(): number {
	const row = db
		.prepare<
			[],
			{ count: number }
		>(`SELECT COUNT(*) AS count FROM user_prompts WHERE promoted_at IS NULL`)
		.get()!;
	return row.count;
}
