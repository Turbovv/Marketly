import ProductList from "~/components/product-list";
import SearchBar from "~/components/search-bar";
import { HydrateClient } from "~/trpc/server";

export default function Home() {
  return (
    <HydrateClient>
      <main className="min-h-screen max-w-7xl mx-auto px-4 ">
                <div className=" py-16">
                    <div className="">
                        <SearchBar />
                    </div>
                </div>
                <div className=" py-6">
          <ProductList />
        </div>
      </main>
    </HydrateClient>
  );
}
