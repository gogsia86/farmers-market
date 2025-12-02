/**
 * 🌾 Playwright Global Setup - E2E Test Environment
 * Seeds database with test users and data before E2E tests run
 */

import { database } from "@/lib/database";
import * as bcrypt from "bcryptjs";

async function globalSetup() {
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log("║  🌾 E2E Test Environment Setup - Divine Preparation       ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );

  try {
    console.log("✅ Using canonical database connection");

    // Clean up existing test data
    console.log("\n🧹 Cleaning up existing test data...");
    await database.order.deleteMany({
      where: {
        OR: [
          { customer: { email: { contains: "@test.farmersmarket.app" } } },
          { customer: { email: "admin@farmersmarket.app" } },
          { customer: { email: "farmer@farmersmarket.app" } },
          { customer: { email: "customer@farmersmarket.app" } },
        ],
      },
    });
    await database.product.deleteMany({
      where: {
        farm: {
          owner: {
            email: {
              in: [
                "farmer@farmersmarket.app",
                "farmer1@test.farmersmarket.app",
                "farmer2@test.farmersmarket.app",
              ],
            },
          },
        },
      },
    });
    await database.farm.deleteMany({
      where: {
        owner: {
          email: {
            in: [
              "farmer@farmersmarket.app",
              "farmer1@test.farmersmarket.app",
              "farmer2@test.farmersmarket.app",
            ],
          },
        },
      },
    });
    await database.user.deleteMany({
      where: {
        email: {
          in: [
            "admin@farmersmarket.app",
            "farmer@farmersmarket.app",
            "customer@farmersmarket.app",
            "farmer1@test.farmersmarket.app",
            "farmer2@test.farmersmarket.app",
          ],
        },
      },
    });
    console.log("✅ Test data cleaned");

    // 1. Create Admin Test User
    console.log("\n👨‍💼 Creating admin test user...");
    const adminPassword = await bcrypt.hash("DivineAdmin123!", 12);
    const admin = await database.user.create({
      data: {
        email: "admin@farmersmarket.app",
        password: adminPassword,
        firstName: "Admin",
        lastName: "Test",
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
    console.log(`✅ Admin: ${admin.email} / DivineAdmin123!`);

    // 2. Create Farmer Test User
    console.log("\n🚜 Creating farmer test user...");
    const farmerPassword = await bcrypt.hash("DivineFarmer123!", 12);
    const farmer = await database.user.create({
      data: {
        email: "farmer@farmersmarket.app",
        password: farmerPassword,
        firstName: "John",
        lastName: "Farmer",
        role: "FARMER",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
    console.log(`✅ Farmer: ${farmer.email} / DivineFarmer123!`);

    // 3. Create Customer Test User
    console.log("\n🛒 Creating customer test user...");
    const customerPassword = await bcrypt.hash("DivineCustomer123!", 12);
    const customer = await database.user.create({
      data: {
        email: "customer@farmersmarket.app",
        password: customerPassword,
        firstName: "Jane",
        lastName: "Customer",
        role: "CONSUMER",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
    console.log(`✅ Customer: ${customer.email} / DivineCustomer123!`);

    // 4. Create Test Farm for Farmer
    console.log("\n🌾 Creating test farm...");
    const farm = await database.farm.create({
      data: {
        name: "Divine Test Farm",
        slug: "divine-test-farm",
        description: "A biodynamic test farm for E2E testing",
        ownerId: farmer.id,
        status: "ACTIVE",
        verified: true,
        location: {
          address: "123 Farm Road",
          city: "Sacramento",
          state: "CA",
          zipCode: "95814",
          country: "USA",
          coordinates: {
            latitude: 38.5816,
            longitude: -121.4944,
          },
        },
        certifications: ["ORGANIC", "BIODYNAMIC"],
        practices: ["NO_TILL", "COVER_CROPPING", "COMPOSTING"],
        contactEmail: farmer.email,
        contactPhone: "+1-555-0100",
      },
    });
    console.log(`✅ Farm: ${farm.name}`);

    // 5. Create Test Products
    console.log("\n🥕 Creating test products...");
    const products = await Promise.all([
      database.product.create({
        data: {
          name: "Organic Tomatoes",
          slug: "organic-tomatoes",
          description: "Fresh, juicy organic tomatoes",
          farmId: farm.id,
          category: "VEGETABLES",
          price: 4.99,
          unit: "LB",
          stockQuantity: 100,
          available: true,
          seasonal: true,
          harvestDate: new Date(),
          images: ["https://images.unsplash.com/photo-1546470427-e26264be0b3d"],
        },
      }),
      database.product.create({
        data: {
          name: "Fresh Lettuce",
          slug: "fresh-lettuce",
          description: "Crispy organic lettuce",
          farmId: farm.id,
          category: "VEGETABLES",
          price: 3.49,
          unit: "HEAD",
          stockQuantity: 50,
          available: true,
          seasonal: true,
          harvestDate: new Date(),
          images: ["https://images.unsplash.com/photo-1556801712-76c8eb07bbc9"],
        },
      }),
      database.product.create({
        data: {
          name: "Organic Carrots",
          slug: "organic-carrots",
          description: "Sweet and crunchy organic carrots",
          farmId: farm.id,
          category: "VEGETABLES",
          price: 2.99,
          unit: "LB",
          stockQuantity: 75,
          available: true,
          seasonal: true,
          harvestDate: new Date(),
          images: [
            "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37",
          ],
        },
      }),
    ]);
    console.log(`✅ Created ${products.length} products`);

    // 6. Create Additional Test Farms
    console.log("\n🌾 Creating additional test farms...");
    const farmer2Password = await bcrypt.hash("TestFarmer123!", 12);
    const farmer2 = await database.user.create({
      data: {
        email: "farmer1@test.farmersmarket.app",
        password: farmer2Password,
        firstName: "Sarah",
        lastName: "Green",
        role: "FARMER",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    const farm2 = await database.farm.create({
      data: {
        name: "Green Valley Organics",
        slug: "green-valley-organics",
        description: "Organic vegetables and fruits",
        ownerId: farmer2.id,
        status: "ACTIVE",
        verified: true,
        location: {
          address: "456 Valley Road",
          city: "Davis",
          state: "CA",
          zipCode: "95616",
          country: "USA",
          coordinates: {
            latitude: 38.5449,
            longitude: -121.7405,
          },
        },
        certifications: ["ORGANIC"],
        practices: ["COMPOSTING", "CROP_ROTATION"],
        contactEmail: farmer2.email,
        contactPhone: "+1-555-0101",
      },
    });
    console.log(`✅ Farm: ${farm2.name}`);

    console.log(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║  ✅ E2E Test Environment Ready                             ║",
    );
    console.log(
      "╠════════════════════════════════════════════════════════════╣",
    );
    console.log(
      "║  Test Credentials:                                         ║",
    );
    console.log(
      "║  • Admin:    admin@farmersmarket.app / DivineAdmin123!     ║",
    );
    console.log(
      "║  • Farmer:   farmer@farmersmarket.app / DivineFarmer123!   ║",
    );
    console.log(
      "║  • Customer: customer@farmersmarket.app / DivineCustomer123! ║",
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝\n",
    );
  } catch (error) {
    console.error("❌ E2E setup failed:", error);
    throw error;
  } finally {
    // Database connection managed by singleton, no need to disconnect
  }
}

export default globalSetup;
