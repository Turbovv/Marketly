"use client";

import { useRouter } from "next/navigation";

import CartToggleButton from "~/components/Cart/cart-toggle";
import ProductImageCarousel from "~/components/Product/carousel/image-carousel";
import ProductInfo from "~/components/Product/info/product-info";
import SimilarProducts from "~/components/SimilarProducts/similar-products";
import { useAuth } from "~/hooks/useAuth";
import { api } from "~/trpc/react";
import type { ProductDetailsProps } from "~/components/Product";

export default function ProductDetails({ productId }: ProductDetailsProps) {
  const router = useRouter();
  const { userId, isAuthenticated } = useAuth();

  const {
    data: product,
    isLoading,
    error,
  } = api.products.getProductId.useQuery(
    { id: productId as number },
    { enabled: !!productId },
  );

  const { data: userProducts } = api.profile.getUserProducts.useQuery(
    { userId: product?.createdById as string },
    { enabled: !!product?.createdById },
  );

  const { data: conversations } = api.chat.getConversations.useQuery(undefined, {
    enabled: !!product,
  });

  const isOwner = userId === product?.createdById;
  const existingConversation = conversations?.find(
    (conv) => conv.sellerId === product?.createdById,
  );

  if (!productId || isLoading) {
    return <div className="py-8 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-500">
        Error loading product: {error.message}
      </div>
    );
  }

  if (!product) {
    return <div className="py-8 text-center">Product not found.</div>;
  }

  const images = [
    product.url,
    ...(product.imageUrls?.filter((url) => url !== product.url) ?? []),
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 rounded-lg bg-white p-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="relative">
            <ProductImageCarousel
              images={images}
              showThumbnails={true}
              className="aspect-[4/3]"
            />
            {!isOwner && isAuthenticated && (
              <CartToggleButton
                productId={product.id}
                className="absolute right-4 top-4"
              />
            )}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-7">
          <ProductInfo
            product={product}
            userProducts={userProducts}
            existingConversation={existingConversation}
            router={router}
          />
        </div>

        {product?.category && (
          <div className="mt-12 lg:col-span-12">
            <SimilarProducts category={product.category} productId={product.id} />
          </div>
        )}
      </div>
    </div>
  );
}