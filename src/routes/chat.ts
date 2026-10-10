import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { requireAuth } from "../auth/middleware.js";
import {
  appendMessage,
  createConversation,
  deriveTitleFromPrompt,
  getConversationForUser,
} from "../services/conversation.js";
import { streamChatCompletion } from "../ai/claude.js";
import { writeAuditLog } from "../services/audit.js";
import { ValidationError } from "../lib/errors.js";

const chatSchema = z.object({
  conversationId: z.string().min(1).optional(),
  message: z.string().min(1).max(20_000),
});

function sseWrite(reply: { raw: NodeJS.WritableStream }, event: string, data: unknown) {
  reply.raw.write(`event: ${event}\n`);
  reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
}

export const chatRoutes: FastifyPluginAsync = async (app) => {
  app.post("/chat", { preHandler: requireAuth }, async (request, reply) => {
    const parsed = chatSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError("Invalid chat payload");

    const userId = request.auth!.userId;
    let conversationId = parsed.data.conversationId;

    if (!conversationId) {
      const created = await createConversation(
        userId,
        deriveTitleFromPrompt(parsed.data.message),
      );
      conversationId = created.id;
      await writeAuditLog({
        userId,
        action: "CONVERSATION_CREATE",
        resource: conversationId,
        ip: request.ip,
      });
    }

    const conversation = await getConversationForUser(conversationId, userId);

    await appendMessage({
      conversationId,
      role: "USER",
      content: parsed.data.message,
    });

    await writeAuditLog({
      userId,
      action: "MESSAGE_SEND",
      resource: conversationId,
      ip: request.ip,
    });

    const history = conversation.messages
      .filter((m) => m.role === "USER" || m.role === "ASSISTANT")
      .map((m) => ({
        role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      }));

    reply.hijack();
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Conversation-Id": conversationId,
    });

    sseWrite(reply, "meta", { conversationId });

    try {
      for await (const event of streamChatCompletion({
        conversationId,
        userId,
        history,
        userMessage: parsed.data.message,
      })) {
        sseWrite(reply, event.type, event);
        if (event.type === "error") break;
      }
    } catch (error) {
      sseWrite(reply, "error", {
        type: "error",
        message: error instanceof Error ? error.message : "Stream failed",
      });
    } finally {
      reply.raw.end();
    }
  });
};
