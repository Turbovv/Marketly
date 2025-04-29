import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { and, eq } from "drizzle-orm";
import { cart, products } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";

export const cartRouter = createTRPCRouter({
  getCart: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id || ctx.jwtUser?.userId;
        if (!userId) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
    return await ctx.db.query.cart.findMany({
      where: eq(cart.userId, userId),
      with: {
        product: true,
      },
    });
  }),

  addToCart: protectedProcedure
  
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id || ctx.jwtUser?.userId;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const existingItem = await ctx.db.query.cart.findFirst({
        where: (cart) => {
        return and(
          eq(cart.productId, input.productId),
          eq(cart.userId, userId)
        );
      },
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
          userId: userId,
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
      await ctx.db.delete(cart).where(eq(cart.id, input.cartId));
      return { success: true };
    }),
    getCartCount: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.session?.user?.id || ctx.jwtUser?.userId;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const cartItems = await ctx.db.query.cart.findMany({
        where: eq(cart.userId, userId),
      });
    
      return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
    }),
    isProductInCart: protectedProcedure
  .input(z.object({ productId: z.number() }))
  .query(async ({ ctx, input }) => {
    const userId = ctx.session?.user?.id || ctx.jwtUser?.userId;

    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const cartItem = await ctx.db.query.cart.findFirst({
      where: (cart) => {
        return and(
          eq(cart.productId, input.productId),
          eq(cart.userId, userId)
        );
      },
    });

    return !!cartItem;
  }),
    
});
