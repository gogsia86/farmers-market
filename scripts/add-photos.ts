#!/usr/bin/env tsx
/**
 * Add Photos to Farms and Products
 * Adds realistic stock photos from Unsplash to all farms and products
 */

import "dotenv/config";
import { database } from "../src/lib/database/index";

// Unsplash photo collections for farms and products
const FARM_PHOTOS = [
  {
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80",
    caption: "Lush green farm fields",
    altText: "Aerial view of green farm fields"
  },
  {
    url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80",
    caption: "Traditional red barn",
    altText: "Red barn in farm setting"
  },
  {
    url: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80",
    caption: "Organic vegetable farm",
    altText: "Rows of organic vegetables"
  },
  {
    url: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&q=80",
    caption: "Farmers market stand",
    altText: "Fresh produce at farmers market"
  },
  {
    url: "https://images.unsplash.com/photo-1566281796817-93bc94d7dbd2?w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1566281796817-93bc94d7dbd2?w=400&q=80",
    caption: "Greenhouse farming",
    altText: "Modern greenhouse facility"
  },
  {
    url: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&q=80",
    caption: "Farm landscape",
    altText: "Beautiful farm landscape view"
  }
];

const PRODUCT_PHOTOS: Record<string, string[]> = {
  // Vegetables
  tomatoes: [
    "https://images.unsplash.com/photo-1546470427-227e9e83fbb5?w=800&q=80",
    "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80"
  ],
  lettuce: [
    "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&q=80",
    "https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?w=800&q=80"
  ],
  corn: [
    "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80",
    "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80"
  ],
  carrots: [
    "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80",
    "https://images.unsplash.com/photo-1582515073490-39981397c445?w=800&q=80"
  ],
  broccoli: [
    "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=800&q=80",
    "https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=800&q=80"
  ],
  spinach: [
    "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80",
    "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&q=80"
  ],
  cucumber: [
    "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=800&q=80",
    "https://images.unsplash.com/photo-1589927986089-35812378d3c7?w=800&q=80"
  ],
  peppers: [
    "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&q=80",
    "https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=800&q=80"
  ],
  squash: [
    "https://images.unsplash.com/photo-1570991619476-7e77e60ab23b?w=800&q=80",
    "https://images.unsplash.com/photo-1634834368623-6e6f0b33c9e0?w=800&q=80"
  ],
  zucchini: [
    "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=800&q=80",
    "https://images.unsplash.com/photo-1568584711271-e691ee6c85b8?w=800&q=80"
  ],

  // Fruits
  strawberries: [
    "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&q=80",
    "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=800&q=80"
  ],
  blueberries: [
    "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&q=80",
    "https://images.unsplash.com/photo-1606672896155-b3ff2c14c6c9?w=800&q=80"
  ],
  apples: [
    "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&q=80",
    "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80"
  ],
  peaches: [
    "https://images.unsplash.com/photo-1629828874514-d5e0cc565a95?w=800&q=80",
    "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=800&q=80"
  ],
  watermelon: [
    "https://images.unsplash.com/photo-1587049352846-4a222e784422?w=800&q=80",
    "https://images.unsplash.com/photo-1621583832267-f628085c9191?w=800&q=80"
  ],

  // Eggs & Dairy
  eggs: [
    "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&q=80",
    "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800&q=80"
  ],
  milk: [
    "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&q=80",
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80"
  ],
  cheese: [
    "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=800&q=80",
    "https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=800&q=80"
  ],

  // Herbs
  basil: [
    "https://images.unsplash.com/photo-1618375569909-3c8616cf7122?w=800&q=80",
    "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=800&q=80"
  ],
  herbs: [
    "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=800&q=80",
    "https://images.unsplash.com/photo-1557296387-5358ad7997bb?w=800&q=80"
  ],

  // Default fallback
  default: [
    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80",
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"
  ]
};

function getProductPhotoKey(productName: string): string {
  const name = productName.toLowerCase();

  if (name.includes("tomato")) return "tomatoes";
  if (name.includes("lettuce") || name.includes("salad")) return "lettuce";
  if (name.includes("corn")) return "corn";
  if (name.includes("carrot")) return "carrots";
  if (name.includes("broccoli")) return "broccoli";
  if (name.includes("spinach")) return "spinach";
  if (name.includes("cucumber")) return "cucumber";
  if (name.includes("pepper")) return "peppers";
  if (name.includes("squash")) return "squash";
  if (name.includes("zucchini")) return "zucchini";

  if (name.includes("strawberr")) return "strawberries";
  if (name.includes("blueberr")) return "blueberries";
  if (name.includes("apple")) return "apples";
  if (name.includes("peach")) return "peaches";
  if (name.includes("melon")) return "watermelon";

  if (name.includes("egg")) return "eggs";
  if (name.includes("milk")) return "milk";
  if (name.includes("cheese")) return "cheese";

  if (name.includes("basil")) return "basil";
  if (name.includes("herb") || name.includes("parsley") || name.includes("cilantro")) return "herbs";

  return "default";
}

async function addPhotosToFarms() {
  console.log("\n📸 Adding photos to farms...\n");

  try {
    const farms = await database.farm.findMany({
      select: { id: true, name: true }
    });

    console.log(`Found ${farms.length} farms\n`);

    for (let i = 0; i < farms.length; i++) {
      const farm = farms[i];
      const photoIndex = i % FARM_PHOTOS.length;
      const photo = FARM_PHOTOS[photoIndex];

      // Check if farm already has photos
      const existingPhotos = await database.farmPhoto.count({
        where: { farmId: farm.id }
      });

      if (existingPhotos > 0) {
        console.log(`  ⏭️  ${farm.name} - Already has ${existingPhotos} photo(s), skipping`);
        continue;
      }

      // Add primary photo
      await database.farmPhoto.create({
        data: {
          farmId: farm.id,
          photoUrl: photo.url,
          thumbnailUrl: photo.thumbnail,
          caption: photo.caption,
          altText: photo.altText,
          isPrimary: true,
          sortOrder: 0,
          width: 1200,
          height: 800
        }
      });

      // Add secondary photo if available
      if (FARM_PHOTOS[photoIndex + 1]) {
        const secondaryPhoto = FARM_PHOTOS[(photoIndex + 1) % FARM_PHOTOS.length];
        await database.farmPhoto.create({
          data: {
            farmId: farm.id,
            photoUrl: secondaryPhoto.url,
            thumbnailUrl: secondaryPhoto.thumbnail,
            caption: secondaryPhoto.caption,
            altText: secondaryPhoto.altText,
            isPrimary: false,
            sortOrder: 1,
            width: 1200,
            height: 800
          }
        });
      }

      console.log(`  ✅ ${farm.name} - Added 2 photos`);
    }

    console.log(`\n✅ Added photos to ${farms.length} farms\n`);
  } catch (error: any) {
    console.error("❌ Error adding farm photos:", error.message);
    throw error;
  }
}

async function addPhotosToProducts() {
  console.log("\n📸 Adding photos to products...\n");

  try {
    const products = await database.product.findMany({
      select: { id: true, name: true, primaryPhotoUrl: true }
    });

    console.log(`Found ${products.length} products\n`);

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      // Skip if already has photo
      if (product.primaryPhotoUrl) {
        skipped++;
        continue;
      }

      const photoKey = getProductPhotoKey(product.name);
      const photos = PRODUCT_PHOTOS[photoKey] || PRODUCT_PHOTOS.default;
      const primaryPhoto = photos[0];
      const additionalPhotos = photos.slice(0, 3);

      await database.product.update({
        where: { id: product.id },
        data: {
          primaryPhotoUrl: primaryPhoto,
          photoUrls: additionalPhotos,
          images: additionalPhotos
        }
      });

      console.log(`  ✅ ${product.name} - Added ${additionalPhotos.length} photo(s)`);
      updated++;
    }

    console.log(`\n✅ Updated ${updated} products with photos`);
    if (skipped > 0) {
      console.log(`⏭️  Skipped ${skipped} products (already have photos)\n`);
    }
  } catch (error: any) {
    console.error("❌ Error adding product photos:", error.message);
    throw error;
  }
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  📸 Add Photos to Farms and Products");
  console.log("═══════════════════════════════════════════════════════════");

  try {
    // Add photos to farms
    await addPhotosToFarms();

    // Add photos to products
    await addPhotosToProducts();

    console.log("═══════════════════════════════════════════════════════════");
    console.log("  ✅ Photos added successfully!");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("\n💡 Photos are from Unsplash and are free to use");
    console.log("🔍 Verify by running: npm run db:verify\n");

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    console.error("\nStack:", error.stack);
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
}

main();
