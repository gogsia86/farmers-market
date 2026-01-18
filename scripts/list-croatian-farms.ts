import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function listCroatianFarms() {
  try {
    console.log("🇭🇷 Croatian Farmers Market - Database Summary\n");
    console.log("━".repeat(80));

    // Get all Croatian farms
    const croatianFarms = await prisma.farm.findMany({
      where: {
        OR: [
          { country: "HR" },
          { country: "Croatia" },
          { country: "Hrvatska" },
          { state: "HR" },
        ],
      },
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        products: {
          where: { status: "ACTIVE" },
        },
        certifications: true,
        _count: {
          select: {
            products: true,
            reviews: true,
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`\n📊 STATISTICS`);
    console.log("━".repeat(80));
    console.log(`Total Croatian Farms: ${croatianFarms.length}`);

    const totalProducts = croatianFarms.reduce(
      (sum, farm) => sum + farm._count.products,
      0
    );
    const totalOrders = croatianFarms.reduce(
      (sum, farm) => sum + farm._count.orders,
      0
    );
    const organicFarms = croatianFarms.filter((f) =>
      f.certifications.some((c) => c.type === "ORGANIC")
    ).length;

    console.log(`Total Products: ${totalProducts}`);
    console.log(`Total Orders: ${totalOrders}`);
    console.log(`Organic Certified Farms: ${organicFarms}`);

    // Group by city/region
    const farmsByCity = croatianFarms.reduce((acc, farm) => {
      const city = farm.city || "Unknown";
      if (!acc[city]) {
        acc[city] = [];
      }
      acc[city].push(farm);
      return acc;
    }, {} as Record<string, typeof croatianFarms>);

    console.log(`\nRegions: ${Object.keys(farmsByCity).length}`);

    console.log("\n\n🏘️  FARMS BY REGION");
    console.log("━".repeat(80));

    for (const [city, farms] of Object.entries(farmsByCity)) {
      console.log(`\n📍 ${city} (${farms.length} farms)`);
      console.log("─".repeat(80));

      farms.forEach((farm) => {
        const organic = farm.certifications.some((c) => c.type === "ORGANIC")
          ? "🌱"
          : "  ";
        const productsCount = farm._count.products;
        const reviewsCount = farm._count.reviews;

        console.log(
          `${organic} ${farm.name.padEnd(40)} | ${productsCount.toString().padStart(2)} products | ${reviewsCount} reviews`
        );
        console.log(
          `   Owner: ${farm.owner.firstName} ${farm.owner.lastName} (${farm.owner.email})`
        );
        console.log(`   Status: ${farm.status} | ${farm.description}`);
        console.log();
      });
    }

    console.log("\n\n🥬 PRODUCT CATEGORIES");
    console.log("━".repeat(80));

    const allProducts = await prisma.product.findMany({
      where: {
        farm: {
          OR: [
            { country: "HR" },
            { country: "Croatia" },
            { country: "Hrvatska" },
            { state: "HR" },
          ],
        },
        status: "ACTIVE",
      },
      select: {
        category: true,
        name: true,
        price: true,
        unit: true,
        organic: true,
      },
    });

    const productsByCategory = allProducts.reduce((acc, product) => {
      const category = product.category || "OTHER";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {} as Record<string, typeof allProducts>);

    for (const [category, products] of Object.entries(productsByCategory)) {
      const organicCount = products.filter((p) => p.organic).length;
      console.log(
        `\n${category.padEnd(20)} | ${products.length} products | ${organicCount} organic`
      );

      // Show sample products
      const samples = products.slice(0, 3);
      samples.forEach((product) => {
        const organicTag = product.organic ? "🌱" : "  ";
        console.log(
          `  ${organicTag} ${product.name.padEnd(35)} | €${product.price}/${product.unit}`
        );
      });

      if (products.length > 3) {
        console.log(`  ... and ${products.length - 3} more`);
      }
    }

    console.log("\n\n📝 TEST CREDENTIALS");
    console.log("━".repeat(80));
    console.log("Admin:  admin@hrvatski-tržnice.hr / Admin123!");
    console.log(
      "Farmer: marko.horvat@opg-horvat.hr / Farmer123! (or any farmer email)"
    );

    // Show a few farmer emails for testing
    console.log("\nOther Farmer Logins:");
    croatianFarms.slice(0, 5).forEach((farm) => {
      console.log(`  - ${farm.owner.email} / Farmer123!`);
    });

    console.log("\n\n✅ Croatian market is ready!");
    console.log("━".repeat(80));
    console.log(`\n🌐 Start the development server: npm run dev`);
    console.log(`📦 View database: npm run db:studio`);
    console.log(`🔍 Check farms again: npx tsx scripts/list-croatian-farms.ts\n`);
  } catch (error) {
    console.error("❌ Error listing Croatian farms:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listCroatianFarms();
