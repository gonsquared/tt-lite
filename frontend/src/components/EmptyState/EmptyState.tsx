import type { FilterType } from '../../types/task';
import styles from './EmptyState.module.css';

type EmptyStateProps = {
  filter: FilterType;
};

function getEmptyMessage(filter: FilterType): string {
  switch (filter) {
    case 'active':
      return 'No active tasks. All caught up.';
    case 'completed':
      return 'No completed tasks yet.';
    default:
      return 'No tasks yet. Add your first task above.';
  }
}

export function EmptyState({ filter }: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <p className={styles.message}>{getEmptyMessage(filter)}</p>
    </div>
  );
}
