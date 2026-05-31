import { useTaskContext } from '../../context/TaskContext';
import { AppHeader } from '../AppHeader/AppHeader';
import { AppFooter } from '../AppFooter/AppFooter';
import { TaskPage } from '../TaskPage/TaskPage';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const { state } = useTaskContext();
  const activeCount = state.tasks.filter((t) => !t.completed).length;

  return (
    <div className={styles.layout}>
      <AppHeader />
      <div className={styles.content}>
        <TaskPage />
      </div>
      <AppFooter activeCount={activeCount} />
    </div>
  );
}
