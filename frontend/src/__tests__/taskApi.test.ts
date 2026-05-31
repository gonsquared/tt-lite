import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/taskApi';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

beforeEach(() => {
  mockFetch.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchTasks', () => {
  it('returns an array of tasks on success', async () => {
    const tasks = [{ id: '1', title: 'Test', completed: false, createdAt: '2024-01-01T00:00:00Z' }];
    mockFetch.mockResolvedValue(makeResponse(tasks));

    const result = await fetchTasks();
    expect(result).toEqual(tasks);
    expect(mockFetch).toHaveBeenCalledWith('/api/tasks');
  });

  it('throws with server error message on non-2xx', async () => {
    mockFetch.mockResolvedValue(makeResponse({ error: 'Internal Server Error', statusCode: 500 }, 500));
    await expect(fetchTasks()).rejects.toThrow('Internal Server Error');
  });
});

describe('createTask', () => {
  it('posts the title and returns created task', async () => {
    const task = { id: '2', title: 'New task', completed: false, createdAt: '2024-01-01T00:00:00Z' };
    mockFetch.mockResolvedValue(makeResponse(task, 201));

    const result = await createTask('New task');
    expect(result).toEqual(task);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/tasks',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'New task' }),
      }),
    );
  });

  it('throws when server returns 400', async () => {
    mockFetch.mockResolvedValue(makeResponse({ error: 'Title is required', statusCode: 400 }, 400));
    await expect(createTask('')).rejects.toThrow('Title is required');
  });
});

describe('updateTask', () => {
  it('sends PUT request with patch and returns updated task', async () => {
    const task = { id: '1', title: 'Updated', completed: true, createdAt: '2024-01-01T00:00:00Z' };
    mockFetch.mockResolvedValue(makeResponse(task));

    const result = await updateTask('1', { title: 'Updated', completed: true });
    expect(result).toEqual(task);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/tasks/1',
      expect.objectContaining({ method: 'PUT' }),
    );
  });
});

describe('deleteTask', () => {
  it('sends DELETE request and returns void on 204', async () => {
    mockFetch.mockResolvedValue(makeResponse(undefined, 204));
    await expect(deleteTask('1')).resolves.toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith('/api/tasks/1', expect.objectContaining({ method: 'DELETE' }));
  });

  it('throws on non-2xx from delete', async () => {
    mockFetch.mockResolvedValue(makeResponse({ error: 'Not found', statusCode: 404 }, 404));
    await expect(deleteTask('999')).rejects.toThrow('Not found');
  });
});
