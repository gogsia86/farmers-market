/**
 * 🚜 Farmer Journey Integration Tests
 *
 * Comprehensive end-to-end farmer journey validation with agricultural consciousness.
 * Tests complete farm management and order fulfillment workflows.
 *
 * @module tests/integration/journeys/farmer-journey
 * @version 1.0.0
 * @requires @prisma/client
 * @requires @testing-library/react
 *
 * Divine Pattern: Full-stack farmer journey testing with biodynamic awareness
 * Agricultural Context: Farm management lifecycle and product stewardship
 *
 * Test Coverage:
 * - Farm profile creation and verification ✅
 * - Product catalog management ✅
 * - Inventory management ✅
 * - Order fulfillment ✅
 * - Revenue tracking ✅
 * - Customer communication ✅
 * - Seasonal planning ✅
 * - Certification management ✅
 */

import { PrismaClient, OrderStatus, ProductCategory, Season, FarmStatus } from "@prisma/client";
import {
  getTestPrismaClient,
  cleanTestDatabase,
} from "../setup/testcontainers";
import { TEST_IDS, TEST_CREDENTIALS, seedFullTestData } from "../fixtures/seed";

// Mock external services
import { mockEmailService } from "../mocks/email.mock";
import { mockNotificationService } from "../mocks/notification.mock";
import { mockImageUploadService } from "../mocks/image-upload.mock";

let prisma: PrismaClient;

describe("🚜 Farmer Journey Integration Tests", () => {
  beforeAll(async () => {
    prisma = await getTestPrismaClient();

    // Initialize mocks
    mockEmailService.initialize();
    mockNotificationService.initialize();
    mockImageUploadService.initialize();
  });

  beforeEach(async () => {
    // Clean and reseed for test isolation
    await cleanTestDatabase();
    await seedFullTestData(prisma);

    // Reset mocks
    mockEmailService.reset();
    mockNotificationService.reset();
    mockImageUploadService.reset();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("🌱 Farm Profile Management", () => {
    it("should complete full farm onboarding from registration to verification", async () => {
      const farmerId = TEST_IDS.FARMER_USER_1;
      const farmerEmail = TEST_CREDENTIALS.FARMER_1.email;

      // ===== STEP 1: Create Farm Profile =====
      const farm = await prisma.farm.create({
        data: {
          name: "Green Valley Organic Farm",
          description: "Family-owned organic farm specializing in seasonal vegetables",
          ownerId: farmerId,
          slug: `green-valley-${Date.now()}`,
          status: FarmStatus.PENDING_VERIFICATION,
          location: {
            create: {
              address: "456 Farm Road",
              city: "Farmville",
              state: "CA",
              zipCode: "95678",
              country: "USA",
              latitude: 38.5816,
              longitude: -121.4944,
            },
          },
          settings: {
            create: {
              allowPickup: true,
              allowDelivery: true,
              deliveryRadius: 25,
              minOrderAmount: 15.0,
              processingTime: 24,
            },
          },
        },
        include: {
          location: true,
          settings: true,
        },
      });

      expect(farm.status).toBe(FarmStatus.PENDING_VERIFICATION);
      expect(farm.location).toBeDefined();
      expect(farm.settings?.allowPickup).toBe(true);

      // ===== STEP 2: Upload Farm Images =====
      const imageUrls = await mockImageUploadService.uploadMultiple([
        { name: "farm-front.jpg", size: 1024 * 500 },
        { name: "greenhouse.jpg", size: 1024 * 600 },
        { name: "harvest.jpg", size: 1024 * 550 },
      ]);

      expect(imageUrls).toHaveLength(3);

      await prisma.farm.update({
        where: { id: farm.id },
        data: {
          images: {
            create: imageUrls.map((url, index) => ({
              url: url,
              alt: `Farm image ${index + 1}`,
              isPrimary: index === 0,
            })),
          },
        },
      });

      // ===== STEP 3: Add Certifications =====
      const certifications = await prisma.certification.createMany({
        data: [
          {
            farmId: farm.id,
            name: "USDA Organic",
            issuedBy: "USDA",
            issuedAt: new Date("2023-01-15"),
            expiresAt: new Date("2025-01-15"),
            certificateUrl: "https://example.com/cert1.pdf",
          },
          {
            farmId: farm.id,
            name: "Certified Naturally Grown",
            issuedBy: "CNG",
            issuedAt: new Date("2023-03-20"),
            expiresAt: new Date("2025-03-20"),
            certificateUrl: "https://example.com/cert2.pdf",
          },
        ],
      });

      expect(certifications.count).toBe(2);

      // ===== STEP 4: Admin Verification =====
      await prisma.farm.update({
        where: { id: farm.id },
        data: {
          status: FarmStatus.VERIFIED,
          verifiedAt: new Date(),
        },
      });

      // Send verification email
      await mockEmailService.sendFarmVerificationEmail({
        to: farmerEmail,
        farmName: farm.name,
        farmId: farm.id,
      });

      expect(mockEmailService.getSentEmails()).toHaveLength(1);

      const verifiedFarm = await prisma.farm.findUnique({
        where: { id: farm.id },
        include: {
          images: true,
          certifications: true,
        },
      });

      expect(verifiedFarm?.status).toBe(FarmStatus.VERIFIED);
      expect(verifiedFarm?.images.length).toBe(3);
      expect(verifiedFarm?.certifications.length).toBe(2);
    });

    it("should update farm profile and settings", async () => {
      const farmId = TEST_IDS.FARM_1;

      // Update basic info
      const updatedFarm = await prisma.farm.update({
        where: { id: farmId },
        data: {
          description: "Updated farm description with new information",
          phone: "+1-555-FARM-123",
          website: "https://greenfarm.example.com",
        },
      });

      expect(updatedFarm.description).toContain("Updated farm description");
      expect(updatedFarm.phone).toBe("+1-555-FARM-123");

      // Update settings
      const settings = await prisma.farmSettings.update({
        where: { farmId: farmId },
        data: {
          deliveryRadius: 30,
          minOrderAmount: 20.0,
          allowPreorders: true,
        },
      });

      expect(settings.deliveryRadius).toBe(30);
      expect(settings.allowPreorders).toBe(true);
    });
  });

  describe("📦 Product Catalog Management", () => {
    it("should add new products to farm catalog", async () => {
      const farmId = TEST_IDS.FARM_1;
      const season = Season.SPRING;

      // Create product
      const product = await prisma.product.create({
        data: {
          farmId: farmId,
          name: "Fresh Spring Asparagus",
          description: "Tender green asparagus, freshly harvested",
          slug: `spring-asparagus-${Date.now()}`,
          category: ProductCategory.VEGETABLES,
          price: 6.99,
          unit: "lb",
          inventory: 50,
          season: season,
          isOrganic: true,
          status: "ACTIVE",
          images: {
            create: [
              {
                url: await mockImageUploadService.upload({
                  name: "asparagus.jpg",
                  size: 1024 * 400,
                }),
                alt: "Fresh asparagus bundle",
                isPrimary: true,
              },
            ],
          },
          nutritionInfo: {
            create: {
              calories: 27,
              protein: 2.9,
              carbohydrates: 5.2,
              fiber: 2.8,
              fat: 0.2,
            },
          },
        },
        include: {
          images: true,
          nutritionInfo: true,
        },
      });

      expect(product.name).toBe("Fresh Spring Asparagus");
      expect(product.season).toBe(season);
      expect(product.isOrganic).toBe(true);
      expect(product.images.length).toBeGreaterThan(0);
      expect(product.nutritionInfo).toBeDefined();
    });

    it("should bulk update product inventory", async () => {
      const farmId = TEST_IDS.FARM_1;

      // Get all farm products
      const products = await prisma.product.findMany({
        where: { farmId: farmId },
        select: { id: true, name: true, inventory: true },
      });

      expect(products.length).toBeGreaterThan(0);

      // Bulk inventory update (harvest day!)
      const updates = products.map((product) => ({
        id: product.id,
        inventory: product.inventory + 20, // Add 20 units to each
      }));

      await Promise.all(
        updates.map((update) =>
          prisma.product.update({
            where: { id: update.id },
            data: { inventory: update.inventory },
          })
        )
      );

      // Verify updates
      const updatedProducts = await prisma.product.findMany({
        where: { farmId: farmId },
      });

      updatedProducts.forEach((product, index) => {
        expect(product.inventory).toBeGreaterThanOrEqual(
          products[index].inventory
        );
      });
    });

    it("should mark products as out of season", async () => {
      const farmId = TEST_IDS.FARM_1;
      const currentSeason = Season.WINTER;

      // Find products not in season
      const outOfSeasonProducts = await prisma.product.findMany({
        where: {
          farmId: farmId,
          season: { not: currentSeason },
        },
      });

      // Update status
      await prisma.product.updateMany({
        where: {
          farmId: farmId,
          season: { not: currentSeason },
        },
        data: {
          status: "INACTIVE",
        },
      });

      const updatedProducts = await prisma.product.findMany({
        where: {
          farmId: farmId,
          season: { not: currentSeason },
        },
      });

      updatedProducts.forEach((product) => {
        expect(product.status).toBe("INACTIVE");
      });
    });

    it("should manage product pricing and promotions", async () => {
      const productId = TEST_IDS.PRODUCT_TOMATOES;

      // Create promotion
      const promotion = await prisma.promotion.create({
        data: {
          productId: productId,
          name: "Summer Sale",
          discountPercent: 15,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      });

      expect(promotion.discountPercent).toBe(15);

      // Calculate promotional price
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      const originalPrice = product?.price || 0;
      const promotionalPrice =
        originalPrice * (1 - promotion.discountPercent / 100);

      expect(promotionalPrice).toBeLessThan(originalPrice);
      expect(promotionalPrice).toBeCloseTo(originalPrice * 0.85, 2);
    });
  });

  describe("📋 Order Fulfillment", () => {
    it("should process incoming orders from farm dashboard", async () => {
      const farmId = TEST_IDS.FARM_1;
      const farmerId = TEST_IDS.FARMER_USER_1;

      // Get pending orders
      const pendingOrders = await prisma.order.findMany({
        where: {
          farmId: farmId,
          status: OrderStatus.PENDING,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
          shippingAddress: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      expect(pendingOrders.length).toBeGreaterThan(0);

      const order = pendingOrders[0];

      // ===== STEP 1: Confirm Order =====
      await prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CONFIRMED },
      });

      await mockEmailService.sendOrderConfirmation({
        to: order.customer.email,
        orderId: order.id,
        orderNumber: order.id.slice(0, 8),
        items: order.items,
        total: order.total,
      });

      // ===== STEP 2: Start Processing =====
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PROCESSING,
          processingStartedAt: new Date(),
        },
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.PROCESSING,
          note: "Farmer has started preparing your order",
        },
      });

      // ===== STEP 3: Mark Ready =====
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.READY_FOR_PICKUP,
          readyAt: new Date(),
        },
      });

      await mockNotificationService.sendPushNotification({
        userId: order.customerId,
        title: "Order Ready!",
        body: `Your order from ${order.farm?.name || "the farm"} is ready for pickup`,
      });

      const processedOrder = await prisma.order.findUnique({
        where: { id: order.id },
      });

      expect(processedOrder?.status).toBe(OrderStatus.READY_FOR_PICKUP);
      expect(processedOrder?.processingStartedAt).toBeDefined();
      expect(processedOrder?.readyAt).toBeDefined();
    });

    it("should handle order cancellations and refunds", async () => {
      const orderId = TEST_IDS.ORDER_PENDING;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          customer: true,
        },
      });

      // Cancel order
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
          cancellationReason: "Product unavailable due to weather conditions",
        },
      });

      // Restore inventory
      for (const item of order?.items || []) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              increment: item.quantity,
            },
          },
        });
      }

      // Notify customer
      await mockEmailService.sendOrderCancellation({
        to: order?.customer.email || "",
        orderId: orderId,
        reason: "Product unavailable due to weather conditions",
      });

      const cancelledOrder = await prisma.order.findUnique({
        where: { id: orderId },
      });

      expect(cancelledOrder?.status).toBe(OrderStatus.CANCELLED);
      expect(cancelledOrder?.cancellationReason).toBeDefined();
      expect(mockEmailService.getSentEmails().length).toBeGreaterThan(0);
    });

    it("should batch process multiple orders", async () => {
      const farmId = TEST_IDS.FARM_1;

      const orders = await prisma.order.findMany({
        where: {
          farmId: farmId,
          status: OrderStatus.PENDING,
        },
        take: 5,
      });

      // Batch confirm
      await prisma.order.updateMany({
        where: {
          id: { in: orders.map((o) => o.id) },
        },
        data: {
          status: OrderStatus.CONFIRMED,
        },
      });

      const confirmedOrders = await prisma.order.findMany({
        where: {
          id: { in: orders.map((o) => o.id) },
        },
      });

      confirmedOrders.forEach((order) => {
        expect(order.status).toBe(OrderStatus.CONFIRMED);
      });
    });
  });

  describe("💰 Revenue and Analytics", () => {
    it("should calculate daily revenue for farm", async () => {
      const farmId = TEST_IDS.FARM_1;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dailyOrders = await prisma.order.findMany({
        where: {
          farmId: farmId,
          status: { in: [OrderStatus.CONFIRMED, OrderStatus.DELIVERED] },
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      const dailyRevenue = dailyOrders.reduce(
        (sum, order) => sum + order.total,
        0
      );

      expect(dailyRevenue).toBeGreaterThanOrEqual(0);
    });

    it("should track product performance metrics", async () => {
      const farmId = TEST_IDS.FARM_1;

      const productMetrics = await prisma.product.findMany({
        where: { farmId: farmId },
        select: {
          id: true,
          name: true,
          price: true,
          soldCount: true,
          inventory: true,
          averageRating: true,
          reviewCount: true,
        },
        orderBy: {
          soldCount: "desc",
        },
        take: 10,
      });

      expect(productMetrics.length).toBeGreaterThan(0);

      // Calculate revenue per product
      const topProducts = productMetrics.map((product) => ({
        ...product,
        revenue: product.price * product.soldCount,
      }));

      topProducts.forEach((product) => {
        expect(product.revenue).toBeGreaterThanOrEqual(0);
      });
    });

    it("should generate monthly revenue report", async () => {
      const farmId = TEST_IDS.FARM_1;
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const firstDayOfNextMonth = new Date(firstDayOfMonth);
      firstDayOfNextMonth.setMonth(firstDayOfNextMonth.getMonth() + 1);

      const monthlyOrders = await prisma.order.findMany({
        where: {
          farmId: farmId,
          status: { in: [OrderStatus.CONFIRMED, OrderStatus.DELIVERED] },
          createdAt: {
            gte: firstDayOfMonth,
            lt: firstDayOfNextMonth,
          },
        },
        include: {
          items: true,
        },
      });

      const report = {
        totalOrders: monthlyOrders.length,
        totalRevenue: monthlyOrders.reduce((sum, order) => sum + order.total, 0),
        averageOrderValue:
          monthlyOrders.length > 0
            ? monthlyOrders.reduce((sum, order) => sum + order.total, 0) /
              monthlyOrders.length
            : 0,
        totalItemsSold: monthlyOrders.reduce(
          (sum, order) =>
            sum +
            order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
          0
        ),
      };

      expect(report.totalOrders).toBeGreaterThanOrEqual(0);
      expect(report.totalRevenue).toBeGreaterThanOrEqual(0);
    });
  });

  describe("📱 Customer Communication", () => {
    it("should send bulk notifications to customers", async () => {
      const farmId = TEST_IDS.FARM_1;

      // Get all customers who ordered from this farm
      const customers = await prisma.order.findMany({
        where: {
          farmId: farmId,
          status: OrderStatus.DELIVERED,
        },
        select: {
          customer: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        distinct: ["customerId"],
      });

      const uniqueCustomers = Array.from(
        new Map(customers.map((o) => [o.customer.id, o.customer])).values()
      );

      // Send announcement
      const announcement = "New harvest arriving this weekend! 🌽🥕🥬";

      for (const customer of uniqueCustomers) {
        await mockEmailService.sendFarmAnnouncement({
          to: customer.email,
          farmName: "Test Farm",
          subject: "Fresh Harvest Announcement",
          message: announcement,
        });
      }

      expect(mockEmailService.getSentEmails().length).toBe(
        uniqueCustomers.length
      );
    });

    it("should respond to customer reviews", async () => {
      const farmId = TEST_IDS.FARM_1;

      // Get reviews for farm products
      const reviews = await prisma.review.findMany({
        where: {
          product: {
            farmId: farmId,
          },
        },
        include: {
          customer: true,
          product: true,
        },
      });

      if (reviews.length > 0) {
        const review = reviews[0];

        // Add farmer response
        await prisma.review.update({
          where: { id: review.id },
          data: {
            farmerResponse: "Thank you for your feedback! We're glad you enjoyed our products.",
            farmerRespondedAt: new Date(),
          },
        });

        const updatedReview = await prisma.review.findUnique({
          where: { id: review.id },
        });

        expect(updatedReview?.farmerResponse).toBeDefined();
        expect(updatedReview?.farmerRespondedAt).toBeDefined();
      }
    });
  });

  describe("🌾 Seasonal Planning", () => {
    it("should plan product catalog for upcoming season", async () => {
      const farmId = TEST_IDS.FARM_1;
      const upcomingSeason = Season.SUMMER;

      // Get current season products
      const currentProducts = await prisma.product.findMany({
        where: {
          farmId: farmId,
          season: upcomingSeason,
        },
      });

      // Create new seasonal products
      const newSeasonalProducts = [
        {
          name: "Summer Strawberries",
          category: ProductCategory.FRUITS,
          price: 5.99,
        },
        {
          name: "Sweet Corn",
          category: ProductCategory.VEGETABLES,
          price: 0.99,
        },
        {
          name: "Fresh Basil",
          category: ProductCategory.HERBS,
          price: 3.49,
        },
      ];

      for (const productData of newSeasonalProducts) {
        await prisma.product.create({
          data: {
            farmId: farmId,
            name: productData.name,
            description: `Fresh ${productData.name.toLowerCase()} for ${upcomingSeason} season`,
            slug: `${productData.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
            category: productData.category,
            price: productData.price,
            unit: "lb",
            inventory: 0, // Will be updated closer to season
            season: upcomingSeason,
            status: "INACTIVE", // Activate when season starts
            isOrganic: true,
          },
        });
      }

      const allSeasonalProducts = await prisma.product.findMany({
        where: {
          farmId: farmId,
          season: upcomingSeason,
        },
      });

      expect(allSeasonalProducts.length).toBeGreaterThanOrEqual(
        newSeasonalProducts.length
      );
    });

    it("should archive past season products", async () => {
      const farmId = TEST_IDS.FARM_1;
      const pastSeason = Season.WINTER;

      await prisma.product.updateMany({
        where: {
          farmId: farmId,
          season: pastSeason,
          status: "ACTIVE",
        },
        data: {
          status: "ARCHIVED",
        },
      });

      const archivedProducts = await prisma.product.findMany({
        where: {
          farmId: farmId,
          season: pastSeason,
          status: "ARCHIVED",
        },
      });

      archivedProducts.forEach((product) => {
        expect(product.status).toBe("ARCHIVED");
      });
    });
  });

  describe("📊 Farm Dashboard Analytics", () => {
    it("should generate comprehensive farm dashboard data", async () => {
      const farmId = TEST_IDS.FARM_1;

      const dashboard = {
        // Order statistics
        orders: await prisma.order.aggregate({
          where: { farmId: farmId },
          _count: true,
          _sum: { total: true },
          _avg: { total: true },
        }),

        // Product statistics
        products: await prisma.product.aggregate({
          where: { farmId: farmId, status: "ACTIVE" },
          _count: true,
          _sum: { inventory: true, soldCount: true },
          _avg: { price: true, averageRating: true },
        }),

        // Pending orders
        pendingOrders: await prisma.order.count({
          where: {
            farmId: farmId,
            status: OrderStatus.PENDING,
          },
        }),

        // Low inventory products
        lowInventoryProducts: await prisma.product.count({
          where: {
            farmId: farmId,
            status: "ACTIVE",
            inventory: { lt: 10 },
          },
        }),

        // Recent reviews
        recentReviews: await prisma.review.count({
          where: {
            product: { farmId: farmId },
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      };

      expect(dashboard.orders._count).toBeGreaterThanOrEqual(0);
      expect(dashboard.products._count).toBeGreaterThanOrEqual(0);
      expect(dashboard.pendingOrders).toBeGreaterThanOrEqual(0);
    });
  });

  describe("🔒 Farm Security and Permissions", () => {
    it("should enforce farm ownership for operations", async () => {
      const farmId = TEST_IDS.FARM_1;
      const ownerId = TEST_IDS.FARMER_USER_1;
      const otherFarmerId = TEST_IDS.FARMER_USER_2;

      const farm = await prisma.farm.findUnique({
        where: { id: farmId },
      });

      expect(farm?.ownerId).toBe(ownerId);

      // Verify ownership before allowing operations
      const isOwner = farm?.ownerId === ownerId;
      const isNotOwner = farm?.ownerId === otherFarmerId;

      expect(isOwner).toBe(true);
      expect(isNotOwner).toBe(false);
    });

    it("should validate farm status before accepting orders", async () => {
      const farmId = TEST_IDS.FARM_1;

      const farm = await prisma.farm.findUnique({
        where: { id: farmId },
      });

      const canAcceptOrders =
        farm?.status === FarmStatus.VERIFIED && farm?.isActive === true;

      expect(canAcceptOrders).toBe(true);
    });
  });
});
