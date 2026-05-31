import styles from './AppFooter.module.css';

type AppFooterProps = {
  activeCount: number;
};

export function AppFooter({ activeCount }: AppFooterProps) {
  const taskWord = activeCount === 1 ? 'task' : 'tasks';

  return (
    <footer className={styles.footer}>
      <span aria-live="polite" aria-atomic="true" className={styles.count}>
        {activeCount} {taskWord} left
      </span>
    </footer>
  );
}
