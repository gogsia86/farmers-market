// 🧠 DIVINE PATTERN: Offline Fallback Page
// 📚 Reference: 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
// 🌾 Domain: Offline Agricultural Consciousness
// ⚡ Performance: Graceful Degradation

"use client";

import { WifiIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

/**
 * Divine Offline Fallback Page
 * Provides graceful offline experience with agricultural consciousness
 */
export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-agricultural-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-agricultural-200 p-8 text-center">
        <div className="mb-6">
          <WifiIcon
            className="mx-auto h-16 w-16 text-agricultural-400"
            strokeWidth={1.5}
          />
        </div>

        <h1 className="text-2xl font-bold text-agricultural-900 mb-3">
          You're Offline
        </h1>

        <p className="text-agricultural-600 mb-6">
          It looks like you've lost your internet connection. Don't worry, your
          agricultural journey continues once you're back online.
        </p>

        <div className="bg-agricultural-50 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-semibold text-agricultural-900 mb-2">
            What you can do:
          </h2>
          <ul className="text-sm text-agricultural-700 space-y-2 text-left">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Check your internet connection</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Browse previously viewed farms and products</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>View your saved orders and account info</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Try refreshing the page</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full inline-flex items-center justify-center rounded-md bg-agricultural-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-agricultural-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-agricultural-600"
          >
            Retry Connection
          </button>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-agricultural-900 shadow-sm ring-1 ring-inset ring-agricultural-300 hover:bg-agricultural-50"
          >
            Go to Home
          </Link>
        </div>

        <div className="mt-6 text-xs text-agricultural-500">
          <p>
            This app works offline thanks to Progressive Web App technology 🌾
          </p>
        </div>
      </div>
    </div>
  );
}
