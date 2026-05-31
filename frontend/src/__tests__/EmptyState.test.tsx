import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../components/EmptyState/EmptyState';

describe('EmptyState', () => {
  it('renders "all" filter message', () => {
    render(<EmptyState filter="all" />);
    expect(screen.getByText('No tasks yet. Add your first task above.')).toBeInTheDocument();
  });

  it('renders "active" filter message', () => {
    render(<EmptyState filter="active" />);
    expect(screen.getByText('No active tasks. All caught up.')).toBeInTheDocument();
  });

  it('renders "completed" filter message', () => {
    render(<EmptyState filter="completed" />);
    expect(screen.getByText('No completed tasks yet.')).toBeInTheDocument();
  });
});
