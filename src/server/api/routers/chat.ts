import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { z } from "zod";
import { conversations, messages, users } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export const chatRouter = createTRPCRouter({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select({
        id: conversations.id,
        sellerId: conversations.sellerId,
        sellerName: users.name,
      })
      .from(conversations)
      .innerJoin(users, eq(conversations.sellerId, users.id))
      .where(eq(conversations.buyerId, ctx.session.user.id));
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
            eq(conversations.buyerId, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (existingConversation.length > 0) {
        return existingConversation;
      }

      return await db.insert(conversations).values({
        buyerId: ctx.session.user.id,
        sellerId: input.sellerId,
      });
    }),

  sendMessage: protectedProcedure
    .input(z.object({ conversationId: z.number(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await db.insert(messages).values({
        conversationId: input.conversationId,
        senderId: ctx.session.user.id,
        content: input.content,
      });
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
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.conversationId, input.conversationId));
    }),
});
