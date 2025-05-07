import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { z } from "zod";
import { conversations, messages, users } from "~/server/db/schema";
import { eq, and, or } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";

export const chatRouter = createTRPCRouter({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id || ctx.jwtUser?.userId;

    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

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
          eq(conversations.sellerId, userId),
          eq(conversations.buyerId, userId)
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
  getConversation: protectedProcedure
  .input(z.object({ conversationId: z.number() }))
  .query(async ({ ctx, input }) => {
    const userId = ctx.session?.user?.id || ctx.jwtUser?.userId;

    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const conversation = await db
      .select({
        id: conversations.id,
        sellerId: conversations.sellerId,
        buyerId: conversations.buyerId,
        createdAt: conversations.createdAt,
      })
      .from(conversations)
      .where(eq(conversations.id, input.conversationId))
      .limit(1);

    if (!conversation.length) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    if (!conversation[0]) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const [seller, buyer] = await Promise.all([
      db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, conversation[0].sellerId))
        .limit(1),
      db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, conversation[0].buyerId))
        .limit(1),
    ]);

    return {
      ...conversation[0],
      sellerName: seller[0]?.name || "Unknown",
      buyerName: buyer[0]?.name || "Unknown",
    };
  }),
  createConversation: protectedProcedure
    .input(z.object({ sellerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id || ctx.jwtUser?.userId;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const existingConversation = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.sellerId, input.sellerId),
            eq(conversations.buyerId, userId)
          )
        )
        .limit(1);

      if (existingConversation.length > 0) {
        return existingConversation[0];
      }

      const newConversation = await db
        .insert(conversations)
        .values({
          buyerId: userId,
          sellerId: input.sellerId,
        })
        .returning();

      return newConversation[0];
    }),

  sendMessage: protectedProcedure
    .input(z.object({ conversationId: z.number(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id || ctx.jwtUser?.userId;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const newMessage = await db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          senderId: userId,
          content: input.content,
        })
        .returning();

      return newMessage[0];
    }),

  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id || ctx.jwtUser?.userId;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

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
      const userId = ctx.session?.user?.id || ctx.jwtUser?.userId;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

    const conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, input.conversationId))
      .limit(1);

    if (!conversation.length) {
      throw new TRPCError({ 
          code: "NOT_FOUND",
          message: "Conversation not found."
        });
    }

    const conv = conversation[0];

    if (conv && conv.sellerId !== userId && conv.buyerId !== userId) {
      throw new TRPCError({ 
          code: "FORBIDDEN",
          message: "You are not authorized to delete this conversation."
        });
    }

    await db.delete(messages).where(eq(messages.conversationId, input.conversationId));
    await db.delete(conversations).where(eq(conversations.id, input.conversationId));

    return { success: true };
  }),

  searchConversations: protectedProcedure
  .input(z.object({ searchTerm: z.string() }))
  .query(async ({ ctx, input }) => {
    const userId = ctx.session?.user?.id || ctx.jwtUser?.userId;
    const term = input.searchTerm.toLowerCase();

    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const allConversations = await db
      .select({
        id: conversations.id,
        sellerId: conversations.sellerId,
        buyerId: conversations.buyerId,
        createdAt: conversations.createdAt,
      })
      .from(conversations)
      .where(
        or(
          eq(conversations.sellerId, userId),
          eq(conversations.buyerId, userId)
        )
      );

    const sellerIds = allConversations.map((c) => c.sellerId);
    const buyerIds = allConversations.map((c) => c.buyerId);

    const sellers = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(or(...sellerIds.map((id) => eq(users.id, id))));

    const buyers = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(or(...buyerIds.map((id) => eq(users.id, id))));

    return allConversations
      .map((conv) => ({
        ...conv,
        sellerName: sellers.find((s) => s.id === conv.sellerId)?.name || "",
        buyerName: buyers.find((b) => b.id === conv.buyerId)?.name || "",
      }))
      .filter((conv) =>
        conv.sellerId === userId
          ? conv.buyerName.toLowerCase().includes(term)
          : conv.sellerName.toLowerCase().includes(term)
      );
  }),


});
