import type { FastifyReply, FastifyRequest } from "fastify";
import { jwtVerify } from "jose";
import { UnauthorizedError } from "../lib/errors.js";
import { verifyAccessToken, type AccessTokenPayload } from "./tokens.js";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";

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

async function resolveSupabaseUser(token: string): Promise<AccessTokenPayload | null> {
  if (!env.SUPABASE_JWT_SECRET) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(env.SUPABASE_JWT_SECRET),
    );

    const email =
      typeof payload.email === "string"
        ? payload.email.toLowerCase()
        : typeof payload.user_metadata === "object" &&
            payload.user_metadata &&
            "email" in payload.user_metadata &&
            typeof (payload.user_metadata as { email?: unknown }).email === "string"
          ? String((payload.user_metadata as { email: string }).email).toLowerCase()
          : null;

    if (!payload.sub || !email) return null;

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        id: payload.sub,
        email,
        name: email.split("@")[0] ?? "User",
        passwordHash: "supabase-sso",
        role: "MEMBER",
      },
      update: {
        isActive: true,
      },
      select: { id: true, email: true, role: true },
    });

    return {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const token = extractBearer(request.headers.authorization);
  if (!token) {
    throw new UnauthorizedError("Missing bearer token");
  }

  let payload: AccessTokenPayload | null = null;

  try {
    payload = await verifyAccessToken(token);
  } catch {
    payload = await resolveSupabaseUser(token);
  }

  if (!payload) {
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
