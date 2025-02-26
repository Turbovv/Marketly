"use client";

import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("query") || ""; 
  const { data: products, isLoading } = api.products.searchProducts.useQuery(
    { query },
    { enabled: query.trim() !== "" }
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Search Results for "{query}"</h1>

      {isLoading ? (
        <p>Loading...</p>
      ) : products && products.length > 0 ? (
        <div className="space-y-4">
          {products.map((product: any) => (
        <div key={product.id} className="border p-4 rounded">
          <img src={product.url} alt={product.name} className="w-full object-cover" />
          <h2 className="text-lg font-semibold">{product.name}</h2>
          <p className="text-gray-500">${product.price}</p>
        </div>
      ))}
        </div>
      ) : (
        <p>No products found for your search.</p>
      )}
    </div>
  );
}
