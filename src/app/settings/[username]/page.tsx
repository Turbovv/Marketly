"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import SortDropdown from "~/components/Search/sort-dropdown";
import { sortProducts } from "~/utils/sortProducts";
import CartToggleButton from "~/components/Cart/cart-toggle";
import { useAuth } from "~/hooks/useAuth";
import Sidebar from "~/components/sidebar";

export default function UserSettingsPage() {
  const params = useParams();
  const [sortOption, setSortOption] = useState("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { authUser, isAuthenticated } = useAuth();
  const decodedUsername = useMemo(() => {
    if (!params?.username) return "";
    return decodeURIComponent(params.username as string);
  }, [params]);

  const { data: userProfile, isLoading: userLoading } = api.profile.getUserProfile.useQuery(
    { username: decodedUsername },
    { enabled: !!decodedUsername }
  );

  const { data: products, isLoading: productsLoading } = api.profile.getUserProducts.useQuery(
    { userId: userProfile?.id as string },
    { enabled: !!userProfile?.id }
  );

  if (userLoading) return <div>Loading profile...</div>;
  if (!userProfile) return <div className="flex h-screen items-center justify-center text-red-500">User not found</div>;

  const sortedProducts = sortProducts(products || [], sortOption);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 py-16">
        <div className="hidden lg:block">
          {isAuthenticated && authUser && (
            <Sidebar setShowMobileSidebar={setShowMobileSidebar} />
          )}
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 space-y-6 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between">
              {authUser?.id === userProfile.id ? "My ads" : `${userProfile.name || userProfile.username || userProfile.email}'s Profile`}
              <SortDropdown sortOption={sortOption} setSortOption={setSortOption} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {productsLoading ? (
                <p>Loading products...</p>
              ) : products && products.length > 0 ? (
                sortedProducts.map((product) => (
                  <div key={product.id} className="relative">
                    <Link
                      href={`/products/${product.id}`}
                      className="bg-white rounded-lg hover:shadow transition-shadow duration-200 group border border-gray-100 block"
                    >
                      <div className="relative h-44 overflow-hidden rounded-t-lg">
                        <img
                          src={product.url || "/placeholder.png"}
                          alt={product.name}
                          className="w-full h-full p-4 object-cover rounded-3xl group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="p-3 mt-2 break-words">
                        <h2 className="text-sm font-medium">{product.name}</h2>
                        <p className="text-sm text-gray-500 w-full">{product.desc}</p>
                        <hr />
                        <div className="mt-4">
                          <p className="text-base font-semibold text-gray-900">${product.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </Link>
                    {isAuthenticated && authUser?.id !== product.createdById && (
                      <CartToggleButton
                        productId={product.id}
                        className="absolute bottom-10 lg:bottom-2 right-2 z-10"
                      />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No products found.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
