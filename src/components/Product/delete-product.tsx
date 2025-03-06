"use client"
import { deleteProduct } from "~/app/products/[id]/actions/delete-product";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ productId }: { productId: number }) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(event: React.FormEvent) {
    event.preventDefault();
    try {
      await deleteProduct(productId);
      router.push("/");
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
