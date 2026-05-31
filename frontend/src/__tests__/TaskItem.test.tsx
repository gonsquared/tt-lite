import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem } from '../components/TaskItem/TaskItem';
import { useTaskContext } from '../context/TaskContext';
import * as taskApi from '../services/taskApi';
import type { Task } from '../types/task';

vi.mock('../context/TaskContext');
vi.mock('../services/taskApi');

const baseTask: Task = {
  id: 'task-1',
  title: 'Buy groceries',
  completed: false,
  createdAt: '2024-01-01T00:00:00Z',
};

const completedTask: Task = {
  ...baseTask,
  completed: true,
};

const mockToggleTask = vi.fn();
const mockUpdateTask = vi.fn();
const mockDeleteTask = vi.fn();

function setupContext(overrides: Partial<Task> = {}) {
  const task = { ...baseTask, ...overrides };
  vi.mocked(useTaskContext).mockReturnValue({
    state: { tasks: [task], filter: 'all', isLoading: false, error: null },
    setFilter: vi.fn(),
    addTask: vi.fn(),
    updateTask: mockUpdateTask,
    deleteTask: mockDeleteTask,
    toggleTask: mockToggleTask,
    retryFetch: vi.fn(),
  });
  return task;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(taskApi.updateTask).mockResolvedValue(baseTask);
  vi.mocked(taskApi.deleteTask).mockResolvedValue(undefined);
});

describe('TaskItem', () => {
  it('renders the task title', () => {
    setupContext();
    render(<TaskItem task={baseTask} />);
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
  });

  it('completed tasks have strikethrough class on the title button', () => {
    setupContext({ completed: true });
    render(<TaskItem task={completedTask} />);
    const titleBtn = screen.getByRole('button', { name: /Edit task: Buy groceries/i });
    expect(titleBtn.className).toMatch(/completed/);
  });

  it('incomplete tasks do not have strikethrough class', () => {
    setupContext();
    render(<TaskItem task={baseTask} />);
    const titleBtn = screen.getByRole('button', { name: /Edit task: Buy groceries/i });
    expect(titleBtn.className).not.toMatch(/completed/);
  });

  it('checkbox has correct accessible name via label (no duplicate aria-label)', () => {
    setupContext();
    render(<TaskItem task={baseTask} />);
    const checkbox = screen.getByRole('checkbox', {
      name: "Mark 'Buy groceries' as complete",
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toHaveAttribute('aria-label');
  });

  it('checkbox accessible name reflects completed state', () => {
    setupContext({ completed: true });
    render(<TaskItem task={completedTask} />);
    expect(
      screen.getByRole('checkbox', { name: "Mark 'Buy groceries' as active" }),
    ).toBeInTheDocument();
  });

  it('clicking the title button enters edit mode', async () => {
    setupContext();
    render(<TaskItem task={baseTask} />);
    await userEvent.click(screen.getByRole('button', { name: /Edit task: Buy groceries/i }));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('pressing Enter in edit mode calls updateTask', async () => {
    mockUpdateTask.mockResolvedValue({ ...baseTask, title: 'Buy groceries updated' });
    setupContext();
    render(<TaskItem task={baseTask} />);

    await userEvent.click(screen.getByRole('button', { name: /Edit task: Buy groceries/i }));
    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Buy groceries updated');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith('task-1', { title: 'Buy groceries updated' });
    });
  });

  it('pressing Escape cancels without calling updateTask', async () => {
    setupContext();
    render(<TaskItem task={baseTask} />);

    await userEvent.click(screen.getByRole('button', { name: /Edit task: Buy groceries/i }));
    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Changed title');
    await userEvent.keyboard('{Escape}');

    expect(mockUpdateTask).not.toHaveBeenCalled();
    // Edit mode should be exited
    await waitFor(() => {
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  it('delete button calls deleteTask', async () => {
    mockDeleteTask.mockResolvedValue(undefined);
    setupContext();
    render(<TaskItem task={baseTask} />);

    await userEvent.click(screen.getByRole('button', { name: /Delete task: Buy groceries/i }));

    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith('task-1');
    });
  });

  it('delete failure shows error message with role="alert"', async () => {
    mockDeleteTask.mockRejectedValue(new Error('Server error'));
    setupContext();
    render(<TaskItem task={baseTask} />);

    await userEvent.click(screen.getByRole('button', { name: /Delete task: Buy groceries/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Server error');
    });
  });

  it('toggle calls toggleTask with correct id and completed args', async () => {
    mockToggleTask.mockResolvedValue(undefined);
    setupContext();
    render(<TaskItem task={baseTask} />);

    await userEvent.click(
      screen.getByRole('checkbox', { name: "Mark 'Buy groceries' as complete" }),
    );

    await waitFor(() => {
      expect(mockToggleTask).toHaveBeenCalledWith('task-1', false);
    });
  });
});
