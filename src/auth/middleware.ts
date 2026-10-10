import type { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedError } from "../lib/errors.js";
import { verifyAccessToken, type AccessTokenPayload } from "./tokens.js";
import { prisma } from "../lib/prisma.js";

declare module "fastify" {
  interface FastifyRequest {
    auth?: AccessTokenPayload & { userId: string };
  }
}

function extractBearer(header?: string): string | null {
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

export async function requireAuth(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const token = extractBearer(request.headers.authorization);
  if (!token) {
    throw new UnauthorizedError("Missing bearer token");
  }

  let payload: AccessTokenPayload;
  try {
    payload = await verifyAccessToken(token);
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, isActive: true, email: true, role: true },
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedError("User inactive or not found");
  }

  request.auth = {
    sub: user.id,
    userId: user.id,
    email: user.email,
    role: user.role,
  };
}
