"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SortDropdown from "~/components/sort-dropdown";
import { api } from "~/trpc/react";
import { sortProducts } from "~/utils/sortProducts";

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("query") || ""; 
  const { data: products, isLoading } = api.products.searchProducts.useQuery(
    { query },
    { enabled: query.trim() !== "" }
  );

  const [sortOption, setSortOption] = useState<string>("none");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  useEffect(() => {
    setFilteredProducts(sortProducts(products || [], sortOption));
  }, [products, sortOption]);

  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <div className="w-full max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
          Search Results for <span className="text-blue-400">"{query}"</span>
        </h1>

        <div className="flex justify-between items-center mb-6">
          <SortDropdown sortOption={sortOption} setSortOption={setSortOption} />
        </div>

        {isLoading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProducts.map((product: any) => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                <img
                  src={product.url}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
                  <p className="text-lg font-medium text-gray-500 mt-2">${product.price}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">No products found for your search.</div>
        )}
      </div>
    </Suspense>
  );
}
