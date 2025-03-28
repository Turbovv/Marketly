import Link from "next/link";
import { useAuth } from "~/hooks/useAuth";

export default function ProductInfo({ product, userProducts }: any) {
     const { jwtUser } = useAuth();
  return (
    <div className="space-y-8 bg-white p-6 rounded-lg shadow-lg border border-gray-300">
      <h2 className="text-4xl font-semibold text-gray-900">{product?.name}</h2>
      <p className="text-lg text-gray-700 mt-4">{product?.desc}</p>

      <div className="flex items-center justify-between mt-6 border-b pb-4">
        <span className="text-4xl font-bold text-green-600">${product?.price}</span>
        <div className="text-right">
          <p className="text-lg font-medium text-gray-800">{product?.createdBy?.name}</p>
          {userProducts && (
            <Link   href={`/settings/${jwtUser?.name}`} className="text-blue-500 hover:underline">
              <p className="text-sm text-gray-500 mt-1">
                {userProducts.length} Listing{userProducts.length > 1 ? "s" : ""}
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
