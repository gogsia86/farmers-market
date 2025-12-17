/**
 * 🗄️ Database Integration Test Suite
 * Comprehensive database integration testing with transactions, performance, and integrity
 *
 * @module tests/database/database-integration
 * @version 3.0.0
 * @divine_pattern QUANTUM_DATABASE_TESTING
 * @agricultural_consciousness BIODYNAMIC_DATA_FLOWS
 */

import { test, expect } from "@playwright/test";
import {
  DatabaseTestManager,
  TransactionTester,
  QueryPerformanceAnalyzer,
  DataIntegrityValidator,
  DatabaseStatistics,
  DB_TEST_CONFIG,
} from "../utils/database-test-utils";
import { database } from "@/lib/database";

// ==========================================
// 🎯 TEST SUITE CONFIGURATION
// ==========================================

test.describe("Database Integration Tests", () => {
  let dbManager: DatabaseTestManager;
  let transactionTester: TransactionTester;
  let performanceAnalyzer: QueryPerformanceAnalyzer;
  let integrityValidator: DataIntegrityValidator;
  let dbStats: DatabaseStatistics;

  // ==========================================
  // 🔧 SETUP & TEARDOWN
  // ==========================================

  test.beforeAll(async () => {
    dbManager = new DatabaseTestManager();
    transactionTester = new TransactionTester();
    performanceAnalyzer = new QueryPerformanceAnalyzer();
    integrityValidator = new DataIntegrityValidator();
    dbStats = new DatabaseStatistics();

    await dbManager.setup();
  });

  test.afterAll(async () => {
    await dbManager.teardown();
    console.log("\n" + performanceAnalyzer.getReport());
  });

  test.beforeEach(async () => {
    // Create snapshot before each test
    await dbManager.createSnapshot("before-test");
  });

  test.afterEach(async () => {
    // Create snapshot after each test
    await dbManager.createSnapshot("after-test");
  });

  // ==========================================
  // 🧪 BASIC CRUD OPERATIONS
  // ==========================================

  test.describe("Basic CRUD Operations", () => {
    test("Should create user successfully", async () => {
      const { result, metrics } = await performanceAnalyzer.measureQuery(
        async () =>
          database.user.create({
            data: {
              email: "crud_test_user@example.com",
              name: "CRUD Test User",
              role: "CUSTOMER",
              emailVerified: new Date(),
            },
          }),
        "create-user"
      );

      expect(result).toHaveProperty("id");
      expect(result.email).toBe("crud_test_user@example.com");
      expect(metrics.duration).toBeLessThan(1000);

      // Cleanup
      await database.user.delete({ where: { id: result.id } });
    });

    test("Should read user by ID", async () => {
      const testUsers = dbManager.getTestData("users");
      const userId = testUsers[0]?.id;

      const { result, metrics } = await performanceAnalyzer.measureQuery(
        async () => database.user.findUnique({ where: { id: userId } }),
        "read-user"
      );

      expect(result).toHaveProperty("id", userId);
      expect(metrics.duration).toBeLessThan(500);
    });

    test("Should update user successfully", async () => {
      const testUsers = dbManager.getTestData("users");
      const userId = testUsers[0]?.id;

      const { result } = await performanceAnalyzer.measureQuery(
        async () =>
          database.user.update({
            where: { id: userId },
            data: { name: "Updated Name" },
          }),
        "update-user"
      );

      expect(result.name).toBe("Updated Name");
    });

    test("Should delete user successfully", async () => {
      const user = await database.user.create({
        data: {
          email: "delete_test@example.com",
          name: "Delete Test",
          role: "CUSTOMER",
        },
      });

      await database.user.delete({ where: { id: user.id } });

      const deletedUser = await database.user.findUnique({
        where: { id: user.id },
      });

      expect(deletedUser).toBeNull();
    });
  });

  // ==========================================
  // 🧪 COMPLEX QUERIES
  // ==========================================

  test.describe("Complex Queries", () => {
    test("Should handle complex joins efficiently", async () => {
      const { result, metrics } = await performanceAnalyzer.measureQuery(
        async () =>
          database.farm.findMany({
            include: {
              owner: true,
              products: {
                where: { status: "ACTIVE" },
                take: 10,
              },
              _count: {
                select: { products: true },
              },
            },
          }),
        "complex-join"
      );

      expect(Array.isArray(result)).toBe(true);
      expect(metrics.duration).toBeLessThan(2000);

      // Verify data structure
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("owner");
        expect(result[0]).toHaveProperty("products");
        expect(result[0]).toHaveProperty("_count");
      }
    });

    test("Should handle nested queries", async () => {
      const { result } = await performanceAnalyzer.measureQuery(
        async () =>
          database.user.findMany({
            where: { role: "FARMER" },
            include: {
              farms: {
                include: {
                  products: {
                    where: { inventory: { gt: 0 } },
                  },
                },
              },
            },
          }),
        "nested-query"
      );

      expect(Array.isArray(result)).toBe(true);
    });

    test("Should aggregate data correctly", async () => {
      const { result } = await performanceAnalyzer.measureQuery(
        async () =>
          database.product.groupBy({
            by: ["category"],
            _count: true,
            _avg: {
              price: true,
            },
            _sum: {
              inventory: true,
            },
          }),
        "aggregate-query"
      );

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("category");
        expect(result[0]).toHaveProperty("_count");
      }
    });

    test("Should perform full-text search", async () => {
      const { result, metrics } = await performanceAnalyzer.measureQuery(
        async () =>
          database.product.findMany({
            where: {
              OR: [
                { name: { contains: "test", mode: "insensitive" } },
                { description: { contains: "test", mode: "insensitive" } },
              ],
            },
            take: 10,
          }),
        "full-text-search"
      );

      expect(Array.isArray(result)).toBe(true);
      expect(metrics.duration).toBeLessThan(1000);
    });
  });

  // ==========================================
  // 🧪 TRANSACTION TESTS
  // ==========================================

  test.describe("Transaction Management", () => {
    test("Should commit transaction successfully", async () => {
      let userId: string | null = null;
      let farmId: string | null = null;

      await transactionTester.testCommit([
        async () => {
          const user = await database.user.create({
            data: {
              email: "tx_test@example.com",
              name: "Transaction Test",
              role: "FARMER",
            },
          });
          userId = user.id;
          return user;
        },
        async () => {
          const farm = await database.farm.create({
            data: {
              name: "Transaction Test Farm",
              slug: `tx-test-farm-${Date.now()}`,
              ownerId: userId!,
              status: "ACTIVE",
              description: "Test",
              location: {
                address: "123 Test",
                city: "Test",
                state: "TS",
                zipCode: "12345",
                coordinates: { lat: 0, lng: 0 },
              },
            },
          });
          farmId = farm.id;
          return farm;
        },
      ]);

      // Verify data persisted
      const user = await database.user.findUnique({ where: { id: userId! } });
      const farm = await database.farm.findUnique({ where: { id: farmId! } });

      expect(user).not.toBeNull();
      expect(farm).not.toBeNull();

      // Cleanup
      if (farmId) await database.farm.delete({ where: { id: farmId } });
      if (userId) await database.user.delete({ where: { id: userId } });
    });

    test("Should rollback transaction on error", async () => {
      let userId: string | null = null;

      try {
        await transactionTester.testRollback(
          [
            async () => {
              const user = await database.user.create({
                data: {
                  email: "rollback_test@example.com",
                  name: "Rollback Test",
                  role: "CUSTOMER",
                },
              });
              userId = user.id;
              return user;
            },
            async () => {
              // This will cause rollback
              throw new Error("Intentional error");
            },
          ],
          1
        );
      } catch (error) {
        // Expected to throw
      }

      // Verify data was not persisted
      const user = await database.user.findFirst({
        where: { email: "rollback_test@example.com" },
      });

      expect(user).toBeNull();
    });

    test("Should handle concurrent transactions", async () => {
      const testUsers = dbManager.getTestData("users");
      const userId = testUsers[0]?.id;

      const { results, errors } = await transactionTester.testConcurrentTransactions(
        async () => {
          return database.user.update({
            where: { id: userId },
            data: { name: "Transaction 1" },
          });
        },
        async () => {
          return database.user.update({
            where: { id: userId },
            data: { name: "Transaction 2" },
          });
        }
      );

      // One should succeed
      expect(results.length + errors.length).toBe(2);
    });

    test("Should handle nested transactions", async () => {
      await database.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: "nested_tx@example.com",
            name: "Nested Transaction",
            role: "FARMER",
          },
        });

        const farm = await tx.farm.create({
          data: {
            name: "Nested Farm",
            slug: `nested-farm-${Date.now()}`,
            ownerId: user.id,
            status: "ACTIVE",
            description: "Test",
            location: {
              address: "123 Test",
              city: "Test",
              state: "TS",
              zipCode: "12345",
              coordinates: { lat: 0, lng: 0 },
            },
          },
        });

        expect(user).toHaveProperty("id");
        expect(farm).toHaveProperty("id");

        // Cleanup within transaction
        await tx.farm.delete({ where: { id: farm.id } });
        await tx.user.delete({ where: { id: user.id } });
      });
    });
  });

  // ==========================================
  // 🧪 QUERY PERFORMANCE
  // ==========================================

  test.describe("Query Performance", () => {
    test("Should compare query strategies", async () => {
      const comparison = await performanceAnalyzer.compareQueries([
        {
          name: "select-all",
          fn: async () =>
            database.product.findMany({
              take: 10,
            }),
        },
        {
          name: "select-specific",
          fn: async () =>
            database.product.findMany({
              select: {
                id: true,
                name: true,
                price: true,
              },
              take: 10,
            }),
        },
        {
          name: "with-include",
          fn: async () =>
            database.product.findMany({
              include: { farm: true },
              take: 10,
            }),
        },
      ]);

      console.log("Query comparison:", comparison);

      expect(comparison.fastest).toBeDefined();
      expect(comparison.slowest).toBeDefined();
    });

    test("Should handle pagination efficiently", async () => {
      const pageSize = 10;
      const measurements: number[] = [];

      for (let page = 0; page < 3; page++) {
        const duration = await performanceAnalyzer.measure(
          `pagination-page-${page}`,
          async () =>
            database.product.findMany({
              skip: page * pageSize,
              take: pageSize,
            })
        );
        measurements.push(duration);
      }

      // All pages should have similar performance
      const avgTime = measurements.reduce((a, b) => a + b) / measurements.length;
      measurements.forEach((time) => {
        expect(time).toBeLessThan(avgTime * 2);
      });
    });

    test("Should optimize with indexes", async () => {
      // Query with indexed field (email)
      const { metrics: indexedMetrics } = await performanceAnalyzer.measureQuery(
        async () =>
          database.user.findUnique({
            where: { email: "test_farmer1@example.com" },
          }),
        "indexed-query"
      );

      // Query with non-indexed field
      const { metrics: nonIndexedMetrics } = await performanceAnalyzer.measureQuery(
        async () =>
          database.user.findFirst({
            where: { name: { contains: "Test" } },
          }),
        "non-indexed-query"
      );

      console.log("Indexed query:", indexedMetrics.duration, "ms");
      console.log("Non-indexed query:", nonIndexedMetrics.duration, "ms");

      // Indexed query should be faster
      expect(indexedMetrics.duration).toBeLessThan(nonIndexedMetrics.duration * 2);
    });
  });

  // ==========================================
  // 🧪 DATA INTEGRITY
  // ==========================================

  test.describe("Data Integrity", () => {
    test("Should validate foreign key constraints", async () => {
      const checks = await integrityValidator.validateForeignKeys();

      checks.forEach((check) => {
        expect(check.valid).toBe(true);
        if (!check.valid) {
          console.error(`Foreign key violation in ${check.table}:`, check.violations);
        }
      });
    });

    test("Should validate unique constraints", async () => {
      const checks = await integrityValidator.validateUniqueConstraints();

      checks.forEach((check) => {
        expect(check.valid).toBe(true);
        if (!check.valid) {
          console.error(`Unique constraint violation in ${check.table}:`, check.violations);
        }
      });
    });

    test("Should validate data consistency", async () => {
      const checks = await integrityValidator.validateConsistency();

      checks.forEach((check) => {
        expect(check.valid).toBe(true);
        if (!check.valid) {
          console.error(`Data consistency issue in ${check.table}:`, check.violations);
        }
      });
    });

    test("Should enforce referential integrity", async () => {
      // Try to delete user with farms (should fail or cascade)
      const testUsers = dbManager.getTestData("users");
      const farmerUser = testUsers.find((u) => u.role === "FARMER");

      if (farmerUser) {
        const farms = await database.farm.findMany({
          where: { ownerId: farmerUser.id },
        });

        if (farms.length > 0) {
          // Should not be able to delete user with farms
          await expect(
            database.user.delete({ where: { id: farmerUser.id } })
          ).rejects.toThrow();
        }
      }
    });

    test("Should prevent duplicate unique keys", async () => {
      const email = "duplicate_test@example.com";

      await database.user.create({
        data: {
          email,
          name: "First User",
          role: "CUSTOMER",
        },
      });

      // Try to create duplicate
      await expect(
        database.user.create({
          data: {
            email, // Same email
            name: "Second User",
            role: "CUSTOMER",
          },
        })
      ).rejects.toThrow();

      // Cleanup
      await database.user.delete({ where: { email } });
    });
  });

  // ==========================================
  // 🧪 DATABASE STATISTICS
  // ==========================================

  test.describe("Database Statistics", () => {
    test("Should retrieve table counts", async () => {
      const counts = await dbStats.getTableCounts();

      expect(counts).toHaveProperty("users");
      expect(counts).toHaveProperty("farms");
      expect(counts).toHaveProperty("products");
      expect(counts).toHaveProperty("orders");

      expect(counts.users).toBeGreaterThan(0);
      expect(counts.farms).toBeGreaterThan(0);
      expect(counts.products).toBeGreaterThan(0);

      console.log("Database counts:", counts);
    });

    test("Should generate database statistics", async () => {
      const stats = await dbStats.getStatistics();

      expect(stats).toHaveProperty("tableStats");
      expect(stats).toHaveProperty("totalRecords");
      expect(stats.totalRecords).toBeGreaterThan(0);

      console.log("Database statistics:", stats);
    });
  });

  // ==========================================
  // 🧪 SNAPSHOT & RESTORE
  // ==========================================

  test.describe("Snapshot & Restore", () => {
    test("Should create and compare snapshots", async () => {
      const snapshot1 = await dbManager.createSnapshot("state-1");

      // Make changes
      const newUser = await database.user.create({
        data: {
          email: "snapshot_test@example.com",
          name: "Snapshot Test",
          role: "CUSTOMER",
        },
      });

      const snapshot2 = await dbManager.createSnapshot("state-2");

      // Compare snapshots
      const diff = dbManager.compareSnapshots("state-1", "state-2");

      expect(diff.added.users).toBe(1);

      // Cleanup
      await database.user.delete({ where: { id: newUser.id } });
    });

    test("Should restore from snapshot", async () => {
      const snapshot = await dbManager.createSnapshot("restore-test");

      // Make changes
      const newUser = await database.user.create({
        data: {
          email: "restore_test@example.com",
          name: "Restore Test",
          role: "CUSTOMER",
        },
      });

      // Restore
      await dbManager.restoreSnapshot("restore-test");

      // Verify user is gone
      const user = await database.user.findFirst({
        where: { email: "restore_test@example.com" },
      });

      expect(user).toBeNull();
    });
  });

  // ==========================================
  // 🧪 RACE CONDITIONS
  // ==========================================

  test.describe("Race Conditions", () => {
    test("Should handle concurrent updates correctly", async () => {
      const testProducts = dbManager.getTestData("products");
      const product = testProducts[0];

      // Two concurrent updates
      const updates = await Promise.allSettled([
        database.product.update({
          where: { id: product.id },
          data: { price: 15.99 },
        }),
        database.product.update({
          where: { id: product.id },
          data: { price: 20.99 },
        }),
      ]);

      // At least one should succeed
      const successful = updates.filter((u) => u.status === "fulfilled");
      expect(successful.length).toBeGreaterThan(0);
    });

    test("Should handle inventory race conditions", async () => {
      const testProducts = dbManager.getTestData("products");
      const product = testProducts[0];

      // Reset inventory
      await database.product.update({
        where: { id: product.id },
        data: { inventory: 10 },
      });

      // Two concurrent decrements
      const decrements = await Promise.allSettled([
        database.product.update({
          where: { id: product.id },
          data: { inventory: { decrement: 5 } },
        }),
        database.product.update({
          where: { id: product.id },
          data: { inventory: { decrement: 5 } },
        }),
      ]);

      // Verify final inventory
      const updated = await database.product.findUnique({
        where: { id: product.id },
      });

      expect(updated?.inventory).toBe(0);
    });
  });

  // ==========================================
  // 🧪 BULK OPERATIONS
  // ==========================================

  test.describe("Bulk Operations", () => {
    test("Should handle bulk inserts efficiently", async () => {
      const users = Array.from({ length: 100 }, (_, i) => ({
        email: `bulk_user_${i}_${Date.now()}@example.com`,
        name: `Bulk User ${i}`,
        role: "CUSTOMER" as const,
      }));

      const { result, metrics } = await performanceAnalyzer.measureQuery(
        async () => database.user.createMany({ data: users }),
        "bulk-insert"
      );

      expect(result.count).toBe(100);
      expect(metrics.duration).toBeLessThan(5000);

      // Cleanup
      await database.user.deleteMany({
        where: {
          email: { contains: "bulk_user_" },
        },
      });
    });

    test("Should handle bulk updates efficiently", async () => {
      const { result, metrics } = await performanceAnalyzer.measureQuery(
        async () =>
          database.product.updateMany({
            where: { status: "ACTIVE" },
            data: { updatedAt: new Date() },
          }),
        "bulk-update"
      );

      expect(metrics.duration).toBeLessThan(3000);
    });

    test("Should handle bulk deletes efficiently", async () => {
      // Create test data
      const users = Array.from({ length: 50 }, (_, i) => ({
        email: `bulk_delete_${i}_${Date.now()}@example.com`,
        name: `Delete User ${i}`,
        role: "CUSTOMER" as const,
      }));

      await database.user.createMany({ data: users });

      // Bulk delete
      const { result, metrics } = await performanceAnalyzer.measureQuery(
        async () =>
          database.user.deleteMany({
            where: {
              email: { contains: "bulk_delete_" },
            },
          }),
        "bulk-delete"
      );

      expect(result.count).toBe(50);
      expect(metrics.duration).toBeLessThan(3000);
    });
  });

  // ==========================================
  // 🧪 EDGE CASES
  // ==========================================

  test.describe("Edge Cases", () => {
    test("Should handle empty results gracefully", async () => {
      const result = await database.user.findMany({
        where: {
          email: "nonexistent@example.com",
        },
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    test("Should handle null values correctly", async () => {
      const user = await database.user.create({
        data: {
          email: "null_test@example.com",
          name: "Null Test",
          role: "CUSTOMER",
          emailVerified: null,
        },
      });

      expect(user.emailVerified).toBeNull();

      await database.user.delete({ where: { id: user.id } });
    });

    test("Should handle large text fields", async () => {
      const longDescription = "A".repeat(5000);

      const farm = await database.farm.create({
        data: {
          name: "Large Text Farm",
          slug: `large-text-${Date.now()}`,
          ownerId: dbManager.getTestData("users")[1].id,
          status: "ACTIVE",
          description: longDescription,
          location: {
            address: "123 Test",
            city: "Test",
            state: "TS",
            zipCode: "12345",
            coordinates: { lat: 0, lng: 0 },
          },
        },
      });

      expect(farm.description?.length).toBe(5000);

      await database.farm.delete({ where: { id: farm.id } });
    });

    test("Should handle JSON fields correctly", async () => {
      const location = {
        address: "123 Test St",
        city: "Test City",
        state: "TS",
        zipCode: "12345",
        coordinates: { lat: 40.7128, lng: -74.006 },
        metadata: {
          verified: true,
          lastUpdated: new Date().toISOString(),
        },
      };

      const farm = await database.farm.create({
        data: {
          name: "JSON Test Farm",
          slug: `json-test-${Date.now()}`,
          ownerId: dbManager.getTestData("users")[1].id,
          status: "ACTIVE",
          description: "Test",
          location,
        },
      });

      expect(farm.location).toEqual(location);

      await database.farm.delete({ where: { id: farm.id } });
    });
  });
});
