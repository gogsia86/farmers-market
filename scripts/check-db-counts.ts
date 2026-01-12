#!/usr/bin/env tsx

/**
 * Quick Database Count Checker
 * Checks how many records exist in key tables
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { database } from "@/lib/database";

async function main() {
  console.log("\n🔍 Checking database record counts...\n");

  try {
    const [
      userCount,
      farmCount,
      productCount,
      orderCount,
      reviewCount,
      sessionCount,
    ] = await Promise.all([
      database.user.count(),
      database.farm.count(),
      database.product.count(),
      database.order.count(),
      database.review.count(),
      database.session.count(),
    ]);

    console.log("📊 Database Record Counts:");
    console.log("─".repeat(40));
    console.log(`👤 Users:     ${userCount}`);
    console.log(`🏡 Farms:     ${farmCount}`);
    console.log(`🥕 Products:  ${productCount}`);
    console.log(`📦 Orders:    ${orderCount}`);
    console.log(`⭐ Reviews:   ${reviewCount}`);
    console.log(`🔐 Sessions:  ${sessionCount}`);
    console.log("─".repeat(40));

    // Check if database is seeded
    const isSeeded = userCount > 0 && farmCount > 0 && productCount > 0;

    if (isSeeded) {
      console.log("✅ Database appears to be seeded\n");

      // Show sample users
      const sampleUsers = await database.user.findMany({
        select: {
          email: true,
          role: true,
          status: true,
        },
        take: 5,
      });

      console.log("👥 Sample Users:");
      sampleUsers.forEach((user) => {
        console.log(`   ${user.email} (${user.role}) - ${user.status}`);
      });
      console.log();

      // Show sample farms
      const sampleFarms = await database.farm.findMany({
        select: {
          name: true,
          status: true,
          verificationStatus: true,
        },
        take: 5,
      });

      console.log("🏡 Sample Farms:");
      sampleFarms.forEach((farm) => {
        console.log(
          `   ${farm.name} - ${farm.status} (${farm.verificationStatus})`,
        );
      });
      console.log();
    } else {
      console.log("⚠️  Database is NOT seeded or partially seeded\n");
      console.log("💡 To seed the database, run:");
      console.log("   npm run db:seed\n");
    }
  } catch (error) {
    console.error("❌ Error checking database:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await database.$disconnect();
  });
