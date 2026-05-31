import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { z, ZodError } from 'zod';
import { createTaskSchema, updateTaskSchema } from '../schemas/taskSchemas.js';
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../services/taskService.js';

const idParamSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
});

function sendValidationError(reply: FastifyReply, error: ZodError): FastifyReply {
  const message = error.errors.map((e) => e.message).join('; ');
  return reply.status(400).send({ error: message, statusCode: 400 });
}

const taskRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/tasks — list all tasks
  fastify.get('/api/tasks', async (_request: FastifyRequest, reply: FastifyReply) => {
    const tasks = getAllTasks();
    return reply.status(200).send(tasks);
  });

  // POST /api/tasks — create a task
  fastify.post('/api/tasks', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = createTaskSchema.safeParse(request.body);
    if (!parseResult.success) {
      return sendValidationError(reply, parseResult.error);
    }

    const task = createTask(parseResult.data);
    return reply.status(201).send(task);
  });

  // PUT /api/tasks/:id — update a task
  fastify.put(
    '/api/tasks/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const paramResult = idParamSchema.safeParse(request.params);
      if (!paramResult.success) {
        return sendValidationError(reply, paramResult.error);
      }
      const { id } = paramResult.data;

      const parseResult = updateTaskSchema.safeParse(request.body);
      if (!parseResult.success) {
        return sendValidationError(reply, parseResult.error);
      }

      const task = updateTask(id, parseResult.data);
      if (!task) {
        return reply.status(404).send({ error: 'Task not found', statusCode: 404 });
      }

      return reply.status(200).send(task);
    }
  );

  // DELETE /api/tasks/:id — delete a task
  fastify.delete(
    '/api/tasks/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const paramResult = idParamSchema.safeParse(request.params);
      if (!paramResult.success) {
        return sendValidationError(reply, paramResult.error);
      }
      const { id } = paramResult.data;

      const deleted = deleteTask(id);
      if (!deleted) {
        return reply.status(404).send({ error: 'Task not found', statusCode: 404 });
      }

      return reply.status(204).send();
    }
  );
};

export default taskRoutes;
