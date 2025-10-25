/**
 * PRODUCTS PAGE - DIVINE AGRICULTURAL CATALOG DISPLAY
 *
 * Client-side product catalog with filtering and search.
 * Displays products using ProductCard components with full interactivity.
 *
 * Divine Patterns Applied:
 * - Next.js 14 Client Component
 * - Agricultural Consciousness (02_AGRICULTURAL_QUANTUM_MASTERY)
 * - UX Design Consciousness (08_UX_DESIGN_CONSCIOUSNESS)
 *
 * Functional Requirements: FR-001 (Product Catalog)
 */

"use client";

import Header from "@/components/layout/Header";
import ProductCard from "@/components/products/ProductCard";
import type { QuantumProduct } from "@/types/product.types";
import { Loader2, ShoppingBag } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductFilters } from "./ProductFilters";

// ============================================================================
// PRODUCTS PAGE - CLIENT COMPONENT
// ============================================================================

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<QuantumProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasMore: false,
  });

  // Fetch products when search params change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams(searchParams?.toString() || "");
        const response = await fetch(`/api/products?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        if (data.success) {
          setProducts(data.products);
          setPagination(data.pagination);
        } else {
          throw new Error(data.error || "Failed to load products");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [searchParams]);

  return (
    <>
      {/* Site Header with Cart */}
      <Header />

      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-agricultural-600 to-green-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-bold mb-4">
                Fresh from the Farm 🌾
              </h1>
              <p className="text-xl text-agricultural-50">
                Discover locally grown, organic produce delivered fresh from our
                partner farms. Support sustainable agriculture while enjoying
                the best quality products.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Filters */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-4">
                <ProductFilters />
              </div>
            </aside>

            {/* Main Content - Products Grid */}
            <main className="flex-1">
              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-12 h-12 text-agricultural-600 animate-spin mb-4" />
                  <p className="text-lg text-gray-600">
                    Loading fresh products...
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <ShoppingBag className="w-24 h-24 text-red-300 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Oops! Something went wrong
                  </h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-agricultural-600 text-white rounded-md hover:bg-agricultural-700"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                  <ShoppingBag className="w-24 h-24 text-gray-300 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 text-center max-w-md">
                    We could not find any products matching your criteria. Try
                    adjusting your filters or search terms.
                  </p>
                </div>
              )}

              {/* Products Grid */}
              {!loading && !error && products.length > 0 && (
                <>
                  {/* Results Header */}
                  <div className="mb-6 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing{" "}
                      <span className="font-semibold">{products.length}</span>{" "}
                      of{" "}
                      <span className="font-semibold">{pagination.total}</span>{" "}
                      products
                    </p>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {products.map((product) => (
                      <ProductCard
                        key={product.identity.id}
                        product={product}
                        variant="default"
                        interactive={true}
                        showAddToCart={true}
                        showFavorite={true}
                        showSeasonBadge={true}
                        showCertifications={true}
                      />
                    ))}
                  </div>

                  {/* Pagination Info */}
                  {pagination.hasMore && (
                    <div className="flex justify-center">
                      <p className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.totalPages}
                      </p>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
