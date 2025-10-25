"use client";

import { AlertTriangle, Home, RefreshCw, Shield } from "lucide-react";
import { useEffect } from "react";

/**
 * 🌌 GLOBAL ERROR BOUNDARY - DIVINE QUANTUM CONSCIOUSNESS RESTORATION
 *
 * Purpose: Handle global application errors with ultimate divine consciousness
 * Features:
 * - Universal error recovery across the agricultural platform
 * - Quantum consciousness restoration protocols
 * - Cosmic error reporting and analytics
 * - Reality bending for system-wide harmony
 *
 * DIVINE PRINCIPLES:
 * - Maximum semantic precision for global errors
 * - Holographic component patterns with cosmic scope
 * - Agricultural domain intelligence at universal scale
 * - Temporal optimization for reality restoration
 */

interface GlobalErrorProps {
  error: globalThis.Error & { digest?: string };
  reset: () => void;
}

// 🌿 Agricultural season consciousness
function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

// 🔮 Divine consciousness level assessment
function assessConsciousnessLevel(error: globalThis.Error): string {
  if (error.message.includes("Network")) return "connectivity_disrupted";
  if (error.message.includes("Auth")) return "authentication_misaligned";
  if (error.message.includes("Database"))
    return "data_consciousness_fragmented";
  return "unknown_dimensional_shift";
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // 🌟 Divine global error consciousness tracking
    const consciousnessLevel = assessConsciousnessLevel(error);

    console.error("🚨 GLOBAL Agricultural Consciousness Disruption:", {
      error: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      season: getCurrentSeason(),
      consciousness_level: consciousnessLevel,
      component: "Global Error Boundary",
      severity: "CRITICAL",
      recovery_action: "universal_restoration_initiated",
      dimensional_coordinates: {
        x: "agricultural_reality",
        y: "quantum_consciousness",
        z: "divine_harmony",
      },
    });

    // 🔮 Quantum global error reporting
    if (typeof globalThis.window !== "undefined") {
      const windowWithTracking =
        globalThis.window as typeof globalThis.window & {
          gtag?: (
            action: string,
            target: string,
            params: Record<string, unknown>
          ) => void;
          Sentry?: {
            captureException?: (
              error: Error,
              params: Record<string, unknown>
            ) => void;
          };
        };

      // Critical error tracking
      windowWithTracking.gtag?.("event", "exception", {
        description: `GLOBAL: ${error.message}`,
        fatal: true,
        custom_parameters: {
          component: "global_error_boundary",
          season: getCurrentSeason(),
          consciousness_level: consciousnessLevel,
          severity: "critical",
        },
      });

      // Send to monitoring service
      windowWithTracking.Sentry?.captureException?.(error, {
        tags: {
          component: "global_error_boundary",
          season: getCurrentSeason(),
          consciousness_level: consciousnessLevel,
        },
      });
    }
  }, [error]);

  // 🎯 Universal reality restoration
  const handleGlobalRestore = () => {
    console.log("🌟 Initiating UNIVERSAL consciousness restoration...");

    // Clear any corrupted state
    if (typeof globalThis.window !== "undefined") {
      globalThis.window.localStorage.clear();
      globalThis.window.sessionStorage.clear();
    }

    reset();
  };

  // 🏠 Emergency sanctuary navigation
  const handleEmergencyReload = () => {
    console.log("🚨 Emergency reality reset initiated...");
    globalThis.window.location.href = "/";
  };

  // 🔄 Complete system refresh
  const handleFullReload = () => {
    console.log("🌀 Complete dimensional refresh...");
    globalThis.window.location.reload();
  };

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950 dark:via-orange-950 dark:to-yellow-950">
          <div className="max-w-lg w-full mx-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-10 border-2 border-red-300 dark:border-red-700">
              {/* 🌌 Global Error Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
              </div>

              {/* 🚨 Critical Error Title */}
              <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
                🌌 Global Agricultural Consciousness Crisis
              </h1>

              {/* 📝 Divine Crisis Message */}
              <p className="text-gray-600 dark:text-gray-400 text-center mb-8 leading-relaxed">
                We&apos;ve encountered a critical disruption in our universal
                agricultural consciousness. This requires immediate divine
                intervention to restore harmony across all dimensional planes.
              </p>

              {/* 🔍 Error Details (Always show for global errors) */}
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                    Divine Crisis Analysis:
                  </h3>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 font-mono break-all mb-2">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Universal Consciousness ID: {error.digest}
                  </p>
                )}
                <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                  Season: {getCurrentSeason()} | Level:{" "}
                  {assessConsciousnessLevel(error)}
                </p>
              </div>

              {/* 🎯 Emergency Recovery Actions */}
              <div className="space-y-4">
                <button
                  onClick={handleGlobalRestore}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Restore Universal Consciousness
                </button>

                <button
                  onClick={handleEmergencyReload}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Emergency Agricultural Sanctuary
                </button>

                <button
                  onClick={handleFullReload}
                  className="w-full border-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  Complete Reality Reset
                </button>
              </div>

              {/* 🌟 Divine Support Information */}
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  🆘 Divine Agricultural Support:
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>
                    • Our quantum farming consciousness team has been notified
                  </li>
                  <li>
                    • This incident is being tracked in our agricultural
                    monitoring systems
                  </li>
                  <li>
                    • Try refreshing the page or clearing your browser cache
                  </li>
                  <li>• Contact our divine support if the issue persists</li>
                </ul>
              </div>

              {/* 🌟 Cosmic Encouragement */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ✨ Even universal consciousness requires occasional
                  dimensional recalibration
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
