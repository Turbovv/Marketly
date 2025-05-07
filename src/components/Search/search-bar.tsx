"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { api } from "~/trpc/react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { data: recentSearches = [] } = api.search.getRecentSearches.useQuery(undefined, {
    enabled: isFocused
  });

  const utils = api.useContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHomePage = pathname === '/';

  const deleteSearch = api.search.deleteRecentSearch.useMutation({
    onMutate: async (deletedTerm) => {
      await utils.search.getRecentSearches.cancel();

      const previousSearches = utils.search.getRecentSearches.getData();

      utils.search.getRecentSearches.setData(undefined, (old) => {
        return old?.filter(search => search.term !== deletedTerm.term);
      });

      return { previousSearches };
    },
    onError: (err, deletedTerm, context) => {
      utils.search.getRecentSearches.setData(undefined, context?.previousSearches);
    },
    onSettled: () => {
      utils.search.getRecentSearches.invalidate();
    },
  });


  const addSearch = api.search.addRecentSearch.useMutation({
    onSuccess: () => {
      void utils.search.getRecentSearches.invalidate();
    },
  });

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

  const handleSearch = async () => {
    if (query.trim()) {
      await addSearch.mutateAsync({ term: query });
      router.push(`/search?query=${query}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      void handleSearch();
    }
  };

  const handleRecentSearchClick = (term: string) => {
    setQuery(term);
    router.push(`/search?query=${term}`);
    setIsFocused(false);
  };

  const handleDeleteSearch = async (term: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteSearch.mutateAsync({ term });
    } catch (error) {
      console.error('Failed to delete search:', error);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className={`relative ${isHomePage ? 'w-[70%]' : 'w-[40%]'}`}>
          <input
            type="text"
            placeholder="Enter a search word"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-full pl-4 ${isHomePage ? 'py-5 border-yellow-400' : 'py-2 '} border-2 focus:outline-none rounded-xl text-base`}
          />
        </div>
        {isHomePage && (
          <button
            onClick={handleSearch}
            className="flex-1 flex items-center justify-center gap-2 py-5 px-8 rounded-xl bg-yellow-400 text-black text-base font-medium hover:bg-yellow-300 transition-colors"
          >
            <Search className="text-black" size={20} />
            Search
          </button>
        )}
      </div>

      {isFocused && recentSearches.length > 0 && (
        <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-50">
          <div className="p-2">
            <p className="text-xs text-gray-500 mb-2">Recent Searches</p>
            {recentSearches.map((term, idx) => (
              <div
                key={idx}
                onClick={() => handleRecentSearchClick(term.term)}
                className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
              >
                <span className="text-sm text-gray-700">
                  {term.term}
                </span>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => handleDeleteSearch(term.term, e)}
                  className="text-gray-400 hover:text-gray-600 p-1"
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
