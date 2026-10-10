import { env } from "../config/env.js";
import {
  aggregateInputSchema,
  getLeadInputSchema,
  getStrankaInputSchema,
  searchLeadsInputSchema,
  searchStrankeInputSchema,
  type McpToolName,
  type McpToolResult,
} from "./types.js";

/**
 * MCP gateway stub for Twenty CRM.
 * Read-only tools first. Wire TWENTY_API_URL / TWENTY_API_KEY for live data.
 */
export const MCP_TOOL_DEFINITIONS = [
  {
    name: "search_stranke" as const,
    description:
      "Search Stranke (customers/prospects). Use for finding people by name, email, or free text.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
        email: { type: "string" },
        limit: { type: "number" },
      },
    },
  },
  {
    name: "get_stranka" as const,
    description: "Get a single Stranka by id.",
    input_schema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "search_leads" as const,
    description:
      "Search Leads (prospective professional-service engagements).",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
        stage: { type: "string" },
        strankaId: { type: "string" },
        limit: { type: "number" },
      },
    },
  },
  {
    name: "get_lead" as const,
    description: "Get a single Lead by id.",
    input_schema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "aggregate_crm" as const,
    description: "Aggregate counts/summaries for Stranke or Leads.",
    input_schema: {
      type: "object",
      properties: {
        entity: { type: "string", enum: ["stranke", "leads"] },
        groupBy: { type: "string" },
      },
      required: ["entity"],
    },
  },
];

const DEMO_STRANKE = [
  {
    id: "stranka_demo_1",
    name: "Ana Novak",
    email: "ana.novak@example.com",
    company: "Novak Consulting",
    status: "active",
  },
  {
    id: "stranka_demo_2",
    name: "Marko Horvat",
    email: "marko@horvat.io",
    company: "Horvat d.o.o.",
    status: "prospect",
  },
];

const DEMO_LEADS = [
  {
    id: "lead_demo_1",
    title: "Website redesign engagement",
    stage: "qualified",
    strankaId: "stranka_demo_1",
    value: 12000,
    currency: "EUR",
  },
  {
    id: "lead_demo_2",
    title: "CRM migration advisory",
    stage: "discovery",
    strankaId: "stranka_demo_2",
    value: 8500,
    currency: "EUR",
  },
];

async function twentyFetch(path: string): Promise<unknown | null> {
  if (!env.TWENTY_API_URL || !env.TWENTY_API_KEY) return null;
  const url = `${env.TWENTY_API_URL.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.TWENTY_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Twenty CRM error ${res.status}`);
  }
  return res.json();
}

export async function executeMcpTool(
  name: McpToolName,
  rawInput: unknown,
): Promise<McpToolResult> {
  if (!env.MCP_ENABLED) {
    return { ok: false, tool: name, error: "MCP gateway disabled" };
  }

  try {
    switch (name) {
      case "search_stranke": {
        const input = searchStrankeInputSchema.parse(rawInput ?? {});
        const live = await twentyFetch(
          `/rest/people?limit=${input.limit}${input.query ? `&filter=${encodeURIComponent(input.query)}` : ""}`,
        );
        if (live) return { ok: true, tool: name, data: live };

        const q = (input.query ?? input.email ?? "").toLowerCase();
        const data = DEMO_STRANKE.filter((s) => {
          if (!q) return true;
          return (
            s.name.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q) ||
            s.company.toLowerCase().includes(q)
          );
        }).slice(0, input.limit);
        return { ok: true, tool: name, data: { source: "demo", items: data } };
      }
      case "get_stranka": {
        const input = getStrankaInputSchema.parse(rawInput);
        const live = await twentyFetch(`/rest/people/${input.id}`);
        if (live) return { ok: true, tool: name, data: live };
        const item = DEMO_STRANKE.find((s) => s.id === input.id);
        if (!item) return { ok: false, tool: name, error: "Stranka not found" };
        return { ok: true, tool: name, data: { source: "demo", item } };
      }
      case "search_leads": {
        const input = searchLeadsInputSchema.parse(rawInput ?? {});
        const live = await twentyFetch(
          `/rest/opportunities?limit=${input.limit}${input.query ? `&filter=${encodeURIComponent(input.query)}` : ""}`,
        );
        if (live) return { ok: true, tool: name, data: live };

        const q = (input.query ?? "").toLowerCase();
        const data = DEMO_LEADS.filter((l) => {
          if (input.stage && l.stage !== input.stage) return false;
          if (input.strankaId && l.strankaId !== input.strankaId) return false;
          if (!q) return true;
          return l.title.toLowerCase().includes(q) || l.stage.toLowerCase().includes(q);
        }).slice(0, input.limit);
        return { ok: true, tool: name, data: { source: "demo", items: data } };
      }
      case "get_lead": {
        const input = getLeadInputSchema.parse(rawInput);
        const live = await twentyFetch(`/rest/opportunities/${input.id}`);
        if (live) return { ok: true, tool: name, data: live };
        const item = DEMO_LEADS.find((l) => l.id === input.id);
        if (!item) return { ok: false, tool: name, error: "Lead not found" };
        return { ok: true, tool: name, data: { source: "demo", item } };
      }
      case "aggregate_crm": {
        const input = aggregateInputSchema.parse(rawInput);
        if (input.entity === "stranke") {
          return {
            ok: true,
            tool: name,
            data: {
              source: env.TWENTY_API_URL ? "twenty" : "demo",
              entity: "stranke",
              count: DEMO_STRANKE.length,
              byStatus: {
                active: DEMO_STRANKE.filter((s) => s.status === "active").length,
                prospect: DEMO_STRANKE.filter((s) => s.status === "prospect").length,
              },
            },
          };
        }
        return {
          ok: true,
          tool: name,
          data: {
            source: env.TWENTY_API_URL ? "twenty" : "demo",
            entity: "leads",
            count: DEMO_LEADS.length,
            byStage: {
              discovery: DEMO_LEADS.filter((l) => l.stage === "discovery").length,
              qualified: DEMO_LEADS.filter((l) => l.stage === "qualified").length,
            },
          },
        };
      }
      default:
        return { ok: false, tool: name, error: "Unknown tool" };
    }
  } catch (error) {
    return {
      ok: false,
      tool: name,
      error: error instanceof Error ? error.message : "Tool execution failed",
    };
  }
}
