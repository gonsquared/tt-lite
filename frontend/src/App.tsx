import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { AppLayout } from './components/AppLayout/AppLayout';

export default function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <AppLayout />
      </TaskProvider>
    </ThemeProvider>
  );
}
