/**
 * ============================================================================
 * BIODYNAMIC CALENDAR WIDGET - Divine Agricultural Consciousness UI
 * ============================================================================
 *
 * Displays lunar phases, seasonal alignment, and farming recommendations
 * with agricultural consciousness visualization
 */

"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface BiodynamicData {
  id: string;
  farmId: string;
  lunarPhase: string;
  lunarDay: number;
  season: string;
  astronomicalDate: Date;
  plantingFavorability: number;
  harvestFavorability: number;
  soilWorkFavorability: number;
  recommendedActivities: string[];
  avoidActivities: string[];
  agriculturalConsciousness: number;
  createdAt: Date;
  updatedAt: Date;
}

interface BiodynamicCalendarWidgetProps {
  farmId: string;
  className?: string;
}

// ============================================================================
// LUNAR PHASE ICONS & LABELS
// ============================================================================

const LUNAR_PHASE_DATA = {
  NEW_MOON: {
    icon: "🌑",
    label: "New Moon",
    description: "Ideal for planting root crops",
  },
  WAXING_CRESCENT: {
    icon: "🌒",
    label: "Waxing Crescent",
    description: "Plant leafy greens",
  },
  FIRST_QUARTER: {
    icon: "🌓",
    label: "First Quarter",
    description: "Plant fruiting crops",
  },
  WAXING_GIBBOUS: {
    icon: "🌔",
    label: "Waxing Gibbous",
    description: "Water deeply",
  },
  FULL_MOON: {
    icon: "🌕",
    label: "Full Moon",
    description: "Optimal harvest time",
  },
  WANING_GIBBOUS: {
    icon: "🌖",
    label: "Waning Gibbous",
    description: "Harvest root crops",
  },
  LAST_QUARTER: {
    icon: "🌗",
    label: "Last Quarter",
    description: "Weed & prune",
  },
  WANING_CRESCENT: {
    icon: "🌘",
    label: "Waning Crescent",
    description: "Rest & regenerate",
  },
};

const SEASON_DATA = {
  SPRING: { icon: "🌸", color: "green", label: "Spring" },
  SUMMER: { icon: "☀️", color: "yellow", label: "Summer" },
  FALL: { icon: "🍂", color: "orange", label: "Fall" },
  WINTER: { icon: "❄️", color: "blue", label: "Winter" },
};

// ============================================================================
// COMPONENT
// ============================================================================

export function BiodynamicCalendarWidget({
  farmId,
  className = "",
}: BiodynamicCalendarWidgetProps) {
  const [data, setData] = useState<BiodynamicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBiodynamicData() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/agricultural/biodynamic-calendar?farmId=${farmId}&type=today`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch biodynamic calendar");
        }

        const result = await response.json();
        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    if (farmId) {
      fetchBiodynamicData();
    }
  }, [farmId]);

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-32 w-full" />
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-red-600">
          <h3 className="font-semibold text-lg mb-2">⚠️ Error</h3>
          <p>{error || "No data available"}</p>
        </div>
      </Card>
    );
  }

  const lunarPhaseInfo =
    LUNAR_PHASE_DATA[data.lunarPhase as keyof typeof LUNAR_PHASE_DATA];
  const seasonInfo = SEASON_DATA[data.season as keyof typeof SEASON_DATA];

  return (
    <Card
      className={`p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">
          🌾 Biodynamic Calendar
        </h2>
        <Badge variant="secondary" className="text-lg">
          {seasonInfo?.icon} {seasonInfo?.label}
        </Badge>
      </div>

      {/* Lunar Phase Display */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="text-6xl">{lunarPhaseInfo?.icon}</div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {lunarPhaseInfo?.label}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Day {data.lunarDay} of lunar cycle
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {lunarPhaseInfo?.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Consciousness</div>
            <div className="text-3xl font-bold text-green-600">
              {(data.agriculturalConsciousness * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Favorability Meters */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <FavorabilityMeter
          label="Planting"
          value={data.plantingFavorability}
          icon="🌱"
        />
        <FavorabilityMeter
          label="Harvesting"
          value={data.harvestFavorability}
          icon="🌾"
        />
        <FavorabilityMeter
          label="Soil Work"
          value={data.soilWorkFavorability}
          icon="🌍"
        />
      </div>

      {/* Recommended Activities */}
      {data.recommendedActivities.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
            ✅ Recommended Activities
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.recommendedActivities.map((activity) => (
              <Badge
                key={activity}
                variant="default"
                className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
              >
                {activity.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Avoid Activities */}
      {data.avoidActivities.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
            ⚠️ Avoid Today
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.avoidActivities.map((activity) => (
              <Badge
                key={activity}
                variant="error"
                className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
              >
                {activity.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// FAVORABILITY METER SUB-COMPONENT
// ============================================================================

interface FavorabilityMeterProps {
  label: string;
  value: number;
  icon: string;
}

function FavorabilityMeter({ label, value, icon }: FavorabilityMeterProps) {
  const getColor = (val: number) => {
    if (val >= 80) return "bg-green-500";
    if (val >= 60) return "bg-yellow-500";
    if (val >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {label}
        </span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full ${getColor(value)} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="text-right mt-1">
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {value}%
        </span>
      </div>
    </div>
  );
}
