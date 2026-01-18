#!/usr/bin/env tsx
/**
 * Quick Database Check - Croatian Farmers Market
 * Verifies that Croatian data has been seeded
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkCroatianData() {
  console.log("\n🇭🇷 CROATIAN FARMERS MARKET - DATA VERIFICATION 🇭🇷\n");
  console.log("═".repeat(60));

  try {
    // Test database connection
    console.log("\n📡 Testing database connection...");
    await prisma.$connect();
    console.log("✅ Database connected successfully!\n");

    // Check Farms
    const farmCount = await prisma.farm.count();
    console.log(`🏡 Total Farms: ${farmCount}`);

    if (farmCount > 0) {
      const sampleFarms = await prisma.farm.findMany({
        take: 5,
        select: {
          name: true,
          city: true,
          state: true,
          verificationStatus: true,
        },
      });
      console.log("\n   Sample Croatian OPG farms:");
      sampleFarms.forEach((farm, i) => {
        const status = farm.verificationStatus === "VERIFIED" ? "✓" : "○";
        const location = farm.city || farm.state || "N/A";
        console.log(`   ${status} ${farm.name} (${location})`);
      });
    } else {
      console.log("   ⚠️  No farms found. Run: npm run seed:croatian");
    }

    // Check Products
    const productCount = await prisma.product.count();
    console.log(`\n🥬 Total Products: ${productCount}`);

    if (productCount > 0) {
      const sampleProducts = await prisma.product.findMany({
        take: 5,
        select: { name: true, category: true, price: true },
      });
      console.log("\n   Sample Croatian products:");
      sampleProducts.forEach((product) => {
        console.log(
          `   • ${product.name} - €${product.price} (${product.category})`,
        );
      });
    } else {
      console.log("   ⚠️  No products found. Run: npm run seed:croatian");
    }

    // Check Users
    const userCount = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    const farmerCount = await prisma.user.count({ where: { role: "FARMER" } });
    const customerCount = await prisma.user.count({
      where: { role: "CONSUMER" },
    });

    console.log(`\n👥 Total Users: ${userCount}`);
    console.log(`   • Admins: ${adminCount}`);
    console.log(`   • Farmers: ${farmerCount}`);
    console.log(`   • Customers: ${customerCount}`);

    if (userCount > 0) {
      console.log("\n   Test credentials (from seed):");
      console.log("   📧 Admin:    admin@hrvatski-tržnice.hr / Admin123!");
      console.log("   📧 Farmer:   marko.horvat@opg.hr / Farmer123!");
      console.log("   📧 Customer: marija.kovac@gmail.com / Consumer123!");
    } else {
      console.log("   ⚠️  No users found. Run: npm run seed:croatian");
    }

    // Check Orders
    const orderCount = await prisma.order.count();
    console.log(`\n📦 Total Orders: ${orderCount}`);

    // Check Certifications (if table exists)
    let certCount = 0;
    try {
      certCount = await prisma.certification.count();
      console.log(`📜 Total Certifications: ${certCount}`);

      if (certCount > 0) {
        const hrEkoCount = await prisma.certification.count({
          where: { name: { contains: "HR-EKO" } },
        });
        console.log(`   • HR-EKO Certifications: ${hrEkoCount}`);
      }
    } catch (error) {
      console.log(`📜 Total Certifications: N/A (table may not exist)`);
    }

    // Check Reviews
    let reviewCount = 0;
    try {
      reviewCount = await prisma.review.count();
      console.log(`⭐ Total Reviews: ${reviewCount}`);
    } catch (error) {
      console.log(`⭐ Total Reviews: N/A (table may not exist)`);
    }

    console.log("\n" + "═".repeat(60));

    // Summary
    if (farmCount > 40 && productCount > 150 && userCount > 20) {
      console.log("\n✅ CROATIAN DATA FULLY SEEDED!");
      console.log("   Ready to launch! 🚀\n");
      console.log("📝 Next steps:");
      console.log("   1. npm run dev");
      console.log("   2. Visit http://localhost:3001");
      console.log("   3. Login with test credentials above\n");
    } else if (farmCount > 0 || productCount > 0 || userCount > 0) {
      console.log("\n⚠️  PARTIAL DATA DETECTED");
      console.log("   Some data exists but Croatian seed may be incomplete.\n");
      console.log("📝 To reseed:");
      console.log("   npm run db:reset  # Resets and reseeds\n");
    } else {
      console.log("\n❌ NO DATA FOUND");
      console.log("   Database is empty. Seed Croatian data now!\n");
      console.log("📝 Run:");
      console.log("   npm run seed:croatian\n");
    }
  } catch (error) {
    console.error("\n❌ Database check failed:");
    console.error(error instanceof Error ? error.message : error);
    console.log("\n📝 Troubleshooting:");
    console.log("   1. Check DATABASE_URL in .env");
    console.log("   2. Ensure PostgreSQL is running");
    console.log("   3. Run: npm run db:push\n");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkCroatianData();
