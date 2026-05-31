import { Database } from 'bun:sqlite';

let db: Database | undefined;

export function getDb(): Database {
  if (!db) {
    const databasePath = process.env.DATABASE_PATH ?? './tasks.db';
    db = new Database(databasePath, { create: true });
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      completed  INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);
}

export function closeDb(): void {
  if (db) {
    db.close(false);
    db = undefined;
  }
}
