import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslate } from "ra-core";
import { ArrowUp, Loader2, MessageSquarePlus, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "../misc/Markdown";
import { listConversations, streamChat, toolLabel } from "./chatApi";
import type { ChatMessage, ConversationSummary } from "./types";

export const ChatPage = () => {
  const translate = useTranslate();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const refreshConversations = useCallback(async () => {
    try {
      const { items } = await listConversations();
      setConversations(items);
    } catch {
      // API may be offline during local CRM-only work
    }
  }, []);

  useEffect(() => {
    void refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startNewChat = () => {
    abortRef.current?.abort();
    setActiveId(null);
    setMessages([]);
    setInput("");
    setError(null);
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((m) =>
        m.status === "streaming" ? { ...m, status: "complete" } : m,
      ),
    );
  };

  const sendMessage = async (raw?: string) => {
    const content = (raw ?? input).trim();
    if (!content || isStreaming) return;

    setError(null);
    setInput("");
    setIsStreaming(true);

    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        status: "complete",
      },
      {
        id: assistantId,
        role: "assistant",
        content: "",
        status: "streaming",
        toolCalls: [],
      },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;
    let conversationId = activeId;

    try {
      await streamChat({
        conversationId: conversationId ?? undefined,
        message: content,
        signal: controller.signal,
        onEvent: (event) => {
          if (event.type === "meta") {
            conversationId = event.conversationId;
            setActiveId(event.conversationId);
            return;
          }
          if (event.type === "text_delta") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: m.content + event.text,
                      status: "streaming",
                    }
                  : m,
              ),
            );
            return;
          }
          if (event.type === "tool_call") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      toolCalls: [
                        ...(m.toolCalls ?? []),
                        {
                          id: `${event.name}-${Date.now()}`,
                          name: event.name,
                          status: "running",
                          label: toolLabel(event.name),
                        },
                      ],
                    }
                  : m,
              ),
            );
            return;
          }
          if (event.type === "tool_result") {
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== assistantId) return m;
                const tools = [...(m.toolCalls ?? [])];
                for (let i = tools.length - 1; i >= 0; i -= 1) {
                  const t = tools[i];
                  if (t && t.name === event.name && t.status === "running") {
                    const ok =
                      typeof event.result === "object" &&
                      event.result &&
                      "ok" in event.result
                        ? Boolean((event.result as { ok?: boolean }).ok)
                        : true;
                    tools[i] = {
                      ...t,
                      status: ok ? "complete" : "error",
                    };
                    break;
                  }
                }
                return { ...m, toolCalls: tools };
              }),
            );
            return;
          }
          if (event.type === "done") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: event.assistantText || m.content,
                      status: "complete",
                    }
                  : m,
              ),
            );
            return;
          }
          if (event.type === "error") {
            setError(event.message);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      status: "error",
                      content:
                        m.content ||
                        translate("crm.chat.unavailable"),
                    }
                  : m,
              ),
            );
          }
        },
      });
      await refreshConversations();
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(
        err instanceof Error
          ? err.message
          : translate("crm.chat.api_unreachable"),
      );
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                status: "error",
                content: m.content || translate("crm.chat.api_offline"),
              }
            : m,
        ),
      );
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
      textareaRef.current?.focus();
    }
  };

  const suggestions = [
    translate("crm.chat.suggestions.active_stranke"),
    translate("crm.chat.suggestions.leads_followup"),
    translate("crm.chat.suggestions.recent_activity"),
    translate("crm.chat.suggestions.no_next_step"),
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[520px] overflow-hidden rounded-xl border bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-muted/30 md:flex">
        <div className="p-3">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={startNewChat}
          >
            <MessageSquarePlus className="size-4" />
            {translate("crm.chat.new_chat")}
          </Button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-3">
          {conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setActiveId(c.id);
                setMessages([]);
                setError(null);
              }}
              className={`w-full truncate rounded-lg px-2.5 py-2 text-left text-sm transition ${
                activeId === c.id
                  ? "bg-muted font-medium"
                  : "text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {c.title}
            </button>
          ))}
        </nav>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="text-base font-semibold">
              {translate("crm.chat.title")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {translate("crm.chat.ask_subtitle")}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={startNewChat}
          >
            {translate("crm.chat.new")}
          </Button>
        </div>

        {error && (
          <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-16 text-center">
              <div
                className="mb-6 flex size-12 items-center justify-center rounded-full border-2"
                style={{ borderColor: "var(--brand)", color: "var(--brand)" }}
                aria-hidden
              >
                <span className="text-2xl leading-none">∗</span>
              </div>
              <h3 className="text-2xl font-semibold tracking-tight">
                {translate("crm.chat.empty_title")}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {translate("crm.chat.empty_subtitle")}
              </p>
              <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
                {suggestions.map((text) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => void sendMessage(text)}
                    className="rounded-xl border bg-card px-4 py-3 text-left text-sm transition hover:border-[var(--brand)] hover:bg-[var(--brand)]/5"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-3xl">
                    {message.toolCalls && message.toolCalls.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {message.toolCalls.map((tool) => (
                          <span
                            key={tool.id}
                            className="inline-flex items-center gap-1.5 rounded-full border bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground"
                          >
                            {tool.status === "running" && (
                              <Loader2 className="size-3 animate-spin" />
                            )}
                            {tool.label ?? tool.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 leading-relaxed ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent"
                      }`}
                    >
                      {message.role === "user" ? (
                        <p className="whitespace-pre-wrap text-[15px]">
                          {message.content}
                        </p>
                      ) : message.content ? (
                        <Markdown>{message.content}</Markdown>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="size-3.5 animate-spin" />
                          {translate("crm.common.loading")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <form
            className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border bg-card p-2"
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!isStreaming && input.trim()) void sendMessage();
                }
              }}
              placeholder={translate("crm.chat.placeholder")}
              rows={1}
              className="min-h-12 max-h-40 flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            {isStreaming ? (
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={stopGeneration}
                aria-label={translate("crm.chat.stop")}
              >
                <Square className="size-4 fill-current" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim()}
                aria-label={translate("crm.chat.send")}
              >
                <ArrowUp className="size-4" />
              </Button>
            )}
          </form>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {translate("crm.chat.disclaimer")}
          </p>
        </div>
      </section>
    </div>
  );
};

ChatPage.path = "/chat";
