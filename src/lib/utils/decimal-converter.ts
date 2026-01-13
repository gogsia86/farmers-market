/**
 * 🔢 DECIMAL CONVERTER UTILITY
 *
 * Prisma returns Decimal types for numeric fields with precision.
 * This utility provides type-safe conversion to JavaScript numbers.
 *
 * Used for: latitude, longitude, prices, ratings, farm size, revenue, etc.
 *
 * @reference .cursorrules - Type Safety Standards
 */

/**
 * Convert Prisma Decimal to number
 * Handles null/undefined gracefully
 */
export function decimalToNumber(value: any): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  // Check if it has toNumber method (Prisma Decimal)
  if (
    value &&
    typeof value === "object" &&
    typeof value.toNumber === "function"
  ) {
    return value.toNumber();
  }

  // Already a number
  if (typeof value === "number") {
    return value;
  }

  return null;
}

/**
 * Convert Prisma Decimal to number with default value
 * Never returns null
 */
export function decimalToNumberWithDefault(
  value: any,
  defaultValue: number = 0,
): number {
  const result = decimalToNumber(value);
  return result !== null ? result : defaultValue;
}

/**
 * Convert Prisma Decimal to number, throw if null/undefined
 * Use when value is required
 */
export function decimalToNumberRequired(value: any): number {
  if (value === null || value === undefined) {
    throw new Error("Decimal value is required but was null or undefined");
  }

  const result = decimalToNumber(value);
  if (result === null) {
    throw new Error("Value is not a valid Decimal");
  }

  return result;
}

/**
 * Convert array of Decimals to array of numbers
 */
export function decimalArrayToNumbers(values: any[]): (number | null)[] {
  return values.map(decimalToNumber);
}

/**
 * Round Decimal to specified precision and convert to number
 * Useful for prices and ratings
 */
export function decimalToRounded(
  value: any,
  decimals: number = 2,
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const num = decimalToNumber(value);
  if (num === null) {
    return null;
  }

  return Number(num.toFixed(decimals));
}

/**
 * Convert coordinates (lat/lng) from Decimal to number
 * Returns object with lat and lng
 */
export function convertCoordinates(
  latitude: any,
  longitude: any,
): { lat: number; lng: number } | null {
  const lat = decimalToNumber(latitude);
  const lng = decimalToNumber(longitude);

  if (lat === null || lng === null) {
    return null;
  }

  return { lat, lng };
}

/**
 * Format Decimal as currency string
 */
export function decimalToCurrency(
  value: any,
  currency: string = "USD",
  locale: string = "en-US",
): string {
  const num = decimalToNumber(value);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(num !== null ? num : 0);
}

/**
 * Type guard to check if value is Decimal
 */
export function isDecimal(value: unknown): boolean {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === "object" &&
    "toNumber" in value &&
    typeof (value as any).toNumber === "function"
  );
}

/**
 * Safe conversion with validation
 * Returns null if conversion fails
 */
export function safeDecimalToNumber(value: unknown): number | null {
  try {
    if (value === null || value === undefined) {
      return null;
    }

    if (isDecimal(value)) {
      return (value as any).toNumber();
    }

    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    }

    return null;
  } catch (error) {
    console.error("Failed to convert value to number:", error);
    return null;
  }
}

/**
 * Batch convert object with Decimal fields
 * Useful for converting entire Prisma results
 */
export function convertDecimalFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[],
): T {
  const result = { ...obj };

  for (const field of fields) {
    if (isDecimal(result[field])) {
      (result[field] as any) = decimalToNumber(result[field]);
    }
  }

  return result;
}

/**
 * Helper for converting farm coordinates
 * Used extensively in farm repository
 */
export function convertFarmCoordinates(farm: {
  latitude: any;
  longitude: any;
}): {
  latitude: number;
  longitude: number;
} {
  return {
    latitude: decimalToNumberWithDefault(farm.latitude, 0),
    longitude: decimalToNumberWithDefault(farm.longitude, 0),
  };
}

/**
 * Helper for converting farm financial data
 */
export function convertFarmFinancials(farm: {
  totalRevenueUSD: any;
  averageRating?: any;
  farmSize?: any;
  budgetPerAcre?: any;
}): {
  totalRevenueUSD: number;
  averageRating: number | null;
  farmSize: number | null;
  budgetPerAcre: number | null;
} {
  return {
    totalRevenueUSD: decimalToNumberWithDefault(farm.totalRevenueUSD, 0),
    averageRating: decimalToNumber(farm.averageRating),
    farmSize: decimalToNumber(farm.farmSize),
    budgetPerAcre: decimalToNumber(farm.budgetPerAcre),
  };
}

/**
 * Helper for converting product prices
 */
export function convertProductPrice(product: {
  price: any;
  compareAtPrice?: any;
  costPrice?: any;
}): {
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
} {
  return {
    price: decimalToNumberWithDefault(product.price, 0),
    compareAtPrice: decimalToNumber(product.compareAtPrice),
    costPrice: decimalToNumber(product.costPrice),
  };
}

/**
 * Helper for converting order totals
 */
export function convertOrderTotals(order: {
  subtotal: any;
  tax: any;
  deliveryFee: any;
  total: any;
  discount?: any;
}): {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  discount: number | null;
} {
  return {
    subtotal: decimalToNumberWithDefault(order.subtotal, 0),
    tax: decimalToNumberWithDefault(order.tax, 0),
    deliveryFee: decimalToNumberWithDefault(order.deliveryFee, 0),
    total: decimalToNumberWithDefault(order.total, 0),
    discount: decimalToNumber(order.discount),
  };
}
