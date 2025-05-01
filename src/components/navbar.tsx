"use client";
import Link from "next/link";
import SearchBar from "~/components/search-bar";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
import { api } from "~/trpc/react";
import { ShoppingCart, CirclePlus, X, User, Mail, Home } from "lucide-react";
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
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between h-14 px-5">
                    <Link
                        href="/"
                        onClick={(e) => { e.preventDefault(); navigate("/"); }}
                        className="text-lg font-bold text-blue-600"
                    >
                        MyMarket
                    </Link>

                    {pathname !== "/" && (
                    <div className="flex-1 max-w-2xl mx-8 hidden lg:block">
                        <SearchBar />
                    </div>
                    )}

                    <div className="hidden lg:flex items-center gap-6">
                        {isAuthenticated ? (
                            <>
                                <button 
                                    onClick={() => navigate("/create")} 
                                    className="flex border py-3 px-5 bg-yellow-100 gap-2 rounded-xl items-center"
                                >
                                    <CirclePlus className="text-yellow-500" size={18} />
                                    <span className="text-xs">Add</span>
                                </button>
                                <button 
                                    onClick={() => navigate("/chat")} 
                                    className="flex flex-col items-center gap-1"
                                >
                                    <Mail size={18} />
                                </button>
                                <button 
                                    onClick={() => navigate("/cart")} 
                                    className="flex flex-col items-center gap-1 relative"
                                >
                                    <div className="relative">
                                        <ShoppingCart size={18} />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                                {cartCount}
                                            </span>
                                        )}
                                    </div>
                                </button>
                                <Dropdown />
                            </>
                        ) : (
                            <button 
                                onClick={() => navigate("/login")}
                                className="flex flex-col items-center gap-1"
                            >
                                <User size={18} />
                                <span className="text-xs">Sign In</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t py-2 flex justify-between items-center shadow-md z-50 px-6">
            <button 
                onClick={() => navigate("/")}
                className="flex flex-col items-center gap-1"
            >
                <Home size={18} />
                <span className="text-xs">Home</span>
            </button>
            
            <button 
                onClick={() => navigate("/create")}
                className="flex flex-col items-center gap-1"
            >
                <CirclePlus size={18} className="text-yellow-500" />
                <span className="text-xs">Add</span>
            </button>
            
            <button 
                onClick={() => navigate("/cart")} 
                className="flex flex-col items-center gap-1"
            >
                <div className="relative">
                    <ShoppingCart size={18} />
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
                            {cartCount}
                        </span>
                    )}
                </div>
                <span className="text-xs">Cart</span>
            </button>
            
            {isAuthenticated ? (
                <button 
                    onClick={() => setShowSidebar(true)}
                    className="flex flex-col items-center gap-1"
                >
                    <img 
                        src={authUser?.image || "/user-male.svg"} 
                        alt="Profile" 
                        className="w-6 h-6 rounded-full border"
                    />
                    <span className="text-xs">Profile</span>
                </button>
            ) : (
                <button 
                    onClick={() => navigate("/login")}
                    className="flex flex-col items-center gap-1"
                >
                    <User size={18} />
                    <span className="text-xs">Sign In</span>
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