/**
 * 🎭 REPOSITORY MOCKS
 *
 * Centralized mock setup for repository layer testing
 * Use these mocks in tests that interact with repositories
 */

import type { Product, Farm } from "@prisma/client";

// ============================================================================
// PRODUCT REPOSITORY MOCK
// ============================================================================

export const mockProductRepository = {
  manifestProduct: jest.fn(),
  findById: jest.fn(),
  findMany: jest.fn(),
  findFirst: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  searchProducts: jest.fn(),
};

// ============================================================================
// FARM REPOSITORY MOCK
// ============================================================================

export const mockFarmRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findMany: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

// ============================================================================
// MOCK RESET HELPER
// ============================================================================

export function resetAllRepositoryMocks() {
  Object.values(mockProductRepository).forEach((mock: any) => {
    if (typeof mock === "function" && "mockReset" in mock) {
      (mock as jest.Mock).mockReset();
    }
  });

  Object.values(mockFarmRepository).forEach((mock: any) => {
    if (typeof mock === "function" && "mockReset" in mock) {
      (mock as jest.Mock).mockReset();
    }
  });
}

// ============================================================================
// DUMMY TEST TO PREVENT JEST EMPTY SUITE ERROR
// ============================================================================

describe("Repository Mocks", () => {
  it("exports mock repository objects", () => {
    expect(mockProductRepository).toBeDefined();
    expect(mockFarmRepository).toBeDefined();
    expect(typeof resetAllRepositoryMocks).toBe("function");
  });
});

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
// In your test file:
import { mockProductRepository, resetAllRepositoryMocks } from '@/tests/mocks/repositories';

jest.mock('@/lib/repositories/product.repository', () => ({
  productRepository: mockProductRepository
}));

describe('ProductService', () => {
  beforeEach(() => {
    resetAllRepositoryMocks();
  });

  it('should create product', async () => {
    mockProductRepository.manifestProduct.mockResolvedValue(mockProduct);
    // ... test code
  });
});
*/
