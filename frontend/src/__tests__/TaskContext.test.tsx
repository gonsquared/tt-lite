import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskProvider, useTaskContext } from '../context/TaskContext';
import * as taskApi from '../services/taskApi';
import type { Task } from '../types/task';

vi.mock('../services/taskApi');

const mockTaskApi = taskApi as {
  fetchTasks: ReturnType<typeof vi.fn>;
  createTask: ReturnType<typeof vi.fn>;
  updateTask: ReturnType<typeof vi.fn>;
  deleteTask: ReturnType<typeof vi.fn>;
};

const sampleTask: Task = {
  id: '1',
  title: 'Sample task',
  completed: false,
  createdAt: '2024-01-01T00:00:00Z',
};

function TestConsumer() {
  const { state, addTask, deleteTask, toggleTask } = useTaskContext();
  return (
    <div>
      <span data-testid="loading">{String(state.isLoading)}</span>
      <span data-testid="error">{state.error ?? 'none'}</span>
      <span data-testid="count">{state.tasks.length}</span>
      {state.tasks.map((t) => (
        <div key={t.id} data-testid={`task-${t.id}`}>
          <span data-testid={`title-${t.id}`}>{t.title}</span>
          <span data-testid={`completed-${t.id}`}>{String(t.completed)}</span>
          <button onClick={() => void toggleTask(t.id)}>toggle</button>
          <button onClick={() => void deleteTask(t.id)}>delete</button>
        </div>
      ))}
      <button onClick={() => void addTask('New task')}>add</button>
    </div>
  );
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('TaskProvider', () => {
  it('loads tasks on mount', async () => {
    mockTaskApi.fetchTasks.mockResolvedValue([sampleTask]);
    render(
      <TaskProvider>
        <TestConsumer />
      </TaskProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('1');
    });
    expect(screen.getByTestId('title-1').textContent).toBe('Sample task');
  });

  it('sets error state when fetchTasks fails', async () => {
    mockTaskApi.fetchTasks.mockRejectedValue(new Error('Network error'));
    render(
      <TaskProvider>
        <TestConsumer />
      </TaskProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('Network error');
    });
  });

  it('adds a task via addTask', async () => {
    const newTask: Task = { id: '2', title: 'New task', completed: false, createdAt: '2024-01-01T00:00:00Z' };
    mockTaskApi.fetchTasks.mockResolvedValue([]);
    mockTaskApi.createTask.mockResolvedValue(newTask);

    render(
      <TaskProvider>
        <TestConsumer />
      </TaskProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    await userEvent.click(screen.getByText('add'));
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));
    expect(screen.getByTestId('title-2').textContent).toBe('New task');
  });

  it('deletes a task via deleteTask', async () => {
    mockTaskApi.fetchTasks.mockResolvedValue([sampleTask]);
    mockTaskApi.deleteTask.mockResolvedValue(undefined);

    render(
      <TaskProvider>
        <TestConsumer />
      </TaskProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));
    await userEvent.click(screen.getByText('delete'));
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('0'));
  });

  it('toggles a task via toggleTask', async () => {
    mockTaskApi.fetchTasks.mockResolvedValue([sampleTask]);
    mockTaskApi.updateTask.mockResolvedValue({ ...sampleTask, completed: true });

    render(
      <TaskProvider>
        <TestConsumer />
      </TaskProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('completed-1').textContent).toBe('false'));
    await userEvent.click(screen.getByText('toggle'));
    await waitFor(() => expect(screen.getByTestId('completed-1').textContent).toBe('true'));
  });
});
