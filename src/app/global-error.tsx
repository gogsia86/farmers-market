"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error Handler
 *
 * This component catches errors that occur during React rendering in the app directory.
 * It reports errors to Sentry and provides a fallback UI.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling#handling-errors-in-root-layouts
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#react-render-errors-in-app-router
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error, {
      level: "fatal",
      tags: {
        errorBoundary: "global",
        digest: error.digest,
      },
      contexts: {
        react: {
          componentStack: error.stack,
        },
      },
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-gray-900 mb-4">Oops!</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">
                We're sorry, but something unexpected happened. Our team has
                been notified and is working on a fix.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <h3 className="text-sm font-semibold text-red-800 mb-2">
                  Error Details (Development Only):
                </h3>
                <pre className="text-xs text-red-700 overflow-auto">
                  {error.message}
                </pre>
                {error.digest && (
                  <p className="text-xs text-red-600 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Try Again
              </button>
              <a
                href="/"
                className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Go to Homepage
              </a>
            </div>

            {/* Support Information */}
            <div className="mt-8 text-sm text-gray-500">
              <p>Need help?</p>
              <p className="mt-1">
                Contact support at{" "}
                <a
                  href="mailto:support@farmersmarket.com"
                  className="text-green-600 hover:text-green-700 underline"
                >
                  support@farmersmarket.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Fallback to Next.js default error component */}
        {process.env.NODE_ENV === "development" && (
          <NextError statusCode={500} />
        )}
      </body>
    </html>
  );
}
