import { db } from '../db';
import type { EmailToken } from '../../types';

export function verifyEmail(token: string): boolean {
	const record = db
		.prepare(
			`
    SELECT * FROM email_tokens WHERE token=?
  `
		)
		.get(token) as EmailToken;

	if (!record) return false;

	if (record.expires_at < Date.now()) return false;

	db.prepare(
		`
    UPDATE users SET verified=1 WHERE id=?
  `
	).run(record.user_id);

	db.prepare(
		`
    DELETE FROM email_tokens WHERE user_id=?
  `
	).run(record.user_id);

	return true;
}
