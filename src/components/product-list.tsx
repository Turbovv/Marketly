"use client"
import { api } from "~/trpc/react";

export default function ProductList() {
  const { data: products, isLoading } = api.products.getProducts.useQuery();

  if (isLoading) return <p>Loading products...</p>;

  if (!products || products.length === 0) return <p>No products found.</p>;

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {products.map((product: any) => (
        <div key={product.id} className="border p-4 rounded">
          <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover" />
          <h2 className="text-lg font-semibold">{product.name}</h2>
          <p className="text-gray-500">${product.price}</p>
        </div>
      ))}
    </div>
  );
}
