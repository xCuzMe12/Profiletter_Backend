export type ChatRole = "user" | "assistant";

export type ToolCall = {
  id: string;
  name: string;
  status: "running" | "complete" | "error";
  label?: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  status?: "pending" | "streaming" | "complete" | "error";
  toolCalls?: ToolCall[];
};

export type StreamEvent =
  | { type: "meta"; conversationId: string }
  | { type: "text_delta"; text: string }
  | { type: "tool_call"; name: string; input: unknown }
  | { type: "tool_result"; name: string; result: unknown }
  | { type: "done"; assistantText: string }
  | { type: "error"; message: string };

export type ConversationSummary = {
  id: string;
  title: string;
  updatedAt: string;
};
