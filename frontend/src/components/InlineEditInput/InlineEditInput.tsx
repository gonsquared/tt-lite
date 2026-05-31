import { forwardRef, type KeyboardEvent, type ChangeEvent } from 'react';
import styles from './InlineEditInput.module.css';

type InlineEditInputProps = {
  value: string;
  onChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  ariaLabel?: string;
  ariaDescribedBy?: string;
};

export const InlineEditInput = forwardRef<HTMLInputElement, InlineEditInputProps>(
  function InlineEditInput(
    { value, onChange, onCommit, onCancel, ariaLabel, ariaDescribedBy },
    ref,
  ) {
    function handleChange(e: ChangeEvent<HTMLInputElement>) {
      onChange(e.target.value);
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onCommit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    }

    return (
      <input
        ref={ref}
        type="text"
        className={styles.input}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onCommit}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        autoComplete="off"
      />
    );
  },
);
