import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { InlineEditInput } from '../components/InlineEditInput/InlineEditInput';

describe('InlineEditInput', () => {
  it('renders with the given value', () => {
    render(
      <InlineEditInput
        value="my task"
        onChange={() => undefined}
        onCommit={() => undefined}
        onCancel={() => undefined}
        ariaLabel="Edit task"
      />,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('my task');
  });

  it('calls onCommit when Enter is pressed', async () => {
    const onCommit = vi.fn();
    render(
      <InlineEditInput
        value="task"
        onChange={() => undefined}
        onCommit={onCommit}
        onCancel={() => undefined}
      />,
    );
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '{Enter}');
    expect(onCommit).toHaveBeenCalled();
  });

  it('calls onCancel when Escape is pressed', async () => {
    const onCancel = vi.fn();
    render(
      <InlineEditInput
        value="task"
        onChange={() => undefined}
        onCommit={() => undefined}
        onCancel={onCancel}
      />,
    );
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onChange when typing', async () => {
    const onChange = vi.fn();
    render(
      <InlineEditInput
        value=""
        onChange={onChange}
        onCommit={() => undefined}
        onCancel={() => undefined}
      />,
    );
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('calls onCommit on blur', async () => {
    const onCommit = vi.fn();
    render(
      <div>
        <InlineEditInput
          value="task"
          onChange={() => undefined}
          onCommit={onCommit}
          onCancel={() => undefined}
        />
        <button type="button">Other</button>
      </div>,
    );
    // Focus the input then tab away to reliably trigger blur
    const input = screen.getByRole('textbox');
    input.focus();
    await userEvent.tab();
    expect(onCommit).toHaveBeenCalled();
  });

  it('does not call onCommit when Escape is pressed (blur after Escape is suppressed)', async () => {
    const onCommit = vi.fn();
    const onCancel = vi.fn();
    render(
      <div>
        <InlineEditInput
          value="task"
          onChange={() => undefined}
          onCommit={onCommit}
          onCancel={onCancel}
        />
        <button type="button">Other</button>
      </div>,
    );
    const input = screen.getByRole('textbox');
    input.focus();
    await userEvent.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('forwards ref correctly', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <InlineEditInput
        ref={ref}
        value="task"
        onChange={() => undefined}
        onCommit={() => undefined}
        onCancel={() => undefined}
      />,
    );
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
