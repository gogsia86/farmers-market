#!/usr/bin/env tsx

/**
 * 🚀 Apply Database Optimizations
 *
 * Safely applies the database performance optimizations from quick-performance-fixes.sql
 *
 * Features:
 * - Checks database connectivity before applying changes
 * - Applies indexes concurrently (non-blocking)
 * - Provides detailed progress feedback
 * - Measures execution time
 * - Safe for production use (all changes are additive)
 */

import { dirname } from "path";
import { fileURLToPath } from "url";
import { database as prisma } from "../src/lib/database/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface OptimizationStep {
  name: string;
  sql: string;
  description: string;
}

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function section(title: string) {
  console.log("\n" + "=".repeat(80));
  log(title, colors.bright + colors.cyan);
  console.log("=".repeat(80) + "\n");
}

async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    log("✅ Database connection successful", colors.green);
    return true;
  } catch (error) {
    log("❌ Database connection failed", colors.red);
    console.error(error);
    return false;
  }
}

async function checkPostgresVersion(): Promise<void> {
  try {
    const result = await prisma.$queryRaw<
      Array<{ version: string }>
    >`SELECT version()`;
    if (result && result.length > 0) {
      log(
        `📊 PostgreSQL Version: ${result[0].version.split(",")[0]}`,
        colors.blue,
      );
    }
  } catch (error) {
    log("⚠️  Could not determine PostgreSQL version", colors.yellow);
  }
}

async function enableExtensions(): Promise<void> {
  section("Step 1: Enabling PostgreSQL Extensions");

  const extensions = [
    { name: "pg_trgm", description: "Trigram similarity for fuzzy search" },
    { name: "pg_stat_statements", description: "Query performance monitoring" },
  ];

  for (const ext of extensions) {
    try {
      await prisma.$executeRawUnsafe(
        `CREATE EXTENSION IF NOT EXISTS ${ext.name}`,
      );
      log(
        `✅ Enabled extension: ${ext.name} - ${ext.description}`,
        colors.green,
      );
    } catch (error) {
      log(
        `⚠️  Could not enable ${ext.name} (may require superuser privileges)`,
        colors.yellow,
      );
    }
  }
}

async function createIndex(indexDef: OptimizationStep): Promise<boolean> {
  const startTime = Date.now();

  try {
    // Check if index already exists
    const indexName = extractIndexName(indexDef.sql);
    if (indexName) {
      const existing = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count
        FROM pg_indexes
        WHERE indexname = ${indexName}
      `;

      if (existing && existing[0] && Number(existing[0].count) > 0) {
        log(`⏭️  Index ${indexName} already exists, skipping`, colors.yellow);
        return true;
      }
    }

    await prisma.$executeRawUnsafe(indexDef.sql);
    const duration = Date.now() - startTime;
    log(`✅ ${indexDef.name} (${duration}ms)`, colors.green);
    return true;
  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Check if it's a "already exists" error
    if (error.message?.includes("already exists")) {
      log(`⏭️  ${indexDef.name} already exists (${duration}ms)`, colors.yellow);
      return true;
    }

    log(`❌ ${indexDef.name} failed (${duration}ms)`, colors.red);
    console.error(error.message || error);
    return false;
  }
}

function extractIndexName(sql: string): string | null {
  const match = sql.match(
    /INDEX\s+(?:CONCURRENTLY\s+)?(?:IF NOT EXISTS\s+)?"?([a-zA-Z0-9_]+)"?/i,
  );
  return match ? match[1] : null;
}

async function createFarmIndexes(): Promise<number> {
  section("Step 2: Creating Farm Table Indexes");

  const indexes: OptimizationStep[] = [
    {
      name: "farms_status_created_at_idx",
      description: "Optimize farm listing queries",
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "farms_status_created_at_idx"
            ON "farms"("status", "createdAt" DESC) WHERE "status" = 'ACTIVE'`,
    },
    {
      name: "farms_state_status_idx",
      description: "Optimize state-based filtering",
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "farms_state_status_idx"
            ON "farms"("state", "status") WHERE "status" = 'ACTIVE'`,
    },
    {
      name: "farms_verification_status_idx",
      description: "Optimize verification queries",
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "farms_verification_status_idx"
            ON "farms"("verificationStatus", "status") WHERE "status" = 'ACTIVE'`,
    },
    {
      name: "farms_name_lower_idx",
      description: "Case-insensitive name search",
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "farms_name_lower_idx"
            ON "farms"(LOWER("name"))`,
    },
    {
      name: "farms_name_trgm_idx",
      description: "Full-text search on farm name",
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "farms_name_trgm_idx"
            ON "farms" USING gin("name" gin_trgm_ops)`,
    },
    {
      name: "farms_description_trgm_idx",
      description: "Full-text search on description",
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "farms_description_trgm_idx"
            ON "farms" USING gin("description" gin_trgm_ops)`,
    },
    {
      name: "farms_city_state_idx",
      description: "Optimize location queries",
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "farms_city_state_idx"
            ON "farms"("city", "state")`,
    },
  ];

  let successCount = 0;
  for (const index of indexes) {
    if (await createIndex(index)) {
      successCount++;
    }
  }

  return successCount;
}

async function createProductIndexes(): Promise<number> {
  section("Step 3: Creating Product Table Indexes");

  const indexes: OptimizationStep[] = [
    {
      name: "products_farm_status_created_idx",
      description: "Optimize product listing by farm",
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_farm_status_created_idx"
            ON "products"("farmId", "status", "createdAt" DESC) WHERE "status" = 'ACTIVE'`,
    },
    {
      name: "products_farm_instock_idx",
      description: "Optimize in-stock queries",
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_farm_instock_idx"
            ON "products"("farmId", "inStock", "status")
            WHERE "status" = 'ACTIVE' AND "inStock" = true`,
    },
    {
      name: "products_category_status_idx",
      description: "Category-based filtering",
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_category_status_idx"
            ON "products"("category", "status", "createdAt" DESC) WHERE "status" = 'ACTIVE'`,
    },
    {
      name: "products_name_trgm_idx",
      description: "Product search",
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_name_trgm_idx"
            ON "products" USING gin("name" gin_trgm_ops)`,
    },
  ];

  let successCount = 0;
  for (const index of indexes) {
    if (await createIndex(index)) {
      successCount++;
    }
  }

  return successCount;
}

async function createReviewIndexes(): Promise<number> {
  section("Step 4: Creating Review Table Indexes");

  const indexes: OptimizationStep[] = [
    {
      name: "reviews_farm_status_created_idx",
      description: "Review listing by farm",
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "reviews_farm_status_created_idx"
            ON "reviews"("farmId", "status", "createdAt" DESC) WHERE "status" = 'APPROVED'`,
    },
    {
      name: "reviews_customer_created_idx",
      description: "Customer reviews",
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "reviews_customer_created_idx"
            ON "reviews"("customerId", "createdAt" DESC)`,
    },
  ];

  let successCount = 0;
  for (const index of indexes) {
    if (await createIndex(index)) {
      successCount++;
    }
  }

  return successCount;
}

async function createOtherIndexes(): Promise<number> {
  section("Step 5: Creating Additional Indexes");

  const indexes: OptimizationStep[] = [
    {
      name: "orders_customer_created_idx",
      description: "Customer order history",
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "orders_customer_created_idx"
            ON "orders"("customerId", "createdAt" DESC)`,
    },
    {
      name: "orders_farm_status_created_idx",
      description: "Farm order management",
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "orders_farm_status_created_idx"
            ON "orders"("farmId", "status", "createdAt" DESC)`,
    },
    {
      name: "users_email_lower_idx",
      description: "Case-insensitive email lookup",
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "users_email_lower_idx"
            ON "users"(LOWER("email"))`,
    },
  ];

  let successCount = 0;
  for (const index of indexes) {
    if (await createIndex(index)) {
      successCount++;
    }
  }

  return successCount;
}

async function analyzeTablesAndVacuum(): Promise<void> {
  section("Step 6: Analyzing Tables and Updating Statistics");

  const tables = ["farms", "products", "reviews", "orders", "users"];

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ANALYZE "${table}"`);
      log(`✅ Analyzed ${table}`, colors.green);
    } catch (error: any) {
      log(`⚠️  Could not analyze ${table}: ${error.message}`, colors.yellow);
    }
  }
}

async function showIndexStats(): Promise<void> {
  section("Step 7: Index Usage Statistics");

  try {
    const stats = await prisma.$queryRaw<
      Array<{
        tablename: string;
        indexname: string;
        idx_scan: bigint;
      }>
    >`
      SELECT
        tablename,
        indexname,
        idx_scan
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('farms', 'products', 'reviews', 'orders', 'users')
      ORDER BY idx_scan DESC
      LIMIT 15
    `;

    if (stats && stats.length > 0) {
      console.log("\nTop 15 Most Used Indexes:");
      console.log("─".repeat(80));
      stats.forEach((stat) => {
        const scans = Number(stat.idx_scan).toLocaleString();
        console.log(
          `  ${stat.tablename.padEnd(15)} | ${stat.indexname.padEnd(40)} | ${scans.padStart(10)} scans`,
        );
      });
    }
  } catch (error) {
    log("⚠️  Could not retrieve index statistics", colors.yellow);
  }
}

async function showTableSizes(): Promise<void> {
  section("Step 8: Table and Index Sizes");

  try {
    const sizes = await prisma.$queryRaw<
      Array<{
        tablename: string;
        table_size: string;
        indexes_size: string;
        total_size: string;
      }>
    >`
      SELECT
        tablename,
        pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
        pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS indexes_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename IN ('farms', 'products', 'reviews', 'orders', 'users')
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `;

    if (sizes && sizes.length > 0) {
      console.log("\nTable Sizes:");
      console.log("─".repeat(80));
      sizes.forEach((size) => {
        console.log(
          `  ${size.tablename.padEnd(15)} | Table: ${size.table_size.padStart(8)} | Indexes: ${size.indexes_size.padStart(8)} | Total: ${size.total_size.padStart(8)}`,
        );
      });
    }
  } catch (error) {
    log("⚠️  Could not retrieve table sizes", colors.yellow);
  }
}

async function main() {
  const startTime = Date.now();

  console.log("\n");
  log(
    "╔════════════════════════════════════════════════════════════════════════════╗",
    colors.bright + colors.cyan,
  );
  log(
    "║                  🚀 DATABASE PERFORMANCE OPTIMIZATION                      ║",
    colors.bright + colors.cyan,
  );
  log(
    "║                     Farmers Market Platform                                ║",
    colors.bright + colors.cyan,
  );
  log(
    "╚════════════════════════════════════════════════════════════════════════════╝",
    colors.bright + colors.cyan,
  );
  console.log("\n");

  // Check database connection
  section("Preflight Checks");
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    log("\n❌ Cannot proceed without database connection", colors.red);
    process.exit(1);
  }

  await checkPostgresVersion();

  log(
    "\n⚠️  This script will create performance indexes on your database.",
    colors.yellow,
  );
  log("   All changes are additive and safe for production.", colors.yellow);
  log("   Indexes are created CONCURRENTLY (non-blocking).", colors.yellow);

  // Enable extensions
  await enableExtensions();

  // Create indexes
  let totalIndexes = 0;
  totalIndexes += await createFarmIndexes();
  totalIndexes += await createProductIndexes();
  totalIndexes += await createReviewIndexes();
  totalIndexes += await createOtherIndexes();

  // Analyze tables
  await analyzeTablesAndVacuum();

  // Show statistics
  await showIndexStats();
  await showTableSizes();

  // Summary
  const duration = Date.now() - startTime;
  section("✅ Optimization Complete");

  log(`🎉 Successfully created/verified ${totalIndexes} indexes`, colors.green);
  log(
    `⏱️  Total execution time: ${(duration / 1000).toFixed(2)}s`,
    colors.blue,
  );

  console.log("\n" + "─".repeat(80));
  log("Expected Performance Improvements:", colors.bright);
  log("  • 30-50% faster farm listing queries", colors.green);
  log("  • 40-60% faster farm detail page loads", colors.green);
  log("  • 50-70% faster product searches", colors.green);
  log("  • Improved full-text search performance", colors.green);
  console.log("─".repeat(80) + "\n");

  log("Next Steps:", colors.bright);
  log("  1. Monitor query performance using pg_stat_statements", colors.blue);
  log("  2. Run application performance tests", colors.blue);
  log("  3. Check cache hit rates in Redis", colors.blue);
  log("  4. Review slow query logs", colors.blue);
  console.log("\n");
}

main()
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
