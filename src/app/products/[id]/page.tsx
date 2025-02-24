"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const productId = id ? Number(id) : null;

  const { data: product, isLoading, error } = api.products.getProductId.useQuery(
    { id: productId as number },
    {
      enabled: !!productId,
    }
  );

  if (!id || isLoading)
    return (
      <div className="container mx-auto p-6 flex gap-8">
        Loading...
      </div>
    );

  if (error) return <div className="text-red-500">Error loading product: {error.message}</div>;

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
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            Add to Cart
          </button>
        </div>

        <div className="mt-6 p-4 border rounded-lg">
          <h3 className="text-xl font-semibold">Seller Information</h3>
          <p className="text-gray-600">John Doe</p>
          <p className="text-gray-600">Tbilisi, Georgia</p>
          <button className="mt-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
            Contact Seller
          </button>
        </div>
      </div>
    </div>
  );
}
