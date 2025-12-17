/**
 * 🗄️ Database Testing Utilities
 * Comprehensive utilities for database integration testing
 *
 * @module tests/utils/database-test-utils
 * @version 3.0.0
 * @divine_pattern QUANTUM_DATABASE_TESTING
 * @agricultural_consciousness BIODYNAMIC_DATA_FLOWS
 */

import { database } from "@/lib/database";
import type { Prisma } from "@prisma/client";

// ==========================================
// 🎯 DATABASE CONFIGURATION
// ==========================================

export const DB_TEST_CONFIG = {
  timeouts: {
    query: 5000,
    transaction: 10000,
    migration: 30000,
  },
  isolation: {
    levels: [
      "READ UNCOMMITTED",
      "READ COMMITTED",
      "REPEATABLE READ",
      "SERIALIZABLE",
    ] as const,
  },
  cleanup: {
    order: ["Order", "Product", "Farm", "User"] as const,
  },
} as const;

// ==========================================
// 🧬 TYPE DEFINITIONS
// ==========================================

export interface DatabaseSnapshot {
  users: any[];
  farms: any[];
  products: any[];
  orders: any[];
  timestamp: Date;
}

export interface QueryPerformanceMetrics {
  duration: number;
  rowsAffected: number;
  query: string;
  timestamp: Date;
}

export interface TransactionTestConfig {
  isolationLevel?: string;
  timeout?: number;
  operations: Array<() => Promise<any>>;
  expectedResult?: "COMMIT" | "ROLLBACK";
}

export interface DataIntegrityCheck {
  table: string;
  constraint: string;
  valid: boolean;
  violations?: any[];
}

export interface DatabaseStats {
  tableStats: Record<string, TableStats>;
  totalRecords: number;
  totalSize: number;
}

export interface TableStats {
  count: number;
  size: number;
  indexes: number;
}

// ==========================================
// 🎭 DATABASE TEST MANAGER
// ==========================================

export class DatabaseTestManager {
  private snapshots: Map<string, DatabaseSnapshot> = new Map();
  private testData: Map<string, any[]> = new Map();

  /**
   * Setup test database
   */
  async setup(): Promise<void> {
    await this.cleanDatabase();
    await this.seedTestData();
  }

  /**
   * Teardown test database
   */
  async teardown(): Promise<void> {
    await this.cleanDatabase();
    this.snapshots.clear();
    this.testData.clear();
  }

  /**
   * Clean all test data from database
   */
  async cleanDatabase(): Promise<void> {
    // Clean in reverse dependency order
    await database.orderItem.deleteMany({});
    await database.order.deleteMany({});
    await database.product.deleteMany({});
    await database.farm.deleteMany({});
    await database.user.deleteMany({
      where: {
        email: {
          contains: "test_",
        },
      },
    });
  }

  /**
   * Seed test data
   */
  async seedTestData(): Promise<void> {
    // Create test users
    const users = await this.createTestUsers();
    this.testData.set("users", users);

    // Create test farms
    const farms = await this.createTestFarms(users);
    this.testData.set("farms", farms);

    // Create test products
    const products = await this.createTestProducts(farms);
    this.testData.set("products", products);
  }

  /**
   * Create test users
   */
  private async createTestUsers(): Promise<any[]> {
    const users = [];

    // Admin user
    users.push(
      await database.user.create({
        data: {
          email: "test_admin@example.com",
          name: "Test Admin",
          role: "ADMIN",
          emailVerified: new Date(),
        },
      }),
    );

    // Farmer users
    for (let i = 1; i <= 3; i++) {
      users.push(
        await database.user.create({
          data: {
            email: `test_farmer${i}@example.com`,
            name: `Test Farmer ${i}`,
            role: "FARMER",
            emailVerified: new Date(),
          },
        }),
      );
    }

    // Customer users
    for (let i = 1; i <= 5; i++) {
      users.push(
        await database.user.create({
          data: {
            email: `test_customer${i}@example.com`,
            name: `Test Customer ${i}`,
            role: "CUSTOMER",
            emailVerified: new Date(),
          },
        }),
      );
    }

    return users;
  }

  /**
   * Create test farms
   */
  private async createTestFarms(users: any[]): Promise<any[]> {
    const farmers = users.filter((u) => u.role === "FARMER");
    const farms = [];

    for (let i = 0; i < farmers.length; i++) {
      farms.push(
        await database.farm.create({
          data: {
            name: `Test Farm ${i + 1}`,
            slug: `test-farm-${i + 1}`,
            ownerId: farmers[i].id,
            status: "ACTIVE",
            description: `Test farm ${i + 1} description`,
            location: {
              address: `${i + 1}23 Test St`,
              city: "Test City",
              state: "TS",
              zipCode: "12345",
              coordinates: { lat: 40.7128, lng: -74.006 },
            },
          },
        }),
      );
    }

    return farms;
  }

  /**
   * Create test products
   */
  private async createTestProducts(farms: any[]): Promise<any[]> {
    const products = [];
    const categories = ["VEGETABLES", "FRUITS", "DAIRY", "MEAT", "PANTRY"];

    for (const farm of farms) {
      for (let i = 0; i < 5; i++) {
        products.push(
          await database.product.create({
            data: {
              name: `Test Product ${products.length + 1}`,
              farmId: farm.id,
              description: `Test product description`,
              price: 9.99 + i,
              inventory: 100,
              category: categories[i % categories.length],
              unit: "lb",
              status: "ACTIVE",
            },
          }),
        );
      }
    }

    return products;
  }

  /**
   * Get test data
   */
  getTestData<T = any>(key: string): T[] {
    return this.testData.get(key) || [];
  }

  /**
   * Create database snapshot
   */
  async createSnapshot(name: string): Promise<DatabaseSnapshot> {
    const snapshot: DatabaseSnapshot = {
      users: await database.user.findMany(),
      farms: await database.farm.findMany(),
      products: await database.product.findMany(),
      orders: await database.order.findMany(),
      timestamp: new Date(),
    };

    this.snapshots.set(name, snapshot);
    return snapshot;
  }

  /**
   * Restore database from snapshot
   */
  async restoreSnapshot(name: string): Promise<void> {
    const snapshot = this.snapshots.get(name);
    if (!snapshot) {
      throw new Error(`Snapshot ${name} not found`);
    }

    await this.cleanDatabase();

    // Restore in dependency order
    await database.user.createMany({ data: snapshot.users });
    await database.farm.createMany({ data: snapshot.farms });
    await database.product.createMany({ data: snapshot.products });
    // Note: Orders require more complex restoration due to relations
  }

  /**
   * Compare snapshots
   */
  compareSnapshots(
    snapshot1: string,
    snapshot2: string,
  ): {
    added: Record<string, number>;
    removed: Record<string, number>;
    modified: Record<string, number>;
  } {
    const snap1 = this.snapshots.get(snapshot1);
    const snap2 = this.snapshots.get(snapshot2);

    if (!snap1 || !snap2) {
      throw new Error("One or both snapshots not found");
    }

    return {
      added: {
        users: snap2.users.length - snap1.users.length,
        farms: snap2.farms.length - snap1.farms.length,
        products: snap2.products.length - snap1.products.length,
        orders: snap2.orders.length - snap1.orders.length,
      },
      removed: {
        users: Math.max(0, snap1.users.length - snap2.users.length),
        farms: Math.max(0, snap1.farms.length - snap2.farms.length),
        products: Math.max(0, snap1.products.length - snap2.products.length),
        orders: Math.max(0, snap1.orders.length - snap2.orders.length),
      },
      modified: {
        users: 0, // Would need deep comparison
        farms: 0,
        products: 0,
        orders: 0,
      },
    };
  }
}

// ==========================================
// 🔄 TRANSACTION TESTER
// ==========================================

export class TransactionTester {
  /**
   * Test transaction commit
   */
  async testCommit(operations: Array<() => Promise<any>>): Promise<void> {
    await database.$transaction(async (tx) => {
      for (const operation of operations) {
        await operation();
      }
    });
  }

  /**
   * Test transaction rollback
   */
  async testRollback(
    operations: Array<() => Promise<any>>,
    errorIndex: number,
  ): Promise<void> {
    try {
      await database.$transaction(async (tx) => {
        for (let i = 0; i < operations.length; i++) {
          if (i === errorIndex) {
            throw new Error("Intentional rollback");
          }
          await operations[i]();
        }
      });
    } catch (error) {
      // Expected to throw
    }
  }

  /**
   * Test concurrent transactions
   */
  async testConcurrentTransactions(
    transaction1: () => Promise<any>,
    transaction2: () => Promise<any>,
  ): Promise<{ results: any[]; errors: Error[] }> {
    const results: any[] = [];
    const errors: Error[] = [];

    const promises = [
      transaction1()
        .then((r) => results.push(r))
        .catch((e) => errors.push(e)),
      transaction2()
        .then((r) => results.push(r))
        .catch((e) => errors.push(e)),
    ];

    await Promise.all(promises);

    return { results, errors };
  }

  /**
   * Test transaction isolation levels
   */
  async testIsolationLevel(
    level:
      | "READ UNCOMMITTED"
      | "READ COMMITTED"
      | "REPEATABLE READ"
      | "SERIALIZABLE",
    operation: () => Promise<any>,
  ): Promise<any> {
    // Note: Prisma doesn't directly support isolation levels
    // This would require raw SQL execution
    return await database.$transaction(async (tx) => {
      await tx.$executeRaw`SET TRANSACTION ISOLATION LEVEL ${Prisma.raw(level)}`;
      return await operation();
    });
  }

  /**
   * Test deadlock detection
   */
  async testDeadlock(): Promise<{ deadlockDetected: boolean; error?: Error }> {
    try {
      // Create two transactions that will deadlock
      const tx1 = database.$transaction(async (tx) => {
        const user1 = await tx.user.findFirst();
        await new Promise((resolve) => setTimeout(resolve, 100));
        const user2 = await tx.user.findFirst({ skip: 1 });
      });

      const tx2 = database.$transaction(async (tx) => {
        const user2 = await tx.user.findFirst({ skip: 1 });
        await new Promise((resolve) => setTimeout(resolve, 100));
        const user1 = await tx.user.findFirst();
      });

      await Promise.all([tx1, tx2]);

      return { deadlockDetected: false };
    } catch (error) {
      return {
        deadlockDetected: true,
        error: error as Error,
      };
    }
  }
}

// ==========================================
// 📊 QUERY PERFORMANCE ANALYZER
// ==========================================

export class QueryPerformanceAnalyzer {
  private metrics: QueryPerformanceMetrics[] = [];

  /**
   * Measure query performance
   */
  async measureQuery<T>(
    queryFn: () => Promise<T>,
    queryName: string,
  ): Promise<{ result: T; metrics: QueryPerformanceMetrics }> {
    const startTime = Date.now();
    const result = await queryFn();
    const duration = Date.now() - startTime;

    const metrics: QueryPerformanceMetrics = {
      duration,
      rowsAffected: Array.isArray(result) ? result.length : 1,
      query: queryName,
      timestamp: new Date(),
    };

    this.metrics.push(metrics);

    return { result, metrics };
  }

  /**
   * Compare query performance
   */
  async compareQueries(
    queries: Array<{ name: string; fn: () => Promise<any> }>,
  ): Promise<{
    fastest: string;
    slowest: string;
    results: Record<string, QueryPerformanceMetrics>;
  }> {
    const results: Record<string, QueryPerformanceMetrics> = {};

    for (const query of queries) {
      const { metrics } = await this.measureQuery(query.fn, query.name);
      results[query.name] = metrics;
    }

    const sorted = Object.entries(results).sort(
      ([, a], [, b]) => a.duration - b.duration,
    );

    return {
      fastest: sorted[0][0],
      slowest: sorted[sorted.length - 1][0],
      results,
    };
  }

  /**
   * Test query with different data sizes
   */
  async testScalability(
    setupFn: (count: number) => Promise<void>,
    queryFn: () => Promise<any>,
    dataSizes: number[],
  ): Promise<Record<number, QueryPerformanceMetrics>> {
    const results: Record<number, QueryPerformanceMetrics> = {};

    for (const size of dataSizes) {
      await setupFn(size);
      const { metrics } = await this.measureQuery(queryFn, `size-${size}`);
      results[size] = metrics;
    }

    return results;
  }

  /**
   * Get performance report
   */
  getReport(): string {
    let report = "📊 Query Performance Report\n\n";

    this.metrics.forEach((metric) => {
      report += `Query: ${metric.query}\n`;
      report += `  Duration: ${metric.duration}ms\n`;
      report += `  Rows: ${metric.rowsAffected}\n`;
      report += `  Timestamp: ${metric.timestamp.toISOString()}\n\n`;
    });

    return report;
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics = [];
  }
}

// ==========================================
// 🔍 DATA INTEGRITY VALIDATOR
// ==========================================

export class DataIntegrityValidator {
  /**
   * Validate foreign key constraints
   */
  async validateForeignKeys(): Promise<DataIntegrityCheck[]> {
    const checks: DataIntegrityCheck[] = [];

    // Check farm-user relationship
    const farmsWithoutOwner = await database.farm.findMany({
      where: {
        owner: null,
      },
    });

    checks.push({
      table: "Farm",
      constraint: "owner_id_fkey",
      valid: farmsWithoutOwner.length === 0,
      violations: farmsWithoutOwner,
    });

    // Check product-farm relationship
    const productsWithoutFarm = await database.product.findMany({
      where: {
        farm: null,
      },
    });

    checks.push({
      table: "Product",
      constraint: "farm_id_fkey",
      valid: productsWithoutFarm.length === 0,
      violations: productsWithoutFarm,
    });

    return checks;
  }

  /**
   * Validate unique constraints
   */
  async validateUniqueConstraints(): Promise<DataIntegrityCheck[]> {
    const checks: DataIntegrityCheck[] = [];

    // Check duplicate emails
    const emailGroups = await database.user.groupBy({
      by: ["email"],
      _count: true,
      having: {
        email: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    checks.push({
      table: "User",
      constraint: "email_unique",
      valid: emailGroups.length === 0,
      violations: emailGroups,
    });

    // Check duplicate farm slugs
    const slugGroups = await database.farm.groupBy({
      by: ["slug"],
      _count: true,
      having: {
        slug: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    checks.push({
      table: "Farm",
      constraint: "slug_unique",
      valid: slugGroups.length === 0,
      violations: slugGroups,
    });

    return checks;
  }

  /**
   * Validate data consistency
   */
  async validateConsistency(): Promise<DataIntegrityCheck[]> {
    const checks: DataIntegrityCheck[] = [];

    // Check negative inventory
    const negativeInventory = await database.product.findMany({
      where: {
        inventory: {
          lt: 0,
        },
      },
    });

    checks.push({
      table: "Product",
      constraint: "inventory_non_negative",
      valid: negativeInventory.length === 0,
      violations: negativeInventory,
    });

    // Check negative prices
    const negativePrices = await database.product.findMany({
      where: {
        price: {
          lt: 0,
        },
      },
    });

    checks.push({
      table: "Product",
      constraint: "price_non_negative",
      valid: negativePrices.length === 0,
      violations: negativePrices,
    });

    return checks;
  }

  /**
   * Run all validation checks
   */
  async validateAll(): Promise<{
    valid: boolean;
    checks: DataIntegrityCheck[];
    violations: number;
  }> {
    const foreignKeyChecks = await this.validateForeignKeys();
    const uniqueChecks = await this.validateUniqueConstraints();
    const consistencyChecks = await this.validateConsistency();

    const allChecks = [
      ...foreignKeyChecks,
      ...uniqueChecks,
      ...consistencyChecks,
    ];
    const violations = allChecks.filter((c) => !c.valid).length;

    return {
      valid: violations === 0,
      checks: allChecks,
      violations,
    };
  }
}

// ==========================================
// 📈 DATABASE STATISTICS
// ==========================================

export class DatabaseStatistics {
  /**
   * Get table counts
   */
  async getTableCounts(): Promise<Record<string, number>> {
    const [users, farms, products, orders] = await Promise.all([
      database.user.count(),
      database.farm.count(),
      database.product.count(),
      database.order.count(),
    ]);

    return {
      users,
      farms,
      products,
      orders,
    };
  }

  /**
   * Get database statistics
   */
  async getStatistics(): Promise<DatabaseStats> {
    const counts = await this.getTableCounts();

    return {
      tableStats: {
        User: {
          count: counts.users,
          size: 0, // Would need raw SQL to get actual size
          indexes: 0,
        },
        Farm: {
          count: counts.farms,
          size: 0,
          indexes: 0,
        },
        Product: {
          count: counts.products,
          size: 0,
          indexes: 0,
        },
        Order: {
          count: counts.orders,
          size: 0,
          indexes: 0,
        },
      },
      totalRecords: Object.values(counts).reduce((a, b) => a + b, 0),
      totalSize: 0,
    };
  }

  /**
   * Get slow queries
   */
  async getSlowQueries(thresholdMs = 1000): Promise<any[]> {
    // Would require database query logging to be enabled
    // This is a placeholder implementation
    return [];
  }
}

// ==========================================
// 🔧 UTILITY FUNCTIONS
// ==========================================

/**
 * Execute raw SQL
 */
export async function executeRawSql<T = any>(
  sql: string,
  params?: any[],
): Promise<T> {
  return await database.$queryRawUnsafe(sql, ...(params || []));
}

/**
 * Truncate all tables
 */
export async function truncateAllTables(): Promise<void> {
  await database.$executeRaw`TRUNCATE TABLE "OrderItem" CASCADE`;
  await database.$executeRaw`TRUNCATE TABLE "Order" CASCADE`;
  await database.$executeRaw`TRUNCATE TABLE "Product" CASCADE`;
  await database.$executeRaw`TRUNCATE TABLE "Farm" CASCADE`;
  await database.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
}

/**
 * Reset database sequences
 */
export async function resetSequences(): Promise<void> {
  // PostgreSQL specific
  await database.$executeRaw`SELECT setval(pg_get_serial_sequence('"User"', 'id'), 1, false)`;
  await database.$executeRaw`SELECT setval(pg_get_serial_sequence('"Farm"', 'id'), 1, false)`;
  await database.$executeRaw`SELECT setval(pg_get_serial_sequence('"Product"', 'id'), 1, false)`;
}

/**
 * Create database backup
 */
export async function createBackup(): Promise<DatabaseSnapshot> {
  return {
    users: await database.user.findMany(),
    farms: await database.farm.findMany(),
    products: await database.product.findMany(),
    orders: await database.order.findMany(),
    timestamp: new Date(),
  };
}

/**
 * Wait for database operation
 */
export async function waitForDatabase(
  condition: () => Promise<boolean>,
  timeout = 10000,
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error("Database condition timeout");
}

// ==========================================
// 📤 EXPORTS
// ==========================================

export const DatabaseTestUtils = {
  DatabaseTestManager,
  TransactionTester,
  QueryPerformanceAnalyzer,
  DataIntegrityValidator,
  DatabaseStatistics,
  executeRawSql,
  truncateAllTables,
  resetSequences,
  createBackup,
  waitForDatabase,
};

export default DatabaseTestUtils;
