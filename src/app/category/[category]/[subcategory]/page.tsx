"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import Link from "next/link";

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const subcategory = (params.subcategory as string)?.replace(/-/g, " ");

  const { data: products, isLoading } = api.products.getProductsByCategory.useQuery(
    { category, subcategory },
    { enabled: !!category }
  );

  if (isLoading) return <p>Loading products...</p>;
  if (!products || products.length === 0) return <p>No products found in this category.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">
        {subcategory ? `${subcategory} Products` : `${category} Products`}
      </h1>
      <div className="grid grid-cols-3 gap-4 p-4">
        {products.map((product: any) => (
          <div key={product.id} className="border p-4 rounded">
            <Link href={`/products/${product.id}`}>
              <img src={product.url} alt={product.name} className="w-full object-cover" />
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-gray-500">${product.price}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
