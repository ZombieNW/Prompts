import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { EmailToken } from '$lib/types.js';

export async function GET({ url }) {
	const token = url.searchParams.get('token');

	if (!token) throw redirect(302, '/login');

	const record = db
		.prepare(
			`
    SELECT * FROM email_tokens WHERE token=?
  `
		)
		.get(token) as EmailToken;

	if (!record) throw redirect(302, '/login');

	if (record.expires_at < Date.now()) throw redirect(302, '/login');

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

	throw redirect(302, '/');
}
