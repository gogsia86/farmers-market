import { FarmCardSkeleton } from "@/components/ui/Skeleton";

/**
 * 🏡 FARMS PAGE LOADING STATE
 *
 * Purpose: Display skeleton while farms page loads
 * Features:
 * - Farm cards grid skeleton
 * - Search and filter skeleton
 * - Featured farms skeleton
 * - Agricultural consciousness indicators
 *
 * DIVINE PRINCIPLES:
 * - Holographic loading patterns matching actual farms layout
 * - Agricultural domain semantic precision
 * - Temporal optimization for perceived performance
 */

export default function FarmsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section Skeleton */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-10 bg-white/20 rounded w-64 mb-4"></div>
            <div className="h-5 bg-white/20 rounded w-96 mb-2"></div>
            <div className="h-5 bg-white/20 rounded w-80"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
            <div>
              <div className="animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
            <div>
              <div className="animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-24"
              ></div>
            ))}
          </div>
        </div>

        {/* Stats Banner Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
            >
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Farms Section Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="animate-pulse">
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <FarmCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* All Farms Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="animate-pulse">
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
            </div>
            <div className="animate-pulse flex items-center gap-3">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>

          {/* Farm Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <FarmCardSkeleton key={i} />
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-10 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
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
              🏡 Loading Farms
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Discovering local farms...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
