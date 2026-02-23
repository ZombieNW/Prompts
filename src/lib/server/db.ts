import Database from "better-sqlite3";
import type { User } from "$lib/types";

export const db = new Database("./db/app.db");

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Prepared once at startup — reused on every call
const getSessionStmt = db.prepare<[string]>(
  "SELECT user_id, expires_at FROM sessions WHERE id = ?"
);

const getUserStmt = db.prepare<[number]>(
  "SELECT id, email, username, verified, is_admin, last_verification_sent FROM users WHERE id = ?"
);

const deleteSessionStmt = db.prepare<[string]>(
  "DELETE FROM sessions WHERE id = ?"
);

export function getUserFromSession(sessionId: string): User | null {
  const session = getSessionStmt.get(sessionId) as
    | { user_id: number; expires_at: number }
    | undefined;

  if (!session) return null;

  if (session.expires_at < Date.now()) {
    deleteSessionStmt.run(sessionId);
    return null;
  }

  return (getUserStmt.get(session.user_id) as User) ?? null;
}