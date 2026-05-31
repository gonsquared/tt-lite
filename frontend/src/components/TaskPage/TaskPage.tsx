import { TaskForm } from '../TaskForm/TaskForm';
import { FilterBar } from '../FilterBar/FilterBar';
import { TaskList } from '../TaskList/TaskList';
import styles from './TaskPage.module.css';

export function TaskPage() {
  return (
    <main className={styles.main}>
      <TaskForm />
      <FilterBar />
      <TaskList />
    </main>
  );
}
