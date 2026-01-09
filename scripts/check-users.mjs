/**
 * 🔍 CHECK USERS SCRIPT
 * Simple script to verify users in database
 */

import { config } from "dotenv";
config();

import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Checking users in database...\n");

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        emailVerified: true,
        password: true,
      },
      orderBy: {
        role: "asc",
      },
    });

    console.log(`Found ${users.length} users:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.role} - ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Email Verified: ${user.emailVerified}`);
      console.log(`   Has Password: ${user.password ? "✅ YES" : "❌ NO"}`);
      if (user.password) {
        console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);
      }
      console.log("");
    });

    console.log("\n📋 Expected Passwords from seed scripts:");
    console.log("   admin@farmersmarket.app: DivineAdmin123!");
    console.log("   ana.romana@email.com: FarmLife2024!");
    console.log("   farmer1@example.com: Farmer123!");
    console.log("   farmer2@example.com: Farmer123!");
    console.log("   farmer3@example.com: Farmer123!");
    console.log("   consumer@example.com: Consumer123!");
    console.log("   divna.kapica@email.com: HealthyEating2024!");
    console.log("   gogsia@gmail.com: Admin123!");

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
