export interface User {
	id: number;
	email: string;
	username: string;
	password_hash: string;
	verified: number;
	is_admin: number;
	created_at: number;
	last_verification_sent: number;
	login_attempts: number;
	login_locked_until: number;
}

export interface Session {
	id: string;
	user_id: number;
	expires_at: number;
	created_at: number;
}

export interface EmailToken {
	token: string;
	user_id: number;
	expires_at: number;
	created_at: number;
}

export interface Prompt {
	id: number;
	body: string;
	created_by: number | null;
	created_at: number;
	scheduled_for: string | null; // ISO date string YYYY-MM-DD
	active_date: string | null; // ISO date string YYYY-MM-DD, set when prompt becomes daily prompt
	source: 'admin' | 'community';
}

export interface UserPrompt {
	id: number;
	body: string;
	created_by: number | null;
	created_at: number;
	promoted_at: number | null; // when it was moved to main prompts
	promoted_by: number | null; // admin who approved it
}

export interface Response {
	id: number;
	user_id: number;
	prompt_id: number;
	body: string;
	created_at: number;
	updated_at: number;
	published: number; // 0 = draft, 1 = published
	likes: number;
}

export interface ResponseLike {
	id: number;
	response_id: number;
	user_id: number;
	created_at: number;
}

// display
export interface PromptWithMeta extends Prompt {
	response_count: number;
	creator_username?: string | null;
}

export interface ResponseWithMeta extends Response {
	username: string;
	prompt_body: string;
	like_count: number;
	user_has_liked?: boolean;
}

export type SafeUser = Omit<User, 'password_hash'>;
