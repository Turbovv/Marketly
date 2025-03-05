import { postRouter } from "~/server/api/routers/post";
import { productsRouter } from "./routers/products";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { cartRouter } from "./routers/cart";
import { chatRouter } from "./routers/chat";
import { profileRouter } from "./routers/profile";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  products: productsRouter,
  cart: cartRouter,
  chat: chatRouter,
  profile: profileRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
