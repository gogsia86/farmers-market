/**
 * PRODUCT FILTERS - CLIENT-SIDE FILTERING COMPONENT
 *
 * Interactive filters for product catalog with real-time updates.
 * Uses Next.js router to update URL parameters for server-side filtering.
 *
 * Divine Patterns Applied:
 * - Client Component (use client)
 * - UX Design Consciousness (08_UX_DESIGN_CONSCIOUSNESS)
 * - Agricultural Consciousness (seasonal filtering)
 *
 * Functional Requirements: FR-001 (Product Catalog - Filtering)
 */

"use client";

import { AgriculturalProductCategory } from "@/types/product.types";
import { Award, DollarSign, Filter, Leaf, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

// ============================================================================
// PRODUCT FILTERS COMPONENT
// ============================================================================

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ========================================================================
  // FILTER HANDLERS
  // ========================================================================

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString() || "");

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      router.push(`/products?${params.toString()}`);
    },
    [searchParams, router]
  );

  const clearFilters = useCallback(() => {
    router.push("/products");
  }, [router]);

  const toggleCategory = useCallback(
    (category: string) => {
      const current = searchParams?.get("categories")?.split(",") || [];
      const updated = current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category];

      updateFilters("categories", updated.join(","));
    },
    [searchParams, updateFilters]
  );

  // ========================================================================
  // CURRENT FILTER STATE
  // ========================================================================

  const selectedCategories = searchParams?.get("categories")?.split(",") || [];
  const isOrganic = searchParams?.get("organic") === "true";
  const onSale = searchParams?.get("onSale") === "true";
  const inStock = searchParams?.get("inStock") === "true";
  const minPrice = searchParams?.get("minPrice") || "";
  const maxPrice = searchParams?.get("maxPrice") || "";

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    isOrganic ||
    onSale ||
    inStock ||
    minPrice ||
    maxPrice;

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-agricultural-600" />
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-agricultural-600 hover:text-agricultural-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-green-600" />
            Categories
          </h3>
          <div className="space-y-2">
            {Object.values(AgriculturalProductCategory)
              .slice(0, 10)
              .map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="w-4 h-4 text-agricultural-600 border-gray-300 rounded focus:ring-agricultural-500"
                  />
                  <span className="text-sm text-gray-700">
                    {category.replace(/_/g, " ")}
                  </span>
                </label>
              ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            Price Range
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                Min Price
              </label>
              <input
                type="number"
                placeholder="$0"
                value={minPrice}
                onChange={(e) => updateFilters("minPrice", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-agricultural-500 focus:border-agricultural-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                Max Price
              </label>
              <input
                type="number"
                placeholder="$100"
                value={maxPrice}
                onChange={(e) => updateFilters("maxPrice", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-agricultural-500 focus:border-agricultural-500"
              />
            </div>
          </div>
        </div>

        {/* Quality Filters */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-green-600" />
            Quality
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={isOrganic}
                onChange={(e) =>
                  updateFilters("organic", e.target.checked ? "true" : "")
                }
                className="w-4 h-4 text-agricultural-600 border-gray-300 rounded focus:ring-agricultural-500"
              />
              <Leaf className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">Organic Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={onSale}
                onChange={(e) =>
                  updateFilters("onSale", e.target.checked ? "true" : "")
                }
                className="w-4 h-4 text-agricultural-600 border-gray-300 rounded focus:ring-agricultural-500"
              />
              <span className="text-sm text-gray-700">On Sale</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) =>
                  updateFilters("inStock", e.target.checked ? "true" : "")
                }
                className="w-4 h-4 text-agricultural-600 border-gray-300 rounded focus:ring-agricultural-500"
              />
              <span className="text-sm text-gray-700">In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
          <select
            value={searchParams?.get("sortBy") || "name"}
            onChange={(e) => updateFilters("sortBy", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-agricultural-500 focus:border-agricultural-500"
          >
            <option value="name">Name (A-Z)</option>
            <option value="price">Price (Low to High)</option>
            <option value="newest">Newest First</option>
            <option value="popularity">Most Popular</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>
    </div>
  );
}
