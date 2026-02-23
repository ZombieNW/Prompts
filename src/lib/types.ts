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

export interface AdminPrompt {
	id: number;
	title: string | null;
	body: string;
	prompt_date: string | null;
	created_by: number | null;
	created_at: number;
}

export interface UserPrompt {
	id: number;
	user_id: number;
	body: string;
	approved: number;
	created_at: number;
}

export interface Response {
	id: number;
	user_id: number;
	prompt_id: number;
	body: string;
	created_at: number;
}

export interface AuthUser {
	id: number;
	email: string;
	username: string;
	verified: number;
	is_admin: number;
}

export interface RegisterBody {
	email: string;
	username: string;
	password: string;
}
