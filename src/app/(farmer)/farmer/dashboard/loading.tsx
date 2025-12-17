/**
 * 🌾 FARMER DASHBOARD LOADING STATE
 *
 * Purpose: Display skeleton while farmer dashboard loads
 * Features:
 * - Stats cards skeleton
 * - Charts skeleton
 * - Recent orders skeleton
 * - Inventory overview skeleton
 * - Agricultural consciousness indicators
 *
 * DIVINE PRINCIPLES:
 * - Holographic loading patterns matching actual dashboard layout
 * - Agricultural domain semantic precision
 * - Temporal optimization for perceived performance
 */

export default function FarmerDashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section Skeleton */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            </div>
            <div className="animate-pulse flex gap-3">
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="animate-pulse space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              {/* Chart bars */}
              <div className="flex items-end justify-between h-48 space-x-2">
                {[40, 60, 35, 70, 55, 80, 45, 65, 50, 75, 60, 55].map(
                  (height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t"
                      style={{ height: `${height}%` }}
                    ></div>
                  )
                )}
              </div>
              <div className="flex justify-between pt-2">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, i) => (
                  <div
                    key={i}
                    className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8"
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Performance Chart Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              {/* Donut chart placeholder */}
              <div className="flex items-center justify-center h-48">
                <div className="relative w-40 h-40">
                  <div className="w-40 h-40 border-8 border-gray-200 dark:border-gray-700 rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders & Inventory Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4">
                  <div className="animate-pulse space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>

          {/* Inventory Overview Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="animate-pulse flex items-center justify-between">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-44"></div>
                <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="animate-pulse">
                    <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                  <div className="flex-1 animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    </div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section Skeleton */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"
                ></div>
              ))}
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
              🌾 Loading Dashboard
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Preparing farm analytics...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
