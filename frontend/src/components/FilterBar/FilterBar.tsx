import { useTaskContext } from '../../context/TaskContext';
import type { FilterType } from '../../types/task';
import styles from './FilterBar.module.css';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

export function FilterBar() {
  const { state, setFilter } = useTaskContext();

  function handleFilterClick(filter: FilterType) {
    setFilter(filter);
  }

  return (
    <div role="group" aria-label="Filter tasks" className={styles.group}>
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className={`${styles.button} ${state.filter === value ? styles.active : ''}`}
          aria-pressed={state.filter === value}
          onClick={() => handleFilterClick(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
