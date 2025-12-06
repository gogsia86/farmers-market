#!/usr/bin/env tsx
/**
 * Quick Test User Seeding Script
 * Seeds the three test users needed for E2E tests
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const TEST_USERS = [
  {
    email: "admin@farmersmarket.app",
    password: "DivineAdmin123!",
    firstName: "Admin",
    lastName: "User",
    role: "ADMIN",
  },
  {
    email: "farmer@farmersmarket.app",
    password: "DivineFarmer123!",
    firstName: "Test",
    lastName: "Farmer",
    role: "FARMER",
  },
  {
    email: "customer@farmersmarket.app",
    password: "DivineCustomer123!",
    firstName: "Test",
    lastName: "Customer",
    role: "CONSUMER",
  },
] as const;

async function main() {
  console.log("🌱 Seeding test users for E2E tests...\n");

  for (const user of TEST_USERS) {
    try {
      const hashedPassword = await hash(user.password, 10);

      const created = await prisma.user.upsert({
        where: { email: user.email },
        update: {
          password: hashedPassword,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role as any,
          status: "ACTIVE",
        },
        create: {
          email: user.email,
          password: hashedPassword,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role as any,
          status: "ACTIVE",
        },
      });

      console.log(`✅ ${user.role.padEnd(10)} | ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed to seed ${user.email}:`, error);
    }
  }

  console.log("\n✅ Test user seeding complete!");
  console.log("\nTest Credentials:");
  console.log("─────────────────────────────────────────────────────");
  TEST_USERS.forEach((user) => {
    console.log(`${user.role.padEnd(10)} | ${user.email} / ${user.password}`);
  });
  console.log("─────────────────────────────────────────────────────\n");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
