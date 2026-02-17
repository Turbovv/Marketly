"use client";
import Link from "next/link";
import SearchBar from "~/components/Search/search-bar";
import { usePathname, } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
import { api } from "~/trpc/react";
import { ShoppingCart, CirclePlus, X, User, Mail, Home } from "lucide-react";
import { Dropdown } from "./dropdown";
import Sidebar from "../sidebar";
import { useState } from "react";
import { Skeleton } from "~/components/ui/skeleton";

export default function Navbar() {
    const { isAuthenticated, authUser, isLoading: authLoading } = useAuth();
    const pathname = usePathname();
    const [showSidebar, setShowSidebar] = useState(false);

    const { data: cartCount = 0, isLoading: cartLoading } = api.cart.getCartCount.useQuery(undefined, {
        enabled: isAuthenticated && !authLoading,
        retry: false,
    });
    if (["/login", "/register", "/confirm", "/forgot-password"].some((p) => pathname.startsWith(p))) {
        return null;
    }

    return (
        <>
            <div className="sticky top-0 z-50 bg-white border-b">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between h-14 px-5">
                        <Link href="/" className="text-lg font-bold text-blue-600">
                            MyMarket
                        </Link>

                        {pathname !== "/" && (
                            <div className="flex-1 max-w-2xl mx-8 hidden lg:block">
                                <SearchBar />
                            </div>
                        )}

                        <div className="hidden lg:flex items-center gap-6">
                            {authLoading ? (
                                <>
                                    <Skeleton className="w-24 h-10 rounded-xl" />
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                    <Skeleton className="w-10 h-10 rounded-xl" />
                                </>
                            ) : isAuthenticated ? (
                                <>
                                    <Link href="/create"  className="flex border py-3 px-5 bg-yellow-100 gap-2 rounded-xl items-center">
                                        <CirclePlus className="text-yellow-500" size={18} />
                                        <span className="text-xs">Add</span>
                                    </Link>

                                    <Link href="/chat" className="flex flex-col items-center gap-1">
                                        <Mail size={18} />
                                    </Link>

                                    <Link href="/cart" className="flex flex-col items-center gap-1 relative">
                                        <div className="relative">
                                            <ShoppingCart size={18} />
                                            {cartLoading ? (
                                                <Skeleton className="absolute -top-2 -right-2 w-4 h-4 rounded-full" />
                                            ) : cartCount > 0 ? (
                                                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                                    {cartCount}
                                                </span>
                                            ) : null}
                                        </div>
                                    </Link>

                                    <Dropdown />
                                </>
                            ) : (
                                <Link href="/login" className="flex flex-col items-center gap-1">
                                    <User size={18} />
                                    <span className="text-xs">Sign In</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile bottom bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t py-2 flex justify-between items-center shadow-md z-50 px-6">
                <Link href="/" className="flex flex-col items-center gap-1">
                    <Home size={18} />
                    <span className="text-xs">Home</span>
                </Link>

                <Link href="/create" className="flex flex-col items-center gap-1">
                    <CirclePlus size={18} className="text-yellow-500" />
                    <span className="text-xs">Add</span>
                </Link>

                <Link href="/cart" className="flex flex-col items-center gap-1">
                    <div className="relative">
                        <ShoppingCart size={18} />
                        {cartLoading ? (
                            <Skeleton className="absolute -top-2 -right-2 w-4 h-4 rounded-full" />
                        ) : cartCount > 0 ? (
                            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
                                {cartCount}
                            </span>
                        ) : null}
                    </div>
                    <span className="text-xs">Cart</span>
                </Link>

                {authLoading ? (
                    <Skeleton className="w-6 h-6 rounded-full" />
                ) : isAuthenticated ? (
                    <button onClick={() => setShowSidebar(true)} className="flex flex-col items-center gap-1">
                        <img src={authUser?.image || "/user-male.svg"} alt="Profile" className="w-6 h-6 rounded-full border" />
                        <span className="text-xs">Profile</span>
                    </button>
                ) : (
                    <Link href="/login" className="flex flex-col items-center gap-1">
                        <User size={18} />
                        <span className="text-xs">Sign In</span>
                    </Link>
                )}
            </div>

            {showSidebar && (
                <div className="lg:hidden fixed inset-0 bg-white z-[60] p-4 overflow-y-auto">
                    <div className="flex justify-end mb-4">
                        <button onClick={() => setShowSidebar(false)}>
                            <X size={28} />
                        </button>
                    </div>
                    <Sidebar setShowMobileSidebar={setShowSidebar} />
                </div>
            )}
        </>
    );
}