#!/usr/bin/env tsx
/**
 * 🔍 DIVINE API DIAGNOSTIC TOOL
 * Farmers Market Platform - API Integration Issue Diagnostics
 *
 * This script diagnoses common API integration failures:
 * - Environment variable issues
 * - Server connectivity problems
 * - Database connection issues
 * - API route existence and functionality
 * - Port conflicts
 *
 * Usage:
 *   npx tsx scripts/diagnose-api-issue.ts
 *   npm run diagnose:api
 */

import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as https from "https";

const execAsync = promisify(exec);

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title: string) {
  console.log("\n" + "=".repeat(70));
  log(title, "bright");
  console.log("=".repeat(70) + "\n");
}

interface DiagnosticResult {
  test: string;
  status: "PASS" | "FAIL" | "WARN" | "INFO";
  message: string;
  details?: string;
  fix?: string;
}

const results: DiagnosticResult[] = [];

function addResult(result: DiagnosticResult) {
  results.push(result);

  const icon = {
    PASS: "✅",
    FAIL: "❌",
    WARN: "⚠️",
    INFO: "ℹ️",
  }[result.status];

  const color = {
    PASS: "green",
    FAIL: "red",
    WARN: "yellow",
    INFO: "cyan",
  }[result.status] as keyof typeof colors;

  log(`${icon} ${result.test}`, color);
  log(`   ${result.message}`, "reset");

  if (result.details) {
    log(`   Details: ${result.details}`, "reset");
  }

  if (result.fix) {
    log(`   🔧 Fix: ${result.fix}`, "cyan");
  }

  console.log("");
}

// Check if a file exists
function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

// Read file content safely
function readFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

// Make HTTP request
function makeRequest(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;

    const req = client.get(url, { timeout: 5000 }, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode || 0, body }));
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

// Check if port is in use
async function checkPort(port: number): Promise<boolean> {
  try {
    if (process.platform === "win32") {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      return stdout.trim().length > 0;
    } else {
      const { stdout } = await execAsync(`lsof -i :${port}`);
      return stdout.trim().length > 0;
    }
  } catch {
    return false;
  }
}

// TEST 1: Check environment files
async function testEnvironmentFiles() {
  section("📋 TEST 1: Environment Configuration");

  const envFiles = [
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
  ];
  let foundEnv = false;

  for (const envFile of envFiles) {
    if (fileExists(envFile)) {
      foundEnv = true;
      addResult({
        test: `Environment File: ${envFile}`,
        status: "PASS",
        message: `Found ${envFile}`,
      });

      // Check for critical variables
      const content = readFile(envFile);
      if (content) {
        const hasAppUrl = content.includes("NEXT_PUBLIC_APP_URL");
        const hasDbUrl = content.includes("DATABASE_URL");
        const hasNextAuthUrl = content.includes("NEXTAUTH_URL");

        if (hasAppUrl) {
          const match = content.match(/NEXT_PUBLIC_APP_URL=(.+)/);
          const url = match ? match[1].trim().replace(/['"]/g, "") : "";
          addResult({
            test: "NEXT_PUBLIC_APP_URL",
            status: url ? "PASS" : "FAIL",
            message: url ? `Set to: ${url}` : "Not set or empty",
            fix: !url
              ? "Add NEXT_PUBLIC_APP_URL=http://localhost:3001 to your .env.local"
              : undefined,
          });
        } else {
          addResult({
            test: "NEXT_PUBLIC_APP_URL",
            status: "FAIL",
            message: "Variable not found in environment file",
            fix: "Add NEXT_PUBLIC_APP_URL=http://localhost:3001 to your .env.local",
          });
        }

        if (!hasDbUrl) {
          addResult({
            test: "DATABASE_URL",
            status: "WARN",
            message: "DATABASE_URL not found",
            fix: "Add DATABASE_URL to your environment file",
          });
        }

        if (!hasNextAuthUrl) {
          addResult({
            test: "NEXTAUTH_URL",
            status: "WARN",
            message: "NEXTAUTH_URL not found",
            fix: "Add NEXTAUTH_URL=http://localhost:3001 to your environment file",
          });
        }
      }
    }
  }

  if (!foundEnv) {
    addResult({
      test: "Environment Files",
      status: "FAIL",
      message: "No environment files found",
      fix: "Create .env.local with: NEXT_PUBLIC_APP_URL=http://localhost:3001",
    });
  }
}

// TEST 2: Check API route files
async function testApiRoutes() {
  section("🗂️  TEST 2: API Route Files");

  const apiRoutes = [
    { path: "src/app/api/farms/route.ts", endpoint: "/api/farms" },
    {
      path: "src/app/api/farms/[slug]/route.ts",
      endpoint: "/api/farms/[slug]",
    },
    { path: "src/app/api/products/route.ts", endpoint: "/api/products" },
    { path: "src/app/api/health/route.ts", endpoint: "/api/health" },
  ];

  for (const route of apiRoutes) {
    if (fileExists(route.path)) {
      addResult({
        test: `API Route: ${route.endpoint}`,
        status: "PASS",
        message: `File exists at ${route.path}`,
      });

      // Check if route exports proper HTTP methods
      const content = readFile(route.path);
      if (content) {
        const hasGet = content.includes("export async function GET");
        const hasPost = content.includes("export async function POST");

        addResult({
          test: `  └─ HTTP Methods`,
          status: "INFO",
          message: `GET: ${hasGet ? "✓" : "✗"} | POST: ${hasPost ? "✓" : "✗"}`,
        });
      }
    } else {
      addResult({
        test: `API Route: ${route.endpoint}`,
        status: "FAIL",
        message: `File not found at ${route.path}`,
        fix: `Create the API route file at ${route.path}`,
      });
    }
  }
}

// TEST 3: Check service layer
async function testServiceLayer() {
  section("⚙️  TEST 3: Service Layer");

  const services = [
    "src/lib/services/farm.service.ts",
    "src/lib/services/product.service.ts",
    "src/lib/services/order.service.ts",
  ];

  for (const service of services) {
    const serviceName = path.basename(service, ".ts");
    if (fileExists(service)) {
      addResult({
        test: `Service: ${serviceName}`,
        status: "PASS",
        message: `File exists at ${service}`,
      });
    } else {
      addResult({
        test: `Service: ${serviceName}`,
        status: "WARN",
        message: `File not found at ${service}`,
      });
    }
  }

  // Check database singleton
  if (
    fileExists("src/lib/database.ts") ||
    fileExists("src/lib/database/index.ts")
  ) {
    addResult({
      test: "Database Singleton",
      status: "PASS",
      message: "Database singleton exists",
    });
  } else {
    addResult({
      test: "Database Singleton",
      status: "FAIL",
      message: "Database singleton not found",
      fix: "Create src/lib/database.ts or src/lib/database/index.ts",
    });
  }
}

// TEST 4: Check page files
async function testPageFiles() {
  section("📄 TEST 4: Page Files");

  const pages = [
    { path: "src/app/(public)/farms/[slug]/page.tsx", route: "/farms/[slug]" },
    {
      path: "src/app/(customer)/marketplace/farms/[slug]/page.tsx",
      route: "/marketplace/farms/[slug]",
    },
  ];

  for (const page of pages) {
    if (fileExists(page.path)) {
      addResult({
        test: `Page: ${page.route}`,
        status: "PASS",
        message: `File exists at ${page.path}`,
      });

      // Check if it's using fetch or direct database access
      const content = readFile(page.path);
      if (content) {
        const usesFetch =
          content.includes("fetch(") && content.includes("/api/farms/");
        const usesDatabase =
          content.includes("database.") || content.includes("farmService.");

        if (usesFetch) {
          addResult({
            test: "  └─ Data Fetching",
            status: "INFO",
            message: "Using fetch() to call API",
            details: "Make sure NEXT_PUBLIC_APP_URL is set correctly",
          });
        } else if (usesDatabase) {
          addResult({
            test: "  └─ Data Fetching",
            status: "INFO",
            message: "Using direct database/service access (Server Component)",
          });
        }
      }
    } else {
      addResult({
        test: `Page: ${page.route}`,
        status: "WARN",
        message: `File not found at ${page.path}`,
      });
    }
  }
}

// TEST 5: Check server connectivity
async function testServerConnectivity() {
  section("🌐 TEST 5: Server Connectivity");

  const ports = [3000, 3001];

  for (const port of ports) {
    const inUse = await checkPort(port);

    if (inUse) {
      addResult({
        test: `Port ${port}`,
        status: "INFO",
        message: `Port is in use (server might be running)`,
      });

      // Try to make request
      try {
        const { status, body } = await makeRequest(
          `http://localhost:${port}/api/health`,
        );

        if (status === 200) {
          addResult({
            test: `  └─ Health Check`,
            status: "PASS",
            message: "Server is responding",
            details: `Status: ${status}`,
          });
        } else {
          addResult({
            test: `  └─ Health Check`,
            status: "WARN",
            message: "Server responded but not OK",
            details: `Status: ${status}`,
          });
        }
      } catch (error) {
        addResult({
          test: `  └─ Health Check`,
          status: "WARN",
          message: "Could not connect to server",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    } else {
      addResult({
        test: `Port ${port}`,
        status: "INFO",
        message: "Port is not in use",
      });
    }
  }
}

// TEST 6: Test specific API endpoint
async function testFarmApiEndpoint() {
  section("🌾 TEST 6: Farm API Endpoint");

  const ports = [3000, 3001];
  let foundWorkingEndpoint = false;

  for (const port of ports) {
    const inUse = await checkPort(port);

    if (inUse) {
      try {
        // Test farms list endpoint
        log(`Testing http://localhost:${port}/api/farms`, "cyan");
        const { status, body } = await makeRequest(
          `http://localhost:${port}/api/farms`,
        );

        if (status === 200) {
          try {
            const data = JSON.parse(body);
            addResult({
              test: `GET /api/farms (port ${port})`,
              status: "PASS",
              message: "Farms API is working",
              details: `Success: ${data.success}, Farms: ${data.data?.length || 0}`,
            });
            foundWorkingEndpoint = true;
          } catch {
            addResult({
              test: `GET /api/farms (port ${port})`,
              status: "WARN",
              message: "Response is not valid JSON",
            });
          }
        } else {
          addResult({
            test: `GET /api/farms (port ${port})`,
            status: "FAIL",
            message: `API returned status ${status}`,
            details: body.substring(0, 200),
          });
        }

        // Test specific farm endpoint (if we have farms)
        try {
          const { status: slugStatus, body: slugBody } = await makeRequest(
            `http://localhost:${port}/api/farms/test-farm`,
          );

          if (slugStatus === 200 || slugStatus === 404) {
            addResult({
              test: `GET /api/farms/[slug] (port ${port})`,
              status: slugStatus === 200 ? "PASS" : "INFO",
              message:
                slugStatus === 200
                  ? "Farm detail API is working"
                  : "Farm not found (normal if no test data)",
              details: `Status: ${slugStatus}`,
            });
          }
        } catch (error) {
          addResult({
            test: `GET /api/farms/[slug] (port ${port})`,
            status: "WARN",
            message: "Could not test farm detail endpoint",
          });
        }
      } catch (error) {
        addResult({
          test: `GET /api/farms (port ${port})`,
          status: "FAIL",
          message: "Could not connect to API",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }

  if (!foundWorkingEndpoint) {
    addResult({
      test: "Overall API Status",
      status: "FAIL",
      message: "No working farm API endpoint found",
      fix: "Start the dev server with: npm run dev",
    });
  }
}

// TEST 7: Check database connection
async function testDatabaseConnection() {
  section("🗄️  TEST 7: Database Connection");

  try {
    // Try to import and test database
    const dbPath = path.resolve("src/lib/database.ts");
    const dbIndexPath = path.resolve("src/lib/database/index.ts");

    if (
      fileExists("src/lib/database.ts") ||
      fileExists("src/lib/database/index.ts")
    ) {
      addResult({
        test: "Database Module",
        status: "PASS",
        message: "Database module exists",
      });

      // Check if Prisma schema exists
      if (fileExists("prisma/schema.prisma")) {
        addResult({
          test: "Prisma Schema",
          status: "PASS",
          message: "Prisma schema found",
        });
      } else {
        addResult({
          test: "Prisma Schema",
          status: "FAIL",
          message: "Prisma schema not found",
          fix: "Ensure prisma/schema.prisma exists",
        });
      }
    } else {
      addResult({
        test: "Database Module",
        status: "FAIL",
        message: "Database module not found",
        fix: "Create src/lib/database.ts",
      });
    }
  } catch (error) {
    addResult({
      test: "Database Connection",
      status: "WARN",
      message: "Could not test database connection",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Generate summary
function printSummary() {
  section("📊 DIAGNOSTIC SUMMARY");

  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const warnings = results.filter((r) => r.status === "WARN").length;
  const info = results.filter((r) => r.status === "INFO").length;

  log(`Total Tests: ${results.length}`, "bright");
  log(`✅ Passed: ${passed}`, "green");
  log(`❌ Failed: ${failed}`, failed > 0 ? "red" : "reset");
  log(`⚠️  Warnings: ${warnings}`, warnings > 0 ? "yellow" : "reset");
  log(`ℹ️  Info: ${info}`, "cyan");

  // Print fixes
  const fixesNeeded = results.filter((r) => r.fix);
  if (fixesNeeded.length > 0) {
    section("🔧 RECOMMENDED FIXES");
    fixesNeeded.forEach((result, index) => {
      log(`${index + 1}. ${result.test}`, "yellow");
      log(`   ${result.fix}`, "cyan");
      console.log("");
    });
  }

  // Overall status
  console.log("\n" + "=".repeat(70));
  if (failed === 0 && warnings === 0) {
    log("✅ ALL SYSTEMS OPERATIONAL", "green");
  } else if (failed > 0) {
    log("❌ CRITICAL ISSUES FOUND - ACTION REQUIRED", "red");
  } else {
    log("⚠️  WARNINGS FOUND - REVIEW RECOMMENDED", "yellow");
  }
  console.log("=".repeat(70) + "\n");
}

// Quick fix suggestions
function printQuickFixGuide() {
  section("🚀 QUICK FIX GUIDE");

  log("1. Create/Update .env.local:", "bright");
  console.log(`
cat > .env.local << 'EOF'
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3001

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmersmarket"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-min-32-chars"

# Optional
LOG_LEVEL=info
EOF
  `);

  log("2. Start the development server:", "bright");
  console.log("   npm run dev");
  console.log("   # or");
  console.log("   npm run dev:omen  # For HP OMEN optimization\n");

  log("3. Seed the database (if empty):", "bright");
  console.log("   npm run db:seed:basic\n");

  log("4. Test the API manually:", "bright");
  console.log("   curl http://localhost:3001/api/farms");
  console.log("   curl http://localhost:3001/api/health\n");

  log("5. Re-run this diagnostic:", "bright");
  console.log("   npx tsx scripts/diagnose-api-issue.ts\n");
}

// Main execution
async function main() {
  log(
    "╔════════════════════════════════════════════════════════════════════╗",
    "cyan",
  );
  log(
    "║           🔍 DIVINE API DIAGNOSTIC TOOL                            ║",
    "cyan",
  );
  log(
    "║           Farmers Market Platform                                  ║",
    "cyan",
  );
  log(
    "╚════════════════════════════════════════════════════════════════════╝",
    "cyan",
  );

  await testEnvironmentFiles();
  await testApiRoutes();
  await testServiceLayer();
  await testPageFiles();
  await testServerConnectivity();
  await testFarmApiEndpoint();
  await testDatabaseConnection();

  printSummary();
  printQuickFixGuide();

  // Exit with appropriate code
  const failed = results.filter((r) => r.status === "FAIL").length;
  process.exit(failed > 0 ? 1 : 0);
}

// Run diagnostics
main().catch((error) => {
  console.error("Diagnostic tool crashed:", error);
  process.exit(1);
});
