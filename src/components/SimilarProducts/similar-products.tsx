"use client";

import Link from "next/link";
import { ClipLoader } from "react-spinners";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "~/trpc/react";
import ProductImageCarousel from "../Product/image-carousel";
import "swiper/css";
import "swiper/css/navigation";

type SimilarProductsProps = {
    category: string;
    productId: number;
  };
  
export default function SimilarProducts({ category, productId }: SimilarProductsProps) {
  const { data: similarProducts, isLoading } = api.products.similarProducts.useQuery({ category, productId });

  if (isLoading) return <p><ClipLoader /></p>;
  if (!similarProducts || similarProducts.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-4">
      <h2 className="text-lg font-semibold">Similar Products</h2>
      <div className=" items-center gap-3  hidden lg:flex">
          <button id="prev-similar" className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button id="next-similar" className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
            <ChevronRight className="w-5 h-5" />
          </button>
          </div>
      </div>

      <Swiper
        slidesPerView={2}
        spaceBetween={10}
        slidesPerGroup={2}
        breakpoints={{
          640: { slidesPerView: 4, slidesPerGroup: 3 },
          1024: { slidesPerView: 6, slidesPerGroup: 6 },
        }}
        navigation={{ nextEl: "#next-similar", prevEl: "#prev-similar" }}
        freeMode={true}
        modules={[Navigation, FreeMode]}
        className="px-4"
      >
        {similarProducts.map((product) => {
          const images = [product.url, ...(product.imageUrls?.split(",") || [])];

          return (
            <SwiperSlide key={product.id}>
              <Link href={`/products/${product.id}`} className="group block bg-white border rounded-lg hover:shadow">
                <div className="relative h-44 overflow-hidden rounded-t-lg">
                  <img
                    src={images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:opacity-0"
                  />
                  <ProductImageCarousel
                    images={images}
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 h-44"
                  />
                </div>
                <div className="p-3 mt-2">
                  <h3 className="text-sm font-medium truncate">{product.name}</h3>
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
  );
}
