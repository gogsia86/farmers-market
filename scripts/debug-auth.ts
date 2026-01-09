/**
 * 🔍 DEBUG AUTH SCRIPT
 * Verify user credentials and password hashing
 */

// Load environment variables FIRST
import { config } from "dotenv";
config();

import { compare, hash } from "bcryptjs";
import { database } from "../src/lib/database/index";

async function main() {
  console.log("🔍 AUTH DEBUG SCRIPT\n");

  const testEmail = "farmer1@example.com";
  const testPassword = "Farmer123!";

  try {
    // 1. Check if user exists
    console.log(`📧 Checking user: ${testEmail}`);
    const user = await database.user.findUnique({
      where: { email: testEmail },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.log("❌ User NOT found in database");
      console.log("\n💡 Run seed script to create test users:");
      console.log("   npm run seed:basic");
      return;
    }

    console.log("✅ User found:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Email Verified: ${user.emailVerified}`);
    console.log(`   Has Password: ${!!user.password}`);
    console.log(`   Created: ${user.createdAt}`);

    if (!user.password) {
      console.log("\n❌ User has no password set!");
      return;
    }

    // 2. Test password comparison
    console.log(`\n🔐 Testing password: "${testPassword}"`);
    const isValid = await compare(testPassword, user.password);

    if (isValid) {
      console.log("✅ Password is CORRECT - Authentication should work!");
    } else {
      console.log("❌ Password is INCORRECT");
      console.log("\n🔧 Debugging password hash:");
      console.log(`   Stored hash: ${user.password.substring(0, 30)}...`);
      console.log(`   Hash length: ${user.password.length}`);
      console.log(`   Expected length: 60 (bcrypt)`);

      // Test if we can hash and compare the expected password
      console.log("\n🧪 Testing fresh hash...");
      const freshHash = await hash(testPassword, 12);
      const freshCompare = await compare(testPassword, freshHash);
      console.log(`   Fresh hash works: ${freshCompare ? "✅ YES" : "❌ NO"}`);

      // Try alternative passwords
      console.log("\n🔍 Trying alternative passwords:");
      const alternatives = [
        "password123",
        "Farmer123",
        "farmer123",
        "password",
      ];

      for (const alt of alternatives) {
        const altValid = await compare(alt, user.password);
        if (altValid) {
          console.log(`   ✅ "${alt}" - WORKS!`);
        } else {
          console.log(`   ❌ "${alt}" - Failed`);
        }
      }
    }

    // 3. Check auth configuration
    console.log("\n⚙️  Environment Check:");
    console.log(`   NEXTAUTH_SECRET set: ${!!process.env.NEXTAUTH_SECRET}`);
    console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || "not set"}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);

    // 4. Recommendations
    console.log("\n💡 Recommendations:");
    if (!isValid) {
      console.log("   1. Re-run seed script to reset passwords:");
      console.log("      npm run seed:basic");
      console.log("   2. Or manually update password in database");
      console.log("   3. Check if bcrypt version matches between seed and auth");
    } else {
      console.log("   ✅ Everything looks good!");
      console.log("   If login still fails, check:");
      console.log("   - Browser cookies are enabled");
      console.log("   - NEXTAUTH_SECRET is set correctly");
      console.log("   - No CORS issues");
    }
  } catch (error) {
    console.error("\n❌ Error:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
      console.error("   Stack:", error.stack);
    }
  } finally {
    await database.$disconnect();
  }
}

main();
