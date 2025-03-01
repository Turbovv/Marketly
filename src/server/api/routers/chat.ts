import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { z } from "zod";
import { conversations, messages, users } from "~/server/db/schema";
import { eq, and, or} from "drizzle-orm";

export const chatRouter = createTRPCRouter({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const conversationsList = await db
      .select({
        id: conversations.id,
        sellerId: conversations.sellerId,
        buyerId: conversations.buyerId,
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
      .select({
        id: users.id,
        name: users.name,
      })
      .from(users)
      .where(or(...sellerIds.map((id) => eq(users.id, id))));
  
    const buyers = await db
      .select({
        id: users.id,
        name: users.name,
      })
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
