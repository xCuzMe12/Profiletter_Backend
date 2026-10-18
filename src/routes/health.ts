import type { FastifyPluginAsync } from "fastify";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { pingRedis } from "../lib/redis.js";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => ({
    ok: true,
    service: "profiletter-backend",
    env: env.NODE_ENV,
  }));

  app.get("/ready", async (_request, reply) => {
    let dbOk = false;
    let backupDbConfigured = Boolean(env.BACKUP_DATABASE_URL);
    let redisOk = false;

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {
      dbOk = false;
    }

    redisOk = await pingRedis();

    const ready = dbOk;
    reply.code(ready ? 200 : 503);
    return {
      ok: ready,
      checks: {
        database: dbOk,
        backupDatabaseConfigured: backupDbConfigured,
        redis: redisOk,
        anthropicConfigured: Boolean(env.ANTHROPIC_API_KEY),
        supabaseConfigured: Boolean(
          env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY,
        ),
        mcpEnabled: env.MCP_ENABLED,
        crmWriteEnabled: env.CRM_WRITE_ENABLED,
      },
    };
  });
};
