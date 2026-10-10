import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(8080),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  BOOTSTRAP_ADMIN_EMAIL: z.string().email().optional(),
  BOOTSTRAP_ADMIN_PASSWORD: z.string().min(8).optional(),

  DATABASE_URL: z.string().min(1),
  BACKUP_DATABASE_URL: z.string().optional(),

  REDIS_URL: z.string().default("redis://localhost:6379"),

  ANTHROPIC_API_KEY: z.string().optional(),
  CLAUDE_MODEL: z.string().default("claude-sonnet-4-20250514"),
  CLAUDE_MAX_TOKENS: z.coerce.number().int().positive().default(4096),

  TWENTY_API_URL: z.string().optional(),
  TWENTY_API_KEY: z.string().optional(),
  MCP_ENABLED: z
    .string()
    .default("true")
    .transform((v) => v === "true" || v === "1"),
  CRM_WRITE_ENABLED: z
    .string()
    .default("false")
    .transform((v) => v === "true" || v === "1"),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${details}`);
  }
  return parsed.data;
}

export const env = parseEnv();
