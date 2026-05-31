import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '../components/TaskForm/TaskForm';
import { useTaskContext } from '../context/TaskContext';

vi.mock('../context/TaskContext');

describe('TaskForm', () => {
  const mockAddTask = vi.fn();

  beforeEach(() => {
    mockAddTask.mockReset();
    vi.mocked(useTaskContext).mockReturnValue({
      state: { tasks: [], filter: 'all', isLoading: false, error: null },
      setFilter: vi.fn(),
      addTask: mockAddTask,
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      toggleTask: vi.fn(),
      retryFetch: vi.fn(),
    });
  });

  it('renders the input and submit button', () => {
    render(<TaskForm />);
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting empty input', async () => {
    render(<TaskForm />);
    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Task title cannot be empty.');
    expect(mockAddTask).not.toHaveBeenCalled();
  });

  it('calls addTask with trimmed title on valid submit', async () => {
    mockAddTask.mockResolvedValue(undefined);
    render(<TaskForm />);
    const input = screen.getByPlaceholderText('What needs to be done?');
    await userEvent.type(input, '  Buy groceries  ');
    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    await waitFor(() => expect(mockAddTask).toHaveBeenCalledWith('Buy groceries'));
  });

  it('clears the input after successful submission', async () => {
    mockAddTask.mockResolvedValue(undefined);
    render(<TaskForm />);
    const input = screen.getByPlaceholderText('What needs to be done?');
    await userEvent.type(input, 'New task');
    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    await waitFor(() => expect(input).toHaveValue(''));
  });

  it('shows API error message when addTask fails', async () => {
    mockAddTask.mockRejectedValue(new Error('Server error'));
    render(<TaskForm />);
    await userEvent.type(screen.getByPlaceholderText('What needs to be done?'), 'Failing task');
    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Server error'));
  });

  it('disables the submit button while submitting', async () => {
    mockAddTask.mockResolvedValue(undefined);
    render(<TaskForm />);
    await userEvent.type(screen.getByPlaceholderText('What needs to be done?'), 'Pending task');
    // Button should be enabled before submit
    expect(screen.getByRole('button', { name: /add task/i })).not.toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    // After successful submit the input clears and button re-enables
    await waitFor(() => expect(screen.getByPlaceholderText('What needs to be done?')).toHaveValue(''));
  });
});
