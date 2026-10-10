import { buildApp } from "./app.js";
import { bootstrapAdminUser } from "./bootstrap.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { closeRedis } from "./lib/redis.js";

async function main() {
  const app = await buildApp();

  try {
    await bootstrapAdminUser();
  } catch (error) {
    app.log.warn({ err: error }, "Bootstrap admin skipped or failed");
  }

  await app.listen({ host: env.HOST, port: env.PORT });
  app.log.info(`Profiletter API listening on ${env.HOST}:${env.PORT}`);

  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down`);
    await app.close();
    await prisma.$disconnect();
    await closeRedis();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
