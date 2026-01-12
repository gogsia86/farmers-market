/**
 * 🌾 Crop Recommendations Dashboard
 *
 * Intelligent crop recommendations with biodynamic calendar,
 * weather integration, and personalized scoring.
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import RecommendationsClient from "./RecommendationsClient";

export const metadata = {
  title: "Crop Recommendations | Farmer Dashboard",
  description:
    "Get intelligent crop recommendations based on your farm conditions, weather, and biodynamic principles",
};

export default async function RecommendationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/farmer/dashboard/recommendations");
  }

  // Get user's farms
  const farms = await database.farm.findMany({
    where: {
      ownerId: session.user.id,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      latitude: true,
      longitude: true,
      farmSize: true,
      city: true,
      state: true,
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

  if (farms.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6">
            <span className="text-6xl">🌾</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">No Farms Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to register a farm before getting crop recommendations.
          </p>
          <a
            href="/farmer/farms/new"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Register Your Farm
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🌾 Crop Recommendations</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Intelligent recommendations powered by biodynamic principles, weather
          data, and market insights
        </p>
      </div>

      {/* Main Content */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
              <p className="text-gray-600">Loading recommendations...</p>
            </div>
          </div>
        }
      >
        <RecommendationsClient farms={farms} userId={session.user.id} />
      </Suspense>
    </div>
  );
}
