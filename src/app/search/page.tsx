/**
 * SEARCH RESULTS PAGE
 *
 * Displays search results with filters.
 * Shows products matching search query.
 */

"use client";

import Header from "@/components/layout/Header";
import ProductCard from "@/components/products/ProductCard";
import type { QuantumProduct } from "@/types/product.types";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";
  const [results, setResults] = useState<QuantumProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      if (!query) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&limit=50`
        );
        const data = await response.json();

        if (data.success) {
          setResults(data.results);
        } else {
          throw new Error(data.error || "Search failed");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search");
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [query]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Search className="h-4 w-4" />
              <span>Search Results</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {query ? `Results for "${query}"` : "Search Products"}
            </h1>
            {!isLoading && results.length > 0 && (
              <p className="mt-2 text-gray-600">
                Found {results.length}{" "}
                {results.length === 1 ? "product" : "products"}
              </p>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-agricultural-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Searching...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          )}

          {/* No Query */}
          {!query && !isLoading && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 mx-auto text-gray-300" />
              <p className="mt-4 text-lg text-gray-600">
                Enter a search term to find products
              </p>
            </div>
          )}

          {/* No Results */}
          {query && !isLoading && !error && results.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 mx-auto text-gray-300" />
              <p className="mt-4 text-lg font-medium text-gray-900">
                No products found
              </p>
              <p className="mt-2 text-gray-600">
                Try different keywords or browse all products
              </p>
            </div>
          )}

          {/* Results Grid */}
          {!isLoading && results.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((product) => (
                <ProductCard
                  key={product.identity.id}
                  product={product}
                  variant="default"
                  showSeasonBadge={true}
                  showCertifications={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-agricultural-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
