"use client";
import Link from "next/link";
import SearchBar from "~/components/search-bar";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
import { api } from "~/trpc/react";
import { ShoppingCart, Plus, X, User } from "lucide-react";
import { Dropdown } from "./dropdown";
import Sidebar from "./sidebar";
import { useState } from "react";

export default function Navbar() {
    const {isAuthenticated, authUser } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [showSidebar, setShowSidebar] = useState(false);
    const { data: cartCount = 0 } = api.cart.getCartCount.useQuery(undefined, {
        enabled: isAuthenticated
    });
    const navigate = (path: string) => {
      if (!isAuthenticated && (path === "/create" || path === "/cart")) {
        router.push("/login");
      } else {
        router.push(path);
        setShowSidebar(false);
      }
    };
    if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/confirm")) {
        return null;
    }

    return (
    <>
        <div className="sticky top-0 z-50 bg-white border-b">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link
                        href="/"
                        onClick={(e) => { e.preventDefault(); navigate("/"); }}
                        className="text-xl font-bold text-blue-600"
                    >
                        MyMarket
                    </Link>

                    {!pathname.startsWith("/") && (
                    <div className="flex-1 max-w-2xl mx-8 hidden lg:block">
                        <SearchBar />
                    </div>
                    )}

                    <div className="hidden lg:flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <button onClick={() => navigate("/create")} className="flex items-center gap-1">
                                    <Plus size={20} />
                                    <span className="text-sm">Add Product</span>
                                </button>
                  <button onClick={() => navigate("/cart")} className="relative">
                                        <ShoppingCart size={20} />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                                {cartCount}
                                            </span>
                                        )}
                                    </button>
                               <Dropdown />
                            </>
                        ) : (
                <button onClick={() => navigate("/login")}>Sign In</button>
                        )}
                    </div>
                </div>
            </div>
        </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center shadow-md z-50">
        <button onClick={() => navigate("/")}>
          <span className="text-sm text-blue-600">Home</span>
        </button>
        <button onClick={() => navigate("/create")}>
          <Plus size={20} />
        </button>
        <button onClick={() => navigate("/cart")} className="relative">
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
        {isAuthenticated ? (
          <button onClick={() => setShowSidebar(true)}>
            <img src={authUser?.image || "/user-male.svg"} alt="Profile" className="w-8 h-8 rounded-full border" />
          </button>
        ) : (
          <button onClick={() => navigate("/login")} className="flex items-center gap-2">
            <User size={20} />
            <span className="text-sm">Sign In</span>
          </button>
        )}
      </div>

      {showSidebar && (
        <div className="lg:hidden fixed inset-0 bg-white z-[60] p-4 overflow-y-auto">
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowSidebar(false)}>
              <X size={28} />
            </button>
          </div>
          <Sidebar setShowMobileSidebar={setShowSidebar} />
        </div>
      )}
    </>
    );
}