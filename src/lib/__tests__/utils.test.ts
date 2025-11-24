/**
 * 🔧 Utility Functions Tests - Divine Helper Excellence
 * Agricultural consciousness meets enterprise utility patterns
 */

// Unmock utils to test real implementations
jest.unmock("@/lib/utils");

import {
  cn,
  formatNumber,
  formatPrice,
  truncate,
  sleep,
  debounce,
  generateId,
} from "../utils";

describe("🔧 Utility Functions - Divine Helper System", () => {
  // Use real timers for sleep tests
  beforeEach(() => {
    jest.useRealTimers();
  });
  describe("🎨 cn - Class Name Merging with Tailwind", () => {
    it("should merge simple class names", () => {
      const result = cn("px-4", "py-2");
      expect(result).toBe("px-4 py-2");
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const result = cn("base-class", isActive && "active-class");
      expect(result).toContain("base-class");
      expect(result).toContain("active-class");
    });

    it("should remove false/undefined/null classes", () => {
      const result = cn("valid", false && "false-class", null, undefined);
      expect(result).toBe("valid");
      expect(result).not.toContain("false-class");
    });

    it("should merge conflicting Tailwind classes correctly", () => {
      // tailwind-merge should keep the last conflicting class
      const result = cn("px-2", "px-4");
      expect(result).toBe("px-4");
      expect(result).not.toContain("px-2");
    });

    it("should handle arrays of classes", () => {
      const result = cn(["class1", "class2"], "class3");
      expect(result).toContain("class1");
      expect(result).toContain("class2");
      expect(result).toContain("class3");
    });

    it("should handle objects with boolean values", () => {
      const result = cn({
        "always-present": true,
        "sometimes-present": false,
        "also-present": true,
      });
      expect(result).toContain("always-present");
      expect(result).not.toContain("sometimes-present");
      expect(result).toContain("also-present");
    });

    it("should handle empty input", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("should handle complex agricultural component classes", () => {
      const result = cn(
        "farm-card",
        "rounded-lg shadow-lg",
        "hover:shadow-xl",
        {
          "border-green-500": true,
          "border-red-500": false,
        },
        "transition-all duration-300",
      );
      expect(result).toContain("farm-card");
      expect(result).toContain("rounded-lg");
      expect(result).toContain("border-green-500");
      expect(result).not.toContain("border-red-500");
    });

    it("should merge responsive classes", () => {
      const result = cn("w-full", "md:w-1/2", "lg:w-1/3");
      expect(result).toContain("w-full");
      expect(result).toContain("md:w-1/2");
      expect(result).toContain("lg:w-1/3");
    });

    it("should deduplicate identical classes", () => {
      const result = cn("text-center", "text-center");
      expect(result).toBe("text-center");
    });
  });

  describe("🔢 formatNumber - Localized Number Formatting", () => {
    it("should format number with default locale (en-US)", () => {
      const result = formatNumber(1234567.89);
      expect(result).toBe("1,234,567.89");
    });

    it("should format integer numbers", () => {
      const result = formatNumber(1000);
      expect(result).toBe("1,000");
    });

    it("should format zero", () => {
      const result = formatNumber(0);
      expect(result).toBe("0");
    });

    it("should format negative numbers", () => {
      const result = formatNumber(-5000);
      expect(result).toBe("-5,000");
    });

    it("should format small decimal numbers", () => {
      const result = formatNumber(0.123);
      expect(result).toBe("0.123");
    });

    it("should format large numbers", () => {
      const result = formatNumber(1000000000);
      expect(result).toBe("1,000,000,000");
    });

    it("should format numbers with different locales", () => {
      const resultUS = formatNumber(1234.56, "en-US");
      const resultDE = formatNumber(1234.56, "de-DE");

      expect(resultUS).toBe("1,234.56");
      expect(resultDE).toBe("1.234,56");
    });

    it("should handle very small numbers", () => {
      const result = formatNumber(0.00001);
      expect(result).toBeDefined();
    });

    it("should format agricultural quantities", () => {
      const bushels = formatNumber(150.5);
      expect(bushels).toBe("150.5");
    });
  });

  describe("💰 formatPrice - Currency Formatting", () => {
    it("should format price with dollar sign", () => {
      const result = formatPrice(19.99);
      expect(result).toBe("$19.99");
    });

    it("should format integer prices", () => {
      const result = formatPrice(100);
      expect(result).toBe("$100.00");
    });

    it("should format zero price", () => {
      const result = formatPrice(0);
      expect(result).toBe("$0.00");
    });

    it("should format large prices", () => {
      const result = formatPrice(1234567.89);
      expect(result).toBe("$1,234,567.89");
    });

    it("should format small prices (cents)", () => {
      const result = formatPrice(0.99);
      expect(result).toBe("$0.99");
    });

    it("should format negative prices", () => {
      const result = formatPrice(-50.0);
      expect(result).toBe("-$50.00");
    });

    it("should always show two decimal places", () => {
      const result1 = formatPrice(5);
      const result2 = formatPrice(5.5);
      const result3 = formatPrice(5.55);

      expect(result1).toBe("$5.00");
      expect(result2).toBe("$5.50");
      expect(result3).toBe("$5.55");
    });

    it("should handle product prices", () => {
      const tomatoPrice = formatPrice(4.99);
      const lettucePric = formatPrice(3.49);
      const carrotPrice = formatPrice(2.99);

      expect(tomatoPrice).toBe("$4.99");
      expect(lettucePric).toBe("$3.49");
      expect(carrotPrice).toBe("$2.99");
    });

    it("should handle bulk order prices", () => {
      const bulkOrder = formatPrice(1599.95);
      expect(bulkOrder).toBe("$1,599.95");
    });

    it("should round to two decimals", () => {
      const result = formatPrice(19.999);
      expect(result).toBe("$20.00");
    });
  });

  describe("✂️ truncate - Text Truncation", () => {
    it("should truncate long text", () => {
      const text = "This is a very long text that needs to be truncated";
      const result = truncate(text, 20);
      expect(result).toBe("This is a very long ...");
      expect(result.length).toBe(23); // 20 + "..."
    });

    it("should not truncate short text", () => {
      const text = "Short text";
      const result = truncate(text, 20);
      expect(result).toBe("Short text");
      expect(result).not.toContain("...");
    });

    it("should handle exact length match", () => {
      const text = "Exact length";
      const result = truncate(text, 12);
      expect(result).toBe("Exact length");
      expect(result).not.toContain("...");
    });

    it("should truncate to zero length", () => {
      const text = "Some text";
      const result = truncate(text, 0);
      expect(result).toBe("...");
    });

    it("should handle empty string", () => {
      const result = truncate("", 10);
      expect(result).toBe("");
    });

    it("should truncate farm descriptions", () => {
      const description =
        "Our biodynamic farm practices sustainable agriculture with a focus on organic produce and regenerative farming techniques.";
      const result = truncate(description, 50);
      expect(result.length).toBe(53); // 50 + "..."
      expect(result).toContain("...");
    });

    it("should truncate product names", () => {
      const longName = "Organic Heirloom Tomatoes Grown in Rich Volcanic Soil";
      const result = truncate(longName, 30);
      expect(result).toContain("...");
      expect(result.length).toBeLessThanOrEqual(33);
    });

    it("should handle unicode characters", () => {
      const text = "🌾🌻🌽 Agricultural Emojis 🍅🥕🥬";
      const result = truncate(text, 15);
      expect(result).toBeDefined();
    });

    it("should handle single character truncation", () => {
      const result = truncate("Hello", 1);
      expect(result).toBe("H...");
    });
  });

  describe("⏰ sleep - Async Delay", () => {
    it("should delay execution for specified time", async () => {
      const startTime = Date.now();
      await sleep(50);
      const duration = Date.now() - startTime;

      expect(duration).toBeGreaterThanOrEqual(45); // Allow 5ms tolerance
      expect(duration).toBeLessThan(100);
    });

    it("should work with zero milliseconds", async () => {
      const startTime = Date.now();
      await sleep(0);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(20); // Increased tolerance for system timing variations
    });

    it("should work in async workflows", async () => {
      const results: number[] = [];

      results.push(1);
      await sleep(10);
      results.push(2);
      await sleep(10);
      results.push(3);

      expect(results).toEqual([1, 2, 3]);
    });

    it("should handle multiple concurrent sleeps", async () => {
      const startTime = Date.now();
      await Promise.all([sleep(50), sleep(50), sleep(50)]);
      const duration = Date.now() - startTime;

      // All should complete in parallel, ~50ms total
      expect(duration).toBeGreaterThanOrEqual(45);
      expect(duration).toBeLessThan(100);
    });

    it("should work with very short delays", async () => {
      const result = await sleep(1);
      expect(result).toBeUndefined();
    });

    it("should be chainable", async () => {
      const result = await sleep(1).then(() => "completed");
      expect(result).toBe("completed");
    });
  });

  describe("⏱️ debounce - Function Debouncing", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it("should debounce function calls", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should call function with latest arguments", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn("first");
      debouncedFn("second");
      debouncedFn("third");

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith("third");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should reset timer on each call", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      jest.advanceTimersByTime(50);
      debouncedFn();
      jest.advanceTimersByTime(50);

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple debounced functions independently", () => {
      const mockFn1 = jest.fn();
      const mockFn2 = jest.fn();
      const debouncedFn1 = debounce(mockFn1, 100);
      const debouncedFn2 = debounce(mockFn2, 200);

      debouncedFn1();
      debouncedFn2();

      jest.advanceTimersByTime(100);
      expect(mockFn1).toHaveBeenCalledTimes(1);
      expect(mockFn2).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn2).toHaveBeenCalledTimes(1);
    });

    it("should work with different wait times", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 500);

      debouncedFn();
      jest.advanceTimersByTime(400);
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should handle search input debouncing", () => {
      const searchFn = jest.fn();
      const debouncedSearch = debounce(searchFn, 300);

      // Simulate rapid typing
      debouncedSearch("a");
      debouncedSearch("ap");
      debouncedSearch("app");
      debouncedSearch("appl");
      debouncedSearch("apple");

      expect(searchFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);

      expect(searchFn).toHaveBeenCalledWith("apple");
      expect(searchFn).toHaveBeenCalledTimes(1);
    });

    it("should work with zero wait time", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 0);

      debouncedFn();
      jest.advanceTimersByTime(0);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("🆔 generateId - Random ID Generation", () => {
    it("should generate an ID", () => {
      const id = generateId();
      expect(id).toBeDefined();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });

    it("should generate unique IDs", () => {
      const id1 = generateId();
      const id2 = generateId();
      const id3 = generateId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it("should generate IDs with consistent format", () => {
      const ids = Array.from({ length: 100 }, generateId);

      ids.forEach((id) => {
        expect(id).toMatch(/^[a-z0-9]+$/);
        expect(id.length).toBeGreaterThan(8);
        expect(id.length).toBeLessThanOrEqual(13);
      });
    });

    it("should generate IDs efficiently", () => {
      const startTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        generateId();
      }
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(100); // 1000 IDs in < 100ms
    });

    it("should generate alphanumeric IDs only", () => {
      const ids = Array.from({ length: 50 }, generateId);

      ids.forEach((id) => {
        expect(id).toMatch(/^[a-z0-9]+$/);
        expect(id).not.toContain(" ");
        expect(id).not.toContain("-");
        expect(id).not.toContain("_");
      });
    });

    it("should use for temporary keys", () => {
      const tempKeys = new Set();
      for (let i = 0; i < 100; i++) {
        tempKeys.add(generateId());
      }

      // All should be unique
      expect(tempKeys.size).toBe(100);
    });

    it("should work for react keys", () => {
      const items = ["Apple", "Banana", "Orange"];
      const keysMap = items.map((item) => ({
        key: generateId(),
        value: item,
      }));

      const keys = keysMap.map((item) => item.key);
      const uniqueKeys = new Set(keys);

      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  describe("🌾 Integration Tests - Agricultural Use Cases", () => {
    it("should format farm product display", () => {
      const productName = "Organic Heirloom Tomatoes from Sunny Valley Farm";
      const price = 8.99;
      const quantity = 1250;

      const displayName = truncate(productName, 30);
      const displayPrice = formatPrice(price);
      const displayQuantity = formatNumber(quantity);

      expect(displayName).toContain("...");
      expect(displayPrice).toBe("$8.99");
      expect(displayQuantity).toBe("1,250");
    });

    it("should handle farm card styling", () => {
      const isFeatured = true;
      const isOrganic = true;
      const isSeasonal = false;

      const classes = cn(
        "farm-card rounded-lg shadow-md",
        isFeatured && "border-2 border-yellow-400",
        isOrganic && "bg-green-50",
        isSeasonal && "border-blue-400",
      );

      expect(classes).toContain("farm-card");
      expect(classes).toContain("border-yellow-400");
      expect(classes).toContain("bg-green-50");
      expect(classes).not.toContain("border-blue-400");
    });

    it("should format order summary", () => {
      const items = [
        { name: "Organic Tomatoes", price: 5.99, quantity: 2 },
        { name: "Fresh Basil", price: 3.49, quantity: 1 },
        { name: "Lettuce", price: 2.99, quantity: 3 },
      ];

      const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      const formattedTotal = formatPrice(total);
      // 5.99*2 + 3.49*1 + 2.99*3 = 11.98 + 3.49 + 8.97 = 24.44
      expect(formattedTotal).toBe("$24.44");
    });

    it("should generate temporary cart item keys", () => {
      const cartItems = [
        { id: generateId(), product: "Tomatoes" },
        { id: generateId(), product: "Lettuce" },
        { id: generateId(), product: "Carrots" },
      ];

      const ids = cartItems.map((item) => item.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(3);
    });
  });

  describe("⚡ Performance Tests - HP OMEN Optimization", () => {
    it("should handle bulk formatting operations", () => {
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        formatPrice(Math.random() * 1000);
        formatNumber(Math.random() * 1000000);
        truncate("Some text to truncate", 10);
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(200); // 3000 operations in < 200ms (generous for CI)
    });

    it("should handle concurrent class name merging", () => {
      const startTime = Date.now();

      const results = Array.from({ length: 1000 }, () =>
        cn("base", "class1", "class2", { active: true, disabled: false }),
      );

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(50);
      expect(results.length).toBe(1000);
    });

    it("should generate IDs efficiently in bulk", () => {
      const startTime = Date.now();
      const ids = Array.from({ length: 10000 }, generateId);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(500);
      expect(new Set(ids).size).toBe(10000); // All unique
    });
  });

  describe("🛡️ Edge Cases & Error Handling", () => {
    it("should handle null/undefined in cn gracefully", () => {
      expect(() => cn(null as any)).not.toThrow();
      expect(() => cn(undefined as any)).not.toThrow();
    });

    it("should handle negative lengths in truncate", () => {
      const result = truncate("Test", -5);
      expect(result).toBe("...");
    });

    it("should handle NaN in formatNumber", () => {
      const result = formatNumber(NaN);
      expect(result).toBe("NaN");
    });

    it("should handle Infinity in formatPrice", () => {
      const result = formatPrice(Infinity);
      expect(result).toContain("∞");
    });

    it("should handle special characters in truncate", () => {
      const text = "Test\nwith\nnewlines";
      const result = truncate(text, 10);
      expect(result).toBeDefined();
    });
  });
});
