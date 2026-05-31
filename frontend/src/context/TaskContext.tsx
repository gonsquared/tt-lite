import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Task, FilterType } from '../types/task';
import * as taskApi from '../services/taskApi';

// ── State & Actions ────────────────────────────────────────────────────────

type State = {
  tasks: Task[];
  filter: FilterType;
  isLoading: boolean;
  error: string | null;
};

type Action =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'SET_FILTER'; payload: FilterType };

const initialState: State = {
  tasks: [],
  filter: 'all',
  isLoading: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, isLoading: false, error: null };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? action.payload : t,
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
      };

    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload ? { ...t, completed: !t.completed } : t,
        ),
      };

    case 'SET_FILTER':
      return { ...state, filter: action.payload };

    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────

type TaskContextValue = {
  state: State;
  dispatch: React.Dispatch<Action>;
  addTask: (title: string) => Promise<void>;
  updateTask: (id: string, patch: { title?: string; completed?: boolean }) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  retryFetch: () => Promise<void>;
};

const TaskContext = createContext<TaskContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadTasks = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const tasks = await taskApi.fetchTasks();
      dispatch({ type: 'SET_TASKS', payload: tasks });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tasks';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const addTask = useCallback(async (title: string) => {
    const task = await taskApi.createTask(title);
    dispatch({ type: 'ADD_TASK', payload: task });
  }, []);

  const updateTask = useCallback(
    async (id: string, patch: { title?: string; completed?: boolean }) => {
      const task = await taskApi.updateTask(id, patch);
      dispatch({ type: 'UPDATE_TASK', payload: task });
    },
    [],
  );

  const deleteTask = useCallback(async (id: string) => {
    await taskApi.deleteTask(id);
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, []);

  const toggleTask = useCallback(
    async (id: string) => {
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return;
      const updated = await taskApi.updateTask(id, { completed: !task.completed });
      dispatch({ type: 'UPDATE_TASK', payload: updated });
    },
    [state.tasks],
  );

  const retryFetch = useCallback(async () => {
    await loadTasks();
  }, [loadTasks]);

  return (
    <TaskContext.Provider
      value={{ state, dispatch, addTask, updateTask, deleteTask, toggleTask, retryFetch }}
    >
      {children}
    </TaskContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useTaskContext(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return ctx;
}
