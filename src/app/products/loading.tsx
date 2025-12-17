/**
 * PRODUCTS PAGE LOADING STATE
 *
 * Week 1 Day 3 - Performance Optimization
 *
 * Provides skeleton loading for products page while data fetches
 * - Grid layout matching actual products page
 * - Animated skeletons for smooth UX
 * - Filter sidebar skeleton
 * - Search bar skeleton
 */

import { Search, SlidersHorizontal } from "lucide-react";

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Skeleton */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              {/* Search Skeleton */}
              <div className="mb-6">
                <div className="h-5 w-20 bg-gray-200 rounded mb-3 animate-pulse"></div>
                <div className="relative">
                  <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Categories Skeleton */}
              <div className="mb-6">
                <div className="h-5 w-24 bg-gray-200 rounded mb-3 animate-pulse"></div>
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range Skeleton */}
              <div className="mb-6">
                <div className="h-5 w-28 bg-gray-200 rounded mb-3 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex justify-between">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Filters Skeleton */}
              <div>
                <div className="h-5 w-20 bg-gray-200 rounded mb-3 animate-pulse"></div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm">
                <SlidersHorizontal className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filters</span>
              </button>
            </div>

            {/* Sort & View Options Skeleton */}
            <div className="flex items-center justify-between mb-6">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="hidden md:flex gap-2">
                  <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Products Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm border overflow-hidden animate-pulse"
                >
                  {/* Image Skeleton */}
                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>

                  {/* Content Skeleton */}
                  <div className="p-4 space-y-3">
                    {/* Title */}
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>

                    {/* Farm Name */}
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>

                    {/* Price & Rating */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-5 bg-gray-200 rounded w-12"></div>
                    </div>

                    {/* Badges */}
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                      <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
                    </div>

                    {/* Add to Cart Button */}
                    <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                ))}
                <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="fixed bottom-8 right-8 bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2 border border-green-200 animate-pulse">
        <div className="h-2 w-2 bg-green-500 rounded-full animate-ping"></div>
        <span className="text-sm font-medium text-gray-700">Loading products...</span>
      </div>
    </div>
  );
}
