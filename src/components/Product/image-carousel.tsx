"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import { cn } from "~/lib/utils";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";

interface ProductImageCarouselProps {
  images: string[];
  className?: string;
  showThumbnails?: boolean;
}

export default function ProductImageCarousel({
  images,
  className,
  showThumbnails = false
}: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length <= 1) {
    return (
      <img
        src={images[0]}
        alt="Product"
        className={cn("w-full object-cover", className)}
      />
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative w-full h-full aspect-[4/3]">
        <img
          src={images[currentIndex]}
          alt="Product"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 hover:bg-white transition-colors z-10"
          >
            <ChevronLeft className="w-4 h-4 text-gray-800" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 hover:bg-white transition-colors z-10"
          >
            <ChevronRight className="w-4 h-4 text-gray-800" />
          </button>
        </div>
      </div>

      {showThumbnails && (
        <Swiper
          slidesPerView={4}
          spaceBetween={10}
          freeMode={true}
          navigation={true}
          modules={[FreeMode, Navigation]}
          className="mt-4"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className={cn(
                  "w-full h-20 object-cover rounded-md cursor-pointer",
                  currentIndex === index && "border-2 border-blue-600"
                )}
                onClick={() => setCurrentIndex(index)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};
