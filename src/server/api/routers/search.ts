import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { recentSearches } from "~/server/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const searchRouter = createTRPCRouter({
  deleteRecentSearch: publicProcedure
    .input(z.object({ term: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const deletedTerm = input.term;

      try {
        await ctx.db
          .delete(recentSearches)
          .where(
            and(
              eq(recentSearches.term, deletedTerm),
              eq(recentSearches.userId, userId),
            ),
          );

        return { success: true, deletedTerm };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete search term",
        });
      }
    }),

  addRecentSearch: publicProcedure
    .input(z.object({ term: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;

      await ctx.db.insert(recentSearches).values({
        term: input.term,
        userId: userId,
      });

      return { success: true };
    }),

  getRecentSearches: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const searches = await ctx.db
      .select()
      .from(recentSearches)
      .where(eq(recentSearches.userId, userId))
      .orderBy(desc(recentSearches.createdAt))
      .limit(5);

    return searches;
  }),
});
