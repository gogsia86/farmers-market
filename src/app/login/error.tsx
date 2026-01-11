"use client";

/**
 * 🔐 LOGIN ERROR BOUNDARY
 * Catches and displays errors that occur during login page rendering
 */

import { useEffect } from "react";

import { logger } from "@/lib/monitoring/logger";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    logger.error("Login page error:", {
      error: error instanceof Error ? error.message : String(error),
    });
  }, [error]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-red-100 p-8">
          {/* Error Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Something Went Wrong
            </h2>
            <p className="text-gray-600">
              We encountered an error while loading the login page.
            </p>
          </div>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs font-semibold text-gray-900 mb-2">
                Error Details:
              </p>
              <p className="text-xs text-gray-700 font-mono break-all">
                {error.message || "Unknown error"}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>

            <a
              href="/"
              className="block w-full text-center bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Home
            </a>
          </div>

          {/* Help Section */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              💡 Troubleshooting Tips:
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Clear your browser cache and cookies</li>
              <li>• Try using a different browser</li>
              <li>• Make sure JavaScript is enabled</li>
            </ul>
          </div>

          {/* Support Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Still having issues?{" "}
              <a
                href="/contact"
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
