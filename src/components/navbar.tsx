import React from 'react'
import Link from "next/link";
import SearchBar from "~/components/search-bar";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
export default async function Navbar() {
    const session = await auth();
    let cartCount = 0;
    if (session?.user) {
        cartCount = await api.cart.getCartCount();
    }

    return (
        <div>
            <SearchBar />
            <Link href="/create" className="underline">
            </Link>
            <div className="flex flex-col items-center gap-4">
                {session && (
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h1 className='text-white'>Add</h1>
                        <Link href="/cart" className="text-white underline">
                            <p className="text-lg font-semibold">🛒 Cart Items: {cartCount}</p>
                        </Link>
                    </div>
                )}
                <p className="text-center text-2xl text-black">
                    {session && <span>Logged in as {session.user?.name}</span>}
                </p>
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
