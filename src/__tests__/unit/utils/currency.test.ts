/**
 * 🧪 CURRENCY UTILITY TESTS - COMPREHENSIVE TEST SUITE
 *
 * Tests for currency formatting and parsing utilities
 *
 * Coverage:
 * - Currency formatting (USD)
 * - Currency parsing
 * - Edge cases and error handling
 *
 * @reference .cursorrules - Testing Patterns
 */

import { formatCurrency, parseCurrency } from "@/lib/utils/currency";
import { describe, expect, it } from "@jest/globals";

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

describe("formatCurrency", () => {
  describe("basic formatting", () => {
    it("should format whole numbers", () => {
      expect(formatCurrency(10)).toBe("$10.00");
      expect(formatCurrency(100)).toBe("$100.00");
      expect(formatCurrency(1000)).toBe("$1,000.00");
    });

    it("should format decimal numbers", () => {
      expect(formatCurrency(10.5)).toBe("$10.50");
      expect(formatCurrency(10.99)).toBe("$10.99");
      expect(formatCurrency(10.123)).toBe("$10.12");
    });

    it("should always show 2 decimal places", () => {
      expect(formatCurrency(10.5)).toBe("$10.50");
      expect(formatCurrency(10.9)).toBe("$10.90");
      expect(formatCurrency(10)).toBe("$10.00");
    });

    it("should handle zero", () => {
      expect(formatCurrency(0)).toBe("$0.00");
    });

    it("should handle negative numbers", () => {
      expect(formatCurrency(-10)).toBe("-$10.00");
      expect(formatCurrency(-10.5)).toBe("-$10.50");
    });

    it("should add thousand separators", () => {
      expect(formatCurrency(1000)).toBe("$1,000.00");
      expect(formatCurrency(10000)).toBe("$10,000.00");
      expect(formatCurrency(100000)).toBe("$100,000.00");
      expect(formatCurrency(1000000)).toBe("$1,000,000.00");
    });
  });

  describe("string input", () => {
    it("should accept string numbers", () => {
      expect(formatCurrency("10")).toBe("$10.00");
      expect(formatCurrency("10.50")).toBe("$10.50");
      expect(formatCurrency("1000")).toBe("$1,000.00");
    });

    it("should handle string decimals", () => {
      expect(formatCurrency("10.5")).toBe("$10.50");
      expect(formatCurrency("10.99")).toBe("$10.99");
    });

    it("should handle negative string numbers", () => {
      expect(formatCurrency("-10")).toBe("-$10.00");
      expect(formatCurrency("-10.50")).toBe("-$10.50");
    });
  });

  describe("edge cases", () => {
    it("should handle very small numbers", () => {
      expect(formatCurrency(0.01)).toBe("$0.01");
      expect(formatCurrency(0.99)).toBe("$0.99");
    });

    it("should handle very large numbers", () => {
      expect(formatCurrency(999999.99)).toBe("$999,999.99");
      expect(formatCurrency(1000000)).toBe("$1,000,000.00");
    });

    it("should round to 2 decimal places", () => {
      expect(formatCurrency(10.125)).toBe("$10.13"); // Banker's rounding
      expect(formatCurrency(10.126)).toBe("$10.13");
      expect(formatCurrency(10.999)).toBe("$11.00");
    });

    it("should handle scientific notation", () => {
      expect(formatCurrency(1e3)).toBe("$1,000.00");
      expect(formatCurrency(1e6)).toBe("$1,000,000.00");
    });
  });

  describe("product pricing scenarios", () => {
    it("should format typical farm product prices", () => {
      expect(formatCurrency(4.99)).toBe("$4.99"); // per lb tomatoes
      expect(formatCurrency(12.5)).toBe("$12.50"); // per dozen eggs
      expect(formatCurrency(25)).toBe("$25.00"); // farm box
    });

    it("should format bulk order prices", () => {
      expect(formatCurrency(150.75)).toBe("$150.75");
      expect(formatCurrency(1250)).toBe("$1,250.00");
    });
  });
});

// ============================================================================
// CURRENCY PARSING
// ============================================================================

describe("parseCurrency", () => {
  describe("basic parsing", () => {
    it("should parse dollar amounts", () => {
      expect(parseCurrency("$10.00")).toBe(10);
      expect(parseCurrency("$10.50")).toBe(10.5);
      expect(parseCurrency("$100.99")).toBe(100.99);
    });

    it("should parse amounts with thousand separators", () => {
      expect(parseCurrency("$1,000.00")).toBe(1000);
      expect(parseCurrency("$10,000.50")).toBe(10000.5);
      expect(parseCurrency("$100,000.99")).toBe(100000.99);
    });

    it("should parse amounts without dollar sign", () => {
      expect(parseCurrency("10.00")).toBe(10);
      expect(parseCurrency("10.50")).toBe(10.5);
      expect(parseCurrency("1000")).toBe(1000);
    });

    it("should parse negative amounts", () => {
      expect(parseCurrency("-$10.00")).toBe(-10);
      expect(parseCurrency("-$10.50")).toBe(-10.5);
      expect(parseCurrency("-10")).toBe(-10);
    });
  });

  describe("format variations", () => {
    it("should handle amounts with spaces", () => {
      expect(parseCurrency("$ 10.00")).toBe(10);
      expect(parseCurrency("$10 .00")).toBe(10);
    });

    it("should handle amounts with extra characters", () => {
      expect(parseCurrency("$10.00 USD")).toBe(10);
      expect(parseCurrency("Price: $10.00")).toBe(10);
    });

    it("should extract first valid number", () => {
      expect(parseCurrency("Total: $150.75 (tax included)")).toBe(150.75);
    });
  });

  describe("edge cases", () => {
    it("should handle zero", () => {
      expect(parseCurrency("$0.00")).toBe(0);
      expect(parseCurrency("0")).toBe(0);
    });

    it("should handle decimal numbers", () => {
      expect(parseCurrency("$0.99")).toBe(0.99);
      expect(parseCurrency("$0.01")).toBe(0.01);
    });

    it("should handle large numbers", () => {
      expect(parseCurrency("$1,000,000.00")).toBe(1000000);
      expect(parseCurrency("$999,999.99")).toBe(999999.99);
    });

    it("should handle numbers with only decimals", () => {
      expect(parseCurrency(".99")).toBe(0.99);
      expect(parseCurrency(".50")).toBe(0.5);
    });
  });

  describe("invalid inputs", () => {
    it("should return NaN for non-numeric strings", () => {
      expect(parseCurrency("invalid")).toBeNaN();
      expect(parseCurrency("")).toBeNaN();
    });

    it("should handle empty strings", () => {
      expect(parseCurrency("")).toBeNaN();
      expect(parseCurrency("   ")).toBeNaN();
    });
  });
});

// ============================================================================
// ROUND TRIP CONVERSION
// ============================================================================

describe("Currency Utilities Integration", () => {
  it("should maintain value through format and parse cycle", () => {
    const testValues = [0, 10, 10.5, 100.99, 1000, 10000.5];

    testValues.forEach((value) => {
      const formatted = formatCurrency(value);
      const parsed = parseCurrency(formatted);
      expect(parsed).toBe(value);
    });
  });

  it("should handle negative values in round trip", () => {
    const formatted = formatCurrency(-10.5);
    const parsed = parseCurrency(formatted);
    expect(parsed).toBe(-10.5);
  });

  it("should handle large values in round trip", () => {
    const value = 1000000.99;
    const formatted = formatCurrency(value);
    const parsed = parseCurrency(formatted);
    expect(parsed).toBe(value);
  });

  it("should work with typical e-commerce flow", () => {
    // Product price
    const price = 4.99;
    const formattedPrice = formatCurrency(price);
    expect(formattedPrice).toBe("$4.99");

    // Parse from form input
    const parsedPrice = parseCurrency(formattedPrice);
    expect(parsedPrice).toBe(price);

    // Calculate total
    const quantity = 3;
    const total = parsedPrice * quantity;
    expect(formatCurrency(total)).toBe("$14.97");
  });

  it("should work with order totals calculation", () => {
    const items = [
      { name: "Tomatoes", price: 4.99, quantity: 2 },
      { name: "Eggs", price: 6.5, quantity: 1 },
      { name: "Bread", price: 5.0, quantity: 1 },
    ];

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    expect(subtotal).toBe(21.48);
    expect(formatCurrency(subtotal)).toBe("$21.48");

    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    expect(formatCurrency(total)).toBe("$23.20");
  });
});
