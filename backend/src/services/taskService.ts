import { randomUUID } from 'crypto';
import { getDb } from '../db/database.js';
import type { Task } from '../types/task.js';
import type { CreateTaskInput, UpdateTaskInput } from '../schemas/taskSchemas.js';

interface TaskRow {
  id: string;
  title: string;
  completed: number;
  created_at: string;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed === 1,
    createdAt: row.created_at,
  };
}

export function getAllTasks(): Task[] {
  const db = getDb();
  const stmt = db.prepare<[], TaskRow>('SELECT id, title, completed, created_at FROM tasks ORDER BY created_at DESC');
  return stmt.all().map(rowToTask);
}

export function getTaskById(id: string): Task | null {
  const db = getDb();
  const stmt = db.prepare<[string], TaskRow>('SELECT id, title, completed, created_at FROM tasks WHERE id = ?');
  const row = stmt.get(id);
  return row ? rowToTask(row) : null;
}

export function createTask(input: CreateTaskInput): Task {
  const db = getDb();
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const trimmedTitle = input.title.trim();

  const stmt = db.prepare<[string, string, number, string]>(
    'INSERT INTO tasks (id, title, completed, created_at) VALUES (?, ?, ?, ?)'
  );
  stmt.run(id, trimmedTitle, 0, createdAt);

  return {
    id,
    title: trimmedTitle,
    completed: false,
    createdAt,
  };
}

export function updateTask(id: string, input: UpdateTaskInput): Task | null {
  if (input.title !== undefined && input.title.trim() === '') {
    throw new Error('Title cannot be empty');
  }

  const db = getDb();
  const transact = db.transaction(() => {
    const existing = getTaskById(id);
    if (!existing) return null;
    const newTitle = input.title !== undefined ? input.title.trim() : existing.title;
    const newCompleted = input.completed !== undefined ? (input.completed ? 1 : 0) : (existing.completed ? 1 : 0);
    db.prepare('UPDATE tasks SET title = ?, completed = ? WHERE id = ?').run(newTitle, newCompleted, id);
    return { id, title: newTitle, completed: newCompleted === 1, createdAt: existing.createdAt };
  });
  return transact() as Task | null;
}

export function deleteTask(id: string): boolean {
  const db = getDb();
  const stmt = db.prepare<[string]>('DELETE FROM tasks WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}
