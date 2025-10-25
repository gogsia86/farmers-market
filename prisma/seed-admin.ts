import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌾 Creating admin user...");

  // Check if admin already exists
  const existing = await prisma.user.findUnique({
    where: { email: "admin@farmersmarket.app" },
  });

  if (existing) {
    console.log("✅ Admin user already exists!");
    return;
  }

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@farmersmarket.app",
      password: await bcrypt.hash("DivineAdmin123!", 12),
      firstName: "Mile",
      lastName: "Mochwara",
      phone: "+15551234567",
      role: "ADMIN",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      phoneVerified: true,
      phoneVerifiedAt: new Date(),
      lastLoginAt: new Date(),
      loginCount: 0,
    },
  });

  console.log(`✅ Created admin user: ${adminUser.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
