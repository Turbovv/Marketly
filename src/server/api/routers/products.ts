import { eq, ne, ilike, and, or } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { products } from "~/server/db/schema";
import { db } from "~/server/db";

export const productsRouter = createTRPCRouter({
  getProducts: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.products.findMany();
  }),
  createProduct: publicProcedure
    .input(
      z.object({
        name: z.string(),
        url: z.string(),
        desc: z.string(),
        price: z.number(),
        imageUrls: z.array(z.string()),
        category: z.string(),
        subcategory: z.string().optional(),
        createdById: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.insert(products).values({
        name: input.name,
        url: input.url,
        desc: input.desc,
        price: input.price.toString(),
        imageUrls: input.imageUrls.join(","),
        category: input.category,
        subcategory: input.subcategory || null,
        createdById: input.createdById,
      });
    }),
  getProductsByCategory: publicProcedure
    .input(
      z.object({
        category: z.string(),
        subcategory: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const whereConditions = [ilike(products.category, input.category)];

      if (input.subcategory) {
        whereConditions.push(ilike(products.subcategory, input.subcategory));
      }

      return await ctx.db.query.products.findMany({
        where: and(...whereConditions),
      });
    }),

  getCategories: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db
      .select({ category: products.category })
      .from(products)
      .groupBy(products.category);

    return categories.map((category) => category.category);
  }),

  similarProducts: publicProcedure
    .input(z.object({ category: z.string(), productId: z.number() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.category, input.category),
            ne(products.id, input.productId),
          ),
        )
        .limit(4);
    }),
  getProductId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.id),
        with: { createdBy: true },
      });
      if (!product) {
        throw new Error("Product not found");
      }
      return {
        ...product,
        imageUrls: product.imageUrls ? product.imageUrls.split(",") : [],
      };
    }),

  searchProducts: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.products.findMany({
        where: or(
          ilike(products.name, `%${input.query}%`),
          ilike(products.category, `%${input.query}%`),
          ilike(products.subcategory, `%${input.query}%`)
        ),
      });
    }),

  deleteProduct: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.id),
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.createdById !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      await ctx.db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),
});
