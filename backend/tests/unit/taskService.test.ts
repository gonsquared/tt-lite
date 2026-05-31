import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { closeDb } from '../../src/db/database.js';
import {
  getAllTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
} from '../../src/services/taskService.js';

// Use in-memory SQLite for unit tests
process.env.DATABASE_PATH = ':memory:';

describe('taskService', () => {
  beforeEach(() => {
    // Close any existing DB so the next getDb() call starts fresh with :memory:
    closeDb();
  });

  afterEach(() => {
    closeDb();
  });

  describe('createTask', () => {
    it('creates a task with a UUID id', () => {
      const task = createTask({ title: 'My Task' });
      expect(task.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('trims whitespace from title', () => {
      const task = createTask({ title: '  Trimmed Title  ' });
      expect(task.title).toBe('Trimmed Title');
    });

    it('sets completed to false by default', () => {
      const task = createTask({ title: 'Default completed' });
      expect(task.completed).toBe(false);
    });

    it('sets createdAt as a valid ISO 8601 string', () => {
      const task = createTask({ title: 'ISO date test' });
      expect(() => new Date(task.createdAt).toISOString()).not.toThrow();
      expect(task.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('returns a task with all required fields', () => {
      const task = createTask({ title: 'Full task' });
      expect(task).toMatchObject({
        id: expect.any(String),
        title: 'Full task',
        completed: false,
        createdAt: expect.any(String),
      });
    });
  });

  describe('getAllTasks', () => {
    it('returns empty array when no tasks exist', () => {
      const tasks = getAllTasks();
      expect(tasks).toEqual([]);
    });

    it('returns all created tasks', () => {
      createTask({ title: 'Task A' });
      createTask({ title: 'Task B' });
      const tasks = getAllTasks();
      expect(tasks).toHaveLength(2);
    });

    it('returns tasks with boolean completed (not 0/1 integer)', () => {
      createTask({ title: 'Bool check' });
      const tasks = getAllTasks();
      expect(typeof tasks[0].completed).toBe('boolean');
    });
  });

  describe('getTaskById', () => {
    it('returns null for a non-existent ID', () => {
      const result = getTaskById('non-existent-id');
      expect(result).toBeNull();
    });

    it('returns the task for a valid ID', () => {
      const created = createTask({ title: 'Find me' });
      const found = getTaskById(created.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe('Find me');
    });
  });

  describe('updateTask', () => {
    it('returns null for a non-existent ID', () => {
      const result = updateTask('missing-id', { title: 'New title' });
      expect(result).toBeNull();
    });

    it('updates the title of an existing task', () => {
      const created = createTask({ title: 'Old title' });
      const updated = updateTask(created.id, { title: 'New title' });
      expect(updated?.title).toBe('New title');
    });

    it('updates completed status and converts to boolean', () => {
      const created = createTask({ title: 'Complete me' });
      const updated = updateTask(created.id, { completed: true });
      expect(updated?.completed).toBe(true);
      expect(typeof updated?.completed).toBe('boolean');
    });

    it('updates both title and completed at once', () => {
      const created = createTask({ title: 'Both fields' });
      const updated = updateTask(created.id, { title: 'Updated', completed: true });
      expect(updated?.title).toBe('Updated');
      expect(updated?.completed).toBe(true);
    });

    it('preserves createdAt when updating', () => {
      const created = createTask({ title: 'Preserve date' });
      const updated = updateTask(created.id, { completed: true });
      expect(updated?.createdAt).toBe(created.createdAt);
    });

    it('trims whitespace from updated title', () => {
      const created = createTask({ title: 'Original' });
      const updated = updateTask(created.id, { title: '  Trimmed  ' });
      expect(updated?.title).toBe('Trimmed');
    });
  });

  describe('deleteTask', () => {
    it('returns false for a non-existent ID', () => {
      const result = deleteTask('missing-id');
      expect(result).toBe(false);
    });

    it('returns true and removes the task for a valid ID', () => {
      const created = createTask({ title: 'Delete me' });
      const result = deleteTask(created.id);
      expect(result).toBe(true);

      const found = getTaskById(created.id);
      expect(found).toBeNull();
    });

    it('does not affect other tasks when deleting one', () => {
      const task1 = createTask({ title: 'Keep me' });
      const task2 = createTask({ title: 'Delete me' });
      deleteTask(task2.id);

      const all = getAllTasks();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(task1.id);
    });
  });
});
