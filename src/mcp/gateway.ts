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
 * MCP gateway for Atomic CRM (Supabase).
 * Read-only tools first. Maps contacts → Stranke, deals → Leads.
 */
export const MCP_TOOL_DEFINITIONS = [
  {
    name: "search_stranke" as const,
    description:
      "Search Stranke (customers/prospects stored as contacts). Use for finding people by name, email, or free text.",
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
      "Search Leads (prospective professional-service engagements stored as deals).",
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
    stage: "proposal-sent",
    strankaId: "stranka_demo_1",
    value: 12000,
    currency: "EUR",
  },
  {
    id: "lead_demo_2",
    title: "CRM migration advisory",
    stage: "opportunity",
    strankaId: "stranka_demo_2",
    value: 8500,
    currency: "EUR",
  },
];

async function supabaseRest<T>(
  pathAndQuery: string,
): Promise<T | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null;

  const url = `${env.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${pathAndQuery}`;
  const res = await fetch(url, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "count=exact",
    },
  });

  if (!res.ok) {
    throw new Error(`Supabase CRM error ${res.status}`);
  }

  return (await res.json()) as T;
}

function formatContact(row: Record<string, unknown>) {
  const first = typeof row.first_name === "string" ? row.first_name : "";
  const last = typeof row.last_name === "string" ? row.last_name : "";
  return {
    id: row.id,
    name: `${first} ${last}`.trim() || "Unnamed Stranka",
    first_name: first,
    last_name: last,
    email: row.email_jsonb ?? row.email ?? null,
    title: row.title ?? null,
    company_id: row.company_id ?? null,
    status: row.status ?? null,
    last_seen: row.last_seen ?? null,
  };
}

function formatDeal(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.name ?? "Untitled Lead",
    stage: row.stage ?? null,
    amount: row.amount ?? null,
    company_id: row.company_id ?? null,
    contact_ids: row.contact_ids ?? [],
    expected_closing_date: row.expected_closing_date ?? null,
    description: row.description ?? null,
  };
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
        const q = (input.query ?? input.email ?? "").trim();
        let path = `contacts?select=*&limit=${input.limit}`;
        if (q) {
          const encoded = encodeURIComponent(`%${q}%`);
          path += `&or=(first_name.ilike.${encoded},last_name.ilike.${encoded})`;
        }
        const live = await supabaseRest<Record<string, unknown>[]>(path);
        if (live) {
          return {
            ok: true,
            tool: name,
            data: {
              source: "supabase",
              items: live.map(formatContact),
            },
          };
        }

        const needle = q.toLowerCase();
        const data = DEMO_STRANKE.filter((s) => {
          if (!needle) return true;
          return (
            s.name.toLowerCase().includes(needle) ||
            s.email.toLowerCase().includes(needle) ||
            s.company.toLowerCase().includes(needle)
          );
        }).slice(0, input.limit);
        return { ok: true, tool: name, data: { source: "demo", items: data } };
      }
      case "get_stranka": {
        const input = getStrankaInputSchema.parse(rawInput);
        const live = await supabaseRest<Record<string, unknown>[]>(
          `contacts?id=eq.${encodeURIComponent(input.id)}&select=*&limit=1`,
        );
        if (live) {
          if (!live[0]) return { ok: false, tool: name, error: "Stranka not found" };
          return {
            ok: true,
            tool: name,
            data: { source: "supabase", item: formatContact(live[0]) },
          };
        }
        const item = DEMO_STRANKE.find((s) => s.id === input.id);
        if (!item) return { ok: false, tool: name, error: "Stranka not found" };
        return { ok: true, tool: name, data: { source: "demo", item } };
      }
      case "search_leads": {
        const input = searchLeadsInputSchema.parse(rawInput ?? {});
        let path = `deals?select=*&archived_at=is.null&limit=${input.limit}`;
        if (input.stage) {
          path += `&stage=eq.${encodeURIComponent(input.stage)}`;
        }
        if (input.query) {
          path += `&name=ilike.${encodeURIComponent(`%${input.query}%`)}`;
        }
        const live = await supabaseRest<Record<string, unknown>[]>(path);
        if (live) {
          let items = live.map(formatDeal);
          if (input.strankaId) {
            items = items.filter((d) => {
              const ids = Array.isArray(d.contact_ids) ? d.contact_ids : [];
              return ids.map(String).includes(input.strankaId!);
            });
          }
          return { ok: true, tool: name, data: { source: "supabase", items } };
        }

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
        const live = await supabaseRest<Record<string, unknown>[]>(
          `deals?id=eq.${encodeURIComponent(input.id)}&select=*&limit=1`,
        );
        if (live) {
          if (!live[0]) return { ok: false, tool: name, error: "Lead not found" };
          return {
            ok: true,
            tool: name,
            data: { source: "supabase", item: formatDeal(live[0]) },
          };
        }
        const item = DEMO_LEADS.find((l) => l.id === input.id);
        if (!item) return { ok: false, tool: name, error: "Lead not found" };
        return { ok: true, tool: name, data: { source: "demo", item } };
      }
      case "aggregate_crm": {
        const input = aggregateInputSchema.parse(rawInput);
        if (input.entity === "stranke") {
          const live = await supabaseRest<Record<string, unknown>[]>(
            "contacts?select=id&limit=1000",
          );
          return {
            ok: true,
            tool: name,
            data: {
              source: live ? "supabase" : "demo",
              entity: "stranke",
              count: live ? live.length : DEMO_STRANKE.length,
            },
          };
        }
        const live = await supabaseRest<Record<string, unknown>[]>(
          "deals?select=id,stage&archived_at=is.null&limit=1000",
        );
        if (live) {
          const byStage: Record<string, number> = {};
          for (const row of live) {
            const stage = String(row.stage ?? "unknown");
            byStage[stage] = (byStage[stage] ?? 0) + 1;
          }
          return {
            ok: true,
            tool: name,
            data: {
              source: "supabase",
              entity: "leads",
              count: live.length,
              byStage,
            },
          };
        }
        return {
          ok: true,
          tool: name,
          data: {
            source: "demo",
            entity: "leads",
            count: DEMO_LEADS.length,
            byStage: {
              opportunity: DEMO_LEADS.filter((l) => l.stage === "opportunity").length,
              "proposal-sent": DEMO_LEADS.filter((l) => l.stage === "proposal-sent")
                .length,
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
