import type { PromptWithMeta, Prompt } from '$lib/types';
import { db } from '$lib/server/db';

export function todayDateString(): string {
	const now = new Date();
	return now.toISOString().slice(0, 10);
}

// if one doesn't exist, it returns null, assign daily prompt should be ran first
export function getTodaysPrompt(): PromptWithMeta | null {
	const today = todayDateString();

	const row = db
		.prepare<string, PromptWithMeta>(
			`SELECT p.*, u.username AS creator_username,
				(SELECT COUNT(*) FROM responses r WHERE r.prompt_id = p.id AND r.published = 1) AS response_count
			FROM prompts p
			LEFT JOIN users u ON u.id = p.created_by
			WHERE p.active_date = ?`
		)
		.get(today);

	return row ?? null;
}

export function assignDailyPrompt(): PromptWithMeta | null {
	const today = todayDateString();

	// check if there's already a prompt for today
	const existing = getTodaysPrompt();
	if (existing) return existing;

	const assign = db.transaction(() => {
		// msee if there's one scheduled for today
		let candidate = db
			.prepare<
				string,
				Prompt
			>(`SELECT * FROM prompts WHERE scheduled_for = ? AND active_date IS NULL LIMIT 1`)
			.get(today);

		// grab a random unused prompt
		if (!candidate) {
			candidate = db
				.prepare<
					[],
					Prompt
				>(`SELECT * FROM prompts WHERE active_date IS NULL ORDER BY RANDOM() LIMIT 1`)
				.get();
		}

		if (!candidate) return null;

		// mark the prompt as active
		db.prepare(`UPDATE prompts SET active_date = ? WHERE id = ?`).run(today, candidate.id);

		return getTodaysPrompt();
	});

	return assign();
}

export function getPastPrompts(limit = 30, offset = 0): PromptWithMeta[] {
	const today = todayDateString();

	return db
		.prepare<[string, number, number], PromptWithMeta>(
			`SELECT p.*, u.username AS creator_username,
				(SELECT COUNT(*) FROM responses r WHERE r.prompt_id = p.id AND r.published = 1) AS response_count
			FROM prompts p
			LEFT JOIN users u ON u.id = p.created_by
			WHERE p.active_date IS NOT NULL AND p.active_date < ?
			ORDER BY p.active_date DESC
			LIMIT ? OFFSET ?`
		)
		.all(today, limit, offset);
}

export function getPromptById(promptId: number): PromptWithMeta | null {
	return (
		db
			.prepare<number, PromptWithMeta>(
				`SELECT p.*, u.username AS creator_username,
					(SELECT COUNT(*) FROM responses r WHERE r.prompt_id = p.id AND r.published = 1) AS response_count
				FROM prompts p
				LEFT JOIN users u ON u.id = p.created_by
				WHERE p.id = ?`
			)
			.get(promptId) ?? null
	);
}

// admin use
export function createPrompt(body: string, createdBy: number, scheduledFor?: string): Prompt {
	const now = Date.now();

	const result = db
		.prepare(
			`INSERT INTO prompts (body, created_by, created_at, scheduled_for, source)
			VALUES (?, ?, ?, ?, 'admin')`
		)
		.run(body, createdBy, now, scheduledFor ?? null);

	return db
		.prepare<number, Prompt>(`SELECT * FROM prompts WHERE id = ?`)
		.get(result.lastInsertRowid as number)!;
}

// get list of unused prompts for admin use
export function getUnusedPrompts(): Prompt[] {
	return db
		.prepare<
			[],
			Prompt
		>(`SELECT p.* FROM prompts p WHERE p.active_date IS NULL ORDER BY p.scheduled_for ASC NULLS LAST, p.created_at ASC`)
		.all();
}

export function deleteUnusedPrompt(promptId: number): boolean {
	const result = db
		.prepare(`DELETE FROM prompts WHERE id = ? AND active_date IS NULL`)
		.run(promptId);
	return result.changes > 0;
}
