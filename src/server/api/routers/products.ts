import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { products } from "~/server/db/schema";

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
      imageUrls: z.array(z.string())
    })
  )
  .mutation(async ({ input, ctx }) => {
    return await ctx.db.insert(products).values({
      name: input.name,
      url: input.url,
      desc: input.desc,
      price: input.price.toString(), 
      imageUrls: input.imageUrls.join(",")
    });
  }),
  getProductId: publicProcedure
  .input(
    z.object({
      id: z.number(),
    })
  )
  .query(async ({ ctx, input }) => {
    const product = await ctx.db.query.products.findFirst({
      where: eq(products.id, input.id),
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }),
});
