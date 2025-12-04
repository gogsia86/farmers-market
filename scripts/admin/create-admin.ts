/**
 * 🌾 CREATE ADMIN USER SCRIPT
 * Divine Agricultural Platform - Admin User Creation
 *
 * Usage: npx tsx create-admin.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log("🌾 Creating Admin User for Farmers Market Platform...\n");

  const adminEmail = "gogsia@gmail.com";
  const adminPassword = "Admin123!"; // Change this to your preferred password

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      console.log(
        "📝 User already exists. Updating to ADMIN role and resetting password...\n",
      );

      // Hash the password
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      // Update existing user
      const updatedUser = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          role: "ADMIN",
          status: "ACTIVE",
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      console.log("✅ User updated successfully!\n");
      console.log("📧 Email:", updatedUser.email);
      console.log("🔑 Password:", adminPassword);
      console.log("👤 Role:", updatedUser.role);
      console.log("📊 Status:", updatedUser.status);
      console.log("\n🌐 You can now login at: http://localhost:3001/login\n");
    } else {
      console.log("📝 Creating new admin user...\n");

      // Hash the password
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      // Create new admin user
      const newUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          firstName: "Admin",
          lastName: "User",
          name: "Admin User",
          role: "ADMIN",
          status: "ACTIVE",
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      console.log("✅ Admin user created successfully!\n");
      console.log("📧 Email:", newUser.email);
      console.log("🔑 Password:", adminPassword);
      console.log("👤 Role:", newUser.role);
      console.log("📊 Status:", newUser.status);
      console.log("\n🌐 You can now login at: http://localhost:3001/login\n");
    }

    console.log("═══════════════════════════════════════════════════════");
    console.log("  🎉 SUCCESS! Admin user is ready!");
    console.log("═══════════════════════════════════════════════════════\n");
    console.log("Login credentials:");
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log("\n⚠️  IMPORTANT: Change this password after first login!\n");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
