"use client";
import React from 'react'
import Link from "next/link";
import SearchBar from "~/components/search-bar";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
import { api } from "~/trpc/react";

export default function Navbar() {
    const { jwtUser, nextAuthSession, isAuthenticated } = useAuth();
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

    return (
        <div>
            <SearchBar />
            <div className="flex flex-col items-center gap-4">
                {isAuthenticated && (
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <Link href="/create" className="underline">
                            <h1 className='text-white'>Add</h1>
                        </Link>
                        <Link href="/cart" className="text-white underline">
                            <p className="text-lg font-semibold">🛒 Cart Items: {cartCount}</p>
                        </Link>
                        <Link href="/dashboard" className="text-white underline">
                            <p className="text-lg font-semibold">Dashboard</p>
                        </Link>
                    </div>
                )}
                
                <div className="text-center text-lg">
                    {jwtUser && <span>Welcome, {jwtUser.name}!</span>}
                    {nextAuthSession?.user && <span>Welcome, {nextAuthSession.user.name}!</span>}
                </div>

                <button
                    onClick={handleLogout}
                    className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                >
                    {isAuthenticated ? "Sign out" : "Sign in"}
                </button>
            </div>
        </div>
    );
}