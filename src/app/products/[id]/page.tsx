"use client";

import { useParams, useRouter } from "next/navigation";
import SimilarProducts from "~/components/similar-products";
import { api } from "~/trpc/react";
import ProductImageCarousel from "~/components/image-carousel";
import ProductActions from "~/components/Product/product-actions";
import ProductInfo from "~/components/Product/product-info";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const productId = id ? Number(id) : null;

  const { data: product, isLoading, error } = api.products.getProductId.useQuery(
    { id: productId as number },
    { enabled: !!productId }
  );

  const addToCartMutation = api.cart.addToCart.useMutation({
    onSuccess: () => {
      router.push("/cart");
    },
  });

  const { data: conversations } = api.chat.getConversations.useQuery(undefined, {
    enabled: !!product,
  });

  const { mutate: createConversation } = api.chat.createConversation.useMutation({
    onSuccess: (conversation) => {
      if (conversation) {
        router.push(`/chat?conversationId=${conversation.id}`);
      }
    },
  });

  const { data: userProducts } = api.profile.getUserProducts.useQuery({
    userId: product?.createdById as string,
  });


  if (!id || isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading product: {error.message}</div>;

  const images = product ? [
    product.url,
    ...(product.imageUrls ? product.imageUrls.filter(url => url !== product.url) : [])
  ] : [];
  const existingConversation = conversations?.find((conv) => conv.sellerId === product?.createdById);

  return (
    <div className="container mx-auto p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-10">
     <div className="space-y-4">
        {product && (
          images.length > 1 ? (
            <ProductImageCarousel images={images} showThumbnails={true} />
          ) : (
            <div className="w-full aspect-[4/3] overflow-hidden rounded-lg">
            <img 
              src={images[0]} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            </div>
          )
        )}
      </div>
      <ProductInfo product={product} userProducts={userProducts} />
      <ProductActions
        product={product}
        addToCartMutation={addToCartMutation}
        existingConversation={existingConversation}
        createConversation={createConversation}
        router={router}
      />

      {product?.category && (
        <div className="md:col-span-2 mt-12">
          <SimilarProducts category={product.category} productId={product.id} />
        </div>
      )}
    </div>
  );
}
