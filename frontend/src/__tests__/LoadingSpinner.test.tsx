import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../components/LoadingSpinner/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('has role="status" and aria-label', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading tasks...');
  });

  it('renders visible text for screen readers', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });
});
