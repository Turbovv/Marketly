"use client";

import Link from "next/link";
import { api } from "~/trpc/react";
import CategoriesContainer from "./categories";
import ProductImageCarousel from "./image-carousel";

export default function ProductList() {
  const { data: products } = api.products.getProducts.useQuery();

  return (
    <div className="space-y-8">
      <CategoriesContainer />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products?.map((product) => {
          const images = [product.url, ...product.imageUrls?.split(",") || []];

          return (
            <Link key={product.id} href={`/products/${product.id}`} className="group bg-white border rounded-lg hover:shadow">
              <div className="relative h-44 overflow-hidden rounded-t-lg">
                <img src={images[0]} alt={product.name} className="w-full h-full object-cover group-hover:opacity-0" />
                <ProductImageCarousel images={images} className="absolute inset-0 opacity-0 group-hover:opacity-100 h-44" />
              </div>

              <div className="p-3 mt-2">
                <h2 className="text-sm font-medium">{product.name}</h2>
                <p className="text-sm text-gray-500">{product.desc}</p>
                <p className="mt-4 text-base font-semibold">${product.price.toLocaleString()}</p>
              </div>
              </Link>
          );
        })}
      </div>
    </div>
  );
}
