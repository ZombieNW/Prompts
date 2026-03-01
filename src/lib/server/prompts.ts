import type { PromptWithMeta, Prompt } from '$lib/types';
import { db } from '$lib/server/db';

const errorMessage = 'future prompt ideas';
const promptRequestPrompt: PromptWithMeta = {
	id: 0,
	body: 'future prompt ideas',
	created_by: 0,
	created_at: 0,
	scheduled_for: null,
	active_date: null,
	source: 'admin',
	response_count: 0,
	creator_username: 'System'
};

export function todayDateString(): string {
	const now = new Date();
	return now.toISOString().slice(0, 10);
}

export function getTodaysPrompt(): PromptWithMeta {
	const now = new Date();
	const today = todayDateString();

	// sunday is for begging for prompts
	if (now.getDay() === 0) return promptRequestPrompt;

	// get todays
	const existing = fetchPromptMetadata('active_date', today);
	if (existing) return existing;

	// if not, get a new one
	const newlyAssigned = assignDailyPrompt();

	// if there's none left, beg for more
	return newlyAssigned ?? promptRequestPrompt;
}

export function assignDailyPrompt(): PromptWithMeta | null {
	const today = todayDateString();

	const assignedId = db.transaction((): number | null => {
		// check if there's one today
		const existing = fetchPromptMetadata('active_date', today);
		if (existing) return existing?.id;

		// see if there's one scheudled today
		let candidate = db
			.prepare<
				string,
				Prompt
			>(`SELECT * FROM prompts WHERE scheduled_for = ? AND active_date IS NULL LIMIT 1`)
			.get(today);

		// get a random unsed one if nothing is scheduled
		if (!candidate) {
			candidate = db
				.prepare<
					[],
					Prompt
				>(`SELECT * FROM prompts WHERE active_date IS NULL ORDER BY RANDOM() LIMIT 1`)
				.get();
		}

		if (!candidate) return null;

		// mark it as active
		db.prepare(`UPDATE prompts SET active_date = ? WHERE id = ?`).run(today, candidate.id);

		return candidate.id;
	})();

	// Return the full object with metadata using our helper
	return assignedId ? fetchPromptMetadata('id', assignedId) : null;
}

function fetchPromptMetadata(
	column: 'active_date' | 'id',
	value: string | number
): PromptWithMeta | null {
	const row = db
		.prepare<any, PromptWithMeta>(
			`
        SELECT p.*, u.username AS creator_username,
            (SELECT COUNT(*) FROM responses r WHERE r.prompt_id = p.id AND r.published = 1) AS response_count
        FROM prompts p
        LEFT JOIN users u ON u.id = p.created_by
        WHERE p.${column} = ?
    `
		)
		.get(value);

	return row ?? null;
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
