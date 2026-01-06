/**
 * 🔐 LOGIN LOADING STATE
 * Displays a loading skeleton while the login page is being loaded
 */

export default function LoginLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-green-100 p-8">
          {/* Header Skeleton */}
          <div className="text-center mb-8 animate-pulse">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <div className="w-8 h-8 bg-green-200 rounded" />
            </div>
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2" />
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
          </div>

          {/* Form Skeleton */}
          <div className="space-y-6 animate-pulse">
            {/* Email Field */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-12 bg-gray-100 rounded w-full border border-gray-200" />
            </div>

            {/* Password Field */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-12 bg-gray-100 rounded w-full border border-gray-200" />
            </div>

            {/* Submit Button */}
            <div className="h-12 bg-green-200 rounded w-full" />
          </div>

          {/* Footer Links Skeleton */}
          <div className="mt-6 space-y-2 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-56 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-40 mx-auto" />
          </div>

          {/* Loading Indicator */}
          <div className="mt-8 flex items-center justify-center">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
