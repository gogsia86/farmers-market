/**
 * Test User Seed Script
 * Creates/updates test user for automated bot testing
 *
 * Usage:
 * node -r dotenv/config prisma/seeds/test-user.seed.ts
 * OR
 * npm run seed:test-user
 */

require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function seedTestUser() {
  console.log("🌱 Seeding test user for bot tests...");

  const testEmail = "test@farmersmarket.com";
  const testPassword = "testpassword123";

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    if (existingUser) {
      console.log(`✅ Test user already exists: ${testEmail}`);
      console.log(`   User ID: ${existingUser.id}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`   Status: ${existingUser.status}`);

      // Update password and ensure active
      const hashedPassword = await hash(testPassword, 10);
      await prisma.user.update({
        where: { email: testEmail },
        data: {
          password: hashedPassword,
          status: "ACTIVE",
        },
      });
      console.log("   Password updated and status set to ACTIVE ✅");

      return existingUser;
    }

    // Create new test user
    const hashedPassword = await hash(testPassword, 10);

    const testUser = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        firstName: "Test",
        lastName: "User",
        role: "CONSUMER",
        status: "ACTIVE",
        emailVerified: new Date(),
        phone: "+1234567890",
        address: "123 Test Street",
        city: "Test City",
        state: "CA",
        zipCode: "12345",
        country: "USA",
      },
    });

    console.log("✅ Test user created successfully!");
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   User ID: ${testUser.id}`);
    console.log(`   Role: ${testUser.role}`);
    console.log(`   Status: ${testUser.status}`);

    return testUser;
  } catch (error) {
    console.error("❌ Error seeding test user:", error);
    throw error;
  }
}

async function main() {
  try {
    await seedTestUser();
    console.log("");
    console.log("🎉 Test user seed completed!");
    console.log("");
    console.log("Test credentials:");
    console.log("  Email: test@farmersmarket.com");
    console.log("  Password: testpassword123");
    console.log("");
    console.log("You can now run bot tests with:");
    console.log("  npm run bot test cart-checkout");
    console.log("  npm run bot test:all");
    console.log("");
  } catch (error) {
    console.error("Failed to seed test user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
