/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🌾 SEASONAL UTILITIES - AGRICULTURAL SEASON MANAGEMENT          ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Purpose: Utility functions for seasonal calculations            ║
 * ║  Features:                                                       ║
 * ║    • Season Detection                                           ║
 * ║    • Season Transitions                                         ║
 * ║    • Agricultural Calendar Integration                          ║
 * ║  Version: 1.0.0                                                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

export type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";

/**
 * Get current season based on current date
 */
export function getCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth(); // 0-11

  // Spring: March, April, May (months 2, 3, 4)
  if (month >= 2 && month <= 4) {
    return "SPRING";
  }

  // Summer: June, July, August (months 5, 6, 7)
  if (month >= 5 && month <= 7) {
    return "SUMMER";
  }

  // Fall: September, October, November (months 8, 9, 10)
  if (month >= 8 && month <= 10) {
    return "FALL";
  }

  // Winter: December, January, February (months 11, 0, 1)
  return "WINTER";
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
  const seasons: Season[] = ["SPRING", "SUMMER", "FALL", "WINTER"];
  const currentIndex = seasons.indexOf(currentSeason);
  return seasons[(currentIndex + 1) % 4];
}

/**
 * Get previous season
 */
export function getPreviousSeason(currentSeason: Season): Season {
  const seasons: Season[] = ["SPRING", "SUMMER", "FALL", "WINTER"];
  const currentIndex = seasons.indexOf(currentSeason);
  return seasons[(currentIndex - 1 + 4) % 4];
}

/**
 * Get adjacent seasons (previous and next)
 */
export function getAdjacentSeasons(currentSeason: Season): Season[] {
  return [getPreviousSeason(currentSeason), getNextSeason(currentSeason)];
}

/**
 * Check if a product is in season
 */
export function isInSeason(
  productSeasons: Season[],
  season: Season = getCurrentSeason()
): boolean {
  return productSeasons.includes(season);
}

/**
 * Get season name in readable format
 */
export function getSeasonName(season: Season): string {
  const names: Record<Season, string> = {
    SPRING: "Spring",
    SUMMER: "Summer",
    FALL: "Fall",
    WINTER: "Winter",
  };
  return names[season];
}

/**
 * Get season emoji
 */
export function getSeasonEmoji(season: Season): string {
  const emojis: Record<Season, string> = {
    SPRING: "🌱",
    SUMMER: "☀️",
    FALL: "🍂",
    WINTER: "❄️",
  };
  return emojis[season];
}

/**
 * Get season description
 */
export function getSeasonDescription(season: Season): string {
  const descriptions: Record<Season, string> = {
    SPRING: "Fresh spring produce and early season vegetables",
    SUMMER: "Peak harvest season with abundant fruits and vegetables",
    FALL: "Hearty autumn crops and root vegetables",
    WINTER: "Cold-weather crops and stored produce",
  };
  return descriptions[season];
}

/**
 * Get season months
 */
export function getSeasonMonths(season: Season): number[] {
  const months: Record<Season, number[]> = {
    SPRING: [2, 3, 4], // March, April, May
    SUMMER: [5, 6, 7], // June, July, August
    FALL: [8, 9, 10],  // September, October, November
    WINTER: [11, 0, 1], // December, January, February
  };
  return months[season];
}

/**
 * Calculate days until next season
 */
export function daysUntilNextSeason(date: Date = new Date()): number {
  const currentSeason = getCurrentSeason(date);
  const year = date.getFullYear();
  const month = date.getMonth();

  // Season transition dates (first day of each season)
  const transitions = [
    { season: "SPRING" as Season, month: 2, day: 1 },  // March 1
    { season: "SUMMER" as Season, month: 5, day: 1 },  // June 1
    { season: "FALL" as Season, month: 8, day: 1 },    // September 1
    { season: "WINTER" as Season, month: 11, day: 1 }, // December 1
  ];

  // Find next transition
  for (const transition of transitions) {
    const transitionDate = new Date(year, transition.month, transition.day);
    if (transitionDate > date) {
      const diffTime = transitionDate.getTime() - date.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  // If no transition found this year, next is spring of next year
  const nextSpring = new Date(year + 1, 2, 1);
  const diffTime = nextSpring.getTime() - date.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get season progress (0-1, where 0 is start and 1 is end)
 */
export function getSeasonProgress(date: Date = new Date()): number {
  const season = getCurrentSeason(date);
  const seasonMonths = getSeasonMonths(season);
  const currentMonth = date.getMonth();
  const currentDay = date.getDate();

  // Find position in season
  const monthIndex = seasonMonths.indexOf(currentMonth);
  if (monthIndex === -1) return 0;

  // Calculate progress (roughly, assuming 30 days per month)
  const progress = (monthIndex * 30 + currentDay) / 90;
  return Math.min(Math.max(progress, 0), 1);
}

/**
 * Check if we're at the start of a season (first week)
 */
export function isSeasonStart(date: Date = new Date()): boolean {
  const progress = getSeasonProgress(date);
  return progress < 0.1; // First ~10% of season
}

/**
 * Check if we're at the end of a season (last week)
 */
export function isSeasonEnd(date: Date = new Date()): boolean {
  const progress = getSeasonProgress(date);
  return progress > 0.9; // Last ~10% of season
}
