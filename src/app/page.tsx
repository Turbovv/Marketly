import Navbar from "~/components/navbar";
import ProductList from "~/components/product-list";
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
      <main className="flex  justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
         <Navbar />
      <ProductList />
        </div>
      </main>
    </HydrateClient>
  );
}
