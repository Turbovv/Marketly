import Link from "next/link";
import ProductList from "~/components/product-list";
import SearchBar from "~/components/search-bar";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();
  let cartCount = 0;
  if (session?.user) {
    cartCount = await api.cart.getCartCount();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <SearchBar />
          <Link href="/create" className="underline">
          <h1>Add</h1>
          </Link>
          <div className="flex flex-col items-center gap-4">
            {session && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <Link href="/cart" className="text-white underline">
                <p className="text-lg font-semibold">🛒 Cart Items: {cartCount}</p>
                </Link>
              </div>
            )}
            <p className="text-center text-2xl text-white">
              {session && <span>Logged in as {session.user?.name}</span>}
            </p>
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
            >
              {session ? "Sign out" : "Sign in"}
            </Link>
          </div>
      <ProductList />
        </div>
      </main>
    </HydrateClient>
  );
}
