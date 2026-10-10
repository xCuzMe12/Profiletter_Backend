import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signAccessToken } from "../auth/tokens.js";
import { requireAuth } from "../auth/middleware.js";
import { UnauthorizedError, ValidationError } from "../lib/errors.js";
import { writeAuditLog } from "../services/audit.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid email or password payload");
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const token = await signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await writeAuditLog({
      userId: user.id,
      action: "LOGIN",
      ip: request.ip,
    });

    return reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  });

  app.get("/auth/me", { preHandler: requireAuth }, async (request) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: request.auth!.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return { user };
  });
};
