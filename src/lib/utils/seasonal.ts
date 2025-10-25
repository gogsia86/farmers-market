/**
 * Seasonal Utilities - Agricultural Time Management
 * Divine seasonal consciousness patterns
 */

import { Season } from "@/types/agricultural";

/**
 * Determine current season based on date
 * Uses meteorological seasons (not astronomical)
 */
export function getCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth(); // 0-11

  // Meteorological seasons (Northern Hemisphere)
  if (month >= 2 && month <= 4) return "SPRING"; // Mar, Apr, May
  if (month >= 5 && month <= 7) return "SUMMER"; // Jun, Jul, Aug
  if (month >= 8 && month <= 10) return "FALL"; // Sep, Oct, Nov
  return "WINTER"; // Dec, Jan, Feb
}

/**
 * Get season display name
 */
export function getSeasonName(season: Season): string {
  const seasonNames: Record<Season, string> = {
    SPRING: "Spring",
    SUMMER: "Summer",
    FALL: "Fall",
    WINTER: "Winter",
  };
  return seasonNames[season];
}

/**
 * Get season emoji
 */
export function getSeasonEmoji(season: Season): string {
  const seasonEmojis: Record<Season, string> = {
    SPRING: "🌱",
    SUMMER: "☀️",
    FALL: "🍂",
    WINTER: "❄️",
  };
  return seasonEmojis[season];
}

/**
 * Check if a product is in season
 */
export function isInSeason(
  seasonalStart: Date | null,
  seasonalEnd: Date | null,
  checkDate: Date = new Date()
): boolean {
  if (!seasonalStart || !seasonalEnd) return true; // Not seasonal

  const start = new Date(seasonalStart);
  const end = new Date(seasonalEnd);

  // Handle cross-year seasons (e.g., Dec-Mar)
  if (start.getMonth() > end.getMonth()) {
    return checkDate >= start || checkDate <= end;
  }

  return checkDate >= start && checkDate <= end;
}

/**
 * Get all seasons
 */
export function getAllSeasons(): Season[] {
  return ["SPRING", "SUMMER", "FALL", "WINTER"];
}

/**
 * Get next season
 */
export function getNextSeason(currentSeason: Season): Season {
  const seasons = getAllSeasons();
  const currentIndex = seasons.indexOf(currentSeason);
  return seasons[(currentIndex + 1) % seasons.length];
}

/**
 * Get previous season
 */
export function getPreviousSeason(currentSeason: Season): Season {
  const seasons = getAllSeasons();
  const currentIndex = seasons.indexOf(currentSeason);
  return seasons[(currentIndex - 1 + seasons.length) % seasons.length];
}
