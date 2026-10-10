import { z } from "zod";

export const searchStrankeInputSchema = z.object({
  query: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export const getStrankaInputSchema = z.object({
  id: z.string().min(1),
});

export const searchLeadsInputSchema = z.object({
  query: z.string().min(1).max(200).optional(),
  stage: z.string().optional(),
  strankaId: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export const getLeadInputSchema = z.object({
  id: z.string().min(1),
});

export const aggregateInputSchema = z.object({
  entity: z.enum(["stranke", "leads"]),
  groupBy: z.string().optional(),
});

export type McpToolName =
  | "search_stranke"
  | "get_stranka"
  | "search_leads"
  | "get_lead"
  | "aggregate_crm";

export type McpToolResult = {
  ok: boolean;
  tool: McpToolName;
  data?: unknown;
  error?: string;
};
