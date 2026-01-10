#!/usr/bin/env node
/**
 * Quick Database Data Check
 * Checks if Vercel database is properly seeded with data
 */

// Load environment variables from .env.vercel.local
require("dotenv").config({ path: ".env.vercel.local" });

const { PrismaClient } = require("@prisma/client");

// Use Prisma Accelerate URL
const accelerateUrl =
  process.env.Database_PRISMA_DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL;

if (!accelerateUrl) {
  console.error("❌ No database URL found in environment variables!");
  console.error("Please run: vercel env pull .env.vercel.local");
  process.exit(1);
}

const prisma = new PrismaClient({
  accelerateUrl: accelerateUrl,
});

async function checkDatabaseData() {
  console.log("🔍 Checking Vercel Database Data...\n");
  console.log("═".repeat(60));

  try {
    // Count records in each table
    const [
      userCount,
      farmCount,
      productCount,
      orderCount,
      reviewCount,
      photoCount,
      locationCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.farm.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.review.count(),
      prisma.photo.count(),
      prisma.location.count(),
    ]);

    console.log("\n📊 Database Record Counts:\n");
    console.log(`  Users:      ${userCount.toString().padStart(5)}`);
    console.log(`  Farms:      ${farmCount.toString().padStart(5)}`);
    console.log(`  Products:   ${productCount.toString().padStart(5)}`);
    console.log(`  Orders:     ${orderCount.toString().padStart(5)}`);
    console.log(`  Reviews:    ${reviewCount.toString().padStart(5)}`);
    console.log(`  Photos:     ${photoCount.toString().padStart(5)}`);
    console.log(`  Locations:  ${locationCount.toString().padStart(5)}`);

    console.log("\n" + "═".repeat(60));

    // Check if database needs seeding
    const needsSeeding = farmCount === 0 || productCount === 0;

    if (needsSeeding) {
      console.log("\n❌ DATABASE IS EMPTY OR INCOMPLETE\n");
      console.log("The database needs to be seeded.\n");
      console.log("🔧 To seed the database, run:");
      console.log("   bash scripts/reseed-vercel-now.sh --force\n");

      console.log("📋 Expected counts after seeding:");
      console.log("   Users:      9 (1 admin, 5 farmers, 3 customers)");
      console.log("   Farms:      5");
      console.log("   Products:   12+");
      console.log("   Orders:     Sample orders");
      console.log("   Reviews:    Sample reviews");
      console.log("   Photos:     Sample product photos\n");

      return false;
    }

    console.log("\n✅ DATABASE IS SEEDED\n");

    // Get sample data
    const farms = await prisma.farm.findMany({
      take: 3,
      select: {
        name: true,
        status: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const products = await prisma.product.findMany({
      take: 5,
      select: {
        name: true,
        price: true,
        status: true,
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
        console.log(`    Products: ${farm._count.products}`);
      });
      console.log("");
    }

    if (products.length > 0) {
      console.log("🥬 Sample Products:\n");
      products.forEach((product) => {
        console.log(`  • ${product.name} - $${product.price}`);
        console.log(
          `    Farm: ${product.farm.name} | Status: ${product.status}`,
        );
      });
      console.log("");
    }

    console.log("✅ Database contains data and appears healthy!\n");

    // Check for admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: "admin@farmersmarket.app" }, { role: "ADMIN" }],
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
      console.log("📝 Login credentials in: LOGIN_CREDENTIALS.md\n");
    } else {
      console.log("⚠️  Warning: No admin account found!\n");
    }

    return true;
  } catch (error) {
    console.error("\n❌ Error checking database:", error.message);
    console.error("\nMake sure:");
    console.error("1. DATABASE_URL is set in .env.vercel.local");
    console.error("2. Run: npx vercel env pull .env.vercel.local");
    console.error("3. Database is accessible\n");
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkDatabaseData()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
