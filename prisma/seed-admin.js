const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌾 Creating admin user...");

  // Check if exists
  const existing = await prisma.user.findUnique({
    where: { email: "admin@farmersmarket.app" },
  });

  if (existing) {
    console.log("✅ Admin user already exists!");
    return;
  }

  // Create admin
  const hash = await bcrypt.hash("DivineAdmin123!", 12);
  await prisma.user.create({
    data: {
      email: "admin@farmersmarket.app",
      password: hash,
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

  console.log("✅ Admin user created successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
