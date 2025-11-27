/**
 * AGRICULTURAL VALIDATION TESTS
 * Comprehensive test suite for agricultural validation schemas
 *
 * Coverage Target: 100%
 * References: 13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import {
  SeasonSchema,
  SeasonalValidationSchema,
  CoordinatesSchema,
  FarmValidationSchema,
  ProductValidationSchema,
  FarmSearchSchema,
  validateSeasonalAlignment,
  validateBiodynamicCompliance,
  sanitizeSearchQuery,
  type Season,
} from "../agricultural-validation";

describe("Agricultural Validation Schemas", () => {
  describe("SeasonSchema", () => {
    it("should validate valid seasons", () => {
      expect(SeasonSchema.parse("SPRING")).toBe("SPRING");
      expect(SeasonSchema.parse("SUMMER")).toBe("SUMMER");
      expect(SeasonSchema.parse("FALL")).toBe("FALL");
      expect(SeasonSchema.parse("WINTER")).toBe("WINTER");
    });

    it("should reject invalid seasons", () => {
      expect(() => SeasonSchema.parse("INVALID")).toThrow();
      expect(() => SeasonSchema.parse("spring")).toThrow();
      expect(() => SeasonSchema.parse("")).toThrow();
    });
  });

  describe("SeasonalValidationSchema", () => {
    const validSeasonalData = {
      season: "SPRING" as const,
      lunarPhase: "FULL_MOON" as const,
      soilTemperature: 15,
      moistureLevel: 0.6,
      biodynamicCompliance: true,
      agriculturalConsciousness: 0.8,
    };

    it("should validate complete seasonal data", () => {
      const result = SeasonalValidationSchema.parse(validSeasonalData);
      expect(result).toEqual(validSeasonalData);
    });

    it("should apply default values", () => {
      const minimalData = {
        season: "SUMMER" as const,
        lunarPhase: "NEW_MOON" as const,
        soilTemperature: 20,
        moistureLevel: 0.5,
      };

      const result = SeasonalValidationSchema.parse(minimalData);
      expect(result.biodynamicCompliance).toBe(false);
      expect(result.agriculturalConsciousness).toBe(0.5);
    });

    it("should validate all lunar phases", () => {
      const phases = [
        "NEW_MOON",
        "WAXING_CRESCENT",
        "FIRST_QUARTER",
        "WAXING_GIBBOUS",
        "FULL_MOON",
        "WANING_GIBBOUS",
        "LAST_QUARTER",
        "WANING_CRESCENT",
      ] as const;

      phases.forEach((phase) => {
        const data = { ...validSeasonalData, lunarPhase: phase };
        expect(() => SeasonalValidationSchema.parse(data)).not.toThrow();
      });
    });

    it("should validate soil temperature boundaries", () => {
      expect(() =>
        SeasonalValidationSchema.parse({
          ...validSeasonalData,
          soilTemperature: -10,
        }),
      ).not.toThrow();

      expect(() =>
        SeasonalValidationSchema.parse({
          ...validSeasonalData,
          soilTemperature: 40,
        }),
      ).not.toThrow();

      expect(() =>
        SeasonalValidationSchema.parse({
          ...validSeasonalData,
          soilTemperature: -11,
        }),
      ).toThrow();

      expect(() =>
        SeasonalValidationSchema.parse({
          ...validSeasonalData,
          soilTemperature: 41,
        }),
      ).toThrow();
    });

    it("should validate moisture level range", () => {
      expect(() =>
        SeasonalValidationSchema.parse({
          ...validSeasonalData,
          moistureLevel: 0,
        }),
      ).not.toThrow();

      expect(() =>
        SeasonalValidationSchema.parse({
          ...validSeasonalData,
          moistureLevel: 1,
        }),
      ).not.toThrow();

      expect(() =>
        SeasonalValidationSchema.parse({
          ...validSeasonalData,
          moistureLevel: -0.1,
        }),
      ).toThrow();

      expect(() =>
        SeasonalValidationSchema.parse({
          ...validSeasonalData,
          moistureLevel: 1.1,
        }),
      ).toThrow();
    });

    it("should validate agricultural consciousness range", () => {
      expect(() =>
        SeasonalValidationSchema.parse({
          ...validSeasonalData,
          agriculturalConsciousness: 0,
        }),
      ).not.toThrow();

      expect(() =>
        SeasonalValidationSchema.parse({
          ...validSeasonalData,
          agriculturalConsciousness: 1,
        }),
      ).not.toThrow();

      expect(() =>
        SeasonalValidationSchema.parse({
          ...validSeasonalData,
          agriculturalConsciousness: 1.5,
        }),
      ).toThrow();
    });
  });

  describe("CoordinatesSchema", () => {
    it("should validate valid coordinates", () => {
      const coords = { latitude: 40.7128, longitude: -74.006 };
      expect(CoordinatesSchema.parse(coords)).toEqual(coords);
    });

    it("should validate latitude boundaries", () => {
      expect(() =>
        CoordinatesSchema.parse({ latitude: -90, longitude: 0 }),
      ).not.toThrow();
      expect(() =>
        CoordinatesSchema.parse({ latitude: 90, longitude: 0 }),
      ).not.toThrow();
      expect(() =>
        CoordinatesSchema.parse({ latitude: -91, longitude: 0 }),
      ).toThrow();
      expect(() =>
        CoordinatesSchema.parse({ latitude: 91, longitude: 0 }),
      ).toThrow();
    });

    it("should validate longitude boundaries", () => {
      expect(() =>
        CoordinatesSchema.parse({ latitude: 0, longitude: -180 }),
      ).not.toThrow();
      expect(() =>
        CoordinatesSchema.parse({ latitude: 0, longitude: 180 }),
      ).not.toThrow();
      expect(() =>
        CoordinatesSchema.parse({ latitude: 0, longitude: -181 }),
      ).toThrow();
      expect(() =>
        CoordinatesSchema.parse({ latitude: 0, longitude: 181 }),
      ).toThrow();
    });
  });

  describe("FarmValidationSchema", () => {
    const validFarmData = {
      name: "Sunny Acres Farm",
      description: "A beautiful organic farm with diverse crops",
      address: "123 Farm Road, Rural County, ST 12345",
      coordinates: { latitude: 40.7128, longitude: -74.006 },
      certifications: ["USDA Organic", "Biodynamic"],
      biodynamicPractices: [
        "COMPOSTING",
        "CROP_ROTATION",
        "LUNAR_PLANTING",
      ] as const,
      sustainabilityScore: 85,
      tags: ["organic", "local", "sustainable"],
    };

    it("should validate complete farm data", () => {
      const result = FarmValidationSchema.parse(validFarmData);
      expect(result.name).toBe(validFarmData.name);
      expect(result.certifications).toEqual(validFarmData.certifications);
    });

    it("should apply default values", () => {
      const minimalData = {
        name: "Simple Farm",
        address: "123 Main St, City, ST 12345",
      };

      const result = FarmValidationSchema.parse(minimalData);
      expect(result.certifications).toEqual([]);
      expect(result.biodynamicPractices).toEqual([]);
      expect(result.tags).toEqual([]);
    });

    it("should validate farm name constraints", () => {
      // Too short
      expect(() =>
        FarmValidationSchema.parse({ ...validFarmData, name: "AB" }),
      ).toThrow(/at least 3 characters/);

      // Too long
      expect(() =>
        FarmValidationSchema.parse({
          ...validFarmData,
          name: "A".repeat(101),
        }),
      ).toThrow(/not exceed 100 characters/);

      // Invalid characters
      expect(() =>
        FarmValidationSchema.parse({ ...validFarmData, name: "Farm@123" }),
      ).toThrow(/invalid characters/);

      // Valid characters
      expect(() =>
        FarmValidationSchema.parse({
          ...validFarmData,
          name: "O'Brien's Farm-123",
        }),
      ).not.toThrow();
    });

    it("should validate description constraints", () => {
      // Too short
      expect(() =>
        FarmValidationSchema.parse({ ...validFarmData, description: "Short" }),
      ).toThrow(/at least 10 characters/);

      // Too long
      expect(() =>
        FarmValidationSchema.parse({
          ...validFarmData,
          description: "A".repeat(1001),
        }),
      ).toThrow(/not exceed 1000 characters/);

      // Valid optional
      expect(() =>
        FarmValidationSchema.parse({
          ...validFarmData,
          description: undefined,
        }),
      ).not.toThrow();
    });

    it("should validate address constraints", () => {
      // Too short
      expect(() =>
        FarmValidationSchema.parse({ ...validFarmData, address: "123 St" }),
      ).toThrow(/at least 10 characters/);

      // Too long
      expect(() =>
        FarmValidationSchema.parse({
          ...validFarmData,
          address: "A".repeat(201),
        }),
      ).toThrow(/not exceed 200 characters/);
    });

    it("should validate biodynamic practices", () => {
      const validPractices = [
        "COMPOSTING",
        "CROP_ROTATION",
        "LUNAR_PLANTING",
        "BIODYNAMIC_PREPARATIONS",
        "COMPANION_PLANTING",
        "NATURAL_PEST_CONTROL",
      ] as const;

      validPractices.forEach((practice) => {
        expect(() =>
          FarmValidationSchema.parse({
            ...validFarmData,
            biodynamicPractices: [practice],
          }),
        ).not.toThrow();
      });

      expect(() =>
        FarmValidationSchema.parse({
          ...validFarmData,
          biodynamicPractices: ["INVALID_PRACTICE"] as any,
        }),
      ).toThrow();
    });

    it("should validate sustainability score range", () => {
      expect(() =>
        FarmValidationSchema.parse({
          ...validFarmData,
          sustainabilityScore: 0,
        }),
      ).not.toThrow();

      expect(() =>
        FarmValidationSchema.parse({
          ...validFarmData,
          sustainabilityScore: 100,
        }),
      ).not.toThrow();

      expect(() =>
        FarmValidationSchema.parse({
          ...validFarmData,
          sustainabilityScore: -1,
        }),
      ).toThrow();

      expect(() =>
        FarmValidationSchema.parse({
          ...validFarmData,
          sustainabilityScore: 101,
        }),
      ).toThrow();
    });

    it("should validate tags limit", () => {
      expect(() =>
        FarmValidationSchema.parse({
          ...validFarmData,
          tags: Array(20).fill("tag"),
        }),
      ).not.toThrow();

      expect(() =>
        FarmValidationSchema.parse({
          ...validFarmData,
          tags: Array(21).fill("tag"),
        }),
      ).toThrow(/Too many tags/);
    });
  });

  describe("ProductValidationSchema", () => {
    const validProductData = {
      name: "Fresh Tomatoes",
      description: "Organic vine-ripened tomatoes",
      price: 4.99,
      unit: "lb" as const,
      category: "vegetables",
      inStock: true,
      quantity: 50,
      organic: true,
      seasonal: true,
      harvestDate: new Date("2024-01-15"),
    };

    it("should validate complete product data", () => {
      const result = ProductValidationSchema.parse(validProductData);
      expect(result.name).toBe(validProductData.name);
      expect(result.price).toBe(validProductData.price);
    });

    it("should apply default values", () => {
      const minimalData = {
        name: "Carrots",
        price: 2.5,
        unit: "lb" as const,
        category: "vegetables",
      };

      const result = ProductValidationSchema.parse(minimalData);
      expect(result.inStock).toBe(true);
      expect(result.organic).toBe(false);
      expect(result.seasonal).toBe(false);
    });

    it("should validate product name constraints", () => {
      expect(() =>
        ProductValidationSchema.parse({ ...validProductData, name: "A" }),
      ).toThrow(/at least 2 characters/);

      expect(() =>
        ProductValidationSchema.parse({
          ...validProductData,
          name: "A".repeat(101),
        }),
      ).toThrow(/too long/);
    });

    it("should validate price constraints", () => {
      expect(() =>
        ProductValidationSchema.parse({ ...validProductData, price: 0 }),
      ).toThrow(/must be positive/);

      expect(() =>
        ProductValidationSchema.parse({ ...validProductData, price: -1 }),
      ).toThrow(/must be positive/);

      expect(() =>
        ProductValidationSchema.parse({ ...validProductData, price: 10001 }),
      ).toThrow(/exceeds maximum/);

      expect(() =>
        ProductValidationSchema.parse({ ...validProductData, price: 9999.99 }),
      ).not.toThrow();
    });

    it("should validate unit types", () => {
      const validUnits = [
        "lb",
        "kg",
        "oz",
        "g",
        "each",
        "bunch",
        "dozen",
        "box",
      ] as const;

      validUnits.forEach((unit) => {
        expect(() =>
          ProductValidationSchema.parse({ ...validProductData, unit }),
        ).not.toThrow();
      });

      expect(() =>
        ProductValidationSchema.parse({
          ...validProductData,
          unit: "invalid" as any,
        }),
      ).toThrow();
    });

    it("should validate quantity constraints", () => {
      expect(() =>
        ProductValidationSchema.parse({ ...validProductData, quantity: 0 }),
      ).not.toThrow();

      expect(() =>
        ProductValidationSchema.parse({ ...validProductData, quantity: -1 }),
      ).toThrow(/cannot be negative/);

      expect(() =>
        ProductValidationSchema.parse({ ...validProductData, quantity: 5.5 }),
      ).toThrow(/must be integer/);

      expect(() =>
        ProductValidationSchema.parse({ ...validProductData, quantity: 100 }),
      ).not.toThrow();
    });

    it("should validate description length", () => {
      expect(() =>
        ProductValidationSchema.parse({
          ...validProductData,
          description: "A".repeat(500),
        }),
      ).not.toThrow();

      expect(() =>
        ProductValidationSchema.parse({
          ...validProductData,
          description: "A".repeat(501),
        }),
      ).toThrow(/too long/);
    });
  });

  describe("FarmSearchSchema", () => {
    const validSearchData = {
      query: "organic farm",
      season: "SPRING" as const,
      biodynamicOnly: true,
      minBiodynamicScore: 75,
      sustainabilityLevel: "ADVANCED" as const,
      withinRadius: {
        latitude: 40.7128,
        longitude: -74.006,
        radiusKm: 50,
      },
      certifications: ["USDA Organic"],
      page: 1,
      limit: 20,
      sortBy: "biodynamicScore" as const,
      sortOrder: "desc" as const,
    };

    it("should validate complete search data", () => {
      const result = FarmSearchSchema.parse(validSearchData);
      expect(result.query).toBe(validSearchData.query);
      expect(result.season).toBe(validSearchData.season);
    });

    it("should apply default values", () => {
      const result = FarmSearchSchema.parse({});
      expect(result.biodynamicOnly).toBe(false);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.sortBy).toBe("createdAt");
      expect(result.sortOrder).toBe("desc");
    });

    it("should validate query length", () => {
      expect(() =>
        FarmSearchSchema.parse({ query: "A".repeat(100) }),
      ).not.toThrow();

      expect(() =>
        FarmSearchSchema.parse({ query: "A".repeat(101) }),
      ).toThrow();
    });

    it("should validate biodynamic score range", () => {
      expect(() =>
        FarmSearchSchema.parse({ minBiodynamicScore: 0 }),
      ).not.toThrow();

      expect(() =>
        FarmSearchSchema.parse({ minBiodynamicScore: 100 }),
      ).not.toThrow();

      expect(() =>
        FarmSearchSchema.parse({ minBiodynamicScore: -1 }),
      ).toThrow();

      expect(() =>
        FarmSearchSchema.parse({ minBiodynamicScore: 101 }),
      ).toThrow();
    });

    it("should validate sustainability levels", () => {
      const levels = ["BASIC", "INTERMEDIATE", "ADVANCED", "DIVINE"] as const;

      levels.forEach((level) => {
        expect(() =>
          FarmSearchSchema.parse({ sustainabilityLevel: level }),
        ).not.toThrow();
      });

      expect(() =>
        FarmSearchSchema.parse({ sustainabilityLevel: "INVALID" as any }),
      ).toThrow();
    });

    it("should validate radius constraints", () => {
      expect(() =>
        FarmSearchSchema.parse({
          withinRadius: { latitude: 0, longitude: 0, radiusKm: 1 },
        }),
      ).not.toThrow();

      expect(() =>
        FarmSearchSchema.parse({
          withinRadius: { latitude: 0, longitude: 0, radiusKm: 500 },
        }),
      ).not.toThrow();

      expect(() =>
        FarmSearchSchema.parse({
          withinRadius: { latitude: 0, longitude: 0, radiusKm: 0 },
        }),
      ).toThrow();

      expect(() =>
        FarmSearchSchema.parse({
          withinRadius: { latitude: 0, longitude: 0, radiusKm: 501 },
        }),
      ).toThrow();
    });

    it("should validate pagination constraints", () => {
      expect(() => FarmSearchSchema.parse({ page: 0 })).toThrow();
      expect(() => FarmSearchSchema.parse({ page: 1 })).not.toThrow();
      expect(() => FarmSearchSchema.parse({ limit: 0 })).toThrow();
      expect(() => FarmSearchSchema.parse({ limit: 1 })).not.toThrow();
      expect(() => FarmSearchSchema.parse({ limit: 100 })).not.toThrow();
      expect(() => FarmSearchSchema.parse({ limit: 101 })).toThrow();
    });

    it("should validate sort options", () => {
      const sortByOptions = [
        "name",
        "biodynamicScore",
        "sustainabilityScore",
        "distance",
        "createdAt",
      ] as const;

      sortByOptions.forEach((sortBy) => {
        expect(() => FarmSearchSchema.parse({ sortBy })).not.toThrow();
      });

      const sortOrders = ["asc", "desc"] as const;
      sortOrders.forEach((sortOrder) => {
        expect(() => FarmSearchSchema.parse({ sortOrder })).not.toThrow();
      });
    });
  });

  describe("Validation Helpers", () => {
    describe("validateSeasonalAlignment", () => {
      it("should validate tomatoes in spring and summer", () => {
        expect(validateSeasonalAlignment("SPRING", "TOMATOES")).toBe(true);
        expect(validateSeasonalAlignment("SUMMER", "TOMATOES")).toBe(true);
        expect(validateSeasonalAlignment("FALL", "TOMATOES")).toBe(false);
        expect(validateSeasonalAlignment("WINTER", "TOMATOES")).toBe(false);
      });

      it("should validate lettuce in spring and fall", () => {
        expect(validateSeasonalAlignment("SPRING", "LETTUCE")).toBe(true);
        expect(validateSeasonalAlignment("FALL", "LETTUCE")).toBe(true);
        expect(validateSeasonalAlignment("SUMMER", "LETTUCE")).toBe(false);
        expect(validateSeasonalAlignment("WINTER", "LETTUCE")).toBe(false);
      });

      it("should validate pumpkins in fall only", () => {
        expect(validateSeasonalAlignment("FALL", "PUMPKINS")).toBe(true);
        expect(validateSeasonalAlignment("SPRING", "PUMPKINS")).toBe(false);
        expect(validateSeasonalAlignment("SUMMER", "PUMPKINS")).toBe(false);
        expect(validateSeasonalAlignment("WINTER", "PUMPKINS")).toBe(false);
      });

      it("should validate citrus in winter only", () => {
        expect(validateSeasonalAlignment("WINTER", "CITRUS")).toBe(true);
        expect(validateSeasonalAlignment("SPRING", "CITRUS")).toBe(false);
        expect(validateSeasonalAlignment("SUMMER", "CITRUS")).toBe(false);
        expect(validateSeasonalAlignment("FALL", "CITRUS")).toBe(false);
      });

      it("should allow any season for unknown crops", () => {
        expect(validateSeasonalAlignment("SPRING", "UNKNOWN_CROP")).toBe(true);
        expect(validateSeasonalAlignment("SUMMER", "CORN")).toBe(true);
      });

      it("should handle case-insensitive crop types", () => {
        expect(validateSeasonalAlignment("SPRING", "tomatoes")).toBe(true);
        expect(validateSeasonalAlignment("FALL", "pumpkins")).toBe(true);
      });
    });

    describe("validateBiodynamicCompliance", () => {
      it("should detect compliant practices", () => {
        const result = validateBiodynamicCompliance([
          "COMPOSTING",
          "CROP_ROTATION",
          "LUNAR_PLANTING",
        ]);

        expect(result.compliant).toBe(true);
        expect(result.missing).toEqual([]);
        expect(result.score).toBe(50); // 3 out of 6 practices
      });

      it("should detect missing required practices", () => {
        const result = validateBiodynamicCompliance(["LUNAR_PLANTING"]);

        expect(result.compliant).toBe(false);
        expect(result.missing).toEqual(["COMPOSTING", "CROP_ROTATION"]);
        expect(result.score).toBeCloseTo(16.67, 1);
      });

      it("should calculate score correctly for all practices", () => {
        const result = validateBiodynamicCompliance([
          "COMPOSTING",
          "CROP_ROTATION",
          "LUNAR_PLANTING",
          "BIODYNAMIC_PREPARATIONS",
          "COMPANION_PLANTING",
          "NATURAL_PEST_CONTROL",
        ]);

        expect(result.compliant).toBe(true);
        expect(result.score).toBe(100);
        expect(result.missing).toEqual([]);
      });

      it("should handle empty practices array", () => {
        const result = validateBiodynamicCompliance([]);

        expect(result.compliant).toBe(false);
        expect(result.missing).toEqual(["COMPOSTING", "CROP_ROTATION"]);
        expect(result.score).toBe(0);
      });

      it("should only count composting when present", () => {
        const result = validateBiodynamicCompliance(["COMPOSTING"]);

        expect(result.compliant).toBe(false);
        expect(result.missing).toEqual(["CROP_ROTATION"]);
        expect(result.score).toBeCloseTo(16.67, 1);
      });

      it("should only count crop rotation when present", () => {
        const result = validateBiodynamicCompliance(["CROP_ROTATION"]);

        expect(result.compliant).toBe(false);
        expect(result.missing).toEqual(["COMPOSTING"]);
        expect(result.score).toBeCloseTo(16.67, 1);
      });
    });

    describe("sanitizeSearchQuery", () => {
      it("should preserve clean queries", () => {
        expect(sanitizeSearchQuery("organic farm")).toBe("organic farm");
        expect(sanitizeSearchQuery("tomatoes")).toBe("tomatoes");
      });

      it("should remove SQL injection attempts", () => {
        expect(sanitizeSearchQuery("'; DROP TABLE users; --")).toBe(
          "TABLE users --",
        );
        expect(sanitizeSearchQuery('"; DELETE FROM farms; --')).toBe(
          "FROM farms --",
        );
      });

      it("should remove SQL keywords", () => {
        expect(sanitizeSearchQuery("DROP TABLE users")).toBe("TABLE users");
        expect(sanitizeSearchQuery("DELETE FROM farms")).toBe("FROM farms");
        expect(sanitizeSearchQuery("INSERT INTO orders")).toBe("INTO orders");
        expect(sanitizeSearchQuery("UPDATE products SET")).toBe("products SET");
        expect(sanitizeSearchQuery("CREATE DATABASE")).toBe("DATABASE");
      });

      it("should handle case-insensitive SQL keywords", () => {
        expect(sanitizeSearchQuery("drop table users")).toBe("table users");
        expect(sanitizeSearchQuery("DrOp TaBlE users")).toBe("TaBlE users");
      });

      it("should remove special characters", () => {
        expect(sanitizeSearchQuery("farm'name")).toBe("farmname");
        expect(sanitizeSearchQuery('farm"name')).toBe("farmname");
        expect(sanitizeSearchQuery("farm\\name")).toBe("farmname");
      });

      it("should trim whitespace", () => {
        expect(sanitizeSearchQuery("  organic farm  ")).toBe("organic farm");
        expect(sanitizeSearchQuery("\n\ttomatoes\n\t")).toBe("tomatoes");
      });

      it("should limit query length to 100 characters", () => {
        const longQuery = "A".repeat(150);
        const sanitized = sanitizeSearchQuery(longQuery);
        expect(sanitized.length).toBe(100);
      });

      it("should handle empty and whitespace-only queries", () => {
        expect(sanitizeSearchQuery("")).toBe("");
        expect(sanitizeSearchQuery("   ")).toBe("");
        expect(sanitizeSearchQuery("\n\t")).toBe("");
      });

      it("should handle combined injection attempts", () => {
        expect(
          sanitizeSearchQuery("'; DROP TABLE users; DELETE FROM farms; --"),
        ).toBe("TABLE users  FROM farms --");
      });
    });
  });
});
