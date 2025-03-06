"use client";

import { useParams, useRouter } from "next/navigation";
import SimilarProducts from "~/components/similar-products";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
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
    onSuccess: (conversation: { id: number }[]) => {
      if (conversation && conversation[0]) {
        router.push(`/chat?conversationId=${conversation[0].id}`);
      }
    },
  });

  const { data: userProducts } = api.profile.getUserProducts.useQuery({
    userId: product?.createdById as string,
  });

  const { data: session } = useSession();

  if (!id || isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading product: {error.message}</div>;

  const images = product ? [product.url, ...product.imageUrls] : [];
  const existingConversation = conversations?.find((conv) => conv.sellerId === product?.createdById);
  const isSeller = session?.user.id === product?.createdById;

  return (
    <div className="container mx-auto p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="space-y-4">
        {product && <ProductImageCarousel images={images} />}
      </div>
      <ProductInfo product={product} userProducts={userProducts} />
      <ProductActions
        isSeller={isSeller}
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
