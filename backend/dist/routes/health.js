"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const healthRoutes = async (fastify) => {
    fastify.get('/api/health', async (_request, reply) => {
        return reply.status(200).send({ status: 'ok' });
    });
};
exports.default = healthRoutes;
//# sourceMappingURL=health.js.map