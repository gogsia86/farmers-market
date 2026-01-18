import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDatabaseState() {
  try {
    console.log("🔍 Checking database state...\n");

    const [userCount, farmCount, productCount, orderCount, reviewCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.farm.count(),
        prisma.product.count(),
        prisma.order.count(),
        prisma.review.count(),
      ]);

    console.log("📊 Current Database State:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Users:     ${userCount}`);
    console.log(`Farms:     ${farmCount}`);
    console.log(`Products:  ${productCount}`);
    console.log(`Orders:    ${orderCount}`);
    console.log(`Reviews:   ${reviewCount}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Check for Croatian admin
    const croatianAdmin = await prisma.user.findFirst({
      where: {
        email: "admin@hrvatski-tržnice.hr",
      },
    });

    if (croatianAdmin) {
      console.log("✅ Croatian admin already exists");
    } else {
      console.log("❌ Croatian admin not found");
    }

    // Check for Croatian farms
    const croatianFarms = await prisma.farm.findMany({
      where: {
        OR: [
          { country: "Croatia" },
          { country: "Hrvatska" },
          { country: "HR" },
          { state: "Croatia" },
          { state: "HR" },
        ],
      },
      take: 5,
    });

    if (croatianFarms.length > 0) {
      console.log(
        `✅ Found ${croatianFarms.length} Croatian farms (showing first 5):`,
      );
      croatianFarms.forEach((farm) => {
        console.log(`   - ${farm.name} (${farm.city})`);
      });
    } else {
      console.log("❌ No Croatian farms found");
    }

    console.log("\n💡 Recommendation:");
    if (userCount > 0 || farmCount > 0) {
      console.log("   Database contains data. Options:");
      console.log("   1. Clear database: npx prisma db push --force-reset");
      console.log("   2. Run Croatian seed: npm run seed:croatian");
      console.log("   Note: Seed will fail if Croatian admin already exists.");
    } else {
      console.log("   Database is empty. Safe to run: npm run seed:croatian");
    }
  } catch (error) {
    console.error("❌ Error checking database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState();
