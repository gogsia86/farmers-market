#!/usr/bin/env tsx
/**
 * 🔐 CREATE PRODUCTION TEST USERS
 *
 * Creates test users in the production database for inspection bot testing
 * and manual QA. These users have known credentials and are marked as test accounts.
 *
 * Usage:
 *   npm run test:users:production
 *
 * Or with direct database URL:
 *   DATABASE_URL="postgres://..." tsx scripts/create-production-test-users.ts
 *
 * Created users:
 * - customer@test.com (CONSUMER role)
 * - farmer@test.com (FARMER role)
 * - admin@test.com (ADMIN role)
 *
 * All with password: Test123!@#
 *
 * @author Farmers Market Platform Team
 * @version 1.0.0
 */

import { database } from "@/lib/database";
import { hash } from "bcryptjs";
import "dotenv/config";

// ANSI colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = (message: string, type: "info" | "success" | "error" | "warn" = "info") => {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: `${colors.blue}ℹ${colors.reset}`,
    success: `${colors.green}✅${colors.reset}`,
    error: `${colors.red}❌${colors.reset}`,
    warn: `${colors.yellow}⚠️${colors.reset}`,
  }[type];

  console.log(`[${timestamp}] ${prefix} ${message}`);
};

const logSection = (title: string) => {
  console.log("\n" + "=".repeat(80));
  console.log(`  ${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log("=".repeat(80));
};

interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "CONSUMER" | "FARMER" | "ADMIN";
  phone?: string;
}

const TEST_USERS: TestUser[] = [
  {
    email: "customer@test.com",
    password: "Test123!@#",
    firstName: "Test",
    lastName: "Customer",
    role: "CONSUMER",
    phone: "+1234567890",
  },
  {
    email: "farmer@test.com",
    password: "Test123!@#",
    firstName: "Test",
    lastName: "Farmer",
    role: "FARMER",
    phone: "+1234567891",
  },
  {
    email: "admin@test.com",
    password: "Test123!@#",
    firstName: "Test",
    lastName: "Admin",
    role: "ADMIN",
    phone: "+1234567892",
  },
];

async function createTestUsers() {
  logSection("🔐 PRODUCTION TEST USERS CREATION");

  // Verify database connection
  try {
    await database.$queryRaw`SELECT 1`;
    log("Database connection verified", "success");
  } catch (error) {
    log(`Database connection failed: ${error}`, "error");
    log("Please check your DATABASE_URL environment variable", "error");
    process.exit(1);
  }

  // Show database info (sanitized)
  const dbUrl = process.env.DATABASE_URL || "";
  const dbHost = dbUrl.match(/@([^:]+)/)?.[1] || "unknown";
  log(`Connected to database: ${dbHost}`, "info");

  // Confirm production environment
  if (dbHost.includes("vercel") || dbHost.includes("prod")) {
    log("⚠️  WARNING: You are about to create users in PRODUCTION database!", "warn");
    log("These users will have access to your production system", "warn");

    // In a real scenario, you might want to add a confirmation prompt here
    // For automation purposes, we'll proceed with a warning
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  logSection("👥 CREATING TEST USERS");

  const results = {
    created: 0,
    updated: 0,
    failed: 0,
  };

  for (const user of TEST_USERS) {
    try {
      log(`Processing: ${user.email} (${user.role})...`, "info");

      // Hash password (using high cost factor for production)
      const hashedPassword = await hash(user.password, 12);

      // Check if user exists
      const existingUser = await database.user.findUnique({
        where: { email: user.email },
        select: { id: true, email: true, role: true },
      });

      if (existingUser) {
        log(`User ${user.email} already exists, updating...`, "warn");

        // Update existing user
        await database.user.update({
          where: { email: user.email },
          data: {
            password: hashedPassword,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: "ACTIVE",
            emailVerified: new Date(),
            phone: user.phone,
          },
        });

        log(`Updated: ${user.email}`, "success");
        results.updated++;
      } else {
        // Create new user
        await database.user.create({
          data: {
            email: user.email,
            password: hashedPassword,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: "ACTIVE",
            emailVerified: new Date(),
            phone: user.phone,
          },
        });

        log(`Created: ${user.email}`, "success");
        results.created++;
      }

      // For farmers, create a test farm
      if (user.role === "FARMER") {
        const farmerUser = await database.user.findUnique({
          where: { email: user.email },
          select: { id: true },
        });

        if (farmerUser) {
          const existingFarm = await database.farm.findFirst({
            where: { ownerId: farmerUser.id },
          });

          if (!existingFarm) {
            await database.farm.create({
              data: {
                name: "Test Farm",
                slug: "test-farm",
                description: "This is a test farm for automated testing",
                ownerId: farmerUser.id,
                address: "123 Test Farm Road",
                city: "Šibenik",
                state: "Šibenik-Knin",
                zipCode: "22000",
                country: "Croatia",
                latitude: 43.7350,
                longitude: 15.8952,
                status: "ACTIVE",
                certifications: ["ORGANIC"],
              },
            });
            log(`Created test farm for ${user.email}`, "success");
          }
        }
      }

      // For admins, ensure they have admin privileges
      if (user.role === "ADMIN") {
        log(`Admin user ${user.email} has full platform access`, "info");
      }
    } catch (error) {
      log(`Failed to process ${user.email}: ${error}`, "error");
      results.failed++;
    }
  }

  logSection("📊 SUMMARY");

  console.log(`
  ${colors.green}✅ Created:${colors.reset}  ${results.created} users
  ${colors.yellow}📝 Updated:${colors.reset}  ${results.updated} users
  ${colors.red}❌ Failed:${colors.reset}   ${results.failed} users
  ${colors.cyan}📦 Total:${colors.reset}    ${TEST_USERS.length} users processed
  `);

  if (results.created > 0 || results.updated > 0) {
    logSection("🔑 TEST CREDENTIALS");

    console.log(`
  ${colors.bright}Customer Account:${colors.reset}
  Email:    customer@test.com
  Password: Test123!@#
  Role:     CONSUMER
  Access:   Customer portal, marketplace, cart, orders

  ${colors.bright}Farmer Account:${colors.reset}
  Email:    farmer@test.com
  Password: Test123!@#
  Role:     FARMER
  Access:   Farmer portal, products, orders, analytics

  ${colors.bright}Admin Account:${colors.reset}
  Email:    admin@test.com
  Password: Test123!@#
  Role:     ADMIN
  Access:   Full platform access, admin panel
    `);

    logSection("✅ NEXT STEPS");

    console.log(`
  1. Test authentication manually:
     ${colors.cyan}https://farmers-market-platform.vercel.app/login${colors.reset}

  2. Run inspection bot:
     ${colors.cyan}NEXT_PUBLIC_APP_URL=https://farmers-market-platform.vercel.app npm run inspect:website${colors.reset}

  3. Run E2E tests:
     ${colors.cyan}npm run test:e2e${colors.reset}

  4. Verify protected routes work:
     - Customer: /customer/dashboard
     - Farmer: /farmer/dashboard
     - Admin: /admin
    `);

    logSection("⚠️  SECURITY NOTES");

    console.log(`
  ${colors.yellow}WARNING: These are test accounts with known credentials${colors.reset}

  - Use ONLY for testing and development
  - Do NOT use for production data
  - Change or delete these accounts after testing
  - Monitor for unauthorized access
  - Keep credentials secure

  ${colors.bright}To delete test users:${colors.reset}
  ${colors.cyan}npm run test:users:delete${colors.reset}
    `);
  }

  logSection("✅ COMPLETED");
  log("Test users setup complete!", "success");
}

async function main() {
  try {
    await createTestUsers();
  } catch (error) {
    log(`Fatal error: ${error}`, "error");
    if (error instanceof Error) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { createTestUsers };
