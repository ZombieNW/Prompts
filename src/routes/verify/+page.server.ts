import { db } from '$lib/server/db';
import { redirect, fail } from '@sveltejs/kit';
import { randomToken } from '$lib/server/auth/crypto';
import { sendVerificationEmail } from '$lib/server/email';
import { requireAuth } from '$lib/server/auth/guards';
import type { EmailToken } from '$lib/types';

const oneMinute = 60000;
const oneDay = 86400000;

const resendVerification = db.transaction((token: string, userId: number, now: number) => {
	db.prepare(`DELETE FROM email_tokens WHERE user_id = ?`).run(userId);

	db.prepare(
		`
        INSERT INTO email_tokens (token, user_id, expires_at, created_at)
        VALUES (?, ?, ?, ?)
    `
	).run(token, userId, now + oneDay, now);

	db.prepare(
		`
        UPDATE users SET last_verification_sent = ?
        WHERE id = ?
    `
	).run(now, userId);
});

export const load = async (event) => {
	const { url } = event;
	const user = requireAuth(event);

	const token = url.searchParams.get('token');

	if (token) {
		const record = db
			.prepare(`SELECT * FROM email_tokens WHERE token = ?`)
			.get(token) as EmailToken;

		if (!record || record.expires_at < Date.now()) {
			return { user, error: 'Invalid or expired verification link.' };
		}

		db.prepare(`UPDATE users SET verified = 1 WHERE id = ?`).run(record.user_id);
		db.prepare(`DELETE FROM email_tokens WHERE user_id = ?`).run(record.user_id);

		throw redirect(303, '/verify?success=1');
	}

	return {
		user,
		success: url.searchParams.get('success') === '1'
	};
};

export const actions = {
	resend: async ({ locals }) => {
		const user = locals.user;

		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		if (user.verified) {
			return fail(400, { message: 'Email already verified.' });
		}

		const now = Date.now();

		if (user.last_verification_sent && now - user.last_verification_sent < oneMinute) {
			const secondsLeft = Math.ceil((oneMinute - (now - user.last_verification_sent)) / 1000);

			return fail(429, {
				message: `Please wait ${secondsLeft} seconds before resending.`
			});
		}

		const token = randomToken();

		try {
			resendVerification(token, user.id, now);

			await sendVerificationEmail(user.email, token);

			return { success: true };
		} catch (err) {
			console.error('Verification resend error:', err);

			return fail(500, {
				message: 'Failed to send email. Please try again later.'
			});
		}
	}
};
