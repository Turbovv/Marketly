"use client";

import { usePathname } from "next/navigation";
import { User, ShoppingCart, CirclePlus, MessageSquare, Mail } from "lucide-react";
import Link from "next/link";
import LogOutButton from "~/components/log-out";
import { useAuth } from "~/hooks/useAuth";

export default function Sidebar({ setShowMobileSidebar }: { setShowMobileSidebar: (state: boolean) => void }) {
  const { authUser } = useAuth();
  const pathname = usePathname();

  return (
    <>
      <aside className="w-full px-2 lg:hidden">
        <div className="flex flex-wrap gap-4">
          <img
            src={authUser?.image ?? "/user-male.svg"}
            alt="Profile"
            className="w-10 h-10 rounded-full border border-gray-300 mb-2"
          />
          <div>
            <h1 className="text-base font-semibold text-gray-900">{authUser?.name}</h1>
            <p className="text-sm text-blue-600 truncate">{authUser?.email}</p>
          </div>
        </div>

        <ul className="mt-6">
          <li>
            <Link
              href={`/settings/${authUser?.name}`}
              className={`flex items-center gap-3 p-3 rounded-md ${pathname === `/settings/${authUser?.name}` ? "text-yellow-400 font-bold" : ""}`}
              onClick={() => setShowMobileSidebar(false)}
            >
              <User className={`w-5 h-5 ${pathname === `/settings/${authUser?.name}` ? "text-yellow-400 font-bold" : "text-gray-500"}`} />
              <span className="text-sm">My Products</span>
            </Link>
          </li>
          <li>
            <Link
              href="/create"
              className={`flex items-center gap-3 p-3 rounded-md ${pathname === "/create" ? "text-yellow-400 font-bold" : ""}`}
              onClick={() => setShowMobileSidebar(false)}
            >
              <CirclePlus className={`w-5 h-5 ${pathname === "/create" ? "text-yellow-400 font-bold" : "text-gray-500"}`} />
              <span className="text-sm">Add an advertisement</span>
            </Link>
          </li>
          <li>
            <Link
              href="/cart"
              className={`flex items-center gap-3 p-3 rounded-md ${pathname === "/cart" ? "text-yellow-400 font-bold" : ""}`}
              onClick={() => setShowMobileSidebar(false)}
            >
              <ShoppingCart className={`w-5 h-5 ${pathname === "/cart" ? "text-yellow-400 font-bold" : "text-gray-500"}`} />
              <span className="text-sm">My Cart</span>
            </Link>
          </li>
          <li>
            <Link
              href="/chat"
              className={`flex items-center gap-3 p-3 rounded-md ${pathname === "/chat" ? "text-yellow-400 font-bold" : ""}`}
              onClick={() => setShowMobileSidebar(false)}
            >
              <Mail className={`w-5 h-5 ${pathname === "/chat" ? "text-yellow-400 font-bold" : "text-gray-500"}`} />
              <span className="text-sm">Messages</span>
            </Link>
          </li>
        </ul>

        <div className="py-2 border-t px-3">
          <LogOutButton />
        </div>
      </aside>

      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:min-h-screen lg:border-r lg:p-6 lg:space-y-6">
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
          <li>
            <Link
              href={`/settings/${authUser?.name}`}
              className={`flex items-center gap-3 p-2 rounded-md ${pathname === `/settings/${authUser?.name}` ? "text-yellow-400 font-bold" : ""}`}
              onClick={() => setShowMobileSidebar(false)}
            >
              <User className={`w-5 h-5 ${pathname === `/settings/${authUser?.name}` ? "text-yellow-400 font-bold" : "text-gray-500"}`} />
          <span className="text-sm">My Products</span>
        </Link>
          </li>
          <li>
            <Link
              href="/create"
              className={`flex items-center gap-3 p-2 rounded-md ${pathname === "/create" ? "text-yellow-400 font-bold" : ""}`}
              onClick={() => setShowMobileSidebar(false)}
            >
          <CirclePlus className={`w-5 h-5 ${pathname === "/create" ? "text-yellow-400 font-bold" : "text-gray-500"}`} />
          <span className="text-sm">Add an advertisement</span>
        </Link>
          </li>
          <li>
            <Link
              href="/cart"
              className={`flex items-center gap-3 p-2 rounded-md ${pathname === "/cart" ? "text-yellow-400 font-bold" : ""}`}
              onClick={() => setShowMobileSidebar(false)}
            >
          <ShoppingCart className={`w-5 h-5 ${pathname === "/cart" ? "text-yellow-400 font-bold" : "text-gray-500"}`} />
          <span className="text-sm">My Cart</span>
        </Link>
          </li>
          <li>
            <Link
              href="/chat"
              className={`flex items-center gap-3 p-2 rounded-md ${pathname === "/chat" ? "text-yellow-400 font-bold" : ""}`}
              onClick={() => setShowMobileSidebar(false)}
            >
          <MessageSquare className={`w-5 h-5 ${pathname === "/chat" ? "text-yellow-400 font-bold" : "text-gray-500"}`} />
          <span className="text-sm">Messages</span>
        </Link>
          </li>
      <div className="py-2 border-t px-3">
        <LogOutButton />
      </div>
      </ul>

    </aside>
    </>
  );
}
