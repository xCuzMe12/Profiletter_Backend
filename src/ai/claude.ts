import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env.js";
import { SYSTEM_PROMPT } from "./system-prompt.js";
import { executeMcpTool, MCP_TOOL_DEFINITIONS } from "../mcp/gateway.js";
import type { McpToolName } from "../mcp/types.js";
import { appendMessage } from "../services/conversation.js";
import { writeAuditLog } from "../services/audit.js";

const client = () =>
  new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
  });

export type ChatHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export type StreamEvent =
  | { type: "text_delta"; text: string }
  | { type: "tool_call"; name: string; input: unknown }
  | { type: "tool_result"; name: string; result: unknown }
  | { type: "done"; assistantText: string }
  | { type: "error"; message: string };

function toAnthropicTools(): Anthropic.Tool[] {
  return MCP_TOOL_DEFINITIONS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.input_schema as Anthropic.Tool.InputSchema,
  }));
}

export async function* streamChatCompletion(input: {
  conversationId: string;
  userId: string;
  history: ChatHistoryMessage[];
  userMessage: string;
}): AsyncGenerator<StreamEvent> {
  if (!env.ANTHROPIC_API_KEY) {
    yield {
      type: "error",
      message:
        "ANTHROPIC_API_KEY is not configured. Set it in the environment to enable Profiletter Chat.",
    };
    return;
  }

  const messages: Anthropic.MessageParam[] = [
    ...input.history.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: input.userMessage },
  ];

  let assistantText = "";
  const maxToolLoops = 6;

  try {
    for (let loop = 0; loop < maxToolLoops; loop += 1) {
      const stream = client().messages.stream({
        model: env.CLAUDE_MODEL,
        max_tokens: env.CLAUDE_MAX_TOKENS,
        system: SYSTEM_PROMPT,
        tools: env.MCP_ENABLED ? toAnthropicTools() : undefined,
        messages,
      });

      let stopReason: string | null = null;
      const toolUses: Array<{ id: string; name: string; input: unknown }> = [];
      let currentTool: { id: string; name: string; inputJson: string } | null = null;
      let loopText = "";

      for await (const event of stream) {
        if (event.type === "content_block_start") {
          if (event.content_block.type === "tool_use") {
            currentTool = {
              id: event.content_block.id,
              name: event.content_block.name,
              inputJson: "",
            };
          }
        } else if (event.type === "content_block_delta") {
          if (event.delta.type === "text_delta") {
            loopText += event.delta.text;
            assistantText += event.delta.text;
            yield { type: "text_delta", text: event.delta.text };
          } else if (event.delta.type === "input_json_delta" && currentTool) {
            currentTool.inputJson += event.delta.partial_json;
          }
        } else if (event.type === "content_block_stop") {
          if (currentTool) {
            let parsedInput: unknown = {};
            try {
              parsedInput = currentTool.inputJson
                ? JSON.parse(currentTool.inputJson)
                : {};
            } catch {
              parsedInput = {};
            }
            toolUses.push({
              id: currentTool.id,
              name: currentTool.name,
              input: parsedInput,
            });
            yield {
              type: "tool_call",
              name: currentTool.name,
              input: parsedInput,
            };
            currentTool = null;
          }
        } else if (event.type === "message_delta") {
          stopReason = event.delta.stop_reason ?? null;
        }
      }

      if (stopReason !== "tool_use" || toolUses.length === 0) {
        break;
      }

      const assistantContent: Anthropic.ContentBlockParam[] = [];
      if (loopText) {
        assistantContent.push({ type: "text", text: loopText });
      }
      for (const tool of toolUses) {
        assistantContent.push({
          type: "tool_use",
          id: tool.id,
          name: tool.name,
          input: tool.input as Record<string, unknown>,
        });
      }
      messages.push({ role: "assistant", content: assistantContent });

      const toolResultBlocks: Anthropic.ToolResultBlockParam[] = [];
      for (const tool of toolUses) {
        await writeAuditLog({
          userId: input.userId,
          action: "TOOL_CALL",
          resource: tool.name,
          details: { input: tool.input as object },
        });

        const result = await executeMcpTool(tool.name as McpToolName, tool.input);
        await appendMessage({
          conversationId: input.conversationId,
          role: "TOOL",
          content: JSON.stringify(result),
          toolName: tool.name,
          toolCallId: tool.id,
        });
        await writeAuditLog({
          userId: input.userId,
          action: "TOOL_RESULT",
          resource: tool.name,
          details: { ok: result.ok },
        });

        yield { type: "tool_result", name: tool.name, result };
        toolResultBlocks.push({
          type: "tool_result",
          tool_use_id: tool.id,
          content: JSON.stringify(result),
          is_error: !result.ok,
        });
      }
      messages.push({ role: "user", content: toolResultBlocks });
    }

    if (assistantText.trim()) {
      await appendMessage({
        conversationId: input.conversationId,
        role: "ASSISTANT",
        content: assistantText,
      });
    }

    yield { type: "done", assistantText };
  } catch (error) {
    yield {
      type: "error",
      message: error instanceof Error ? error.message : "Claude request failed",
    };
  }
}
