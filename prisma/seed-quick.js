// Quick Seed Script - Essential users only
// Creates admin, farmer, and consumer users for testing authentication

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

// Create PostgreSQL connection pool
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/farmersmarket";

const pool = new Pool({
  connectionString,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with adapter (Prisma v7)
const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

async function main() {
  console.log("🌾 Quick Database Seed - Creating essential users...\n");

  try {
    // Test connection
    await prisma.$connect();
    console.log("✅ Database connected\n");

    // 1. Create Admin User
    console.log("📝 Creating admin user...");
    const adminPassword = await bcrypt.hash("Admin123!", 12);

    const admin = await prisma.user.upsert({
      where: { email: "gogsia@gmail.com" },
      update: {
        password: adminPassword,
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
      },
      create: {
        email: "gogsia@gmail.com",
        password: adminPassword,
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
    console.log(`✅ Admin user created: ${admin.email}`);

    // 2. Create Farmer User
    console.log("\n👨‍🌾 Creating farmer user...");
    const farmerPassword = await bcrypt.hash("Farmer123!", 12);

    const farmer = await prisma.user.upsert({
      where: { email: "farmer1@example.com" },
      update: {
        password: farmerPassword,
        role: "FARMER",
        status: "ACTIVE",
        emailVerified: true,
      },
      create: {
        email: "farmer1@example.com",
        password: farmerPassword,
        firstName: "John",
        lastName: "Farmer",
        role: "FARMER",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
    console.log(`✅ Farmer user created: ${farmer.email}`);

    // 3. Create Consumer User
    console.log("\n🛒 Creating consumer user...");
    const consumerPassword = await bcrypt.hash("Consumer123!", 12);

    const consumer = await prisma.user.upsert({
      where: { email: "consumer1@example.com" },
      update: {
        password: consumerPassword,
        role: "CONSUMER",
        status: "ACTIVE",
        emailVerified: true,
      },
      create: {
        email: "consumer1@example.com",
        password: consumerPassword,
        firstName: "Jane",
        lastName: "Consumer",
        role: "CONSUMER",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
    console.log(`✅ Consumer user created: ${consumer.email}`);

    // 4. Create Additional Admin (the divine one)
    console.log("\n⚡ Creating divine admin user...");
    const divineAdminPassword = await bcrypt.hash("DivineAdmin123!", 12);

    const divineAdmin = await prisma.user.upsert({
      where: { email: "admin@farmersmarket.app" },
      update: {
        password: divineAdminPassword,
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
      },
      create: {
        email: "admin@farmersmarket.app",
        password: divineAdminPassword,
        firstName: "Mile",
        lastName: "Mochwara",
        phone: "+15551234567",
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
      },
    });
    console.log(`✅ Divine admin created: ${divineAdmin.email}`);

    // Summary
    console.log("\n✨ Database seeded successfully!\n");
    console.log("═══════════════════════════════════════════════════");
    console.log("📋 LOGIN CREDENTIALS:");
    console.log("═══════════════════════════════════════════════════\n");
    console.log("👤 ADMIN #1 (Primary):");
    console.log("   Email:    gogsia@gmail.com");
    console.log("   Password: Admin123!");
    console.log("   Access:   http://localhost:3001/admin-login\n");
    console.log("👤 ADMIN #2 (Divine):");
    console.log("   Email:    admin@farmersmarket.app");
    console.log("   Password: DivineAdmin123!");
    console.log("   Access:   http://localhost:3001/admin-login\n");
    console.log("👨‍🌾 FARMER:");
    console.log("   Email:    farmer1@example.com");
    console.log("   Password: Farmer123!");
    console.log("   Note:     Can create farms after login\n");
    console.log("🛒 CONSUMER:");
    console.log("   Email:    consumer1@example.com");
    console.log("   Password: Consumer123!\n");
    console.log("═══════════════════════════════════════════════════");
    console.log("\n🚀 Ready to test authentication!\n");
    console.log("   Admin login: http://localhost:3001/admin-login");
    console.log("   User login:  http://localhost:3001/login");
    console.log("\n💡 Tip: Use Prisma Studio to view/manage data:");
    console.log("   npm run db:studio\n");
  } catch (error) {
    console.error("\n❌ Error during seeding:");
    console.error(error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("\n❌ Seeding failed:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
