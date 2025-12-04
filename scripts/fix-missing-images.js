// Fix Missing Images - Update all farms and products to use placeholder images
// This script updates database records to use the existing placeholder SVG files

const { database } = require("../src/lib/database");

async function fixMissingImages() {
  console.log("🖼️  Fixing Missing Images...\n");

  try {
    // Update Farm Images
    console.log("📸 Updating farm images to use placeholders...");
    const farmsUpdated = await database.farm.updateMany({
      where: {
        OR: [
          { logoUrl: { contains: "/images/farms/" } },
          { bannerUrl: { contains: "/images/farms/" } },
          { logoUrl: null },
          { bannerUrl: null },
        ],
      },
      data: {
        logoUrl: "/images/placeholder-farm.svg",
        bannerUrl: "/images/placeholder-farm.svg",
      },
    });
    console.log(`  ✅ Updated ${farmsUpdated.count} farms\n`);

    // Update Product Images
    console.log("📸 Updating product images to use placeholders...");
    const productsUpdated = await database.product.updateMany({
      where: {
        OR: [
          { primaryPhotoUrl: { contains: "/images/products/" } },
          { primaryPhotoUrl: null },
        ],
      },
      data: {
        primaryPhotoUrl: "/images/placeholder-product.svg",
        photoUrls: ["/images/placeholder-product.svg"],
      },
    });
    console.log(`  ✅ Updated ${productsUpdated.count} products\n`);

    // Verify Featured Farms
    console.log("🌾 Verifying featured farms...");
    const featuredFarms = await database.farm.findMany({
      where: {
        status: "ACTIVE",
        verificationStatus: "VERIFIED",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        verificationStatus: true,
        logoUrl: true,
        bannerUrl: true,
        _count: {
          select: {
            products: true,
            reviews: true,
          },
        },
      },
      take: 10,
    });

    console.log(`  ✅ Found ${featuredFarms.length} active & verified farms\n`);

    if (featuredFarms.length > 0) {
      console.log("📋 Featured Farms:");
      featuredFarms.forEach((farm) => {
        console.log(`  • ${farm.name} (${farm.slug})`);
        console.log(
          `    Status: ${farm.status} | Verified: ${farm.verificationStatus}`,
        );
        console.log(`    Logo: ${farm.logoUrl}`);
        console.log(
          `    Products: ${farm._count.products} | Reviews: ${farm._count.reviews}`,
        );
        console.log("");
      });
    }

    console.log("✅ Image fix complete!\n");
    console.log("🎯 Next steps:");
    console.log("  1. Refresh your browser: http://localhost:3001");
    console.log(
      "  2. Featured farms should now display with placeholder images",
    );
    console.log(
      "  3. Later, you can replace placeholders with real farm/product photos\n",
    );
  } catch (error) {
    console.error("❌ Error fixing images:", error);
    throw error;
  } finally {
    await database.$disconnect();
  }
}

// Run the script
fixMissingImages()
  .then(() => {
    console.log("🎉 Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
