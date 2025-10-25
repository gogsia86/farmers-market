// src/lib/shipping/rate-calculator.ts
import { database } from "@/lib/database";
import type {
  CalculateShippingInput,
  DeliveryMethod,
  ShippingRateResult,
} from "@/types/shipping.types";

/**
 * Calculate shipping rate based on distance, weight, and delivery method
 */
export async function calculateShippingRate(
  input: CalculateShippingInput
): Promise<ShippingRateResult[]> {
  const { farmId, deliveryZipCode, orderWeight, orderValue, deliveryMethod } =
    input;

  // Get farm location
  const farm = await database.farm.findUnique({
    where: { id: farmId },
    select: { zipCode: true, state: true },
  });

  if (!farm) {
    throw new Error("Farm not found");
  }

  // Get applicable delivery zones
  const zones = await database.deliveryZone.findMany({
    where: {
      farmId,
      zipCodes: { has: deliveryZipCode },
    },
  });

  const rates: ShippingRateResult[] = [];

  // Calculate distance-based rate
  if (deliveryMethod === "STANDARD" || deliveryMethod === "EXPRESS") {
    const distance = await calculateDistance(farm.zipCode, deliveryZipCode);

    for (const zone of zones) {
      if (distance <= zone.radiusMiles) {
        const baseRate = zone.baseRate;
        const distanceRate = distance * zone.perMileRate;
        const weightRate = calculateWeightSurcharge(orderWeight);

        let totalRate = baseRate + distanceRate + weightRate;

        // Check for free shipping
        const isFree = orderValue >= zone.freeShippingThreshold;
        if (isFree) {
          totalRate = 0;
        }

        rates.push({
          method: deliveryMethod,
          carrier: deliveryMethod === "EXPRESS" ? "UPS" : "USPS",
          rate: Math.round(totalRate * 100) / 100,
          estimatedDays: deliveryMethod === "EXPRESS" ? 2 : 5,
          isFree,
          reason: isFree
            ? `Free shipping on orders over $${zone.freeShippingThreshold}`
            : undefined,
        });
      }
    }
  }

  // Local pickup - always free
  if (deliveryMethod === "LOCAL_PICKUP" || deliveryMethod === "FARM_PICKUP") {
    rates.push({
      method: deliveryMethod,
      carrier: "FARM",
      rate: 0,
      estimatedDays: 0,
      isFree: true,
      reason: "Free - pickup at farm",
    });
  }

  return rates;
}

/**
 * Calculate distance between two ZIP codes
 */
async function calculateDistance(
  zipFrom: string,
  zipTo: string
): Promise<number> {
  // In production, use Google Maps API or similar
  // For now, simplified calculation

  // Mock implementation - in reality, call external API
  const mockDistances: Record<string, number> = {
    [`${zipFrom}-${zipTo}`]: Math.random() * 50 + 5, // 5-55 miles
  };

  return mockDistances[`${zipFrom}-${zipTo}`] || 25; // Default 25 miles
}

/**
 * Calculate weight-based surcharge
 */
function calculateWeightSurcharge(weight: number): number {
  if (weight <= 5) return 0;
  if (weight <= 10) return 2;
  if (weight <= 20) return 5;
  if (weight <= 50) return 10;
  return 15;
}

/**
 * Get all available shipping methods for order
 */
export async function getAvailableShippingMethods(
  farmId: string,
  zipCode: string,
  orderWeight: number,
  orderValue: number
): Promise<ShippingRateResult[]> {
  const methods: DeliveryMethod[] = [
    "STANDARD",
    "EXPRESS",
    "LOCAL_PICKUP",
    "FARM_PICKUP",
  ];

  const allRates: ShippingRateResult[] = [];

  for (const method of methods) {
    try {
      const rates = await calculateShippingRate({
        farmId,
        deliveryZipCode: zipCode,
        orderWeight,
        orderValue,
        deliveryMethod: method,
      });
      allRates.push(...rates);
    } catch (error) {
      console.error(`Failed to calculate rate for ${method}:`, error);
    }
  }

  return allRates;
}

/**
 * Validate delivery address is within service area
 */
export async function validateDeliveryAddress(
  farmId: string,
  zipCode: string
): Promise<{ valid: boolean; message?: string }> {
  const zones = await database.deliveryZone.findMany({
    where: {
      farmId,
      zipCodes: { has: zipCode },
    },
  });

  if (zones.length === 0) {
    return {
      valid: false,
      message: "Sorry, we don't deliver to this ZIP code yet.",
    };
  }

  return { valid: true };
}

/**
 * Estimate delivery date based on method
 */
export function estimateDeliveryDate(method: DeliveryMethod): Date {
  const today = new Date();

  switch (method) {
    case "EXPRESS":
      today.setDate(today.getDate() + 2);
      break;
    case "STANDARD":
      today.setDate(today.getDate() + 5);
      break;
    case "LOCAL_PICKUP":
    case "FARM_PICKUP":
      today.setDate(today.getDate() + 1);
      break;
  }

  return today;
}
