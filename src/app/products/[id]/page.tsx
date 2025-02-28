"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import SimilarProducts from "~/components/similar-products";
import { api } from "~/trpc/react";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const productId = id ? Number(id) : null;

  const { data: product, isLoading, error } = api.products.getProductId.useQuery(
    { id: productId as number },
    {
      enabled: !!productId,
    }
  );

  const addToCartMutation = api.cart.addToCart.useMutation({
    onSuccess: () => {
      router.push("/cart");
    },
  });

  const { data: conversations, isLoading: isLoadingConversations } = api.chat.getConversations.useQuery(
    undefined,
    {
      enabled: !!product,
    }
  );

  const { mutate: createConversation } = api.chat.createConversation.useMutation({
    onSuccess: (conversation: { id: number; createdAt: Date; buyerId: string; sellerId: string; }[]) => {
      if (conversation && conversation[0]) {
        router.push(`/chat?conversationId=${conversation[0].id}`);
      }
    },

  });

  const [mainImage, setMainImage] = useState<string | null>(null);

  if (!id || isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading product: {error.message}</div>;

  const existingConversation = conversations?.find(
    (conv) => conv.sellerId === product?.createdById
  );

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        {product && (
          <div className="border rounded-lg overflow-hidden">
            <img
              src={mainImage || product.url}
              alt={product.name}
              className="w-full h-[400px] object-cover"
            />
          </div>
        )}

        {product && product.imageUrls.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {[product.url, ...product.imageUrls].map((image, index) => (
              <div
                key={index}
                className="border rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition"
                onClick={() => setMainImage(image)}
              >
                <img src={image} alt={`Thumbnail ${index + 1}`} className="w-24 h-24 object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <p className="text-lg text-gray-600">{product && product.desc}</p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">${product && product.price}</span>
          <p className="text-black">{product && product.createdBy?.name}</p>
          <button
            onClick={() => {
              if (product) {
                addToCartMutation.mutate({ productId: product.id, quantity: 1 });
              }
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Add to Cart
          </button>
        </div>
      </div>

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
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Contact Seller
      </button>

      {product && product.category && (
        <div className="md:col-span-2">
          <SimilarProducts category={product.category} productId={product.id} />
        </div>
      )}
    </div>
  );
}
