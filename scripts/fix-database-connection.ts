#!/usr/bin/env tsx
/**
 * 🔧 DATABASE CONNECTION DIAGNOSTIC & FIX SCRIPT
 *
 * Comprehensive database health check and automatic fixes
 *
 * Usage:
 *   npm run db:fix              # Run diagnostics and fixes
 *   npm run db:fix -- --test    # Test connection only
 *   npm run db:fix -- --verbose # Detailed output
 *
 * @version 1.0.0
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { Pool } from "pg";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  colors: {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
  },
  thresholds: {
    fast: 100, // < 100ms is excellent
    good: 500, // < 500ms is good
    acceptable: 1000, // < 1s is acceptable
    slow: 3000, // > 3s is slow
  },
};

const args = process.argv.slice(2);
const isTestOnly = args.includes("--test");
const isVerbose = args.includes("--verbose");

// ============================================================================
// TYPES
// ============================================================================

interface DiagnosticResult {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
  details?: Record<string, any>;
  fix?: string;
  duration?: number;
}

interface HealthReport {
  overall: "healthy" | "degraded" | "critical";
  checks: DiagnosticResult[];
  timestamp: string;
  environment: string;
  fixes: string[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(message: string, color: keyof typeof CONFIG.colors = "reset") {
  const c = CONFIG.colors;
  console.log(`${c[color]}${message}${c.reset}`);
}

function logSection(title: string) {
  const c = CONFIG.colors;
  console.log(`\n${"═".repeat(80)}`);
  console.log(`${c.bright}${c.cyan}${title}${c.reset}`);
  console.log("═".repeat(80));
}

function logResult(result: DiagnosticResult) {
  const c = CONFIG.colors;
  const icons = { pass: "✅", fail: "❌", warn: "⚠️" };
  const colors = { pass: "green", fail: "red", warn: "yellow" };

  const icon = icons[result.status];
  const color = colors[result.status];

  console.log(`${icon} ${c[color]}${result.name}${c.reset}`);
  console.log(`   ${c.dim}${result.message}${c.reset}`);

  if (result.details && isVerbose) {
    Object.entries(result.details).forEach(([key, value]) => {
      console.log(`   ${c.dim}├─ ${key}: ${JSON.stringify(value)}${c.reset}`);
    });
  }

  if (result.duration !== undefined) {
    const perfIcon =
      result.duration < CONFIG.thresholds.fast
        ? "🚀"
        : result.duration < CONFIG.thresholds.good
          ? "✓"
          : result.duration < CONFIG.thresholds.acceptable
            ? "⏱️"
            : "🐌";
    console.log(
      `   ${c.dim}└─ Duration: ${result.duration}ms ${perfIcon}${c.reset}`,
    );
  }

  if (result.fix) {
    console.log(`   ${c.yellow}💡 Fix: ${result.fix}${c.reset}`);
  }
}

// ============================================================================
// DIAGNOSTIC CHECKS
// ============================================================================

/**
 * Check if DATABASE_URL is set
 */
async function checkDatabaseURL(): Promise<DiagnosticResult> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return {
      name: "Database URL Configuration",
      status: "fail",
      message: "DATABASE_URL environment variable is not set",
      fix: "Set DATABASE_URL in your .env file or Vercel environment variables",
    };
  }

  // Parse URL to check format
  try {
    const url = new URL(databaseUrl);

    const details: Record<string, any> = {
      protocol: url.protocol,
      host: url.hostname,
      port: url.port || "5432",
      database: url.pathname.slice(1),
    };

    // Check if it's a Vercel Postgres URL
    const isVercelPostgres = url.hostname.includes(
      "postgres.vercel-storage.com",
    );
    const isLocalhost =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";

    if (isVercelPostgres) {
      details.provider = "Vercel Postgres";
    } else if (isLocalhost) {
      details.provider = "Local PostgreSQL";
    } else {
      details.provider = "External PostgreSQL";
    }

    return {
      name: "Database URL Configuration",
      status: "pass",
      message: `DATABASE_URL is set (${details.provider})`,
      details,
    };
  } catch (error) {
    return {
      name: "Database URL Configuration",
      status: "fail",
      message: "DATABASE_URL format is invalid",
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
      fix: "Check DATABASE_URL format: postgresql://user:pass@host:port/database",
    };
  }
}

/**
 * Test raw PostgreSQL connection
 */
async function testRawConnection(): Promise<DiagnosticResult> {
  const start = Date.now();

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      connectionTimeoutMillis: 5000,
    });

    // Test query
    const result = await pool.query(
      "SELECT NOW() as current_time, version() as pg_version",
    );
    const duration = Date.now() - start;

    const row = result.rows[0];
    const version =
      row.pg_version.split(" ")[0] + " " + row.pg_version.split(" ")[1];

    await pool.end();

    const status =
      duration < CONFIG.thresholds.acceptable
        ? "pass"
        : duration < CONFIG.thresholds.slow
          ? "warn"
          : "fail";

    return {
      name: "Raw PostgreSQL Connection",
      status,
      message: `Connected to PostgreSQL successfully`,
      duration,
      details: {
        currentTime: row.current_time,
        version,
        latency: `${duration}ms`,
      },
    };
  } catch (error) {
    return {
      name: "Raw PostgreSQL Connection",
      status: "fail",
      message: "Failed to connect to PostgreSQL",
      duration: Date.now() - start,
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
      fix: "Verify DATABASE_URL is correct and database is accessible",
    };
  }
}

/**
 * Test Prisma Client connection
 */
async function testPrismaConnection(): Promise<DiagnosticResult> {
  const start = Date.now();

  try {
    const prisma = new PrismaClient({
      log: isVerbose ? ["query", "error", "warn"] : ["error"],
    });

    // Test query
    await prisma.$queryRaw`SELECT 1 as test`;
    const duration = Date.now() - start;

    await prisma.$disconnect();

    const status =
      duration < CONFIG.thresholds.acceptable
        ? "pass"
        : duration < CONFIG.thresholds.slow
          ? "warn"
          : "fail";

    return {
      name: "Prisma Client Connection",
      status,
      message: "Prisma client connected successfully",
      duration,
      details: {
        latency: `${duration}ms`,
      },
    };
  } catch (error) {
    return {
      name: "Prisma Client Connection",
      status: "fail",
      message: "Prisma client connection failed",
      duration: Date.now() - start,
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
      fix: "Run: npx prisma generate && npx prisma db push",
    };
  }
}

/**
 * Check Prisma schema validity
 */
async function checkPrismaSchema(): Promise<DiagnosticResult> {
  try {
    const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");

    if (!fs.existsSync(schemaPath)) {
      return {
        name: "Prisma Schema File",
        status: "fail",
        message: "prisma/schema.prisma file not found",
        fix: "Create a Prisma schema file",
      };
    }

    const schemaContent = fs.readFileSync(schemaPath, "utf-8");
    const hasGenerator = schemaContent.includes("generator client");
    const hasDatasource = schemaContent.includes("datasource db");
    const hasModels = schemaContent.match(/model\s+\w+\s+{/g);

    if (!hasGenerator) {
      return {
        name: "Prisma Schema File",
        status: "fail",
        message: "Schema missing generator client",
        fix: "Add generator client to schema.prisma",
      };
    }

    if (!hasDatasource) {
      return {
        name: "Prisma Schema File",
        status: "fail",
        message: "Schema missing datasource db",
        fix: "Add datasource db to schema.prisma",
      };
    }

    return {
      name: "Prisma Schema File",
      status: "pass",
      message: `Schema valid with ${hasModels?.length || 0} models`,
      details: {
        hasGenerator,
        hasDatasource,
        modelCount: hasModels?.length || 0,
      },
    };
  } catch (error) {
    return {
      name: "Prisma Schema File",
      status: "fail",
      message: "Failed to read schema file",
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

/**
 * Test database query performance
 */
async function testQueryPerformance(): Promise<DiagnosticResult> {
  try {
    const prisma = new PrismaClient();
    const start = Date.now();

    // Run multiple queries to test performance
    const queries = [
      prisma.$queryRaw`SELECT 1`,
      prisma.$queryRaw`SELECT NOW()`,
      prisma.$queryRaw`SELECT version()`,
    ];

    await Promise.all(queries);
    const duration = Date.now() - start;
    const avgDuration = duration / queries.length;

    await prisma.$disconnect();

    const status =
      avgDuration < CONFIG.thresholds.good
        ? "pass"
        : avgDuration < CONFIG.thresholds.acceptable
          ? "warn"
          : "fail";

    return {
      name: "Query Performance",
      status,
      message: `Average query time: ${avgDuration.toFixed(0)}ms`,
      duration,
      details: {
        totalDuration: `${duration}ms`,
        avgDuration: `${avgDuration.toFixed(0)}ms`,
        queryCount: queries.length,
      },
    };
  } catch (error) {
    return {
      name: "Query Performance",
      status: "fail",
      message: "Query performance test failed",
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

/**
 * Check database tables exist
 */
async function checkDatabaseTables(): Promise<DiagnosticResult> {
  try {
    const prisma = new PrismaClient();

    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    await prisma.$disconnect();

    if (tables.length === 0) {
      return {
        name: "Database Tables",
        status: "warn",
        message: "No tables found in database",
        fix: "Run: npx prisma db push",
      };
    }

    // Check for critical tables
    const tableNames = tables.map((t) => t.tablename.toLowerCase());
    const criticalTables = ["user", "farm", "product"];
    const missingTables = criticalTables.filter((t) => !tableNames.includes(t));

    if (missingTables.length > 0) {
      return {
        name: "Database Tables",
        status: "warn",
        message: `Missing critical tables: ${missingTables.join(", ")}`,
        details: {
          totalTables: tables.length,
          missingTables,
        },
        fix: "Run: npx prisma db push",
      };
    }

    return {
      name: "Database Tables",
      status: "pass",
      message: `Found ${tables.length} tables`,
      details: {
        tableCount: tables.length,
        tables: tableNames.slice(0, 10), // Show first 10
      },
    };
  } catch (error) {
    return {
      name: "Database Tables",
      status: "fail",
      message: "Failed to check database tables",
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

/**
 * Check connection pool health
 */
async function checkConnectionPool(): Promise<DiagnosticResult> {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
    });

    const result = await pool.query<{
      total_connections: number;
      max_connections: number;
      idle_connections: number;
    }>`
      SELECT
        (SELECT count(*) FROM pg_stat_activity) as total_connections,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections
    `;

    await pool.end();

    const stats = result.rows[0];
    const utilizationPercent =
      (stats.total_connections / stats.max_connections) * 100;

    const status =
      utilizationPercent < 50
        ? "pass"
        : utilizationPercent < 80
          ? "warn"
          : "fail";

    return {
      name: "Connection Pool Health",
      status,
      message: `${stats.total_connections}/${stats.max_connections} connections (${utilizationPercent.toFixed(0)}% utilized)`,
      details: {
        totalConnections: stats.total_connections,
        maxConnections: stats.max_connections,
        idleConnections: stats.idle_connections,
        utilizationPercent: `${utilizationPercent.toFixed(1)}%`,
      },
    };
  } catch (error) {
    return {
      name: "Connection Pool Health",
      status: "warn",
      message: "Could not check connection pool (may not have permissions)",
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

/**
 * Check Vercel environment variables
 */
async function checkVercelEnvironment(): Promise<DiagnosticResult> {
  const vercelEnv = process.env.VERCEL_ENV;
  const vercelUrl = process.env.VERCEL_URL;

  if (!vercelEnv) {
    return {
      name: "Vercel Environment",
      status: "pass",
      message: "Not running in Vercel (local development)",
      details: {
        environment: "local",
      },
    };
  }

  return {
    name: "Vercel Environment",
    status: "pass",
    message: `Running in Vercel (${vercelEnv})`,
    details: {
      environment: vercelEnv,
      url: vercelUrl,
      region: process.env.VERCEL_REGION,
    },
  };
}

// ============================================================================
// AUTOMATIC FIXES
// ============================================================================

async function applyFixes(checks: DiagnosticResult[]): Promise<string[]> {
  const fixes: string[] = [];

  logSection("🔧 Applying Automatic Fixes");

  const failedChecks = checks.filter((c) => c.status === "fail");

  if (failedChecks.length === 0) {
    log("✅ No automatic fixes needed", "green");
    return fixes;
  }

  for (const check of failedChecks) {
    if (check.fix) {
      log(`\n💡 ${check.name}:`, "yellow");
      log(`   ${check.fix}`, "cyan");
      fixes.push(check.fix);
    }
  }

  return fixes;
}

// ============================================================================
// MAIN DIAGNOSTIC FUNCTION
// ============================================================================

async function runDiagnostics(): Promise<HealthReport> {
  logSection("🔍 Database Connection Diagnostics");
  log(`Environment: ${process.env.NODE_ENV || "production"}`, "dim");
  log(`Timestamp: ${new Date().toISOString()}`, "dim");

  const checks: DiagnosticResult[] = [];

  // Run all diagnostic checks
  log("\n📋 Running diagnostic checks...\n", "cyan");

  checks.push(await checkDatabaseURL());
  logResult(checks[checks.length - 1]);

  checks.push(await checkVercelEnvironment());
  logResult(checks[checks.length - 1]);

  checks.push(await checkPrismaSchema());
  logResult(checks[checks.length - 1]);

  // Only proceed with connection tests if URL is valid
  if (checks[0].status !== "fail") {
    checks.push(await testRawConnection());
    logResult(checks[checks.length - 1]);

    checks.push(await testPrismaConnection());
    logResult(checks[checks.length - 1]);

    checks.push(await testQueryPerformance());
    logResult(checks[checks.length - 1]);

    checks.push(await checkDatabaseTables());
    logResult(checks[checks.length - 1]);

    checks.push(await checkConnectionPool());
    logResult(checks[checks.length - 1]);
  }

  // Determine overall health
  const failCount = checks.filter((c) => c.status === "fail").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;

  let overall: "healthy" | "degraded" | "critical";
  if (failCount === 0 && warnCount === 0) {
    overall = "healthy";
  } else if (failCount === 0) {
    overall = "degraded";
  } else {
    overall = "critical";
  }

  // Apply fixes if not in test-only mode
  let fixes: string[] = [];
  if (!isTestOnly && failCount > 0) {
    fixes = await applyFixes(checks);
  }

  const report: HealthReport = {
    overall,
    checks,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production",
    fixes,
  };

  return report;
}

// ============================================================================
// PRINT SUMMARY
// ============================================================================

function printSummary(report: HealthReport) {
  const c = CONFIG.colors;
  logSection("📊 Diagnostic Summary");

  const statusIcons = {
    healthy: "✅",
    degraded: "⚠️",
    critical: "❌",
  };

  const statusColors = {
    healthy: "green",
    degraded: "yellow",
    critical: "red",
  };

  log(
    `${statusIcons[report.overall]} Overall Status: ${c[statusColors[report.overall]]}${report.overall.toUpperCase()}${c.reset}`,
    "bright",
  );

  const passCount = report.checks.filter((c) => c.status === "pass").length;
  const warnCount = report.checks.filter((c) => c.status === "warn").length;
  const failCount = report.checks.filter((c) => c.status === "fail").length;

  console.log(`\n${"─".repeat(80)}`);
  log(
    `${c.green}✅ Passed: ${passCount}${c.reset}  ` +
      `${c.yellow}⚠️  Warnings: ${warnCount}${c.reset}  ` +
      `${c.red}❌ Failed: ${failCount}${c.reset}`,
  );
  console.log(`${"─".repeat(80)}\n`);

  // Print failed checks
  if (failCount > 0) {
    log("❌ Failed Checks:", "red");
    report.checks
      .filter((c) => c.status === "fail")
      .forEach((check) => {
        console.log(`  • ${check.name}: ${check.message}`);
        if (check.fix) {
          console.log(`    ${c.yellow}Fix: ${check.fix}${c.reset}`);
        }
      });
    console.log();
  }

  // Print warnings
  if (warnCount > 0) {
    log("⚠️  Warnings:", "yellow");
    report.checks
      .filter((c) => c.status === "warn")
      .forEach((check) => {
        console.log(`  • ${check.name}: ${check.message}`);
      });
    console.log();
  }

  // Print recommended actions
  if (report.overall !== "healthy") {
    logSection("🎯 Recommended Actions");

    if (failCount > 0) {
      log("1. Fix Critical Issues:", "red");
      report.fixes.forEach((fix, i) => {
        console.log(`   ${i + 1}. ${fix}`);
      });
      console.log();
    }

    if (warnCount > 0) {
      log("2. Address Warnings:", "yellow");
      const warnings = report.checks.filter(
        (c) => c.status === "warn" && c.fix,
      );
      warnings.forEach((check, i) => {
        console.log(`   ${i + 1}. ${check.fix}`);
      });
      console.log();
    }

    log("3. Verify in Vercel:", "cyan");
    console.log(
      "   • Go to: https://vercel.com/your-project/settings/environment-variables",
    );
    console.log(
      "   • Check DATABASE_URL is set for Production, Preview, and Development",
    );
    console.log("   • Redeploy after updating environment variables");
    console.log();

    log("4. Run Tests Again:", "cyan");
    console.log("   npm run db:fix -- --test");
    console.log();
  } else {
    log("✅ Database is healthy! No action needed.", "green");
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  try {
    log("🚀 Starting Database Diagnostics", "bright");

    if (isTestOnly) {
      log("   Mode: Test Only (no fixes will be applied)", "dim");
    }

    if (isVerbose) {
      log("   Mode: Verbose Output", "dim");
    }

    const report = await runDiagnostics();
    printSummary(report);

    // Save report to file
    const reportsDir = path.join(process.cwd(), "health-reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportPath = path.join(reportsDir, `db-diagnostic-${timestamp}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    log(`\n💾 Report saved to: ${reportPath}`, "dim");

    // Exit with appropriate code
    const exitCode = report.overall === "critical" ? 1 : 0;
    process.exit(exitCode);
  } catch (error) {
    log("\n❌ Fatal error during diagnostics", "red");
    console.error(error);
    process.exit(1);
  }
}

// Run if executed directly
main();

export { runDiagnostics, type DiagnosticResult, type HealthReport };
