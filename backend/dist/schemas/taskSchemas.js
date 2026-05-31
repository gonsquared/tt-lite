"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z
        .string({ required_error: 'title is required' })
        .trim()
        .min(1, 'title must not be empty')
        .max(500, 'title must be at most 500 characters'),
});
exports.updateTaskSchema = zod_1.z
    .object({
    title: zod_1.z
        .string()
        .trim()
        .min(1, 'title must not be empty')
        .max(500, 'title must be at most 500 characters')
        .optional(),
    completed: zod_1.z.boolean().optional(),
})
    .refine((data) => data.title !== undefined || data.completed !== undefined, { message: 'at least one of title or completed must be provided' });
//# sourceMappingURL=taskSchemas.js.map