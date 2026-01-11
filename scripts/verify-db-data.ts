#!/usr/bin/env tsx

/**
 * Verify Vercel Database Data
 *
 * This script connects to the Vercel database and displays
 * a summary of the seeded data.
 */

import { config } from "dotenv";
config({ path: ".env.vercel.local" });

import { database } from "../src/lib/database";

async function main() {
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log("║                                                            ║");
  console.log("║          🔍 VERCEL DATABASE VERIFICATION 🔍                ║");
  console.log("║                                                            ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );

  try {
    // Test connection
    console.log("🔌 Testing database connection...");
    await database.$connect();
    console.log("✅ Database connected successfully!\n");

    // Get users
    console.log("👥 Fetching users...");
    const users = await database.user.findMany({
      select: {
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    console.log(`✅ Found ${users.length} users:\n`);
    users.forEach((user) => {
      const roleEmoji =
        user.role === "ADMIN" ? "👑" : user.role === "FARMER" ? "👨‍🌾" : "🛒";
      console.log(`  ${roleEmoji} ${user.email}`);
      console.log(`     Role: ${user.role}`);
      console.log(`     Name: ${user.firstName} ${user.lastName}`);
      console.log("");
    });

    // Get farms
    console.log("🏡 Fetching farms...");
    const farms = await database.farm.findMany({
      select: {
        name: true,
        city: true,
        state: true,
        status: true,
        owner: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    console.log(`✅ Found ${farms.length} farms:\n`);
    farms.forEach((farm) => {
      console.log(`  🌾 ${farm.name}`);
      console.log(`     Location: ${farm.city}, ${farm.state}`);
      console.log(`     Status: ${farm.status}`);
      console.log(`     Owner: ${farm.owner.email}`);
      console.log("");
    });

    // Get products
    console.log("🥬 Fetching products...");
    const products = await database.product.findMany({
      select: {
        name: true,
        category: true,
        price: true,
        status: true,
        farm: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 10,
    });

    const totalProducts = await database.product.count();
    console.log(`✅ Found ${totalProducts} products (showing first 10):\n`);
    products.forEach((product) => {
      console.log(`  🛒 ${product.name}`);
      console.log(`     Category: ${product.category}`);
      console.log(`     Price: $${product.price}`);
      console.log(`     Farm: ${product.farm.name}`);
      console.log(`     Status: ${product.status}`);
      console.log("");
    });

    // Get reviews
    console.log("⭐ Fetching reviews...");
    const reviewCount = await database.review.count();
    console.log(`✅ Found ${reviewCount} reviews\n`);

    // Get orders
    console.log("📦 Fetching orders...");
    const orderCount = await database.order.count();
    console.log(`✅ Found ${orderCount} orders\n`);

    // Summary
    console.log(
      "╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║                   📊 DATABASE SUMMARY                      ║",
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝\n",
    );
    console.log(`  Users:     ${users.length}`);
    console.log(`  Farms:     ${farms.length}`);
    console.log(`  Products:  ${totalProducts}`);
    console.log(`  Reviews:   ${reviewCount}`);
    console.log(`  Orders:    ${orderCount}`);
    console.log("");

    // Test credentials
    console.log(
      "╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║               🔐 TEST CREDENTIALS                          ║",
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝\n",
    );

    const admin = users.find((u) => u.role === "ADMIN");
    const farmer = users.find((u) => u.role === "FARMER");
    const consumer = users.find((u) => u.role === "CONSUMER");

    if (admin) {
      console.log("  👑 Admin Account:");
      console.log(`     Email:    ${admin.email}`);
      console.log("     Password: Admin123!");
      console.log("");
    }

    if (farmer) {
      console.log("  👨‍🌾 Farmer Account:");
      console.log(`     Email:    ${farmer.email}`);
      console.log("     Password: Farmer123!");
      console.log("");
    }

    if (consumer) {
      console.log("  🛒 Consumer Account:");
      console.log(`     Email:    ${consumer.email}`);
      console.log("     Password: Consumer123!");
      console.log("");
    }

    console.log(
      "╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║                   ✅ VERIFICATION COMPLETE                 ║",
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝\n",
    );

    console.log("🚀 Next Steps:\n");
    console.log("  1. Login to your app:");
    console.log("     https://farmers-market-platform.vercel.app/login\n");
    console.log("  2. Browse your data:");
    console.log("     npm run db:studio\n");
    console.log("  3. Deploy to production:");
    console.log("     git push origin master\n");
  } catch (error) {
    console.error("❌ Error verifying database:", error);
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
}

main();
