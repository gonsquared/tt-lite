export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

export type FilterType = 'all' | 'active' | 'completed';
