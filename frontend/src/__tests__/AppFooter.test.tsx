import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppFooter } from '../components/AppFooter/AppFooter';

describe('AppFooter', () => {
  it('renders singular "task" when count is 1', () => {
    render(<AppFooter activeCount={1} />);
    expect(screen.getByText('1 task left')).toBeInTheDocument();
  });

  it('renders plural "tasks" when count is 0', () => {
    render(<AppFooter activeCount={0} />);
    expect(screen.getByText('0 tasks left')).toBeInTheDocument();
  });

  it('renders plural "tasks" when count is 5', () => {
    render(<AppFooter activeCount={5} />);
    expect(screen.getByText('5 tasks left')).toBeInTheDocument();
  });

  it('has aria-live="polite" on the count span', () => {
    render(<AppFooter activeCount={3} />);
    const span = screen.getByText('3 tasks left');
    expect(span).toHaveAttribute('aria-live', 'polite');
  });
});
