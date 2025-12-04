/**
 * API Test Helpers
 * Comprehensive utilities for integration and E2E testing
 *
 * @module tests/utils/api-test-helpers
 */

import { PrismaClient } from "@prisma/client";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: "FARMER" | "CUSTOMER" | "ADMIN";
  password?: string;
}

export interface TestFarm {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  description?: string;
  location?: any;
}

export interface TestProduct {
  id: string;
  name: string;
  slug: string;
  farmId: string;
  price: number;
  stockQuantity: number;
  category: string;
  description?: string;
  isAvailable: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: PaginationMeta;
  };
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// Database Test Client
// ============================================================================

let testDb: PrismaClient | null = null;

/**
 * Get or create test database client
 */
export function getTestDatabase(): PrismaClient {
  if (!testDb) {
    const url = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
    testDb = new PrismaClient({
      datasourceUrl: url,
    });
  }
  return testDb;
}

/**
 * Disconnect test database
 */
export async function disconnectTestDatabase(): Promise<void> {
  if (testDb) {
    await testDb.$disconnect();
    testDb = null;
  }
}

// ============================================================================
// Authentication Utilities
// ============================================================================

/**
 * Generate JWT token for testing
 * Note: For tests, we use a simple base64 encoded token
 * In production, use proper JWT with jose or jsonwebtoken
 */
export function generateTestToken(user: TestUser): string {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  // Simple base64 encoding for test tokens
  return `test.${Buffer.from(JSON.stringify(payload)).toString("base64")}.test`;
}

/**
 * Generate expired JWT token for testing
 */
export function generateExpiredToken(user: TestUser): string {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: Math.floor(Date.now() / 1000) - 7200,
    exp: Math.floor(Date.now() / 1000) - 3600,
  };

  // Simple base64 encoding for test tokens
  return `test.${Buffer.from(JSON.stringify(payload)).toString("base64")}.expired`;
}

/**
 * Create authentication headers with JWT token
 */
export function createAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// ============================================================================
// Test Data Factories
// ============================================================================

/**
 * Create a test user in the database
 */
export async function createTestUser(
  overrides?: Partial<TestUser>,
): Promise<TestUser> {
  const db = getTestDatabase();
  const timestamp = Date.now();

  const user = await db.user.create({
    data: {
      email: overrides?.email || `test-user-${timestamp}@example.com`,
      name: overrides?.name || `Test User ${timestamp}`,
      role: overrides?.role || "CUSTOMER",
      password: overrides?.password || "hashed-password-123",
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name || "Test User",
    role: user.role as "FARMER" | "CUSTOMER" | "ADMIN",
  };
}

/**
 * Create a test farm in the database
 */
export async function createTestFarm(
  ownerId: string,
  overrides?: Partial<TestFarm>,
): Promise<TestFarm> {
  const db = getTestDatabase();
  const timestamp = Date.now();

  const farm = await db.farm.create({
    data: {
      name: overrides?.name || `Test Farm ${timestamp}`,
      slug: overrides?.slug || `test-farm-${timestamp}`,
      ownerId,
      description:
        overrides?.description || "A test farm for integration testing",
      email: `farm-${timestamp}@example.com`,
      phone: "555-0100",
      address: "123 Test Street",
      city: "Test City",
      state: "TS",
      zipCode: "12345",
      country: "US",
      status: "ACTIVE",
    },
  });

  return {
    id: farm.id,
    name: farm.name,
    slug: farm.slug,
    ownerId: farm.ownerId,
    description: farm.description || undefined,
    location: farm.location,
  };
}

/**
 * Create a test product in the database
 */
export async function createTestProduct(
  farmId: string,
  overrides?: Partial<TestProduct>,
): Promise<TestProduct> {
  const db = getTestDatabase();
  const timestamp = Date.now();

  const product = await db.product.create({
    data: {
      name: overrides?.name || `Test Product ${timestamp}`,
      slug: overrides?.slug || `test-product-${timestamp}`,
      farmId,
      price: overrides?.price ?? 9.99,
      quantity: overrides?.stockQuantity ?? 100,
      category: (overrides?.category || "VEGETABLES") as any,
      description:
        overrides?.description || "A test product for integration testing",
      status: (overrides?.isAvailable ?? true) ? "ACTIVE" : "OUT_OF_STOCK",
      unit: "lb",
    },
  });

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    farmId: product.farmId,
    price: Number(product.price),
    stockQuantity: product.quantity,
    category: product.category,
    description: product.description || undefined,
    isAvailable: product.status === "ACTIVE",
  };
}

/**
 * Create a complete test setup: user, farm, and products
 */
export async function createCompleteTestSetup() {
  const farmer = await createTestUser({ role: "FARMER" });
  const customer = await createTestUser({ role: "CUSTOMER" });
  const admin = await createTestUser({ role: "ADMIN" });

  const farm = await createTestFarm(farmer.id);

  const products = await Promise.all([
    createTestProduct(farm.id, {
      category: "VEGETABLES",
      price: 4.99,
      name: "Organic Tomatoes",
    }),
    createTestProduct(farm.id, {
      category: "FRUITS",
      price: 6.99,
      name: "Fresh Strawberries",
    }),
    createTestProduct(farm.id, {
      category: "VEGETABLES",
      price: 3.49,
      name: "Green Lettuce",
      isAvailable: false,
    }),
  ]);

  return {
    users: { farmer, customer, admin },
    farm,
    products,
  };
}

// ============================================================================
// Cleanup Utilities
// ============================================================================

/**
 * Clean up test data by user ID
 */
export async function cleanupTestUser(userId: string): Promise<void> {
  const db = getTestDatabase();

  // Delete in order of dependencies
  await db.product.deleteMany({ where: { farm: { ownerId: userId } } });
  await db.farm.deleteMany({ where: { ownerId: userId } });
  await db.user.delete({ where: { id: userId } });
}

/**
 * Clean up test farm and its products
 */
export async function cleanupTestFarm(farmId: string): Promise<void> {
  const db = getTestDatabase();

  await db.product.deleteMany({ where: { farmId } });
  await db.farm.delete({ where: { id: farmId } });
}

/**
 * Clean up test product
 */
export async function cleanupTestProduct(productId: string): Promise<void> {
  const db = getTestDatabase();
  await db.product.delete({ where: { id: productId } });
}

/**
 * Clean up all test data (use with caution!)
 */
export async function cleanupAllTestData(): Promise<void> {
  const db = getTestDatabase();

  // Delete all test-related records
  await db.product.deleteMany({
    where: {
      OR: [
        { name: { contains: "Test Product" } },
        { slug: { contains: "test-product" } },
      ],
    },
  });

  await db.farm.deleteMany({
    where: {
      OR: [
        { name: { contains: "Test Farm" } },
        { slug: { contains: "test-farm" } },
      ],
    },
  });

  await db.user.deleteMany({
    where: {
      email: { contains: "test-user" },
    },
  });
}

// ============================================================================
// HTTP Request Utilities
// ============================================================================

/**
 * Make an authenticated API request (for integration tests)
 */
export async function makeAuthenticatedRequest(
  url: string,
  method: string,
  token: string,
  body?: any,
): Promise<Response> {
  const headers = createAuthHeaders(token);

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    options.body = JSON.stringify(body);
  }

  return fetch(url, options);
}

/**
 * Make an unauthenticated API request
 */
export async function makeUnauthenticatedRequest(
  url: string,
  method: string,
  body?: any,
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    options.body = JSON.stringify(body);
  }

  return fetch(url, options);
}

// ============================================================================
// Response Assertion Utilities
// ============================================================================

/**
 * Assert API success response structure
 */
export function expectApiSuccess<T = any>(
  response: any,
  expectedDataShape?: Partial<T>,
): asserts response is ApiResponse<T> {
  expect(response).toHaveProperty("success", true);
  expect(response).toHaveProperty("data");

  if (expectedDataShape) {
    expect(response.data).toMatchObject(expectedDataShape);
  }
}

/**
 * Assert API error response structure
 */
export function expectApiError(
  response: any,
  expectedErrorCode?: string,
): asserts response is ApiResponse {
  expect(response).toHaveProperty("success", false);
  expect(response).toHaveProperty("error");
  expect(response.error).toHaveProperty("code");
  expect(response.error).toHaveProperty("message");

  if (expectedErrorCode && response.error) {
    expect(response.error.code).toBe(expectedErrorCode);
  }
}

/**
 * Assert validation error response
 */
export function expectValidationError(
  response: any,
  expectedField?: string,
): asserts response is ApiResponse {
  expectApiError(response, "VALIDATION_ERROR");

  if (expectedField) {
    expect(response.error?.details).toBeDefined();
    expect(
      Object.keys(response.error.details).includes(expectedField),
    ).toBeTruthy();
  }
}

/**
 * Assert pagination metadata structure
 */
export function expectPaginationMeta(
  meta: any,
  expectedPage: number,
  expectedPageSize: number,
): asserts meta is PaginationMeta {
  expect(meta).toHaveProperty("page", expectedPage);
  expect(meta).toHaveProperty("pageSize", expectedPageSize);
  expect(meta).toHaveProperty("total");
  expect(meta).toHaveProperty("totalPages");
  expect(typeof meta.total).toBe("number");
  expect(typeof meta.totalPages).toBe("number");
}

/**
 * Assert HTTP status code
 */
export function expectStatusCode(response: Response, expectedStatus: number) {
  expect(response.status).toBe(expectedStatus);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Wait for a specified amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a unique test identifier
 */
export function generateTestId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Create URL with query parameters
 */
export function createUrlWithParams(
  baseUrl: string,
  params: Record<string, string | number | boolean>,
): string {
  const url = new URL(baseUrl, "http://localhost:3001");

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  return url.toString();
}

/**
 * Parse API response as JSON
 */
export async function parseJsonResponse<T = any>(
  response: Response,
): Promise<T> {
  const text = await response.text();

  if (!text) {
    throw new Error("Empty response body");
  }

  try {
    return JSON.parse(text) as T;
  } catch (_error) {
    throw new Error(`Failed to parse JSON response: ${text}`);
  }
}

// ============================================================================
// Performance Testing Utilities
// ============================================================================

/**
 * Measure execution time of a function
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T>,
): Promise<{ result: T; duration: number }> {
  const startTime = performance.now();
  const result = await fn();
  const endTime = performance.now();

  return {
    result,
    duration: endTime - startTime,
  };
}

/**
 * Assert execution time is within threshold
 */
export function expectExecutionTimeBelow(
  duration: number,
  thresholdMs: number,
) {
  expect(duration).toBeLessThan(thresholdMs);
}

/**
 * Run concurrent requests and measure performance
 */
export async function runConcurrentRequests(
  requestFn: () => Promise<any>,
  count: number,
): Promise<{
  results: any[];
  durations: number[];
  avgDuration: number;
  maxDuration: number;
  minDuration: number;
}> {
  const promises = Array.from({ length: count }, async () => {
    return await measureExecutionTime(requestFn);
  });

  const measurements = await Promise.all(promises);
  const results = measurements.map((m) => m.result);
  const durations = measurements.map((m) => m.duration);

  return {
    results,
    durations,
    avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
    maxDuration: Math.max(...durations),
    minDuration: Math.min(...durations),
  };
}

// ============================================================================
// Export All Utilities
// ============================================================================

export default {
  // Database
  getTestDatabase,
  disconnectTestDatabase,

  // Auth
  generateTestToken,
  generateExpiredToken,
  createAuthHeaders,

  // Factories
  createTestUser,
  createTestFarm,
  createTestProduct,
  createCompleteTestSetup,

  // Cleanup
  cleanupTestUser,
  cleanupTestFarm,
  cleanupTestProduct,
  cleanupAllTestData,

  // HTTP Requests
  makeAuthenticatedRequest,
  makeUnauthenticatedRequest,

  // Assertions
  expectApiSuccess,
  expectApiError,
  expectValidationError,
  expectPaginationMeta,
  expectStatusCode,

  // Utilities
  wait,
  generateTestId,
  createUrlWithParams,
  parseJsonResponse,

  // Performance
  measureExecutionTime,
  expectExecutionTimeBelow,
  runConcurrentRequests,
};
