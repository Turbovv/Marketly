"use client"
import { User, ShoppingCart, CirclePlus, MessageSquare } from "lucide-react";
import Link from "next/link";
import LogOutButton from "~/components/log-out";
import { useAuth } from "~/hooks/useAuth";

export default function Sidebar() {
  const { authUser } = useAuth();

  return (
    <aside className="w-64 min-h-screen shadow-md rounded-lg p-6 space-y-8">
      <div className="flex items-center gap-4 border-b pb-4">
        <img
          src={authUser?.image ?? "/user-male.svg"}
          alt="Profile"
          className="w-16 h-16 rounded-full border border-gray-300"
        />
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-gray-900">{authUser?.name}</h1>
          <p className="text-sm text-blue-600 truncate max-w-[150px]">{authUser?.email}</p>
        </div>
      </div>

      <ul className="space-y-4 text-gray-700">
        <Link href={`/settings/${authUser?.name}`} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
          <User className="w-5 h-5 text-gray-500" />
          <span className="text-sm">My Products</span>
        </Link>

        <Link href={"/create"} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
          <CirclePlus className="w-5 h-5 text-gray-500" />
          <span className="text-sm">Add an advertisement</span>
        </Link>

        <Link href={"/cart"} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
          <ShoppingCart className="w-5 h-5 text-gray-500" />
          <span className="text-sm">My Cart</span>
        </Link>

        <Link href={"/chat"} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
          <MessageSquare className="w-5 h-5 text-gray-500" />
          <span className="text-sm">Messages</span>
        </Link>
      </ul>

      <div className="mt-6 border-t pt-4">
        <LogOutButton />
      </div>
    </aside>
  );
}
