/**
 * 🌾 AI Farming Advisor Page (Farmer)
 *
 * Advanced AI advisor for farmers providing insights on crop planning,
 * farm operations, market analysis, and agricultural best practices.
 *
 * @page /farmer/ai-advisor
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import FarmingAdvisorClient from "./FarmingAdvisorClient";

export const metadata = {
  title: "AI Farming Advisor | Farmer Dashboard",
  description:
    "Get expert AI-powered advice on farm operations, crop planning, yield optimization, and sustainable farming practices.",
  keywords: [
    "ai farming advisor",
    "agricultural ai",
    "crop planning",
    "farm optimization",
    "sustainable farming",
  ],
};

export default async function AIFarmingAdvisorPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/farmer/ai-advisor");
  }

  // Verify user is a farmer
  if (session.user.role !== "FARMER" && session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Get farmer's farms for context
  const farms = await database.farm.findMany({
    where: {
      ownerId: session.user.id,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      state: true,
      farmSize: true,
      isOrganic: true,
      isBiodynamic: true,
      hardinessZone: true,
      soilType: true,
      waterAvailability: true,
      sunExposure: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 mb-4 shadow-lg">
            <span className="text-3xl">🌾</span>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            AI Farming Advisor
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your personal agricultural intelligence system. Get expert advice on
            crop planning, farm operations, market trends, and sustainable
            practices.
          </p>
        </div>
      </div>

      {/* Capabilities Grid */}
      <div className="max-w-5xl mx-auto mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <span>🎯</span>
          What I Can Help With
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CapabilityCard
            emoji="📊"
            title="Farm Analytics"
            description="Yield analysis, performance metrics, efficiency reports"
          />
          <CapabilityCard
            emoji="🌱"
            title="Crop Planning"
            description="Best crops for your soil, seasonal recommendations"
          />
          <CapabilityCard
            emoji="💰"
            title="Market Insights"
            description="Pricing trends, demand forecasts, profit optimization"
          />
          <CapabilityCard
            emoji="🌍"
            title="Sustainability"
            description="Organic practices, soil health, water conservation"
          />
          <CapabilityCard
            emoji="🌙"
            title="Biodynamic Calendar"
            description="Lunar phases, optimal planting times, natural cycles"
          />
          <CapabilityCard
            emoji="☀️"
            title="Weather Insights"
            description="Forecast analysis, frost warnings, growing conditions"
          />
          <CapabilityCard
            emoji="🔄"
            title="Crop Rotation"
            description="Rotation plans, companion planting, soil restoration"
          />
          <CapabilityCard
            emoji="🐛"
            title="Pest Management"
            description="Organic pest control, disease prevention strategies"
          />
        </div>
      </div>

      {/* Chat Interface */}
      <Suspense
        fallback={
          <div className="max-w-5xl mx-auto">
            <div className="h-[650px] bg-white dark:bg-gray-900 rounded-lg shadow-lg animate-pulse" />
          </div>
        }
      >
        <FarmingAdvisorClient
          userName={session.user.name || "Farmer"}
          farms={farms}
        />
      </Suspense>

      {/* Example Questions */}
      <div className="max-w-5xl mx-auto mt-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <span>💡</span>
            Example Questions to Ask
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExampleQuestions
              category="Crop Planning"
              questions={[
                "What crops should I plant this season?",
                "When is the best time to plant tomatoes?",
                "What are good companion plants for carrots?",
              ]}
            />
            <ExampleQuestions
              category="Farm Operations"
              questions={[
                "How can I improve my farm's efficiency?",
                "What's the current yield trend for my crops?",
                "How do I optimize my irrigation schedule?",
              ]}
            />
            <ExampleQuestions
              category="Market & Pricing"
              questions={[
                "What are the current market prices for organic lettuce?",
                "Which crops have the highest profit margins?",
                "What's in high demand right now?",
              ]}
            />
            <ExampleQuestions
              category="Sustainability"
              questions={[
                "How can I improve soil health naturally?",
                "What are the best organic pest control methods?",
                "How do I transition to biodynamic farming?",
              ]}
            />
          </div>
        </div>
      </div>

      {/* AI Features Notice */}
      <div className="max-w-5xl mx-auto mt-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🤖</span>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                Powered by Advanced AI
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                This advisor uses OpenAI GPT-4o and integrates with real-time
                weather data, biodynamic calendar calculations, and agricultural
                best practices. Responses are personalized based on your farm
                profile.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Accuracy Notice */}
      <div className="max-w-5xl mx-auto mt-6">
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          🔒 Your farm data and conversations are private and secure. • ⚠️ AI
          advice should complement, not replace, professional agricultural
          consultation.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function CapabilityCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:shadow-md transition-all cursor-default">
      <div className="text-2xl mb-2">{emoji}</div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
        {title}
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function ExampleQuestions({
  category,
  questions,
}: {
  category: string;
  questions: string[];
}) {
  return (
    <div>
      <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2 text-sm">
        {category}
      </h3>
      <ul className="space-y-2">
        {questions.map((question, index) => (
          <li
            key={index}
            className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
          >
            <span className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5">
              →
            </span>
            <span className="italic">"{question}"</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
