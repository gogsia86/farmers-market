"use client";

// 🌾 HARVEST PLANNER - Divine Seasonal Harvest Planning Component
// Specialized planning tool for harvest scheduling with seasonal awareness
// Follows divine patterns from Day 6 components

import { cn } from "@/lib/utils";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Cloud,
  Leaf,
  Plus,
  Snowflake,
  Sprout,
  Sun,
  Wheat
} from "lucide-react";
import { useMemo, useState } from "react";
import { BiodynamicCalendar, type CalendarEvent } from "./BiodynamicCalendar";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";

export type CropType =
  | "vegetables"
  | "fruits"
  | "grains"
  | "herbs"
  | "flowers"
  | "other";

export type GrowthStage =
  | "planning"
  | "preparing"
  | "planting"
  | "growing"
  | "harvesting"
  | "completed";

export interface HarvestPlan {
  id: string;
  cropName: string;
  cropType: CropType;
  plantingDate: Date;
  expectedHarvestDate: Date;
  actualHarvestDate?: Date;
  quantity?: number;
  unit?: string;
  location?: string;
  notes?: string;
  stage: GrowthStage;
  season: Season;
  weatherConsiderations?: string[];
  metadata?: Record<string, any>;
}

export interface SeasonalRecommendation {
  season: Season;
  crops: string[];
  tips: string[];
  weatherNotes: string;
}

export interface HarvestPlannerProps {
  plans: HarvestPlan[];
  onPlanCreate?: (plan: Omit<HarvestPlan, "id">) => void;
  onPlanUpdate?: (id: string, plan: Partial<HarvestPlan>) => void;
  onPlanDelete?: (id: string) => void;
  view?: "calendar" | "timeline" | "list";
  showRecommendations?: boolean;
  readOnly?: boolean;
  className?: string;
  agriculturalConsciousness?: "low" | "medium" | "high";
}

// ============================================================================
// SEASONAL DATA & RECOMMENDATIONS
// ============================================================================

const seasonalRecommendations: Record<Season, SeasonalRecommendation> = {
  SPRING: {
    season: "SPRING",
    crops: [
      "Lettuce",
      "Spinach",
      "Peas",
      "Radishes",
      "Carrots",
      "Broccoli",
      "Cabbage",
      "Onions",
    ],
    tips: [
      "Start seeds indoors 6-8 weeks before last frost",
      "Prepare soil with compost and organic matter",
      "Monitor soil temperature (55°F+ for most crops)",
      "Watch for late frost warnings",
    ],
    weatherNotes:
      "Mild temperatures, increasing daylight. Watch for unexpected frosts.",
  },
  SUMMER: {
    season: "SUMMER",
    crops: [
      "Tomatoes",
      "Peppers",
      "Cucumbers",
      "Squash",
      "Beans",
      "Corn",
      "Melons",
      "Eggplant",
    ],
    tips: [
      "Ensure consistent watering during heat waves",
      "Mulch to retain moisture and control weeds",
      "Monitor for pests and diseases in warm weather",
      "Harvest regularly to encourage production",
    ],
    weatherNotes:
      "Hot temperatures, high sun exposure. Irrigation crucial during dry spells.",
  },
  FALL: {
    season: "FALL",
    crops: [
      "Kale",
      "Brussels Sprouts",
      "Cauliflower",
      "Beets",
      "Turnips",
      "Winter Squash",
      "Pumpkins",
      "Garlic",
    ],
    tips: [
      "Plant cool-season crops 6-8 weeks before first frost",
      "Extend season with row covers or cold frames",
      "Cure and store harvested crops properly",
      "Prepare garden beds for winter",
    ],
    weatherNotes:
      "Cooling temperatures, shorter days. First frost typically in late October.",
  },
  WINTER: {
    season: "WINTER",
    crops: [
      "Winter Wheat",
      "Cover Crops",
      "Cold Frame Greens",
      "Overwintered Onions",
      "Garlic (planted in fall)",
    ],
    tips: [
      "Plan next year's crop rotation",
      "Maintain and repair equipment",
      "Start seeds indoors for early spring",
      "Review this year's successes and challenges",
    ],
    weatherNotes:
      "Cold temperatures, dormant season. Focus on planning and preparation.",
  },
};

const getSeasonIcon = (season: Season) => {
  switch (season) {
    case "SPRING":
      return Sprout;
    case "SUMMER":
      return Sun;
    case "FALL":
      return Leaf;
    case "WINTER":
      return Snowflake;
  }
};

const getSeasonColor = (season: Season): string => {
  switch (season) {
    case "SPRING":
      return "emerald";
    case "SUMMER":
      return "amber";
    case "FALL":
      return "orange";
    case "WINTER":
      return "blue";
  }
};

const getStageColor = (stage: GrowthStage): string => {
  switch (stage) {
    case "planning":
      return "bg-gray-100 text-gray-700 border-gray-300";
    case "preparing":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "planting":
      return "bg-emerald-100 text-emerald-700 border-emerald-300";
    case "growing":
      return "bg-green-100 text-green-700 border-green-300";
    case "harvesting":
      return "bg-amber-100 text-amber-700 border-amber-300";
    case "completed":
      return "bg-purple-100 text-purple-700 border-purple-300";
  }
};

const getCropTypeIcon = (type: CropType) => {
  switch (type) {
    case "vegetables":
      return Leaf;
    case "fruits":
      return Sun;
    case "grains":
      return Wheat;
    case "herbs":
      return Sprout;
    case "flowers":
      return Sun;
    default:
      return Calendar;
  }
};

// ============================================================================
// PLAN CARD COMPONENT
// ============================================================================

interface PlanCardProps {
  plan: HarvestPlan;
  onEdit?: (plan: HarvestPlan) => void;
  onDelete?: (id: string) => void;
  readOnly: boolean;
}

function PlanCard({ plan, onEdit, onDelete, readOnly }: PlanCardProps) {
  const [expanded, setExpanded] = useState(false);
  const CropIcon = getCropTypeIcon(plan.cropType);
  const SeasonIcon = getSeasonIcon(plan.season);

  const daysUntilHarvest = Math.ceil(
    (plan.expectedHarvestDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-green-100 p-2">
            <CropIcon className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{plan.cropName}</h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-gray-600 capitalize">
                {plan.cropType}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <div className="flex items-center gap-1">
                <SeasonIcon className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600">{plan.season}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stage Badge */}
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs font-medium",
            getStageColor(plan.stage)
          )}
        >
          {plan.stage.replace("_", " ").toUpperCase()}
        </span>
      </div>

      {/* Quick Info */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-gray-600">Planting Date</div>
          <div className="mt-0.5 text-sm font-medium text-gray-900">
            {plan.plantingDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Expected Harvest</div>
          <div className="mt-0.5 text-sm font-medium text-gray-900">
            {plan.expectedHarvestDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Days Until Harvest */}
      {daysUntilHarvest > 0 && plan.stage !== "completed" && (
        <div className="mt-3 rounded-lg bg-green-50 px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-green-700">
              Days until harvest
            </span>
            <span className="text-sm font-bold text-green-700">
              {daysUntilHarvest} days
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-green-200">
            <div
              className="h-1.5 rounded-full bg-green-600 transition-all"
              style={{
                width: `${Math.min(
                  100,
                  ((plan.expectedHarvestDate.getTime() - plan.plantingDate.getTime() -
                    (plan.expectedHarvestDate.getTime() - new Date().getTime())) /
                    (plan.expectedHarvestDate.getTime() - plan.plantingDate.getTime())) *
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Expandable Details */}
      {expanded && (
        <div className="mt-4 space-y-3 border-t pt-4">
          {plan.location && (
            <div>
              <div className="text-xs font-medium text-gray-600">Location</div>
              <div className="mt-1 text-sm text-gray-900">{plan.location}</div>
            </div>
          )}

          {plan.quantity && (
            <div>
              <div className="text-xs font-medium text-gray-600">
                Expected Yield
              </div>
              <div className="mt-1 text-sm text-gray-900">
                {plan.quantity} {plan.unit || "units"}
              </div>
            </div>
          )}

          {plan.notes && (
            <div>
              <div className="text-xs font-medium text-gray-600">Notes</div>
              <div className="mt-1 text-sm text-gray-700">{plan.notes}</div>
            </div>
          )}

          {plan.weatherConsiderations &&
            plan.weatherConsiderations.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-600">
                  Weather Considerations
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {plan.weatherConsiderations.map((consideration, i) => (
                    <span
                      key={i}
                      className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                    >
                      {consideration}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {plan.actualHarvestDate && (
            <div>
              <div className="text-xs font-medium text-gray-600">
                Actual Harvest Date
              </div>
              <div className="mt-1 text-sm text-gray-900">
                {plan.actualHarvestDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Less Details
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              More Details
            </>
          )}
        </button>

        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(plan)}
              className="text-xs font-medium text-green-600 hover:text-green-700"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(plan.id)}
              className="text-xs font-medium text-red-600 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SEASONAL RECOMMENDATIONS COMPONENT
// ============================================================================

interface SeasonalRecommendationsProps {
  season: Season;
}

function SeasonalRecommendations({ season }: SeasonalRecommendationsProps) {
  const recommendation = seasonalRecommendations[season];
  const SeasonIcon = getSeasonIcon(season);
  const seasonColor = getSeasonColor(season);

  const colorClasses = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
  };

  const bgClass = colorClasses[seasonColor as keyof typeof colorClasses];

  return (
    <div className={cn("rounded-lg border p-6", bgClass)}>
      <div className="flex items-center gap-3">
        <SeasonIcon className="h-6 w-6" />
        <h3 className="text-lg font-bold">{season} Recommendations</h3>
      </div>

      <div className="mt-4 space-y-4">
        {/* Recommended Crops */}
        <div>
          <h4 className="text-sm font-semibold">Recommended Crops</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {recommendation.crops.map((crop) => (
              <span
                key={crop}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium shadow-sm"
              >
                {crop}
              </span>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div>
          <h4 className="text-sm font-semibold">Growing Tips</h4>
          <ul className="mt-2 space-y-1.5">
            {recommendation.tips.map((tip, index) => (
              <li key={index} className="flex gap-2 text-xs">
                <span className="mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weather Notes */}
        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <Cloud className="h-4 w-4" />
            Weather Notes
          </h4>
          <p className="mt-2 text-xs">{recommendation.weatherNotes}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function HarvestPlanner({
  plans = [],
  onPlanCreate,
  onPlanUpdate,
  onPlanDelete,
  view = "list",
  showRecommendations = true,
  readOnly = false,
  className,
  agriculturalConsciousness = "high",
}: HarvestPlannerProps) {
  const [currentView, setCurrentView] = useState(view);
  const [filterSeason, setFilterSeason] = useState<Season | "all">("all");
  const [filterStage, setFilterStage] = useState<GrowthStage | "all">("all");
  const [currentSeason, setCurrentSeason] = useState<Season>(getCurrentSeason());

  // ==========================================================================
  // FILTERED PLANS
  // ==========================================================================

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      if (filterSeason !== "all" && plan.season !== filterSeason) return false;
      if (filterStage !== "all" && plan.stage !== filterStage) return false;
      return true;
    });
  }, [plans, filterSeason, filterStage]);

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  const stats = useMemo(() => {
    return {
      total: plans.length,
      bySeason: {
        SPRING: plans.filter((p) => p.season === "SPRING").length,
        SUMMER: plans.filter((p) => p.season === "SUMMER").length,
        FALL: plans.filter((p) => p.season === "FALL").length,
        WINTER: plans.filter((p) => p.season === "WINTER").length,
      },
      byStage: {
        planning: plans.filter((p) => p.stage === "planning").length,
        preparing: plans.filter((p) => p.stage === "preparing").length,
        planting: plans.filter((p) => p.stage === "planting").length,
        growing: plans.filter((p) => p.stage === "growing").length,
        harvesting: plans.filter((p) => p.stage === "harvesting").length,
        completed: plans.filter((p) => p.stage === "completed").length,
      },
    };
  }, [plans]);

  // ==========================================================================
  // CONVERT TO CALENDAR EVENTS
  // ==========================================================================

  const calendarEvents: CalendarEvent[] = filteredPlans.map((plan) => ({
    id: plan.id,
    title: plan.cropName,
    description: `${plan.stage} - ${plan.cropType}`,
    date: plan.plantingDate,
    endDate: plan.expectedHarvestDate,
    type: plan.cropType,
    metadata: plan.metadata,
  }));

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Harvest Planner</h2>
          <p className="mt-1 text-sm text-gray-600">
            Plan and track your seasonal harvests
          </p>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={() => onPlanCreate?.({} as any)}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            New Harvest Plan
          </button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Total Plans</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {stats.total}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Growing</div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {stats.byStage.growing}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Harvesting</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            {stats.byStage.harvesting}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Completed</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">
            {stats.byStage.completed}
          </div>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <select
            value={filterSeason}
            onChange={(e) => setFilterSeason(e.target.value as Season | "all")}
            className="rounded-lg border px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20"
          >
            <option value="all">All Seasons</option>
            <option value="SPRING">Spring</option>
            <option value="SUMMER">Summer</option>
            <option value="FALL">Fall</option>
            <option value="WINTER">Winter</option>
          </select>

          <select
            value={filterStage}
            onChange={(e) =>
              setFilterStage(e.target.value as GrowthStage | "all")
            }
            className="rounded-lg border px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20"
          >
            <option value="all">All Stages</option>
            <option value="planning">Planning</option>
            <option value="preparing">Preparing</option>
            <option value="planting">Planting</option>
            <option value="growing">Growing</option>
            <option value="harvesting">Harvesting</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentView("list")}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              currentView === "list"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setCurrentView("calendar")}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              currentView === "calendar"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentView === "list" && (
            <div className="space-y-4">
              {filteredPlans.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed p-12 text-center">
                  <Wheat className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-sm font-semibold text-gray-900">
                    No harvest plans
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Start planning your seasonal harvests
                  </p>
                </div>
              ) : (
                filteredPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onEdit={(plan) => onPlanUpdate?.(plan.id, plan)}
                    onDelete={onPlanDelete}
                    readOnly={readOnly}
                  />
                ))
              )}
            </div>
          )}

          {currentView === "calendar" && (
            <BiodynamicCalendar
              events={calendarEvents}
              showSeasonalTheme
              highlightToday
              agriculturalConsciousness={agriculturalConsciousness}
            />
          )}
        </div>

        {/* Sidebar */}
        {showRecommendations && (
          <div className="space-y-4">
            <SeasonalRecommendations season={currentSeason} />

            {/* Season Selector */}
            <div className="rounded-lg border bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900">
                View Recommendations
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(["SPRING", "SUMMER", "FALL", "WINTER"] as Season[]).map(
                  (season) => {
                    const SeasonIcon = getSeasonIcon(season);
                    return (
                      <button
                        key={season}
                        type="button"
                        onClick={() => setCurrentSeason(season)}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-lg border p-2 text-xs font-medium transition-colors",
                          currentSeason === season
                            ? "border-green-600 bg-green-50 text-green-700"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <SeasonIcon className="h-4 w-4" />
                        {season}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getCurrentSeason(): Season {
  const month = new Date().getMonth();

  if (month >= 2 && month <= 4) return "SPRING";
  if (month >= 5 && month <= 7) return "SUMMER";
  if (month >= 8 && month <= 10) return "FALL";
  return "WINTER";
}

// ============================================================================
// EXPORTS
// ============================================================================

export default HarvestPlanner;
