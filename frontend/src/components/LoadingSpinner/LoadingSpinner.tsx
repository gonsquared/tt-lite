import styles from './LoadingSpinner.module.css';

export function LoadingSpinner() {
  return (
    <div role="status" aria-label="Loading tasks..." className={styles.container}>
      <div className={styles.spinner} aria-hidden="true" />
      <span className={styles.text}>Loading tasks...</span>
    </div>
  );
}
