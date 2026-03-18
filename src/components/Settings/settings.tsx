"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import SortDropdown from "~/components/Search/sort-dropdown";
import { sortProducts } from "~/utils/sortProducts";
import { useAuth } from "~/hooks/useAuth";
import Sidebar from "~/components/sidebar";
import ProductCard from "~/components/Product/product-card";

export default function UserSettings() {
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
                  <ProductCard
                    key={product.id}
                    product={product}
                    isAuthenticated={isAuthenticated}
                    userId={authUser?.id}
                  />
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
