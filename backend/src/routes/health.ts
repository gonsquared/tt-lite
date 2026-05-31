import type { FastifyPluginAsync } from 'fastify';
import { getDb } from '../db/database.js';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/health', async (_request, reply) => {
    try {
      getDb().prepare('SELECT 1').get();
      return reply.status(200).send({ status: 'ok' });
    } catch {
      return reply.status(503).send({ status: 'error', detail: 'database unavailable' });
    }
  });
};

export default healthRoutes;
