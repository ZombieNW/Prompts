import { redirect, fail } from '@sveltejs/kit';
import { verifyEmail, requestNewVerification } from '$lib/server/auth/verify';
import { sendVerificationEmail } from '$lib/server/email';
import { requireAuth } from '$lib/server/auth/guards';

export const load = async (event) => {
	const user = requireAuth(event);
	const token = event.url.searchParams.get('token');

	if (token) {
		const success = verifyEmail(token);
		if (!success) {
			return { user, error: 'invalid verification link.' };
		}
		throw redirect(303, '/verify');
	}

	return {
		user,
		success: event.url.searchParams.get('success') === '1'
	};
};

export const actions = {
	resend: async ({ locals }) => {
		const user = locals.user;
		if (!user) return fail(401, { message: 'unauthorized' });

		const result = requestNewVerification(
			user.id,
			user.email,
			user.last_verification_sent,
			!!user.verified
		);

		// handle resend results
		switch (result.type) {
			case 'already_verified':
				return fail(400, { message: 'email already verified' });

			case 'rate_limited':
				return fail(429, {
					message: `please wait ${result.secondsLeft} seconds before trying again.`
				});

			case 'success':
				try {
					await sendVerificationEmail(user.email, result.token);
					return { success: true };
				} catch (err) {
					console.error('Email error:', err);
					return fail(500, { message: 'failed to send email.' });
				}
		}
	}
};
