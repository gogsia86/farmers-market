/**
 * Loading State for Admin Notifications Page
 * Displays skeleton UI while notifications are being fetched
 */

export default function AdminNotificationsLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded-md w-64 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded-md w-96 animate-pulse" />
        </div>

        {/* Filters/Tabs Skeleton */}
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 rounded-md w-24 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded-md w-24 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded-md w-24 animate-pulse" />
        </div>

        {/* Notifications List Skeleton */}
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-4 animate-pulse"
            >
              <div className="flex items-start gap-3">
                {/* Icon Skeleton */}
                <div className="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0" />

                {/* Content Skeleton */}
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded-md w-3/4" />
                  <div className="h-4 bg-gray-100 rounded-md w-full" />
                  <div className="h-4 bg-gray-100 rounded-md w-5/6" />
                  <div className="flex gap-2 mt-3">
                    <div className="h-3 bg-gray-100 rounded-md w-20" />
                    <div className="h-3 bg-gray-100 rounded-md w-24" />
                  </div>
                </div>

                {/* Action Skeleton */}
                <div className="h-8 w-20 bg-gray-200 rounded-md" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex justify-center gap-2 pt-4">
          <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}
