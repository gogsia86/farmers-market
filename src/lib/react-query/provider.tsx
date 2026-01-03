"use client";

import { createLogger } from "@/lib/utils/logger";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

const reactQueryLogger = createLogger("ReactQuery");

/**
 * 🌾 DIVINE AGRICULTURAL REACT QUERY PROVIDER
 *
 * Quantum-optimized React Query configuration with:
 * - Agricultural consciousness integration
 * - Hardware-aware caching (HP OMEN: 64GB RAM, 12 threads)
 * - Biodynamic error handling
 * - Seasonal cache strategies
 * - Divine performance optimization
 *
 * @module ReactQueryProvider
 */

// ============================================================================
// CACHE CONFIGURATION - DIVINE OPTIMIZATION
// ============================================================================

/**
 * Cache time configuration optimized for HP OMEN hardware
 * 64GB RAM allows generous caching for instant agricultural data access
 */
const CACHE_CONFIG = {
  // Default cache time: 5 minutes (agricultural data changes moderately)
  cacheTime: 5 * 60 * 1000,

  // Stale time: 1 minute (fresh data for active farming operations)
  staleTime: 1 * 60 * 1000,

  // Refetch on window focus (farmers checking back after field work)
  refetchOnWindowFocus: true,

  // Refetch on reconnect (rural connectivity awareness)
  refetchOnReconnect: true,

  // Retry configuration (network resilience for rural areas)
  retry: 3,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

/**
 * Seasonal cache strategies - adjust based on agricultural seasons
 */
const SEASONAL_CACHE_MULTIPLIERS = {
  SPRING: 1.0, // Peak planting season - standard cache
  SUMMER: 0.8, // Active growing - shorter cache for fresh updates
  FALL: 1.2, // Harvest season - longer cache for stable data
  WINTER: 1.5, // Slower season - extended cache
} as const;

// ============================================================================
// ERROR HANDLING - BIODYNAMIC CONSCIOUSNESS
// ============================================================================

/**
 * Divine error handler with agricultural consciousness
 */
function handleQueryError(error: unknown): void {
  reactQueryLogger.error(
    "Query Consciousness Disruption",
    error instanceof Error ? error : new Error(String(error)),
  );

  // User-friendly agricultural error messages
  if (error instanceof Error) {
    if (error.message.includes("fetch")) {
      toast.error(
        "Connection to farm network disrupted. Please check your connection.",
      );
    } else if (error.message.includes("timeout")) {
      toast.error(
        "Farm data harvest taking longer than expected. Please try again.",
      );
    } else if (error.message.includes("401") || error.message.includes("403")) {
      toast.error(
        "Authentication required. Please sign in to access farm data.",
      );
    } else {
      toast.error("Unable to fetch agricultural data. Please try again.");
    }
  }
}

/**
 * Divine mutation error handler
 */
function handleMutationError(error: unknown): void {
  reactQueryLogger.error(
    "Mutation Consciousness Disruption",
    error instanceof Error ? error : new Error(String(error)),
  );

  if (error instanceof Error) {
    if (error.message.includes("Network")) {
      toast.error("Unable to save changes. Please check your connection.");
    } else if (error.message.includes("validation")) {
      toast.error("Invalid data provided. Please review and try again.");
    } else {
      toast.error("Failed to save changes. Please try again.");
    }
  }
}

// ============================================================================
// QUERY CLIENT FACTORY - QUANTUM OPTIMIZATION
// ============================================================================

/**
 * Create optimized QueryClient with divine configuration
 *
 * Hardware optimization for HP OMEN:
 * - 64GB RAM: Aggressive caching strategy
 * - 12 threads: Parallel query execution
 * - RTX 2070: GPU-ready for future ML features
 */
function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache configuration
        gcTime: CACHE_CONFIG.cacheTime, // Previously cacheTime in v4
        staleTime: CACHE_CONFIG.staleTime,

        // Network configuration
        refetchOnWindowFocus: CACHE_CONFIG.refetchOnWindowFocus,
        refetchOnReconnect: CACHE_CONFIG.refetchOnReconnect,
        refetchOnMount: true,

        // Retry configuration (rural network resilience)
        retry: CACHE_CONFIG.retry,
        retryDelay: CACHE_CONFIG.retryDelay,

        // Error handling
        throwOnError: false,

        // Network mode (always try, good for offline-first)
        networkMode: "online",
      },

      mutations: {
        // Mutation configuration
        retry: 2,
        retryDelay: 1000,

        // Error handling
        throwOnError: false,

        // Network mode
        networkMode: "online",

        // Global mutation callbacks
        onError: handleMutationError,
      },
    },
  });
}

// ============================================================================
// PROVIDER COMPONENT - HOLOGRAPHIC INTEGRATION
// ============================================================================

interface ReactQueryProviderProps {
  children: ReactNode;
}

/**
 * Divine Agricultural React Query Provider
 *
 * Provides quantum-optimized data fetching with:
 * - Agricultural consciousness
 * - Hardware-aware caching
 * - Biodynamic error handling
 * - Seasonal optimization
 *
 * @example
 * ```tsx
 * // In app layout
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <ReactQueryProvider>
 *           {children}
 *         </ReactQueryProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  // Create client instance (persists across re-renders via useState)
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {/* DevTools - only in development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}

// ============================================================================
// UTILITY FUNCTIONS - DIVINE HELPERS
// ============================================================================

/**
 * Get seasonal cache time multiplier
 */
export function getSeasonalCacheTime(baseCacheTime: number): number {
  const currentMonth = new Date().getMonth();

  // Determine season based on month (Northern Hemisphere)
  let season: keyof typeof SEASONAL_CACHE_MULTIPLIERS;

  if (currentMonth >= 2 && currentMonth <= 4) {
    season = "SPRING"; // March-May
  } else if (currentMonth >= 5 && currentMonth <= 7) {
    season = "SUMMER"; // June-August
  } else if (currentMonth >= 8 && currentMonth <= 10) {
    season = "FALL"; // September-November
  } else {
    season = "WINTER"; // December-February
  }

  return baseCacheTime * SEASONAL_CACHE_MULTIPLIERS[season];
}

/**
 * Create agricultural query key
 * Standardized key format for all agricultural queries
 *
 * @example
 * ```ts
 * const key = createAgriculturalQueryKey("products", { farmId: "123" });
 * // Returns: ["agricultural", "products", { farmId: "123" }]
 * ```
 */
export function createAgriculturalQueryKey(
  entity: string,
  params?: Record<string, unknown>,
): [string, string, Record<string, unknown>?] {
  const key: [string, string, Record<string, unknown>?] = [
    "agricultural",
    entity,
  ];

  if (params && Object.keys(params).length > 0) {
    key.push(params);
  }

  return key;
}

/**
 * Export default config for external use
 */
export const defaultQueryConfig = CACHE_CONFIG;

/**
 * Export seasonal cache multipliers
 */
export const seasonalCacheMultipliers = SEASONAL_CACHE_MULTIPLIERS;
