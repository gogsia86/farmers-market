/**
 * 🛒 PRODUCT SERVICE TEST HELPER
 *
 * Provides properly configured mocks for product service tests
 * that use the repository pattern
 */

import {
  mockProductRepository,
  resetAllRepositoryMocks,
} from "../mocks/repositories";

// Mock the repository before importing the service
jest.mock("@/lib/repositories/product.repository", () => ({
  productRepository: mockProductRepository,
}));

// ============================================================================
// SETUP FUNCTIONS
// ============================================================================

export function setupProductServiceMocks() {
  beforeEach(() => {
    resetAllRepositoryMocks();
  });
}

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

export function createMockProduct(overrides = {}) {
  return {
    id: "product-123",
    name: "Organic Tomatoes",
    slug: "organic-tomatoes",
    description: "Fresh organic tomatoes",
    farmId: "farm-123",
    status: "AVAILABLE",
    pricing: {
      basePrice: { amount: 599, currency: "USD" },
    },
    inventory: {
      quantity: 100,
      reservedQuantity: 0,
      availableQuantity: 100,
      lowStockThreshold: 10,
      isLowStock: false,
    },
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockFarm(overrides = {}) {
  return {
    id: "farm-123",
    name: "Test Farm",
    ownerId: "user-123",
    status: "ACTIVE",
    ...overrides,
  };
}

// ============================================================================
// DUMMY TEST TO PREVENT JEST EMPTY SUITE ERROR
// ============================================================================

describe("Product Service Test Helper", () => {
  it("exports helper functions", () => {
    expect(typeof setupProductServiceMocks).toBe("function");
    expect(typeof createMockProduct).toBe("function");
    expect(typeof createMockFarm).toBe("function");
  });
});

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
import { setupProductServiceMocks, createMockProduct } from '@/__tests__/helpers/product-service';
import { mockProductRepository } from '@/__tests__/mocks/repositories';
import { ProductService } from '@/lib/services/product.service';

describe('ProductService', () => {
  setupProductServiceMocks();

  it('should create product', async () => {
    const mockProduct = createMockProduct();
    mockProductRepository.manifestProduct.mockResolvedValue(mockProduct);

    const result = await ProductService.createProduct(
      { name: 'Test', farmId: 'farm-123' },
      'user-123'
    );

    expect(result).toEqual(mockProduct);
  });
});
*/
