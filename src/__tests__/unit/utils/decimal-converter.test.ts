import {
  convertCoordinates,
  convertDecimalFields,
  convertFarmCoordinates,
  convertFarmFinancials,
  convertOrderTotals,
  convertProductPrice,
  decimalArrayToNumbers,
  decimalToCurrency,
  decimalToNumber,
  decimalToNumberRequired,
  decimalToNumberWithDefault,
  decimalToRounded,
  isDecimal,
  safeDecimalToNumber,
} from "@/lib/utils/decimal-converter";
import { describe, expect, it } from "@jest/globals";

// Mock Prisma Decimal for testing
class MockDecimal {
  private value: number;

  constructor(value: number | string) {
    this.value = typeof value === "string" ? parseFloat(value) : value;
  }

  toNumber(): number {
    return this.value;
  }

  toFixed(decimals: number): string {
    return this.value.toFixed(decimals);
  }
}

// Helper to create mock decimals
const createDecimal = (value: number) => new MockDecimal(value);

describe("Decimal Converter Utilities", () => {
  // ==========================================================================
  // BASIC CONVERSION
  // ==========================================================================
  describe("decimalToNumber", () => {
    it("should convert Prisma Decimal to number", () => {
      const decimal = createDecimal(10.5);
      expect(decimalToNumber(decimal)).toBe(10.5);
    });

    it("should handle integer Decimals", () => {
      const decimal = createDecimal(100);
      expect(decimalToNumber(decimal)).toBe(100);
    });

    it("should handle zero", () => {
      const decimal = createDecimal(0);
      expect(decimalToNumber(decimal)).toBe(0);
    });

    it("should handle negative numbers", () => {
      const decimal = createDecimal(-25.75);
      expect(decimalToNumber(decimal)).toBe(-25.75);
    });

    it("should return null for null input", () => {
      expect(decimalToNumber(null)).toBeNull();
    });

    it("should return null for undefined input", () => {
      expect(decimalToNumber(undefined)).toBeNull();
    });

    it("should handle already-number inputs", () => {
      expect(decimalToNumber(42)).toBe(42);
      expect(decimalToNumber(10.5)).toBe(10.5);
    });

    it("should preserve decimal precision", () => {
      const decimal = createDecimal(10.123456);
      expect(decimalToNumber(decimal)).toBeCloseTo(10.123456);
    });

    it("should handle very small numbers", () => {
      const decimal = createDecimal(0.0001);
      expect(decimalToNumber(decimal)).toBe(0.0001);
    });

    it("should handle very large numbers", () => {
      const decimal = createDecimal(1000000);
      expect(decimalToNumber(decimal)).toBe(1000000);
    });
  });

  // ==========================================================================
  // CONVERSION WITH DEFAULT
  // ==========================================================================
  describe("decimalToNumberWithDefault", () => {
    it("should convert Decimal to number", () => {
      const decimal = createDecimal(10.5);
      expect(decimalToNumberWithDefault(decimal)).toBe(10.5);
    });

    it("should return default value for null", () => {
      expect(decimalToNumberWithDefault(null)).toBe(0);
    });

    it("should return default value for undefined", () => {
      expect(decimalToNumberWithDefault(undefined)).toBe(0);
    });

    it("should accept custom default value", () => {
      expect(decimalToNumberWithDefault(null, 100)).toBe(100);
    });

    it("should never return null", () => {
      const result = decimalToNumberWithDefault(null);
      expect(result).not.toBeNull();
      expect(typeof result).toBe("number");
    });

    it("should use default for invalid values", () => {
      expect(decimalToNumberWithDefault("invalid", 50)).toBe(50);
    });

    it("should return actual value when valid", () => {
      const decimal = createDecimal(25.5);
      expect(decimalToNumberWithDefault(decimal, 100)).toBe(25.5);
    });
  });

  // ==========================================================================
  // REQUIRED CONVERSION
  // ==========================================================================
  describe("decimalToNumberRequired", () => {
    it("should convert valid Decimal to number", () => {
      const decimal = createDecimal(10.5);
      expect(decimalToNumberRequired(decimal)).toBe(10.5);
    });

    it("should throw error for null", () => {
      expect(() => decimalToNumberRequired(null)).toThrow(
        "required but was null or undefined",
      );
    });

    it("should throw error for undefined", () => {
      expect(() => decimalToNumberRequired(undefined)).toThrow(
        "required but was null or undefined",
      );
    });

    it("should throw error for invalid value", () => {
      expect(() => decimalToNumberRequired("invalid")).toThrow(
        "not a valid Decimal",
      );
    });

    it("should handle valid number inputs", () => {
      expect(decimalToNumberRequired(42)).toBe(42);
    });

    it("should handle zero as valid", () => {
      const decimal = createDecimal(0);
      expect(decimalToNumberRequired(decimal)).toBe(0);
    });
  });

  // ==========================================================================
  // ARRAY CONVERSION
  // ==========================================================================
  describe("decimalArrayToNumbers", () => {
    it("should convert array of Decimals", () => {
      const decimals = [
        createDecimal(10.5),
        createDecimal(20.5),
        createDecimal(30.5),
      ];
      const result = decimalArrayToNumbers(decimals);
      expect(result).toEqual([10.5, 20.5, 30.5]);
    });

    it("should handle empty array", () => {
      expect(decimalArrayToNumbers([])).toEqual([]);
    });

    it("should handle mixed valid and null values", () => {
      const values = [createDecimal(10), null, createDecimal(20)];
      const result = decimalArrayToNumbers(values);
      expect(result).toEqual([10, null, 20]);
    });

    it("should handle array with only null values", () => {
      const result = decimalArrayToNumbers([null, null, null]);
      expect(result).toEqual([null, null, null]);
    });

    it("should preserve order", () => {
      const decimals = [createDecimal(5), createDecimal(3), createDecimal(1)];
      const result = decimalArrayToNumbers(decimals);
      expect(result).toEqual([5, 3, 1]);
    });
  });

  // ==========================================================================
  // ROUNDED CONVERSION
  // ==========================================================================
  describe("decimalToRounded", () => {
    it("should round to 2 decimals by default", () => {
      const decimal = createDecimal(10.126);
      expect(decimalToRounded(decimal)).toBe(10.13);
    });

    it("should round to specified decimals", () => {
      const decimal = createDecimal(10.12345);
      expect(decimalToRounded(decimal, 3)).toBe(10.123);
    });

    it("should handle no decimal places", () => {
      const decimal = createDecimal(10.5);
      expect(decimalToRounded(decimal, 0)).toBe(11);
    });

    it("should return null for null input", () => {
      expect(decimalToRounded(null)).toBeNull();
    });

    it("should round up correctly", () => {
      const decimal = createDecimal(10.996);
      expect(decimalToRounded(decimal, 2)).toBe(11.0);
    });

    it("should round down correctly", () => {
      const decimal = createDecimal(10.994);
      expect(decimalToRounded(decimal, 2)).toBe(10.99);
    });

    it("should handle negative numbers", () => {
      const decimal = createDecimal(-10.126);
      expect(decimalToRounded(decimal, 2)).toBe(-10.13);
    });
  });

  // ==========================================================================
  // COORDINATES CONVERSION
  // ==========================================================================
  describe("convertCoordinates", () => {
    it("should convert latitude and longitude", () => {
      const lat = createDecimal(40.7128);
      const lng = createDecimal(-74.006);
      const result = convertCoordinates(lat, lng);
      expect(result).toEqual({ lat: 40.7128, lng: -74.006 });
    });

    it("should return null if latitude is null", () => {
      const lng = createDecimal(-74.006);
      expect(convertCoordinates(null, lng)).toBeNull();
    });

    it("should return null if longitude is null", () => {
      const lat = createDecimal(40.7128);
      expect(convertCoordinates(lat, null)).toBeNull();
    });

    it("should return null if both are null", () => {
      expect(convertCoordinates(null, null)).toBeNull();
    });

    it("should handle zero coordinates", () => {
      const result = convertCoordinates(createDecimal(0), createDecimal(0));
      expect(result).toEqual({ lat: 0, lng: 0 });
    });

    it("should handle negative coordinates", () => {
      const lat = createDecimal(-33.8688);
      const lng = createDecimal(151.2093);
      const result = convertCoordinates(lat, lng);
      expect(result).toEqual({ lat: -33.8688, lng: 151.2093 });
    });
  });

  // ==========================================================================
  // CURRENCY CONVERSION
  // ==========================================================================
  describe("decimalToCurrency", () => {
    it("should format as USD by default", () => {
      const decimal = createDecimal(10.5);
      const result = decimalToCurrency(decimal);
      expect(result).toBe("$10.50");
    });

    it("should handle zero", () => {
      const decimal = createDecimal(0);
      expect(decimalToCurrency(decimal)).toBe("$0.00");
    });

    it("should handle null as zero", () => {
      expect(decimalToCurrency(null)).toBe("$0.00");
    });

    it("should format large numbers with commas", () => {
      const decimal = createDecimal(1000);
      expect(decimalToCurrency(decimal)).toBe("$1,000.00");
    });

    it("should handle negative amounts", () => {
      const decimal = createDecimal(-10.5);
      const result = decimalToCurrency(decimal);
      expect(result).toContain("-");
      expect(result).toContain("10.50");
    });

    it("should round to 2 decimal places", () => {
      const decimal = createDecimal(10.996);
      expect(decimalToCurrency(decimal)).toBe("$11.00");
    });
  });

  // ==========================================================================
  // TYPE GUARDS
  // ==========================================================================
  describe("isDecimal", () => {
    it("should return true for Prisma Decimal", () => {
      const decimal = createDecimal(10);
      expect(isDecimal(decimal)).toBe(true);
    });

    it("should return false for null", () => {
      expect(isDecimal(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isDecimal(undefined)).toBe(false);
    });

    it("should return false for number", () => {
      expect(isDecimal(42)).toBe(false);
    });

    it("should return false for string", () => {
      expect(isDecimal("10")).toBe(false);
    });

    it("should return false for plain object", () => {
      expect(isDecimal({ value: 10 })).toBe(false);
    });
  });

  // ==========================================================================
  // SAFE CONVERSION
  // ==========================================================================
  describe("safeDecimalToNumber", () => {
    it("should convert Decimal safely", () => {
      const decimal = createDecimal(10.5);
      expect(safeDecimalToNumber(decimal)).toBe(10.5);
    });

    it("should return null for null", () => {
      expect(safeDecimalToNumber(null)).toBeNull();
    });

    it("should handle numbers", () => {
      expect(safeDecimalToNumber(42)).toBe(42);
    });

    it("should parse numeric strings", () => {
      expect(safeDecimalToNumber("42.5")).toBe(42.5);
    });

    it("should return null for invalid strings", () => {
      expect(safeDecimalToNumber("invalid")).toBeNull();
    });

    it("should handle NaN as a number type", () => {
      const result = safeDecimalToNumber(NaN);
      // NaN is technically a number type in JavaScript
      expect(typeof result === "number" && isNaN(result)).toBe(true);
    });

    it("should handle zero", () => {
      expect(safeDecimalToNumber(0)).toBe(0);
      expect(safeDecimalToNumber("0")).toBe(0);
    });
  });

  // ==========================================================================
  // BATCH FIELD CONVERSION
  // ==========================================================================
  describe("convertDecimalFields", () => {
    it("should convert specified Decimal fields", () => {
      const obj = {
        id: "123",
        price: createDecimal(10.5),
        quantity: 5,
        rating: createDecimal(4.5),
      };
      const result = convertDecimalFields(obj, ["price", "rating"]);
      expect(result.price).toBe(10.5);
      expect(result.rating).toBe(4.5);
      expect(result.id).toBe("123");
      expect(result.quantity).toBe(5);
    });

    it("should not modify non-Decimal fields", () => {
      const obj = {
        id: "123",
        price: 10.5,
        name: "Product",
      };
      const result = convertDecimalFields(obj, ["price", "name"]);
      expect(result.price).toBe(10.5);
      expect(result.name).toBe("Product");
    });

    it("should handle empty fields array", () => {
      const obj = { price: createDecimal(10) };
      const result = convertDecimalFields(obj, []);
      expect(isDecimal(result.price)).toBe(true);
    });

    it("should not mutate original object", () => {
      const obj = {
        price: createDecimal(10.5),
      };
      const result = convertDecimalFields(obj, ["price"]);
      expect(isDecimal(obj.price)).toBe(true);
      expect(typeof result.price).toBe("number");
    });
  });

  // ==========================================================================
  // FARM HELPERS
  // ==========================================================================
  describe("convertFarmCoordinates", () => {
    it("should convert farm coordinates", () => {
      const farm = {
        latitude: createDecimal(40.7128),
        longitude: createDecimal(-74.006),
      };
      const result = convertFarmCoordinates(farm);
      expect(result.latitude).toBe(40.7128);
      expect(result.longitude).toBe(-74.006);
    });

    it("should use default 0 for null coordinates", () => {
      const farm = { latitude: null, longitude: null };
      const result = convertFarmCoordinates(farm);
      expect(result.latitude).toBe(0);
      expect(result.longitude).toBe(0);
    });

    it("should handle mixed null/valid coordinates", () => {
      const farm = {
        latitude: createDecimal(40.7128),
        longitude: null,
      };
      const result = convertFarmCoordinates(farm);
      expect(result.latitude).toBe(40.7128);
      expect(result.longitude).toBe(0);
    });
  });

  describe("convertFarmFinancials", () => {
    it("should convert all financial fields", () => {
      const farm = {
        totalRevenueUSD: createDecimal(50000),
        averageRating: createDecimal(4.5),
        farmSize: createDecimal(100.5),
        budgetPerAcre: createDecimal(1500),
      };
      const result = convertFarmFinancials(farm);
      expect(result.totalRevenueUSD).toBe(50000);
      expect(result.averageRating).toBe(4.5);
      expect(result.farmSize).toBe(100.5);
      expect(result.budgetPerAcre).toBe(1500);
    });

    it("should handle null optional fields", () => {
      const farm = {
        totalRevenueUSD: createDecimal(50000),
        averageRating: null,
        farmSize: null,
        budgetPerAcre: null,
      };
      const result = convertFarmFinancials(farm);
      expect(result.totalRevenueUSD).toBe(50000);
      expect(result.averageRating).toBeNull();
      expect(result.farmSize).toBeNull();
      expect(result.budgetPerAcre).toBeNull();
    });

    it("should default revenue to 0", () => {
      const farm = {
        totalRevenueUSD: null,
      };
      const result = convertFarmFinancials(farm);
      expect(result.totalRevenueUSD).toBe(0);
    });
  });

  // ==========================================================================
  // PRODUCT HELPERS
  // ==========================================================================
  describe("convertProductPrice", () => {
    it("should convert all price fields", () => {
      const product = {
        price: createDecimal(10.99),
        compareAtPrice: createDecimal(15.99),
        costPrice: createDecimal(7.5),
      };
      const result = convertProductPrice(product);
      expect(result.price).toBe(10.99);
      expect(result.compareAtPrice).toBe(15.99);
      expect(result.costPrice).toBe(7.5);
    });

    it("should handle null optional prices", () => {
      const product = {
        price: createDecimal(10.99),
        compareAtPrice: null,
        costPrice: null,
      };
      const result = convertProductPrice(product);
      expect(result.price).toBe(10.99);
      expect(result.compareAtPrice).toBeNull();
      expect(result.costPrice).toBeNull();
    });

    it("should default main price to 0", () => {
      const product = { price: null };
      const result = convertProductPrice(product);
      expect(result.price).toBe(0);
    });
  });

  // ==========================================================================
  // ORDER HELPERS
  // ==========================================================================
  describe("convertOrderTotals", () => {
    it("should convert all order total fields", () => {
      const order = {
        subtotal: createDecimal(100),
        tax: createDecimal(8.5),
        deliveryFee: createDecimal(5),
        total: createDecimal(113.5),
        discount: createDecimal(10),
      };
      const result = convertOrderTotals(order);
      expect(result.subtotal).toBe(100);
      expect(result.tax).toBe(8.5);
      expect(result.deliveryFee).toBe(5);
      expect(result.total).toBe(113.5);
      expect(result.discount).toBe(10);
    });

    it("should handle null discount", () => {
      const order = {
        subtotal: createDecimal(100),
        tax: createDecimal(8.5),
        deliveryFee: createDecimal(5),
        total: createDecimal(113.5),
        discount: null,
      };
      const result = convertOrderTotals(order);
      expect(result.discount).toBeNull();
    });

    it("should default required fields to 0", () => {
      const order = {
        subtotal: null,
        tax: null,
        deliveryFee: null,
        total: null,
      };
      const result = convertOrderTotals(order);
      expect(result.subtotal).toBe(0);
      expect(result.tax).toBe(0);
      expect(result.deliveryFee).toBe(0);
      expect(result.total).toBe(0);
    });

    it("should handle zero values", () => {
      const order = {
        subtotal: createDecimal(100),
        tax: createDecimal(0),
        deliveryFee: createDecimal(0),
        total: createDecimal(100),
      };
      const result = convertOrderTotals(order);
      expect(result.tax).toBe(0);
      expect(result.deliveryFee).toBe(0);
    });
  });

  // ==========================================================================
  // INTEGRATION TESTS
  // ==========================================================================
  describe("Integration Tests", () => {
    it("should handle complete product with prices", () => {
      const product = {
        id: "prod_123",
        name: "Tomatoes",
        price: createDecimal(5.99),
        compareAtPrice: createDecimal(7.99),
        rating: createDecimal(4.5),
      };

      const converted = {
        ...product,
        ...convertProductPrice(product),
        rating: decimalToNumber(product.rating),
      };

      expect(converted.price).toBe(5.99);
      expect(converted.compareAtPrice).toBe(7.99);
      expect(converted.rating).toBe(4.5);
    });

    it("should handle complete order with totals", () => {
      const order = {
        id: "order_123",
        subtotal: createDecimal(100),
        tax: createDecimal(8.5),
        deliveryFee: createDecimal(5),
        total: createDecimal(113.5),
      };

      const converted = convertOrderTotals(order);
      const displayTotal = decimalToCurrency(order.total);

      expect(converted.total).toBe(113.5);
      expect(displayTotal).toBe("$113.50");
    });

    it("should handle farm with all fields", () => {
      const farm = {
        id: "farm_123",
        name: "Green Valley Farm",
        latitude: createDecimal(40.7128),
        longitude: createDecimal(-74.006),
        totalRevenueUSD: createDecimal(50000),
        averageRating: createDecimal(4.7),
        farmSize: createDecimal(150.5),
      };

      const coords = convertFarmCoordinates(farm);
      const financials = convertFarmFinancials(farm);

      expect(coords.latitude).toBe(40.7128);
      expect(coords.longitude).toBe(-74.006);
      expect(financials.totalRevenueUSD).toBe(50000);
      expect(financials.averageRating).toBe(4.7);
    });
  });
});
