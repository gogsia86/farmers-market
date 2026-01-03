import { agriculturalConsciousness } from "@/lib/ai/AgriculturalConsciousness";
import { agriculturalLogger } from "@/lib/utils/logger";
import type { NavigationPattern, Season } from "@/types/agricultural";
import { useEffect, useState } from "react";

/**
 * Custom hook for agricultural consciousness integration
 * Provides quantum-enhanced navigation patterns
 */
export function useAgriculturalConsciousness() {
  const [patterns, setPatterns] = useState<NavigationPattern | null>(null);

  /**
   * Get current agricultural season with biodynamic awareness
   */
  const getCurrentSeason = (): Season => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "SPRING";
    if (month >= 5 && month <= 7) return "SUMMER";
    if (month >= 8 && month <= 10) return "FALL";
    return "WINTER";
  };

  // Initialize consciousness asynchronously
  useEffect(() => {
    let isMounted = true;

    try {
      // Use the consciousness engine to provide a complete NavigationPattern
      const pattern = agriculturalConsciousness.getNavigationPattern();

      if (isMounted) {
        // pattern already contains the full NavigationPattern shape
        setPatterns(pattern);
      }
    } catch (error: unknown) {
      agriculturalLogger.error(
        "Error initializing agricultural consciousness",
        error instanceof Error ? error : new Error(String(error)),
      );
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    getCurrentSeason,
    season: getCurrentSeason(), // ✅ Added for QuantumNavigation compatibility
    navigationPattern: patterns, // ✅ Alias for backward compatibility
    consciousness: agriculturalConsciousness.getState(), // ✅ Direct consciousness access
    patterns,
    isLoading: patterns === null,
  };
}
