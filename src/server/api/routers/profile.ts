import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { users, products } from "~/server/db/schema";

export const profileRouter = createTRPCRouter({
  getUserProfile: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      if (!user) throw new Error("User not found");

      return user;
    }),

  getUserProducts: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.products.findMany({
        where: eq(products.createdById, input.userId),
      });
    }),
});
