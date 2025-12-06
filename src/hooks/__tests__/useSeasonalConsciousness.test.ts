/**
 * SEASONAL CONSCIOUSNESS HOOK TESTS
 * Validates seasonal awareness and biodynamic patterns
 */

import React from "react";
import { renderHook } from "@testing-library/react";
import {
  useSeasonalConsciousness,
  type Season,
} from "../useSeasonalConsciousness";

describe("useSeasonalConsciousness", () => {
  describe("Hook Initialization", () => {
    it("should initialize with default seasonal awareness", () => {
      const { result } = renderHook(() => useSeasonalConsciousness());

      expect(result.current).toBeDefined();
      expect(typeof result.current).toBe("object");
    });

    it("should detect current season", () => {
      const { result } = renderHook(() => useSeasonalConsciousness());

      expect(result.current.season).toBeDefined();
      const validSeasons: Season[] = ["SPRING", "SUMMER", "FALL", "WINTER"];
      expect(validSeasons).toContain(result.current.season);
    });

    it("should detect lunar phase", () => {
      const { result } = renderHook(() => useSeasonalConsciousness());

      expect(result.current.lunarPhase).toBeDefined();
      expect(typeof result.current.lunarPhase).toBe("string");
    });
  });

  describe("Seasonal Patterns", () => {
    it("should provide optimal activities", () => {
      const { result } = renderHook(() => useSeasonalConsciousness());

      expect(result.current.optimalActivities).toBeDefined();
      expect(Array.isArray(result.current.optimalActivities)).toBe(true);
      expect(result.current.optimalActivities.length).toBeGreaterThan(0);
    });

    it("should calculate planting windows", () => {
      const { result } = renderHook(() => useSeasonalConsciousness());

      expect(result.current.plantingWindow).toBeDefined();
      expect(typeof result.current.plantingWindow).toBe("boolean");
    });

    it("should calculate harvest windows", () => {
      const { result } = renderHook(() => useSeasonalConsciousness());

      expect(result.current.harvestWindow).toBeDefined();
      expect(typeof result.current.harvestWindow).toBe("boolean");
    });
  });

  describe("Agricultural Consciousness", () => {
    it("should provide consistent seasonal data", () => {
      const { result } = renderHook(() => useSeasonalConsciousness());

      // All properties should be defined
      expect(result.current.season).toBeDefined();
      expect(result.current.lunarPhase).toBeDefined();
      expect(result.current.plantingWindow).toBeDefined();
      expect(result.current.harvestWindow).toBeDefined();
      expect(result.current.optimalActivities).toBeDefined();
    });

    it("should return valid season for current date", () => {
      const { result } = renderHook(() => useSeasonalConsciousness());

      // Dynamically determine expected season based on current month
      const now = new Date();
      const month = now.getMonth();

      let expectedSeason: Season;
      if (month >= 2 && month <= 4) {
        expectedSeason = "SPRING";
      } else if (month >= 5 && month <= 7) {
        expectedSeason = "SUMMER";
      } else if (month >= 8 && month <= 10) {
        expectedSeason = "FALL";
      } else {
        expectedSeason = "WINTER";
      }

      expect(result.current.season).toBe(expectedSeason);
    });
  });
});
