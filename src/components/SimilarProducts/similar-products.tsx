"use client";

import { ClipLoader } from "react-spinners";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "~/trpc/react";
import ProductCard from "../Product/product-card";
import { useAuth } from "~/hooks/useAuth";
import "swiper/css";
import "swiper/css/navigation";

type SimilarProductsProps = {
  category: string;
  productId: number;
};

export default function SimilarProducts({ category, productId }: SimilarProductsProps) {
  const { data: similarProducts, isLoading } = api.products.similarProducts.useQuery({ category, productId });
  const { isAuthenticated, userId } = useAuth();

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
        {similarProducts.map((product) => (
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
  );
}
