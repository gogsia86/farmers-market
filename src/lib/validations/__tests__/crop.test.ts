/**
 * ⚡ CROP VALIDATION TEST SUITE
 * Comprehensive tests for crop validation schemas with divine consciousness
 * Target: 100% coverage
 */

import { describe, it, expect } from "@jest/globals";
import {
  seasonSchema,
  growthPhaseSchema,
  cropTypeSchema,
  createCropSchema,
  updateCropSchema,
  seasonalCycleSchema,
  cropQuerySchema,
} from "../crop";

describe("⚡ Crop Validation Schemas - Divine Test Suite", () => {
  describe("Season Schema", () => {
    it("accepts all valid seasons", () => {
      const validSeasons = ["SPRING", "SUMMER", "FALL", "WINTER"];

      validSeasons.forEach((season) => {
        const result = seasonSchema.safeParse(season);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(season);
        }
      });
    });

    it("rejects invalid season values", () => {
      const invalidSeasons = [
        "AUTUMN",
        "spring",
        "Summer",
        "",
        null,
        undefined,
        123,
      ];

      invalidSeasons.forEach((season) => {
        const result = seasonSchema.safeParse(season);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Growth Phase Schema", () => {
    it("accepts all valid growth phases", () => {
      const validPhases = [
        "SEED",
        "GERMINATION",
        "VEGETATIVE",
        "FLOWERING",
        "FRUITING",
        "HARVEST",
        "DORMANT",
      ];

      validPhases.forEach((phase) => {
        const result = growthPhaseSchema.safeParse(phase);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(phase);
        }
      });
    });

    it("rejects invalid growth phase values", () => {
      const invalidPhases = [
        "INVALID",
        "seed",
        "Germination",
        "",
        null,
        undefined,
        456,
      ];

      invalidPhases.forEach((phase) => {
        const result = growthPhaseSchema.safeParse(phase);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Crop Type Schema", () => {
    it("accepts all valid crop types", () => {
      const validTypes = [
        "VEGETABLE",
        "FRUIT",
        "GRAIN",
        "LEGUME",
        "HERB",
        "ROOT",
        "LEAF",
        "FLOWER",
      ];

      validTypes.forEach((type) => {
        const result = cropTypeSchema.safeParse(type);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(type);
        }
      });
    });

    it("rejects invalid crop type values", () => {
      const invalidTypes = [
        "INVALID",
        "vegetable",
        "Fruit",
        "",
        null,
        undefined,
        789,
      ];

      invalidTypes.forEach((type) => {
        const result = cropTypeSchema.safeParse(type);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Create Crop Schema", () => {
    const validCrop = {
      name: "Organic Tomatoes",
      type: "VEGETABLE" as const,
      farmId: "clxyz123abc456",
      plantingDate: new Date("2024-04-15"),
      expectedHarvestDate: new Date("2024-07-30"),
      season: "SUMMER" as const,
    };

    it("accepts valid complete crop data with required fields", () => {
      const result = createCropSchema.safeParse(validCrop);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Organic Tomatoes");
        expect(result.data.type).toBe("VEGETABLE");
        expect(result.data.growthPhase).toBe("SEED");
      }
    });

    it("defaults growthPhase to SEED", () => {
      const result = createCropSchema.safeParse(validCrop);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.growthPhase).toBe("SEED");
      }
    });

    it("accepts valid crop with scientific name", () => {
      const crop = {
        ...validCrop,
        scientificName: "Solanum lycopersicum",
      };

      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.scientificName).toBe("Solanum lycopersicum");
      }
    });

    it("accepts valid crop with description", () => {
      const crop = {
        ...validCrop,
        description:
          "Heritage tomatoes grown using biodynamic farming practices",
      };

      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe(
          "Heritage tomatoes grown using biodynamic farming practices",
        );
      }
    });

    it("accepts valid crop with custom growth phase", () => {
      const crop = {
        ...validCrop,
        growthPhase: "FLOWERING" as const,
      };

      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.growthPhase).toBe("FLOWERING");
      }
    });

    it("accepts valid crop with complete requirements", () => {
      const crop = {
        ...validCrop,
        requirements: {
          sunlight: "FULL_SUN" as const,
          waterFrequency: "DAILY" as const,
          soilType: "LOAM" as const,
          temperature: {
            min: 60,
            max: 85,
            optimal: 75,
          },
        },
      };

      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.requirements?.sunlight).toBe("FULL_SUN");
        expect(result.data.requirements?.waterFrequency).toBe("DAILY");
        expect(result.data.requirements?.soilType).toBe("LOAM");
        expect(result.data.requirements?.temperature?.optimal).toBe(75);
      }
    });

    it("accepts valid sunlight requirements", () => {
      const sunlightValues = ["FULL_SUN", "PARTIAL_SHADE", "FULL_SHADE"];

      sunlightValues.forEach((sunlight) => {
        const crop = {
          ...validCrop,
          requirements: { sunlight },
        };
        const result = createCropSchema.safeParse(crop);
        expect(result.success).toBe(true);
      });
    });

    it("accepts valid water frequency requirements", () => {
      const waterFrequencies = [
        "DAILY",
        "EVERY_OTHER_DAY",
        "WEEKLY",
        "BI_WEEKLY",
      ];

      waterFrequencies.forEach((waterFrequency) => {
        const crop = {
          ...validCrop,
          requirements: { waterFrequency },
        };
        const result = createCropSchema.safeParse(crop);
        expect(result.success).toBe(true);
      });
    });

    it("accepts valid soil type requirements", () => {
      const soilTypes = ["SANDY", "CLAY", "LOAM", "SILT", "PEAT"];

      soilTypes.forEach((soilType) => {
        const crop = {
          ...validCrop,
          requirements: { soilType },
        };
        const result = createCropSchema.safeParse(crop);
        expect(result.success).toBe(true);
      });
    });

    it("accepts valid crop with metadata", () => {
      const crop = {
        ...validCrop,
        metadata: {
          fieldNumber: 7,
          bedNumber: 3,
          variety: "Cherokee Purple",
          source: "Local seed company",
        },
      };

      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata).toBeDefined();
      }
    });

    it("coerces planting date string to Date", () => {
      const crop = {
        ...validCrop,
        plantingDate: "2024-04-15",
      };

      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plantingDate).toBeInstanceOf(Date);
      }
    });

    it("coerces expected harvest date string to Date", () => {
      const crop = {
        ...validCrop,
        expectedHarvestDate: "2024-07-30",
      };

      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.expectedHarvestDate).toBeInstanceOf(Date);
      }
    });

    it("rejects crop name too short", () => {
      const crop = { ...validCrop, name: "T" };
      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(false);
    });

    it("rejects crop name too long", () => {
      const crop = { ...validCrop, name: "x".repeat(101) };
      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(false);
    });

    it("rejects description exceeding max length", () => {
      const crop = { ...validCrop, description: "x".repeat(1001) };
      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(false);
    });

    it("rejects invalid farmId format", () => {
      const crop = { ...validCrop, farmId: "invalid-id" };
      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(false);
    });

    it("rejects invalid crop type", () => {
      const crop = { ...validCrop, type: "INVALID" };
      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(false);
    });

    it("rejects invalid season", () => {
      const crop = { ...validCrop, season: "AUTUMN" };
      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(false);
    });

    it("rejects invalid growth phase", () => {
      const crop = { ...validCrop, growthPhase: "INVALID" };
      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(false);
    });

    it("rejects invalid sunlight requirement", () => {
      const crop = {
        ...validCrop,
        requirements: { sunlight: "INVALID" },
      };
      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(false);
    });

    it("rejects invalid water frequency requirement", () => {
      const crop = {
        ...validCrop,
        requirements: { waterFrequency: "INVALID" },
      };
      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(false);
    });

    it("rejects invalid soil type requirement", () => {
      const crop = {
        ...validCrop,
        requirements: { soilType: "INVALID" },
      };
      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(false);
    });

    it("rejects missing required fields", () => {
      const crop = { name: "Test Crop" };
      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(false);
    });

    it("accepts crop with partial temperature requirements", () => {
      const crop = {
        ...validCrop,
        requirements: {
          temperature: {
            min: 50,
          },
        },
      };

      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(true);
    });

    it("accepts crop with all season types", () => {
      const seasons = ["SPRING", "SUMMER", "FALL", "WINTER"];

      seasons.forEach((season) => {
        const crop = { ...validCrop, season };
        const result = createCropSchema.safeParse(crop);
        expect(result.success).toBe(true);
      });
    });

    it("accepts crop with all crop types", () => {
      const types = [
        "VEGETABLE",
        "FRUIT",
        "GRAIN",
        "LEGUME",
        "HERB",
        "ROOT",
        "LEAF",
        "FLOWER",
      ];

      types.forEach((type) => {
        const crop = { ...validCrop, type };
        const result = createCropSchema.safeParse(crop);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Update Crop Schema", () => {
    it("accepts valid partial update with id", () => {
      const update = {
        id: "clxyz123abc456",
        name: "Updated Crop Name",
      };

      const result = updateCropSchema.safeParse(update);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Updated Crop Name");
      }
    });

    it("accepts valid update with multiple fields", () => {
      const update = {
        id: "clxyz123abc456",
        name: "Updated Tomatoes",
        growthPhase: "FLOWERING" as const,
        description: "Updated description",
      };

      const result = updateCropSchema.safeParse(update);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.growthPhase).toBe("FLOWERING");
      }
    });

    it("accepts update with only id", () => {
      const update = { id: "clxyz123abc456" };
      const result = updateCropSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("accepts update with requirements", () => {
      const update = {
        id: "clxyz123abc456",
        requirements: {
          sunlight: "PARTIAL_SHADE" as const,
          waterFrequency: "WEEKLY" as const,
        },
      };

      const result = updateCropSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("accepts update with metadata", () => {
      const update = {
        id: "clxyz123abc456",
        metadata: {
          notes: "Updated notes",
          yieldEstimate: 250,
        },
      };

      const result = updateCropSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("coerces date strings when updating", () => {
      const update = {
        id: "clxyz123abc456",
        plantingDate: "2024-05-01",
        expectedHarvestDate: "2024-08-15",
      };

      const result = updateCropSchema.safeParse(update);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plantingDate).toBeInstanceOf(Date);
        expect(result.data.expectedHarvestDate).toBeInstanceOf(Date);
      }
    });

    it("rejects update without id", () => {
      const update = { name: "Updated Name" };
      const result = updateCropSchema.safeParse(update);
      expect(result.success).toBe(false);
    });

    it("rejects update with invalid id format", () => {
      const update = { id: "invalid", name: "Test" };
      const result = updateCropSchema.safeParse(update);
      expect(result.success).toBe(false);
    });

    it("validates fields when provided", () => {
      const update = {
        id: "clxyz123abc456",
        name: "T", // Too short
      };
      const result = updateCropSchema.safeParse(update);
      expect(result.success).toBe(false);
    });

    it("validates growth phase when provided", () => {
      const update = {
        id: "clxyz123abc456",
        growthPhase: "INVALID",
      };
      const result = updateCropSchema.safeParse(update);
      expect(result.success).toBe(false);
    });

    it("validates season when provided", () => {
      const update = {
        id: "clxyz123abc456",
        season: "INVALID",
      };
      const result = updateCropSchema.safeParse(update);
      expect(result.success).toBe(false);
    });
  });

  describe("Seasonal Cycle Schema", () => {
    const validCycle = {
      cropId: "clxyz123abc456",
      season: "SUMMER" as const,
      plantingWindow: {
        start: new Date("2024-05-01"),
        end: new Date("2024-06-15"),
      },
      harvestWindow: {
        start: new Date("2024-08-01"),
        end: new Date("2024-09-30"),
      },
    };

    it("accepts valid seasonal cycle with required fields", () => {
      const result = seasonalCycleSchema.safeParse(validCycle);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.cropId).toBe("clxyz123abc456");
        expect(result.data.season).toBe("SUMMER");
      }
    });

    it("accepts valid seasonal cycle with expected yield", () => {
      const cycle = {
        ...validCycle,
        expectedYield: 500.5,
      };

      const result = seasonalCycleSchema.safeParse(cycle);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.expectedYield).toBe(500.5);
      }
    });

    it("accepts valid seasonal cycle with notes", () => {
      const cycle = {
        ...validCycle,
        notes: "Plant after last frost, harvest before first frost",
      };

      const result = seasonalCycleSchema.safeParse(cycle);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.notes).toBe(
          "Plant after last frost, harvest before first frost",
        );
      }
    });

    it("coerces planting window date strings to Dates", () => {
      const cycle = {
        ...validCycle,
        plantingWindow: {
          start: "2024-05-01",
          end: "2024-06-15",
        },
      };

      const result = seasonalCycleSchema.safeParse(cycle);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plantingWindow.start).toBeInstanceOf(Date);
        expect(result.data.plantingWindow.end).toBeInstanceOf(Date);
      }
    });

    it("coerces harvest window date strings to Dates", () => {
      const cycle = {
        ...validCycle,
        harvestWindow: {
          start: "2024-08-01",
          end: "2024-09-30",
        },
      };

      const result = seasonalCycleSchema.safeParse(cycle);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.harvestWindow.start).toBeInstanceOf(Date);
        expect(result.data.harvestWindow.end).toBeInstanceOf(Date);
      }
    });

    it("accepts all valid seasons", () => {
      const seasons = ["SPRING", "SUMMER", "FALL", "WINTER"];

      seasons.forEach((season) => {
        const cycle = { ...validCycle, season };
        const result = seasonalCycleSchema.safeParse(cycle);
        expect(result.success).toBe(true);
      });
    });

    it("rejects invalid cropId format", () => {
      const cycle = { ...validCycle, cropId: "invalid" };
      const result = seasonalCycleSchema.safeParse(cycle);
      expect(result.success).toBe(false);
    });

    it("rejects invalid season", () => {
      const cycle = { ...validCycle, season: "INVALID" };
      const result = seasonalCycleSchema.safeParse(cycle);
      expect(result.success).toBe(false);
    });

    it("rejects zero expected yield", () => {
      const cycle = { ...validCycle, expectedYield: 0 };
      const result = seasonalCycleSchema.safeParse(cycle);
      expect(result.success).toBe(false);
    });

    it("rejects negative expected yield", () => {
      const cycle = { ...validCycle, expectedYield: -100 };
      const result = seasonalCycleSchema.safeParse(cycle);
      expect(result.success).toBe(false);
    });

    it("rejects notes exceeding max length", () => {
      const cycle = { ...validCycle, notes: "x".repeat(501) };
      const result = seasonalCycleSchema.safeParse(cycle);
      expect(result.success).toBe(false);
    });

    it("rejects missing planting window", () => {
      const cycle = {
        cropId: "clxyz123abc456",
        season: "SUMMER",
        harvestWindow: {
          start: new Date("2024-08-01"),
          end: new Date("2024-09-30"),
        },
      };
      const result = seasonalCycleSchema.safeParse(cycle);
      expect(result.success).toBe(false);
    });

    it("rejects missing harvest window", () => {
      const cycle = {
        cropId: "clxyz123abc456",
        season: "SUMMER",
        plantingWindow: {
          start: new Date("2024-05-01"),
          end: new Date("2024-06-15"),
        },
      };
      const result = seasonalCycleSchema.safeParse(cycle);
      expect(result.success).toBe(false);
    });
  });

  describe("Crop Query Schema", () => {
    it("accepts query with defaults", () => {
      const query = {};

      const result = cropQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
        expect(result.data.offset).toBe(0);
      }
    });

    it("accepts query with all filters", () => {
      const query = {
        farmId: "clxyz123abc456",
        season: "SUMMER" as const,
        type: "VEGETABLE" as const,
        growthPhase: "FLOWERING" as const,
        limit: 50,
        offset: 100,
      };

      const result = cropQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.farmId).toBe("clxyz123abc456");
        expect(result.data.season).toBe("SUMMER");
        expect(result.data.type).toBe("VEGETABLE");
        expect(result.data.growthPhase).toBe("FLOWERING");
        expect(result.data.limit).toBe(50);
        expect(result.data.offset).toBe(100);
      }
    });

    it("accepts valid farmId filter", () => {
      const query = { farmId: "clxyz123abc456" };
      const result = cropQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
    });

    it("accepts valid season filter", () => {
      const seasons = ["SPRING", "SUMMER", "FALL", "WINTER"];

      seasons.forEach((season) => {
        const result = cropQuerySchema.safeParse({ season });
        expect(result.success).toBe(true);
      });
    });

    it("accepts valid crop type filter", () => {
      const types = [
        "VEGETABLE",
        "FRUIT",
        "GRAIN",
        "LEGUME",
        "HERB",
        "ROOT",
        "LEAF",
        "FLOWER",
      ];

      types.forEach((type) => {
        const result = cropQuerySchema.safeParse({ type });
        expect(result.success).toBe(true);
      });
    });

    it("accepts valid growth phase filter", () => {
      const phases = [
        "SEED",
        "GERMINATION",
        "VEGETATIVE",
        "FLOWERING",
        "FRUITING",
        "HARVEST",
        "DORMANT",
      ];

      phases.forEach((growthPhase) => {
        const result = cropQuerySchema.safeParse({ growthPhase });
        expect(result.success).toBe(true);
      });
    });

    it("rejects invalid farmId format", () => {
      const query = { farmId: "invalid" };
      const result = cropQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("rejects invalid season", () => {
      const query = { season: "INVALID" };
      const result = cropQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("rejects invalid type", () => {
      const query = { type: "INVALID" };
      const result = cropQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("rejects invalid growth phase", () => {
      const query = { growthPhase: "INVALID" };
      const result = cropQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("rejects limit exceeding max value", () => {
      const query = { limit: 101 };
      const result = cropQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("rejects non-positive limit", () => {
      const query = { limit: 0 };
      const result = cropQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("rejects negative offset", () => {
      const query = { offset: -1 };
      const result = cropQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("accepts maximum valid limit", () => {
      const query = { limit: 100 };
      const result = cropQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
    });

    it("accepts zero offset", () => {
      const query = { offset: 0 };
      const result = cropQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
    });

    it("accepts large offset value", () => {
      const query = { offset: 1000 };
      const result = cropQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
    });
  });

  describe("Type Inference and Integration", () => {
    it("infers correct types from schemas", () => {
      const crop = {
        name: "Cherry Tomatoes",
        type: "VEGETABLE" as const,
        farmId: "clxyz123abc456",
        plantingDate: new Date("2024-04-01"),
        expectedHarvestDate: new Date("2024-07-15"),
        season: "SUMMER" as const,
      };

      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(true);

      if (result.success) {
        // Type assertions to verify inference
        const data = result.data;
        expect(typeof data.name).toBe("string");
        expect(typeof data.type).toBe("string");
        expect(typeof data.farmId).toBe("string");
        expect(data.plantingDate).toBeInstanceOf(Date);
        expect(data.expectedHarvestDate).toBeInstanceOf(Date);
      }
    });

    it("validates complex nested structures", () => {
      const crop = {
        name: "Heirloom Tomatoes",
        scientificName: "Solanum lycopersicum",
        type: "VEGETABLE" as const,
        description: "Cherokee Purple variety, biodynamically grown",
        farmId: "clxyz123abc456",
        plantingDate: new Date("2024-04-15"),
        expectedHarvestDate: new Date("2024-07-30"),
        growthPhase: "VEGETATIVE" as const,
        season: "SUMMER" as const,
        requirements: {
          sunlight: "FULL_SUN" as const,
          waterFrequency: "DAILY" as const,
          soilType: "LOAM" as const,
          temperature: {
            min: 60,
            max: 90,
            optimal: 75,
          },
        },
        metadata: {
          variety: "Cherokee Purple",
          source: "Seed Savers Exchange",
          fieldNumber: 3,
          bedNumber: 12,
        },
      };

      const result = createCropSchema.safeParse(crop);
      expect(result.success).toBe(true);
    });

    it("handles all growth phases in lifecycle", () => {
      const phases = [
        "SEED",
        "GERMINATION",
        "VEGETATIVE",
        "FLOWERING",
        "FRUITING",
        "HARVEST",
        "DORMANT",
      ];

      const baseCrop = {
        name: "Test Crop",
        type: "VEGETABLE" as const,
        farmId: "clxyz123abc456",
        plantingDate: new Date("2024-04-01"),
        expectedHarvestDate: new Date("2024-07-01"),
        season: "SUMMER" as const,
      };

      phases.forEach((growthPhase) => {
        const crop = { ...baseCrop, growthPhase };
        const result = createCropSchema.safeParse(crop);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Agricultural Consciousness Integration", () => {
    it("validates biodynamic crop planning", () => {
      const biodynamicCrop = {
        name: "Biodynamic Carrots",
        type: "ROOT" as const,
        farmId: "clxyz123abc456",
        plantingDate: new Date("2024-03-15"),
        expectedHarvestDate: new Date("2024-06-15"),
        season: "SPRING" as const,
        requirements: {
          sunlight: "FULL_SUN" as const,
          waterFrequency: "WEEKLY" as const,
          soilType: "LOAM" as const,
        },
        metadata: {
          biodynamicPreparation: "500 - Horn Manure",
          lunarPhase: "Root Day",
          companionPlants: ["onions", "radishes"],
        },
      };

      const result = createCropSchema.safeParse(biodynamicCrop);
      expect(result.success).toBe(true);
    });

    it("validates seasonal alignment", () => {
      const seasonalCrops = [
        { season: "SPRING", name: "Spring Lettuce", type: "LEAF" },
        { season: "SUMMER", name: "Summer Tomatoes", type: "VEGETABLE" },
        { season: "FALL", name: "Fall Squash", type: "VEGETABLE" },
        { season: "WINTER", name: "Winter Kale", type: "LEAF" },
      ];

      seasonalCrops.forEach((crop) => {
        const fullCrop = {
          ...crop,
          farmId: "clxyz123abc456",
          plantingDate: new Date("2024-04-01"),
          expectedHarvestDate: new Date("2024-07-01"),
        };
        const result = createCropSchema.safeParse(fullCrop);
        expect(result.success).toBe(true);
      });
    });
  });
});
