"use client";

import { Heart, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import { useState } from "react";

interface CartToggleButtonProps {
  productId: number;
  isInCart?: boolean;
  className?: string;
}

export default function CartToggleButton({
  productId,
  isInCart: initialIsInCart,
  className = "",
}: CartToggleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const utils = api.useContext();

  const { data: isInCart = initialIsInCart } = api.cart.isProductInCart.useQuery(
    { productId },
    { enabled: !!productId }
  );

  const { data: cartItem } = api.cart.getCart.useQuery(
    { productId },
    { enabled: !!productId && !!isInCart }
  );

  const invalidateCartQueries = () => {
    void utils.cart.getCartCount.invalidate();
    void utils.cart.isProductInCart.invalidate();
    void utils.cart.getCart.invalidate();
  };

  const addToCartMutation = api.cart.addToCart.useMutation({
    onSuccess: invalidateCartQueries,
    onSettled: () => setIsLoading(false),
  });

  const removeFromCartMutation = api.cart.removeFromCart.useMutation({
    onSuccess: invalidateCartQueries,
    onSettled: () => setIsLoading(false),
  });

  const handleCartOperation = async () => {
    try {
      setIsLoading(true);
      const item = Array.isArray(cartItem) ? cartItem[0] : cartItem;

      if (isInCart && item?.id) {
        await removeFromCartMutation.mutateAsync({ cartId: item.id });
      } else if (productId) {
        await addToCartMutation.mutateAsync({
          productId,
          quantity: 1
        });
      }
    } catch (error) {
      console.error("Failed to update cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCartOperation}
      disabled={isLoading}
      className={`
        p-1 rounded-lg transition-all duration-200
        ${isInCart ? 'bg-yellow-400' : 'bg-gray-300'}
        hover:bg-opacity-90 disabled:opacity-50
        ${className}
      `}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-white" />
      ) : (
        <Heart className={isInCart ? 'text-white fill-white' : ''} size={18} />
      )}
    </button>
  );
}