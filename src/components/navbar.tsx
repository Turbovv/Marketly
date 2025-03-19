import React from 'react'
import Link from "next/link";
import SearchBar from "~/components/search-bar";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import AuthStatus from './auth-content';

export default async function Navbar() {
    const session = await auth();
    let cartCount = 0;
    if (session?.user) {
        cartCount = await api.cart.getCartCount();
    }

    return (
        <div>
            <SearchBar />
            <div className="flex flex-col items-center gap-4">
                {session && (
                    <div className="bg-gray-800 p-4 rounded-lg">
            <Link href="/create" className="underline">
                <h1 className='text-white'>Add</h1>
            </Link>
                        <Link href="/cart" className="text-white underline">
                            <p className="text-lg font-semibold">🛒 Cart Items: {cartCount}</p>
                        </Link>
                    </div>
                )}
                <AuthStatus />
                <Link
                    href={session ? "/api/auth/signout" : "/api/auth/signin"}
                    className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                >
                    {session ? "Sign out" : "Sign in"}
                </Link>
            </div>
        </div>
    )
}
