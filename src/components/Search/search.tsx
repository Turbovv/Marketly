"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SortDropdown from "~/components/Search/sort-dropdown";
import { api } from "~/trpc/react";
import { sortProducts } from "~/utils/sortProducts";
import ProductCard from "~/components/Product/product-card";
import { useAuth } from "~/hooks/useAuth";

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("query") || "";
  const { isAuthenticated, userId } = useAuth();
  const { data: products, isLoading } = api.products.searchProducts.useQuery(
    { query },
    { enabled: query.trim() !== "" }
  );

  const [sortOption, setSortOption] = useState<string>("none");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  useEffect(() => {
    if (products) {
      setFilteredProducts(sortProducts(products, sortOption));
    }
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
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isAuthenticated={isAuthenticated}
                userId={userId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">No products found for your search.</div>
        )}
      </div>
    </Suspense>
  );
}
