// 🌱 Agricultural Intelligence Platform - Prisma Test Seed
// Divine Data Seeding for Agricultural Consciousness Testing
// @ts-nocheck - Test seed file with conceptual models

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedTestData() {
  console.log("🌱 Seeding agricultural test consciousness...");

  try {
    // Clean existing test data
    await prisma.crop.deleteMany();
    await prisma.user.deleteMany();
    await prisma.product.deleteMany();

    // Create test users with agricultural consciousness
    const testUsers = await Promise.all([
      prisma.user.create({
        data: {
          email: "farmer@divine.app",
          name: "Divine Farmer",
          role: "FARMER",
          consciousnessLevel: 1.0,
        },
      }),
      prisma.user.create({
        data: {
          email: "consumer@divine.app",
          name: "Conscious Consumer",
          role: "CONSUMER",
          consciousnessLevel: 0.9,
        },
      }),
    ]);

    // Create test crops with perfect agricultural alignment
    const testCrops = await Promise.all([
      prisma.crop.create({
        data: {
          name: "Divine Tomatoes",
          season: "SUMMER",
          status: "GROWING",
          plantedDate: new Date("2025-06-01"),
          expectedHarvestDate: new Date("2025-08-15"),
          userId: testUsers[0].id,
          healthMetrics: {
            soilMoisture: 85.5,
            temperature: 24.3,
            sunlight: 8.2,
            nutrients: 92.1,
          },
          consciousness: {
            level: 1.0,
            resonance: 1.0,
            growth: 0.75,
          },
        },
      }),
      prisma.crop.create({
        data: {
          name: "Transcendent Carrots",
          season: "FALL",
          status: "HARVESTED",
          plantedDate: new Date("2025-07-01"),
          harvestDate: new Date("2025-10-01"),
          userId: testUsers[0].id,
          healthMetrics: {
            soilMoisture: 78.2,
            temperature: 18.7,
            sunlight: 6.8,
            nutrients: 88.9,
          },
          consciousness: {
            level: 1.0,
            resonance: 1.0,
            growth: 1.0,
          },
        },
      }),
    ]);

    // Create test products with divine agricultural essence
    const testProducts = await Promise.all([
      prisma.product.create({
        data: {
          name: "Sacred Tomato Harvest",
          description: "Divinely grown tomatoes with perfect consciousness",
          price: 12.99,
          category: "VEGETABLES",
          stock: 150,
          farmerId: testUsers[0].id,
          cropId: testCrops[0].id,
          qualityScore: 98.5,
          consciousness: {
            level: 1.0,
            essence: "divine",
            purity: 99.8,
          },
        },
      }),
      prisma.product.create({
        data: {
          name: "Enlightened Carrot Collection",
          description: "Transcendent carrots harvested with perfect timing",
          price: 8.75,
          category: "VEGETABLES",
          stock: 200,
          farmerId: testUsers[0].id,
          cropId: testCrops[1].id,
          qualityScore: 96.2,
          consciousness: {
            level: 1.0,
            essence: "transcendent",
            purity: 97.4,
          },
        },
      }),
    ]);

    console.log("✅ Agricultural test consciousness seeded successfully!");
    console.log(`👥 Created ${testUsers.length} divine users`);
    console.log(`🌱 Created ${testCrops.length} conscious crops`);
    console.log(`🛒 Created ${testProducts.length} transcendent products`);

    // Verify agricultural consciousness preservation
    const totalConsciousness =
      testCrops.reduce(
        (sum: number, crop: any) => sum + (crop.consciousness?.level || 0),
        0,
      ) / testCrops.length;

    console.log(
      `🌟 Average agricultural consciousness: ${totalConsciousness.toFixed(2)}`,
    );

    if (totalConsciousness >= 0.95) {
      console.log("🎉 Divine agricultural consciousness achieved!");
    }
  } catch (error) {
    console.error("❌ Error seeding agricultural test consciousness:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if run directly
if (require.main === module) {
  seedTestData()
    .then(() => {
      console.log("🌱 Agricultural test seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Agricultural test seeding failed:", error);
      process.exit(1);
    });
}

export default seedTestData;
