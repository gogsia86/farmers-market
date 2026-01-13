"use client";

/**
 * 🚨 PAGE-LEVEL ERROR BOUNDARY
 * Catches errors that occur during React rendering on specific pages
 *
 * Features:
 * - Graceful error handling
 * - Error logging and monitoring
 * - User-friendly error UI
 * - Reset functionality
 * - Development vs Production modes
 * - Specific error type handling
 */

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console (development)
    console.error("Page error caught:", error);

    // Send to monitoring service (production)
    if (typeof window !== "undefined") {
      // Sentry, LogRocket, or other monitoring service
      if ((window as any).Sentry) {
        (window as any).Sentry.captureException(error);
      }

      // Custom analytics
      if ((window as any).gtag) {
        (window as any).gtag("event", "exception", {
          description: error.message,
          fatal: false,
        });
      }
    }
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === "development";

  // Determine error type for better UX
  const getErrorType = () => {
    const message = error.message.toLowerCase();

    if (message.includes("network") || message.includes("fetch")) {
      return "network";
    }
    if (message.includes("not found") || message.includes("404")) {
      return "notFound";
    }
    if (message.includes("unauthorized") || message.includes("403")) {
      return "unauthorized";
    }
    if (message.includes("timeout")) {
      return "timeout";
    }
    return "generic";
  };

  const errorType = getErrorType();

  // Error messages based on type
  const errorMessages = {
    network: {
      title: "Connection Error",
      description:
        "We're having trouble connecting to our servers. Please check your internet connection and try again.",
      icon: "🌐",
    },
    notFound: {
      title: "Page Not Found",
      description:
        "The page you're looking for doesn't exist or has been moved.",
      icon: "🔍",
    },
    unauthorized: {
      title: "Access Denied",
      description:
        "You don't have permission to access this page. Please sign in or contact support.",
      icon: "🔒",
    },
    timeout: {
      title: "Request Timeout",
      description: "The request took too long to complete. Please try again.",
      icon: "⏱️",
    },
    generic: {
      title: "Something Went Wrong",
      description:
        "An unexpected error occurred. Don't worry, our team has been notified.",
      icon: "⚠️",
    },
  };

  const currentError = errorMessages[errorType];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          {/* Error Icon */}
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-4xl">
              {currentError.icon}
            </div>
          </div>

          {/* Error Content */}
          <div className="text-center">
            <h1 className="mb-3 text-2xl font-bold text-gray-900">
              {currentError.title}
            </h1>
            <p className="mb-6 text-gray-600">{currentError.description}</p>

            {/* Development Error Details */}
            {isDevelopment && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 text-left">
                <p className="mb-2 text-sm font-semibold text-red-900">
                  🔧 Development Error Details:
                </p>
                <div className="space-y-2">
                  <div className="rounded bg-red-100 p-2">
                    <p className="text-xs font-mono text-red-800 break-words">
                      <strong>Message:</strong> {error.message}
                    </p>
                  </div>
                  {error.digest && (
                    <div className="rounded bg-red-100 p-2">
                      <p className="text-xs font-mono text-red-800">
                        <strong>Digest:</strong> {error.digest}
                      </p>
                    </div>
                  )}
                  {error.stack && (
                    <details className="rounded bg-red-100 p-2">
                      <summary className="cursor-pointer text-xs font-mono font-semibold text-red-800">
                        Stack Trace (click to expand)
                      </summary>
                      <pre className="mt-2 max-h-48 overflow-auto text-xs text-red-700 whitespace-pre-wrap">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  // Reset error boundary state
                  reset();
                }}
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

              <button
                onClick={() => {
                  // Reload the page as a fallback
                  window.location.reload();
                }}
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reload Page
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
                Go to Homepage
              </a>
            </div>
          </div>

          {/* Help Tips */}
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
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
                  Quick Troubleshooting Tips:
                </h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-700">
                  <li>Refresh the page (Ctrl/Cmd + R)</li>
                  <li>Clear your browser cache</li>
                  <li>Try a different browser</li>
                  <li>Check your internet connection</li>
                  {errorType === "unauthorized" && (
                    <li>Sign in again or check your permissions</li>
                  )}
                </ul>
                <div className="mt-3">
                  <a
                    href="/contact"
                    className="text-sm font-medium text-blue-800 hover:text-blue-900 underline"
                  >
                    Still having issues? Contact Support →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Error Reference */}
          {error.digest && (
            <div className="mt-4 text-center text-xs text-gray-500">
              <p>
                Error Reference:{" "}
                <span className="font-mono font-semibold">{error.digest}</span>
              </p>
              <p className="mt-1">
                Please quote this reference when contacting support.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
