import { db } from '../db';
import { hashPassword, randomToken } from './crypto';

export function registerUser(email: string, username: string, password: string): string {
	const hash = hashPassword(password);
	const now = Date.now();

	const result = db
		.prepare(
			`
    INSERT INTO users (email,username,password_hash,created_at)
    VALUES (?,?,?,?)
  `
		)
		.run(email, username, hash, now);

	const userId = result.lastInsertRowid;

	const token = randomToken();

	// create email token
	db.prepare(
		`
    INSERT INTO email_tokens (token,user_id,expires_at,created_at)
    VALUES (?,?,?,?)
  `
	).run(token, userId, now + 1000 * 60 * 60 * 24, now); // 1 day

	return token;
}
