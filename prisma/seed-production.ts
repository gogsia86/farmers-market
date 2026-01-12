// ============================================================================
// FARMERS MARKET - PRODUCTION SEED SCRIPT (Prisma 7 Compatible)
// ============================================================================
// Purpose: Quickly seed production database with essential test data
// Compatible with: Prisma 7.x
// ============================================================================

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { Pool } from "pg";

// Validate DATABASE_URL exists
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

// Create Prisma adapter using pg driver
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with adapter (Prisma 7 pattern)
const prisma = new PrismaClient({
  adapter,
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================================================
// SEED DATA
// ============================================================================

async function main() {
  console.log("🌱 Starting production database seed...\n");

  try {
    // Clean existing data (optional - comment out if you want to keep existing data)
    console.log("🧹 Cleaning existing data...");
    await prisma.$transaction([
      prisma.cartItem.deleteMany(),
      prisma.orderItem.deleteMany(),
      prisma.order.deleteMany(),
      prisma.review.deleteMany(),
      prisma.product.deleteMany(),
      prisma.farm.deleteMany(),
      prisma.address.deleteMany(),
      prisma.session.deleteMany(),
      prisma.account.deleteMany(),
      prisma.user.deleteMany(),
    ]);
    console.log("✅ Existing data cleaned\n");

    // ========================================================================
    // 1. CREATE ADMIN USER
    // ========================================================================
    console.log("👤 Creating admin user...");
    const adminPassword = await hashPassword("Admin123!");
    const admin = await prisma.user.create({
      data: {
        email: "admin@farmersmarket.app",
        password: adminPassword,
        firstName: "Mile",
        lastName: "Mochwara",
        name: "Mile Mochwara",
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
    console.log(`✅ Admin created: ${admin.email}\n`);

    // ========================================================================
    // 2. CREATE FARMERS
    // ========================================================================
    console.log("👨‍🌾 Creating farmers...");
    const farmerNames = [
      { firstName: "Ana", lastName: "Romana", email: "ana@farmersmarket.app" },
      { firstName: "John", lastName: "Smith", email: "john@farmersmarket.app" },
      {
        firstName: "Maria",
        lastName: "Garcia",
        email: "maria@farmersmarket.app",
      },
      {
        firstName: "David",
        lastName: "Chen",
        email: "david@farmersmarket.app",
      },
      {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah@farmersmarket.app",
      },
    ];

    const farmers = [];
    for (const farmerData of farmerNames) {
      const password = await hashPassword("Farmer123!");
      const farmer = await prisma.user.create({
        data: {
          email: farmerData.email,
          password: password,
          firstName: farmerData.firstName,
          lastName: farmerData.lastName,
          name: `${farmerData.firstName} ${farmerData.lastName}`,
          role: "FARMER",
          status: "ACTIVE",
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
      farmers.push(farmer);
      console.log(`  ✓ Farmer created: ${farmer.email}`);
    }
    console.log(`✅ Created ${farmers.length} farmers\n`);

    // ========================================================================
    // 3. CREATE CONSUMERS
    // ========================================================================
    console.log("🛒 Creating consumers...");
    const consumerNames = [
      {
        firstName: "Divna",
        lastName: "Kapica",
        email: "divna@farmersmarket.app",
      },
      {
        firstName: "Emily",
        lastName: "Brown",
        email: "emily@farmersmarket.app",
      },
      {
        firstName: "Michael",
        lastName: "Wilson",
        email: "michael@farmersmarket.app",
      },
    ];

    const consumers = [];
    for (const consumerData of consumerNames) {
      const password = await hashPassword("Consumer123!");
      const consumer = await prisma.user.create({
        data: {
          email: consumerData.email,
          password: password,
          firstName: consumerData.firstName,
          lastName: consumerData.lastName,
          name: `${consumerData.firstName} ${consumerData.lastName}`,
          role: "CONSUMER",
          status: "ACTIVE",
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
      consumers.push(consumer);
      console.log(`  ✓ Consumer created: ${consumer.email}`);
    }
    console.log(`✅ Created ${consumers.length} consumers\n`);

    // ========================================================================
    // 4. CREATE FARMS
    // ========================================================================
    console.log("🏡 Creating farms...");
    const farmData = [
      {
        name: "Green Valley Organic Farm",
        description:
          "Family-owned organic farm specializing in seasonal vegetables and herbs. Certified organic since 2015.",
        certifications: ["USDA_ORGANIC"],
      },
      {
        name: "Sunrise Dairy Farm",
        description:
          "Fresh dairy products from grass-fed cows. Local delivery available.",
        certifications: [],
      },
      {
        name: "Mountain View Orchards",
        description:
          "Premium fruit orchard with apples, pears, and stone fruits. Pick-your-own available in season.",
        certifications: [],
      },
      {
        name: "Heritage Grain Co-op",
        description:
          "Sustainable grain production using traditional methods. Non-GMO and pesticide-free.",
        certifications: ["NON_GMO"],
      },
      {
        name: "Wildflower Honey Farm",
        description:
          "Pure, raw honey from local wildflowers. Bee-friendly practices.",
        certifications: [],
      },
    ];

    const farms = [];
    for (let i = 0; i < farmData.length; i++) {
      const farmer = farmers[i % farmers.length];
      const data = farmData[i];

      const farm = await prisma.farm.create({
        data: {
          name: data.name,
          slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: data.description,
          status: "ACTIVE",
          verificationStatus: "VERIFIED",
          verifiedAt: new Date(),
          ownerId: farmer.id,
          email: farmer.email,
          phone: "(555) 123-4567",
          address: `${randomInt(100, 9999)} Farm Road`,
          city: randomElement([
            "Springfield",
            "Riverside",
            "Greenville",
            "Madison",
            "Portland",
          ]),
          state: randomElement(["CA", "OR", "WA", "NY", "TX"]),
          zipCode: `${randomInt(10000, 99999)}`,
          country: "US",
          latitude: 40.7128 + (Math.random() - 0.5) * 10,
          longitude: -74.006 + (Math.random() - 0.5) * 10,
          certificationsArray: data.certifications,
          isOrganic: data.certifications.includes("USDA_ORGANIC"),
          images: [],
        },
      });
      farms.push(farm);
      console.log(`  ✓ Farm created: ${farm.name}`);
    }
    console.log(`✅ Created ${farms.length} farms\n`);

    // ========================================================================
    // 5. CREATE PRODUCTS
    // ========================================================================
    console.log("🥕 Creating products...");
    const productTemplates = [
      // Vegetables
      {
        name: "Organic Tomatoes",
        unit: "lb",
        category: "VEGETABLES",
        minPrice: 3.99,
        maxPrice: 5.99,
      },
      {
        name: "Fresh Carrots",
        unit: "bunch",
        category: "VEGETABLES",
        minPrice: 2.49,
        maxPrice: 3.99,
      },
      {
        name: "Leafy Kale",
        unit: "bunch",
        category: "VEGETABLES",
        minPrice: 2.99,
        maxPrice: 4.49,
      },
      {
        name: "Bell Peppers Mix",
        unit: "lb",
        category: "VEGETABLES",
        minPrice: 4.99,
        maxPrice: 6.99,
      },
      {
        name: "Organic Lettuce",
        unit: "head",
        category: "VEGETABLES",
        minPrice: 2.49,
        maxPrice: 3.49,
      },

      // Fruits
      {
        name: "Fresh Strawberries",
        unit: "pint",
        category: "FRUITS",
        minPrice: 5.99,
        maxPrice: 7.99,
      },
      {
        name: "Honeycrisp Apples",
        unit: "lb",
        category: "FRUITS",
        minPrice: 3.49,
        maxPrice: 4.99,
      },
      {
        name: "Organic Blueberries",
        unit: "pint",
        category: "FRUITS",
        minPrice: 6.99,
        maxPrice: 8.99,
      },

      // Dairy
      {
        name: "Raw Milk",
        unit: "gallon",
        category: "DAIRY",
        minPrice: 8.99,
        maxPrice: 10.99,
      },
      {
        name: "Artisan Cheese",
        unit: "lb",
        category: "DAIRY",
        minPrice: 12.99,
        maxPrice: 16.99,
      },
      {
        name: "Farm Fresh Eggs",
        unit: "dozen",
        category: "EGGS",
        minPrice: 4.99,
        maxPrice: 6.99,
      },

      // Other
      {
        name: "Wildflower Honey",
        unit: "jar",
        category: "PANTRY",
        minPrice: 9.99,
        maxPrice: 14.99,
      },
      {
        name: "Artisan Bread",
        unit: "loaf",
        category: "BAKED_GOODS",
        minPrice: 5.99,
        maxPrice: 8.99,
      },
      {
        name: "Fresh Herbs Bundle",
        unit: "bunch",
        category: "HERBS",
        minPrice: 3.99,
        maxPrice: 5.99,
      },
    ];

    let productCount = 0;
    for (const farm of farms) {
      const productsPerFarm = randomInt(5, 8);
      for (let i = 0; i < productsPerFarm; i++) {
        const template = randomElement(productTemplates);
        const price = parseFloat(
          (
            Math.random() * (template.maxPrice - template.minPrice) +
            template.minPrice
          ).toFixed(2),
        );

        await prisma.product.create({
          data: {
            name: template.name,
            slug: `${template.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${farm.slug}-${i}`,
            description: `High-quality ${template.name.toLowerCase()} from ${farm.name}. Freshly harvested and delivered to your door.`,
            price: price,
            unit: template.unit,
            category: template.category,
            quantityAvailable: randomInt(10, 100),
            inStock: true,
            status: "ACTIVE",
            farmId: farm.id,
          },
        });
        productCount++;
      }
      console.log(`  ✓ Created products for: ${farm.name}`);
    }
    console.log(`✅ Created ${productCount} products\n`);

    // ========================================================================
    // 6. CREATE SAMPLE ORDERS (SKIPPED - Complex schema requirements)
    // ========================================================================
    console.log("📦 Skipping sample orders (requires customer relation)\n");

    // ========================================================================
    // 7. CREATE REVIEWS (SKIPPED)
    // ========================================================================
    console.log("⭐ Skipping reviews for now\n");
    const reviewCount = 0;

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log("\n" + "=".repeat(70));
    console.log("🎉 PRODUCTION DATABASE SEEDING COMPLETE!");
    console.log("=".repeat(70));
    console.log("\n📊 Summary:");
    console.log(`  • Admin users: 1`);
    console.log(`  • Farmers: ${farmers.length}`);
    console.log(`  • Consumers: ${consumers.length}`);
    console.log(`  • Farms: ${farms.length}`);
    console.log(`  • Products: ${productCount}`);
    console.log(`  • Orders: 0 (skipped)`);
    console.log(`  • Reviews: ${reviewCount} (skipped)`);

    console.log("\n🔐 Test Credentials:");
    console.log("  Admin:");
    console.log("    Email: admin@farmersmarket.app");
    console.log("    Password: Admin123!");
    console.log("\n  Sample Farmer:");
    console.log("    Email: ana@farmersmarket.app");
    console.log("    Password: Farmer123!");
    console.log("\n  Sample Consumer:");
    console.log("    Email: divna@farmersmarket.app");
    console.log("    Password: Consumer123!");

    console.log("\n🌐 Your site is ready to test at:");
    console.log("  https://farmers-market-platform.vercel.app");
    console.log("\n" + "=".repeat(70) + "\n");
  } catch (error) {
    console.error("\n❌ Error during seeding:");
    console.error(error);
    throw error;
  }
}

// ============================================================================
// EXECUTE
// ============================================================================

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
