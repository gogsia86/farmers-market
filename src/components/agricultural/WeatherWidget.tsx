"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  CloudDrizzle,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  CloudFog,
  Zap,
  CloudSun
} from "lucide-react";

// ============================================================================
// TYPES & INTERFACES - Divine Agricultural Type System
// ============================================================================

export type WeatherCondition =
  | "CLEAR"
  | "PARTLY_CLOUDY"
  | "CLOUDY"
  | "RAIN"
  | "DRIZZLE"
  | "SNOW"
  | "THUNDERSTORM"
  | "FOG"
  | "WINDY";

export interface WeatherData {
  condition: WeatherCondition;
  temperature: number;
  feelsLike?: number;
  humidity: number;
  windSpeed: number;
  windDirection?: string;
  precipitation?: number;
  visibility?: number;
  pressure?: number;
  uvIndex?: number;
  sunrise?: string;
  sunset?: string;
  lastUpdated?: Date;
}

export interface ForecastDay {
  date: Date;
  condition: WeatherCondition;
  tempHigh: number;
  tempLow: number;
  precipitation?: number;
}

export interface WeatherWidgetProps {
  /** Current weather data */
  weather: WeatherData;
  /** Optional forecast data */
  forecast?: ForecastDay[];
  /** Location name */
  location: string;
  /** Display variant */
  variant?: "default" | "compact" | "detailed";
  /** Show forecast */
  showForecast?: boolean;
  /** Show agricultural tips */
  showAgriculturalTips?: boolean;
  /** Custom className */
  className?: string;
  /** Animated transitions */
  animated?: boolean;
  /** On refresh handler */
  onRefresh?: () => void;
}

interface WeatherConfig {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  gradient: string;
  description: string;
  agriculturalTip: string;
}

// ============================================================================
// WEATHER CONFIGURATIONS - Biodynamic Consciousness
// ============================================================================

const WEATHER_CONFIG: Record<WeatherCondition, WeatherConfig> = {
  CLEAR: {
    label: "Clear",
    icon: Sun,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    gradient: "from-amber-400 to-orange-500",
    description: "Clear skies",
    agriculturalTip: "Perfect for outdoor work and harvesting"
  },
  PARTLY_CLOUDY: {
    label: "Partly Cloudy",
    icon: CloudSun,
    color: "text-blue-400",
    bgColor: "bg-blue-50",
    gradient: "from-blue-400 to-cyan-400",
    description: "Partly cloudy",
    agriculturalTip: "Good conditions for most farm activities"
  },
  CLOUDY: {
    label: "Cloudy",
    icon: Cloud,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    gradient: "from-gray-400 to-gray-500",
    description: "Overcast",
    agriculturalTip: "Ideal for transplanting and shade-tolerant work"
  },
  RAIN: {
    label: "Rain",
    icon: CloudRain,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    gradient: "from-blue-500 to-blue-700",
    description: "Rainy",
    agriculturalTip: "Natural irrigation - avoid soil compaction"
  },
  DRIZZLE: {
    label: "Drizzle",
    icon: CloudDrizzle,
    color: "text-cyan-500",
    bgColor: "bg-cyan-50",
    gradient: "from-cyan-400 to-blue-500",
    description: "Light rain",
    agriculturalTip: "Light watering - good for seedlings"
  },
  SNOW: {
    label: "Snow",
    icon: CloudSnow,
    color: "text-blue-300",
    bgColor: "bg-blue-50",
    gradient: "from-blue-200 to-blue-400",
    description: "Snowing",
    agriculturalTip: "Protect sensitive plants and check greenhouses"
  },
  THUNDERSTORM: {
    label: "Thunderstorm",
    icon: Zap,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    gradient: "from-purple-500 to-indigo-600",
    description: "Stormy",
    agriculturalTip: "Seek shelter - avoid outdoor activities"
  },
  FOG: {
    label: "Foggy",
    icon: CloudFog,
    color: "text-gray-400",
    bgColor: "bg-gray-50",
    gradient: "from-gray-300 to-gray-400",
    description: "Foggy",
    agriculturalTip: "Reduced visibility - be cautious with equipment"
  },
  WINDY: {
    label: "Windy",
    icon: Wind,
    color: "text-teal-500",
    bgColor: "bg-teal-50",
    gradient: "from-teal-400 to-cyan-500",
    description: "Windy conditions",
    agriculturalTip: "Secure loose items and check plant supports"
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getWindDirection(degrees?: string): string {
  if (!degrees) return "N";
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(parseFloat(degrees) / 45) % 8;
  return directions[index];
}

function formatTime(timeString?: string): string {
  if (!timeString) return "--:--";
  try {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return "--:--";
  }
}

// ============================================================================
// WEATHER WIDGET COMPONENT - Divine Implementation
// ============================================================================

export function WeatherWidget({
  weather,
  forecast = [],
  location,
  variant = "default",
  showForecast = true,
  showAgriculturalTips = true,
  className,
  animated = true,
  onRefresh
}: WeatherWidgetProps) {
  const config = WEATHER_CONFIG[weather.condition];
  const WeatherIcon = config.icon;

  // Compact variant - minimal display
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-3 px-4 py-2 rounded-lg border",
          config.bgColor,
          "border-gray-200",
          animated && "transition-all duration-300",
          className
        )}
        role="region"
        aria-label={`Weather: ${config.label}, ${weather.temperature}°C`}
      >
        <WeatherIcon className={cn("h-5 w-5", config.color)} aria-hidden="true" />
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">
              {weather.temperature}°
            </span>
            <span className="text-sm text-gray-500">{config.label}</span>
          </div>
          <p className="text-xs text-gray-600">{location}</p>
        </div>
      </div>
    );
  }

  // Detailed variant - comprehensive display
  if (variant === "detailed") {
    return (
      <div
        className={cn(
          "rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden",
          className
        )}
        role="region"
        aria-label={`Detailed weather for ${location}`}
      >
        {/* Header with gradient */}
        <div
          className={cn(
            "p-6 bg-gradient-to-br text-white",
            config.gradient
          )}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold opacity-90">{location}</h3>
              <p className="text-sm opacity-75">
                {weather.lastUpdated
                  ? `Updated ${new Date(weather.lastUpdated).toLocaleTimeString()}`
                  : "Current conditions"}
              </p>
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className={cn(
                  "p-2 rounded-full hover:bg-white/20",
                  "focus:outline-none focus:ring-2 focus:ring-white/50",
                  animated && "transition-colors"
                )}
                aria-label="Refresh weather"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-6">
            <WeatherIcon className="h-16 w-16" aria-hidden="true" />
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{weather.temperature}°</span>
                {weather.feelsLike && (
                  <span className="text-lg opacity-75">
                    Feels {weather.feelsLike}°
                  </span>
                )}
              </div>
              <p className="text-lg mt-1">{config.description}</p>
            </div>
          </div>
        </div>

        {/* Detailed metrics */}
        <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Droplets className="h-5 w-5 text-blue-500" aria-hidden="true" />
            <div>
              <p className="text-xs text-gray-500">Humidity</p>
              <p className="text-sm font-semibold text-gray-900">
                {weather.humidity}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Wind className="h-5 w-5 text-teal-500" aria-hidden="true" />
            <div>
              <p className="text-xs text-gray-500">Wind</p>
              <p className="text-sm font-semibold text-gray-900">
                {weather.windSpeed} km/h {getWindDirection(weather.windDirection)}
              </p>
            </div>
          </div>

          {weather.pressure && (
            <div className="flex items-center gap-3">
              <Gauge className="h-5 w-5 text-purple-500" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-500">Pressure</p>
                <p className="text-sm font-semibold text-gray-900">
                  {weather.pressure} hPa
                </p>
              </div>
            </div>
          )}

          {weather.visibility && (
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-gray-500" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-500">Visibility</p>
                <p className="text-sm font-semibold text-gray-900">
                  {weather.visibility} km
                </p>
              </div>
            </div>
          )}

          {weather.sunrise && (
            <div className="flex items-center gap-3">
              <Sunrise className="h-5 w-5 text-orange-500" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-500">Sunrise</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatTime(weather.sunrise)}
                </p>
              </div>
            </div>
          )}

          {weather.sunset && (
            <div className="flex items-center gap-3">
              <Sunset className="h-5 w-5 text-orange-600" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-500">Sunset</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatTime(weather.sunset)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Agricultural tip */}
        {showAgriculturalTips && (
          <div className="border-t border-gray-200 bg-green-50 p-4">
            <div className="flex items-start gap-2">
              <svg
                className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-900">
                  Agricultural Tip
                </p>
                <p className="text-sm text-green-700 mt-0.5">
                  {config.agriculturalTip}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Forecast */}
        {showForecast && forecast.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              5-Day Forecast
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {forecast.slice(0, 5).map((day, index) => {
                const dayConfig = WEATHER_CONFIG[day.condition];
                const DayIcon = dayConfig.icon;
                const dayName = new Date(day.date).toLocaleDateString("en-US", {
                  weekday: "short"
                });

                return (
                  <div
                    key={index}
                    className={cn(
                      "text-center p-2 rounded-lg border border-gray-200",
                      "hover:bg-gray-50",
                      animated && "transition-colors"
                    )}
                  >
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {dayName}
                    </p>
                    <DayIcon
                      className={cn("h-6 w-6 mx-auto mb-1", dayConfig.color)}
                      aria-hidden="true"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-gray-900">
                        {day.tempHigh}°
                      </span>
                      <span className="text-gray-500 mx-0.5">/</span>
                      <span className="text-gray-500">{day.tempLow}°</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default variant - balanced display
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden",
        className
      )}
      role="region"
      aria-label={`Weather for ${location}`}
    >
      {/* Main weather display */}
      <div className={cn("p-4", config.bgColor)}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">{location}</h3>
            <p className="text-xs text-gray-500">{config.description}</p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className={cn(
                "p-1.5 rounded-full hover:bg-white/50",
                "focus:outline-none focus:ring-2 focus:ring-gray-300",
                animated && "transition-colors"
              )}
              aria-label="Refresh weather"
            >
              <svg
                className="h-4 w-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <WeatherIcon className={cn("h-12 w-12", config.color)} aria-hidden="true" />
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gray-900">
                {weather.temperature}°
              </span>
              {weather.feelsLike && (
                <span className="text-sm text-gray-500">
                  feels {weather.feelsLike}°
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Droplets className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{weather.windSpeed} km/h</span>
          </div>
        </div>
      </div>

      {/* Agricultural tip */}
      {showAgriculturalTips && (
        <div className="border-t border-gray-200 bg-green-50 p-3">
          <p className="text-xs text-green-800">
            💡 {config.agriculturalTip}
          </p>
        </div>
      )}

      {/* Mini forecast */}
      {showForecast && forecast.length > 0 && (
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {forecast.slice(0, 3).map((day, index) => {
              const dayConfig = WEATHER_CONFIG[day.condition];
              const DayIcon = dayConfig.icon;
              const dayName = new Date(day.date).toLocaleDateString("en-US", {
                weekday: "short"
              });

              return (
                <div
                  key={index}
                  className="flex-shrink-0 text-center px-2 py-1 rounded border border-gray-200"
                >
                  <p className="text-xs text-gray-600 mb-1">{dayName}</p>
                  <DayIcon
                    className={cn("h-4 w-4 mx-auto", dayConfig.color)}
                    aria-hidden="true"
                  />
                  <p className="text-xs font-medium text-gray-900 mt-1">
                    {day.tempHigh}°/{day.tempLow}°
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export { WEATHER_CONFIG };

// ============================================================================
// DISPLAY NAME - For React DevTools
// ============================================================================

WeatherWidget.displayName = "WeatherWidget";

// ============================================================================
// EXPORTS
// ============================================================================

export default WeatherWidget;
