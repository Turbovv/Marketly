"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import Link from "next/link";
import { useState } from "react";
import SortDropdown from "~/components/Search/sort-dropdown";
import { sortProducts } from "~/utils/sortProducts";
import { ChevronRight } from "lucide-react";

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const subcategory = (params.subcategory as string)?.replace(/-/g, " ");
  const [sortOption, setSortOption] = useState("");

  const { data: products, isLoading } = api.products.getProductsByCategory.useQuery(
    { category, subcategory },
    { enabled: !!category }
  );

  if (!products || products.length === 0) return <p>No products found in this category.</p>;
  const sortedProducts = sortProducts(products || [], sortOption);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
        <nav className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href={`/category/${category}`} className="hover:text-blue-600">{category}</Link>
          {subcategory && (
            <>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-gray-900">{subcategory}</span>
            </>
          )}
        </nav>

        <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
    <div>
      <h1 className="text-xl font-semibold text-gray-900">
        {subcategory || category}
      </h1>
              <p className="text-sm text-gray-500">
                {products.length} Listing 
              </p>
            </div>
            <div className="flex items-center gap-4">
              <SortDropdown sortOption={sortOption} setSortOption={setSortOption} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedProducts.map((product: any) => (
            <Link 
              href={`/products/${product.id}`}
              key={product.id}
              className="bg-white rounded-lg hover:shadow transition-shadow duration-200 group border border-gray-100"
            >
              <div className="relative h-44 overflow-hidden rounded-t-lg">
                <img 
                  src={product.url} 
                  alt={product.name}
                  className="w-full h-full p-4 object-cover rounded-3xl group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="p-3 mt-2 leading">
                <h2 className="text-sm font-medium ">
                  {product.name}
                </h2>
                <p className="text-sm font-medium text-gray-500 leading-8">
                  {product.desc}
                </p><hr />
                <div className="mt-4">
                  <p className="text-base font-semibold text-gray-900 ">
                    ${product.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
          </div>
      </div>
    </div>
  );
}
