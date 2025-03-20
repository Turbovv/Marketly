import { eq, ne, ilike, and, or } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { products, users } from "~/server/db/schema";
import { db } from "~/server/db";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";

const JWT_SECRET = process.env.JWT_SECRET || "+8APs0PI/xDA6v42wSxTcS++8hdIC6/5r1taMlGaq/I=";

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
    const authHeader = ctx.headers?.get("authorization");
    const jwtToken = authHeader?.replace("Bearer ", "");

    if (jwtToken) {
      try {
        const decoded = jwt.verify(jwtToken, JWT_SECRET) as { userId: string };
        const user = await ctx.db.query.users.findFirst({
          where: and(
            eq(users.id, decoded.userId),
            eq(users.userType, 'jwt')
          ),
        });

        if (user && user.id === input.createdById) {
          return await ctx.db.insert(products).values({
            name: input.name,
            url: input.url,
            desc: input.desc,
            price: input.price.toString(),
            imageUrls: input.imageUrls.join(","),
            category: input.category,
            subcategory: input.subcategory || null,
            createdById: user.id,
          });
        }
      } catch (error) {
        console.error("JWT verification failed:", error);
      }
    }

    if (ctx.session?.user?.id === input.createdById) {
      return await ctx.db.insert(products).values({
        name: input.name,
        url: input.url,
        desc: input.desc,
        price: input.price.toString(),
        imageUrls: input.imageUrls.join(","),
        category: input.category,
        subcategory: input.subcategory || null,
        createdById: ctx.session.user.id,
      });
    }

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to create a product",
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
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id || ctx.jwtUser?.userId;

      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.id),
      });

      if (!product) {
        throw new TRPCError({ 
          code: "NOT_FOUND",
          message: "Product not found" 
        });
      }

      if (product.createdById !== userId) {
        throw new TRPCError({ 
          code: "FORBIDDEN",
          message: "Not authorized to delete this product" 
        });
      }

      await ctx.db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),
    verifyToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        try {
          const decoded = jwt.verify(input.token, JWT_SECRET);
          return { success: true, user: decoded };
        } catch (error) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid token",
          });
        }
      }),
});

