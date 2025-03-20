import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { eq } from "drizzle-orm";
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
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.productId),
      });

      if (!product) {
        throw new Error("Product not found");
      }
      const userId = ctx.session?.user?.id || ctx.jwtUser?.userId;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const existingItem = await ctx.db.query.cart.findFirst({
        where: eq(cart.productId, input.productId),
      });


      if (existingItem) {
        await ctx.db
          .update(cart)
          .set({ quantity: (existingItem.quantity ?? 0) + input.quantity })
          .where(eq(cart.id, existingItem.id));
      } else {
        await ctx.db.insert(cart).values({
          id: crypto.randomUUID(),
          userId: userId,
          productId: input.productId,
          quantity: input.quantity,
          price: product.price,
          desc: product.desc,
          url: product.url,
        });
      }

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
      const count = await ctx.db.query.cart.findMany({
        where: eq(cart.userId, userId),
      });
    
      return count.length;
    }),
});
