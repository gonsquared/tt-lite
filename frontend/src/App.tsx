import { TaskProvider } from './context/TaskContext';
import { AppLayout } from './components/AppLayout/AppLayout';

export default function App() {
  return (
    <TaskProvider>
      <AppLayout />
    </TaskProvider>
  );
}
