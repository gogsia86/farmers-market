#!/usr/bin/env tsx
/**
 * Simple Database Verification Script
 * Verifies that the database has been properly seeded
 */

import "dotenv/config";
import { database } from "../src/lib/database/index";

async function verifyDatabase() {
  console.log("🔍 Verifying Database...\n");
  console.log("═".repeat(60));

  try {
    // Count records in each table
    const [
      userCount,
      farmCount,
      productCount,
      orderCount,
      reviewCount,
      farmPhotoCount,
    ] = await Promise.all([
      database.user.count(),
      database.farm.count(),
      database.product.count(),
      database.order.count(),
      database.review.count(),
      database.farmPhoto.count(),
    ]);

    console.log("\n📊 Database Record Counts:\n");
    console.log(`  Users:       ${userCount.toString().padStart(5)}`);
    console.log(`  Farms:       ${farmCount.toString().padStart(5)}`);
    console.log(`  Products:    ${productCount.toString().padStart(5)}`);
    console.log(`  Orders:      ${orderCount.toString().padStart(5)}`);
    console.log(`  Reviews:     ${reviewCount.toString().padStart(5)}`);
    console.log(`  Farm Photos: ${farmPhotoCount.toString().padStart(5)}`);

    console.log("\n" + "═".repeat(60));

    // Check if database needs seeding
    const needsSeeding = farmCount === 0 || productCount === 0;

    if (needsSeeding) {
      console.log("\n❌ DATABASE IS EMPTY OR INCOMPLETE\n");
      console.log("The database needs to be seeded.\n");
      console.log("🔧 To seed the database, run:");
      console.log("   npx prisma db seed\n");
      process.exit(1);
    }

    console.log("\n✅ DATABASE IS SEEDED\n");

    // Get sample data
    const farms = await database.farm.findMany({
      take: 3,
      select: {
        name: true,
        status: true,
        _count: {
          select: {
            products: true,
            photos: true,
          },
        },
      },
    });

    const products = await database.product.findMany({
      take: 5,
      select: {
        name: true,
        price: true,
        status: true,
        primaryPhotoUrl: true,
        farm: {
          select: {
            name: true,
          },
        },
      },
    });

    if (farms.length > 0) {
      console.log("🏪 Sample Farms:\n");
      farms.forEach((farm) => {
        console.log(`  • ${farm.name} (${farm.status})`);
        console.log(
          `    Products: ${farm._count.products} | Photos: ${farm._count.photos}`,
        );
      });
      console.log("");
    }

    if (products.length > 0) {
      console.log("🥬 Sample Products:\n");
      products.forEach((product) => {
        const hasPhoto = product.primaryPhotoUrl ? "📸" : "🚫";
        console.log(`  • ${product.name} - $${product.price} ${hasPhoto}`);
        console.log(
          `    Farm: ${product.farm.name} | Status: ${product.status}`,
        );
      });
      console.log("");
    }

    console.log("✅ Database contains data and appears healthy!\n");

    // Check for admin user
    const adminUser = await database.user.findFirst({
      where: {
        OR: [
          { email: "gogsia@gmail.com" },
          { email: "admin@farmersmarket.app" },
          { role: "ADMIN" },
        ],
      },
      select: {
        email: true,
        role: true,
        name: true,
      },
    });

    if (adminUser) {
      console.log("👤 Admin Account Found:");
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Name:  ${adminUser.name}`);
      console.log(`   Role:  ${adminUser.role}\n`);
      console.log("📝 Default Password: Admin123!\n");
    } else {
      console.log("⚠️  Warning: No admin account found!\n");
    }

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Error checking database:", error.message);
    console.error("\nMake sure:");
    console.error("1. DATABASE_URL is set in environment");
    console.error("2. Database is accessible");
    console.error("3. Prisma client is generated (npx prisma generate)\n");
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
}

// Run the verification
verifyDatabase();
