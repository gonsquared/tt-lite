import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskList } from '../components/TaskList/TaskList';
import { useTaskContext } from '../context/TaskContext';
import type { Task, FilterType } from '../types/task';

vi.mock('../context/TaskContext');

// TaskItem renders real UI but toggleTask/updateTask/deleteTask are never invoked
// in these tests, so we only need stub functions on the context.
const mockRetryFetch = vi.fn();

function buildContextValue(
  tasks: Task[],
  filter: FilterType = 'all',
  isLoading = false,
  error: string | null = null,
) {
  vi.mocked(useTaskContext).mockReturnValue({
    state: { tasks, filter, isLoading, error },
    setFilter: vi.fn(),
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    toggleTask: vi.fn(),
    retryFetch: mockRetryFetch,
  });
}

const sampleTasks: Task[] = [
  { id: '1', title: 'Active task', completed: false, createdAt: '2024-01-01T00:00:00Z' },
  { id: '2', title: 'Done task', completed: true, createdAt: '2024-01-02T00:00:00Z' },
];

beforeEach(() => {
  vi.resetAllMocks();
});

describe('TaskList', () => {
  it('shows LoadingSpinner when isLoading is true', () => {
    buildContextValue([], 'all', true, null);
    render(<TaskList />);
    // LoadingSpinner renders with role="status"
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows ErrorMessage when error is set', () => {
    buildContextValue([], 'all', false, 'Network failure');
    render(<TaskList />);
    expect(screen.getByRole('alert')).toHaveTextContent('Network failure');
  });

  it('shows EmptyState with correct message for filter "all"', () => {
    buildContextValue([], 'all');
    render(<TaskList />);
    expect(screen.getByText('No tasks yet. Add your first task above.')).toBeInTheDocument();
  });

  it('shows EmptyState with correct message for filter "active"', () => {
    // all tasks completed so active list is empty
    buildContextValue(
      [{ id: '1', title: 'Done', completed: true, createdAt: '2024-01-01T00:00:00Z' }],
      'active',
    );
    render(<TaskList />);
    expect(screen.getByText('No active tasks. All caught up.')).toBeInTheDocument();
  });

  it('shows EmptyState with correct message for filter "completed"', () => {
    // all tasks active so completed list is empty
    buildContextValue(
      [{ id: '1', title: 'Active', completed: false, createdAt: '2024-01-01T00:00:00Z' }],
      'completed',
    );
    render(<TaskList />);
    expect(screen.getByText('No completed tasks yet.')).toBeInTheDocument();
  });

  it('renders a list of TaskItems when tasks exist', () => {
    buildContextValue(sampleTasks, 'all');
    render(<TaskList />);
    expect(screen.getByText('Active task')).toBeInTheDocument();
    expect(screen.getByText('Done task')).toBeInTheDocument();
  });

  it('renders only active tasks when filter is "active"', () => {
    buildContextValue(sampleTasks, 'active');
    render(<TaskList />);
    expect(screen.getByText('Active task')).toBeInTheDocument();
    expect(screen.queryByText('Done task')).not.toBeInTheDocument();
  });

  it('renders only completed tasks when filter is "completed"', () => {
    buildContextValue(sampleTasks, 'completed');
    render(<TaskList />);
    expect(screen.queryByText('Active task')).not.toBeInTheDocument();
    expect(screen.getByText('Done task')).toBeInTheDocument();
  });
});
