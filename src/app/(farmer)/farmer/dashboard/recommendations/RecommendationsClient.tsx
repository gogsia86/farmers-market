"use client";

/**
 * 🌾 Recommendations Client Component
 *
 * Interactive client-side component for displaying crop recommendations,
 * weather data, biodynamic calendar, and personalized scoring.
 */

import type { CropRecommendationResponse } from "@/types/biodynamic.types";
import { useEffect, useState } from "react";

interface Farm {
  id: string;
  name: string;
  slug: string;
  latitude: any;
  longitude: any;
  farmSize: any;
  city: string;
  state: string;
  isOrganic: boolean | null;
  isBiodynamic: boolean | null;
  hardinessZone: number | null;
  soilType: string | null;
  waterAvailability: string | null;
  sunExposure: string | null;
}

interface Props {
  farms: Farm[];
  userId: string;
}

type PreferenceType = "profit" | "sustainability" | "balanced";

export default function RecommendationsClient({ farms, userId }: Props) {
  const [selectedFarmId, setSelectedFarmId] = useState<string>(
    farms[0]?.id || "",
  );
  const [preferenceType, setPreferenceType] =
    useState<PreferenceType>("balanced");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CropRecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedFarm = farms.find((f) => f.id === selectedFarmId);

  // Load recommendations
  const loadRecommendations = async () => {
    if (!selectedFarmId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        farmId: selectedFarmId,
        maxRecommendations: "10",
      });

      // Set preferences based on type
      if (preferenceType === "profit") {
        params.set("prioritizeProfit", "true");
        params.set("prioritizeSustainability", "false");
      } else if (preferenceType === "sustainability") {
        params.set("prioritizeProfit", "false");
        params.set("prioritizeSustainability", "true");
      } else {
        params.set("prioritizeProfit", "false");
        params.set("prioritizeSustainability", "false");
      }

      const response = await fetch(`/api/v1/crops/recommendations?${params}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error?.message || "Failed to load recommendations",
        );
      }

      setData(result);
    } catch (err) {
      console.error("Failed to load recommendations:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Load on mount and when dependencies change
  useEffect(() => {
    loadRecommendations();
  }, [selectedFarmId, preferenceType]);

  return (
    <div className="space-y-6">
      {/* Farm & Preference Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Farm Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Farm
            </label>
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name} - {farm.city}, {farm.state}
                </option>
              ))}
            </select>
            {selectedFarm && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {selectedFarm.farmSize
                  ? `${selectedFarm.farmSize} acres`
                  : "Size not specified"}{" "}
                • {selectedFarm.isOrganic ? "🌱 Organic" : ""}{" "}
                {selectedFarm.isBiodynamic ? "🌙 Biodynamic" : ""}
              </div>
            )}
          </div>

          {/* Preference Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Recommendation Focus
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPreferenceType("profit")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  preferenceType === "profit"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                💰 Profit
              </button>
              <button
                onClick={() => setPreferenceType("balanced")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  preferenceType === "balanced"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                ⚖️ Balanced
              </button>
              <button
                onClick={() => setPreferenceType("sustainability")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  preferenceType === "sustainability"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                🌱 Sustainability
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                Error Loading Recommendations
              </h3>
              <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
              <button
                onClick={loadRecommendations}
                className="mt-2 text-sm text-red-700 dark:text-red-300 underline hover:no-underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Analyzing farm conditions...
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && data && (
        <>
          {/* Weather & Biodynamic Context */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weather Widget */}
            {data.weatherContext && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  🌤️ Weather Conditions
                </h2>

                {/* Current Weather */}
                <div className="mb-4">
                  <div className="text-3xl font-bold mb-1">
                    {Math.round(data.weatherContext.current.temperature)}°F
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {data.weatherContext.current.conditions}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      💧 {data.weatherContext.current.humidity}% humidity
                    </div>
                    <div>
                      💨 {Math.round(data.weatherContext.current.windSpeed)} mph
                    </div>
                  </div>
                </div>

                {/* Planting Score */}
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Planting Score</span>
                    <span
                      className={`text-2xl font-bold ${
                        data.weatherContext.plantingScore.score >= 70
                          ? "text-green-600"
                          : data.weatherContext.plantingScore.score >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {data.weatherContext.plantingScore.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        data.weatherContext.plantingScore.score >= 70
                          ? "bg-green-500"
                          : data.weatherContext.plantingScore.score >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{
                        width: `${data.weatherContext.plantingScore.score}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {data.weatherContext.plantingScore.recommendation}
                  </p>
                </div>

                {/* Frost Alerts */}
                {data.weatherContext.frostAlerts.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center">
                      ❄️ Frost Alerts
                    </div>
                    {data.weatherContext.frostAlerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-red-700 dark:text-red-300 mb-1"
                      >
                        {new Date(alert.date).toLocaleDateString()} -{" "}
                        {alert.severity.toUpperCase()} (
                        {Math.round(alert.temperatureMin)}°F)
                      </div>
                    ))}
                  </div>
                )}

                {/* 3-Day Forecast */}
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">3-Day Forecast</div>
                  <div className="grid grid-cols-3 gap-2">
                    {data.weatherContext.forecast.map((day, idx) => (
                      <div
                        key={idx}
                        className="bg-white/50 dark:bg-gray-800/50 rounded p-2 text-center"
                      >
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </div>
                        <div className="text-sm font-semibold">
                          {Math.round(day.temperatureMax)}°/
                          {Math.round(day.temperatureMin)}°
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.round(day.precipitationChance)}% 💧
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Biodynamic Calendar */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                🌙 Biodynamic Calendar
              </h2>

              <div className="space-y-4">
                {/* Season */}
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Current Season
                  </div>
                  <div className="text-2xl font-bold capitalize">
                    {data.biodynamicContext.season.toLowerCase()}
                  </div>
                </div>

                {/* Lunar Phase */}
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Lunar Phase
                  </div>
                  <div className="text-xl font-semibold capitalize mb-2">
                    {data.biodynamicContext.lunarPhase
                      .toLowerCase()
                      .replace(/_/g, " ")}
                  </div>
                  <div className="text-sm">
                    {getLunarPhaseEmoji(data.biodynamicContext.lunarPhase)}{" "}
                    {getLunarPhaseDescription(
                      data.biodynamicContext.lunarPhase,
                    )}
                  </div>
                </div>

                {/* Optimal Planting */}
                <div
                  className={`rounded-lg p-4 ${
                    data.biodynamicContext.isOptimalPlanting
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                      : "bg-gray-50 dark:bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Optimal Planting Time
                    </span>
                    <span className="text-2xl">
                      {data.biodynamicContext.isOptimalPlanting ? "✅" : "⏳"}
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                    {data.biodynamicContext.isOptimalPlanting
                      ? "Excellent time for planting according to biodynamic principles"
                      : "Consider waiting for more favorable lunar conditions"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Warnings */}
          {data.weatherContext?.warnings &&
            data.weatherContext.warnings.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
                  ⚠️ Weather Warnings
                </h3>
                <ul className="space-y-1">
                  {data.weatherContext.warnings.map((warning, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-yellow-700 dark:text-yellow-300"
                    >
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Crop Recommendations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                🌾 Top Recommendations ({data.recommendations.length})
              </h2>
              <button
                onClick={loadRecommendations}
                className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              >
                🔄 Refresh
              </button>
            </div>

            <div className="space-y-4">
              {data.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">
                          {rec.crop.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          {rec.crop.scientificName}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-3xl font-bold ${getScoreColor(rec.overallScore)}`}
                        >
                          {rec.overallScore}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Overall Score
                        </div>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <ScoreCard
                        label="Profitability"
                        score={rec.profitabilityScore}
                        icon="💰"
                      />
                      <ScoreCard
                        label="Sustainability"
                        score={rec.sustainabilityScore}
                        icon="🌱"
                      />
                      <ScoreCard
                        label="Market Demand"
                        score={rec.marketDemandScore}
                        icon="📊"
                      />
                      <ScoreCard
                        label="Suitability"
                        score={rec.suitabilityScore}
                        icon="✅"
                      />
                    </div>

                    {/* Planting Window */}
                    {rec.plantingWindow && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                        <div className="text-sm font-medium mb-1">
                          📅 Planting Window
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {new Date(
                            rec.plantingWindow.start,
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(
                            rec.plantingWindow.end,
                          ).toLocaleDateString()}
                          {rec.plantingWindow.optimal && (
                            <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                              ✨ Optimal
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Expected Yield & Revenue */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {rec.expectedYield && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Expected Yield
                          </div>
                          <div className="font-semibold">
                            {rec.expectedYield.min} - {rec.expectedYield.max}{" "}
                            {rec.expectedYield.unit}
                          </div>
                        </div>
                      )}
                      {rec.expectedRevenue && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Expected Revenue
                          </div>
                          <div className="font-semibold text-green-600 dark:text-green-400">
                            ${rec.expectedRevenue.min.toLocaleString()} - $
                            {rec.expectedRevenue.max.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Strengths */}
                    {rec.strengths && rec.strengths.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-2 text-green-700 dark:text-green-400">
                          ✨ Strengths
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {rec.strengths.map((strength, i) => (
                            <span
                              key={i}
                              className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded"
                            >
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risk Factors */}
                    {rec.riskFactors && rec.riskFactors.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-2 text-orange-700 dark:text-orange-400">
                          ⚠️ Risk Factors
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {rec.riskFactors.map((risk, i) => (
                            <span
                              key={i}
                              className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded"
                            >
                              {risk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {rec.recommendations && rec.recommendations.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">💡 Tips</div>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {rec.recommendations.map((tip, i) => (
                            <li key={i}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 flex items-center justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {rec.crop.category} • {rec.crop.cropType}
                    </div>
                    <div className="flex gap-2">
                      <button className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium">
                        View Details
                      </button>
                      <button className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium">
                        Add to Plan
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper Components

function ScoreCard({
  label,
  score,
  icon,
}: {
  label: string;
  score: number;
  icon: string;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-xl font-bold ${getScoreColor(score)}`}>{score}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}

// Helper Functions

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function getLunarPhaseEmoji(phase: string): string {
  const map: Record<string, string> = {
    NEW_MOON: "🌑",
    WAXING_CRESCENT: "🌒",
    FIRST_QUARTER: "🌓",
    WAXING_GIBBOUS: "🌔",
    FULL_MOON: "🌕",
    WANING_GIBBOUS: "🌖",
    LAST_QUARTER: "🌗",
    WANING_CRESCENT: "🌘",
  };
  return map[phase] || "🌙";
}

function getLunarPhaseDescription(phase: string): string {
  const map: Record<string, string> = {
    NEW_MOON: "Best for planning and rest",
    WAXING_CRESCENT: "Good for leafy greens",
    FIRST_QUARTER: "Ideal for fruiting crops",
    WAXING_GIBBOUS: "Excellent for flowers and fruits",
    FULL_MOON: "Peak energy for transplanting",
    WANING_GIBBOUS: "Perfect for root crops",
    LAST_QUARTER: "Great for root vegetables",
    WANING_CRESCENT: "Time for cultivation and weeding",
  };
  return map[phase] || "";
}
