/**
 * 🌱 INTEGRATION TEST DATABASE SEEDING
 *
 * Provides deterministic test data fixtures for integration tests.
 * Seeds the test database with known data for predictable assertions.
 *
 * @pattern Database Fixtures for Integration Testing
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import {
  PrismaClient,
  ProductCategory,
  UserRole,
  FarmStatus,
  OrderStatus,
} from "@prisma/client";
import * as bcrypt from "bcryptjs";

// Get Prisma client from test setup
let prisma: PrismaClient;

/**
 * Test data IDs - Fixed UUIDs for deterministic testing
 */
export const TEST_IDS = {
  // Users
  ADMIN_USER: "test-admin-00000000-0000-0000-0000-000000000001",
  FARMER_USER_1: "test-farmer-0000-0000-0000-0000-000000000001",
  FARMER_USER_2: "test-farmer-0000-0000-0000-0000-000000000002",
  CUSTOMER_USER_1: "test-customer-000-0000-0000-0000-000000000001",
  CUSTOMER_USER_2: "test-customer-000-0000-0000-0000-000000000002",

  // Farms
  FARM_1: "test-farm-00000000-0000-0000-0000-000000000001",
  FARM_2: "test-farm-00000000-0000-0000-0000-000000000002",

  // Products
  PRODUCT_TOMATOES: "test-product-000-0000-0000-0000-000000000001",
  PRODUCT_LETTUCE: "test-product-000-0000-0000-0000-000000000002",
  PRODUCT_CARROTS: "test-product-000-0000-0000-0000-000000000003",
  PRODUCT_EGGS: "test-product-000-0000-0000-0000-000000000004",
  PRODUCT_HONEY: "test-product-000-0000-0000-0000-000000000005",
  PRODUCT_OUT_OF_STOCK: "test-product-000-0000-0000-0000-000000000006",

  // Orders
  ORDER_PENDING: "test-order-0000-0000-0000-0000-000000000001",
  ORDER_COMPLETED: "test-order-0000-0000-0000-0000-000000000002",
  ORDER_CANCELLED: "test-order-0000-0000-0000-0000-000000000003",
} as const;

/**
 * Test credentials
 */
export const TEST_CREDENTIALS = {
  ADMIN: {
    email: "admin@test.farmersmarket.app",
    password: "TestAdmin123!",
  },
  FARMER_1: {
    email: "farmer1@test.farmersmarket.app",
    password: "TestFarmer123!",
  },
  FARMER_2: {
    email: "farmer2@test.farmersmarket.app",
    password: "TestFarmer123!",
  },
  CUSTOMER_1: {
    email: "customer1@test.farmersmarket.app",
    password: "TestCustomer123!",
  },
  CUSTOMER_2: {
    email: "customer2@test.farmersmarket.app",
    password: "TestCustomer123!",
  },
} as const;

/**
 * Initialize Prisma client for seeding
 */
export async function initializeSeedClient(
  client?: PrismaClient,
): Promise<void> {
  if (client) {
    prisma = client;
  } else {
    prisma = new PrismaClient();
    await prisma.$connect();
  }
}

/**
 * Disconnect seed client
 */
export async function disconnectSeedClient(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}

/**
 * Seed test users
 */
export async function seedTestUsers(): Promise<void> {
  console.log("👥 Seeding test users...");

  // Admin user
  await prisma.user.upsert({
    where: { id: TEST_IDS.ADMIN_USER },
    update: {},
    create: {
      id: TEST_IDS.ADMIN_USER,
      email: TEST_CREDENTIALS.ADMIN.email,
      password: await bcrypt.hash(TEST_CREDENTIALS.ADMIN.password, 12),
      firstName: "Test",
      lastName: "Admin",
      role: "ADMIN" as UserRole,
      status: "ACTIVE",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  // Farmer users
  await prisma.user.upsert({
    where: { id: TEST_IDS.FARMER_USER_1 },
    update: {},
    create: {
      id: TEST_IDS.FARMER_USER_1,
      email: TEST_CREDENTIALS.FARMER_1.email,
      password: await bcrypt.hash(TEST_CREDENTIALS.FARMER_1.password, 12),
      firstName: "John",
      lastName: "Farmer",
      role: "FARMER" as UserRole,
      status: "ACTIVE",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { id: TEST_IDS.FARMER_USER_2 },
    update: {},
    create: {
      id: TEST_IDS.FARMER_USER_2,
      email: TEST_CREDENTIALS.FARMER_2.email,
      password: await bcrypt.hash(TEST_CREDENTIALS.FARMER_2.password, 12),
      firstName: "Sarah",
      lastName: "Green",
      role: "FARMER" as UserRole,
      status: "ACTIVE",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  // Customer users
  await prisma.user.upsert({
    where: { id: TEST_IDS.CUSTOMER_USER_1 },
    update: {},
    create: {
      id: TEST_IDS.CUSTOMER_USER_1,
      email: TEST_CREDENTIALS.CUSTOMER_1.email,
      password: await bcrypt.hash(TEST_CREDENTIALS.CUSTOMER_1.password, 12),
      firstName: "Jane",
      lastName: "Customer",
      role: "CONSUMER" as UserRole,
      status: "ACTIVE",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { id: TEST_IDS.CUSTOMER_USER_2 },
    update: {},
    create: {
      id: TEST_IDS.CUSTOMER_USER_2,
      email: TEST_CREDENTIALS.CUSTOMER_2.email,
      password: await bcrypt.hash(TEST_CREDENTIALS.CUSTOMER_2.password, 12),
      firstName: "Bob",
      lastName: "Buyer",
      role: "CONSUMER" as UserRole,
      status: "ACTIVE",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log("✅ Created 5 test users");
}

/**
 * Seed test farms
 */
export async function seedTestFarms(): Promise<void> {
  console.log("🏡 Seeding test farms...");

  await prisma.farm.upsert({
    where: { id: TEST_IDS.FARM_1 },
    update: {},
    create: {
      id: TEST_IDS.FARM_1,
      name: "Integration Test Farm Alpha",
      slug: "integration-test-farm-alpha",
      description: "Primary test farm for integration testing",
      ownerId: TEST_IDS.FARMER_USER_1,
      email: "alpha@testfarm.app",
      phone: "+1-555-TEST-001",
      address: "123 Test Farm Road",
      city: "Testville",
      state: "CA",
      zipCode: "90210",
      country: "US",
      latitude: 37.7749,
      longitude: -122.4194,
      status: "ACTIVE" as FarmStatus,
      verificationStatus: "VERIFIED",
      images: [],
      certificationsArray: ["ORGANIC", "NON_GMO"],
    },
  });

  await prisma.farm.upsert({
    where: { id: TEST_IDS.FARM_2 },
    update: {},
    create: {
      id: TEST_IDS.FARM_2,
      name: "Integration Test Farm Beta",
      slug: "integration-test-farm-beta",
      description: "Secondary test farm for integration testing",
      ownerId: TEST_IDS.FARMER_USER_2,
      email: "beta@testfarm.app",
      phone: "+1-555-TEST-002",
      address: "456 Test Farm Lane",
      city: "Testburg",
      state: "WA",
      zipCode: "98001",
      country: "US",
      latitude: 47.6062,
      longitude: -122.3321,
      status: "ACTIVE" as FarmStatus,
      verificationStatus: "VERIFIED",
      images: [],
      certificationsArray: ["ORGANIC"],
    },
  });

  console.log("✅ Created 2 test farms");
}

/**
 * Seed test products
 */
export async function seedTestProducts(): Promise<void> {
  console.log("🥬 Seeding test products...");

  const products = [
    {
      id: TEST_IDS.PRODUCT_TOMATOES,
      farmId: TEST_IDS.FARM_1,
      name: "Test Organic Tomatoes",
      slug: "test-organic-tomatoes",
      description: "Fresh organic tomatoes for integration testing",
      category: "VEGETABLES" as ProductCategory,
      price: 4.99,
      unit: "lb",
      quantityAvailable: 100,
      inStock: true,
      organic: true,
    },
    {
      id: TEST_IDS.PRODUCT_LETTUCE,
      farmId: TEST_IDS.FARM_1,
      name: "Test Fresh Lettuce",
      slug: "test-fresh-lettuce",
      description: "Crispy lettuce for integration testing",
      category: "VEGETABLES" as ProductCategory,
      price: 2.99,
      unit: "head",
      quantityAvailable: 50,
      inStock: true,
      organic: true,
    },
    {
      id: TEST_IDS.PRODUCT_CARROTS,
      farmId: TEST_IDS.FARM_1,
      name: "Test Organic Carrots",
      slug: "test-organic-carrots",
      description: "Sweet carrots for integration testing",
      category: "VEGETABLES" as ProductCategory,
      price: 3.49,
      unit: "lb",
      quantityAvailable: 75,
      inStock: true,
      organic: true,
    },
    {
      id: TEST_IDS.PRODUCT_EGGS,
      farmId: TEST_IDS.FARM_2,
      name: "Test Farm Fresh Eggs",
      slug: "test-farm-fresh-eggs",
      description: "Free-range eggs for integration testing",
      category: "DAIRY" as ProductCategory,
      price: 6.99,
      unit: "dozen",
      quantityAvailable: 30,
      inStock: true,
      organic: false,
    },
    {
      id: TEST_IDS.PRODUCT_HONEY,
      farmId: TEST_IDS.FARM_2,
      name: "Test Local Honey",
      slug: "test-local-honey",
      description: "Pure local honey for integration testing",
      category: "PANTRY" as ProductCategory,
      price: 12.99,
      unit: "jar",
      quantityAvailable: 20,
      inStock: true,
      organic: true,
    },
    {
      id: TEST_IDS.PRODUCT_OUT_OF_STOCK,
      farmId: TEST_IDS.FARM_1,
      name: "Test Out of Stock Item",
      slug: "test-out-of-stock-item",
      description: "Product that is out of stock for testing",
      category: "VEGETABLES" as ProductCategory,
      price: 9.99,
      unit: "lb",
      quantityAvailable: 0,
      inStock: false,
      organic: false,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        id: product.id,
        farmId: product.farmId,
        name: product.name,
        slug: product.slug,
        description: product.description,
        category: product.category,
        price: product.price,
        unit: product.unit,
        quantityAvailable: product.quantityAvailable,
        inStock: product.inStock,
        organic: product.organic,
        status: "ACTIVE",
      },
    });
  }

  console.log(`✅ Created ${products.length} test products`);
}

/**
 * Seed test orders
 */
export async function seedTestOrders(): Promise<void> {
  console.log("📦 Seeding test orders...");

  // Pending order
  await prisma.order.upsert({
    where: { id: TEST_IDS.ORDER_PENDING },
    update: {},
    create: {
      id: TEST_IDS.ORDER_PENDING,
      orderNumber: "TEST-ORD-001",
      customerId: TEST_IDS.CUSTOMER_USER_1,
      farmId: TEST_IDS.FARM_1,
      status: "PENDING" as OrderStatus,
      paymentStatus: "PENDING",
      subtotal: 14.97,
      tax: 1.35,
      deliveryFee: 5.0,
      platformFee: 1.5,
      farmerAmount: 13.47,
      total: 21.32,
      fulfillmentMethod: "DELIVERY",
      shippingAddress: {
        fullName: "Jane Customer",
        addressLine1: "789 Customer St",
        city: "Testville",
        state: "CA",
        postalCode: "90210",
        country: "US",
      },
      items: {
        create: [
          {
            productId: TEST_IDS.PRODUCT_TOMATOES,
            productName: "Test Organic Tomatoes",
            quantity: 2,
            unit: "lb",
            unitPrice: 4.99,
            subtotal: 9.98,
          },
          {
            productId: TEST_IDS.PRODUCT_LETTUCE,
            productName: "Test Fresh Lettuce",
            quantity: 1,
            unit: "head",
            unitPrice: 2.99,
            subtotal: 2.99,
          },
        ],
      },
    },
  });

  // Completed order
  await prisma.order.upsert({
    where: { id: TEST_IDS.ORDER_COMPLETED },
    update: {},
    create: {
      id: TEST_IDS.ORDER_COMPLETED,
      orderNumber: "TEST-ORD-002",
      customerId: TEST_IDS.CUSTOMER_USER_1,
      farmId: TEST_IDS.FARM_2,
      status: "DELIVERED" as OrderStatus,
      paymentStatus: "PAID",
      subtotal: 19.98,
      tax: 1.8,
      deliveryFee: 0,
      platformFee: 2.0,
      farmerAmount: 17.98,
      total: 21.78,
      fulfillmentMethod: "FARM_PICKUP",
      shippingAddress: {
        fullName: "Jane Customer",
        addressLine1: "789 Customer St",
        city: "Testville",
        state: "CA",
        postalCode: "90210",
        country: "US",
      },
      items: {
        create: [
          {
            productId: TEST_IDS.PRODUCT_EGGS,
            productName: "Test Farm Fresh Eggs",
            quantity: 2,
            unit: "dozen",
            unitPrice: 6.99,
            subtotal: 13.98,
          },
        ],
      },
    },
  });

  // Cancelled order
  await prisma.order.upsert({
    where: { id: TEST_IDS.ORDER_CANCELLED },
    update: {},
    create: {
      id: TEST_IDS.ORDER_CANCELLED,
      orderNumber: "TEST-ORD-003",
      customerId: TEST_IDS.CUSTOMER_USER_2,
      farmId: TEST_IDS.FARM_1,
      status: "CANCELLED" as OrderStatus,
      paymentStatus: "REFUNDED",
      subtotal: 3.49,
      tax: 0.31,
      deliveryFee: 5.0,
      platformFee: 0.35,
      farmerAmount: 3.14,
      total: 8.8,
      fulfillmentMethod: "DELIVERY",
      shippingAddress: {
        fullName: "Bob Buyer",
        addressLine1: "456 Buyer Ave",
        city: "Testburg",
        state: "WA",
        postalCode: "98001",
        country: "US",
      },
      items: {
        create: [
          {
            productId: TEST_IDS.PRODUCT_CARROTS,
            productName: "Test Organic Carrots",
            quantity: 1,
            unit: "lb",
            unitPrice: 3.49,
            subtotal: 3.49,
          },
        ],
      },
    },
  });

  console.log("✅ Created 3 test orders");
}

/**
 * Seed test reviews
 */
export async function seedTestReviews(): Promise<void> {
  console.log("⭐ Seeding test reviews...");

  await prisma.review.createMany({
    data: [
      {
        farmId: TEST_IDS.FARM_1,
        customerId: TEST_IDS.CUSTOMER_USER_1,
        rating: 5,
        reviewText: "Excellent produce! Very fresh and organic.",
        status: "APPROVED",
      },
      {
        farmId: TEST_IDS.FARM_1,
        customerId: TEST_IDS.CUSTOMER_USER_2,
        rating: 4,
        reviewText: "Good quality, fast delivery.",
        status: "APPROVED",
      },
      {
        farmId: TEST_IDS.FARM_2,
        customerId: TEST_IDS.CUSTOMER_USER_1,
        rating: 5,
        reviewText: "Best eggs in the area!",
        status: "APPROVED",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Created 3 test reviews");
}

/**
 * Seed cart items for testing
 */
export async function seedTestCartItems(): Promise<void> {
  console.log("🛒 Seeding test cart items...");

  await prisma.cartItem.createMany({
    data: [
      {
        userId: TEST_IDS.CUSTOMER_USER_1,
        productId: TEST_IDS.PRODUCT_TOMATOES,
        farmId: TEST_IDS.FARM_1,
        quantity: 3,
        unit: "lb",
        priceAtAdd: 4.99,
        reservedUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      },
      {
        userId: TEST_IDS.CUSTOMER_USER_1,
        productId: TEST_IDS.PRODUCT_HONEY,
        farmId: TEST_IDS.FARM_2,
        quantity: 1,
        unit: "jar",
        priceAtAdd: 12.99,
        reservedUntil: new Date(Date.now() + 30 * 60 * 1000),
      },
      {
        userId: TEST_IDS.CUSTOMER_USER_2,
        productId: TEST_IDS.PRODUCT_EGGS,
        farmId: TEST_IDS.FARM_2,
        quantity: 2,
        unit: "dozen",
        priceAtAdd: 6.99,
        reservedUntil: new Date(Date.now() + 30 * 60 * 1000),
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Created 3 test cart items");
}

/**
 * Main seeding function - seeds all test data
 */
export async function seedTestDatabase(client?: PrismaClient): Promise<void> {
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║  🌱 Seeding Integration Test Database                       ║",
  );
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );

  await initializeSeedClient(client);

  try {
    // Seed in order of dependencies
    await seedTestUsers();
    await seedTestFarms();
    await seedTestProducts();
    await seedTestOrders();
    await seedTestReviews();
    await seedTestCartItems();

    console.log(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║  ✅ Integration Test Database Seeded Successfully          ║",
    );
    console.log(
      "╠════════════════════════════════════════════════════════════╣",
    );
    console.log(
      "║  Test Credentials:                                         ║",
    );
    console.log(`║  • Admin:    ${TEST_CREDENTIALS.ADMIN.email}     ║`);
    console.log(`║  • Farmer:   ${TEST_CREDENTIALS.FARMER_1.email}   ║`);
    console.log(`║  • Customer: ${TEST_CREDENTIALS.CUSTOMER_1.email} ║`);
    console.log(
      "╚════════════════════════════════════════════════════════════╝\n",
    );
  } finally {
    if (!client) {
      await disconnectSeedClient();
    }
  }
}

/**
 * Minimal seeding for quick tests
 */
export async function seedMinimalTestData(
  client?: PrismaClient,
): Promise<void> {
  console.log("🌱 Seeding minimal test data...");

  await initializeSeedClient(client);

  try {
    await seedTestUsers();
    await seedTestFarms();
    await seedTestProducts();
    console.log("✅ Minimal test data seeded");
  } finally {
    if (!client) {
      await disconnectSeedClient();
    }
  }
}

/**
 * Export test data getters for use in tests
 */
export const TestData = {
  IDs: TEST_IDS,
  Credentials: TEST_CREDENTIALS,

  async getUser(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  },

  async getFarm(farmId: string) {
    return prisma.farm.findUnique({
      where: { id: farmId },
      include: { products: true, owner: true },
    });
  },

  async getProduct(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
      include: { farm: true },
    });
  },

  async getOrder(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, customer: true, farm: true },
    });
  },

  async getCartItems(userId: string) {
    return prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
  },
};

// Run if executed directly
if (require.main === module) {
  seedTestDatabase()
    .then(() => {
      console.log("🎉 Seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

export default seedTestDatabase;
