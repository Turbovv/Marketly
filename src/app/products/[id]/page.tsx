"use client";

import { useParams, useRouter } from "next/navigation";
import SimilarProducts from "~/components/similar-products";
import { api } from "~/trpc/react";
import ProductImageCarousel from "~/components/image-carousel";
import ProductInfo from "~/components/Product/product-info";
import { Heart } from "lucide-react";
import { useAuth } from "~/hooks/useAuth";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const productId = id ? Number(id) : null;
  const utils = api.useContext();
  const { userId, isAuthenticated } = useAuth();
  const { data: product, isLoading, error } = api.products.getProductId.useQuery(
    { id: productId as number },
    { enabled: !!productId }
  );
  const isOwner = userId === product?.createdById;

  const addToCartMutation = api.cart.addToCart.useMutation({
    onSuccess: () => {
      void utils.cart.getCartCount.invalidate();
    },
  });
  const { data: conversations } = api.chat.getConversations.useQuery(undefined, {
    enabled: !!product,
  });

  const { data: userProducts } = api.profile.getUserProducts.useQuery({
    userId: product?.createdById as string,
  });
  const { data: isInCart } = api.cart.isProductInCart.useQuery(
    { productId: productId as number },
    { enabled: !!productId }
);

  if (!id || isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading product: {error.message}</div>;

  const images = product ? [
    product.url,
    ...(product.imageUrls ? product.imageUrls.filter((url) => url !== product.url) : []),
  ] : [];
  const existingConversation = conversations?.find((conv) => conv.sellerId === product?.createdById);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 rounded-lg shadow-lg">
     <div className="lg:col-span-5">
        {product && (
            <div className="relative">
            <ProductImageCarousel images={images} showThumbnails={true} className="aspect-[4/3]" />
              {!isOwner && isAuthenticated && (
                <button
                  onClick={() => {
                    if (isInCart) {
                      alert("This product is already in your cart!");
                      return;
                    }
                    addToCartMutation.mutate({ productId: product.id, quantity: 1 });
                  }}
                  className={`absolute top-4 right-4 bg-gray-300 px-2 py-2 rounded-full hover:bg-opacity-90 transition`}
                >
                  <Heart  />
                </button>
              )}
            </div>
        )}
      </div>
      <div className="lg:col-span-7 space-y-6">
      <ProductInfo
        product={product}
        userProducts={userProducts}
        existingConversation={existingConversation}
        addToCartMutation={addToCartMutation}
        router={router}
      />
        </div>

      {product?.category && (
        <div className="lg:col-span-12 mt-12">
          <SimilarProducts category={product.category} productId={product.id} />
        </div>
      )}
      </div>
    </div>
  );
}
