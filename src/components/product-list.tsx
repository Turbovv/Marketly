"use client"
import Link from "next/link";
import { api } from "~/trpc/react";
import CategoriesContainer from "./categories";

export default function ProductList() {
  const { data: products, isLoading: productsLoading } = api.products.getProducts.useQuery();
  if (productsLoading) return <p>Loading products...</p>;

  return (
    <div>
      <CategoriesContainer />

      <div className="grid grid-cols-3 gap-4 p-4">
        {products?.length ? (
          products.map((product: any) => (
            <div key={product.id} className="border p-4 rounded">
              <Link href={`/products/${product.id}`}>
                <img src={product.url} alt={product.name} className="w-full object-cover" />
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-gray-500">${product.price}</p>
              </Link>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No products found in this category.</p>
        )}
      </div>
    </div>
  );
}
