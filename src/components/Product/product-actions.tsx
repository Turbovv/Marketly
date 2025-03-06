import DeleteProductButton from "./delete-product";

export default function ProductActions({
  isSeller,
  product,
  addToCartMutation,
  existingConversation,
  createConversation,
  router,
}: any) {
  return (
    <div className="flex gap-6 mt-6">
      <div className="w-full flex flex-col gap-4">
        {isSeller && product && <DeleteProductButton productId={product.id} />}
        {!isSeller && (
          <>
            <button
              onClick={() => product && addToCartMutation.mutate({ productId: product.id, quantity: 1 })}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition ease-in-out duration-200 w-full"
            >
              Add to Cart
            </button>
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
              className="bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition ease-in-out duration-200 w-full"
            >
              Contact Seller
            </button>
          </>
        )}
      </div>
    </div>
  );
}
