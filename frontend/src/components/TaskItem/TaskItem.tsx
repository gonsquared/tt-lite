import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ChangeEvent,
} from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { InlineEditInput } from '../InlineEditInput/InlineEditInput';
import type { Task } from '../../types/task';
import styles from './TaskItem.module.css';

type TaskItemProps = {
  task: Task;
};

export function TaskItem({ task }: TaskItemProps) {
  const { toggleTask, updateTask, deleteTask } = useTaskContext();

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const editInputRef = useRef<HTMLInputElement>(null);
  const titleButtonRef = useRef<HTMLButtonElement>(null);

  const saveErrorId = `save-error-${task.id}`;
  const deleteErrorId = `delete-error-${task.id}`;

  // Focus the edit input when editing starts
  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
    }
  }, [isEditing]);

  function enterEditMode() {
    setEditValue(task.title);
    setSaveError(null);
    setIsEditing(true);
  }

  const commitEdit = useCallback(async () => {
    const trimmed = editValue.trim();

    // Cancel if empty or unchanged
    if (!trimmed) {
      setIsEditing(false);
      setEditValue(task.title);
      return;
    }
    if (trimmed === task.title) {
      setIsEditing(false);
      return;
    }

    try {
      await updateTask(task.id, { title: trimmed });
      setIsEditing(false);
      setSaveError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save task';
      setSaveError(message);
      // Stay in edit mode on save failure
    }
  }, [editValue, task.title, task.id, updateTask]);

  function cancelEdit() {
    setIsEditing(false);
    setEditValue(task.title);
    setSaveError(null);
    // Return focus to the title button
    titleButtonRef.current?.focus();
  }

  async function handleToggle(_e: ChangeEvent<HTMLInputElement>) {
    try {
      await toggleTask(task.id);
    } catch (err) {
      // toggle failure is non-critical; could be surfaced if needed
      console.error('Toggle failed:', err);
    }
  }

  async function handleDelete() {
    setDeleteError(null);
    try {
      await deleteTask(task.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete task';
      setDeleteError(message);
    }
  }

  return (
    <li className={styles.item}>
      <div className={styles.row}>
        {/* Checkbox */}
        <label className={styles.checkboxLabel}>
          <span className="sr-only">
            {`Mark '${task.title}' as ${task.completed ? 'active' : 'complete'}`}
          </span>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={task.completed}
            onChange={handleToggle}
            aria-label={`Mark '${task.title}' as ${task.completed ? 'active' : 'complete'}`}
          />
        </label>

        {/* Title or edit input */}
        <div className={styles.titleArea}>
          {isEditing ? (
            <InlineEditInput
              ref={editInputRef}
              value={editValue}
              onChange={setEditValue}
              onCommit={() => void commitEdit()}
              onCancel={cancelEdit}
              ariaLabel={`Edit task: ${task.title}`}
              ariaDescribedBy={saveError ? saveErrorId : undefined}
            />
          ) : (
            <button
              ref={titleButtonRef}
              type="button"
              className={`${styles.titleButton} ${task.completed ? styles.completed : ''}`}
              onClick={enterEditMode}
              aria-label={`Edit task: ${task.title}`}
            >
              {task.title}
            </button>
          )}
        </div>

        {/* Delete button */}
        <button
          type="button"
          className={styles.deleteButton}
          onClick={() => void handleDelete()}
          aria-label={`Delete task: ${task.title}`}
        >
          Delete
        </button>
      </div>

      {/* Error messages */}
      {saveError && (
        <p id={saveErrorId} role="alert" className={styles.errorText}>
          {saveError}
        </p>
      )}
      {deleteError && (
        <p id={deleteErrorId} role="alert" className={styles.errorText}>
          {deleteError}
        </p>
      )}
    </li>
  );
}
