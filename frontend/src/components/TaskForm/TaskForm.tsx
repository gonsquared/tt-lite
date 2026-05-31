import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import styles from './TaskForm.module.css';

export function TaskForm() {
  const { addTask } = useTaskContext();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = 'task-form-error';

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    if (error) setError(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError('Task title cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await addTask(trimmed);
      setInputValue('');
      inputRef.current?.focus();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add task';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.inputRow}>
        <label htmlFor="new-task-input" className="sr-only">
          New task title
        </label>
        <input
          ref={inputRef}
          id="new-task-input"
          type="text"
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          value={inputValue}
          onChange={handleChange}
          placeholder="What needs to be done?"
          disabled={isSubmitting}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? 'true' : undefined}
          autoComplete="off"
          maxLength={500}
          data-testid="task-input"
        />
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
          aria-label="Add task"
          data-testid="add-task-btn"
        >
          {isSubmitting ? 'Adding...' : 'Add Task'}
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className={styles.errorText}>
          {error}
        </p>
      )}
    </form>
  );
}
