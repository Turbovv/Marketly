"use client";

import { useParams, useRouter } from "next/navigation";
import SimilarProducts from "~/components/similar-products";
import { api } from "~/trpc/react";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const productId = id ? Number(id) : null;

  const { data: product, isLoading, error } = api.products.getProductId.useQuery(
    { id: productId as number },
    {
      enabled: !!productId,
    }
  );

  const addToCartMutation = api.cart.addToCart.useMutation({
    onSuccess: () => {
      router.push("/cart");
    },
  });

  if (!id || isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading product: {error.message}</div>;

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="border rounded-lg overflow-hidden">
        <img src={product?.url} alt={product?.name} className="w-full h-auto object-cover" />
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">{product?.name}</h1>
        <p className="text-lg text-gray-600">{product?.desc}</p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">${product?.price}</span>
          <button
            onClick={() => {
              if (product) {
                addToCartMutation.mutate({ productId: product.id, quantity: 1 });
              }
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {product?.category && (
        <div className="md:col-span-2">
          <SimilarProducts category={product.category} productId={product.id} />
        </div>
      )}
    </div>
  );
}
