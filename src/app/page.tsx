import Navbar from "~/components/navbar";
import ProductList from "~/components/product-list";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="min-h-screen border max-w-[1200px] mx-auto">
        <Navbar />
        <div className="py-6">
          <ProductList />
        </div>
      </main>
    </HydrateClient>
  );
}
