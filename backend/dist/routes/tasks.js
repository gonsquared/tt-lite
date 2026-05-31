"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const taskSchemas_js_1 = require("../schemas/taskSchemas.js");
const taskService_js_1 = require("../services/taskService.js");
function sendValidationError(reply, error) {
    const message = error.errors.map((e) => e.message).join('; ');
    return reply.status(400).send({ error: message, statusCode: 400 });
}
const taskRoutes = async (fastify) => {
    // GET /api/tasks — list all tasks
    fastify.get('/api/tasks', async (_request, reply) => {
        const tasks = (0, taskService_js_1.getAllTasks)();
        return reply.status(200).send(tasks);
    });
    // POST /api/tasks — create a task
    fastify.post('/api/tasks', async (request, reply) => {
        const parseResult = taskSchemas_js_1.createTaskSchema.safeParse(request.body);
        if (!parseResult.success) {
            return sendValidationError(reply, parseResult.error);
        }
        const task = (0, taskService_js_1.createTask)(parseResult.data);
        return reply.status(201).send(task);
    });
    // PUT /api/tasks/:id — update a task
    fastify.put('/api/tasks/:id', async (request, reply) => {
        const { id } = request.params;
        const parseResult = taskSchemas_js_1.updateTaskSchema.safeParse(request.body);
        if (!parseResult.success) {
            return sendValidationError(reply, parseResult.error);
        }
        const task = (0, taskService_js_1.updateTask)(id, parseResult.data);
        if (!task) {
            return reply.status(404).send({ error: 'Task not found', statusCode: 404 });
        }
        return reply.status(200).send(task);
    });
    // DELETE /api/tasks/:id — delete a task
    fastify.delete('/api/tasks/:id', async (request, reply) => {
        const { id } = request.params;
        const deleted = (0, taskService_js_1.deleteTask)(id);
        if (!deleted) {
            return reply.status(404).send({ error: 'Task not found', statusCode: 404 });
        }
        return reply.status(204).send();
    });
};
exports.default = taskRoutes;
//# sourceMappingURL=tasks.js.map