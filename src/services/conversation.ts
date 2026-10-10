import type { MessageRole, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ForbiddenError, NotFoundError } from "../lib/errors.js";

export async function listConversations(userId: string) {
  return prisma.conversation.findMany({
    where: { userId, archived: false },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  });
}

export async function createConversation(userId: string, title?: string) {
  return prisma.conversation.create({
    data: {
      userId,
      title: title?.trim() || "New chat",
    },
  });
}

export async function getConversationForUser(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) throw new NotFoundError("Conversation not found");
  if (conversation.userId !== userId) throw new ForbiddenError("Access denied");
  return conversation;
}

export async function appendMessage(input: {
  conversationId: string;
  role: MessageRole;
  content: string;
  toolName?: string;
  toolCallId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId: input.conversationId,
        role: input.role,
        content: input.content,
        toolName: input.toolName,
        toolCallId: input.toolCallId,
        metadata: input.metadata,
      },
    }),
    prisma.conversation.update({
      where: { id: input.conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return message;
}

export async function archiveConversation(conversationId: string, userId: string) {
  await getConversationForUser(conversationId, userId);
  return prisma.conversation.update({
    where: { id: conversationId },
    data: { archived: true },
  });
}

export function deriveTitleFromPrompt(prompt: string): string {
  const cleaned = prompt.replace(/\s+/g, " ").trim();
  if (!cleaned) return "New chat";
  return cleaned.length > 60 ? `${cleaned.slice(0, 57)}...` : cleaned;
}
