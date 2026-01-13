"use client";

/**
 * 🚨 GLOBAL ERROR BOUNDARY
 * Catches all unhandled errors at the root level
 *
 * Features:
 * - Graceful error handling
 * - Error logging to monitoring service
 * - User-friendly error UI
 * - Reset functionality
 * - Production vs Development modes
 */

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to monitoring service (Sentry, etc.)
    console.error("Global error caught:", error);

    // You can also send to your error tracking service
    if (typeof window !== "undefined" && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
          <div className="w-full max-w-2xl">
            <div className="rounded-2xl bg-white p-8 shadow-2xl">
              {/* Error Icon */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                  <svg
                    className="h-10 w-10 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>

              {/* Error Message */}
              <div className="text-center">
                <h1 className="mb-4 text-3xl font-bold text-gray-900">
                  Oops! Something went wrong
                </h1>
                <p className="mb-6 text-lg text-gray-600">
                  We're sorry, but an unexpected error occurred. Our team has
                  been notified and we're working to fix it.
                </p>

                {/* Error Details (Development Only) */}
                {isDevelopment && (
                  <div className="mb-6 rounded-lg bg-red-50 p-4 text-left">
                    <p className="mb-2 font-mono text-sm font-semibold text-red-900">
                      Error Details (Development Mode):
                    </p>
                    <p className="font-mono text-xs text-red-800 break-words">
                      {error.message}
                    </p>
                    {error.digest && (
                      <p className="mt-2 font-mono text-xs text-red-700">
                        Error ID: {error.digest}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <button
                    onClick={reset}
                    className="inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-all hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
                  >
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
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
                    className="inline-flex items-center justify-center rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50"
                  >
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Go Home
                  </a>

                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-lg bg-blue-100 px-6 py-3 font-semibold text-blue-700 transition-all hover:bg-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Contact Support
                  </a>
                </div>
              </div>

              {/* Help Section */}
              <div className="mt-8 rounded-lg bg-blue-50 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Need immediate help?
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-inside list-disc space-y-1">
                        <li>Try refreshing the page</li>
                        <li>Clear your browser cache and cookies</li>
                        <li>Check your internet connection</li>
                        <li>Contact support if the issue persists</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center text-sm text-gray-500">
                {error.digest && (
                  <p>
                    Error Reference:{" "}
                    <span className="font-mono">{error.digest}</span>
                  </p>
                )}
                <p className="mt-2">
                  Please quote this reference when contacting support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
