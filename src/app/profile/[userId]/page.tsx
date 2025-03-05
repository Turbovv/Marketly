"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";

export default function UserProfilePage() {
  const { userId } = useParams();

  if (!userId) return <div>Invalid user ID</div>;

  const { data: user, isLoading: userLoading } = api.profile.getUserProfile.useQuery({
    userId: userId as string,
  });
  const { data: products, isLoading: productsLoading } = api.profile.getUserProducts.useQuery({
    userId: userId as string,
  });

  if (userLoading) return <div>Loading user...</div>;
  if (!user) return <div>User not found</div>;
  if (!products || products.length === 0) return <p>No products found.</p>;

  return (
    <div className="container mx-auto max-w-7xl mt-10 px-4">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
          {/* <span className="text-xl font-bold">{user.name}</span> */}
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">{user.name}</h1>
        </div>
      </div>

          <p className="text-lg text-gray-600 mb-6">{products.length} Listing</p>
     
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product: any) => (
          <div key={product.id} className="bg-white border rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:scale-105">
            <Link href={`/products/${product.id}`} className="block">
              <img
                src={product.url}
                alt={product.name}
                className="w-full h-64 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
                <p className="mt-2 text-xl font-bold text-green-600">${product.price}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
