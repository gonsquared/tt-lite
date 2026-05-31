import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/index.js';
import { closeDb } from '../../src/db/database.js';

// Use in-memory SQLite for integration tests
process.env.DATABASE_PATH = ':memory:';

let app: FastifyInstance;
let request: ReturnType<typeof supertest>;

beforeEach(async () => {
  closeDb();
  app = await buildApp();
  await app.ready();
  request = supertest(app.server);
});

afterEach(async () => {
  await app.close();
  closeDb();
});

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request.get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('GET /api/tasks', () => {
  it('returns 200 with empty array when no tasks exist', async () => {
    const res = await request.get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 200 with all tasks', async () => {
    await request.post('/api/tasks').send({ title: 'Task 1' });
    await request.post('/api/tasks').send({ title: 'Task 2' });

    const res = await request.get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('returns tasks with correct shape', async () => {
    await request.post('/api/tasks').send({ title: 'Shape test' });

    const res = await request.get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({
      id: expect.any(String),
      title: 'Shape test',
      completed: false,
      createdAt: expect.any(String),
    });
  });

  it('returns boolean completed (not 0/1)', async () => {
    await request.post('/api/tasks').send({ title: 'Bool test' });
    const res = await request.get('/api/tasks');
    expect(typeof res.body[0].completed).toBe('boolean');
  });
});

describe('POST /api/tasks', () => {
  it('creates a task and returns 201 with task object', async () => {
    const res = await request.post('/api/tasks').send({ title: 'New Task' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      title: 'New Task',
      completed: false,
      createdAt: expect.any(String),
    });
  });

  it('trims whitespace from title', async () => {
    const res = await request.post('/api/tasks').send({ title: '  Spaced  ' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Spaced');
  });

  it('returns 400 when title is missing', async () => {
    const res = await request.post('/api/tasks').send({});
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      error: expect.any(String),
      statusCode: 400,
    });
  });

  it('returns 400 when title is empty string', async () => {
    const res = await request.post('/api/tasks').send({ title: '' });
    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('returns 400 when title exceeds 500 characters', async () => {
    const res = await request.post('/api/tasks').send({ title: 'a'.repeat(501) });
    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('returns 400 when body is not JSON', async () => {
    const res = await request
      .post('/api/tasks')
      .set('Content-Type', 'application/json')
      .send('not-json');
    expect(res.status).toBe(400);
  });

  it('accepts exactly 500 character title', async () => {
    const res = await request.post('/api/tasks').send({ title: 'a'.repeat(500) });
    expect(res.status).toBe(201);
    expect(res.body.title).toHaveLength(500);
  });

  it('returns 400 when title is whitespace only', async () => {
    const res = await request.post('/api/tasks').send({ title: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });
});

describe('PUT /api/tasks/:id', () => {
  it('updates the task title and returns 200', async () => {
    const createRes = await request.post('/api/tasks').send({ title: 'Original' });
    const id = createRes.body.id;

    const res = await request.put(`/api/tasks/${id}`).send({ title: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id,
      title: 'Updated',
      completed: false,
    });
  });

  it('updates completed status and returns 200', async () => {
    const createRes = await request.post('/api/tasks').send({ title: 'Complete me' });
    const id = createRes.body.id;

    const res = await request.put(`/api/tasks/${id}`).send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('updates both title and completed', async () => {
    const createRes = await request.post('/api/tasks').send({ title: 'Both' });
    const id = createRes.body.id;

    const res = await request
      .put(`/api/tasks/${id}`)
      .send({ title: 'Updated Both', completed: true });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Both');
    expect(res.body.completed).toBe(true);
  });

  it('returns 404 for unknown task ID', async () => {
    const res = await request
      .put('/api/tasks/00000000-0000-0000-0000-000000000000')
      .send({ title: 'Ghost' });
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      error: 'Task not found',
      statusCode: 404,
    });
  });

  it('returns 400 when body has no fields', async () => {
    const createRes = await request.post('/api/tasks').send({ title: 'Existing' });
    const id = createRes.body.id;

    const res = await request.put(`/api/tasks/${id}`).send({});
    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('returns 400 when title is empty string', async () => {
    const createRes = await request.post('/api/tasks').send({ title: 'Existing' });
    const id = createRes.body.id;

    const res = await request.put(`/api/tasks/${id}`).send({ title: '' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when title exceeds 500 characters', async () => {
    const createRes = await request.post('/api/tasks').send({ title: 'Existing' });
    const id = createRes.body.id;

    const res = await request
      .put(`/api/tasks/${id}`)
      .send({ title: 'x'.repeat(501) });
    expect(res.status).toBe(400);
  });

  it('returns 400 when id path param is not a UUID', async () => {
    const res = await request.put('/api/tasks/not-a-uuid').send({ title: 'Ghost' });
    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('deletes an existing task and returns 204', async () => {
    const createRes = await request.post('/api/tasks').send({ title: 'Delete me' });
    const id = createRes.body.id;

    const res = await request.delete(`/api/tasks/${id}`);
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  it('task is no longer returned after deletion', async () => {
    const createRes = await request.post('/api/tasks').send({ title: 'Gone' });
    const id = createRes.body.id;

    await request.delete(`/api/tasks/${id}`);

    const listRes = await request.get('/api/tasks');
    const ids = listRes.body.map((t: { id: string }) => t.id);
    expect(ids).not.toContain(id);
  });

  it('returns 404 for unknown task ID', async () => {
    const res = await request.delete('/api/tasks/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      error: 'Task not found',
      statusCode: 404,
    });
  });

  it('does not affect other tasks', async () => {
    await request.post('/api/tasks').send({ title: 'Keep me' });
    const delRes = await request.post('/api/tasks').send({ title: 'Delete me' });

    await request.delete(`/api/tasks/${delRes.body.id}`);

    const listRes = await request.get('/api/tasks');
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].title).toBe('Keep me');
  });

  it('returns 400 when id path param is not a UUID', async () => {
    const res = await request.delete('/api/tasks/not-a-uuid');
    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('returns 404 when deleting the same task a second time', async () => {
    const createRes = await request.post('/api/tasks').send({ title: 'Delete twice' });
    const id = createRes.body.id;

    await request.delete(`/api/tasks/${id}`);
    const res = await request.delete(`/api/tasks/${id}`);
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'Task not found', statusCode: 404 });
  });
});
