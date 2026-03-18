"use client";

import { api } from "~/trpc/react";
import Link from "next/link";
import { useAuth } from "~/hooks/useAuth";
import ProductCard from "~/components/Product/product-card";

export default function Cart() {
  const { data: cartItems, isLoading, error } = api.cart.getCart.useQuery();
  const { isAuthenticated, userId } = useAuth();

  if (isLoading) return <div className="text-center text-gray-500">Loading...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6   lg:py-8 min-h-screen">
      <h1 className="text-xl sm:text-2xl font-semibold mb-4  text-gray-800 ">
        Your Cart
      </h1>

      {!cartItems || cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 mt-8">
          <p className="text-gray-500 text-center text-lg">Your cart is empty.</p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 
            max-w-md sm:max-w-2xl lg:max-w-none mx-auto">
            {cartItems.map((item) =>
              item.product ? (
                <ProductCard
                  key={item.id}
                  product={item.product}
                  isAuthenticated={isAuthenticated}
                  userId={userId}
                  isInCart
                />
              ) : null,
            )}
          </div>
        </div>
      )}
    </div>
  );
}
