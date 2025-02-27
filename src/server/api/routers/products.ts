import { eq, ne } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { products } from "~/server/db/schema";
import { ilike, and } from "drizzle-orm";
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
    })
  )
  .mutation(async ({ input, ctx }) => {
    return await ctx.db.insert(products).values({
      name: input.name,
      url: input.url,
      desc: input.desc,
      price: input.price.toString(), 
      imageUrls: input.imageUrls.join(","),
      category: input.category.toString(),
      subcategory: input.subcategory || null,
      createdById: input.createdById,
    });
  }),
  similarProducts: publicProcedure
    .input(z.object({ category: z.string(), productId: z.number() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(products)
        .where(and(eq(products.category, input.category), ne(products.id, input.productId)))
        .limit(4);
    }),
  getProductId: publicProcedure
  .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.id),
        with: {
          createdBy: true,
        },
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
      where: ilike(products.name, `%${input.query}%`),
    });
  }),
});
