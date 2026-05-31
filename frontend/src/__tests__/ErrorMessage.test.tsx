import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorMessage } from '../components/ErrorMessage/ErrorMessage';

describe('ErrorMessage', () => {
  it('renders default message when none provided', () => {
    render(<ErrorMessage onRetry={() => undefined} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<ErrorMessage message="Custom error" onRetry={() => undefined} />);
    expect(screen.getByText('Custom error')).toBeInTheDocument();
  });

  it('calls onRetry when Retry button is clicked', async () => {
    const onRetry = vi.fn();
    render(<ErrorMessage onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
