import Link from "next/link";
import ProductImageCarousel from "../carousel/image-carousel";
import CartToggleButton from "~/components/Cart/cart-toggle";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    desc: string;
    url: string;
    imageUrls: string | null;
    price: string;
    createdById: string;
  };
  isAuthenticated: boolean;
  userId?: string;
  isInCart?: boolean;
}

export default function ProductCard({
  product,
  isAuthenticated,
  userId,
  isInCart,
}: ProductCardProps) {
  const images = [
    product.url,
    ...(product.imageUrls ? product.imageUrls.split(",") : []),
  ].filter((img): img is string => Boolean(img));

  const isOwner = !!userId && userId === product.createdById;

  return (
    <div className="group relative block bg-white border rounded-lg hover:shadow">
      <Link href={`/products/${product.id}`}>
        <div className="relative h-44 overflow-hidden rounded-t-lg">
          {images.length > 0 ? (
            <>
              <img
                src={images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:opacity-0"
              />
              <ProductImageCarousel
                images={images}
                className="absolute inset-0 opacity-0 group-hover:opacity-100 h-44"
              />
            </>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>
      </Link>

      {isAuthenticated && !isOwner && (
        <CartToggleButton
          productId={product.id}
          isInCart={isInCart}
          className="absolute bottom-10 lg:bottom-2 right-2 z-10"
        />
      )}

      <div className="p-3 mt-2">
        <h2 className="text-sm font-medium truncate">{product.name}</h2>
        <p className="text-sm text-gray-500 truncate">{product.desc}</p>
        <p className="mt-4 text-base font-semibold">
          {product.price && product.price !== "0"
            ? `${product.price} ₾`
            : "Price negotiable"}
        </p>
      </div>
    </div>
  );
}

