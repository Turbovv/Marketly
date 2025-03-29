"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { api } from "~/trpc/react";
import CategoriesContainer from "./categories";
import ProductImageCarousel from "./image-carousel";
import "swiper/css";
import "swiper/css/navigation";

export default function ProductList() {
  const { data: products } = api.products.getProducts.useQuery();

  return (
    <div className="space-y-12">
      <CategoriesContainer />

      <div className="space-y-4">
        <div className="flex justify-end items-center px-4">
          <div className="flex items-center gap-3">
            <Link href="/super-vip" className="text-sm text-gray-600 hover:underline">See All</Link>
            <button id="prev-1" className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button id="next-1" className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <Swiper
          slidesPerView={2}
          spaceBetween={10}
          breakpoints={{
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 5 },
          }}
          navigation={{ nextEl: "#next-1", prevEl: "#prev-1" }}
          modules={[Navigation]}
          className="px-4"
        >
        {products?.map((product) => {
          const images = [product.url, ...product.imageUrls?.split(",") || []];

          return (
            <SwiperSlide key={product.id}>
                <Link href={`/products/${product.id}`} className="group block bg-white border rounded-lg hover:shadow">
              <div className="relative h-44 overflow-hidden rounded-t-lg">
                <img src={images[0]} alt={product.name} className="w-full h-full object-cover group-hover:opacity-0" />
                <ProductImageCarousel images={images} className="absolute inset-0 opacity-0 group-hover:opacity-100 h-44" />
              </div>
              <div className="p-3 mt-2">
                <h2 className="text-sm font-medium truncate">{product.name}</h2>
                <p className="text-sm text-gray-500 truncate">{product.desc}</p>
                <p className="mt-4 text-base font-semibold">
                      {product.price ? `${product.price.toLocaleString()} ₾` : "Price negotiable"}
                    </p>
              </div>
              </Link>
              </SwiperSlide>
          );
        })}
        </Swiper>
      </div>
    </div>
  );
}
