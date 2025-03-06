"use server"
import { api } from "~/trpc/server";
import { revalidatePath } from "next/cache";

export async function deleteProduct(productId: number) {
  try {
    await api.products.deleteProduct({ id: productId });
    console.log("Product deleted successfully");
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to delete product:", error);
  }
}
