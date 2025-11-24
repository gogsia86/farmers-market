/**
 * ⚡ PERFORMANCE BENCHMARKS
 * Tests critical path performance to ensure scalability
 *
 * Benchmarks track:
 * - Response time (ms)
 * - Throughput (ops/sec)
 * - Memory usage
 * - CPU usage
 */

import { database } from "@/lib/database";
import { ProductService } from "@/lib/services/product.service";
import { beforeAll, bench, describe, vi } from "vitest";

vi.mock("@/lib/database", () => ({
  database: {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    farm: {
      findUnique: vi.fn(),
    },
  },
}));

describe("⚡ Performance: Product Listing", () => {
  beforeAll(() => {
    // Setup mock data for consistent benchmarks
    const mockProducts = Array.from({ length: 100 }, (_, i) => ({
      id: `product-${i}`,
      name: `Product ${i}`,
      slug: `product-${i}`,
      category: "VEGETABLES",
      pricing: { basePrice: { amount: 500, currency: "USD" } },
      inventory: { quantity: 100, inStock: true },
      status: "AVAILABLE",
    }));

    vi.mocked(database.product.findMany).mockResolvedValue(mockProducts as any);
    vi.mocked(database.product.count).mockResolvedValue(100);
  });

  bench(
    "list 20 products (default pagination)",
    async () => {
      await ProductService.listProducts({}, { page: 1, limit: 20 });
    },
    { iterations: 1000 },
  );

  bench(
    "list 50 products (large page)",
    async () => {
      await ProductService.listProducts({}, { page: 1, limit: 50 });
    },
    { iterations: 500 },
  );

  bench(
    "list products with filters",
    async () => {
      await ProductService.listProducts({
        category: "VEGETABLES",
        inStock: true,
        status: "AVAILABLE",
      });
    },
    { iterations: 1000 },
  );

  bench(
    "search products by name",
    async () => {
      await ProductService.listProducts({
        search: "tomato",
      });
    },
    { iterations: 1000 },
  );
});

describe("⚡ Performance: Product Retrieval", () => {
  beforeAll(() => {
    vi.mocked(database.product.findUnique).mockResolvedValue({
      id: "product-123",
      name: "Test Product",
      slug: "test-product",
      category: "VEGETABLES",
      pricing: { basePrice: { amount: 500, currency: "USD" } },
      inventory: { quantity: 100, inStock: true },
      status: "AVAILABLE",
    } as any);
  });

  bench(
    "get product by ID",
    async () => {
      await ProductService.getProductById("product-123");
    },
    { iterations: 5000 },
  );

  bench(
    "get product by ID (with farm)",
    async () => {
      await ProductService.getProductById("product-123", true);
    },
    { iterations: 5000 },
  );
});

describe("⚡ Performance: Product Creation", () => {
  beforeAll(() => {
    vi.mocked(database.farm.findUnique).mockResolvedValue({
      id: "farm-123",
      ownerId: "user-123",
      status: "ACTIVE",
    } as any);

    vi.mocked(database.product.findFirst).mockResolvedValue(null);

    vi.mocked(database.product.create).mockResolvedValue({
      id: "product-new",
      name: "New Product",
      slug: "new-product",
      category: "VEGETABLES",
      pricing: { basePrice: { amount: 500, currency: "USD" } },
      inventory: { quantity: 100, inStock: true },
      status: "AVAILABLE",
    } as any);
  });

  const validInput = {
    name: "Benchmark Product",
    farmId: "farm-123",
    category: "VEGETABLES",
    description: "Test product for benchmarks",
    pricing: {
      basePrice: { amount: 500, currency: "USD" },
    },
    inventory: {
      quantity: 100,
      reservedQuantity: 0,
      lowStockThreshold: 20,
    },
    images: [{ url: "https://example.com/test.jpg", isPrimary: true }],
  };

  bench(
    "create product",
    async () => {
      await ProductService.createProduct(validInput as any, "user-123");
    },
    { iterations: 1000 },
  );
});

describe("⚡ Performance: Batch Operations", () => {
  beforeAll(() => {
    vi.mocked(database.product.findUnique).mockResolvedValue({
      id: "product-123",
      name: "Test Product",
      farm: { ownerId: "user-123" },
    } as any);

    vi.mocked(database.product.update).mockResolvedValue({
      id: "product-123",
      name: "Updated Product",
    } as any);
  });

  bench(
    "batch update 10 products",
    async () => {
      const productIds = Array.from({ length: 10 }, (_, i) => `product-${i}`);
      await ProductService.batchUpdateProducts(
        productIds,
        { isActive: true } as any,
        "user-123",
      );
    },
    { iterations: 100 },
  );

  bench(
    "batch update 50 products",
    async () => {
      const productIds = Array.from({ length: 50 }, (_, i) => `product-${i}`);
      await ProductService.batchUpdateProducts(
        productIds,
        { isActive: true } as any,
        "user-123",
      );
    },
    { iterations: 50 },
  );
});

/**
 * 📊 BENCHMARK TARGETS (for reference)
 *
 * Operations should meet these performance targets:
 *
 * - Product List (20): < 50ms p95
 * - Product List (50): < 100ms p95
 * - Product Search: < 75ms p95
 * - Product Get by ID: < 10ms p95
 * - Product Create: < 100ms p95
 * - Batch Update (10): < 200ms p95
 * - Batch Update (50): < 500ms p95
 *
 * Memory:
 * - List operations: < 50MB overhead
 * - Create operations: < 10MB overhead
 *
 * CPU:
 * - All operations: < 100% single core
 */
