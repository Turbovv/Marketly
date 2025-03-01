"use client";

import { useParams, useRouter } from "next/navigation";
import SimilarProducts from "~/components/similar-products";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import ProductImageCarousel from "~/components/image-carousel";

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

  const { data: session } = useSession();

  if (!id || isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading product: {error.message}</div>;

  const images = product ? [product.url, ...product.imageUrls] : [];
  const existingConversation = conversations?.find((conv) => conv.sellerId === product?.createdById);
  const isSeller = session?.user.id === product?.createdById;

  return (
    <div className="container mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-4">
        {product && <ProductImageCarousel images={images} />}
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-semibold text-gray-900">{product?.name}</h2>
        <p className="text-lg text-gray-600">{product?.desc}</p>

        <div className="flex items-center justify-between mt-4">
          <span className="text-3xl font-semibold text-blue-600">${product?.price}</span>
          <p className="text-gray-800 text-lg">{product?.createdBy?.name}</p>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => product && addToCartMutation.mutate({ productId: product.id, quantity: 1 })}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition w-full md:w-auto"
          >
            Add to Cart
          </button>

          {!isSeller && (
            <button
              onClick={() => {
                if (product) {
                  if (existingConversation) {
                    router.push(`/chat?conversationId=${existingConversation.id}`);
                  } else {
                    createConversation({ sellerId: product.createdById });
                  }
                }
              }}
              className="bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition w-full md:w-auto"
            >
              Contact Seller
            </button>
          )}
        </div>
      </div>

      {product?.category && (
        <div className="md:col-span-2 mt-12">
          <SimilarProducts category={product.category} productId={product.id} />
        </div>
      )}
    </div>
  );
}
