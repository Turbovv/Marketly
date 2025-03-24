"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname === '/search') {
      const urlQuery = searchParams.get('query');
      if (urlQuery) {
        setQuery(urlQuery);
      }
    } else {
      setQuery("");
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    if (isFocused) {
      const savedSearches = localStorage.getItem("recentSearches");
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    }
  }, [isFocused]);

  const handleSearch = () => {
    if (query.trim() !== "") {
      const newRecentSearches = [query, ...recentSearches.filter((item) => item !== query)].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches));
      router.push(`/search?query=${query}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleRecentSearchClick = (term: string) => {
    setQuery(term);
    router.push(`/search?query=${term}`);
    setIsFocused(false);
  };

  const handleDeleteSearch = (term: string) => {
    const updatedSearches = recentSearches.filter((search) => search !== term);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  return (
    <div className="relative w-full">
      <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search for products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setTimeout(() => setIsFocused(false), 150);
        }}
        onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <Search 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
          size={18}
        />
      </div>

      {isFocused && recentSearches.length > 0 && (
        <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-50">
          <div className="p-2">
          <p className="text-xs text-gray-500 mb-2">Recent Searches</p>
            {recentSearches.map((term, idx) => (
              <div 
                key={idx} 
                onClick={() => handleRecentSearchClick(term)}
                className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
              >
                <span
                  className="text-sm text-gray-700"
                >
                  {term}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSearch(term);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
