/**
 * 👑 ADMIN SECTION LOADING STATE
 *
 * Purpose: Display skeleton while admin pages load
 * Features:
 * - Professional admin loading animation
 * - Dashboard-appropriate styling
 * - Agricultural consciousness indicators
 *
 * DIVINE PRINCIPLES:
 * - Holographic loading patterns for admin experience
 * - Agricultural domain semantic precision
 * - Temporal optimization for perceived performance
 */

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        {/* Loading Icon Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-3 h-3 bg-blue-600 rounded-full"></div>
            </div>

            {/* Inner pulsing icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center animate-pulse">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Title */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          👑 Admin Dashboard Loading
        </h2>

        {/* Loading Message */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Preparing administrative interface...
        </p>

        {/* Progress Bar */}
        <div className="max-w-xs mx-auto mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full animate-pulse"
              style={{ width: "65%" }}
            ></div>
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>

        {/* Loading Tip */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              💡 <span className="font-semibold">Tip:</span> Admin dashboard
              provides real-time insights into platform operations, user
              management, and farm verification workflows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
