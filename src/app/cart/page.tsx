"use client";

import { api } from "~/trpc/react";

export default function CartPage() {
  const utils = api.useContext();
  const { data: cartItems, isLoading, error, refetch } = api.cart.getCart.useQuery();
  const removeCart = api.cart.removeFromCart.useMutation({
    onSuccess: () => {
      refetch();
      void utils.cart.getCartCount.invalidate();
    },
  });

  if (isLoading) return <div className="text-center text-gray-500">Loading...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-screen-lg">
      <h1 className="text-3xl font-semibold mb-8 text-center text-gray-800">Your Cart</h1>

      {!cartItems || cartItems.length === 0 ? (
        <p className="text-gray-500 text-center">Your cart is empty.</p>
      ) : (
        <div className="space-y-8">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-white shadow-lg rounded-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-6">
                <img
                  src={item.url}
                  alt={item.price}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-xl font-semibold">{item.product?.name}</p>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                  <p className="text-sm text-gray-500 mt-2">{item.quantity} x ${item.price}</p>
                </div>
              </div>
              <button
                onClick={() => removeCart.mutate({ cartId: item.id })}
                className="bg-red-500 text-white text-sm py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {cartItems && cartItems.length > 0 && (
        <div className="mt-12 text-center">
          <button className="bg-blue-600 text-white py-3 px-6 rounded-lg text-xl hover:bg-blue-700 transition-colors">
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}
