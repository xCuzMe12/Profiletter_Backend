import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { requireAuth } from "../auth/middleware.js";
import {
  archiveConversation,
  createConversation,
  getConversationForUser,
  listConversations,
} from "../services/conversation.js";
import { writeAuditLog } from "../services/audit.js";
import { ValidationError } from "../lib/errors.js";

const createSchema = z.object({
  title: z.string().min(1).max(120).optional(),
});

export const conversationRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", requireAuth);

  app.get("/conversations", async (request) => {
    const items = await listConversations(request.auth!.userId);
    return { items };
  });

  app.post("/conversations", async (request, reply) => {
    const parsed = createSchema.safeParse(request.body ?? {});
    if (!parsed.success) throw new ValidationError("Invalid conversation payload");

    const conversation = await createConversation(
      request.auth!.userId,
      parsed.data.title,
    );

    await writeAuditLog({
      userId: request.auth!.userId,
      action: "CONVERSATION_CREATE",
      resource: conversation.id,
      ip: request.ip,
    });

    return reply.code(201).send({ conversation });
  });

  app.get("/conversations/:id", async (request) => {
    const { id } = request.params as { id: string };
    const conversation = await getConversationForUser(id, request.auth!.userId);

    await writeAuditLog({
      userId: request.auth!.userId,
      action: "CONVERSATION_READ",
      resource: id,
      ip: request.ip,
    });

    return { conversation };
  });

  app.delete("/conversations/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await archiveConversation(id, request.auth!.userId);
    return reply.code(204).send();
  });
};
