// ============================================================================
// AGRICULTURAL COMPONENTS - Divine Exports
// Farmers Market Platform - Agricultural-Specific UI Components
// ============================================================================

// Individual Components
export { SeasonalIndicator } from "./SeasonalIndicator";
export type { Season, SeasonalIndicatorProps } from "./SeasonalIndicator";
export {
  getCurrentSeason,
  getSeasonConfig,
  isSeasonalActivity,
} from "./SeasonalIndicator";

export { HarvestCalendar } from "./HarvestCalendar";
export type {
  HarvestEvent,
  HarvestStatus,
  CropType,
  HarvestCalendarProps,
} from "./HarvestCalendar";
export {
  STATUS_CONFIG as HARVEST_STATUS_CONFIG,
  CROP_ICONS,
} from "./HarvestCalendar";

export { WeatherWidget } from "./WeatherWidget";
export type {
  WeatherCondition,
  WeatherData,
  ForecastDay,
  WeatherWidgetProps,
} from "./WeatherWidget";
export { WEATHER_CONFIG } from "./WeatherWidget";

export { SoilHealthMeter } from "./SoilHealthMeter";
export type {
  SoilHealthStatus,
  SoilMetric,
  SoilHealthData,
  SoilHealthMeterProps,
} from "./SoilHealthMeter";
export {
  calculateSoilHealth,
  getMetricStatus,
  getMetrics,
} from "./SoilHealthMeter";

export { BiodynamicBadge, BiodynamicBadgeGroup } from "./BiodynamicBadge";
export type {
  CertificationType,
  BadgeSize,
  BadgeVariant,
  BiodynamicBadgeProps,
  BiodynamicBadgeGroupProps,
} from "./BiodynamicBadge";
export {
  CERTIFICATION_CONFIG,
  getCertificationConfig,
  isValidCertification,
  getAllCertificationTypes,
  getCertificationsByCategory,
} from "./BiodynamicBadge";

// Legacy Components (if any)
export { BiodynamicCalendarWidget } from "./BiodynamicCalendarWidget";

// ============================================================================
// RE-EXPORT COMMON TYPES
// ============================================================================

export type AgriculturalComponent =
  | "SeasonalIndicator"
  | "HarvestCalendar"
  | "WeatherWidget"
  | "SoilHealthMeter"
  | "BiodynamicBadge";

// ============================================================================
// UTILITY TYPE GUARDS
// ============================================================================

import type { Season } from "./SeasonalIndicator";
import type { WeatherCondition } from "./WeatherWidget";
import type { HarvestStatus } from "./HarvestCalendar";
import type { SoilHealthStatus } from "./SoilHealthMeter";

export function isValidSeason(value: string): value is Season {
  return ["SPRING", "SUMMER", "FALL", "WINTER"].includes(value);
}

export function isValidWeatherCondition(
  value: string,
): value is WeatherCondition {
  return [
    "CLEAR",
    "PARTLY_CLOUDY",
    "CLOUDY",
    "RAIN",
    "DRIZZLE",
    "SNOW",
    "THUNDERSTORM",
    "FOG",
    "WINDY",
  ].includes(value);
}

export function isValidHarvestStatus(value: string): value is HarvestStatus {
  return ["PLANNED", "IN_PROGRESS", "COMPLETED", "DELAYED"].includes(value);
}

export function isValidSoilHealthStatus(
  value: string,
): value is SoilHealthStatus {
  return ["EXCELLENT", "GOOD", "FAIR", "POOR", "CRITICAL"].includes(value);
}
