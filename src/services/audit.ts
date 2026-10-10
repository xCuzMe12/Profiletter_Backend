import type { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

type AuditInput = {
  userId?: string | null;
  action: AuditAction;
  resource?: string;
  details?: Prisma.InputJsonValue;
  ip?: string | null;
};

export async function writeAuditLog(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        resource: input.resource,
        details: input.details,
        ip: input.ip ?? null,
      },
    });
  } catch {
    // Audit failures must not break request handling.
  }
}
