import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { z } from "zod";
import { conversations, messages, users } from "~/server/db/schema";
import { eq, and, or } from "drizzle-orm";

export const chatRouter = createTRPCRouter({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const conversationsList = await db
      .select({
        id: conversations.id,
        sellerId: conversations.sellerId,
        buyerId: conversations.buyerId,
        createdAt: conversations.createdAt,
      })
      .from(conversations)
      .where(
        or(
          eq(conversations.sellerId, ctx.session.user.id),
          eq(conversations.buyerId, ctx.session.user.id)
        )
      );
  
    const sellerIds = conversationsList.map((conv) => conv.sellerId);
    const buyerIds = conversationsList.map((conv) => conv.buyerId);
  
    const sellers = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(or(...sellerIds.map((id) => eq(users.id, id))));

    const buyers = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(or(...buyerIds.map((id) => eq(users.id, id))));

    return conversationsList.map((conv) => ({
      ...conv,
      sellerName: sellers.find((s) => s.id === conv.sellerId)?.name || "Unknown",
      buyerName: buyers.find((b) => b.id === conv.buyerId)?.name || "Unknown",
    }));
  }),

  createConversation: protectedProcedure
    .input(z.object({ sellerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingConversation = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.sellerId, input.sellerId),
            eq(conversations.buyerId, ctx.session.user.id)
          )
        )
        .limit(1);

      if (existingConversation.length > 0) {
        return existingConversation[0]; // Return the existing conversation
      }

      const newConversation = await db
        .insert(conversations)
        .values({
          buyerId: ctx.session.user.id,
          sellerId: input.sellerId,
        })
        .returning();

      return newConversation[0];
    }),

  sendMessage: protectedProcedure
    .input(z.object({ conversationId: z.number(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const newMessage = await db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          senderId: ctx.session.user.id,
          content: input.content,
        })
        .returning();

      return newMessage[0];
    }),

  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      return await db
        .select({
          id: messages.id,
          content: messages.content,
          senderId: messages.senderId,
          senderName: users.name,
          createdAt: messages.createdAt, 
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.conversationId, input.conversationId));
    }),
    deleteConversation: protectedProcedure
  .input(z.object({ conversationId: z.number() }))
  .mutation(async ({ ctx, input }) => {
    const conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, input.conversationId))
      .limit(1);

    if (!conversation.length) {
      throw new Error("Conversation not found.");
    }

    const conv = conversation[0];

    if (conv && conv.sellerId !== ctx.session.user.id && conv.buyerId !== ctx.session.user.id) {
      throw new Error("You are not authorized to delete this conversation.");
    }

    await db.delete(messages).where(eq(messages.conversationId, input.conversationId));
    await db.delete(conversations).where(eq(conversations.id, input.conversationId));

    return { success: true };
  }),
});
