#!/usr/bin/env tsx
/**
 * 🌱 DATABASE SEED SCRIPT - TEST DATA GENERATOR
 *
 * Populates database with sample farms, products, and users for testing
 *
 * Divine Patterns Applied:
 * - Realistic test data with agricultural consciousness
 * - Idempotent seeding (can run multiple times)
 * - Comprehensive data coverage
 * - Seasonal product awareness
 *
 * @module SeedTestData
 * @reference .github/instructions/07_DATABASE_QUANTUM_MASTERY.instructions.md
 *
 * Usage:
 * npm run seed
 * or
 * tsx scripts/seed-test-data.ts
 */

// Load environment variables first
import { config } from "dotenv";
config();

import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { database } from "../src/lib/database";

// ============================================================================
// TYPES
// ============================================================================

interface SeedStats {
  users: number;
  farms: number;
  products: number;
  categories: number;
}

// ============================================================================
// COLORS FOR CONSOLE OUTPUT
// ============================================================================

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log(`\n${"═".repeat(70)}`);
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log("═".repeat(70));
}

// ============================================================================
// SEED DATA
// ============================================================================

// Get test password from environment (required for security)
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

if (!TEST_USER_PASSWORD) {
  console.error("\n❌ ERROR: TEST_USER_PASSWORD environment variable is required");
  console.log("\nUsage:");
  console.log("  TEST_USER_PASSWORD=YourPassword123! npx tsx scripts/seed-test-data.ts");
  console.log("\nThis ensures test passwords are not hardcoded in the repository.\n");
  process.exit(1);
}

const TEST_USERS = [
  {
    email: "farmer1@example.com",
    name: "John Farmer",
    role: "FARMER" as const,
    password: TEST_USER_PASSWORD,
  },
  {
    email: "farmer2@example.com",
    name: "Sarah Green",
    role: "FARMER" as const,
    password: TEST_USER_PASSWORD,
  },
  {
    email: "farmer3@example.com",
    name: "Mike Organic",
    role: "FARMER" as const,
    password: TEST_USER_PASSWORD,
  },
  {
    email: "customer@example.com",
    name: "Jane Customer",
    role: "CONSUMER" as const,
    password: TEST_USER_PASSWORD,
  },
  {
    email: "admin@example.com",
    name: "Admin User",
    role: "ADMIN" as const,
    password: TEST_USER_PASSWORD,
  },
];

const TEST_FARMS = [
  {
    name: "Green Valley Organic Farm",
    slug: "green-valley-organic",
    description:
      "Certified organic vegetables and herbs grown with love and sustainable practices. Family-owned for 3 generations.",
    story:
      "Our farm has been in the family since 1950. We converted to organic farming in 2005 and never looked back. Every vegetable is grown with care, following biodynamic principles.",
    email: "contact@greenvalley.farm",
    phone: "+1-555-0101",
    website: "https://greenvalley.farm",
    address: "123 Farm Road",
    city: "Boulder",
    state: "Colorado",
    zipCode: "80301",
    latitude: 40.015,
    longitude: -105.2705,
    businessName: "Green Valley Organic Farm LLC",
    yearEstablished: 1950,
    farmSize: 45.5,
    deliveryRadius: 30,
    farmingPractices: {
      organic: true,
      biodynamic: true,
      pesticide_free: true,
      practices: ["Crop rotation", "Composting", "Natural pest control"],
    },
    productCategories: {
      vegetables: true,
      herbs: true,
      fruits: false,
    },
  },
  {
    name: "Sunrise Dairy & Cheese Co",
    slug: "sunrise-dairy-cheese",
    description:
      "Artisanal cheese and dairy products from grass-fed cows. Award-winning farmstead cheese.",
    story:
      "We started as a small dairy farm in 2010 and expanded into artisanal cheese making. Our cows graze on lush pastures and produce the finest milk.",
    email: "info@sunrisedairy.farm",
    phone: "+1-555-0102",
    website: "https://sunrisedairy.farm",
    address: "456 Dairy Lane",
    city: "Denver",
    state: "Colorado",
    zipCode: "80202",
    latitude: 39.7392,
    longitude: -104.9903,
    businessName: "Sunrise Dairy LLC",
    yearEstablished: 2010,
    farmSize: 120.0,
    deliveryRadius: 50,
    farmingPractices: {
      organic: false,
      grass_fed: true,
      humane: true,
      practices: ["Rotational grazing", "Grass-fed", "No antibiotics"],
    },
    productCategories: {
      dairy: true,
      cheese: true,
    },
  },
  {
    name: "Mountain View Orchard",
    slug: "mountain-view-orchard",
    description:
      "Fresh apples, pears, and stone fruits from our high-altitude orchard. U-pick available in season.",
    story:
      "Nestled at 7,000 feet elevation, our orchard benefits from cool nights and warm days, producing exceptionally sweet and crisp fruit.",
    email: "hello@mountainvieworchard.com",
    phone: "+1-555-0103",
    website: "https://mountainvieworchard.com",
    address: "789 Orchard Way",
    city: "Fort Collins",
    state: "Colorado",
    zipCode: "80521",
    latitude: 40.5853,
    longitude: -105.0844,
    businessName: "Mountain View Orchard Inc",
    yearEstablished: 1985,
    farmSize: 65.0,
    deliveryRadius: 40,
    farmingPractices: {
      organic: false,
      ipm: true,
      low_spray: true,
      practices: [
        "Integrated Pest Management",
        "Minimal spray",
        "Bee-friendly",
      ],
    },
    productCategories: {
      fruits: true,
      apples: true,
      pears: true,
    },
  },
];

const PRODUCT_TEMPLATES = {
  vegetables: [
    {
      name: "Organic Heirloom Tomatoes",
      description:
        "Beautiful heirloom tomatoes in assorted varieties. Sweet, juicy, and perfect for summer salads.",
      price: 6.99,
      unit: "lb",
      category: "VEGETABLES",
      quantityAvailable: 50,
    },
    {
      name: "Fresh Baby Spinach",
      description:
        "Tender baby spinach leaves, picked this morning. Perfect for salads and smoothies.",
      price: 4.99,
      unit: "bunch",
      category: "VEGETABLES",
      quantityAvailable: 30,
    },
    {
      name: "Rainbow Carrots",
      description:
        "Colorful organic carrots - purple, yellow, orange, and white varieties.",
      price: 3.99,
      unit: "lb",
      category: "VEGETABLES",
      quantityAvailable: 40,
    },
    {
      name: "Fresh Basil",
      description:
        "Aromatic fresh basil, perfect for pesto and Italian dishes.",
      price: 3.5,
      unit: "bunch",
      category: "VEGETABLES",
      quantityAvailable: 25,
    },
    {
      name: "Crisp Lettuce Mix",
      description: "Mixed lettuce varieties for the perfect salad base.",
      price: 4.5,
      unit: "head",
      category: "VEGETABLES",
      quantityAvailable: 35,
    },
  ],
  dairy: [
    {
      name: "Aged Cheddar Cheese",
      description:
        "Sharp aged cheddar, aged 12 months. Award-winning flavor and texture.",
      price: 12.99,
      unit: "lb",
      category: "DAIRY",
      quantityAvailable: 20,
    },
    {
      name: "Fresh Mozzarella",
      description:
        "Handmade fresh mozzarella, perfect for caprese salad or pizza.",
      price: 8.99,
      unit: "8oz",
      category: "DAIRY",
      quantityAvailable: 25,
    },
    {
      name: "Whole Milk",
      description:
        "Fresh whole milk from grass-fed cows. Non-homogenized, cream on top!",
      price: 6.99,
      unit: "half gallon",
      category: "DAIRY",
      quantityAvailable: 30,
    },
    {
      name: "Greek Yogurt",
      description: "Thick and creamy Greek yogurt made from grass-fed milk.",
      price: 5.99,
      unit: "16oz",
      category: "DAIRY",
      quantityAvailable: 40,
    },
  ],
  fruits: [
    {
      name: "Honeycrisp Apples",
      description:
        "Sweet and crisp Honeycrisp apples, perfect for snacking or baking.",
      price: 4.99,
      unit: "lb",
      category: "FRUITS",
      quantityAvailable: 60,
    },
    {
      name: "Bartlett Pears",
      description: "Ripe Bartlett pears with buttery sweet flavor.",
      price: 4.5,
      unit: "lb",
      category: "FRUITS",
      quantityAvailable: 45,
    },
    {
      name: "Fresh Peaches",
      description: "Juicy Colorado peaches at peak ripeness. Limited season!",
      price: 5.99,
      unit: "lb",
      category: "FRUITS",
      quantityAvailable: 35,
    },
    {
      name: "Sweet Cherries",
      description: "Dark sweet cherries, perfect for snacking or baking pies.",
      price: 7.99,
      unit: "lb",
      category: "FRUITS",
      quantityAvailable: 30,
    },
  ],
};

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function seedUsers(): Promise<string[]> {
  logSection("🌱 Seeding Users");

  const userIds: string[] = [];

  for (const userData of TEST_USERS) {
    // Check if user already exists
    const existing = await database.user.findUnique({
      where: { email: userData.email },
    });

    if (existing) {
      log(`  ⏭️  User already exists: ${userData.email}`, "yellow");
      userIds.push(existing.id);
      continue;
    }

    // Hash password
    const hashedPassword = await hash(userData.password, 10);

    // Create user
    const user = await database.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        password: hashedPassword,
        emailVerified: true, // Auto-verify for test users
      },
    });

    userIds.push(user.id);
    log(`  ✅ Created user: ${user.email} (${user.role})`, "green");
  }

  return userIds;
}

async function seedFarms(farmerIds: string[]): Promise<string[]> {
  logSection("🚜 Seeding Farms");

  const farmIds: string[] = [];

  for (let i = 0; i < TEST_FARMS.length; i++) {
    const farmData = TEST_FARMS[i];
    const ownerId = farmerIds[i % farmerIds.length]; // Assign to farmers

    if (!farmData || !ownerId) {
      log(`  ⚠️  Skipping farm ${i}: Missing data or owner`, "yellow");
      continue;
    }

    // Check if farm already exists
    log(`  🔍 Checking for existing farm with slug: ${farmData.slug}`, "cyan");

    try {
      const existing = await database.farm.findFirst({
        where: { slug: farmData.slug },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });

      if (existing) {
        log(`  ⏭️  Farm already exists: ${farmData.name}`, "yellow");
        farmIds.push(existing.id);
        continue;
      }
    } catch (error: any) {
      log(`  ❌ Error checking for existing farm: ${error.message}`, "red");
      if (error.meta) {
        log(`  📊 Error meta: ${JSON.stringify(error.meta)}`, "red");
      }
      throw error;
    }

    // Create farm
    log(`  🌱 Creating farm: ${farmData.name}`, "cyan");
    try {
      const farm = await database.farm.create({
        data: {
          ...farmData,
          ownerId,
          status: "ACTIVE",
          verificationStatus: "VERIFIED",
          verifiedAt: new Date(),
          averageRating: new Prisma.Decimal(Math.random() * 1.5 + 3.5), // Random rating between 3.5-5.0
          reviewCount: Math.floor(Math.random() * 50) + 10, // Random 10-60 reviews
          latitude: new Prisma.Decimal(farmData.latitude),
          longitude: new Prisma.Decimal(farmData.longitude),
          farmSize: farmData.farmSize
            ? new Prisma.Decimal(farmData.farmSize)
            : undefined,
          certificationsArray: [],
          images: [],
        },
      });

      farmIds.push(farm.id);
      log(`  ✅ Created farm: ${farm.name}`, "green");
    } catch (error: any) {
      log(`  ❌ Error creating farm: ${error.message}`, "red");
      if (error.meta) {
        log(`  📊 Error meta: ${JSON.stringify(error.meta, null, 2)}`, "red");
      }
      log(`  📝 Farm data being used:`, "yellow");
      log(`     Name: ${farmData.name}`, "yellow");
      log(`     Slug: ${farmData.slug}`, "yellow");
      log(`     Latitude: ${farmData.latitude}`, "yellow");
      log(`     Longitude: ${farmData.longitude}`, "yellow");
      throw error;
    }
  }

  return farmIds;
}

async function seedProducts(farmIds: string[]): Promise<number> {
  logSection("🌾 Seeding Products");

  let productCount = 0;

  // Seed vegetables for farm 0
  if (farmIds[0]) {
    for (const productTemplate of PRODUCT_TEMPLATES.vegetables) {
      // Check if product exists
      const existing = await database.product.findFirst({
        where: {
          name: productTemplate.name,
          farmId: farmIds[0],
        },
      });

      if (existing) {
        log(`  ⏭️  Product already exists: ${productTemplate.name}`, "yellow");
        productCount++;
        continue;
      }

      const product = await database.product.create({
        data: {
          ...productTemplate,
          farmId: farmIds[0],
          slug: productTemplate.name.toLowerCase().replace(/\s+/g, "-"),
          status: "ACTIVE",
          images: [],
          price: new Prisma.Decimal(productTemplate.price),
        },
      });

      productCount++;
      log(`  ✅ Created product: ${product.name}`, "green");
    }
  }

  // Seed dairy for farm 1
  if (farmIds[1]) {
    for (const productTemplate of PRODUCT_TEMPLATES.dairy) {
      const existing = await database.product.findFirst({
        where: {
          name: productTemplate.name,
          farmId: farmIds[1],
        },
      });

      if (existing) {
        log(`  ⏭️  Product already exists: ${productTemplate.name}`, "yellow");
        productCount++;
        continue;
      }

      const product = await database.product.create({
        data: {
          ...productTemplate,
          farmId: farmIds[1],
          slug: productTemplate.name.toLowerCase().replace(/\s+/g, "-"),
          status: "ACTIVE",
          images: [],
          price: new Prisma.Decimal(productTemplate.price),
        },
      });

      productCount++;
      log(`  ✅ Created product: ${product.name}`, "green");
    }
  }

  // Seed fruits for farm 2
  if (farmIds[2]) {
    for (const productTemplate of PRODUCT_TEMPLATES.fruits) {
      const existing = await database.product.findFirst({
        where: {
          name: productTemplate.name,
          farmId: farmIds[2],
        },
      });

      if (existing) {
        log(`  ⏭️  Product already exists: ${productTemplate.name}`, "yellow");
        productCount++;
        continue;
      }

      const product = await database.product.create({
        data: {
          ...productTemplate,
          farmId: farmIds[2],
          slug: productTemplate.name.toLowerCase().replace(/\s+/g, "-"),
          status: "ACTIVE",
          images: [],
          price: new Prisma.Decimal(productTemplate.price),
        },
      });

      productCount++;
      log(`  ✅ Created product: ${product.name}`, "green");
    }
  }

  return productCount;
}

async function seedCategories(): Promise<number> {
  logSection("📂 Seeding Categories");

  // NOTE: Category model doesn't exist in Prisma schema yet
  // Products use ProductCategory enum instead
  log(
    "  ⏭️  Skipping categories - using ProductCategory enum instead",
    "yellow",
  );

  return 0;

  /* COMMENTED OUT - No Category model in schema
  const categories = [
    {
      name: "Vegetables",
      slug: "vegetables",
      description: "Fresh vegetables and greens",
    },
    {
      name: "Fruits",
      slug: "fruits",
      description: "Fresh seasonal fruits",
    },
    {
      name: "Dairy",
      slug: "dairy",
      description: "Fresh milk, cheese, and dairy products",
    },
    {
      name: "Herbs",
      slug: "herbs",
      description: "Fresh herbs for cooking and medicinal use",
    },
    {
      name: "Meat",
      slug: "meat",
      description: "Grass-fed and pasture-raised meats",
    },
  ];

  let categoryCount = 0;

  for (const categoryData of categories) {
    // Check if category exists
    const existing = await database.category.findUnique({
      where: { slug: categoryData.slug },
    });

    if (existing) {
      log(`  ⏭️  Category already exists: ${categoryData.name}`, "yellow");
      categoryCount++;
      continue;
    }

    const category = await database.category.create({
      data: categoryData,
    });

    categoryCount++;
    log(`  ✅ Created category: ${category.name}`, "green");
  }

  return categoryCount;
  */
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log(`${colors.bright}${colors.cyan}
╔═══════════════════════════════════════════════════════════════════╗
║           🌱 DATABASE SEED SCRIPT - TEST DATA GENERATOR          ║
║                                                                   ║
║  Populating database with sample data for testing...             ║
╚═══════════════════════════════════════════════════════════════════╝
${colors.reset}`);

  const stats: SeedStats = {
    users: 0,
    farms: 0,
    products: 0,
    categories: 0,
  };

  try {
    // Seed users
    const userIds = await seedUsers();
    stats.users = userIds.length;

    // Get farmer IDs (first 3 users are farmers)
    const farmerIds = userIds.slice(0, 3);

    // Seed farms
    const farmIds = await seedFarms(farmerIds);
    stats.farms = farmIds.length;

    // Seed categories
    stats.categories = await seedCategories();

    // Seed products
    stats.products = await seedProducts(farmIds);

    // Print summary
    logSection("📊 Seed Summary");
    log(`  👥 Users created/verified: ${stats.users}`, "cyan");
    log(`  🚜 Farms created/verified: ${stats.farms}`, "cyan");
    log(`  🌾 Products created/verified: ${stats.products}`, "cyan");
    log(`  📂 Categories created/verified: ${stats.categories}`, "cyan");

    console.log(
      `\n${colors.green}${colors.bright}✨ Database seeding completed successfully!${colors.reset}\n`,
    );

    // Print test credentials
    logSection("🔑 Test Credentials");
    log("  Farmers:", "cyan");
    log("    Email: farmer1@example.com | Password: password123", "yellow");
    log("    Email: farmer2@example.com | Password: password123", "yellow");
    log("    Email: farmer3@example.com | Password: password123", "yellow");
    log("  Customer:", "cyan");
    log("    Email: customer@example.com | Password: password123", "yellow");
    log("  Admin:", "cyan");
    log("    Email: admin@example.com | Password: password123", "yellow");
    console.log();
  } catch (error) {
    console.error(
      `\n${colors.red}${colors.bright}❌ Seeding failed:${colors.reset}`,
      error,
    );
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
}

// ============================================================================
// EXECUTE
// ============================================================================

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
