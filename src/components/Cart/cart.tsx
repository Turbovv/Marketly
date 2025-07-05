"use client";

import { api } from "~/trpc/react";
import Link from "next/link";
import CartToggleButton from "~/components/Cart/cart-toggle";

export default function Cart() {
  const { data: cartItems, isLoading, error, } = api.cart.getCart.useQuery();


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
            {cartItems.map((item: any) => (
              <div
                key={item.id}
                className="group relative bg-white border rounded-lg hover:shadow-lg transition-shadow duration-200"
              >
                <Link
                  href={`/products/${item.productId}`}
                  className="block"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                    <img
                      src={item.url}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col min-h-[120px]">
                    <div className="flex-grow">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2">
                        {item.product?.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-1 mt-1">
                        {item.desc}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm sm:text-base font-semibold text-gray-900">
                        ${item.price}
                      </div>
                    </div>
                  </div>
                </Link>
                <CartToggleButton
                  productId={item.productId}
                  isInCart={true}
                  className="absolute bottom-2 right-2 z-10"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
