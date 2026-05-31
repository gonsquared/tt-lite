import type { Task } from '../types/task.js';
import type { CreateTaskInput, UpdateTaskInput } from '../schemas/taskSchemas.js';
export declare function getAllTasks(): Task[];
export declare function getTaskById(id: string): Task | null;
export declare function createTask(input: CreateTaskInput): Task;
export declare function updateTask(id: string, input: UpdateTaskInput): Task | null;
export declare function deleteTask(id: string): boolean;
//# sourceMappingURL=taskService.d.ts.map