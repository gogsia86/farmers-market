/**
 * 🌾 MVP BOT SEED SCRIPT
 * Seeds database with test data for MVP validation bot
 * - Admin user
 * - Farmer user with active farm
 * - Products for testing
 */

import * as bcrypt from "bcryptjs";
import "dotenv/config";
import { database } from "../src/lib/database";

const prisma = database;

async function main() {
  console.log("🌾 Seeding database for MVP Bot...\n");

  // ==========================================================================
  // 1. Create Admin User
  // ==========================================================================
  console.log("👨‍💼 Creating admin user...");

  const adminEmail = "admin@farmersmarket.app";
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: await bcrypt.hash("DivineAdmin123!", 12),
        firstName: "Admin",
        lastName: "User",
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
    console.log(`✅ Created admin: ${admin.email}`);
  } else {
    console.log(`✅ Admin already exists: ${admin.email}`);
  }

  // ==========================================================================
  // 2. Create Existing Farmer with Active Farm (for product browsing tests)
  // ==========================================================================
  console.log("\n🚜 Creating existing farmer with active farm...");

  const existingFarmerEmail = "farmer.existing@farmersmarket.test";
  let existingFarmer = await prisma.user.findUnique({
    where: { email: existingFarmerEmail },
  });

  if (!existingFarmer) {
    existingFarmer = await prisma.user.create({
      data: {
        email: existingFarmerEmail,
        password: await bcrypt.hash("FarmerTest123!@#", 12),
        firstName: "Existing",
        lastName: "Farmer",
        phone: "+15559876543",
        role: "FARMER",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
        lastLoginAt: new Date(),
        loginCount: 0,
      },
    });
    console.log(`✅ Created existing farmer: ${existingFarmer.email}`);
  } else {
    console.log(`✅ Existing farmer already exists: ${existingFarmer.email}`);
  }

  // Create farm for existing farmer
  let existingFarm = await prisma.farm.findFirst({
    where: { ownerId: existingFarmer.id },
  });

  if (!existingFarm) {
    existingFarm = await prisma.farm.create({
      data: {
        name: "Green Valley Farm",
        slug: "green-valley-farm",
        description:
          "A family-owned organic farm growing fresh vegetables and fruits year-round",
        ownerId: existingFarmer.id,
        status: "ACTIVE",
        verificationStatus: "VERIFIED", // Active farm should be verified
        verifiedAt: new Date(),
        verifiedBy: "system-seed",
        email: existingFarmerEmail,
        phone: "+15559876543",
        address: "123 Farm Road",
        city: "Portland",
        state: "OR",
        zipCode: "97201",
        country: "US",
        latitude: 45.5152,
        longitude: -122.6784,
        images: [],
        taxId: "12-3456789",
        certificationsArray: ["USDA_ORGANIC"],
        deliveryRadius: 25,
      },
    });
    console.log(`✅ Created farm: ${existingFarm.name} (VERIFIED)`);
  } else {
    // Update status to ACTIVE and verificationStatus to VERIFIED if not already
    if (existingFarm.status !== "ACTIVE" || existingFarm.verificationStatus !== "VERIFIED") {
      existingFarm = await prisma.farm.update({
        where: { id: existingFarm.id },
        data: {
          status: "ACTIVE",
          verificationStatus: "VERIFIED",
          verifiedAt: new Date(),
          verifiedBy: "system-seed"
        },
      });
      console.log(`✅ Updated farm status to ACTIVE/VERIFIED: ${existingFarm.name}`);
    } else {
      console.log(`✅ Farm already exists and is active: ${existingFarm.name}`);
    }
  }

  // ==========================================================================
  // 3. Create PENDING Farmer with PENDING Farm (for admin approval tests)
  // ==========================================================================
  console.log("\n⏳ Creating pending farmer with pending farm...");

  const pendingFarmerEmail = "farmer.pending@farmersmarket.test";
  let pendingFarmer = await prisma.user.findUnique({
    where: { email: pendingFarmerEmail },
  });

  if (!pendingFarmer) {
    pendingFarmer = await prisma.user.create({
      data: {
        email: pendingFarmerEmail,
        password: await bcrypt.hash("PendingFarmer123!@#", 12),
        firstName: "Pending",
        lastName: "Farmer",
        phone: "+15557654321",
        role: "FARMER",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
        lastLoginAt: new Date(),
        loginCount: 0,
      },
    });
    console.log(`✅ Created pending farmer: ${pendingFarmer.email}`);
  } else {
    console.log(`✅ Pending farmer already exists: ${pendingFarmer.email}`);
  }

  // Create PENDING farm for admin approval workflow
  let pendingFarm = await prisma.farm.findFirst({
    where: { ownerId: pendingFarmer.id },
  });

  if (!pendingFarm) {
    pendingFarm = await prisma.farm.create({
      data: {
        name: "Sunrise Organic Farm",
        slug: "sunrise-organic-farm",
        description:
          "A new organic farm specializing in heritage vegetables and sustainable farming practices. Awaiting admin approval.",
        ownerId: pendingFarmer.id,
        status: "PENDING",
        verificationStatus: "PENDING", // Critical: Admin API filters by verificationStatus
        email: pendingFarmerEmail,
        phone: "+15557654321",
        address: "456 Sunrise Lane",
        city: "Eugene",
        state: "OR",
        zipCode: "97401",
        country: "US",
        latitude: 44.0521,
        longitude: -123.0868,
        images: [],
        taxId: "98-7654321",
        certificationsArray: ["USDA_ORGANIC"],
        deliveryRadius: 20,
      },
    });
    console.log(`✅ Created PENDING farm: ${pendingFarm.name} (verificationStatus: PENDING)`);
  } else {
    // Update both status and verificationStatus to PENDING if not already
    if (pendingFarm.status !== "PENDING" || pendingFarm.verificationStatus !== "PENDING") {
      pendingFarm = await prisma.farm.update({
        where: { id: pendingFarm.id },
        data: {
          status: "PENDING",
          verificationStatus: "PENDING"
        },
      });
      console.log(`✅ Updated farm to PENDING status: ${pendingFarm.name}`);
    } else {
      console.log(`✅ PENDING farm already exists: ${pendingFarm.name} (verificationStatus: PENDING)`);
    }
  }

  // ==========================================================================
  // 4. Create Products
  // ==========================================================================
  console.log("\n🌾 Creating products...");

  const productsData = [
    {
      name: "Fresh Organic Tomatoes",
      description:
        "Vine-ripened organic tomatoes bursting with flavor. Perfect for salads, sauces, and fresh eating. Grown using biodynamic farming practices.",
      category: "VEGETABLES",
      unit: "LB",
      price: 5.99,
      quantityAvailable: 100,
      images: [
        "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800",
        "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800",
      ],
      organic: true,
      seasonal: true,
      inStock: true,
      featured: true,
      lowStockThreshold: 10,
    },
    {
      name: "Crisp Lettuce Mix",
      description:
        "Mixed greens including romaine, butterhead, and red leaf lettuce. Harvested fresh daily. Perfect for salads and sandwiches.",
      category: "VEGETABLES",
      unit: "BAG",
      price: 4.99,
      quantityAvailable: 75,
      images: [
        "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800",
      ],
      organic: true,
      seasonal: false,
      inStock: true,
      featured: true,
      lowStockThreshold: 10,
    },
    {
      name: "Sweet Strawberries",
      description:
        "Juicy, sweet strawberries picked at peak ripeness. Grown without pesticides. Great for desserts, smoothies, or eating fresh.",
      category: "FRUITS",
      unit: "PINT",
      price: 6.99,
      compareAtPrice: 7.99,
      quantityAvailable: 50,
      images: [
        "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800",
      ],
      organic: true,
      seasonal: true,
      inStock: true,
      featured: true,
      lowStockThreshold: 10,
    },
    {
      name: "Farm Fresh Eggs",
      description:
        "Free-range chicken eggs from our happy hens. Rich, golden yolks and superior taste. Collected daily.",
      category: "EGGS",
      unit: "DOZEN",
      price: 7.99,
      quantityAvailable: 120,
      images: [
        "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800",
      ],
      organic: false,
      seasonal: false,
      inStock: true,
      featured: false,
      lowStockThreshold: 20,
    },
    {
      name: "Crispy Carrots",
      description:
        "Sweet, crunchy carrots perfect for snacking, roasting, or juicing. Grown in rich, organic soil.",
      category: "VEGETABLES",
      unit: "LB",
      price: 3.99,
      quantityAvailable: 80,
      images: [
        "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800",
      ],
      organic: true,
      seasonal: false,
      inStock: true,
      featured: false,
      lowStockThreshold: 15,
    },
    {
      name: "Sweet Bell Peppers",
      description:
        "Colorful mix of red, yellow, and orange bell peppers. Sweet and crunchy. Perfect for grilling, stuffing, or eating raw.",
      category: "VEGETABLES",
      unit: "LB",
      price: 5.49,
      quantityAvailable: 60,
      images: [
        "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800",
      ],
      organic: true,
      seasonal: true,
      inStock: true,
      featured: false,
      lowStockThreshold: 10,
    },
  ];

  for (const productData of productsData) {
    // Check if product already exists
    const existing = await prisma.product.findFirst({
      where: {
        name: productData.name,
        farmId: existingFarm.id,
      },
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          ...productData,
          farmId: existingFarm.id,
          slug: productData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
          status: "ACTIVE",
        },
      });
      console.log(`  ✅ Created: ${productData.name}`);
    } else {
      console.log(`  ℹ️  Already exists: ${productData.name}`);
    }
  }

  // ==========================================================================
  // Summary
  // ==========================================================================
  console.log("\n📊 Seed Summary:");
  console.log(`  Admin: ${adminEmail}`);
  console.log(`  Active Farmer: ${existingFarmerEmail}`);
  console.log(`  Active Farm: ${existingFarm.name} (${existingFarm.status})`);
  console.log(`  Pending Farmer: ${pendingFarmerEmail}`);
  console.log(`  Pending Farm: ${pendingFarm.name} (${pendingFarm.status})`);

  const productCount = await prisma.product.count({
    where: { farmId: existingFarm.id },
  });
  console.log(`  Products: ${productCount}`);

  console.log("\n✅ Database seeded successfully for MVP Bot!");
  console.log("\n🤖 You can now run: npm run bot:mvp");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
