"use client";

import { ClipLoader } from "react-spinners";
import { api } from "~/trpc/react";

type SimilarProductsProps = {
    category: string;
    productId: number;
  };
export default function SimilarProducts({ category, productId }: SimilarProductsProps) {
  const { data: similarProducts, isLoading } = api.products.similarProducts.useQuery({ category, productId });

  if (isLoading) return <p><ClipLoader /></p>;
  if (!similarProducts || similarProducts.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Similar Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {similarProducts.map((product: any) => (
          <div key={product.id} className="border rounded p-4">
            <img src={product.url} alt={product.name} className="w-full h-40 object-cover rounded-md" />
            <h3 className="text-lg font-medium mt-2">{product.name}</h3>
            <p className="text-gray-500">${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
