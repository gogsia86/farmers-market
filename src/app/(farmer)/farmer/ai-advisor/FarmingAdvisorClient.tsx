"use client";

/**
 * 🌾 Farming Advisor Client Component
 *
 * Client-side component for the AI farming advisor with farm-specific
 * context and advanced agricultural intelligence.
 */

import ChatInterface from "@/components/features/ai-chat/ChatInterface";
import { useState } from "react";

interface Farm {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  farmSize: any;
  isOrganic: boolean | null;
  isBiodynamic: boolean | null;
  hardinessZone: number | null;
  soilType: string | null;
  waterAvailability: string | null;
  sunExposure: string | null;
}

interface FarmingAdvisorClientProps {
  userName: string;
  farms: Farm[];
}

export default function FarmingAdvisorClient({
  userName,
  farms,
}: FarmingAdvisorClientProps) {
  const [selectedFarmId, setSelectedFarmId] = useState<string>(
    farms[0]?.id || ""
  );

  const selectedFarm = farms.find((f) => f.id === selectedFarmId);

  // Build context-aware welcome message
  const welcomeMessage = buildWelcomeMessage(userName, selectedFarm, farms);

  // Build farm context for AI
  const farmContext = selectedFarm
    ? {
        farmId: selectedFarm.id,
        metadata: {
          farmName: selectedFarm.name,
          location: `${selectedFarm.city}, ${selectedFarm.state}`,
          farmSize: selectedFarm.farmSize?.toString() || "unknown",
          isOrganic: selectedFarm.isOrganic || false,
          isBiodynamic: selectedFarm.isBiodynamic || false,
          hardinessZone: selectedFarm.hardinessZone || undefined,
          soilType: selectedFarm.soilType || undefined,
          waterAvailability: selectedFarm.waterAvailability || undefined,
          sunExposure: selectedFarm.sunExposure || undefined,
          source: "farmer-advisor",
        },
      }
    : {
        metadata: {
          source: "farmer-advisor",
          noFarmSelected: true,
        },
      };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Farm Selector (if multiple farms) */}
      {farms.length > 1 && (
        <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            🌾 Select Farm for Context-Aware Advice
          </label>
          <select
            value={selectedFarmId}
            onChange={(e) => setSelectedFarmId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          >
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name} - {farm.city}, {farm.state}{" "}
                {farm.farmSize ? `(${farm.farmSize} acres)` : ""}
                {farm.isOrganic ? " • 🌱 Organic" : ""}
                {farm.isBiodynamic ? " • 🌙 Biodynamic" : ""}
              </option>
            ))}
          </select>

          {selectedFarm && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedFarm.hardinessZone && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Zone {selectedFarm.hardinessZone}
                </span>
              )}
              {selectedFarm.soilType && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  {selectedFarm.soilType} Soil
                </span>
              )}
              {selectedFarm.waterAvailability && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                  {selectedFarm.waterAvailability} Water
                </span>
              )}
              {selectedFarm.sunExposure && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  {selectedFarm.sunExposure}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* No Farms Warning */}
      {farms.length === 0 && (
        <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                No Farm Registered
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
                Register your farm to get personalized, context-aware advice
                based on your location, soil type, and growing conditions.
              </p>
              <a
                href="/farmer/farms/new"
                className="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Register Farm
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <ChatInterface
        agentName="farmAnalyst"
        context={farmContext}
        placeholder="Ask about crop planning, farm operations, market trends, or sustainable practices..."
        welcomeMessage={welcomeMessage}
        className="h-[650px]"
      />
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function buildWelcomeMessage(
  userName: string,
  selectedFarm: Farm | undefined,
  farms: Farm[]
): string {
  if (farms.length === 0) {
    return `Hi ${userName}! 🌾 I'm your AI Farming Advisor, powered by advanced agricultural intelligence.

While I can answer general farming questions now, registering your farm will unlock personalized advice based on:
• Your soil type and climate zone
• Local weather patterns and forecasts
• Biodynamic calendar for optimal planting
• Market trends in your region
• Crop recommendations specific to your conditions

What farming questions can I help you with today?`;
  }

  if (!selectedFarm) {
    return `Hi ${userName}! 🌾 I'm your AI Farming Advisor.

Select a farm above to get personalized advice, or ask me general farming questions!`;
  }

  const farmDetails = [];

  if (selectedFarm.farmSize) {
    farmDetails.push(`${selectedFarm.farmSize} acres`);
  }

  if (selectedFarm.isOrganic) {
    farmDetails.push("organic certified");
  }

  if (selectedFarm.isBiodynamic) {
    farmDetails.push("biodynamic practices");
  }

  const farmInfo = farmDetails.length > 0
    ? ` (${farmDetails.join(", ")})`
    : "";

  return `Hi ${userName}! 🌾 I'm analyzing **${selectedFarm.name}** in ${selectedFarm.city}, ${selectedFarm.state}${farmInfo}.

I have access to:
✅ Real-time weather data and forecasts for your location
✅ Biodynamic calendar with lunar phases and optimal planting times
✅ Market trends and pricing for your region
✅ Soil and climate-specific crop recommendations
✅ Sustainable farming practices and organic methods
✅ Yield optimization and efficiency strategies

I can help you with:
• **Crop Planning**: What to plant, when to plant, rotation strategies
• **Farm Analytics**: Yield analysis, performance metrics, efficiency reports
• **Market Intelligence**: Pricing trends, demand forecasts, profit optimization
• **Seasonal Guidance**: Biodynamic calendar, planting windows, harvest timing
• **Sustainability**: Soil health, water conservation, organic pest control
• **Problem Solving**: Addressing challenges specific to your farm

What would you like to explore today?`;
}
