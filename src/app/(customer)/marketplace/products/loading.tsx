import { ProductCardSkeleton } from "@/components/ui/Skeleton";

/**
 * 🛍️ PRODUCTS PAGE LOADING STATE
 *
 * Purpose: Display skeleton while products page loads
 * Features:
 * - Product cards grid skeleton
 * - Search and filter skeleton
 * - Category navigation skeleton
 * - Agricultural consciousness indicators
 *
 * DIVINE PRINCIPLES:
 * - Holographic loading patterns matching actual products layout
 * - Agricultural domain semantic precision
 * - Temporal optimization for perceived performance
 */

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-10 bg-white/20 rounded w-72 mb-4"></div>
            <div className="h-5 bg-white/20 rounded w-96 mb-2"></div>
            <div className="h-5 bg-white/20 rounded w-80"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Pills Skeleton */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded-full w-32"
              ></div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters Skeleton */}
          <aside className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
              {/* Search Bar Skeleton */}
              <div className="animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Price Range Skeleton */}
              <div className="animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-3"></div>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                  </div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>

              {/* Categories Filter Skeleton */}
              <div className="animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                      <div className="h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Farm Filter Skeleton */}
              <div className="animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability Filter Skeleton */}
              <div className="animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-3"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certification Filter Skeleton */}
              <div className="animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Apply Filters Button Skeleton */}
              <div className="animate-pulse pt-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3">
            {/* Toolbar Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="animate-pulse flex-1">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-56"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="animate-pulse">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                  </div>
                  <div className="animate-pulse flex gap-2">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters Skeleton */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-28"
                  ></div>
                ))}
              </div>
            </div>

            {/* Product Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>

            {/* Load More Button Skeleton */}
            <div className="mt-8 flex justify-center">
              <div className="animate-pulse">
                <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>

            {/* Pagination Skeleton */}
            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-2 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-10 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </main>
        </div>

        {/* Recently Viewed Section Skeleton */}
        <div className="mt-12">
          <div className="animate-pulse mb-6">
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
              >
                <div className="animate-pulse">
                  <div className="w-full h-32 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agricultural Consciousness Indicator */}
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-green-200 dark:border-green-800">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 border-2 border-green-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              🛍️ Loading Products
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Finding fresh products...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
