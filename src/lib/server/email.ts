import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

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
