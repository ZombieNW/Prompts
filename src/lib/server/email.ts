import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';

export const resend = new Resend(RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
	const url = `http://localhost:5173/verify?token=${token}`;

	await resend.emails.send({
		from: 'Prompts, not Prompts <noreply@zombienw.com>',
		to: email,
		subject: 'Verify your email',
		html: `
      <h2>Verify your email</h2>
      <p>Click the link below:</p>
      <a href="${url}">${url}</a>
    `
	});
}
