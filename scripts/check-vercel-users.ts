#!/usr/bin/env node

/**
 * Check Vercel Database Users
 * Verifies user accounts in production database
 */

import { database } from "@/lib/database";
import * as bcrypt from "bcryptjs";

async function checkUsers() {
  console.log("🔍 Checking Vercel Database Users...\n");

  try {
    // Get all users
    const users = await database.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true,
      },
    });

    console.log(`📊 Found ${users.length} users in database\n`);

    if (users.length === 0) {
      console.log("❌ No users found! Database needs to be seeded.");
      console.log("\nRun: npm run db:seed:vercel:force\n");
      process.exit(1);
    }

    // Check each user
    for (const user of users) {
      console.log("─".repeat(60));
      console.log(`👤 User: ${user.name}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🎭 Role: ${user.role}`);
      console.log(`🔑 Has Password: ${user.password ? "Yes ✅" : "No ❌"}`);
      console.log(`📅 Created: ${user.createdAt.toISOString()}`);

      // Test password hashing
      if (user.password) {
        const testPasswords = [
          "Admin123!",
          "Farmer123!",
          "Customer123!",
          "TestBot123!",
        ];

        console.log("\n🔐 Testing passwords:");
        for (const testPassword of testPasswords) {
          try {
            const isValid = await bcrypt.compare(testPassword, user.password);
            if (isValid) {
              console.log(`   ✅ Password '${testPassword}' works!`);
            }
          } catch (error) {
            // Silent fail for non-matching passwords
          }
        }
      }
      console.log("");
    }

    console.log("─".repeat(60));
    console.log("\n✅ Database check complete!\n");

    // Summary
    const adminUsers = users.filter((u) => u.role === "ADMIN");
    const farmerUsers = users.filter((u) => u.role === "FARMER");
    const customerUsers = users.filter((u) => u.role === "CUSTOMER");

    console.log("📈 Summary:");
    console.log(`   Admin users: ${adminUsers.length}`);
    console.log(`   Farmer users: ${farmerUsers.length}`);
    console.log(`   Customer users: ${customerUsers.length}`);
    console.log(`   Total users: ${users.length}`);
    console.log("");

    // Check for expected test users
    const expectedUsers = [
      { email: "admin@farmersmarket.com", role: "ADMIN" },
      { email: "john@greenvalley.com", role: "FARMER" },
      { email: "jane@example.com", role: "CUSTOMER" },
    ];

    console.log("🎯 Expected Test Users:");
    for (const expected of expectedUsers) {
      const found = users.find((u) => u.email === expected.email);
      if (found) {
        console.log(
          `   ✅ ${expected.email} (${expected.role}) - Found & has password: ${!!found.password}`,
        );
      } else {
        console.log(`   ❌ ${expected.email} (${expected.role}) - MISSING!`);
      }
    }
    console.log("");
  } catch (error) {
    console.error("❌ Error checking users:", error);
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
}

checkUsers();
