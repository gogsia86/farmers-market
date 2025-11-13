/**
 * 🧬 DIVINE TEST SUITE: Farm Service
 * 📚 Reference: 05_TESTING_SECURITY_DIVINITY.instructions.md
 * 🌾 Domain: Agricultural Service Layer
 *
 * Tests for complete CRUD operations with caching integration
 */

import { AgriculturalCache } from "@/lib/cache/agricultural-cache";
import { database } from "@/lib/database";
import type {
  FarmStatus,
  FarmingPractice,
  ProductCategory,
} from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createFarmService,
  deleteFarmService,
  getFarmById,
  getFarmBySlug,
  listFarmsService,
  searchFarmsService,
  updateFarmService,
} from "../farm.service";

// Mock the database
vi.mock("@/lib/database", () => ({
  database: {
    farm: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock the cache - must match the exact import path in farm.service.ts
vi.mock("@/lib/cache/agricultural-cache", () => ({
  AgriculturalCache: {
    getFarm: vi.fn(),
    cacheFarm: vi.fn(),
    invalidateFarm: vi.fn(),
    getProduct: vi.fn(),
    cacheProduct: vi.fn(),
    invalidateProduct: vi.fn(),
  },
}));

describe("Farm Service - CRUD Operations", () => {
  const mockUserId = "user-123";
  const mockFarmId = "farm-456";
  const mockSlug = "test-organic-farm";

  const mockUser = {
    id: mockUserId,
    email: "farmer@example.com",
    name: "Test Farmer",
    role: "FARMER" as const,
  };

  const mockFarm = {
    id: mockFarmId,
    slug: mockSlug,
    name: "Test Organic Farm",
    description: "A beautiful organic farm",
    story: "Our farming journey",
    ownerId: mockUserId,
    status: "ACTIVE" as FarmStatus,
    isVerified: false,
    address: "123 Farm Road",
    city: "Farmville",
    state: "CA",
    zipCode: "12345",
    country: "USA",
    latitude: 37.7749,
    longitude: -122.4194,
    phone: "555-0100",
    email: "contact@farm.com",
    website: "https://farm.com",
    farmingPractices: ["ORGANIC", "SUSTAINABLE"] as FarmingPractice[],
    productCategories: ["VEGETABLES", "FRUITS"] as ProductCategory[],
    totalArea: 50.5,
    totalAreaUnit: "ACRES" as const,
    certifications: ["USDA Organic"],
    establishedYear: 2010,
    deliveryRadius: 25,
    deliveryRadiusUnit: "MILES" as const,
    minimumOrder: 25,
    acceptsOnlineOrders: true,
    allowsPickup: true,
    allowsDelivery: true,
    operatingHours: { monday: "9am-5pm" },
    socialMedia: { facebook: "testfarm" },
    teamMembers: ["John", "Jane"],
    coverImage: "cover.jpg",
    logoImage: "logo.jpg",
    images: ["img1.jpg", "img2.jpg"],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementations
    vi.mocked(AgriculturalCache.getFarm).mockResolvedValue(null);
    vi.mocked(AgriculturalCache.cacheFarm).mockResolvedValue(undefined);
    vi.mocked(AgriculturalCache.invalidateFarm).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createFarmService", () => {
    const createInput = {
      name: "New Test Farm",
      description: "A new test farm",
      address: "456 Farm Lane",
      city: "Testville",
      state: "NY",
      zipCode: "54321",
      country: "USA",
      farmingPractices: ["ORGANIC"] as FarmingPractice[],
      productCategories: ["VEGETABLES"] as ProductCategory[],
    };

    it("should create a farm successfully", async () => {
      vi.mocked(database.farm.create).mockResolvedValue(mockFarm as any);

      const result = await createFarmService({
        userId: mockUserId,
        farmData: createInput as any,
      });

      expect(result).toBeDefined();
      expect(result.farm.identity.name).toBe(mockFarm.name);
      expect(result.slug).toBeDefined();
      expect(database.farm.create).toHaveBeenCalled();
    });

    it("should throw error if user not found", async () => {
      // Note: The service doesn't validate user existence - it relies on DB foreign key constraint
      // This test documents that behavior
      vi.mocked(database.farm.create).mockRejectedValue(
        new Error("Foreign key constraint failed")
      );

      await expect(
        createFarmService({
          userId: "invalid-user",
          farmData: createInput as any,
        })
      ).rejects.toThrow();
    });

    it("should generate unique slug from farm name", async () => {
      vi.mocked(database.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(database.farm.create).mockResolvedValue(mockFarm as any);

      await createFarmService({
        userId: mockUserId,
        farmData: createInput as any,
      });

      const createCall = vi.mocked(database.farm.create).mock.calls[0][0];
      expect(createCall.data.slug).toBeDefined();
      expect(typeof createCall.data.slug).toBe("string");
    });
  });

  describe("getFarmById", () => {
    it("should return farm from cache if available", async () => {
      vi.mocked(AgriculturalCache.getFarm).mockResolvedValue(mockFarm);

      const result = await getFarmById(mockFarmId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(mockFarmId);
      expect(vi.mocked(AgriculturalCache.getFarm)).toHaveBeenCalledWith(
        mockFarmId
      );
      expect(database.farm.findUnique).not.toHaveBeenCalled();
    });

    it("should fetch from database if not in cache", async () => {
      vi.mocked(AgriculturalCache.getFarm).mockResolvedValue(null);
      vi.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      const result = await getFarmById(mockFarmId);

      expect(result).toBeDefined();
      expect(database.farm.findUnique).toHaveBeenCalledWith({
        where: { id: mockFarmId },
        include: expect.any(Object),
      });
      expect(vi.mocked(AgriculturalCache.cacheFarm)).toHaveBeenCalled();
    });

    it("should return null for non-existent farm", async () => {
      vi.mocked(AgriculturalCache.getFarm).mockResolvedValue(null);
      vi.mocked(database.farm.findUnique).mockResolvedValue(null);

      const result = await getFarmById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("getFarmBySlug", () => {
    it("should return farm by slug from cache", async () => {
      vi.mocked(AgriculturalCache.getFarm).mockResolvedValue(mockFarm);

      const result = await getFarmBySlug(mockSlug);

      expect(result).toBeDefined();
      expect(result?.slug).toBe(mockSlug);
      expect(vi.mocked(AgriculturalCache.getFarm)).toHaveBeenCalled();
    });

    it("should fetch from database by slug if not cached", async () => {
      vi.mocked(AgriculturalCache.getFarm).mockResolvedValue(null);
      vi.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      const result = await getFarmBySlug(mockSlug);

      expect(result).toBeDefined();
      expect(database.farm.findUnique).toHaveBeenCalledWith({
        where: { slug: mockSlug },
        include: expect.any(Object),
      });
      expect(vi.mocked(AgriculturalCache.cacheFarm)).toHaveBeenCalled();
    });
  });

  describe("updateFarmService", () => {
    const updateData = {
      name: "Updated Farm Name",
      description: "Updated description",
      phone: "555-0200",
    };

    it("should update farm with valid ownership", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      vi.mocked(database.farm.update).mockResolvedValue({
        ...mockFarm,
        ...updateData,
      } as any);

      const result = await updateFarmService({
        farmId: mockFarmId,
        userId: mockUserId,
        updateData,
      });

      expect(result).toBeDefined();
      expect(result.identity.name).toBe(updateData.name);
      expect(database.farm.update).toHaveBeenCalled();
    });

    it("should throw error if farm not found", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue(null);

      await expect(
        updateFarmService({
          farmId: "non-existent",
          userId: mockUserId,
          updateData,
        })
      ).rejects.toThrow("Farm not found");
    });

    it("should throw error if user is not owner", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      await expect(
        updateFarmService({
          farmId: mockFarmId,
          userId: "different-user-id",
          updateData,
        })
      ).rejects.toThrow("Unauthorized: You don't own this farm");
    });

    it("should handle partial updates", async () => {
      const partialUpdate = { phone: "555-0300" };
      vi.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      vi.mocked(database.farm.update).mockResolvedValue({
        ...mockFarm,
        ...partialUpdate,
      } as any);

      const result = await updateFarmService({
        farmId: mockFarmId,
        userId: mockUserId,
        updateData: partialUpdate,
      });

      expect(result.contact.phone).toBe(partialUpdate.phone);
    });

    it("should invalidate cache after update", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      vi.mocked(database.farm.update).mockResolvedValue({
        ...mockFarm,
        ...updateData,
      } as any);

      await updateFarmService({
        farmId: mockFarmId,
        userId: mockUserId,
        updateData,
      });

      expect(vi.mocked(AgriculturalCache.invalidateFarm)).toHaveBeenCalledWith(
        mockFarmId
      );
    });
  });

  describe("deleteFarmService", () => {
    it("should soft delete farm (set status to INACTIVE)", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue({
        ownerId: mockUserId,
      } as any);
      vi.mocked(database.farm.update).mockResolvedValue({
        ...mockFarm,
        status: "INACTIVE" as FarmStatus,
      } as any);

      await deleteFarmService({ farmId: mockFarmId, userId: mockUserId });

      expect(database.farm.update).toHaveBeenCalledWith({
        where: { id: mockFarmId },
        data: { status: "INACTIVE" },
      });
    });

    it("should throw error if farm not found", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue(null);

      await expect(
        deleteFarmService({ farmId: "non-existent", userId: mockUserId })
      ).rejects.toThrow("Farm not found");
    });

    it("should throw error if user is not owner", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);

      await expect(
        deleteFarmService({ farmId: mockFarmId, userId: "different-user-id" })
      ).rejects.toThrow("Unauthorized: You don't own this farm");
    });

    it("should invalidate cache after deletion", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      vi.mocked(database.farm.update).mockResolvedValue({
        ...mockFarm,
        status: "INACTIVE" as FarmStatus,
      } as any);

      await deleteFarmService({ farmId: mockFarmId, userId: mockUserId });

      expect(vi.mocked(AgriculturalCache.invalidateFarm)).toHaveBeenCalledWith(
        mockFarmId
      );
    });
  });

  describe("listFarmsService", () => {
    const mockFarms = [mockFarm, { ...mockFarm, id: "farm-789" }];

    it("should return paginated farms with default options", async () => {
      vi.mocked(database.farm.findMany).mockResolvedValue(mockFarms as any);
      vi.mocked(database.farm.count).mockResolvedValue(2);

      const result = await listFarmsService({});

      expect(result.farms).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(database.farm.findMany).toHaveBeenCalled();
    });

    it("should filter by status", async () => {
      vi.mocked(database.farm.findMany).mockResolvedValue([mockFarm] as any);
      vi.mocked(database.farm.count).mockResolvedValue(1);

      const result = await listFarmsService({ status: "ACTIVE" });

      expect(database.farm.findMany).toHaveBeenCalled();
      expect(result.farms).toHaveLength(1);
      const call = vi.mocked(database.farm.findMany).mock.calls[0][0];
      expect(call.where.status).toBe("ACTIVE");
    });

    it("should filter by state", async () => {
      vi.mocked(database.farm.findMany).mockResolvedValue([mockFarm] as any);
      vi.mocked(database.farm.count).mockResolvedValue(1);

      const result = await listFarmsService({ state: "CA" });

      expect(database.farm.findMany).toHaveBeenCalled();
      expect(result.farms).toHaveLength(1);
      const call = vi.mocked(database.farm.findMany).mock.calls[0][0];
      expect(call.where.state).toBe("CA");
    });

    it("should handle pagination correctly", async () => {
      vi.mocked(database.farm.findMany).mockResolvedValue(mockFarms as any);
      vi.mocked(database.farm.count).mockResolvedValue(20);

      const result = await listFarmsService({ page: 2, limit: 10 });

      expect(result.page).toBe(2);
      expect(result.total).toBe(20);
      expect(result.totalPages).toBe(2);
      expect(result.farms).toBeDefined();
      expect(database.farm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 10, // page 2, skip first 10
        })
      );
    });

    it("should filter by farming practices", async () => {
      vi.mocked(database.farm.findMany).mockResolvedValue([mockFarm] as any);
      vi.mocked(database.farm.count).mockResolvedValue(1);

      const result = await listFarmsService({ farmingPractices: ["ORGANIC"] });

      expect(database.farm.findMany).toHaveBeenCalled();
      expect(result.farms).toHaveLength(1);
      const call = vi.mocked(database.farm.findMany).mock.calls[0][0];
      expect(call.where.farmingPractices).toEqual({ hasSome: ["ORGANIC"] });
    });
  });

  describe("searchFarmsService", () => {
    const mockFarms = [mockFarm];

    it("should search farms by text query", async () => {
      vi.mocked(database.farm.findMany).mockResolvedValue(mockFarms as any);

      const result = await searchFarmsService({ query: "organic" });

      expect(result).toHaveLength(1);
      expect(database.farm.findMany).toHaveBeenCalled();
      const call = vi.mocked(database.farm.findMany).mock.calls[0][0];
      expect(call.where?.status).toBe("ACTIVE");
      expect(call.where?.OR).toBeDefined();
    });

    it("should search with case-insensitive matching", async () => {
      vi.mocked(database.farm.findMany).mockResolvedValue(mockFarms as any);

      const result = await searchFarmsService({ query: "ORGANIC" });

      expect(result).toBeDefined();
      expect(database.farm.findMany).toHaveBeenCalled();
      const call = vi.mocked(database.farm.findMany).mock.calls[0][0];
      expect(call.where?.OR[0]?.name?.mode).toBe("insensitive");
    });

    it("should search across multiple fields", async () => {
      vi.mocked(database.farm.findMany).mockResolvedValue(mockFarms as any);

      await searchFarmsService({ query: "farm" });

      const call = vi.mocked(database.farm.findMany).mock.calls[0][0];
      expect(call.where?.OR).toBeDefined();
      expect(Array.isArray(call.where?.OR)).toBe(true);
      expect((call.where?.OR as any[]).length).toBeGreaterThan(2); // name, description, city, state, etc.
    });

    it("should limit results to 10 by default", async () => {
      vi.mocked(database.farm.findMany).mockResolvedValue(mockFarms as any);

      await searchFarmsService({ query: "test" });

      const call = vi.mocked(database.farm.findMany).mock.calls[0][0];
      expect(call.take).toBe(10);
    });

    it("should return empty array for no matches", async () => {
      vi.mocked(database.farm.findMany).mockResolvedValue([]);

      const result = await searchFarmsService({ query: "nonexistent123" });

      expect(result).toEqual([]);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle database errors gracefully in getFarmById", async () => {
      vi.mocked(AgriculturalCache.getFarm).mockResolvedValue(null);
      vi.mocked(database.farm.findUnique).mockRejectedValue(
        new Error("Database connection error")
      );

      await expect(getFarmById(mockFarmId)).rejects.toThrow(
        "Database connection error"
      );
    });

    it("should handle empty search query", async () => {
      vi.mocked(database.farm.findMany).mockResolvedValue([mockFarm] as any);

      const result = await searchFarmsService({ query: "" });

      expect(result).toBeDefined();
      // Should still execute search with empty string
    });

    it("should handle very large pagination requests", async () => {
      vi.mocked(database.farm.findMany).mockResolvedValue([]);
      vi.mocked(database.farm.count).mockResolvedValue(0);

      const result = await listFarmsService({ page: 999, limit: 100 });

      expect(result.farms).toEqual([]);
      expect(result.page).toBe(999);
    });

    it("should handle updates with no changes", async () => {
      vi.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any);
      vi.mocked(database.farm.update).mockResolvedValue(mockFarm as any);

      const result = await updateFarmService({
        farmId: mockFarmId,
        userId: mockUserId,
        updateData: {},
      });

      expect(result).toBeDefined();
      // Should still call update even with empty data
    });
  });
});
