import Database from 'better-sqlite3';

const db = new Database('./db/app.db', { verbose: console.log });

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0,
    verified INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    last_verification_sent INTEGER DEFAULT 0,
    login_attempts INTEGER DEFAULT 0,
    login_locked_until INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_tokens (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- scheduled_for lets you pre-schedule prompts for a specific date.
-- active_date is set automatically when the prompt becomes the daily prompt.
-- source is 'admin' or 'community'
CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    body TEXT NOT NULL,
    created_by INTEGER,
    created_at INTEGER NOT NULL,
    scheduled_for TEXT,           -- YYYY-MM-DD
    active_date TEXT UNIQUE,      -- YYYY-MM-DD
    source TEXT NOT NULL DEFAULT 'admin', -- 'admin' | 'community'
    FOREIGN KEY(created_by) REFERENCES users(id)
);

-- User-submitted prompts awaiting review/promotion
CREATE TABLE IF NOT EXISTS user_prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    body TEXT NOT NULL,
    created_by INTEGER,
    created_at INTEGER NOT NULL,
    promoted_at INTEGER,          -- unix timestamp when promoted to main prompts
    promoted_by INTEGER,          -- admin user id who approved it
    FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(promoted_by) REFERENCES users(id)
);

-- Responses to daily prompts
CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    prompt_id INTEGER NOT NULL,
    body TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    published INTEGER NOT NULL DEFAULT 0, -- 0=draft, 1=published
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
    UNIQUE(user_id, prompt_id)
);

-- Likes on responses
CREATE TABLE IF NOT EXISTS response_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    response_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(response_id) REFERENCES responses(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(response_id, user_id)
);
`);

db.exec(`
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_email_tokens_user ON email_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_prompt ON responses(prompt_id);
CREATE INDEX IF NOT EXISTS idx_responses_user ON responses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_prompts_user ON user_prompts(created_by);
CREATE INDEX IF NOT EXISTS idx_prompts_active_date ON prompts(active_date);
CREATE INDEX IF NOT EXISTS idx_prompts_scheduled ON prompts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_response_likes_response ON response_likes(response_id);
CREATE INDEX IF NOT EXISTS idx_response_likes_user ON response_likes(user_id);
`);

console.log('Database initialized.');
db.close();
