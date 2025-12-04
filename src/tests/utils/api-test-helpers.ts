/**
 * 🧪 Divine Test Helpers - API Testing Utilities
 * Agricultural-conscious test helpers for API integration tests
 *
 * @reference .github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import { database } from "@/lib/database";
import { Prisma } from "@prisma/client";
import type { User, Farm, Product, Order } from "@prisma/client";
import { hash } from "bcryptjs";

// ============================================================================
// TEST DATA FACTORIES - Divine Agricultural Patterns
// ============================================================================

/**
 * Create a test user with quantum consciousness
 *
 * @param overrides - Partial user data to override defaults
 * @returns Created user entity
 */
export async function createTestUser(
  overrides: Partial<User> = {},
): Promise<User> {
  const timestamp = Date.now();
  const defaultEmail = `test-user-${timestamp}@farmersmarket.test`;

  // Extract JSON fields to cast them properly
  const {
    dietaryPreferences,
    notificationPreferences,
    privacySettings,
    ...restOverrides
  } = overrides;

  return await database.user.create({
    data: {
      email: restOverrides.email || defaultEmail,
      name: restOverrides.name || "Test User",
      password: restOverrides.password || (await hash("TestPassword123!", 10)),
      role: restOverrides.role || "CONSUMER",
      status: restOverrides.status || "ACTIVE",
      emailVerified: restOverrides.emailVerified ?? false,
      emailVerifiedAt: restOverrides.emailVerifiedAt ?? new Date(),
      dietaryPreferences: dietaryPreferences as
        | Prisma.InputJsonValue
        | undefined,
      notificationPreferences: notificationPreferences as
        | Prisma.InputJsonValue
        | undefined,
      privacySettings: privacySettings as Prisma.InputJsonValue | undefined,
      ...restOverrides,
    },
  });
}

/**
 * Create a test farm with biodynamic consciousness
 *
 * @param ownerId - ID of the farm owner (farmer user)
 * @param overrides - Partial farm data to override defaults
 * @returns Created farm entity
 */
export async function createTestFarm(
  ownerId: string,
  overrides: Partial<Farm> = {},
): Promise<Farm> {
  const timestamp = Date.now();
  const defaultName = `Test Farm ${timestamp}`;
  const defaultSlug = `test-farm-${timestamp}`;
  const defaultEmail = `test-farm-${timestamp}@farmersmarket.test`;
  const defaultPhone = `555-${String(timestamp).slice(-7)}`;

  // Extract and convert Json fields to InputJsonValue
  const {
    location,
    payoutSchedule,
    productCategories,
    farmingPractices,
    ...restOverrides
  } = overrides;

  return await database.farm.create({
    data: {
      name: restOverrides.name || defaultName,
      slug: restOverrides.slug || defaultSlug,
      ownerId,
      email: restOverrides.email || defaultEmail,
      phone: restOverrides.phone || defaultPhone,
      description:
        restOverrides.description ||
        "A divine test farm with agricultural consciousness",
      status: restOverrides.status || "ACTIVE",
      address: restOverrides.address || "123 Test Farm Road",
      city: restOverrides.city || "Test City",
      state: restOverrides.state || "CA",
      zipCode: restOverrides.zipCode || "95616",
      country: restOverrides.country || "US",
      latitude: restOverrides.latitude || 38.5449,
      longitude: restOverrides.longitude || -121.7405,
      location: location as Prisma.InputJsonValue | undefined,
      payoutSchedule: payoutSchedule as Prisma.InputJsonValue | undefined,
      productCategories: productCategories as Prisma.InputJsonValue | undefined,
      farmingPractices: farmingPractices as Prisma.InputJsonValue | undefined,
      ...restOverrides,
    },
  });
}

/**
 * Create a test product with seasonal awareness
 * Supports both legacy flat fields and new nested structure for backward compatibility
 *
 * @param farmId - ID of the farm that owns the product
 * @param overrides - Partial product data with legacy or new field format
 * @returns Created product entity
 */
export async function createTestProduct(
  farmId: string,
  overrides: Partial<Product> & {
    // Legacy flat fields for backward compatibility
    price?: number;
    stockQuantity?: number;
    isAvailable?: boolean;
  } = {},
): Promise<Product> {
  const timestamp = Date.now();

  // Handle legacy flat fields - map to nested structure
  const { price, stockQuantity, isAvailable, ...restOverrides } = overrides;

  // Build pricing structure
  const defaultPricing = {
    basePrice: {
      amount: 10.0,
      currency: "USD",
    },
    bulkPricing: [],
  };

  const pricing =
    restOverrides.pricing ||
    (price !== undefined
      ? {
          basePrice: {
            amount: price,
            currency: "USD",
          },
          bulkPricing: [],
        }
      : defaultPricing);

  // Build inventory structure
  const defaultInventory = {
    quantity: 100,
    unit: "lb",
    inStock: true,
    reorderPoint: 10,
    lastRestocked: new Date().toISOString(),
  };

  const inventory =
    restOverrides.inventory ||
    (stockQuantity !== undefined || isAvailable !== undefined
      ? {
          quantity: stockQuantity ?? 100,
          unit: "lb",
          inStock: isAvailable ?? true,
          reorderPoint: 10,
          lastRestocked: new Date().toISOString(),
        }
      : defaultInventory);

  // Build attributes structure
  const defaultAttributes = {
    isOrganic: false,
    isSeasonal: false,
    certifications: [],
  };

  // 4. Create product in database
  return await database.product.create({
    data: {
      farmId,
      name: restOverrides.name || `Divine Product ${timestamp}`,
      slug: restOverrides.slug || `product-${timestamp}`,
      description:
        restOverrides.description ||
        "Divine test product with quantum properties",
      category: restOverrides.category || "VEGETABLES",
      // Flat price field (required by schema)
      price: price ?? 10.0,
      unit: restOverrides.unit || "lb",
      // JSON fields (optional) - cast to InputJsonValue or leave undefined
      pricing: pricing as any,
      inventory: inventory as any,
      attributes: (restOverrides.attributes as any) || defaultAttributes,
      status: restOverrides.status || "ACTIVE",
      ...restOverrides,
    } as any, // Cast to bypass complex Prisma type inference
  });
}

/**
 * Create a test order with divine order consciousness
 *
 * @param customerId - ID of the customer placing the order
 * @param farmId - ID of the farm fulfilling the order
 * @param overrides - Partial order data to override defaults
 * @returns Created order entity
 */
export async function createTestOrder(
  customerId: string,
  farmId: string,
  overrides: Partial<Order> = {},
): Promise<Order> {
  const defaultShippingAddress = {
    fullName: "Test Customer",
    addressLine1: "123 Test Street",
    city: "Test City",
    state: "CA",
    postalCode: "95616",
    country: "US",
  };

  // Extract Json fields and convert to InputJsonValue
  const { shippingAddress, ...restOverrides } = overrides;

  return await database.order.create({
    data: {
      customerId,
      farmId,
      orderNumber: restOverrides.orderNumber || `ORD-${Date.now()}`,
      status: restOverrides.status || "PENDING",
      paymentStatus: restOverrides.paymentStatus || "PENDING",
      // Use correct field names from Prisma schema
      subtotal: restOverrides.subtotal || 45.0,
      deliveryFee: restOverrides.deliveryFee || 1.5,
      platformFee: restOverrides.platformFee || 2.0,
      tax: restOverrides.tax || 3.5,
      discount: restOverrides.discount || 0,
      total: restOverrides.total || 52.0,
      farmerAmount: restOverrides.farmerAmount || 43.0,
      shippingAddress:
        (shippingAddress as Prisma.InputJsonValue) || defaultShippingAddress,
      fulfillmentMethod: restOverrides.fulfillmentMethod || "DELIVERY",
      ...restOverrides,
    },
  });
}

/**
 * Create a complete test scenario with user, farm, and products
 *
 * @returns Object containing created entities
 */
export async function createTestScenario() {
  const farmer = await createTestUser({
    role: "FARMER",
    name: "Test Farmer",
  });

  const customer = await createTestUser({
    role: "CONSUMER",
    name: "Test Customer",
  });

  const farm = await createTestFarm(farmer.id, {
    name: "Divine Test Farm",
  });

  const product1 = await createTestProduct(farm.id, {
    name: "Organic Tomatoes",
    category: "VEGETABLES",
  });

  const product2 = await createTestProduct(farm.id, {
    name: "Fresh Lettuce",
    category: "VEGETABLES",
  });

  return {
    farmer,
    customer,
    farm,
    products: [product1, product2],
  };
}

// ============================================================================
// API REQUEST HELPERS - Quantum HTTP Operations
// ============================================================================

/**
 * Make an authenticated API request with session
 *
 * @param url - URL to request
 * @param options - Fetch options
 * @param userId - User ID for authentication
 * @returns Response object
 */
export async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {},
  userId: string,
): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      // Mock auth header for tests
      "x-test-user-id": userId,
    },
  });
}

/**
 * Parse JSON response from API
 *
 * @param response - Response object
 * @returns Parsed JSON data
 */
export async function parseJsonResponse<T = any>(
  response: Response,
): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${text}`);
  }
}

/**
 * Assert successful API response
 *
 * @param json - Parsed JSON response
 */
export function expectSuccessResponse(json: any) {
  expect(json.success).toBe(true);
  expect(json.data).toBeDefined();
}

/**
 * Assert error API response
 *
 * @param json - Parsed JSON response
 * @param statusCode - Expected status code (optional)
 */
export function expectErrorResponse(json: any, statusCode?: number) {
  expect(json.success).toBe(false);
  expect(json.error).toBeDefined();
  expect(json.error.message).toBeDefined();

  if (statusCode !== undefined) {
    expect(json.error.code).toBeDefined();
  }
}

// ============================================================================
// TEST CLEANUP HELPERS - Divine Housekeeping
// ============================================================================

/**
 * Clean up all test data (DANGEROUS - use in test environment only!)
 * Deletes all test users and their associated data
 */
export async function cleanupTestData(): Promise<void> {
  // Order matters - delete in reverse order of foreign key dependencies
  await database.orderItem.deleteMany({});
  await database.order.deleteMany({});
  await database.product.deleteMany({});
  await database.farm.deleteMany({});
  await database.user.deleteMany({
    where: {
      email: {
        contains: "@farmersmarket.test",
      },
    },
  });
}

/**
 * Clean up specific test user and their data
 *
 * @param userId - ID of user to clean up
 */
export async function cleanupTestUser(userId: string): Promise<void> {
  // Delete orders placed by user
  await database.order.deleteMany({
    where: { customerId: userId },
  });

  // Delete farms owned by user (cascades to products)
  const farms = await database.farm.findMany({
    where: { ownerId: userId },
  });

  for (const farm of farms) {
    await cleanupTestFarm(farm.id);
  }

  // Delete the user
  await database.user.delete({
    where: { id: userId },
  });
}

/**
 * Clean up specific test farm and its data
 *
 * @param farmId - ID of farm to clean up
 */
export async function cleanupTestFarm(farmId: string): Promise<void> {
  // Delete order items for products from this farm
  const products = await database.product.findMany({
    where: { farmId },
    select: { id: true },
  });

  const productIds = products.map((p) => p.id);

  await database.orderItem.deleteMany({
    where: {
      productId: { in: productIds },
    },
  });

  // Delete orders for this farm
  await database.order.deleteMany({
    where: { farmId },
  });

  // Delete products
  await database.product.deleteMany({
    where: { farmId },
  });

  // Delete the farm
  await database.farm.delete({
    where: { id: farmId },
  });
}

// ============================================================================
// ASSERTION HELPERS - Divine Validation
// ============================================================================

/**
 * Assert product has valid structure
 *
 * @param product - Product object to validate
 */
export function expectValidProduct(product: any): void {
  expect(product).toHaveProperty("id");
  expect(product).toHaveProperty("name");
  expect(product).toHaveProperty("farmId");
  expect(product).toHaveProperty("pricing");
  expect(product).toHaveProperty("inventory");
  expect(product).toHaveProperty("category");
  expect(product).toHaveProperty("status");
}

/**
 * Assert farm has valid structure
 *
 * @param farm - Farm object to validate
 */
export function expectValidFarm(farm: any): void {
  expect(farm).toHaveProperty("id");
  expect(farm).toHaveProperty("name");
  expect(farm).toHaveProperty("slug");
  expect(farm).toHaveProperty("ownerId");
  expect(farm).toHaveProperty("status");
  expect(farm).toHaveProperty("address");
  expect(farm).toHaveProperty("city");
  expect(farm).toHaveProperty("state");
}

/**
 * Assert order has valid structure
 *
 * @param order - Order object to validate
 */
export function expectValidOrder(order: any): void {
  expect(order).toHaveProperty("id");
  expect(order).toHaveProperty("customerId");
  expect(order).toHaveProperty("farmId");
  expect(order).toHaveProperty("status");
  expect(order).toHaveProperty("paymentStatus");
  expect(order).toHaveProperty("totalAmount");
  expect(order).toHaveProperty("shippingAddress");
}

/**
 * Assert user has valid structure
 *
 * @param user - User object to validate
 */
export function expectValidUser(user: any): void {
  expect(user).toHaveProperty("id");
  expect(user).toHaveProperty("email");
  expect(user).toHaveProperty("role");
  expect(user).toHaveProperty("status");
}

// ============================================================================
// PAGINATION HELPERS - Quantum List Operations
// ============================================================================

/**
 * Assert pagination metadata is valid
 *
 * @param pagination - Pagination object to validate
 */
export function expectValidPagination(pagination: any): void {
  expect(pagination).toHaveProperty("total");
  expect(pagination).toHaveProperty("limit");
  expect(pagination).toHaveProperty("offset");
  expect(pagination).toHaveProperty("hasMore");

  expect(typeof pagination.total).toBe("number");
  expect(typeof pagination.limit).toBe("number");
  expect(typeof pagination.offset).toBe("number");
  expect(typeof pagination.hasMore).toBe("boolean");

  expect(pagination.total).toBeGreaterThanOrEqual(0);
  expect(pagination.limit).toBeGreaterThan(0);
  expect(pagination.offset).toBeGreaterThanOrEqual(0);
}

// ============================================================================
// AGRICULTURAL HELPERS - Seasonal Consciousness
// ============================================================================

/**
 * Get current season based on month
 *
 * @returns Current season
 */
export function getCurrentSeason(): "SPRING" | "SUMMER" | "FALL" | "WINTER" {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "SPRING";
  if (month >= 5 && month <= 7) return "SUMMER";
  if (month >= 8 && month <= 10) return "FALL";
  return "WINTER";
}

/**
 * Assert response has agricultural consciousness
 *
 * @param response - Response object to validate
 */
export function expectSeasonalConsciousness(response: any): void {
  if (response.agricultural) {
    expect(response.agricultural).toBeDefined();
    expect(response.agricultural.season).toBeDefined();
    expect(["SPRING", "SUMMER", "FALL", "WINTER"]).toContain(
      response.agricultural.season,
    );
  }
}

/**
 * Get seasonal products for testing
 *
 * @param season - Season to get products for
 * @returns Array of seasonal product names
 */
export function getSeasonalProducts(
  season: "SPRING" | "SUMMER" | "FALL" | "WINTER",
): string[] {
  const seasonalProducts: Record<string, string[]> = {
    SPRING: ["Asparagus", "Peas", "Lettuce", "Radishes"],
    SUMMER: ["Tomatoes", "Cucumbers", "Zucchini", "Corn"],
    FALL: ["Pumpkins", "Squash", "Apples", "Kale"],
    WINTER: ["Cabbage", "Brussels Sprouts", "Carrots", "Potatoes"],
  };

  return seasonalProducts[season] || [];
}

// ============================================================================
// WAIT HELPERS - Temporal Manipulation
// ============================================================================

/**
 * Wait for a specified duration
 *
 * @param ms - Milliseconds to wait
 */
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for a condition to be true
 *
 * @param condition - Function that returns boolean
 * @param timeout - Maximum time to wait in ms
 * @param interval - Check interval in ms
 * @returns True if condition met, false if timeout
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100,
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await wait(interval);
  }

  return false;
}

// ============================================================================
// MOCK DATA GENERATORS - Divine Test Fixtures
// ============================================================================

/**
 * Generate random email for testing
 *
 * @returns Random test email
 */
export function generateTestEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@farmersmarket.test`;
}

/**
 * Generate random slug for testing
 *
 * @param prefix - Prefix for the slug
 * @returns Random slug
 */
export function generateTestSlug(prefix: string = "test"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate realistic test address
 *
 * @returns Test address object
 */
export function generateTestAddress() {
  return {
    fullName: "Test User",
    addressLine1: "123 Main Street",
    addressLine2: "Apt 4B",
    city: "Sacramento",
    state: "CA",
    postalCode: "95814",
    country: "US",
    phone: "+1-555-0100",
  };
}

// ============================================================================
// EXPORT ALL FOR CONVENIENCE
// ============================================================================

export default {
  // Factories
  createTestUser,
  createTestFarm,
  createTestProduct,
  createTestOrder,
  createTestScenario,

  // API Helpers
  makeAuthenticatedRequest,
  parseJsonResponse,
  expectSuccessResponse,
  expectErrorResponse,

  // Cleanup
  cleanupTestData,
  cleanupTestUser,
  cleanupTestFarm,

  // Assertions
  expectValidProduct,
  expectValidFarm,
  expectValidOrder,
  expectValidUser,
  expectValidPagination,

  // Agricultural
  getCurrentSeason,
  expectSeasonalConsciousness,
  getSeasonalProducts,

  // Utilities
  wait,
  waitForCondition,
  generateTestEmail,
  generateTestSlug,
  generateTestAddress,
};

// ============================================================================
// ADDITIONAL HELPERS FOR INTEGRATION TESTS
// ============================================================================

/**
 * Generate test JWT token for authenticated requests
 *
 * @param userId - User ID to encode in token
 * @returns Mock JWT token string
 */
export function generateTestToken(userId: string): string {
  // For testing, return a simple mock token
  // In real tests, this might integrate with actual JWT signing
  return `test-token-${userId}`;
}

/**
 * Get test database instance (alias for database)
 *
 * @returns Database instance
 */
export function getTestDatabase() {
  return database;
}

/**
 * Disconnect test database (no-op for Prisma with singleton)
 */
export async function disconnectTestDatabase(): Promise<void> {
  // Prisma handles connection pooling automatically
  // This is a no-op for compatibility with test expectations
  await database.$disconnect();
}

/**
 * Assert API response is successful
 *
 * @param data - Response data object
 */
export function expectApiSuccess(data: any): void {
  expect(data.success).toBe(true);
  expect(data.data).toBeDefined();
}

/**
 * Assert API response is an error
 *
 * @param data - Response data object
 * @param expectedMessage - Expected error message (optional)
 */
export function expectApiError(data: any, expectedMessage?: string): void {
  expect(data.success).toBe(false);
  expect(data.error).toBeDefined();
  expect(data.error.message).toBeDefined();

  if (expectedMessage) {
    expect(data.error.message).toContain(expectedMessage);
  }
}

/**
 * Assert pagination metadata structure and values
 *
 * @param pagination - Pagination object
 * @param expectedPage - Expected page number
 * @param expectedLimit - Expected limit per page
 */
export function expectPaginationMeta(
  pagination: any,
  expectedPage?: number,
  expectedLimit?: number,
): void {
  expect(pagination).toBeDefined();
  expect(pagination).toHaveProperty("total");
  expect(pagination).toHaveProperty("limit");
  expect(pagination).toHaveProperty("offset");
  expect(pagination).toHaveProperty("hasMore");

  if (expectedPage !== undefined) {
    const expectedOffset =
      (expectedPage - 1) * (expectedLimit || pagination.limit);
    expect(pagination.offset).toBe(expectedOffset);
  }

  if (expectedLimit !== undefined) {
    expect(pagination.limit).toBe(expectedLimit);
  }
}
