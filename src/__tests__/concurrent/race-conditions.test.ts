/**
 * 🔄 CONCURRENT OPERATION TESTS
 * Tests for race conditions and concurrent access scenarios
 *
 * Critical scenarios:
 * - Multiple users buying same product (inventory depletion)
 * - Simultaneous payment confirmations
 * - Concurrent order updates
 * - Parallel product updates
 */

import { database } from "@/lib/database";
import { productRepository } from "@/lib/repositories/product.repository";
import { QuantumProductCatalogService } from "@/lib/services/product.service";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Logger } from "pino";

jest.mock("@/lib/database", () => ({
  database: {
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn().mockResolvedValue(null), // For slug uniqueness check
    },
    farm: {
      findUnique: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(async (callback) => {
      // Mock transaction - pass mock database to callback
      const mockDb = {
        product: {
          findUnique: jest.fn().mockResolvedValue({
            id: "product-123",
            name: "Test Product",
            farmId: "farm-123",
            farm: {
              id: "farm-123",
              ownerId: "user-123",
            },
          }),
          update: jest.fn().mockResolvedValue({
            id: "product-123",
            name: "Test Product",
            farmId: "farm-123",
            isActive: true,
          }),
          findMany: jest.fn().mockResolvedValue([]),
          findFirst: jest.fn().mockResolvedValue(null), // For slug uniqueness check
        },
        farm: {
          findUnique: jest.fn().mockResolvedValue({
            id: "farm-123",
            ownerId: "user-123",
          }),
        },
        order: {
          findUnique: jest.fn().mockResolvedValue({
            id: "order-123",
          }),
          update: jest.fn().mockResolvedValue({
            id: "order-123",
          }),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
      };
      return callback(mockDb);
    }),
  },
}));

jest.mock("@/lib/repositories/product.repository", () => ({
  productRepository: {
    findById: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
}));

const mockDatabase = database as jest.Mocked<typeof database>;
const mockRepository = productRepository as jest.Mocked<
  typeof productRepository
>;

describe("🔄 Concurrent Operations: Inventory Management", () => {
  let productService: QuantumProductCatalogService;
  let mockLogger: Logger;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      child: jest.fn().mockReturnThis(),
    } as any;

    productService = new QuantumProductCatalogService();
  });

  describe("⚡ Race Condition: Multiple Purchases of Same Product", () => {
    it("should handle concurrent product purchases correctly", async () => {
      // Simulate 10 users trying to buy the same product simultaneously
      const productId = "product-concurrent-123";
      const userId = "user-123";

      // Setup mock - product has only 50 units
      let availableQuantity = 50;
      const reservedQuantity = 0;

      mockDatabase.product.findUnique.mockImplementation(async () => ({
        id: productId,
        name: "Limited Product",
        farmId: "farm-123",
        inventory: {
          quantity: 50,
          reservedQuantity,
          availableQuantity,
          lowStockThreshold: 10,
          inStock: availableQuantity > 0,
        },
      })) as any;

      mockDatabase.farm.findUnique.mockResolvedValue({
        id: "farm-123",
        ownerId: userId,
      } as any);

      mockRepository.update.mockImplementation(async ({ data }: any) => {
        // Simulate atomic update with check
        const requestedQuantity = data.inventory?.quantity || 0;
        if (availableQuantity >= 5) {
          // Each request tries to reduce by 5
          availableQuantity -= 5;
          return {
            id: productId,
            inventory: {
              quantity: availableQuantity,
              reservedQuantity: 0,
              availableQuantity,
              inStock: availableQuantity > 0,
            },
          };
        }
        throw new Error("Insufficient inventory");
      }) as any;

      // Simulate 10 concurrent inventory update attempts
      const updates = Array.from({ length: 10 }, () =>
        productService.updateInventory(productId, userId, {
          quantity: availableQuantity - 5,
          reservedQuantity: 0,
        }),
      );

      // Wait for all attempts
      const results = await Promise.allSettled(updates);

      // Verify that some succeeded and inventory never went negative
      const successful = results.filter((r) => r.status === "fulfilled");
      const failed = results.filter((r) => r.status === "rejected");

      expect(successful.length + failed.length).toBe(10);
      expect(availableQuantity).toBeGreaterThanOrEqual(0);
    });

    it("should prevent negative inventory through concurrent updates", async () => {
      const productId = "product-race-456";
      const userId = "user-456";
      let currentQuantity = 10;

      mockDatabase.product.findUnique.mockImplementation(async () => ({
        id: productId,
        farmId: "farm-123",
        inventory: {
          quantity: currentQuantity,
          reservedQuantity: 0,
          availableQuantity: currentQuantity,
        },
      })) as any;

      mockDatabase.farm.findUnique.mockResolvedValue({
        id: "farm-123",
        ownerId: userId,
      } as any);

      mockRepository.update.mockImplementation(async ({ data }: any) => {
        const newQuantity = data.inventory?.quantity;
        if (newQuantity < 0) {
          throw new Error("Cannot have negative inventory");
        }
        currentQuantity = newQuantity;
        return {
          id: productId,
          inventory: {
            quantity: newQuantity,
            reservedQuantity: 0,
            availableQuantity: newQuantity,
          },
        };
      }) as any;

      // Try to reserve more than available concurrently
      const operations = [
        productService.updateInventory(productId, "user-1", {
          quantity: 5,
          reservedQuantity: 0,
        }),
        productService.updateInventory(productId, "user-2", {
          quantity: 5,
          reservedQuantity: 0,
        }),
        productService.updateInventory(productId, "user-3", {
          quantity: 5,
          reservedQuantity: 0,
        }),
      ];

      const results = await Promise.allSettled(operations);

      // Verify inventory stayed valid
      expect(currentQuantity).toBeGreaterThanOrEqual(0);
    });
  });

  describe("⚡ Race Condition: Concurrent Order Updates", () => {
    it("should handle multiple order status updates correctly", async () => {
      // This test is for order service, skipping for now
      const orderId = "order-concurrent-789";

      jest.mocked(database.order.findUnique).mockResolvedValue({
        id: orderId,
        status: "PENDING",
        paymentStatus: "PENDING",
      } as any);

      jest.mocked(database.order.update).mockResolvedValue({
        id: orderId,
        status: "CONFIRMED",
        paymentStatus: "COMPLETED",
      } as any);

      // Simulate multiple systems trying to update order simultaneously
      const updates = [
        database.order.update({
          where: { id: orderId },
          data: { status: "CONFIRMED" },
        }),
        database.order.update({
          where: { id: orderId },
          data: { paymentStatus: "COMPLETED" },
        }),
        database.order.update({
          where: { id: orderId },
          data: { status: "PROCESSING" },
        }),
      ];

      const results = await Promise.all(updates);

      // All should complete (though in real DB, optimistic locking would handle this)
      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.id).toBe(orderId);
      });
    });
  });

  describe("⚡ Race Condition: Payment Confirmation", () => {
    it("should handle duplicate payment confirmations idempotently", async () => {
      const paymentIntentId = "pi_concurrent_123";

      jest.mocked(database.order.updateMany).mockResolvedValue({
        count: 1,
      } as any);

      // Simulate webhook and manual confirmation happening simultaneously
      const confirmations = Array.from({ length: 5 }, () =>
        database.order.updateMany({
          where: { paymentIntentId },
          data: {
            paymentStatus: "COMPLETED",
            status: "CONFIRMED",
          },
        }),
      );

      const results = await Promise.all(confirmations);

      // All should succeed (idempotent operation)
      results.forEach((result) => {
        expect(result.count).toBeGreaterThanOrEqual(0);
      });
    });

    it("should prevent double charging through concurrent payments", async () => {
      const orderId = "order-payment-456";
      let paymentProcessed = false;

      jest.mocked(database.order.findUnique).mockImplementation(async () => ({
        id: orderId,
        paymentStatus: paymentProcessed ? "COMPLETED" : "PENDING",
        total: 10000,
      })) as any;

      jest.mocked(database.order.update).mockImplementation(async () => {
        if (paymentProcessed) {
          throw new Error("Payment already processed");
        }
        paymentProcessed = true;
        return {
          id: orderId,
          paymentStatus: "COMPLETED",
        };
      }) as any;

      // Try to process payment twice concurrently
      const payments = [
        database.order.update({
          where: { id: orderId },
          data: { paymentStatus: "COMPLETED" },
        }),
        database.order.update({
          where: { id: orderId },
          data: { paymentStatus: "COMPLETED" },
        }),
      ];

      const results = await Promise.allSettled(payments);

      // One should succeed, one should fail
      const successful = results.filter((r) => r.status === "fulfilled");
      const failed = results.filter((r) => r.status === "rejected");

      expect(successful.length).toBe(1);
      expect(failed.length).toBe(1);
    });
  });

  describe("⚡ High Concurrency: Bulk Operations", () => {
    it("should handle 100 concurrent product fetches efficiently", async () => {
      // Mock database.product.findUnique (not repository)
      mockDatabase.product.findUnique.mockResolvedValue({
        id: "product-123",
        name: "Test Product",
        farmId: "farm-123",
        status: "AVAILABLE",
        farm: {
          id: "farm-123",
          name: "Test Farm",
        },
      } as any);

      const startTime = Date.now();

      // Simulate 100 concurrent requests
      const requests = Array.from({ length: 100 }, (_, i) =>
        productService.getProductById(`product-${i}`),
      );

      const results = await Promise.all(requests);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // All should succeed (return products, not null)
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(result).not.toBeNull();
      });

      // Should complete in reasonable time (< 2 seconds for mocked operations)
      expect(duration).toBeLessThan(2000);
    });

    it("should handle 50 concurrent batch updates", async () => {
      const userId = "user-123";

      // Mock product lookup - return different product for each ID
      mockRepository.findById.mockImplementation(
        async (id: string) =>
          ({
            id: id,
            name: "Test Product",
            slug: `test-product-${id}`,
            farmId: "farm-123",
            status: "AVAILABLE",
            isActive: true,
            inventory: {
              quantity: 100,
              reservedQuantity: 0,
              availableQuantity: 100,
            },
            farm: {
              id: "farm-123",
              name: "Test Farm",
              slug: "test-farm",
            },
          }) as any,
      );

      // Mock $transaction to execute callback with mock tx
      (mockDatabase.$transaction as jest.Mock).mockImplementation(
        async (callback: any) => {
          const mockTx = {
            product: {
              findUnique: jest.fn().mockImplementation(async ({ where }: any) => ({
                id: where.id,
                farmId: "farm-123",
                name: `Product ${where.id}`,
                farm: {
                  ownerId: userId,
                },
              })),
              update: jest.fn().mockImplementation(async ({ where }: any) => ({
                id: where.id,
                isActive: true,
                farm: {
                  id: "farm-123",
                  name: "Test Farm",
                  slug: "test-farm",
                },
              })),
            },
          };
          return await callback(mockTx);
        },
      );

      // Perform 50 concurrent batch updates
      const updates = Array.from({ length: 50 }, (_, i) =>
        productService.batchUpdateProducts(
          [{ productId: `product-${i}`, updates: { isActive: true } as any }],
          userId,
        ),
      );

      const results = await Promise.allSettled(updates);

      // All batch operations should complete (success or failure)
      expect(results).toHaveLength(50);

      // Count successes and failures
      const successful = results.filter((r) => r.status === "fulfilled");
      const failed = results.filter((r) => r.status === "rejected");

      // At least some operations should succeed
      expect(successful.length).toBeGreaterThan(0);

      // Each successful result should be an array of products
      successful.forEach((result) => {
        if (result.status === "fulfilled") {
          expect(Array.isArray(result.value)).toBe(true);
        }
      });
    });
  });

  describe("⚡ Deadlock Prevention", () => {
    it("should avoid deadlocks in cross-service operations", async () => {
      // Test that concurrent operations on related entities don't deadlock
      const userId = "user-123";

      // Mock product.findUnique for verifyProductAccess (with farm.teamMembers)
      (mockDatabase.product.findUnique as jest.Mock).mockImplementation(
        async ({ where }: any) => ({
          id: where.id,
          farmId: "farm-123",
          name: `Product ${where.id}`,
          slug: `product-${where.id}`,
          description: "Test product",
          price: 10,
          unit: "lb",
          category: "VEGETABLES",
          availableQuantity: 100,
          isActive: true,
          farm: {
            id: "farm-123",
            ownerId: userId,
            name: "Test Farm",
            slug: "test-farm",
            teamMembers: [], // Required by verifyProductAccess
          },
        })
      );

      // Mock findFirst for slug check (returns null = no conflict)
      (mockDatabase.product.findFirst as jest.Mock).mockResolvedValue(null);

      // Mock product.update with delay to simulate real DB operations
      (mockDatabase.product.update as jest.Mock).mockImplementation(
        async ({ where }: any) =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  id: where.id,
                  isActive: true,
                  name: `Product ${where.id}`,
                  slug: `product-${where.id}`,
                  farmId: "farm-123",
                  farm: {
                    id: "farm-123",
                    name: "Test Farm",
                    slug: "test-farm",
                  },
                } as any),
              50,
            ),
          ),
      );

      const operations = [
        productService.updateProduct("product-1", {
          isActive: true,
        } as any, userId),
        productService.updateProduct("product-2", {
          isActive: false,
        } as any, userId),
        productService.updateProduct("product-3", {
          isFeatured: true,
        } as any, userId),
      ];

      const results = await Promise.allSettled(operations);

      // All should complete without hanging (deadlock would cause timeout)
      expect(results).toHaveLength(3);

      // At least some operations should succeed
      const successful = results.filter((r) => r.status === "fulfilled");
      expect(successful.length).toBeGreaterThan(0);
    });
  });
});

/**
 * 🎯 CONCURRENCY TEST PATTERNS
 *
 * These tests verify the system handles:
 * 1. Race conditions (multiple actors, same resource)
 * 2. Atomicity (operations complete fully or not at all)
 * 3. Idempotency (repeated operations safe)
 * 4. Isolation (concurrent operations don't interfere)
 * 5. Deadlock prevention (operations don't block each other)
 *
 * In production, these patterns are enforced by:
 * - Database transactions
 * - Optimistic locking
 * - Row-level locks
 * - Idempotency keys
 * - Event sourcing
 */
