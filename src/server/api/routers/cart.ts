import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { and, eq } from "drizzle-orm";
import { cart, products } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";

export const cartRouter = createTRPCRouter({
  getCart: protectedProcedure
    .input(z.object({ productId: z.number() }).optional())
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }
      const userId = ctx.user.id;

      if (input?.productId) {
        const item = await ctx.db.query.cart.findFirst({
          where: and(
            eq(cart.productId, input.productId),
            eq(cart.userId, userId),
          ),
          with: { product: true },
        });
        return item ? [item] : [];
      }

      const items = await ctx.db.query.cart.findMany({
        where: eq(cart.userId, userId),
        with: { product: true },
      });
      return items ?? [];
    }),

  addToCart: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a product",
        });
      }
      const userId = ctx.user.id;

      const existingItem = await ctx.db.query.cart.findFirst({
        where: and(
          eq(cart.productId, input.productId),
          eq(cart.userId, userId),
        ),
      });

      if (existingItem) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This product is already in your cart",
        });
      }

      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.productId),
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      await ctx.db.insert(cart).values({
        id: crypto.randomUUID(),
        userId,
        productId: input.productId,
        quantity: input.quantity,
        price: product.price,
        desc: product.desc,
        url: product.url,
      });

      return { success: true };
    }),

  removeFromCart: protectedProcedure
    .input(z.object({ cartId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a product",
        });
      }
      const userId = ctx.user.id;

      await ctx.db
        .delete(cart)
        .where(and(eq(cart.id, input.cartId), eq(cart.userId, userId)));

      return { success: true };
    }),

  getCartCount: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to create a product",
      });
    }
    const userId = ctx.user.id;

    const cartItems = await ctx.db.query.cart.findMany({
      where: eq(cart.userId, userId),
    });

    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  }),

  isProductInCart: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a product",
        });
      }
      const userId = ctx.user.id;

      const cartItem = await ctx.db.query.cart.findFirst({
        where: and(
          eq(cart.productId, input.productId),
          eq(cart.userId, userId),
        ),
      });

      return !!cartItem;
    }),
});
