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
    })
  )
  .mutation(async ({ input, ctx }) => {
    return await ctx.db.insert(products).values({
      name: input.name,
      url: input.url,
      desc: input.desc,
      price: input.price.toString(), 
    });

  }),
});
