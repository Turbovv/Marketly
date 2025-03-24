"use client";
import React from 'react'
import Link from "next/link";
import SearchBar from "~/components/search-bar";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
import { api } from "~/trpc/react";
import { ShoppingCart, Plus, User, LogOut } from "lucide-react";

export default function Navbar() {
    const { jwtUser, nextAuthSession, isAuthenticated } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const { data: cartCount = 0 } = api.cart.getCartCount.useQuery(undefined, {
        enabled: isAuthenticated
    });

    const handleLogout = () => {
        if (jwtUser) {
            localStorage.removeItem("token");
            router.push("/login");
        } else if (nextAuthSession) {
            router.push("/api/auth/signout");
        }
    };
    const handleLogoClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        router.replace('/');
        router.refresh();
    };

    if (pathname === "/login" || pathname === "/register" || pathname === "/confirm") {
        return null;
    }

    return (
        <div className="sticky top-0 z-50 bg-white border-b">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link
                        href="/"
                        onClick={handleLogoClick}
                        className="text-xl font-bold text-blue-600"
                    >
                        MyMarket
                    </Link>

                    <div className="flex-1 max-w-2xl mx-8">
                        <SearchBar />
                    </div>

                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    href="/create"
                                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                                >
                                    <Plus size={20} />
                                    <span className="text-sm">Add Product</span>
                                </Link>
                                <Link
                                    href="/cart"
                                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                                >
                                    <div className="relative">
                                        <ShoppingCart size={20} />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                                {cartCount}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                                >
                                    <User size={20} />
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                                >
                                    <LogOut size={20} />
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/login"
                                    className="text-sm text-gray-700 hover:text-blue-600"
                                >
                                    Sign in
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}