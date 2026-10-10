import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { env } from "./config/env.js";
import { AppError } from "./lib/errors.js";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./routes/auth.js";
import { conversationRoutes } from "./routes/conversations.js";
import { chatRoutes } from "./routes/chat.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
    trustProxy: true,
  });

  await app.register(helmet, {
    global: true,
    contentSecurityPolicy: false,
  });

  const origins = env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean);
  await app.register(cors, {
    origin: origins.length === 1 ? origins[0] : origins,
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 120,
    timeWindow: "1 minute",
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    request.log.error(error);
    const statusCode =
      typeof error === "object" &&
      error &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
        ? error.statusCode
        : 500;

    return reply.code(statusCode).send({
      error: {
        code: "INTERNAL_ERROR",
        message:
          env.NODE_ENV === "production"
            ? "Internal server error"
            : error instanceof Error
              ? error.message
              : "Internal server error",
      },
    });
  });

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(conversationRoutes);
  await app.register(chatRoutes);

  app.get("/", async () => ({
    service: "Profiletter Chat API",
    docs: {
      health: "/health",
      ready: "/ready",
      login: "POST /auth/login",
      me: "GET /auth/me",
      conversations: "/conversations",
      chat: "POST /chat (SSE)",
    },
  }));

  return app;
}
