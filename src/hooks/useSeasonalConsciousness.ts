/**
 * SEASONAL CONSCIOUSNESS HOOK
 * Provides real-time seasonal awareness and agricultural timing
 */

import { useEffect, useState } from "react";

export type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";
export type LunarPhase =
  | "NEW_MOON"
  | "WAXING_CRESCENT"
  | "FIRST_QUARTER"
  | "WAXING_GIBBOUS"
  | "FULL_MOON"
  | "WANING_GIBBOUS"
  | "LAST_QUARTER"
  | "WANING_CRESCENT";

export interface SeasonalConsciousness {
  season: Season;
  lunarPhase: LunarPhase;
  plantingWindow: boolean;
  harvestWindow: boolean;
  optimalActivities: string[];
}

export function useSeasonalConsciousness(): SeasonalConsciousness {
  const [consciousness, setConsciousness] = useState<SeasonalConsciousness>({
    season: "SPRING",
    lunarPhase: "NEW_MOON",
    plantingWindow: false,
    harvestWindow: false,
    optimalActivities: [],
  });

  useEffect(() => {
    // Calculate current season based on date
    const now = new Date();
    const month = now.getMonth();

    let season: Season;
    if (month >= 2 && month <= 4) {
      season = "SPRING";
    } else if (month >= 5 && month <= 7) {
      season = "SUMMER";
    } else if (month >= 8 && month <= 10) {
      season = "FALL";
    } else {
      season = "WINTER";
    }

    // Simplified lunar phase calculation (would use actual lunar calendar in production)
    const dayOfMonth = now.getDate();
    let lunarPhase: LunarPhase;
    if (dayOfMonth < 4) {
      lunarPhase = "NEW_MOON";
    } else if (dayOfMonth < 8) {
      lunarPhase = "WAXING_CRESCENT";
    } else if (dayOfMonth < 11) {
      lunarPhase = "FIRST_QUARTER";
    } else if (dayOfMonth < 15) {
      lunarPhase = "WAXING_GIBBOUS";
    } else if (dayOfMonth < 18) {
      lunarPhase = "FULL_MOON";
    } else if (dayOfMonth < 22) {
      lunarPhase = "WANING_GIBBOUS";
    } else if (dayOfMonth < 26) {
      lunarPhase = "LAST_QUARTER";
    } else {
      lunarPhase = "WANING_CRESCENT";
    }

    // Determine planting/harvest windows
    const plantingWindow = season === "SPRING" || season === "FALL";
    const harvestWindow = season === "SUMMER" || season === "FALL";

    // Determine optimal activities
    const optimalActivities: string[] = [];
    if (season === "SPRING") {
      optimalActivities.push("planting", "soil preparation", "seedling care");
    } else if (season === "SUMMER") {
      optimalActivities.push("watering", "weeding", "growth monitoring");
    } else if (season === "FALL") {
      optimalActivities.push("harvesting", "preserving", "winter prep");
    } else {
      optimalActivities.push("planning", "equipment maintenance", "rest");
    }

    setConsciousness({
      season,
      lunarPhase,
      plantingWindow,
      harvestWindow,
      optimalActivities,
    });
  }, []);

  return consciousness;
}
