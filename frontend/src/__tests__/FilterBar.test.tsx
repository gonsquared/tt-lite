import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from '../components/FilterBar/FilterBar';
import { useTaskContext } from '../context/TaskContext';

vi.mock('../context/TaskContext');

const mockDispatch = vi.fn();

describe('FilterBar', () => {
  beforeEach(() => {
    vi.mocked(useTaskContext).mockReturnValue({
      state: {
        tasks: [],
        filter: 'all',
        isLoading: false,
        error: null,
      },
      dispatch: mockDispatch,
      addTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      toggleTask: vi.fn(),
      retryFetch: vi.fn(),
    });
  });

  it('renders All, Active, Completed buttons', () => {
    render(<FilterBar />);
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Active' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Completed' })).toBeInTheDocument();
  });

  it('has role="group" with aria-label on the container', () => {
    render(<FilterBar />);
    expect(screen.getByRole('group', { name: 'Filter tasks' })).toBeInTheDocument();
  });

  it('All button is aria-pressed=true when filter is "all"', () => {
    render(<FilterBar />);
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Active' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('dispatches SET_FILTER on button click', async () => {
    render(<FilterBar />);
    await userEvent.click(screen.getByRole('button', { name: 'Active' }));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_FILTER', payload: 'active' });
  });
});
