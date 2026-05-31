import type { Task } from '../types/task';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

type ApiErrorBody = {
  error: string;
  statusCode: number;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  let errorMessage = `Request failed with status ${response.status}`;
  try {
    const body: ApiErrorBody = await response.json();
    if (body.error) {
      errorMessage = body.error;
    }
  } catch {
    // use default message if JSON parse fails
  }

  throw new Error(errorMessage);
}

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(`${BASE_URL}/tasks`);
  return handleResponse<Task[]>(response);
}

export async function createTask(title: string): Promise<Task> {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  return handleResponse<Task>(response);
}

export async function updateTask(
  id: string,
  patch: { title?: string; completed?: boolean },
): Promise<Task> {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return handleResponse<Task>(response);
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const body: ApiErrorBody = await response.json();
      if (body.error) {
        errorMessage = body.error;
      }
    } catch {
      // use default message if JSON parse fails
    }
    throw new Error(errorMessage);
  }
}
