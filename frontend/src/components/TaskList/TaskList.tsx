import { useMemo } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { TaskItem } from '../TaskItem/TaskItem';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { EmptyState } from '../EmptyState/EmptyState';
import styles from './TaskList.module.css';

export function TaskList() {
  const { state, retryFetch } = useTaskContext();
  const { tasks, filter, isLoading, error } = state;

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'active':
        return tasks.filter((t) => !t.completed);
      case 'completed':
        return tasks.filter((t) => t.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={retryFetch} />;
  }

  if (filteredTasks.length === 0) {
    return <EmptyState filter={filter} />;
  }

  return (
    <ul role="list" className={styles.list} aria-label="Tasks">
      {filteredTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}
