"use client";

import { useParams, useRouter } from "next/navigation";
import { Heart } from "lucide-react";

import SimilarProducts from "~/components/similar-products";
import ProductImageCarousel from "~/components/image-carousel";
import ProductInfo from "~/components/Product/product-info";
import CartToggleButton from "~/components/cart-toggle";

import { api } from "~/trpc/react";
import { useAuth } from "~/hooks/useAuth";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { userId, isAuthenticated } = useAuth();
  const productId = id ? Number(id) : null;

  const { 
    data: product, 
    isLoading, 
    error 
  } = api.products.getProductId.useQuery(
    { id: productId as number },
    { enabled: !!productId }
  );

  const { data: userProducts } = api.profile.getUserProducts.useQuery(
    { userId: product?.createdById as string },
    { enabled: !!product?.createdById }
  );

  const { data: conversations } = api.chat.getConversations.useQuery(
    undefined,
    { enabled: !!product }
  );

  const isOwner = userId === product?.createdById;
  const existingConversation = conversations?.find(
    (conv) => conv.sellerId === product?.createdById
  );

  if (!id || isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading product: {error.message}
      </div>
    );
  }

  const images = product ? [
    product.url,
    ...(product.imageUrls?.filter(url => url !== product.url) ?? []),
  ] : [];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 rounded-lg shadow-lg">
        <div className="lg:col-span-5">
          {product && (
            <div className="relative">
              <ProductImageCarousel 
                images={images} 
                showThumbnails={true} 
                className="aspect-[4/3]" 
              />
              {!isOwner && isAuthenticated && (
                <CartToggleButton
                  productId={product.id}
                  className="absolute top-4 right-4"
                />
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-6">
          <ProductInfo
            product={product}
            userProducts={userProducts}
            existingConversation={existingConversation}
            router={router}
          />
        </div>

        {product?.category && (
          <div className="lg:col-span-12 mt-12">
            <SimilarProducts 
              category={product.category} 
              productId={product.id} 
            />
          </div>
        )}
      </div>
    </div>
  );
}