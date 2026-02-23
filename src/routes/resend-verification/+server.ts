import { json } from "@sveltejs/kit"
import { db } from "$lib/server/db"
import { randomToken } from "$lib/server/auth/crypto"
import { sendVerificationEmail } from "$lib/server/email"

export async function POST({ locals }) {

  if (!locals.user) return json({ error: "unauthorized" }, { status: 401 })

  const user = locals.user
  const now = Date.now()

  if (now - user.last_verification_sent < 60000) {
    return json({ error: "wait before resending" }, { status: 429 })
  }

  const token = randomToken()

  db.prepare(`
    INSERT INTO email_tokens
    (token,user_id,expires_at,created_at)
    VALUES (?,?,?,?)
  `).run(token, user.id, now + 86400000, now)

  db.prepare(`
    UPDATE users SET last_verification_sent=?
    WHERE id=?
  `).run(now, user.id)

  await sendVerificationEmail(user.email, token)

  return json({ success: true })
}