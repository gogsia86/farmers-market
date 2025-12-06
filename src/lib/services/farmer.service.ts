/**
 * 👨‍🌾 FARMER SERVICE
 * Divine farmer management with agricultural consciousness
 *
 * @module FarmerService
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 *
 * Features:
 * - Farmer registration and onboarding
 * - Profile management
 * - Farm association and verification
 * - Farmer dashboard data
 * - Agricultural compliance tracking
 */

import { database } from "@/lib/database";
import type {
  User,
  Farm,
  Product,
  Order,
  UserRole,
  UserStatus,
  FarmStatus,
  FarmVerificationStatus,
  Prisma,
} from "@prisma/client";
import { hash } from "bcryptjs";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FarmerRegistrationData {
  email: string;
  name: string;
  password: string;
  phone?: string;
  businessName?: string;
  agreedToTerms: boolean;
}

export interface FarmerProfile extends User {
  farms: Farm[];
  _count: {
    farms: number;
    orders: number;
  };
}

export interface FarmerDashboardStats {
  totalFarms: number;
  activeFarms: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  recentOrders: Order[];
  topProducts: Array<{
    product: Product;
    orderCount: number;
    revenue: number;
  }>;
}

export interface FarmerVerificationStatus {
  userId: string;
  isVerified: boolean;
  verificationStatus: FarmVerificationStatus;
  verifiedFarms: number;
  pendingFarms: number;
  rejectedFarms: number;
  canCreateProducts: boolean;
  requiresAction: boolean;
  message: string;
}

export interface UpdateFarmerProfileData {
  name?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  businessName?: string;
  taxId?: string;
}

// ============================================================================
// FARMER SERVICE CLASS
// ============================================================================

export class FarmerService {
  /**
   * 🌾 REGISTER NEW FARMER
   * Divine farmer onboarding with agricultural consciousness
   */
  async registerFarmer(data: FarmerRegistrationData): Promise<User> {
    try {
      // Validate registration data
      this.validateRegistrationData(data);

      // Check if email already exists
      const existingUser = await database.user.findUnique({
        where: { email: data.email.toLowerCase().trim() },
      });

      if (existingUser) {
        throw new Error("Email already registered");
      }

      // Hash password with agricultural security
      const hashedPassword = await hash(data.password, 12);

      // Create farmer user with divine consciousness
      const farmer = await database.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          name: data.name.trim(),
          password: hashedPassword,
          phone: data.phone?.trim() || null,
          role: "FARMER" as UserRole,
          status: "ACTIVE" as UserStatus,
          emailVerified: false, // Requires email verification
        },
      });

      console.log(`✅ Farmer registered successfully: ${farmer.email}`);

      return farmer;
    } catch (error) {
      console.error("❌ FarmerService.registerFarmer error:", error);
      throw new Error(
        `Failed to register farmer: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * 👤 GET FARMER BY ID
   * Retrieve complete farmer profile with agricultural context
   */
  async getFarmerById(farmerId: string): Promise<FarmerProfile | null> {
    try {
      const farmer = await database.user.findUnique({
        where: {
          id: farmerId,
          role: "FARMER" as UserRole,
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

      if (!farmer) {
        return null;
      }

      return farmer as FarmerProfile;
    } catch (error) {
      console.error("❌ FarmerService.getFarmerById error:", error);
      throw new Error(
        `Failed to fetch farmer: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * 📧 GET FARMER BY EMAIL
   * Retrieve farmer by email address
   */
  async getFarmerByEmail(email: string): Promise<FarmerProfile | null> {
    try {
      const farmer = await database.user.findUnique({
        where: {
          email: email.toLowerCase().trim(),
          role: "FARMER" as UserRole,
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

      if (!farmer) {
        return null;
      }

      return farmer as FarmerProfile;
    } catch (error) {
      console.error("❌ FarmerService.getFarmerByEmail error:", error);
      throw new Error(
        `Failed to fetch farmer by email: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * 🔄 UPDATE FARMER PROFILE
   * Update farmer information with validation
   */
  async updateFarmerProfile(
    farmerId: string,
    updates: UpdateFarmerProfileData,
  ): Promise<User> {
    try {
      // Verify farmer exists
      const existingFarmer = await database.user.findUnique({
        where: {
          id: farmerId,
          role: "FARMER" as UserRole,
        },
      });

      if (!existingFarmer) {
        throw new Error("Farmer not found");
      }

      // Build update data
      const updateData: Prisma.UserUpdateInput = {};

      if (updates.name) {
        updateData.name = updates.name.trim();
      }

      if (updates.phone !== undefined) {
        updateData.phone = updates.phone?.trim() || null;
      }

      // Note: bio, avatarUrl, businessName, and taxId are Farm fields, not User fields
      // These should be updated on the Farm model instead

      // Update farmer
      const updatedFarmer = await database.user.update({
        where: { id: farmerId },
        data: updateData,
      });

      console.log(`✅ Farmer profile updated: ${farmerId}`);

      return updatedFarmer;
    } catch (error) {
      console.error("❌ FarmerService.updateFarmerProfile error:", error);
      throw new Error(
        `Failed to update farmer profile: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * 📊 GET FARMER DASHBOARD STATS
   * Comprehensive dashboard statistics with agricultural insights
   */
  async getFarmerDashboardStats(
    farmerId: string,
  ): Promise<FarmerDashboardStats> {
    try {
      // Verify farmer exists
      const farmer = await database.user.findUnique({
        where: {
          id: farmerId,
          role: "FARMER" as UserRole,
        },
      });

      if (!farmer) {
        throw new Error("Farmer not found");
      }

      // Get all farms owned by farmer
      const farms = await database.farm.findMany({
        where: { ownerId: farmerId },
        select: { id: true },
      });

      const farmIds = farms.map((f) => f.id);

      // Calculate date range for monthly stats
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Execute parallel queries for performance (HP OMEN optimization)
      const [
        totalFarms,
        activeFarms,
        totalProducts,
        activeProducts,
        allOrders,
        monthlyOrders,
        recentOrders,
        productStats,
      ] = await Promise.all([
        // Total farms count
        database.farm.count({
          where: { ownerId: farmerId },
        }),

        // Active farms count
        database.farm.count({
          where: {
            ownerId: farmerId,
            status: "ACTIVE" as FarmStatus,
          },
        }),

        // Total products count
        database.product.count({
          where: {
            farmId: { in: farmIds },
          },
        }),

        // Active products count
        database.product.count({
          where: {
            farmId: { in: farmIds },
            status: "ACTIVE",
          },
        }),

        // All orders
        database.order.findMany({
          where: {
            items: {
              some: {
                product: {
                  farmId: { in: farmIds },
                },
              },
            },
          },
          select: {
            total: true,
            status: true,
          },
        }),

        // Monthly orders
        database.order.findMany({
          where: {
            items: {
              some: {
                product: {
                  farmId: { in: farmIds },
                },
              },
            },
            createdAt: {
              gte: firstDayOfMonth,
            },
          },
          select: {
            total: true,
          },
        }),

        // Recent orders (last 10)
        database.order.findMany({
          where: {
            items: {
              some: {
                product: {
                  farmId: { in: farmIds },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        }),

        // Product stats for top products
        database.orderItem.groupBy({
          by: ["productId"],
          where: {
            product: {
              farmId: { in: farmIds },
            },
          },
          _count: {
            productId: true,
          },
          _sum: {
            subtotal: true,
          },
          orderBy: {
            _count: {
              productId: "desc",
            },
          },
          take: 5,
        }),
      ]);

      // Calculate revenue
      const totalRevenue = allOrders.reduce(
        (sum, order) => sum + Number(order.total),
        0,
      );

      const monthlyRevenue = monthlyOrders.reduce(
        (sum, order) => sum + Number(order.total),
        0,
      );

      // Count pending orders
      const pendingOrders = allOrders.filter(
        (o) => o.status === "PREPARING" || o.status === "CONFIRMED",
      ).length;

      // Get top products details
      const topProducts = await Promise.all(
        productStats.map(async (stat) => {
          const product = await database.product.findUnique({
            where: { id: stat.productId },
          });

          return {
            product: product as Product,
            orderCount: stat._count.productId,
            revenue: Number(stat._sum.subtotal || 0),
          };
        }),
      );

      return {
        totalFarms,
        activeFarms,
        totalProducts,
        activeProducts,
        totalOrders: allOrders.length,
        pendingOrders,
        totalRevenue,
        monthlyRevenue,
        recentOrders,
        topProducts: topProducts.filter((tp) => tp.product !== null),
      };
    } catch (error) {
      console.error("❌ FarmerService.getFarmerDashboardStats error:", error);
      throw new Error(
        `Failed to fetch dashboard stats: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * ✅ GET FARMER VERIFICATION STATUS
   * Check farmer's verification status and permissions
   */
  async getFarmerVerificationStatus(
    farmerId: string,
  ): Promise<FarmerVerificationStatus> {
    try {
      const farmer = await database.user.findUnique({
        where: {
          id: farmerId,
          role: "FARMER" as UserRole,
        },
        include: {
          farms: {
            select: {
              verificationStatus: true,
            },
          },
        },
      });

      if (!farmer) {
        throw new Error("Farmer not found");
      }

      // Count farms by verification status
      const verifiedFarms = farmer.farms.filter(
        (f) => f.verificationStatus === "VERIFIED",
      ).length;

      const pendingFarms = farmer.farms.filter(
        (f) => f.verificationStatus === "PENDING",
      ).length;

      const rejectedFarms = farmer.farms.filter(
        (f) => f.verificationStatus === "REJECTED",
      ).length;

      // Determine overall verification status
      const isVerified = verifiedFarms > 0;
      const verificationStatus: FarmVerificationStatus =
        verifiedFarms > 0
          ? "VERIFIED"
          : pendingFarms > 0
            ? "PENDING"
            : rejectedFarms > 0
              ? "REJECTED"
              : "PENDING";

      // Determine if farmer can create products
      const canCreateProducts = verifiedFarms > 0;

      // Determine if action is required
      const requiresAction = rejectedFarms > 0 || farmer.farms.length === 0;

      // Generate status message
      let message = "";
      if (verifiedFarms > 0) {
        message = `You have ${verifiedFarms} verified farm${verifiedFarms > 1 ? "s" : ""}. You can create and sell products.`;
      } else if (pendingFarms > 0) {
        message = `You have ${pendingFarms} farm${pendingFarms > 1 ? "s" : ""} pending verification. Please wait for admin approval.`;
      } else if (rejectedFarms > 0) {
        message = `You have ${rejectedFarms} rejected farm${rejectedFarms > 1 ? "s" : ""}. Please review and resubmit with corrections.`;
      } else {
        message = "Please create your first farm to start selling products.";
      }

      return {
        userId: farmerId,
        isVerified,
        verificationStatus,
        verifiedFarms,
        pendingFarms,
        rejectedFarms,
        canCreateProducts,
        requiresAction,
        message,
      };
    } catch (error) {
      console.error(
        "❌ FarmerService.getFarmerVerificationStatus error:",
        error,
      );
      throw new Error(
        `Failed to fetch verification status: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * 📋 LIST ALL FARMERS
   * Admin function to list all farmers with pagination
   */
  async listFarmers(
    options: {
      page?: number;
      limit?: number;
      status?: UserStatus;
      search?: string;
    } = {},
  ): Promise<{
    farmers: FarmerProfile[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 20, status, search } = options;

      const validPage = Math.max(1, page);
      const validLimit = Math.min(100, Math.max(1, limit));
      const skip = (validPage - 1) * validLimit;

      // Build where clause
      const where: Prisma.UserWhereInput = {
        role: "FARMER" as UserRole,
      };

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          {
            name: {
              contains: search,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
        ];
      }

      // Execute parallel queries
      const [farmers, total] = await Promise.all([
        database.user.findMany({
          where,
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
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: validLimit,
        }),
        database.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / validLimit);

      return {
        farmers: farmers as FarmerProfile[],
        total,
        page: validPage,
        totalPages,
      };
    } catch (error) {
      console.error("❌ FarmerService.listFarmers error:", error);
      throw new Error(
        `Failed to list farmers: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * 🗑️ DELETE FARMER
   * Soft delete farmer account
   */
  async deleteFarmer(farmerId: string): Promise<void> {
    try {
      // Verify farmer exists
      const farmer = await database.user.findUnique({
        where: {
          id: farmerId,
          role: "FARMER" as UserRole,
        },
      });

      if (!farmer) {
        throw new Error("Farmer not found");
      }

      // Soft delete by setting status to INACTIVE
      await database.user.update({
        where: { id: farmerId },
        data: {
          status: "INACTIVE" as UserStatus,
        },
      });

      console.log(`✅ Farmer soft deleted: ${farmerId}`);
    } catch (error) {
      console.error("❌ FarmerService.deleteFarmer error:", error);
      throw new Error(
        `Failed to delete farmer: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * ✅ VALIDATE REGISTRATION DATA
   * Ensure all required fields are present and valid
   */
  private validateRegistrationData(data: FarmerRegistrationData): void {
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error("Valid email is required");
    }

    if (!data.name || data.name.trim().length < 2) {
      throw new Error("Name must be at least 2 characters");
    }

    if (!data.password || data.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    if (!data.agreedToTerms) {
      throw new Error("Must agree to terms and conditions");
    }

    if (data.phone && !this.isValidPhone(data.phone)) {
      throw new Error("Invalid phone number format");
    }
  }

  /**
   * 📧 VALIDATE EMAIL FORMAT
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 📱 VALIDATE PHONE FORMAT
   */
  private isValidPhone(phone: string): boolean {
    // Basic phone validation - accepts various formats
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    const cleaned = phone.replace(/\s/g, "");
    return (
      phoneRegex.test(phone) && cleaned.length >= 10 && cleaned.length <= 15
    );
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const farmerService = new FarmerService();
export default farmerService;
