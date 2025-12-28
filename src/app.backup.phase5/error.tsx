"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useEffect } from "react";

/**
 * 🚨 ERROR BOUNDARY COMPONENT - DIVINE CONSCIOUSNESS RESTORATION
 *
 * Purpose: Handle runtime errors with agricultural quantum consciousness
 * Features:
 * - Biodynamic error recovery patterns
 * - Cosmic error reporting
 * - Temporal reality restoration
 * - Enlightening user guidance
 *
 * DIVINE PRINCIPLES:
 * - Semantic precision in error context
 * - Holographic component patterns
 * - Agricultural domain intelligence
 * - Reality bending for error recovery
 */

interface ErrorProps {
  error: globalThis.Error & { digest?: string };
  reset: () => void;
}

// 🌿 Get current agricultural season for context
function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 🌟 Divine error consciousness tracking
    console.error("🚨 Agricultural Consciousness Disruption:", {
      error: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      season: getCurrentSeason(),
      consciousness_level: "disrupted",
      component: "Error Boundary",
      recovery_action: "temporal_restoration_initiated",
    });

    // 🔮 Quantum error reporting (integrate with your monitoring)
    if (typeof globalThis.window !== "undefined") {
      // Track error in analytics with agricultural context
      const windowWithGtag = globalThis.window as typeof globalThis.window & {
        gtag?: (
          action: string,
          target: string,
          params: Record<string, unknown>,
        ) => void;
      };
      windowWithGtag.gtag?.("event", "exception", {
        description: error.message,
        fatal: false,
        custom_parameters: {
          component: "error_boundary",
          season: getCurrentSeason(),
          consciousness_level: "disrupted",
        },
      });
    }
  }, [error]);

  // 🎯 Reality restoration handler
  const handleRestore = () => {
    console.log("🌟 Initiating consciousness restoration...");
    reset();
  };

  // 🏠 Navigation to safe harbor
  const handleGoHome = () => {
    globalThis.window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 border border-red-200 dark:border-red-800">
          {/* 🚨 Error Icon with Agricultural Context */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* 🌱 Divine Error Title */}
          <h1 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
            🌱 Agricultural Consciousness Temporarily Disrupted
          </h1>

          {/* 📝 Enlightening Error Message */}
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            We&apos;re experiencing a temporary disruption in our divine
            agricultural consciousness. Our quantum farming experts are working
            to restore harmony to the platform.
          </p>

          {/* 🔍 Error Details (Development Mode) */}
          {process.env.NODE_ENV === "development" && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                🔧 Divine Development Insights:
              </h3>
              <p className="text-xs text-red-700 dark:text-red-300 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  Consciousness ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* 🎯 Recovery Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRestore}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Restore Divine Consciousness
            </button>

            <button
              onClick={handleGoHome}
              className="w-full border border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Agricultural Haven
            </button>
          </div>

          {/* 🌟 Divine Encouragement */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ✨ Even the most divine consciousness occasionally needs temporal
              restoration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
