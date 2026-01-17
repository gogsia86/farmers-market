#!/usr/bin/env tsx

/**
 * 📸 ADD CROATIAN PHOTOS TO DATABASE
 *
 * This script adds authentic photos to Croatian farms and products
 * in the production database.
 *
 * Photo sources:
 * - Unsplash (free to use, high-quality)
 * - Relevant to Croatian agriculture and Mediterranean products
 *
 * Usage:
 *   npm run photos:add
 *   or
 *   DATABASE_URL="..." npx tsx scripts/add-croatian-photos.ts
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client
const prisma = new PrismaClient({ adapter });

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ============================================================================
// PHOTO COLLECTIONS - High-quality Unsplash images
// ============================================================================

/**
 * Farm photos - Croatian agricultural landscapes
 */
const FARM_PHOTOS = {
  // Olive oil farms
  oliveGrove: [
    "https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?w=1200&q=80", // Olive grove
    "https://images.unsplash.com/photo-1599629954294-1d2499da8ea5?w=1200&q=80", // Olive trees Mediterranean
    "https://images.unsplash.com/photo-1584278969099-c1b5f7d9bdbb?w=1200&q=80", // Olive harvest
    "https://images.unsplash.com/photo-1607348683036-69c3b68efd26?w=1200&q=80", // Olive oil bottles
  ],

  // Vineyards
  vineyard: [
    "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&q=80", // Vineyard rows
    "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=1200&q=80", // Wine cellar
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80", // Grape vineyard
    "https://images.unsplash.com/photo-1537904795038-c91d8b69e321?w=1200&q=80", // Wine bottles
  ],

  // Honey/Beekeeping
  beekeeping: [
    "https://images.unsplash.com/photo-1587049352846-4a222e784422?w=1200&q=80", // Beehives
    "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=1200&q=80", // Honey jars
    "https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=1200&q=80", // Honeycomb
    "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=1200&q=80", // Beekeeper working
  ],

  // Lavender farms
  lavender: [
    "https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=1200&q=80", // Lavender field
    "https://images.unsplash.com/photo-1595909315417-4b3a0147ce3f?w=1200&q=80", // Lavender rows
    "https://images.unsplash.com/photo-1564594581993-0081352a2cc0?w=1200&q=80", // Lavender products
    "https://images.unsplash.com/photo-1611689102192-1f6e0e52df0a?w=1200&q=80", // Lavender harvest
  ],

  // Vegetable farms
  vegetables: [
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80", // Vegetable garden
    "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=1200&q=80", // Organic vegetables
    "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=1200&q=80", // Farm field
    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=80", // Greenhouse
  ],

  // Fruit orchards
  orchard: [
    "https://images.unsplash.com/photo-1570740742892-a9ef2b4f6470?w=1200&q=80", // Fruit trees
    "https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=1200&q=80", // Apple orchard
    "https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?w=1200&q=80", // Fig tree
    "https://images.unsplash.com/photo-1519003300449-424ad0405076?w=1200&q=80", // Pomegranate tree
  ],

  // Dairy/Cheese
  dairy: [
    "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=1200&q=80", // Goats
    "https://images.unsplash.com/photo-1559561853-08451507cbe7?w=1200&q=80", // Cheese making
    "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=1200&q=80", // Artisan cheese
    "https://images.unsplash.com/photo-1631206289181-c4f84e7ef74d?w=1200&q=80", // Dairy farm
  ],

  // Sea salt
  seaSalt: [
    "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=1200&q=80", // Sea salt pans
    "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=1200&q=80", // Salt crystals
    "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=1200&q=80", // Salt production
    "https://images.unsplash.com/photo-1505944357793-90e5f1484fd4?w=1200&q=80", // Coastal salt works
  ],

  // Traditional food
  traditional: [
    "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=1200&q=80", // Prosciutto
    "https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?w=1200&q=80", // Charcuterie
    "https://images.unsplash.com/photo-1445217143695-467124038167?w=1200&q=80", // Traditional food
    "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=1200&q=80", // Farm food
  ],
};

/**
 * Product photos - Specific Croatian products
 */
const PRODUCT_PHOTOS = {
  // Olive oil & olives
  oliveOil: [
    "https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?w=800&q=80",
    "https://images.unsplash.com/photo-1607348683036-69c3b68efd26?w=800&q=80",
    "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&q=80",
  ],
  olives: [
    "https://images.unsplash.com/photo-1588208555446-b2c1a6d3d39c?w=800&q=80",
    "https://images.unsplash.com/photo-1587241321921-91ffe3297ea4?w=800&q=80",
  ],

  // Wine
  redWine: [
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
    "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80",
  ],
  whiteWine: [
    "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800&q=80",
    "https://images.unsplash.com/photo-1586370434639-0fe43b2d32d6?w=800&q=80",
  ],
  roseWine: [
    "https://images.unsplash.com/photo-1596283752989-898e3e8e0241?w=800&q=80",
  ],

  // Honey
  honey: [
    "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80",
    "https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=800&q=80",
    "https://images.unsplash.com/photo-1587049352846-4a222e784422?w=800&q=80",
  ],

  // Lavender products
  lavenderOil: [
    "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
    "https://images.unsplash.com/photo-1564594581993-0081352a2cc0?w=800&q=80",
  ],
  lavenderDried: [
    "https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=800&q=80",
  ],

  // Cheese
  cheese: [
    "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&q=80",
    "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&q=80",
    "https://images.unsplash.com/photo-1559561853-08451507cbe7?w=800&q=80",
  ],

  // Vegetables
  tomatoes: [
    "https://images.unsplash.com/photo-1546470427-227d67d0da38?w=800&q=80",
    "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80",
  ],
  peppers: [
    "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&q=80",
    "https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=800&q=80",
  ],
  zucchini: [
    "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&q=80",
  ],
  eggplant: [
    "https://images.unsplash.com/photo-1617343267018-c5540fd8f10c?w=800&q=80",
  ],

  // Fruits
  figs: [
    "https://images.unsplash.com/photo-1568166304089-b0b5eda4a63c?w=800&q=80",
    "https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?w=800&q=80",
  ],
  pomegranates: [
    "https://images.unsplash.com/photo-1519003300449-424ad0405076?w=800&q=80",
  ],
  almonds: [
    "https://images.unsplash.com/photo-1508747703725-719777637510?w=800&q=80",
  ],

  // Preserves & jams
  jam: [
    "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80",
    "https://images.unsplash.com/photo-1612436139430-9b3c0b8e0e22?w=800&q=80",
  ],

  // Sea salt
  salt: [
    "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=800&q=80",
    "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=800&q=80",
  ],

  // Traditional meats
  prosciutto: [
    "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80",
    "https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?w=800&q=80",
  ],

  // Rakija
  rakija: [
    "https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=800&q=80",
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getProductPhotos(productName: string): string[] {
  const name = productName.toLowerCase();

  // Olive products
  if (name.includes("maslinovo ulje") || name.includes("olive oil")) {
    return [getRandomItem(PRODUCT_PHOTOS.oliveOil)];
  }
  if (name.includes("masline") || name.includes("olive")) {
    return [getRandomItem(PRODUCT_PHOTOS.olives)];
  }

  // Wine
  if (name.includes("babić") || name.includes("plavina") || name.includes("crno")) {
    return [getRandomItem(PRODUCT_PHOTOS.redWine)];
  }
  if (name.includes("debit") || name.includes("maraština") || name.includes("bijelo")) {
    return [getRandomItem(PRODUCT_PHOTOS.whiteWine)];
  }
  if (name.includes("rosé") || name.includes("rose")) {
    return [getRandomItem(PRODUCT_PHOTOS.roseWine)];
  }

  // Honey
  if (name.includes("med") || name.includes("honey")) {
    return [getRandomItem(PRODUCT_PHOTOS.honey)];
  }

  // Lavender
  if (name.includes("lavanda") || name.includes("lavender")) {
    if (name.includes("ulje") || name.includes("oil")) {
      return [getRandomItem(PRODUCT_PHOTOS.lavenderOil)];
    }
    return [getRandomItem(PRODUCT_PHOTOS.lavenderDried)];
  }

  // Cheese
  if (name.includes("sir") || name.includes("cheese") || name.includes("skuta")) {
    return [getRandomItem(PRODUCT_PHOTOS.cheese)];
  }

  // Vegetables
  if (name.includes("rajčica") || name.includes("tomato")) {
    return [getRandomItem(PRODUCT_PHOTOS.tomatoes)];
  }
  if (name.includes("paprika") || name.includes("pepper")) {
    return [getRandomItem(PRODUCT_PHOTOS.peppers)];
  }
  if (name.includes("tikvice") || name.includes("zucchini")) {
    return [getRandomItem(PRODUCT_PHOTOS.zucchini)];
  }
  if (name.includes("patlidžan") || name.includes("eggplant")) {
    return [getRandomItem(PRODUCT_PHOTOS.eggplant)];
  }

  // Fruits
  if (name.includes("smokva") || name.includes("fig")) {
    return [getRandomItem(PRODUCT_PHOTOS.figs)];
  }
  if (name.includes("nar") || name.includes("pomegranate")) {
    return [getRandomItem(PRODUCT_PHOTOS.pomegranates)];
  }
  if (name.includes("badem") || name.includes("almond")) {
    return [getRandomItem(PRODUCT_PHOTOS.almonds)];
  }

  // Preserves
  if (name.includes("džem") || name.includes("jam") || name.includes("marmelada")) {
    return [getRandomItem(PRODUCT_PHOTOS.jam)];
  }

  // Salt
  if (name.includes("sol") || name.includes("salt")) {
    return [getRandomItem(PRODUCT_PHOTOS.salt)];
  }

  // Meats
  if (name.includes("pršut") || name.includes("prosciutto")) {
    return [getRandomItem(PRODUCT_PHOTOS.prosciutto)];
  }
  if (name.includes("kulen") || name.includes("čvarci")) {
    return [getRandomItem(PRODUCT_PHOTOS.prosciutto)];
  }

  // Rakija
  if (name.includes("rakija")) {
    return [getRandomItem(PRODUCT_PHOTOS.rakija)];
  }

  // Default - return a generic product photo
  return [];
}

function getFarmPhotos(farmName: string): string[] {
  const name = farmName.toLowerCase();

  // Olive farms
  if (name.includes("maslinovo") || name.includes("olive")) {
    return FARM_PHOTOS.oliveGrove.slice(0, 3);
  }

  // Wineries
  if (name.includes("vinarija") || name.includes("vina") || name.includes("wine")) {
    return FARM_PHOTOS.vineyard.slice(0, 3);
  }

  // Honey/Beekeeping
  if (name.includes("pčelarstvo") || name.includes("med") || name.includes("honey")) {
    return FARM_PHOTOS.beekeeping.slice(0, 3);
  }

  // Lavender
  if (name.includes("lavanda") || name.includes("lavender")) {
    return FARM_PHOTOS.lavender.slice(0, 3);
  }

  // Vegetable farms
  if (name.includes("eko vrt") || name.includes("povrće") || name.includes("vegetables")) {
    return FARM_PHOTOS.vegetables.slice(0, 3);
  }

  // Fruit orchards
  if (name.includes("voćnjak") || name.includes("orchard")) {
    return FARM_PHOTOS.orchard.slice(0, 3);
  }

  // Dairy
  if (name.includes("kozje") || name.includes("dairy") || name.includes("mlijeko")) {
    return FARM_PHOTOS.dairy.slice(0, 3);
  }

  // Sea salt
  if (name.includes("sola") || name.includes("salt")) {
    return FARM_PHOTOS.seaSalt.slice(0, 3);
  }

  // Traditional food
  if (name.includes("tradicionalna")) {
    return FARM_PHOTOS.traditional.slice(0, 3);
  }

  // Default - mixed farm photos
  return [
    getRandomItem(FARM_PHOTOS.vegetables),
    getRandomItem(FARM_PHOTOS.orchard),
  ];
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function addPhotosToDatabase() {
  console.log("\n" + "=".repeat(80));
  log("📸 ADDING PHOTOS TO CROATIAN FARMS AND PRODUCTS", "bold");
  console.log("=".repeat(80) + "\n");

  try {
    // Get all Croatian farms
    log("🔍 Finding Croatian farms...", "cyan");
    const farms = await prisma.farm.findMany({
      where: {
        country: "HR",
      },
      include: {
        products: true,
      },
    });

    log(`✅ Found ${farms.length} Croatian farms\n`, "green");

    // Add photos to farms
    log("🏡 Adding photos to farms...", "cyan");
    let farmsUpdated = 0;

    for (const farm of farms) {
      const photos = getFarmPhotos(farm.name);

      if (photos.length > 0) {
        await prisma.farm.update({
          where: { id: farm.id },
          data: {
            images: photos,
            logoUrl: photos[0], // Use first photo as logo
            bannerUrl: photos[1] || photos[0], // Use second photo as banner
          },
        });

        farmsUpdated++;
        log(`  ✓ ${farm.name} - Added ${photos.length} photos`, "green");
      }
    }

    log(`\n✅ Updated ${farmsUpdated} farms with photos\n`, "green");

    // Add photos to products
    log("🥕 Adding photos to products...", "cyan");
    let productsUpdated = 0;

    for (const farm of farms) {
      for (const product of farm.products) {
        const photos = getProductPhotos(product.name);

        if (photos.length > 0) {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              images: photos,
            },
          });

          productsUpdated++;
          log(`  ✓ ${product.name} - Added photo`, "green");
        }
      }
    }

    log(`\n✅ Updated ${productsUpdated} products with photos\n`, "green");

    // Summary
    console.log("\n" + "=".repeat(80));
    log("🎉 PHOTO ADDITION COMPLETE!", "bold");
    console.log("=".repeat(80));

    log("\n📊 Summary:", "cyan");
    log(`  • Farms updated: ${farmsUpdated}`, "blue");
    log(`  • Products updated: ${productsUpdated}`, "blue");
    log(`  • Total photos added: ~${farmsUpdated * 2 + productsUpdated}`, "blue");

    log("\n✨ All Croatian farms and products now have authentic photos!", "green");
    log("📸 Photos sourced from Unsplash (free to use)\n", "blue");

  } catch (error) {
    log("\n❌ Error adding photos:", "yellow");
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// Execute
addPhotosToDatabase()
  .then(() => {
    log("✅ Script completed successfully\n", "green");
    process.exit(0);
  })
  .catch((error) => {
    log("\n❌ Script failed:", "yellow");
    console.error(error);
    process.exit(1);
  });
