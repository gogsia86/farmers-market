#!/usr/bin/env tsx

/**
 * 🧪 CREATE TEST USERS - PRODUCTION TESTING SETUP
 *
 * Creates test users in the database for automated testing and bot inspection.
 * Safe to run multiple times (checks if users exist before creating).
 *
 * Features:
 * - Creates Customer, Farmer, and Admin test users
 * - Hashes passwords securely with bcrypt
 * - Validates environment variables
 * - Idempotent (safe to run multiple times)
 * - Colored output for better readability
 *
 * Usage:
 *   npm run test:users:create           # Create all test users
 *   tsx scripts/create-test-users.ts    # Direct execution
 *
 * Environment Variables Required:
 *   DATABASE_URL                        # PostgreSQL connection string
 *   TEST_CUSTOMER_EMAIL (optional)      # Default: customer@test.com
 *   TEST_CUSTOMER_PASSWORD (optional)   # Default: Test123!@#
 *   TEST_FARMER_EMAIL (optional)        # Default: farmer@test.com
 *   TEST_FARMER_PASSWORD (optional)     # Default: Test123!@#
 *   TEST_ADMIN_EMAIL (optional)         # Default: admin@test.com
 *   TEST_ADMIN_PASSWORD (optional)      # Default: Test123!@#
 */

// ✅ CANONICAL DATABASE IMPORT - Following .cursorrules
import * as bcrypt from "bcryptjs";
import "dotenv/config";
import { database } from "../src/lib/database/index.js";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  colors: {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
  },

  users: {
    customer: {
      email: process.env.TEST_CUSTOMER_EMAIL || "customer@test.com",
      password: process.env.TEST_CUSTOMER_PASSWORD || "Test123!@#",
      name: "Test Customer",
      role: "CONSUMER" as const,
    },
    farmer: {
      email: process.env.TEST_FARMER_EMAIL || "farmer@test.com",
      password: process.env.TEST_FARMER_PASSWORD || "Test123!@#",
      name: "Test Farmer",
      role: "FARMER" as const,
    },
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || "admin@test.com",
      password: process.env.TEST_ADMIN_PASSWORD || "Test123!@#",
      name: "Test Admin",
      role: "ADMIN" as const,
    },
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(
  message: string,
  level: "info" | "success" | "error" | "warn" = "info",
) {
  const c = CONFIG.colors;
  const icons = {
    info: "ℹ️",
    success: "✅",
    error: "❌",
    warn: "⚠️",
  };
  const colors = {
    info: c.blue,
    success: c.green,
    error: c.red,
    warn: c.yellow,
  };

  const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
  console.log(
    `${c.dim}[${timestamp}]${c.reset} ${icons[level]} ${colors[level]}${message}${c.reset}`,
  );
}

function logSection(title: string) {
  const c = CONFIG.colors;
  console.log("\n" + "═".repeat(80));
  console.log(`${c.bright}${c.cyan}  ${title}${c.reset}`);
  console.log("═".repeat(80));
}

// ============================================================================
// DATABASE FUNCTIONS
// ============================================================================

// ✅ Use canonical database singleton (no new PrismaClient instances)
const prisma = database;

/**
 * Hash password with bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

/**
 * Check if user exists by email
 */
async function userExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return !!user;
}

/**
 * Create a test user
 */
async function createTestUser(config: {
  email: string;
  password: string;
  name: string;
  role: "CONSUMER" | "FARMER" | "ADMIN";
}) {
  const { email, password, name, role } = config;

  log(`Creating ${role} user: ${email}`, "info");

  // Check if user already exists
  if (await userExists(email)) {
    log(`User ${email} already exists - skipping`, "warn");
    return null;
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      emailVerified: true, // Mark as verified for testing
      emailVerifiedAt: new Date(), // Set verification timestamp
    },
  });

  log(`Created ${role} user: ${email} (ID: ${user.id})`, "success");
  return user;
}

/**
 * Create test farm for farmer user
 */
async function createTestFarm(farmerId: string) {
  log(`Creating test farm for farmer ID: ${farmerId}`, "info");

  // Check if farm already exists
  const existingFarm = await prisma.farm.findFirst({
    where: { ownerId: farmerId },
  });

  if (existingFarm) {
    log("Test farm already exists - skipping", "warn");
    return existingFarm;
  }

  // Create farm
  const farm = await prisma.farm.create({
    data: {
      name: "Test Farm - Automated Testing",
      description:
        "This is a test farm created for automated testing and bot inspection. Fresh organic produce from our sustainable farm.",
      ownerId: farmerId,
      status: "ACTIVE",
      slug: `test-farm-${Date.now()}`,
      // Required contact fields
      email: "testfarm@example.com",
      phone: "+1-555-123-4567",
      // Required location fields
      address: "123 Test Farm Road",
      city: "Farmville",
      state: "California",
      zipCode: "12345",
      country: "US",
      latitude: 37.7749,
      longitude: -122.4194,
      // Optional agricultural metadata
      isOrganic: true,
      isBiodynamic: false,
      yearEstablished: 2020,
    },
  });

  log(`Created test farm: ${farm.name} (ID: ${farm.id})`, "success");
  return farm;
}

/**
 * Create test products for farm
 */
async function createTestProducts(farmId: string) {
  log(`Creating test products for farm ID: ${farmId}`, "info");

  // Check if products already exist
  const existingProducts = await prisma.product.count({
    where: { farmId },
  });

  if (existingProducts > 0) {
    log(`Test products already exist (${existingProducts}) - skipping`, "warn");
    return;
  }

  const products = [
    {
      name: "Organic Tomatoes",
      description:
        "Fresh, juicy organic tomatoes. Perfect for salads and cooking.",
      price: 5.99,
      unit: "lb",
      category: "VEGETABLES",
      inStock: true,
      quantity: 100,
    },
    {
      name: "Farm Fresh Eggs",
      description: "Free-range chicken eggs from happy hens.",
      price: 6.99,
      unit: "dozen",
      category: "DAIRY_EGGS",
      inStock: true,
      quantity: 50,
    },
    {
      name: "Organic Lettuce",
      description: "Crisp, fresh organic lettuce. Harvested daily.",
      price: 3.99,
      unit: "head",
      category: "VEGETABLES",
      inStock: true,
      quantity: 75,
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.create({
      data: {
        ...productData,
        farmId,
        slug: `${productData.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      },
    });

    log(`Created product: ${product.name}`, "success");
  }
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  try {
    logSection("🧪 TEST USERS SETUP - PRODUCTION TESTING");

    // Validate environment
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }

    log(
      `Database: ${process.env.DATABASE_URL.split("@")[1] || "connected"}`,
      "info",
    );

    // Create customer
    logSection("👤 CREATING CUSTOMER USER");
    const customer = await createTestUser(CONFIG.users.customer);
    if (customer) {
      log(`Email: ${CONFIG.users.customer.email}`, "info");
      log(`Password: ${CONFIG.users.customer.password}`, "info");
    }

    // Create farmer
    logSection("🌾 CREATING FARMER USER");
    const farmer = await createTestUser(CONFIG.users.farmer);
    if (farmer) {
      log(`Email: ${CONFIG.users.farmer.email}`, "info");
      log(`Password: ${CONFIG.users.farmer.password}`, "info");

      // Create test farm for farmer
      const farm = await createTestFarm(farmer.id);
      if (farm) {
        // Create test products
        await createTestProducts(farm.id);
      }
    }

    // Create admin
    logSection("👨‍💼 CREATING ADMIN USER");
    const admin = await createTestUser(CONFIG.users.admin);
    if (admin) {
      log(`Email: ${CONFIG.users.admin.email}`, "info");
      log(`Password: ${CONFIG.users.admin.password}`, "info");
    }

    // Summary
    logSection("📊 SUMMARY");
    const totalUsers = await prisma.user.count();
    const totalFarms = await prisma.farm.count();
    const totalProducts = await prisma.product.count();

    console.log(
      `${CONFIG.colors.bright}Database Statistics:${CONFIG.colors.reset}`,
    );
    console.log(`  Total Users:    ${totalUsers}`);
    console.log(`  Total Farms:    ${totalFarms}`);
    console.log(`  Total Products: ${totalProducts}`);

    logSection("✅ TEST USERS SETUP COMPLETE");
    console.log(
      `\n${CONFIG.colors.green}${CONFIG.colors.bright}Test credentials:${CONFIG.colors.reset}\n`,
    );
    console.log(`${CONFIG.colors.cyan}Customer:${CONFIG.colors.reset}`);
    console.log(`  Email:    ${CONFIG.users.customer.email}`);
    console.log(`  Password: ${CONFIG.users.customer.password}\n`);
    console.log(`${CONFIG.colors.cyan}Farmer:${CONFIG.colors.reset}`);
    console.log(`  Email:    ${CONFIG.users.farmer.email}`);
    console.log(`  Password: ${CONFIG.users.farmer.password}\n`);
    console.log(`${CONFIG.colors.cyan}Admin:${CONFIG.colors.reset}`);
    console.log(`  Email:    ${CONFIG.users.admin.email}`);
    console.log(`  Password: ${CONFIG.users.admin.password}\n`);

    console.log(
      `${CONFIG.colors.yellow}⚠️  Security Note:${CONFIG.colors.reset}`,
    );
    console.log(`  These are TEST users for automated testing only.`);
    console.log(`  Do NOT use these credentials for real accounts.`);
    console.log(`  Change passwords immediately in production!\n`);

    process.exit(0);
  } catch (error) {
    log(`Fatal error: ${error}`, "error");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================================================
// EXECUTION
// ============================================================================

main();
