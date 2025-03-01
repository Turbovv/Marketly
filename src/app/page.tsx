import Navbar from "~/components/navbar";
import ProductList from "~/components/product-list";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
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
