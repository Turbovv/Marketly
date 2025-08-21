"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import { api } from "~/trpc/react";
import CategoriesContainer from "../categories";
import ProductImageCarousel from "./image-carousel";
import CartToggleButton from "../Cart/cart-toggle";
import { useAuth } from "~/hooks/useAuth";
import "swiper/css";
import "swiper/css/navigation";
import { Skeleton } from "~/components/ui/skeleton"; 

export default function ProductList() {
  const { data: products, isLoading } = api.products.getProducts.useQuery();
  const { isAuthenticated, userId } = useAuth();

  const chunkSize = 12;
  const chunkedProducts = [];
  if (products && products.length > 0) {
    for (let i = 0; i < products.length; i += chunkSize) {
      chunkedProducts.push(products.slice(i, i + chunkSize));
    }
  }

  return (
    <div className="space-y-8">
      <CategoriesContainer />

      {(isLoading || !products) ? (
        <div className="px-4 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-24" />
            <div className="gap-3 hidden lg:flex">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
      ) : chunkedProducts.map((chunk, index) => (
        <div key={index} className="space-y-4">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-lg font-semibold">Products</h2>
            <div className="items-center gap-3 hidden lg:flex">
              <button id={`prev-${index}`} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button id={`next-${index}`} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <Swiper
            slidesPerView={2}
            spaceBetween={10}
            slidesPerGroup={6}
            breakpoints={{ 640: { slidesPerView: 3 }, 1024: { slidesPerView: 6 } }}
            navigation={{ nextEl: `#next-${index}`, prevEl: `#prev-${index}` }}
            freeMode={true}
            modules={[Navigation, FreeMode]}
            className="px-4"
          >
            {chunk.map((product) => {
              const images = [product.url, ...(product.imageUrls?.split(",") || [])].filter(Boolean);
              const isOwner = userId === product.createdById
              return (
                <SwiperSlide key={product.id}>
                  <div className="group relative block bg-white border rounded-lg hover:shadow">
                    <Link href={`/products/${product.id}`}>
                      <div className="relative h-44 overflow-hidden rounded-t-lg">
                        {images.length > 0 ? (
                          <>
                        <img src={images[0]} alt={product.name} className="w-full h-full object-cover group-hover:opacity-0" />
                        <ProductImageCarousel images={images} className="absolute inset-0 opacity-0 group-hover:opacity-100 h-44" />
                          </>
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                    </Link>
                    {isAuthenticated && !isOwner && (
                      <CartToggleButton
                        productId={product.id}
                        className="absolute bottom-10 lg:bottom-2 right-2 z-10"
                      />
                    )}
                    <div className="p-3 mt-2">
                      <h2 className="text-sm font-medium truncate">{product.name}</h2>
                      <p className="text-sm text-gray-500 truncate">{product.desc}</p>
                      <p className="mt-4 text-base font-semibold">
                        {product.price ? `${product.price.toLocaleString()} ₾` : "Price negotiable"}
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      ))}
    </div>
  );
}
