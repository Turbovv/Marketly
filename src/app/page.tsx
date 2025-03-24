import Navbar from "~/components/navbar";
import ProductList from "~/components/product-list";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
          <ProductList />
        </div>
      </main>
    </HydrateClient>
  );
}
