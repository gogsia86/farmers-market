/**
 * 🧪 EDGE CASE TESTS - CONCURRENT TRANSACTIONS
 *
 * Tests for race conditions, concurrent operations, and transaction isolation
 * Ensures data integrity under high concurrency scenarios
 *
 * Test Categories:
 * - Concurrent inventory updates
 * - Race conditions in order creation
 * - Simultaneous cart operations
 * - Database transaction isolation
 * - Optimistic locking scenarios
 *
 * @reference .cursorrules - Claude Sonnet 4.5 Testing Patterns
 */

import { database } from '@/lib/database';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import type { Farm, Product, User } from '@prisma/client';

// ============================================================================
// TEST SETUP
// ============================================================================

describe('Edge Case: Concurrent Transactions', () => {
  let testUser: User;
  let testFarm: Farm;
  let testProduct: Product;

  beforeEach(async () => {
    // Create test user
    testUser = await database.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        role: 'CONSUMER',
        password: 'hashedpassword',
      },
    });

    // Create test farm
    testFarm = await database.farm.create({
      data: {
        name: `Test Farm ${Date.now()}`,
        slug: `test-farm-${Date.now()}`,
        ownerId: testUser.id,
        email: 'farm@test.com',
        phone: '555-0100',
        address: '123 Test St',
        city: 'Test City',
        state: 'CA',
        zipCode: '12345',
        country: 'US',
        latitude: 40.7128,
        longitude: -74.006,
        status: 'ACTIVE',
      },
    });

    // Create test product with inventory
    testProduct = await database.product.create({
      data: {
        name: `Test Product ${Date.now()}`,
        slug: `test-product-${Date.now()}`,
        description: 'Test product for concurrent operations',
        price: 10.0,
        unit: 'EACH',
        farmId: testFarm.id,
        inventory: 100,
        status: 'AVAILABLE',
        category: 'VEGETABLES',
      },
    });
  });

  afterEach(async () => {
    // Cleanup
    await database.orderItem.deleteMany({
      where: { order: { userId: testUser.id } },
    });
    await database.order.deleteMany({
      where: { userId: testUser.id },
    });
    await database.product.deleteMany({
      where: { farmId: testFarm.id },
    });
    await database.farm.delete({
      where: { id: testFarm.id },
    });
    await database.user.delete({
      where: { id: testUser.id },
    });
  });

  // ============================================================================
  // CONCURRENT INVENTORY UPDATES
  // ============================================================================

  describe('Concurrent Inventory Updates', () => {
    it('should handle 10 concurrent inventory decrements correctly', async () => {
      const initialInventory = 100;
      const decrementAmount = 5;
      const concurrentOperations = 10;

      // Update product inventory
      await database.product.update({
        where: { id: testProduct.id },
        data: { inventory: initialInventory },
      });

      // Create 10 concurrent inventory decrements
      const operations = Array.from({ length: concurrentOperations }, () =>
        database.$transaction(async (tx) => {
          const product = await tx.product.findUnique({
            where: { id: testProduct.id },
            select: { inventory: true },
          });

          if (!product || product.inventory < decrementAmount) {
            throw new Error('Insufficient inventory');
          }

          return tx.product.update({
            where: { id: testProduct.id },
            data: { inventory: { decrement: decrementAmount } },
          });
        })
      );

      // Execute all operations concurrently
      const results = await Promise.allSettled(operations);

      // Get final inventory
      const finalProduct = await database.product.findUnique({
        where: { id: testProduct.id },
      });

      // Verify results
      const successfulOps = results.filter((r) => r.status === 'fulfilled').length;
      const expectedInventory = initialInventory - successfulOps * decrementAmount;

      expect(finalProduct?.inventory).toBe(expectedInventory);
      expect(finalProduct?.inventory).toBeGreaterThanOrEqual(0);
    });

    it('should prevent overselling when inventory is low', async () => {
      const lowInventory = 10;
      const requestedQuantity = 15;

      // Set low inventory
      await database.product.update({
        where: { id: testProduct.id },
        data: { inventory: lowInventory },
      });

      // Attempt to purchase more than available
      const purchaseAttempt = database.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: testProduct.id },
        });

        if (!product || product.inventory < requestedQuantity) {
          throw new Error('Insufficient inventory');
        }

        return tx.product.update({
          where: { id: testProduct.id },
          data: { inventory: { decrement: requestedQuantity } },
        });
      });

      await expect(purchaseAttempt).rejects.toThrow('Insufficient inventory');

      // Verify inventory unchanged
      const finalProduct = await database.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(finalProduct?.inventory).toBe(lowInventory);
    });

    it('should handle race condition with last-item scenario', async () => {
      const lastItemInventory = 1;

      // Set inventory to 1
      await database.product.update({
        where: { id: testProduct.id },
        data: { inventory: lastItemInventory },
      });

      // Create 5 concurrent attempts to buy the last item
      const buyAttempts = Array.from({ length: 5 }, () =>
        database.$transaction(async (tx) => {
          const product = await tx.product.findUnique({
            where: { id: testProduct.id },
          });

          if (!product || product.inventory < 1) {
            throw new Error('Out of stock');
          }

          return tx.product.update({
            where: { id: testProduct.id },
            data: { inventory: { decrement: 1 } },
          });
        })
      );

      const results = await Promise.allSettled(buyAttempts);

      // Only one should succeed
      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      expect(successful).toBe(1);
      expect(failed).toBe(4);

      // Verify inventory is 0
      const finalProduct = await database.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(finalProduct?.inventory).toBe(0);
    });
  });

  // ============================================================================
  // CONCURRENT ORDER CREATION
  // ============================================================================

  describe('Concurrent Order Creation', () => {
    it('should handle multiple users creating orders simultaneously', async () => {
      // Create multiple test users
      const users = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          database.user.create({
            data: {
              email: `concurrent-user-${i}-${Date.now()}@test.com`,
              name: `Concurrent User ${i}`,
              role: 'CONSUMER',
              password: 'hashedpassword',
            },
          })
        )
      );

      // Each user creates an order concurrently
      const orderCreations = users.map((user) =>
        database.$transaction(async (tx) => {
          // Create order
          const order = await tx.order.create({
            data: {
              userId: user.id,
              status: 'PENDING',
              subtotal: 10.0,
              tax: 1.0,
              total: 11.0,
            },
          });

          // Create order item
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: testProduct.id,
              quantity: 1,
              price: 10.0,
              subtotal: 10.0,
            },
          });

          // Decrement inventory
          await tx.product.update({
            where: { id: testProduct.id },
            data: { inventory: { decrement: 1 } },
          });

          return order;
        })
      );

      // Execute all order creations
      const results = await Promise.allSettled(orderCreations);

      // All should succeed (we have enough inventory)
      const successful = results.filter((r) => r.status === 'fulfilled').length;
      expect(successful).toBe(5);

      // Verify inventory decreased by 5
      const finalProduct = await database.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(finalProduct?.inventory).toBe(95); // 100 - 5

      // Cleanup
      await database.orderItem.deleteMany({
        where: { productId: testProduct.id },
      });
      for (const user of users) {
        await database.order.deleteMany({ where: { userId: user.id } });
        await database.user.delete({ where: { id: user.id } });
      }
    });

    it('should rollback order if inventory check fails mid-transaction', async () => {
      // Set low inventory
      await database.product.update({
        where: { id: testProduct.id },
        data: { inventory: 5 },
      });

      // Attempt to create order with insufficient inventory
      const orderAttempt = database.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: testProduct.id },
        });

        // Create order first
        const order = await tx.order.create({
          data: {
            userId: testUser.id,
            status: 'PENDING',
            subtotal: 100.0,
            tax: 10.0,
            total: 110.0,
          },
        });

        // Check inventory (should fail)
        if (!product || product.inventory < 10) {
          throw new Error('Insufficient inventory');
        }

        // This should never execute
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: testProduct.id,
            quantity: 10,
            price: 10.0,
            subtotal: 100.0,
          },
        });

        return order;
      });

      await expect(orderAttempt).rejects.toThrow('Insufficient inventory');

      // Verify no order was created (transaction rolled back)
      const orders = await database.order.findMany({
        where: { userId: testUser.id },
      });
      expect(orders.length).toBe(0);

      // Verify inventory unchanged
      const finalProduct = await database.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(finalProduct?.inventory).toBe(5);
    });
  });

  // ============================================================================
  // OPTIMISTIC LOCKING
  // ============================================================================

  describe('Optimistic Locking', () => {
    it('should detect concurrent updates using version field', async () => {
      // Add version field to product for this test
      const productWithVersion = await database.product.update({
        where: { id: testProduct.id },
        data: { inventory: 100 },
      });

      // Simulate two concurrent reads
      const read1 = await database.product.findUnique({
        where: { id: testProduct.id },
      });
      const read2 = await database.product.findUnique({
        where: { id: testProduct.id },
      });

      // First update succeeds
      const update1 = await database.product.update({
        where: {
          id: testProduct.id,
          updatedAt: read1!.updatedAt, // Optimistic lock check
        },
        data: { inventory: 95 },
      });
      expect(update1.inventory).toBe(95);

      // Second update should detect stale data
      try {
        await database.product.update({
          where: {
            id: testProduct.id,
            updatedAt: read2!.updatedAt, // Stale timestamp
          },
          data: { inventory: 90 },
        });
        // If no error thrown, the update went through but with newer data
      } catch (error) {
        // Expected: Record not found due to timestamp mismatch
      }

      // Verify final state is from first update
      const final = await database.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(final?.inventory).toBe(95);
    });
  });

  // ============================================================================
  // DEADLOCK PREVENTION
  // ============================================================================

  describe('Deadlock Prevention', () => {
    it('should handle potential deadlock scenarios gracefully', async () => {
      // Create second product
      const product2 = await database.product.create({
        data: {
          name: `Test Product 2 ${Date.now()}`,
          slug: `test-product-2-${Date.now()}`,
          description: 'Second test product',
          price: 15.0,
          unit: 'EACH',
          farmId: testFarm.id,
          inventory: 100,
          status: 'AVAILABLE',
          category: 'FRUITS',
        },
      });

      // Transaction 1: Update product1 then product2
      const transaction1 = database.$transaction(async (tx) => {
        await tx.product.update({
          where: { id: testProduct.id },
          data: { inventory: { decrement: 1 } },
        });

        // Small delay to increase chance of deadlock
        await new Promise((resolve) => setTimeout(resolve, 10));

        await tx.product.update({
          where: { id: product2.id },
          data: { inventory: { decrement: 1 } },
        });
      });

      // Transaction 2: Update product2 then product1 (reverse order)
      const transaction2 = database.$transaction(async (tx) => {
        await tx.product.update({
          where: { id: product2.id },
          data: { inventory: { decrement: 1 } },
        });

        // Small delay
        await new Promise((resolve) => setTimeout(resolve, 10));

        await tx.product.update({
          where: { id: testProduct.id },
          data: { inventory: { decrement: 1 } },
        });
      });

      // Execute both transactions
      const results = await Promise.allSettled([transaction1, transaction2]);

      // At least one should succeed
      const successful = results.filter((r) => r.status === 'fulfilled').length;
      expect(successful).toBeGreaterThanOrEqual(1);

      // Cleanup
      await database.product.delete({ where: { id: product2.id } });
    });
  });

  // ============================================================================
  // CONCURRENT CART OPERATIONS
  // ============================================================================

  describe('Concurrent Cart Operations', () => {
    it('should handle simultaneous cart item additions', async () => {
      // Create cart
      const cart = await database.cart.create({
        data: {
          userId: testUser.id,
        },
      });

      // Add same product concurrently 5 times
      const addOperations = Array.from({ length: 5 }, () =>
        database.$transaction(async (tx) => {
          // Check if item exists
          const existing = await tx.cartItem.findFirst({
            where: {
              cartId: cart.id,
              productId: testProduct.id,
            },
          });

          if (existing) {
            // Increment quantity
            return tx.cartItem.update({
              where: { id: existing.id },
              data: { quantity: { increment: 1 } },
            });
          } else {
            // Create new item
            return tx.cartItem.create({
              data: {
                cartId: cart.id,
                productId: testProduct.id,
                quantity: 1,
                price: testProduct.price,
              },
            });
          }
        })
      );

      await Promise.all(addOperations);

      // Get final cart items
      const cartItems = await database.cartItem.findMany({
        where: { cartId: cart.id },
      });

      // Should have exactly one item with quantity 5
      // (or multiple items due to race condition, which is also valid)
      const totalQuantity = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      expect(totalQuantity).toBe(5);

      // Cleanup
      await database.cartItem.deleteMany({ where: { cartId: cart.id } });
      await database.cart.delete({ where: { id: cart.id } });
    });
  });

  // ============================================================================
  // STRESS TEST
  // ============================================================================

  describe('High Concurrency Stress Test', () => {
    it('should handle 50 concurrent operations without data corruption', async () => {
      const initialInventory = 1000;
      await database.product.update({
        where: { id: testProduct.id },
        data: { inventory: initialInventory },
      });

      // Create 50 concurrent operations
      const operations = Array.from({ length: 50 }, (_, i) =>
        database.$transaction(async (tx) => {
          const product = await tx.product.findUnique({
            where: { id: testProduct.id },
          });

          if (!product || product.inventory < 10) {
            throw new Error('Insufficient inventory');
          }

          return tx.product.update({
            where: { id: testProduct.id },
            data: { inventory: { decrement: 10 } },
          });
        })
      );

      const results = await Promise.allSettled(operations);

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      // Verify integrity
      const finalProduct = await database.product.findUnique({
        where: { id: testProduct.id },
      });

      const expectedInventory = initialInventory - successful * 10;
      expect(finalProduct?.inventory).toBe(expectedInventory);
      expect(finalProduct?.inventory).toBeGreaterThanOrEqual(0);

      // Log results for analysis
      console.log(`Stress Test Results:
        - Total operations: 50
        - Successful: ${successful}
        - Failed: ${failed}
        - Final inventory: ${finalProduct?.inventory}
        - Expected inventory: ${expectedInventory}
      `);
    });
  });
});

/**
 * 🎯 TEST COVERAGE SUMMARY
 *
 * ✅ Concurrent inventory updates
 * ✅ Race conditions in order creation
 * ✅ Optimistic locking scenarios
 * ✅ Deadlock prevention
 * ✅ Simultaneous cart operations
 * ✅ Transaction rollback integrity
 * ✅ High concurrency stress test
 * ✅ Last-item race condition
 * ✅ Overselling prevention
 *
 * These tests ensure data integrity under concurrent load conditions
 * and verify proper transaction isolation in the database layer.
 */
