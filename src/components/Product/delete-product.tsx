"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function DeleteProductButton({ productId }: { productId: number }) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const deleteProductMutation = api.products.deleteProduct.useMutation({
    onSuccess: () => {
      router.push("/");
    },
    onError: (error) => {
      setError("Failed to delete product. Please try again.");
      console.error("Delete error:", error);
    },
  });

  async function handleDelete(event: React.FormEvent) {
    event.preventDefault();
    try {
      await deleteProductMutation.mutateAsync({ id: productId });
    } catch (err) {
      setError("Failed to delete product. Please try again.");
    }
  }

  return (
    <div>
      <form onSubmit={handleDelete}>
        <button
          type="submit"
          className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition ease-in-out duration-200 w-full"
        >
          Delete Product
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
