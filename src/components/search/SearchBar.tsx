/**
 * SEARCH BAR COMPONENT - PRODUCT SEARCH
 *
 * Divine search bar with autocomplete functionality.
 * Real-time search as you type with keyboard navigation.
 *
 * Features:
 * - Real-time search
 * - Autocomplete dropdown
 * - Keyboard navigation (↑↓ arrows, Enter, Esc)
 * - Recent searches
 * - Mobile responsive
 */

"use client";

import { createLogger } from "@/lib/utils/logger";
import { Combobox, Transition } from "@headlessui/react";
import { Clock, Search, TrendingUp, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";

const searchLogger = createLogger("SearchBar");

interface SearchResult {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState([
    "Organic Tomatoes",
    "Fresh Eggs",
    "Apples",
    "Honey",
  ]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Search products as user types
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&limit=5`,
        );
        const data = await response.json();

        if (data.success) {
          setResults(data.results);
        }
      } catch (error) {
        searchLogger.error(
          "Search error",
          error instanceof Error ? error : new Error(String(error)),
        );
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Add to recent searches
    const updated = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));

    // Navigate to search results
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setQuery("");
  };

  const handleSelectResult = (result: SearchResult) => {
    handleSearch(result.name);
    router.push(`/products/${result.id}`);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  return (
    <Combobox value={query} onChange={(value) => setQuery(value || "")}>
      <div className="relative w-full max-w-lg">
        {/* Search Input */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>

          <Combobox.Input
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm focus:border-agricultural-500 focus:outline-none focus:ring-2 focus:ring-agricultural-500"
            placeholder="Search products..."
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query) {
                handleSearch(query);
              }
            }}
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        <Transition
          as={Fragment}
          show={query.length > 0 || recentSearches.length > 0}
          enter="transition ease-out duration-100"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Combobox.Options
            static
            className="absolute z-50 mt-2 max-h-96 w-full overflow-auto rounded-lg bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            {/* Loading State */}
            {isLoading && (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                Searching...
              </div>
            )}

            {/* Search Results */}
            {!isLoading && query.length >= 2 && results.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Products
                </div>
                {results.map((result) => (
                  <Combobox.Option
                    key={result.id}
                    value={result}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 px-4 ${
                        active
                          ? "bg-agricultural-50 text-agricultural-900"
                          : "text-gray-900"
                      }`
                    }
                    onClick={() => handleSelectResult(result)}
                  >
                    <div className="flex items-center gap-3">
                      {result.image && (
                        <img
                          src={result.image}
                          alt={result.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-gray-500">
                          {result.category} • ${(result.price / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </Combobox.Option>
                ))}
                <button
                  onClick={() => handleSearch(query)}
                  className="w-full px-4 py-2 text-left text-sm text-agricultural-600 hover:bg-agricultural-50"
                >
                  See all results for "{query}"
                </button>
              </>
            )}

            {/* No Results */}
            {!isLoading && query.length >= 2 && results.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No products found for "{query}"
              </div>
            )}

            {/* Recent Searches */}
            {query.length === 0 && recentSearches.length > 0 && (
              <>
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase">
                    Recent Searches
                  </div>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-agricultural-600 hover:text-agricultural-700"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{search}</span>
                  </button>
                ))}
              </>
            )}

            {/* Popular Searches */}
            {query.length === 0 && popularSearches.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Popular Searches
                </div>
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    <TrendingUp className="h-4 w-4 text-agricultural-600" />
                    <span>{search}</span>
                  </button>
                ))}
              </>
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}
