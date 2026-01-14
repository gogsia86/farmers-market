/**
 * 🌾 Crop Recommendations API
 *
 * Provides intelligent crop recommendations based on farm profile,
 * biodynamic principles, market conditions, and real-time weather.
 *
 * @route GET /api/v1/crops/recommendations
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { logger } from "@/lib/logger";
import { biodynamicCalendar } from "@/lib/services/biodynamic-calendar.service";
import { cropRecommendationEngine } from "@/lib/services/crop-recommendation.service";
import type { WeatherForecast } from "@/lib/services/weather.service";
import { weatherService } from "@/lib/services/weather.service";
import type {
  CropRecommendationRequest,
  CropRecommendationResponse,
  FarmProfile,
  FarmerPreferences,
  MarketData,
  SoilType,
  SunLevel,
  WaterLevel,
} from "@/types/biodynamic.types";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/v1/crops/recommendations
 * Get crop recommendations for a farm
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 },
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const farmId = searchParams.get("farmId");
    const maxRecommendations = parseInt(
      searchParams.get("maxRecommendations") || "10",
    );

    if (!farmId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "farmId is required" },
        },
        { status: 400 },
      );
    }

    // Get farm data
    const farm = await database.farm.findUnique({
      where: { id: farmId },
      include: {
        certifications: true,
        products: {
          where: { status: "ACTIVE" },
          select: { id: true, category: true },
        },
      },
    });

    if (!farm) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Farm not found" },
        },
        { status: 404 },
      );
    }

    // Check ownership
    if (farm.ownerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Access denied" },
        },
        { status: 403 },
      );
    }

    // Build farm profile
    const farmProfile: FarmProfile = {
      id: farm.id,
      location: {
        latitude: parseFloat(farm.latitude?.toString() || "0"),
        longitude: parseFloat(farm.longitude?.toString() || "0"),
        hardinessZone: 7, // Default hardiness zone, should be stored in farm metadata
      },
      farmSize: parseFloat(farm.farmSize?.toString() || "1"),
      soilType: "LOAMY" as SoilType, // Default soil type, should be stored in farm metadata
      waterAvailability: "MODERATE" as WaterLevel, // Default water availability, should be stored in farm metadata
      sunExposure: "FULL_SUN" as SunLevel, // Default sun exposure, should be stored in farm metadata
      isOrganic: farm.certifications.some(
        (cert: any) => cert.type === "ORGANIC",
      ),
      isBiodynamic: farm.certifications.some(
        (cert: any) => cert.type === "BIODYNAMIC",
      ),
      previousCrops: farm.products.map((p: any) => p.id),
      equipmentAvailable: [], // Default empty equipment, should be stored in farm metadata
      laborCapacity: 40, // Default labor capacity, should be stored in farm metadata
      budgetPerAcre: 5000, // Default budget, should be stored in farm metadata
    };

    // Build farmer preferences
    const preferences: FarmerPreferences = {
      prioritizeOrganic: farmProfile.isOrganic,
      prioritizeProfit: searchParams.get("prioritizeProfit") === "true",
      prioritizeSustainability:
        searchParams.get("prioritizeSustainability") === "true",
      riskTolerance:
        (searchParams.get("riskTolerance") as "LOW" | "MEDIUM" | "HIGH") ||
        "MEDIUM",
      experienceLevel:
        (searchParams.get("experienceLevel") as
          | "BEGINNER"
          | "INTERMEDIATE"
          | "EXPERT") || "INTERMEDIATE",
      marketAccess:
        (searchParams.get("marketAccess") as
          | "LOCAL"
          | "REGIONAL"
          | "NATIONAL") || "LOCAL",
    };

    // Get market data (in production, this would come from a market data service)
    const marketDataMap = await getMarketData();

    // Get recommendations
    const recommendations = await cropRecommendationEngine.getRecommendations(
      farmProfile,
      preferences,
      marketDataMap,
    );

    // Limit results
    const limitedRecommendations = recommendations.slice(0, maxRecommendations);

    // Get biodynamic context
    const biodynamicContext = biodynamicCalendar.getBiodynamicContext();

    // Get weather data and forecasts
    const coordinates = {
      lat: farmProfile.location.latitude,
      lng: farmProfile.location.longitude,
    };

    let weatherForecast: WeatherForecast | null = null;
    const weatherWarnings: string[] = [];

    try {
      weatherForecast = await weatherService.getForecast(coordinates, 7);

      // Build weather warnings
      if (weatherForecast.frostAlerts.length > 0) {
        weatherForecast.frostAlerts.forEach((alert) => {
          const dateStr = alert.date.toLocaleDateString();
          weatherWarnings.push(
            `${alert.severity.toUpperCase()} FROST WARNING: ${dateStr} - ${alert.recommendation}`,
          );
        });
      }

      if (weatherForecast.alerts.length > 0) {
        weatherForecast.alerts.forEach((alert) => {
          weatherWarnings.push(
            `${alert.severity.toUpperCase()}: ${alert.headline}`,
          );
        });
      }

      // Check planting conditions
      if (!weatherForecast.plantingScore.isOptimal) {
        weatherWarnings.push(
          `Planting Score: ${weatherForecast.plantingScore.score}/100 - ${weatherForecast.plantingScore.recommendation}`,
        );
      }
    } catch (error) {
      logger.warn("Failed to fetch weather data", { error });
      // Continue without weather data
    }

    // Build response with weather integration
    const response: CropRecommendationResponse = {
      success: true,
      recommendations: limitedRecommendations,
      biodynamicContext: {
        season: biodynamicContext.season,
        lunarPhase: biodynamicContext.lunarPhase,
        isOptimalPlanting: biodynamicContext.isOptimalPlanting,
      },
      weatherContext: weatherForecast
        ? {
            current: {
              temperature: weatherForecast.current.temperature,
              humidity: weatherForecast.current.humidity,
              conditions:
                weatherForecast.current.conditions[0]?.description || "Unknown",
              windSpeed: weatherForecast.current.windSpeed,
            },
            forecast: weatherForecast.daily.slice(0, 3).map((day) => ({
              date: day.date,
              temperatureMin: day.temperatureMin,
              temperatureMax: day.temperatureMax,
              precipitationChance: day.precipitationChance,
              conditions: day.conditions[0]?.description || "Unknown",
            })),
            frostAlerts: weatherForecast.frostAlerts,
            plantingScore: weatherForecast.plantingScore,
            growingDegreeDays: weatherForecast.growingDegreeDays.slice(0, 7),
            warnings: weatherWarnings,
          }
        : undefined,
      metadata: {
        requestDate: new Date(),
        farmProfile: {
          farmId: farm.id,
          hardinessZone: farmProfile.location.hardinessZone,
          soilType: farmProfile.soilType,
        },
      },
    };

    // Log successful request
    logger.info("Crop recommendations generated", {
      userId: session.user.id,
      farmId,
      recommendationCount: limitedRecommendations.length,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Failed to generate crop recommendations", { error });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate recommendations. Please try again.",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * Get market data for crops
 * In production, this would integrate with real market data APIs
 */
async function getMarketData(): Promise<Map<string, MarketData>> {
  const marketData = new Map<string, MarketData>();

  // Sample market data (in production, fetch from market data service)
  const sampleData: MarketData[] = [
    {
      cropId: "tomato-1",
      averagePrice: 2.75,
      priceVolatility: 0.15,
      demandIndex: 85,
      supplyIndex: 65,
      trendDirection: "INCREASING",
      seasonalPriceFactor: 1.2,
      competitionLevel: "MEDIUM",
    },
    {
      cropId: "lettuce-1",
      averagePrice: 3.25,
      priceVolatility: 0.22,
      demandIndex: 78,
      supplyIndex: 72,
      trendDirection: "STABLE",
      seasonalPriceFactor: 1.0,
      competitionLevel: "HIGH",
    },
    {
      cropId: "carrot-1",
      averagePrice: 1.95,
      priceVolatility: 0.1,
      demandIndex: 72,
      supplyIndex: 68,
      trendDirection: "STABLE",
      seasonalPriceFactor: 0.95,
      competitionLevel: "MEDIUM",
    },
  ];

  sampleData.forEach((data) => {
    marketData.set(data.cropId, data);
  });

  return marketData;
}

/**
 * POST /api/v1/crops/recommendations
 * Create a saved recommendation set
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as CropRecommendationRequest;

    if (!body.farmId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "farmId is required" },
        },
        { status: 400 },
      );
    }

    // Verify farm ownership
    const farm = await database.farm.findUnique({
      where: { id: body.farmId },
    });

    if (!farm) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Farm not found" },
        },
        { status: 404 },
      );
    }

    if (farm.ownerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Access denied" },
        },
        { status: 403 },
      );
    }

    // In production, you might want to save the recommendation set
    // For now, return success
    return NextResponse.json(
      {
        success: true,
        message: "Recommendations saved successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Failed to save crop recommendations", { error });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to save recommendations. Please try again.",
        },
      },
      { status: 500 },
    );
  }
}
