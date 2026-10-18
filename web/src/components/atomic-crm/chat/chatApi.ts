import { getSupabaseClient } from "../providers/supabase/supabase";
import type { ConversationSummary, StreamEvent } from "./types";

const API_URL =
  import.meta.env.VITE_PROFILETTER_API_URL ?? "http://localhost:8080";

async function getAccessToken(): Promise<string | null> {
  const { data } = await getSupabaseClient().auth.getSession();
  return data.session?.access_token ?? null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      if (body.error?.message) message = body.error.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function listConversations() {
  return request<{ items: ConversationSummary[] }>("/conversations");
}

export async function deleteConversation(id: string) {
  return request<void>(`/conversations/${id}`, { method: "DELETE" });
}

export function toolLabel(name: string): string {
  const map: Record<string, string> = {
    search_stranke: "Searching Stranke",
    get_stranka: "Loading Stranka",
    search_leads: "Searching Leads",
    get_lead: "Loading Lead",
    aggregate_crm: "Aggregating CRM data",
  };
  return map[name] ?? `Running ${name}`;
}

export async function streamChat(input: {
  conversationId?: string;
  message: string;
  signal?: AbortSignal;
  onEvent: (event: StreamEvent) => void;
}) {
  const token = await getAccessToken();
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      conversationId: input.conversationId,
      message: input.message,
    }),
    signal: input.signal,
  });

  if (!res.ok || !res.body) {
    let message = `Chat failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      if (body.error?.message) message = body.error.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let eventName = "message";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";

    for (const line of parts) {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
        continue;
      }
      if (!line.startsWith("data:")) continue;
      const raw = line.slice(5).trim();
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as StreamEvent | Record<string, unknown>;
        if (eventName === "meta" && "conversationId" in parsed) {
          input.onEvent({
            type: "meta",
            conversationId: String(parsed.conversationId),
          });
        } else if ("type" in parsed) {
          input.onEvent(parsed as StreamEvent);
        }
      } catch {
        // ignore malformed chunk
      }
      eventName = "message";
    }
  }
}
