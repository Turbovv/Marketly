import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { useRouter } from "next/navigation";
import type { AppRouter } from "~/server/api/root";

type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

export type Product = RouterOutputs["products"]["getProductId"];
export type UserProducts = RouterOutputs["profile"]["getUserProducts"];
export type Conversation = RouterOutputs["chat"]["getConversations"][number];
export type ProductInfoRouter = Pick<ReturnType<typeof useRouter>, "push">;
export type UpdateProductInput = Omit<
  RouterInputs["products"]["updateProduct"],
  "id"
>;

export interface ProductDetailsProps {
  productId: number;
}