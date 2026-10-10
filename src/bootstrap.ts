import bcrypt from "bcryptjs";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

export async function bootstrapAdminUser(): Promise<void> {
  if (!env.BOOTSTRAP_ADMIN_EMAIL || !env.BOOTSTRAP_ADMIN_PASSWORD) {
    return;
  }

  const email = env.BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  const passwordHash = await bcrypt.hash(env.BOOTSTRAP_ADMIN_PASSWORD, 12);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: "Admin",
      role: "ADMIN",
    },
  });
}
