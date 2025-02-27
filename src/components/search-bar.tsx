"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

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
    <div className="w-full max-w-lg mx-auto">
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
        className="w-full p-2 border rounded text-black"
      />
      <button
        onClick={handleSearch}
        className="mt-2 w-full bg-blue-600 text-white py-2 rounded"
      >
        Search
      </button>

      {isFocused && (
        <div className="mt-4">
          <p className="font-semibold">Recent Searches:</p>
          <div className="grid">
            {recentSearches.map((term, idx) => (
              <div key={idx} className="flex items-center space-y-2">
                <span
                  onClick={() => handleRecentSearchClick(term)}
                  className="cursor-pointer text-blue-600 underline w-full"
                >
                  {term}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSearch(term);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="text-black" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
