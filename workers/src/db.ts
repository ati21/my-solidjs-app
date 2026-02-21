import { D1Database } from "@cloudflare/workers-types";

export interface UserRecord {
  id: string;
  email: string;
  created_at: string;
}

/** Insert a new user if not exists */
export async function upsertUser(
  db: D1Database,
  uid: string,
  email: string
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO users (id, email) VALUES (?, ?) 
       ON CONFLICT(id) DO UPDATE SET email = excluded.email`
    )
    .bind(uid, email)
    .run();
}

/** Fetch a user by Firebase UID */
export async function getUser(db: D1Database, uid: string): Promise<UserRecord | null> {
  const result = await db
    .prepare(`SELECT id, email, created_at FROM users WHERE id = ?`)
    .bind(uid)
    .first<UserRecord>();
  return result ?? null;
}