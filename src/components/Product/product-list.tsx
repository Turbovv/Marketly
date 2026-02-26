"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import { api } from "~/trpc/react";
import CategoriesContainer from "../categories";
import ProductCard from "./product-card";
import { useAuth } from "~/hooks/useAuth";
import "swiper/css";
import "swiper/css/navigation";
import { Skeleton } from "~/components/ui/skeleton";

export default function ProductList() {
  const { data: products, isLoading } = api.products.getProducts.useQuery();
  const { isAuthenticated, userId } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <CategoriesContainer />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 px-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-3 space-y-2">
              <Skeleton className="h-44 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/4" />
              <Skeleton className="h-5 w-1/2 mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CategoriesContainer />

      <div className="space-y-4 px-4">
        <h2 className="text-lg font-semibold">Products</h2>
        <Swiper
          slidesPerView={2}
          spaceBetween={10}
          breakpoints={{
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 6 },
          }}
          freeMode={true}
          modules={[FreeMode, Navigation]}
        >
          {products?.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard
                product={product}
                isAuthenticated={isAuthenticated}
                userId={userId}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
