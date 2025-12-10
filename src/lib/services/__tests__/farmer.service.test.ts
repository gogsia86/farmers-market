/**
 * 🧪 FARMER SERVICE TESTS
 * Divine test coverage with agricultural consciousness
 *
 * @module FarmerServiceTests
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import { FarmerService } from "../farmer.service";
import { database } from "@/lib/database";
import type {
  UserRole,
  UserStatus,
  FarmStatus,
  FarmVerificationStatus,
} from "@prisma/client";
import { hash } from "bcryptjs";

// Mock the database
jest.mock("@/lib/database", () => ({
  database: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    farm: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
    },
    orderItem: {
      groupBy: jest.fn(),
    },
  },
}));

// Mock bcryptjs
jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

describe("👨‍🌾 FarmerService - Divine Agricultural Farmer Management", () => {
  let farmerService: FarmerService;

  beforeEach(() => {
    farmerService = new FarmerService();
    jest.clearAllMocks();
  });

  // ==========================================================================
  // REGISTER FARMER TESTS
  // ==========================================================================

  describe("🌾 registerFarmer - Divine Farmer Onboarding", () => {
    const validRegistrationData = {
      email: "farmer@example.com",
      name: "John Farmer",
      password: "SecurePass123!",
      phone: "555-0123",
      businessName: "John's Farm",
      agreedToTerms: true,
    };

    it("should register a new farmer successfully", async () => {
      const mockHashedPassword = "hashed_password_123";
      const mockFarmer = {
        id: "farmer-1",
        email: "farmer@example.com",
        name: "John Farmer",
        password: mockHashedPassword,
        phone: "555-0123",
        role: "FARMER" as UserRole,
        status: "ACTIVE" as UserStatus,
        emailVerified: false,
      };

      (database.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hash as jest.Mock).mockResolvedValue(mockHashedPassword);
      (database.user.create as jest.Mock).mockResolvedValue(mockFarmer);

      const result = await farmerService.registerFarmer(validRegistrationData);

      expect(result).toEqual(mockFarmer);
      expect(database.user.findUnique).toHaveBeenCalledWith({
        where: { email: "farmer@example.com" },
      });
      expect(hash).toHaveBeenCalledWith("SecurePass123!", 12);
      expect(database.user.create).toHaveBeenCalledWith({
        data: {
          email: "farmer@example.com",
          name: "John Farmer",
          password: mockHashedPassword,
          phone: "555-0123",
          role: "FARMER",
          status: "ACTIVE",
          emailVerified: false,
        },
      });
    });

    it("should throw error if email already exists", async () => {
      const existingUser = {
        id: "user-1",
        email: "farmer@example.com",
      };

      (database.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      await expect(
        farmerService.registerFarmer(validRegistrationData),
      ).rejects.toThrow("Email already registered");
    });

    it("should throw error if email is invalid", async () => {
      const invalidData = {
        ...validRegistrationData,
        email: "invalid-email",
      };

      await expect(farmerService.registerFarmer(invalidData)).rejects.toThrow(
        "Valid email is required",
      );
    });

    it("should throw error if name is too short", async () => {
      const invalidData = {
        ...validRegistrationData,
        name: "J",
      };

      await expect(farmerService.registerFarmer(invalidData)).rejects.toThrow(
        "Name must be at least 2 characters",
      );
    });

    it("should throw error if password is too short", async () => {
      const invalidData = {
        ...validRegistrationData,
        password: "short",
      };

      await expect(farmerService.registerFarmer(invalidData)).rejects.toThrow(
        "Password must be at least 8 characters",
      );
    });

    it("should throw error if terms not agreed", async () => {
      const invalidData = {
        ...validRegistrationData,
        agreedToTerms: false,
      };

      await expect(farmerService.registerFarmer(invalidData)).rejects.toThrow(
        "Must agree to terms and conditions",
      );
    });

    it("should throw error if phone format is invalid", async () => {
      const invalidData = {
        ...validRegistrationData,
        phone: "123",
      };

      await expect(farmerService.registerFarmer(invalidData)).rejects.toThrow(
        "Invalid phone number format",
      );
    });

    it("should trim email and convert to lowercase", async () => {
      const dataWithSpaces = {
        ...validRegistrationData,
        email: "  Farmer@Example.COM  ",
      };

      const mockFarmer = {
        id: "farmer-1",
        email: "farmer@example.com",
      };

      (database.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hash as jest.Mock).mockResolvedValue("hashed_password");
      (database.user.create as jest.Mock).mockResolvedValue(mockFarmer);

      await farmerService.registerFarmer(dataWithSpaces);

      expect(database.user.findUnique).toHaveBeenCalledWith({
        where: { email: "farmer@example.com" },
      });
    });

    it("should handle registration without optional phone", async () => {
      const dataWithoutPhone = {
        email: "farmer@example.com",
        name: "John Farmer",
        password: "SecurePass123!",
        agreedToTerms: true,
      };

      const mockFarmer = {
        id: "farmer-1",
        email: "farmer@example.com",
        phone: null,
      };

      (database.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hash as jest.Mock).mockResolvedValue("hashed_password");
      (database.user.create as jest.Mock).mockResolvedValue(mockFarmer);

      const result = await farmerService.registerFarmer(dataWithoutPhone);

      expect(result.phone).toBeNull();
    });
  });

  // ==========================================================================
  // GET FARMER BY ID TESTS
  // ==========================================================================

  describe("👤 getFarmerById - Retrieve Farmer Profile", () => {
    it("should fetch farmer profile with farms", async () => {
      const mockFarmer = {
        id: "farmer-1",
        email: "farmer@example.com",
        name: "John Farmer",
        role: "FARMER" as UserRole,
        farms: [
          { id: "farm-1", name: "Farm One" },
          { id: "farm-2", name: "Farm Two" },
        ],
        _count: {
          farms: 2,
          orders: 5,
        },
      };

      (database.user.findUnique as jest.Mock).mockResolvedValue(mockFarmer);

      const result = await farmerService.getFarmerById("farmer-1");

      expect(result).toEqual(mockFarmer);
      expect(database.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: "farmer-1",
          role: "FARMER",
        },
        include: {
          farms: {
            orderBy: {
              createdAt: "desc",
            },
          },
          _count: {
            select: {
              farms: true,
              orders: true,
            },
          },
        },
      });
    });

    it("should return null if farmer not found", async () => {
      (database.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await farmerService.getFarmerById("nonexistent");

      expect(result).toBeNull();
    });

    it("should handle database errors gracefully", async () => {
      (database.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await expect(farmerService.getFarmerById("farmer-1")).rejects.toThrow(
        "Failed to fetch farmer",
      );
    });
  });

  // ==========================================================================
  // GET FARMER BY EMAIL TESTS
  // ==========================================================================

  describe("📧 getFarmerByEmail - Retrieve Farmer by Email", () => {
    it("should fetch farmer profile by email", async () => {
      const mockFarmer = {
        id: "farmer-1",
        email: "farmer@example.com",
        name: "John Farmer",
        role: "FARMER" as UserRole,
        farms: [],
        _count: {
          farms: 0,
          orders: 0,
        },
      };

      (database.user.findUnique as jest.Mock).mockResolvedValue(mockFarmer);

      const result = await farmerService.getFarmerByEmail("farmer@example.com");

      expect(result).toEqual(mockFarmer);
      expect(database.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: "farmer@example.com",
          role: "FARMER",
        },
        include: {
          farms: {
            orderBy: {
              createdAt: "desc",
            },
          },
          _count: {
            select: {
              farms: true,
              orders: true,
            },
          },
        },
      });
    });

    it("should trim and convert email to lowercase", async () => {
      (database.user.findUnique as jest.Mock).mockResolvedValue(null);

      await farmerService.getFarmerByEmail("  FARMER@EXAMPLE.COM  ");

      expect(database.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: "farmer@example.com",
          role: "FARMER",
        },
        include: expect.any(Object),
      });
    });

    it("should return null if farmer not found", async () => {
      (database.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await farmerService.getFarmerByEmail(
        "nonexistent@example.com",
      );

      expect(result).toBeNull();
    });
  });

  // ==========================================================================
  // UPDATE FARMER PROFILE TESTS
  // ==========================================================================

  describe("🔄 updateFarmerProfile - Update Farmer Information", () => {
    it("should update farmer profile successfully", async () => {
      const existingFarmer = {
        id: "farmer-1",
        email: "farmer@example.com",
        name: "John Farmer",
        role: "FARMER" as UserRole,
      };

      const updatedFarmer = {
        ...existingFarmer,
        name: "John Updated",
        phone: "555-9999",
      };

      (database.user.findUnique as jest.Mock).mockResolvedValue(existingFarmer);
      (database.user.update as jest.Mock).mockResolvedValue(updatedFarmer);

      const result = await farmerService.updateFarmerProfile("farmer-1", {
        name: "John Updated",
        phone: "555-9999",
      });

      expect(result).toEqual(updatedFarmer);
      expect(database.user.update).toHaveBeenCalledWith({
        where: { id: "farmer-1" },
        data: expect.objectContaining({
          name: "John Updated",
          phone: "555-9999",
        }),
      });
    });

    it("should throw error if farmer not found", async () => {
      (database.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        farmerService.updateFarmerProfile("nonexistent", { name: "Test" }),
      ).rejects.toThrow("Farmer not found");
    });

    it("should handle partial updates", async () => {
      const existingFarmer = {
        id: "farmer-1",
        role: "FARMER" as UserRole,
      };

      (database.user.findUnique as jest.Mock).mockResolvedValue(existingFarmer);
      (database.user.update as jest.Mock).mockResolvedValue({
        ...existingFarmer,
        name: "Updated Name",
      });

      await farmerService.updateFarmerProfile("farmer-1", {
        name: "Updated Name",
      });

      expect(database.user.update).toHaveBeenCalledWith({
        where: { id: "farmer-1" },
        data: expect.objectContaining({
          name: "Updated Name",
        }),
      });
    });

    it("should set null for empty optional fields", async () => {
      const existingFarmer = {
        id: "farmer-1",
        role: "FARMER" as UserRole,
      };

      (database.user.findUnique as jest.Mock).mockResolvedValue(existingFarmer);
      (database.user.update as jest.Mock).mockResolvedValue({
        ...existingFarmer,
        phone: null,
      });

      await farmerService.updateFarmerProfile("farmer-1", {
        phone: "",
      });

      expect(database.user.update).toHaveBeenCalledWith({
        where: { id: "farmer-1" },
        data: expect.objectContaining({
          phone: null,
        }),
      });
    });
  });

  // ==========================================================================
  // GET FARMER DASHBOARD STATS TESTS
  // ==========================================================================

  describe("📊 getFarmerDashboardStats - Comprehensive Dashboard Data", () => {
    it("should fetch complete dashboard statistics", async () => {
      const mockFarmer = {
        id: "farmer-1",
        role: "FARMER" as UserRole,
      };

      const mockFarms = [{ id: "farm-1" }, { id: "farm-2" }];

      const mockOrders = [
        { total: 100, status: "COMPLETED" },
        { total: 200, status: "COMPLETED" },
        { total: 50, status: "PREPARING" },
      ];

      const mockMonthlyOrders = [{ total: 100 }, { total: 200 }];

      const mockRecentOrders = [
        { id: "order-1", total: 100 },
        { id: "order-2", total: 200 },
      ];

      const mockProductStats = [
        {
          productId: "prod-1",
          _count: { productId: 10 },
          _sum: { subtotal: 500 },
        },
      ];

      const mockProduct = {
        id: "prod-1",
        name: "Tomatoes",
        price: 50,
      };

      (database.user.findUnique as jest.Mock).mockResolvedValue(mockFarmer);
      (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);
      (database.farm.count as jest.Mock)
        .mockResolvedValueOnce(2) // totalFarms
        .mockResolvedValueOnce(1); // activeFarms
      (database.product.count as jest.Mock)
        .mockResolvedValueOnce(25) // totalProducts
        .mockResolvedValueOnce(20); // activeProducts
      (database.order.findMany as jest.Mock)
        .mockResolvedValueOnce(mockOrders) // allOrders
        .mockResolvedValueOnce(mockMonthlyOrders) // monthlyOrders
        .mockResolvedValueOnce(mockRecentOrders); // recentOrders
      (database.orderItem.groupBy as jest.Mock).mockResolvedValue(
        mockProductStats,
      );
      (database.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      const result = await farmerService.getFarmerDashboardStats("farmer-1");

      expect(result.totalFarms).toBe(2);
      expect(result.activeFarms).toBe(1);
      expect(result.totalProducts).toBe(25);
      expect(result.activeProducts).toBe(20);
      expect(result.totalOrders).toBe(3);
      expect(result.pendingOrders).toBe(1);
      expect(result.totalRevenue).toBe(350);
      expect(result.monthlyRevenue).toBe(300);
      expect(result.recentOrders).toHaveLength(2);
      expect(result.topProducts).toHaveLength(1);
      expect(result.topProducts[0].orderCount).toBe(10);
    });

    it("should throw error if farmer not found", async () => {
      (database.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        farmerService.getFarmerDashboardStats("nonexistent"),
      ).rejects.toThrow("Farmer not found");
    });

    it("should handle farmer with no farms", async () => {
      const mockFarmer = {
        id: "farmer-1",
        role: "FARMER" as UserRole,
      };

      (database.user.findUnique as jest.Mock).mockResolvedValue(mockFarmer);
      (database.farm.findMany as jest.Mock).mockResolvedValue([]);
      (database.farm.count as jest.Mock).mockResolvedValue(0);
      (database.product.count as jest.Mock).mockResolvedValue(0);
      (database.order.findMany as jest.Mock).mockResolvedValue([]);
      (database.orderItem.groupBy as jest.Mock).mockResolvedValue([]);

      const result = await farmerService.getFarmerDashboardStats("farmer-1");

      expect(result.totalFarms).toBe(0);
      expect(result.totalProducts).toBe(0);
      expect(result.totalOrders).toBe(0);
      expect(result.totalRevenue).toBe(0);
    });
  });

  // ==========================================================================
  // GET FARMER VERIFICATION STATUS TESTS
  // ==========================================================================

  describe("✅ getFarmerVerificationStatus - Check Verification", () => {
    it("should return verified status for farmer with verified farms", async () => {
      const mockFarmer = {
        id: "farmer-1",
        role: "FARMER" as UserRole,
        farms: [
          { verificationStatus: "VERIFIED" as FarmVerificationStatus },
          { verificationStatus: "VERIFIED" as FarmVerificationStatus },
        ],
      };

      (database.user.findUnique as jest.Mock).mockResolvedValue(mockFarmer);

      const result =
        await farmerService.getFarmerVerificationStatus("farmer-1");

      expect(result.isVerified).toBe(true);
      expect(result.verificationStatus).toBe("VERIFIED");
    });

    it("should return pending status for farmer with pending farms", async () => {
      const mockFarmer = {
        id: "farmer-1",
        role: "FARMER" as UserRole,
        farms: [{ verificationStatus: "PENDING" as FarmVerificationStatus }],
      };

      (database.user.findUnique as jest.Mock).mockResolvedValue(mockFarmer);

      const result =
        await farmerService.getFarmerVerificationStatus("farmer-1");

      expect(result.isVerified).toBe(false);
      expect(result.verificationStatus).toBe("PENDING");
    });

    it("should require action for farmer with rejected farms", async () => {
      const mockFarmer = {
        id: "farmer-1",
        role: "FARMER" as UserRole,
        farms: [{ verificationStatus: "REJECTED" as FarmVerificationStatus }],
      };

      (database.user.findUnique as jest.Mock).mockResolvedValue(mockFarmer);

      const result =
        await farmerService.getFarmerVerificationStatus("farmer-1");

      expect(result.requiresAction).toBe(true);
    });

    it("should require action for farmer with no farms", async () => {
      const mockFarmer = {
        id: "farmer-1",
        role: "FARMER" as UserRole,
        farms: [],
      };

      (database.user.findUnique as jest.Mock).mockResolvedValue(mockFarmer);

      const result =
        await farmerService.getFarmerVerificationStatus("farmer-1");

      expect(result.requiresAction).toBe(true);
    });

    it("should throw error if farmer not found", async () => {
      (database.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        farmerService.getFarmerVerificationStatus("nonexistent"),
      ).rejects.toThrow("Farmer not found");
    });
  });

  // ==========================================================================
  // LIST FARMERS TESTS
  // ==========================================================================

  describe("📋 listFarmers - Admin Function to List All Farmers", () => {
    it("should list farmers with pagination", async () => {
      const mockFarmers = [
        {
          id: "farmer-1",
          email: "farmer1@example.com",
          name: "Farmer One",
          role: "FARMER" as UserRole,
          farms: [],
          _count: { farms: 2, orders: 5 },
        },
        {
          id: "farmer-2",
          email: "farmer2@example.com",
          name: "Farmer Two",
          role: "FARMER" as UserRole,
          farms: [],
          _count: { farms: 1, orders: 3 },
        },
      ];

      (database.user.findMany as jest.Mock).mockResolvedValue(mockFarmers);
      (database.user.count as jest.Mock).mockResolvedValue(2);

      const result = await farmerService.listFarmers({
        page: 1,
        limit: 10,
      });

      expect(result.farmers).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    it("should filter farmers by status", async () => {
      (database.user.findMany as jest.Mock).mockResolvedValue([]);
      (database.user.count as jest.Mock).mockResolvedValue(0);

      await farmerService.listFarmers({
        status: "ACTIVE",
      });

      const call = (database.user.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where.status).toBe("ACTIVE");
    });

    it("should search farmers by name or email", async () => {
      (database.user.findMany as jest.Mock).mockResolvedValue([]);
      (database.user.count as jest.Mock).mockResolvedValue(0);

      await farmerService.listFarmers({
        search: "john",
      });

      const call = (database.user.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where.OR).toBeDefined();
    });

    it("should enforce maximum limit of 100", async () => {
      (database.user.findMany as jest.Mock).mockResolvedValue([]);
      (database.user.count as jest.Mock).mockResolvedValue(0);

      await farmerService.listFarmers({
        limit: 200,
      });

      const call = (database.user.findMany as jest.Mock).mock.calls[0][0];
      expect(call.take).toBe(100);
    });
  });

  // ==========================================================================
  // DELETE FARMER TESTS
  // ==========================================================================

  describe("🗑️ deleteFarmer - Soft Delete Farmer Account", () => {
    it("should soft delete farmer by setting status to INACTIVE", async () => {
      const mockFarmer = {
        id: "farmer-1",
        email: "farmer@example.com",
        role: "FARMER" as UserRole,
        status: "ACTIVE" as UserStatus,
      };

      (database.user.findUnique as jest.Mock).mockResolvedValue(mockFarmer);
      (database.user.update as jest.Mock).mockResolvedValue({
        ...mockFarmer,
        status: "INACTIVE",
      });

      await farmerService.deleteFarmer("farmer-1");

      expect(database.user.update).toHaveBeenCalledWith({
        where: { id: "farmer-1" },
        data: {
          status: "INACTIVE",
        },
      });
    });

    it("should throw error if farmer not found", async () => {
      (database.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(farmerService.deleteFarmer("nonexistent")).rejects.toThrow(
        "Farmer not found",
      );
    });

    it("should not call update if farmer not found", async () => {
      (database.user.findUnique as jest.Mock).mockResolvedValue(null);

      try {
        await farmerService.deleteFarmer("nonexistent");
      } catch {
        // Expected to throw
      }

      expect(database.user.update).not.toHaveBeenCalled();
    });
  });
});
