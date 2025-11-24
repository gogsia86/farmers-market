/**
 * Test Helper Utilities
 * Common utilities for testing
 */

import { mockSession } from "../mocks/next-auth.mock";

/**
 * Create test user data
 */
export const createTestUser = (
  overrides?: Partial<typeof mockSession.user>,
) => ({
  ...mockSession.user,
  ...overrides,
});

/**
 * Create test farm data
 */
export const createTestFarm = (overrides?: any) => ({
  id: "test-farm-id",
  name: "Test Farm",
  slug: "test-farm",
  description: "A test farm",
  address: "123 Test St",
  ownerId: "test-user-id",
  status: "ACTIVE" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Create test product data
 */
export const createTestProduct = (overrides?: any) => ({
  id: "test-product-id",
  name: "Test Product",
  description: "A test product",
  price: 9.99,
  unit: "lb",
  category: "VEGETABLES" as const,
  farmId: "test-farm-id",
  inStock: true,
  quantity: 100,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Wait for async operations
 */
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock API response
 */
export const mockApiResponse = <T>(data: T, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
});
