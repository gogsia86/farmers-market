/**
 * 🌱 Test Data Seeding System
 * Farmers Market Platform - Consistent Test Data Generation
 * Version: 1.0.0
 *
 * Provides factory functions and seeding utilities for generating
 * consistent, realistic test data across all bot testing scenarios.
 */

import { database } from "@/lib/database";
import type { Prisma } from "@prisma/client";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SeedOptions {
  clean?: boolean; // Clean existing test data
  verbose?: boolean; // Log seeding progress
  minimal?: boolean; // Seed minimal data only
}

export interface SeedResult {
  success: boolean;
  duration: number;
  counts: {
    users: number;
    farms: number;
    products: number;
    orders: number;
    reviews: number;
  };
  errors: string[];
}

// Test data identifiers (for easy lookup in tests)
export const TEST_IDS = {
  customer: {
    email: "test-customer@farmersmarket.test",
    id: "test-customer-001",
  },
  farmer: {
    email: "test-farmer@farmersmarket.test",
    id: "test-farmer-001",
  },
  admin: {
    email: "test-admin@farmersmarket.test",
    id: "test-admin-001",
  },
  farm: {
    slug: "test-farm-organic",
    id: "test-farm-001",
  },
  product: {
    slug: "test-product-tomatoes",
    id: "test-product-001",
  },
};

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Generate unique test email
 */
export function generateTestEmail(
  prefix: string = "test",
  domain: string = "farmersmarket.test",
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}-${timestamp}-${random}@${domain}`;
}

/**
 * Generate unique slug
 */
export function generateSlug(base: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${base}-${timestamp}-${random}`;
}

/**
 * User Factory
 */
export const UserFactory = {
  /**
   * Create customer user data
   */
  customer(
    overrides?: Partial<Prisma.UserCreateInput>,
  ): Prisma.UserCreateInput {
    return {
      email: generateTestEmail("customer"),
      name: "Test Customer",
      password: "$2a$10$HASHED_TEST_PASSWORD", // Pre-hashed test password
      role: "CONSUMER",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      ...overrides,
    };
  },

  /**
   * Create farmer user data
   */
  farmer(overrides?: Partial<Prisma.UserCreateInput>): Prisma.UserCreateInput {
    return {
      email: generateTestEmail("farmer"),
      name: "Test Farmer",
      password: "$2a$10$HASHED_TEST_PASSWORD",
      role: "FARMER",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      ...overrides,
    };
  },

  /**
   * Create admin user data
   */
  admin(overrides?: Partial<Prisma.UserCreateInput>): Prisma.UserCreateInput {
    return {
      email: generateTestEmail("admin"),
      name: "Test Admin",
      password: "$2a$10$HASHED_TEST_PASSWORD",
      role: "ADMIN",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      ...overrides,
    };
  },

  /**
   * Create batch of users
   */
  batch(
    count: number,
    type: "customer" | "farmer" | "admin" = "customer",
  ): Prisma.UserCreateInput[] {
    return Array.from({ length: count }, (_, i) => {
      const factory = this[type];
      return factory({
        email: generateTestEmail(`${type}-${i}`),
        name: `Test ${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`,
      });
    });
  },
};

/**
 * Farm Factory
 */
export const FarmFactory = {
  /**
   * Create farm data
   */
  create(
    ownerId: string,
    overrides?: Partial<Prisma.FarmCreateInput>,
  ): Prisma.FarmCreateInput {
    const timestamp = Date.now();
    return {
      name: `Test Farm ${timestamp}`,
      slug: generateSlug("test-farm"),
      description:
        "A beautiful organic farm dedicated to sustainable agriculture and community health.",
      owner: { connect: { id: ownerId } },
      status: "ACTIVE",
      certifications: {
        create: [
          {
            type: "ORGANIC",
            certifierName: "USDA",
            issueDate: new Date(),
          },
          {
            type: "FAIR_TRADE",
            certifierName: "Fair Trade USA",
            issueDate: new Date(),
          },
        ],
      },
      farmSize: 50,
      address: "123 Farm Road",
      city: "Farmville",
      state: "CA",
      zipCode: "95000",
      country: "US",
      latitude: 40.7128,
      longitude: -74.006,
      email: "testfarm@farmersmarket.test",
      phone: "555-0100",
      ...overrides,
    };
  },

  /**
   * Create batch of farms
   */
  batch(ownerIds: string[], count?: number): Prisma.FarmCreateInput[] {
    const total = count || ownerIds.length;
    return Array.from({ length: total }, (_, i) => {
      const ownerId = ownerIds[i % ownerIds.length];
      return this.create(ownerId, {
        name: `Test Farm ${i + 1}`,
        slug: generateSlug(`test-farm-${i + 1}`),
      });
    });
  },

  /**
   * Create farm with specific attributes
   */
  organic(ownerId: string): Prisma.FarmCreateInput {
    return this.create(ownerId, {
      name: "Organic Valley Farm",
      slug: generateSlug("organic-valley"),
      certifications: {
        create: [
          {
            type: "ORGANIC",
            certifierName: "USDA",
            issueDate: new Date(),
          },
          {
            type: "REGENERATIVE",
            certifierName: "Regenerative Organic Alliance",
            issueDate: new Date(),
          },
        ],
      },
      farmingPractices: ["ORGANIC", "REGENERATIVE"],
    });
  },

  hydroponic(ownerId: string): Prisma.FarmCreateInput {
    return this.create(ownerId, {
      name: "Hydroponic Gardens",
      slug: generateSlug("hydroponic-gardens"),
      farmingPractices: ["HYDROPONIC"],
    });
  },
};

/**
 * Product Factory
 */
export const ProductFactory = {
  /**
   * Create product data
   */
  create(
    farmId: string,
    overrides?: Partial<Prisma.ProductCreateInput>,
  ): Prisma.ProductCreateInput {
    const timestamp = Date.now();
    return {
      name: `Test Product ${timestamp}`,
      slug: generateSlug("test-product"),
      description: "Fresh, organic, and locally grown.",
      farm: { connect: { id: farmId } },
      category: "VEGETABLES",
      price: 9.99,
      unit: "lb",
      inStock: true,
      status: "ACTIVE",
      organic: true,
      harvestDate: new Date(),
      ...overrides,
    };
  },

  /**
   * Create batch of products
   */
  batch(farmIds: string[], count: number = 10): Prisma.ProductCreateInput[] {
    return Array.from({ length: count }, (_, i) => {
      const farmId = farmIds[i % farmIds.length];
      return this.create(farmId, {
        name: `Test Product ${i + 1}`,
        slug: generateSlug(`test-product-${i + 1}`),
        price: 5.99 + i * 0.5,
      });
    });
  },

  /**
   * Create specific product types
   */
  vegetable(farmId: string, name: string): Prisma.ProductCreateInput {
    return this.create(farmId, {
      name,
      slug: generateSlug(name.toLowerCase()),
      category: "VEGETABLES",
      unit: "lb",
      price: 4.99,
    });
  },

  fruit(farmId: string, name: string): Prisma.ProductCreateInput {
    return this.create(farmId, {
      name,
      slug: generateSlug(name.toLowerCase()),
      category: "FRUITS",
      unit: "lb",
      price: 6.99,
    });
  },

  dairy(farmId: string, name: string): Prisma.ProductCreateInput {
    return this.create(farmId, {
      name,
      slug: generateSlug(name.toLowerCase()),
      category: "DAIRY",
      unit: "gallon",
      price: 8.99,
    });
  },
};

/**
 * Order Factory
 */
export const OrderFactory = {
  /**
   * Create basic order
   */
  create(
    customerId: string,
    farmId: string,
    items: Array<{ productId: string; quantity: number; price: number }>,
  ): Prisma.OrderCreateInput {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const tax = subtotal * 0.08;
    const platformFee = subtotal * 0.1;
    const farmerAmount = subtotal - platformFee;
    const total = subtotal + tax;

    return {
      orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customer: { connect: { id: customerId } },
      farm: { connect: { id: farmId } },
      status: "PENDING",
      subtotal,
      tax,
      platformFee,
      farmerAmount,
      total,
      fulfillmentMethod: "FARM_PICKUP",
      items: {
        create: items.map((item) => ({
          product: { connect: { id: item.productId } },
          productName: "Test Product",
          quantity: item.quantity,
          price: item.price,
          unit: "lb",
          unitPrice: item.price,
          subtotal: item.quantity * item.price,
        })),
      },
    };
  },

  /**
   * Create completed order
   */
  completed(
    customerId: string,
    farmId: string,
    items: Array<{ productId: string; quantity: number; price: number }>,
  ): Prisma.OrderCreateInput {
    const order = this.create(customerId, farmId, items);
    return {
      ...order,
      status: "COMPLETED",
      completedAt: new Date(),
    };
  },
};

/**
 * Review Factory
 */
export const ReviewFactory = {
  /**
   * Create review data
   */
  create(
    userId: string,
    farmId: string,
    overrides?: Partial<Prisma.ReviewCreateInput>,
  ): Prisma.ReviewCreateInput {
    return {
      customer: { connect: { id: userId } },
      farm: { connect: { id: farmId } },
      rating: 5,
      reviewText:
        "Excellent farm! Fresh produce and friendly staff. Highly recommended!",
      isVerifiedPurchase: true,
      ...overrides,
    };
  },

  /**
   * Create batch of reviews with varying ratings
   */
  batch(
    userIds: string[],
    farmId: string,
    count: number = 5,
  ): Prisma.ReviewCreateInput[] {
    const ratings = [5, 4, 5, 3, 4];
    const comments = [
      "Excellent farm! Fresh produce and friendly staff.",
      "Great quality products. Will order again!",
      "Love supporting local farms. Keep up the good work!",
      "Good products but delivery was a bit slow.",
      "Fresh vegetables, reasonable prices. Recommended!",
    ];

    return Array.from({ length: count }, (_, i) => {
      const userId = userIds[i % userIds.length];
      return this.create(userId, farmId, {
        rating: ratings[i % ratings.length],
        reviewText: comments[i % comments.length],
      });
    });
  },
};

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

/**
 * Clean test data from database
 */
export async function cleanTestData(verbose: boolean = false): Promise<void> {
  if (verbose) console.log("🧹 Cleaning test data...");

  // Delete in correct order (respecting foreign keys)
  await database.orderItem.deleteMany({});
  await database.order.deleteMany({});
  await database.review.deleteMany({});
  await database.product.deleteMany({});
  await database.farm.deleteMany({});

  await database.user.deleteMany({
    where: {
      OR: [
        { email: { contains: "@farmersmarket.test" } },
        { email: { contains: "test-" } },
      ],
    },
  });

  if (verbose) console.log("✅ Test data cleaned");
}

/**
 * Seed essential test data
 */
export async function seedEssentialData(
  options: SeedOptions = {},
): Promise<SeedResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  const counts = { users: 0, farms: 0, products: 0, orders: 0, reviews: 0 };

  try {
    if (options.clean) {
      await cleanTestData(options.verbose);
    }

    if (options.verbose) console.log("🌱 Seeding essential test data...");

    // Create test users
    if (options.verbose) console.log("  Creating users...");

    const customer = await database.user.create({
      data: UserFactory.customer({
        email: TEST_IDS.customer.email,
      }),
    });
    counts.users++;

    const farmer = await database.user.create({
      data: UserFactory.farmer({
        email: TEST_IDS.farmer.email,
      }),
    });
    counts.users++;

    const admin = await database.user.create({
      data: UserFactory.admin({
        email: TEST_IDS.admin.email,
      }),
    });
    counts.users++;

    // Create test farm
    if (options.verbose) console.log("  Creating farms...");

    const farm = await database.farm.create({
      data: FarmFactory.create(farmer.id, {
        name: "Test Organic Farm",
        slug: TEST_IDS.farm.slug,
      }),
    });
    counts.farms++;

    // Create test products
    if (options.verbose) console.log("  Creating products...");

    const product = await database.product.create({
      data: ProductFactory.vegetable(farm.id, "Fresh Tomatoes"),
    });
    counts.products++;

    if (options.verbose) console.log("✅ Essential data seeded");

    return {
      success: true,
      duration: Date.now() - startTime,
      counts,
      errors,
    };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return {
      success: false,
      duration: Date.now() - startTime,
      counts,
      errors,
    };
  }
}

/**
 * Seed comprehensive test data
 */
export async function seedComprehensiveData(
  options: SeedOptions = {},
): Promise<SeedResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  const counts = { users: 0, farms: 0, products: 0, orders: 0, reviews: 0 };

  try {
    if (options.clean) {
      await cleanTestData(options.verbose);
    }

    if (options.verbose) console.log("🌱 Seeding comprehensive test data...");

    // Seed essential data first
    const essentialResult = await seedEssentialData({
      ...options,
      clean: false,
    });
    Object.assign(counts, essentialResult.counts);

    // Create additional users
    if (options.verbose) console.log("  Creating additional users...");

    const customers = await database.user.createMany({
      data: UserFactory.batch(10, "customer"),
    });
    counts.users += customers.count;

    const farmers = await database.user.createMany({
      data: UserFactory.batch(5, "farmer"),
    });
    counts.users += farmers.count;

    // Get farmer IDs
    const farmerRecords = await database.user.findMany({
      where: { role: "FARMER" },
      select: { id: true },
    });
    const farmerIds = farmerRecords.map((f) => f.id);

    // Create additional farms
    if (options.verbose) console.log("  Creating additional farms...");

    const farmData = FarmFactory.batch(farmerIds, 10);
    for (const data of farmData) {
      await database.farm.create({ data });
      counts.farms++;
    }

    // Get farm IDs
    const farmRecords = await database.farm.findMany({
      select: { id: true },
    });
    const farmIds = farmRecords.map((f) => f.id);

    // Create products
    if (options.verbose) console.log("  Creating products...");

    const productData = ProductFactory.batch(farmIds, 50);
    for (const data of productData) {
      await database.product.create({ data });
      counts.products++;
    }

    // Create orders
    if (options.verbose) console.log("  Creating orders...");

    const customerRecords = await database.user.findMany({
      where: { role: "CONSUMER" },
      select: { id: true },
    });
    const customerIds = customerRecords.map((c) => c.id);

    const productRecords = await database.product.findMany({
      take: 20,
      select: { id: true, price: true, farmId: true },
    });

    for (let i = 0; i < 20; i++) {
      const customerId = customerIds[i % customerIds.length];
      const productRecord = productRecords[i % productRecords.length];
      const items = [
        {
          productId: productRecord.id,
          quantity: Math.floor(Math.random() * 5) + 1,
          price: Number(productRecord.price),
        },
      ];

      await database.order.create({
        data: OrderFactory.completed(customerId, productRecord.farmId, items),
      });
      counts.orders++;
    }

    // Create reviews
    if (options.verbose) console.log("  Creating reviews...");

    for (const farmId of farmIds.slice(0, 5)) {
      const reviewData = ReviewFactory.batch(customerIds, farmId, 5);
      for (const data of reviewData) {
        await database.review.create({ data });
        counts.reviews++;
      }
    }

    if (options.verbose) console.log("✅ Comprehensive data seeded");

    return {
      success: true,
      duration: Date.now() - startTime,
      counts,
      errors,
    };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return {
      success: false,
      duration: Date.now() - startTime,
      counts,
      errors,
    };
  }
}

/**
 * Get seeded test data references
 */
export async function getTestDataReferences() {
  const customer = await database.user.findUnique({
    where: { email: TEST_IDS.customer.email },
  });

  const farmer = await database.user.findUnique({
    where: { email: TEST_IDS.farmer.email },
  });

  const admin = await database.user.findUnique({
    where: { email: TEST_IDS.admin.email },
  });

  const farm = await database.farm.findUnique({
    where: { slug: TEST_IDS.farm.slug },
  });

  const products = await database.product.findMany({
    where: { farmId: farm?.id },
    take: 5,
  });

  return {
    customer,
    farmer,
    admin,
    farm,
    products,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  UserFactory,
  FarmFactory,
  ProductFactory,
  OrderFactory,
  ReviewFactory,
  cleanTestData,
  seedEssentialData,
  seedComprehensiveData,
  getTestDataReferences,
  TEST_IDS,
};
