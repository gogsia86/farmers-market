/**
 * INTEGRATION TEST HELPERS
 * Real database operations for integration testing
 *
 * These helpers interact with the actual test database via Prisma.
 * They DO NOT use mocks - they create, read, update, and delete real data.
 *
 * Usage:
 * ```typescript
 * import { createTestUser, createTestFarm, cleanupTestData } from '@/tests/helpers/integration-helpers';
 *
 * describe('API Integration Test', () => {
 *   let testUser;
 *
 *   beforeAll(async () => {
 *     testUser = await createTestUser({ email: 'test@example.com' });
 *   });
 *
 *   afterAll(async () => {
 *     await cleanupTestData();
 *   });
 * });
 * ```
 */

import { PrismaClient } from "@prisma/client";

// Create a fresh Prisma client instance for integration tests
// This bypasses any potential mocking in the module resolution
const prisma = new PrismaClient();

// Track created test data for cleanup
const testDataTracker = {
  users: new Set<string>(),
  farms: new Set<string>(),
  products: new Set<string>(),
  orders: new Set<string>(),
  cartItems: new Set<string>(),
  addresses: new Set<string>(),
};

/**
 * Generate unique test email to avoid conflicts
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `test-${timestamp}-${random}@example.com`;
}

/**
 * Generate unique test ID
 */
export function generateTestId(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================
// USER HELPERS
// ============================================

export interface CreateTestUserInput {
  email?: string;
  name?: string;
  password?: string;
  role?: "CONSUMER" | "FARMER" | "ADMIN";
}

/**
 * Create a test user in the database
 */
export async function createTestUser(input: CreateTestUserInput = {}) {
  const user = await prisma.user.create({
    data: {
      email: input.email ?? generateTestEmail(),
      name: input.name ?? "Test User",
      password: input.password ?? "hashed_test_password",
      role: input.role ?? "CONSUMER",
    },
  });

  testDataTracker.users.add(user.id);
  return user;
}

/**
 * Create multiple test users
 */
export async function createTestUsers(
  count: number,
  input: CreateTestUserInput = {},
) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      ...input,
      email: input.email ? `${i}-${input.email}` : generateTestEmail(),
      name: input.name ? `${input.name} ${i + 1}` : `Test User ${i + 1}`,
    });
    users.push(user);
  }
  return users;
}

/**
 * Get test user by ID
 */
export async function getTestUser(id: string) {
  return await prisma.user.findUnique({
    where: { id },
  });
}

// ============================================
// FARM HELPERS
// ============================================

export interface CreateTestFarmInput {
  name?: string;
  slug?: string;
  description?: string;
  ownerId: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  status?: "ACTIVE" | "INACTIVE" | "PENDING";
}

/**
 * Create a test farm in the database
 */
export async function createTestFarm(input: CreateTestFarmInput) {
  const farmName = input.name ?? "Test Farm";
  const slug =
    input.slug ??
    farmName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

  const farm = await prisma.farm.create({
    data: {
      name: farmName,
      slug,
      description: input.description ?? "A test farm for integration testing",
      ownerId: input.ownerId,
      email: input.email ?? "farm@example.com",
      phone: input.phone ?? "555-0100",
      address: input.address ?? "123 Farm Road",
      city: input.city ?? "Farmville",
      state: input.state ?? "CA",
      zipCode: input.zipCode ?? "12345",
      latitude: input.latitude ?? 37.7749,
      longitude: input.longitude ?? -122.4194,
      status: input.status ?? "PENDING",
    },
  });

  testDataTracker.farms.add(farm.id);
  return farm;
}

/**
 * Create multiple test farms
 */
export async function createTestFarms(count: number, ownerId: string) {
  const farms = [];
  for (let i = 0; i < count; i++) {
    const farm = await createTestFarm({
      name: `Test Farm ${i + 1}`,
      description: `Test farm ${i + 1} description`,
      ownerId,
    });
    farms.push(farm);
  }
  return farms;
}

/**
 * Get test farm by ID
 */
export async function getTestFarm(id: string) {
  return await prisma.farm.findUnique({
    where: { id },
    include: {
      owner: true,
      products: true,
    },
  });
}

// ============================================
// PRODUCT HELPERS
// ============================================

export interface CreateTestProductInput {
  name?: string;
  description?: string;
  price?: number;
  farmId: string;
  category?: string;
  unit?: string;
  quantityAvailable?: number;
  inStock?: boolean;
}

/**
 * Create a test product in the database
 */
export async function createTestProduct(input: CreateTestProductInput) {
  const productName = input.name ?? "Test Product";
  const slug =
    productName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

  const product = await prisma.product.create({
    data: {
      name: productName,
      slug,
      description: input.description ?? "A test product",
      price: input.price ?? 9.99,
      farmId: input.farmId,
      category: input.category ?? "VEGETABLES",
      unit: input.unit ?? "lb",
      quantityAvailable: input.quantityAvailable ?? 100,
      inStock: input.inStock ?? true,
      status: "ACTIVE",
    },
  });

  testDataTracker.products.add(product.id);
  return product;
}

/**
 * Create multiple test products for a farm
 */
export async function createTestProducts(count: number, farmId: string) {
  const products = [];
  for (let i = 0; i < count; i++) {
    const product = await createTestProduct({
      name: `Test Product ${i + 1}`,
      description: `Test product ${i + 1} description`,
      price: 9.99 + i,
      farmId,
      quantityAvailable: 100 + i * 10,
      inStock: true,
    });
    products.push(product);
  }
  return products;
}

/**
 * Get test product by ID
 */
export async function getTestProduct(id: string) {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      farm: true,
    },
  });
}

// ============================================
// CART HELPERS
// ============================================

export interface CreateTestCartItemInput {
  userId: string;
  productId: string;
  quantity?: number;
}

/**
 * Create a test cart item in the database
 */
export async function createTestCartItem(input: CreateTestCartItemInput) {
  const cartItem = await prisma.cartItem.create({
    data: {
      userId: input.userId,
      productId: input.productId,
      quantity: input.quantity ?? 1,
    },
    include: {
      product: true,
    },
  });

  testDataTracker.cartItems.add(cartItem.id);
  return cartItem;
}

/**
 * Get user's cart
 */
export async function getTestUserCart(userId: string) {
  return await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          farm: true,
        },
      },
    },
  });
}

/**
 * Clear user's cart
 */
export async function clearTestUserCart(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
  });

  items.forEach((item) => testDataTracker.cartItems.delete(item.id));

  await prisma.cartItem.deleteMany({
    where: { userId },
  });
}

// ============================================
// ADDRESS HELPERS
// ============================================

export interface CreateTestAddressInput {
  userId: string;
  type?: "SHIPPING" | "BILLING";
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

/**
 * Create a test address in the database
 */
export async function createTestAddress(input: CreateTestAddressInput) {
  const address = await prisma.userAddress.create({
    data: {
      userId: input.userId,
      type: input.type ?? "SHIPPING",
      street: input.street ?? "123 Test Street",
      city: input.city ?? "Test City",
      state: input.state ?? "CA",
      zipCode: input.zipCode ?? "12345",
      country: input.country ?? "US",
    },
  });

  testDataTracker.addresses.add(address.id);
  return address;
}

// ============================================
// ORDER HELPERS
// ============================================

export interface CreateTestOrderInput {
  customerId: string;
  farmId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  status?:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  fulfillmentMethod?: "DELIVERY" | "PICKUP";
}

/**
 * Create a test order with items in the database
 */
export async function createTestOrder(input: CreateTestOrderInput) {
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const deliveryFee = input.fulfillmentMethod === "DELIVERY" ? 5.0 : 0;
  const tax = subtotal * 0.1;
  const platformFee = subtotal * 0.05;
  const total = subtotal + deliveryFee + tax + platformFee;

  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-TEST-${Date.now()}`,
      customerId: input.customerId,
      farmId: input.farmId,
      status: input.status ?? "PENDING",
      paymentStatus: input.paymentStatus ?? "PENDING",
      fulfillmentMethod: input.fulfillmentMethod ?? "DELIVERY",
      subtotal,
      deliveryFee,
      tax,
      platformFee,
      discount: 0,
      total,
      farmerAmount: subtotal * 0.85, // 85% to farmer
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  testDataTracker.orders.add(order.id);
  return order;
}

/**
 * Get test order by ID
 */
export async function getTestOrder(id: string) {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      customer: true,
      farm: true,
    },
  });
}

// ============================================
// CLEANUP HELPERS
// ============================================

/**
 * Clean up all test data created during tests
 * Call this in afterAll() or afterEach()
 */
export async function cleanupTestData() {
  console.log("🧹 Cleaning up test data...");

  try {
    // Delete in order (respecting foreign key constraints)

    // 1. Cart items
    if (testDataTracker.cartItems.size > 0) {
      await prisma.cartItem.deleteMany({
        where: {
          id: { in: Array.from(testDataTracker.cartItems) },
        },
      });
      console.log(`   Deleted ${testDataTracker.cartItems.size} cart items`);
      testDataTracker.cartItems.clear();
    }

    // 2. Order items (cascade delete with orders)
    if (testDataTracker.orders.size > 0) {
      await prisma.order.deleteMany({
        where: {
          id: { in: Array.from(testDataTracker.orders) },
        },
      });
      console.log(`   Deleted ${testDataTracker.orders.size} orders`);
      testDataTracker.orders.clear();
    }

    // 3. Addresses
    if (testDataTracker.addresses.size > 0) {
      await prisma.userAddress.deleteMany({
        where: {
          id: { in: Array.from(testDataTracker.addresses) },
        },
      });
      console.log(`   Deleted ${testDataTracker.addresses.size} addresses`);
      testDataTracker.addresses.clear();
    }

    // 4. Products
    if (testDataTracker.products.size > 0) {
      await prisma.product.deleteMany({
        where: {
          id: { in: Array.from(testDataTracker.products) },
        },
      });
      console.log(`   Deleted ${testDataTracker.products.size} products`);
      testDataTracker.products.clear();
    }

    // 5. Farms
    if (testDataTracker.farms.size > 0) {
      await prisma.farm.deleteMany({
        where: {
          id: { in: Array.from(testDataTracker.farms) },
        },
      });
      console.log(`   Deleted ${testDataTracker.farms.size} farms`);
      testDataTracker.farms.clear();
    }

    // 6. Users (last, as they're referenced by everything)
    if (testDataTracker.users.size > 0) {
      await prisma.user.deleteMany({
        where: {
          id: { in: Array.from(testDataTracker.users) },
        },
      });
      console.log(`   Deleted ${testDataTracker.users.size} users`);
      testDataTracker.users.clear();
    }

    console.log("✅ Test data cleanup complete");
  } catch (error) {
    console.error("❌ Error cleaning up test data:", error);
    throw error;
  }
}

/**
 * Clean up specific test user and all related data
 */
export async function cleanupTestUser(userId: string) {
  // Delete in order (respecting foreign key constraints)
  await prisma.cartItem.deleteMany({ where: { userId } });
  await prisma.userAddress.deleteMany({ where: { userId } });
  await prisma.order.deleteMany({ where: { customerId: userId } });

  // Delete farms owned by user (and their products)
  const farms = await prisma.farm.findMany({ where: { ownerId: userId } });
  for (const farm of farms) {
    await prisma.product.deleteMany({ where: { farmId: farm.id } });
    await prisma.order.deleteMany({ where: { farmId: farm.id } });
    await prisma.farm.delete({ where: { id: farm.id } });
    testDataTracker.farms.delete(farm.id);
  }

  await prisma.user.delete({ where: { id: userId } });
  testDataTracker.users.delete(userId);
}

/**
 * Clean up ALL test data (emergency cleanup)
 * Use with caution - deletes all records with 'test' in identifiers
 */
export async function cleanupAllTestData() {
  console.log("🚨 EMERGENCY CLEANUP - Deleting ALL test data...");

  await prisma.cartItem.deleteMany({
    where: {
      OR: [
        { user: { email: { contains: "test" } } },
        { user: { email: { contains: "example.com" } } },
      ],
    },
  });

  await prisma.order.deleteMany({
    where: {
      OR: [
        { orderNumber: { contains: "TEST" } },
        { customer: { email: { contains: "test" } } },
      ],
    },
  });

  await prisma.product.deleteMany({
    where: {
      name: { contains: "Test" },
    },
  });

  await prisma.farm.deleteMany({
    where: {
      name: { contains: "Test" },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: { contains: "test" },
    },
  });

  // Clear trackers
  testDataTracker.users.clear();
  testDataTracker.farms.clear();
  testDataTracker.products.clear();
  testDataTracker.orders.clear();
  testDataTracker.cartItems.clear();
  testDataTracker.addresses.clear();

  console.log("✅ Emergency cleanup complete");
}

// ============================================
// UTILITY HELPERS
// ============================================

/**
 * Wait for a condition to be true (with timeout)
 */
export async function waitForCondition(
  condition: () => Promise<boolean>,
  options: { timeout?: number; interval?: number } = {},
): Promise<void> {
  const timeout = options.timeout ?? 5000;
  const interval = options.interval ?? 100;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error("Condition not met within timeout");
}

/**
 * Reset database to clean state (for specific table)
 */
export async function resetTable(tableName: keyof typeof prisma) {
  const model = prisma[tableName] as any;
  if (model && typeof model.deleteMany === "function") {
    await model.deleteMany({});
    console.log(`✅ Reset table: ${tableName}`);
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  const [users, farms, products, orders, cartItems] = await Promise.all([
    prisma.user.count(),
    prisma.farm.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.cartItem.count(),
  ]);

  return {
    users,
    farms,
    products,
    orders,
    cartItems,
  };
}
