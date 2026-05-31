import Database from 'better-sqlite3';

let db: Database.Database | undefined;

export function getDb(): Database.Database {
  if (!db) {
    const databasePath = process.env.DATABASE_PATH ?? './tasks.db';
    db = new Database(databasePath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database.Database): void {
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
    db.close();
    db = undefined;
  }
}
