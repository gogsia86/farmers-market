#!/usr/bin/env tsx
/**
 * 🧪 TEST DATABASE SETUP SCRIPT
 * Prepares database for E2E testing with proper seed data
 *
 * Usage:
 *   npm run db:test:setup
 *   tsx scripts/setup-test-db.ts
 */

import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Setting up test database...\n");

  try {
    // Step 1: Reset database
    console.log("📋 Step 1: Resetting database schema...");
    execSync("npx prisma migrate reset --force --skip-seed", {
      stdio: "inherit",
    });
    console.log("✅ Database reset complete\n");

    // Step 2: Run migrations
    console.log("📋 Step 2: Running migrations...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log("✅ Migrations complete\n");

    // Step 3: Seed data
    console.log("📋 Step 3: Seeding test data...");
    execSync("npx prisma db seed", { stdio: "inherit" });
    console.log("✅ Seed data complete\n");

    // Step 4: Verify test users
    console.log("📋 Step 4: Verifying test users...");

    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@farmersmarket.app" },
    });

    const farmerUser = await prisma.user.findUnique({
      where: { email: "ana.romana@email.com" },
    });

    const consumerUser = await prisma.user.findUnique({
      where: { email: "divna.kapica@email.com" },
    });

    if (!adminUser) {
      throw new Error("❌ Admin user not found!");
    }
    if (!farmerUser) {
      throw new Error("❌ Farmer user not found!");
    }
    if (!consumerUser) {
      throw new Error("❌ Consumer user not found!");
    }

    console.log("✅ Test users verified:");
    console.log(`   - Admin: ${adminUser.email} (${adminUser.role})`);
    console.log(`   - Farmer: ${farmerUser.email} (${farmerUser.role})`);
    console.log(`   - Consumer: ${consumerUser.email} (${consumerUser.role})`);
    console.log("");

    // Step 5: Verify farms and products
    const farmCount = await prisma.farm.count();
    const productCount = await prisma.product.count();

    console.log("📊 Database Statistics:");
    console.log(`   - Farms: ${farmCount}`);
    console.log(`   - Products: ${productCount}`);
    console.log("");

    console.log("🎉 Test database setup complete!");
    console.log("");
    console.log("📝 Test Credentials:");
    console.log("   Admin Login:");
    console.log("     Email: admin@farmersmarket.app");
    console.log("     Password: DivineAdmin123!");
    console.log("");
    console.log("   Farmer Login:");
    console.log("     Email: ana.romana@email.com");
    console.log("     Password: FarmLife2024!");
    console.log("");
    console.log("   Consumer Login:");
    console.log("     Email: divna.kapica@email.com");
    console.log("     Password: HealthyEating2024!");
    console.log("");
  } catch (error) {
    console.error("❌ Error setting up test database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

await main();
