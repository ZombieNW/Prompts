import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';

export const resend = new Resend(RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
	const url = `http://localhost:5173/verify?token=${token}`;

	await resend.emails.send({
		from: 'Prompts, not Prompts <noreply@zombienw.com>',
		to: email,
		subject: 'verify your email',
		html: `
<h2>welcome to prompts, not prompts</h2>
<br/>
<p>to verify your email, click this link:</p>
<br/>
<a href="${url}">verify your email</a>
<br/>
<p>this link expires in 24 hours</p>
`
	});
}
