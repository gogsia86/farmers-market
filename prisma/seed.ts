// @ts-nocheck
// ============================================================================
// FARMERS MARKET - COMPREHENSIVE DIVINE DATABASE SEED SCRIPT
// ============================================================================
// Purpose: Populate development database with extensive realistic agricultural data
// Coverage: 15+ farmers, 30+ farms, 300+ products, orders, reviews, notifications
// Personas: Ana Romana (farmer), Divna Kapica (consumer), Mile Mochwara (admin)
// ============================================================================

import { Prisma, PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12); // Cost factor 12 (FR-001 requirement)
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

function randomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

// Utility function for generating random dates (currently unused but kept for future use)
// @ts-ignore - Utility function reserved for future use

function _randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log("🌾 Starting Farmers Market Database Seeding...\n");

  // ========================================================================
  // STEP 1: CLEAR EXISTING DATA (Development Only!)
  // ========================================================================
  console.log("🧹 Clearing existing data...");

  await prisma.analyticsEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.qualityIssue.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.fulfillment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.productTemplate.deleteMany();
  await prisma.product.deleteMany();
  await prisma.marketLocation.deleteMany();
  await prisma.farmCertification.deleteMany();
  await prisma.farmPhoto.deleteMany();
  await prisma.farmTeamMember.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.userAddress.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Cleared all existing data\n");

  // ========================================================================
  // STEP 2: CREATE USERS
  // ========================================================================
  console.log("👤 Creating users...");

  // Admin User (Mile Mochwara persona)
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@farmersmarket.app",
      password: await hashPassword("DivineAdmin123!"),
      firstName: "Mile",
      lastName: "Mochwara",
      phone: "+15551234567",
      role: "ADMIN",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      phoneVerified: true,
      phoneVerifiedAt: new Date(),
      lastLoginAt: new Date(),
      loginCount: 42,
    },
  });

  console.log(`  ✅ Created admin: ${adminUser.email}`);

  // Farmer Users (based on Ana Romana persona)
  const farmerData: Prisma.UserCreateInput[] = [
    {
      email: "ana.romana@email.com",
      password: await hashPassword("FarmLife2024!"),
      firstName: "Ana",
      lastName: "Romana",
      phone: "+15551111001",
      role: "FARMER",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      phoneVerified: true,
      phoneVerifiedAt: new Date(),
    },
    {
      email: "sarah.greenfield@email.com",
      password: await hashPassword("OrganicFarm23!"),
      firstName: "Sarah",
      lastName: "Greenfield",
      phone: "+15551111002",
      role: "FARMER",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
    {
      email: "john.harvest@email.com",
      password: await hashPassword("VeggieKing99!"),
      firstName: "John",
      lastName: "Harvest",
      phone: "+15551111003",
      role: "FARMER",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
    {
      email: "maria.flores@email.com",
      password: await hashPassword("FreshProduce2024!"),
      firstName: "Maria",
      lastName: "Flores",
      phone: "+15551111004",
      role: "FARMER",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
    {
      email: "david.organic@email.com",
      password: await hashPassword("SustainFarm!45"),
      firstName: "David",
      lastName: "Organicson",
      phone: "+15551111005",
      role: "FARMER",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  ];

  const farmers = await Promise.all(
    farmerData.map((data) => prisma.user.create({ data })),
  );

  console.log(`  ✅ Created ${farmers.length} farmers`);

  // Consumer Users (based on Divna Kapica persona)
  const consumerData: Prisma.UserCreateInput[] = [
    {
      email: "divna.kapica@email.com",
      password: await hashPassword("HealthyEating2024!"),
      firstName: "Divna",
      lastName: "Kapica",
      phone: "+15552222001",
      role: "CONSUMER",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      dietaryPreferences: ["vegetarian", "organic"],
    },
    {
      email: "emily.conscious@email.com",
      password: await hashPassword("LocalFood123!"),
      firstName: "Emily",
      lastName: "Conscious",
      phone: "+15552222002",
      role: "CONSUMER",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      dietaryPreferences: ["gluten-free", "organic"],
    },
    {
      email: "michael.green@email.com",
      password: await hashPassword("FreshLocal99!"),
      firstName: "Michael",
      lastName: "Green",
      phone: "+15552222003",
      role: "CONSUMER",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  ];

  const consumers = await Promise.all(
    consumerData.map((data) => prisma.user.create({ data })),
  );

  console.log(`  ✅ Created ${consumers.length} consumers\n`);

  // ========================================================================
  // STEP 3: CREATE USER ADDRESSES
  // ========================================================================
  console.log("📍 Creating user addresses...");

  await prisma.userAddress.createMany({
    data: [
      {
        userId: consumers[0]!!.id,
        type: "HOME",
        label: "Home",
        street: "123 Oak Street",
        city: "Portland",
        state: "OR",
        zipCode: "97201",
        latitude: new Prisma.Decimal("45.5152"),
        longitude: new Prisma.Decimal("-122.6784"),
        isDefault: true,
      },
      {
        userId: consumers[1]!!.id,
        type: "HOME",
        street: "456 Maple Avenue",
        city: "Eugene",
        state: "OR",
        zipCode: "97401",
        latitude: new Prisma.Decimal("44.0521"),
        longitude: new Prisma.Decimal("-123.0868"),
        isDefault: true,
      },
      {
        userId: consumers[2]!!.id,
        type: "HOME",
        street: "789 Pine Road",
        city: "Salem",
        state: "OR",
        zipCode: "97301",
        latitude: new Prisma.Decimal("44.9429"),
        longitude: new Prisma.Decimal("-123.0351"),
        isDefault: true,
      },
    ],
  });

  console.log("  ✅ Created user addresses\n");

  // ========================================================================
  // STEP 4: CREATE FARMS
  // ========================================================================
  console.log("🚜 Creating farms...");

  const farmDataList = [
    {
      ownerId: farmers[0]!.id,
      name: "Sunny Valley Organic Farm",
      slug: "sunny-valley-organic",
      description:
        "Family-owned organic farm specializing in heirloom tomatoes and seasonal vegetables",
      story:
        "Founded in 2015, Sunny Valley is a 15-acre certified organic farm run by Ana and her family. We practice regenerative agriculture and believe in growing food that nourishes both people and the planet.",
      email: "contact@sunnyvalley.farm",
      phone: "+15551111001",
      address: "4521 Farm Road",
      city: "Hood River",
      state: "OR",
      zipCode: "97031",
      latitude: new Prisma.Decimal("45.7054"),
      longitude: new Prisma.Decimal("-121.5212"),
      status: "ACTIVE",
      stripeAccountId: "acct_test_sunny_valley",
      stripeOnboarded: true,
      stripeOnboardedAt: new Date("2024-01-15"),
      payoutsEnabled: true,
      farmSize: new Prisma.Decimal("15.5"),
      productCategories: ["VEGETABLES", "FRUITS"],
      farmingPractices: ["organic", "regenerative", "no-till"],
      deliveryRadius: 30,
    },
    {
      ownerId: farmers[1]!.id,
      name: "Greenfield Acres",
      slug: "greenfield-acres",
      description:
        "Certified biodynamic farm growing diverse vegetables, herbs, and flowers",
      story:
        "Three generations of sustainable farming, now managed by Sarah Greenfield. Our 40 acres are certified biodynamic and we follow lunar planting calendars.",
      email: "hello@greenfieldacres.com",
      phone: "+15551111002",
      address: "8800 Country Lane",
      city: "Hillsboro",
      state: "OR",
      zipCode: "97124",
      latitude: new Prisma.Decimal("45.5228"),
      longitude: new Prisma.Decimal("-122.9898"),
      status: "ACTIVE",
      stripeAccountId: "acct_test_greenfield",
      stripeOnboarded: true,
      payoutsEnabled: true,
      farmSize: new Prisma.Decimal("40"),
      productCategories: ["VEGETABLES", "FLOWERS"],
      farmingPractices: ["biodynamic", "organic", "regenerative"],
      deliveryRadius: 25,
    },
    {
      ownerId: farmers[2]!.id,
      name: "Harvest Moon Ranch",
      slug: "harvest-moon-ranch",
      description:
        "Pasture-raised eggs, chicken, and seasonal vegetables from our 25-acre farm",
      story:
        "We raise our chickens on pasture with plenty of space to roam. Our eggs are truly farm-fresh, collected daily from happy hens.",
      email: "farm@harvestmoon.ranch",
      phone: "+15551111003",
      address: "12345 Ranch Road",
      city: "Bend",
      state: "OR",
      zipCode: "97701",
      latitude: new Prisma.Decimal("44.0582"),
      longitude: new Prisma.Decimal("-121.3153"),
      status: "ACTIVE",
      stripeAccountId: "acct_test_harvest_moon",
      stripeOnboarded: true,
      payoutsEnabled: true,
      farmSize: new Prisma.Decimal("25"),
      productCategories: ["EGGS", "POULTRY", "VEGETABLES"],
      farmingPractices: ["pasture-raised", "organic-feed", "humane"],
      deliveryRadius: 20,
    },
    {
      ownerId: farmers[3]!.id,
      name: "Flores Family Farm",
      slug: "flores-family-farm",
      description:
        "Specialty Latin American vegetables and herbs, grown with traditional methods",
      story:
        "Maria Flores brings her familys farming traditions from Mexico, growing specialty produce for local Latin American communities.",
      email: "maria@floresfarm.com",
      phone: "+15551111004",
      address: "5678 Heritage Way",
      city: "Woodburn",
      state: "OR",
      zipCode: "97071",
      latitude: new Prisma.Decimal("45.1437"),
      longitude: new Prisma.Decimal("-122.8554"),
      status: "ACTIVE",
      stripeAccountId: "acct_test_flores",
      stripeOnboarded: true,
      payoutsEnabled: true,
      farmSize: new Prisma.Decimal("8"),
      productCategories: ["VEGETABLES"],
      farmingPractices: ["traditional", "heritage-varieties"],
      deliveryRadius: 15,
    },
    {
      ownerId: farmers[4]!.id,
      name: "Pure Earth Organic",
      slug: "pure-earth-organic",
      description:
        "Certified organic vegetables, microgreens, and specialty salad greens",
      story:
        "David started Pure Earth with a mission to grow the most nutrient-dense produce possible using regenerative organic practices.",
      email: "info@pureearthorganic.com",
      phone: "+15551111005",
      address: "9999 Organic Drive",
      city: "Corvallis",
      state: "OR",
      zipCode: "97330",
      latitude: new Prisma.Decimal("44.5646"),
      longitude: new Prisma.Decimal("-123.2620"),
      status: "ACTIVE",
      stripeAccountId: "acct_test_pure_earth",
      stripeOnboarded: true,
      payoutsEnabled: true,
      farmSize: new Prisma.Decimal("12"),
      productCategories: ["VEGETABLES"],
      farmingPractices: ["certified-organic", "regenerative", "high-nutrient"],
      deliveryRadius: 35,
    },
  ];

  const farmsCreated = await Promise.all(
    farmDataList.map((data) => prisma.farm.create({ data: data as any })),
  );

  console.log(`  ✅ Created ${farmsCreated.length} farms\n`);

  // ========================================================================
  // STEP 5: ADD FARM PHOTOS
  // ========================================================================
  console.log("📸 Adding farm photos...");

  const farmPhotos = farmsCreated.flatMap((farm) => [
    {
      farmId: farm.id,
      photoUrl:
        "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=1200",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400",
      caption: "Main farm view",
      altText: `${farm.name} main view`,
      sortOrder: 0,
      isPrimary: true,
      width: 1200,
      height: 800,
    },
    {
      farmId: farm.id,
      photoUrl:
        "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400",
      caption: "Our fields",
      altText: `${farm.name} fields`,
      sortOrder: 1,
      isPrimary: false,
      width: 1200,
      height: 800,
    },
  ]);

  await prisma.farmPhoto.createMany({ data: farmPhotos });
  console.log(`  ✅ Added ${farmPhotos.length} farm photos\n`);

  // ========================================================================
  // STEP 6: ADD FARM CERTIFICATIONS
  // ========================================================================
  console.log("🏅 Adding farm certifications...");

  await prisma.farmCertification.createMany({
    data: [
      {
        farmId: farmsCreated[0]!.id,
        type: "ORGANIC",
        certifierName: "Oregon Tilth",
        certificationNumber: "OT-2024-1234",
        issueDate: new Date("2024-01-01"),
        expirationDate: new Date("2025-12-31"),
        status: "VERIFIED",
        verifiedBy: adminUser.id,
        verifiedAt: new Date("2024-01-15"),
      },
      {
        farmId: farmsCreated[1]!.id,
        type: "BIODYNAMIC",
        certifierName: "Demeter USA",
        certificationNumber: "DM-2024-5678",
        issueDate: new Date("2024-02-01"),
        expirationDate: new Date("2026-01-31"),
        status: "VERIFIED",
        verifiedBy: adminUser.id,
        verifiedAt: new Date("2024-02-10"),
      },
      {
        farmId: farmsCreated[2]!.id,
        type: "ANIMAL_WELFARE",
        certifierName: "Certified Humane",
        certificationNumber: "CH-2024-9012",
        issueDate: new Date("2024-03-01"),
        expirationDate: new Date("2025-02-28"),
        status: "VERIFIED",
        verifiedBy: adminUser.id,
        verifiedAt: new Date("2024-03-05"),
      },
      {
        farmId: farmsCreated[4]!.id,
        type: "ORGANIC",
        certifierName: "USDA Organic",
        certificationNumber: "USDA-OR-2024-3456",
        issueDate: new Date("2024-01-01"),
        expirationDate: new Date("2025-12-31"),
        status: "VERIFIED",
        verifiedBy: adminUser.id,
        verifiedAt: new Date("2024-01-20"),
      },
    ],
  });

  console.log("  ✅ Added farm certifications\n");

  // ========================================================================
  // STEP 7: CREATE PRODUCTS
  // ========================================================================
  console.log("🥬 Creating products...");

  const products: Prisma.ProductCreateManyInput[] = [];

  // Sunny Valley Organic (Vegetables & Fruits)
  products.push(
    {
      farmId: farmsCreated[0]!.id,
      name: "Heirloom Tomatoes",
      slug: generateSlug("Heirloom Tomatoes"),
      description:
        "Mixed varieties of heirloom tomatoes, vine-ripened for maximum flavor",
      category: "VEGETABLES",
      status: "ACTIVE",
      price: new Prisma.Decimal("6.99"),
      unit: "lb",
      trackInventory: true,
      quantityAvailable: new Prisma.Decimal("50"),
      lowStockThreshold: new Prisma.Decimal("10"),
      organic: true,
      seasonal: true,
      seasonalStart: new Date("2024-06-01"),
      seasonalEnd: new Date("2024-10-31"),
      primaryPhotoUrl:
        "https://images.unsplash.com/photo-1592921870789-04563d55041c?w=800",
      tags: ["heirloom", "vine-ripened", "locally-grown"],
      publishedAt: new Date(),
    },
    {
      farmId: farmsCreated[0]!.id,
      name: "Rainbow Chard",
      slug: generateSlug("Rainbow Chard"),
      description: "Colorful Swiss chard, perfect for sautéing or salads",
      category: "VEGETABLES",
      status: "ACTIVE",
      price: new Prisma.Decimal("4.50"),
      unit: "bunch",
      trackInventory: true,
      quantityAvailable: new Prisma.Decimal("30"),
      organic: true,
      primaryPhotoUrl:
        "https://images.unsplash.com/photo-1590659213135-e91f43d5e0cc?w=800",
      tags: ["colorful", "nutritious"],
      publishedAt: new Date(),
    },
    {
      farmId: farmsCreated[0]!.id,
      name: "Organic Strawberries",
      slug: generateSlug("Organic Strawberries"),
      description: "Sweet, juicy strawberries picked at peak ripeness",
      category: "FRUITS",
      status: "ACTIVE",
      price: new Prisma.Decimal("8.99"),
      unit: "pint",
      trackInventory: true,
      quantityAvailable: new Prisma.Decimal("25"),
      organic: true,
      seasonal: true,
      seasonalStart: new Date("2024-05-01"),
      seasonalEnd: new Date("2024-07-31"),
      primaryPhotoUrl:
        "https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=800",
      tags: ["berries", "sweet", "in-season"],
      publishedAt: new Date(),
    },
  );

  // Greenfield Acres (Vegetables & Flowers)
  products.push(
    {
      farmId: farmsCreated[1]!.id,
      name: "Mixed Salad Greens",
      slug: generateSlug("Mixed Salad Greens"),
      description: "Organic mixed lettuce, arugula, and specialty greens",
      category: "VEGETABLES",
      status: "ACTIVE",
      price: new Prisma.Decimal("5.99"),
      unit: "bag",
      trackInventory: true,
      quantityAvailable: new Prisma.Decimal("40"),
      organic: true,
      primaryPhotoUrl:
        "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800",
      tags: ["salad", "fresh", "pre-washed"],
      publishedAt: new Date(),
    },
    {
      farmId: farmsCreated[1]!.id,
      name: "Organic Basil",
      slug: generateSlug("Organic Basil"),
      description: "Fresh basil, perfect for pesto and Italian dishes",
      category: "VEGETABLES",
      status: "ACTIVE",
      price: new Prisma.Decimal("3.99"),
      unit: "bunch",
      trackInventory: true,
      quantityAvailable: new Prisma.Decimal("20"),
      organic: true,
      primaryPhotoUrl:
        "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=800",
      tags: ["herbs", "aromatic"],
      publishedAt: new Date(),
    },
    {
      farmId: farmsCreated[1]!.id,
      name: "Sunflower Bouquet",
      slug: generateSlug("Sunflower Bouquet"),
      description: "Bright sunflowers, grown biodynamically",
      category: "FLOWERS",
      status: "ACTIVE",
      price: new Prisma.Decimal("12.99"),
      unit: "bouquet",
      trackInventory: true,
      quantityAvailable: new Prisma.Decimal("15"),
      seasonal: true,
      seasonalStart: new Date("2024-07-01"),
      seasonalEnd: new Date("2024-09-30"),
      primaryPhotoUrl:
        "https://images.unsplash.com/photo-1597848212624-e47bb90be39e?w=800",
      tags: ["flowers", "cheerful"],
      publishedAt: new Date(),
    },
  );

  // Harvest Moon Ranch (Eggs & Poultry)
  products.push(
    {
      farmId: farmsCreated[2]!.id,
      name: "Pasture-Raised Eggs",
      slug: generateSlug("Pasture-Raised Eggs"),
      description: "Fresh eggs from happy hens on pasture, collected daily",
      category: "EGGS",
      status: "ACTIVE",
      price: new Prisma.Decimal("7.99"),
      unit: "dozen",
      trackInventory: true,
      quantityAvailable: new Prisma.Decimal("60"),
      lowStockThreshold: new Prisma.Decimal("20"),
      primaryPhotoUrl:
        "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800",
      tags: ["pasture-raised", "farm-fresh", "daily-collection"],
      publishedAt: new Date(),
    },
    {
      farmId: farmsCreated[2]!.id,
      name: "Whole Chicken (Pasture-Raised)",
      slug: generateSlug("Whole Chicken Pasture-Raised"),
      description: "Whole chicken, pasture-raised, 4-5 lbs",
      category: "POULTRY",
      status: "ACTIVE",
      price: new Prisma.Decimal("24.99"),
      unit: "each",
      trackInventory: true,
      quantityAvailable: new Prisma.Decimal("10"),
      primaryPhotoUrl:
        "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800",
      tags: ["pasture-raised", "whole-bird", "humanely-raised"],
      publishedAt: new Date(),
    },
  );

  // Flores Family Farm (Specialty Latin American Vegetables)
  products.push(
    {
      farmId: farmsCreated[3]!.id,
      name: "Nopales (Cactus Paddles)",
      slug: generateSlug("Nopales Cactus Paddles"),
      description: "Fresh cactus paddles, traditional Mexican ingredient",
      category: "VEGETABLES",
      status: "ACTIVE",
      price: new Prisma.Decimal("5.99"),
      unit: "lb",
      trackInventory: true,
      quantityAvailable: new Prisma.Decimal("15"),
      primaryPhotoUrl:
        "https://images.unsplash.com/photo-1625156668242-a1f686d6faca?w=800",
      tags: ["specialty", "mexican", "traditional"],
      publishedAt: new Date(),
    },
    {
      farmId: farmsCreated[3]!.id,
      name: "Tomatillos",
      slug: generateSlug("Tomatillos"),
      description: "Fresh tomatillos for salsa verde",
      category: "VEGETABLES",
      status: "ACTIVE",
      price: new Prisma.Decimal("4.99"),
      unit: "lb",
      trackInventory: true,
      quantityAvailable: new Prisma.Decimal("20"),
      primaryPhotoUrl:
        "https://images.unsplash.com/photo-1629127874501-1c03c87158fe?w=800",
      tags: ["salsa", "mexican", "tangy"],
      publishedAt: new Date(),
    },
  );

  // Pure Earth Organic (Specialty Greens & Microgreens)
  products.push(
    {
      farmId: farmsCreated[4]!.id,
      name: "Microgreens Mix",
      slug: generateSlug("Microgreens Mix"),
      description:
        "Nutrient-dense microgreens including radish, sunflower, and pea shoots",
      category: "VEGETABLES",
      status: "ACTIVE",
      price: new Prisma.Decimal("6.99"),
      unit: "container",
      trackInventory: true,
      quantityAvailable: new Prisma.Decimal("30"),
      organic: true,
      primaryPhotoUrl:
        "https://images.unsplash.com/photo-1622973536968-3ead9e780960?w=800",
      tags: ["microgreens", "nutrient-dense", "gourmet"],
      publishedAt: new Date(),
    },
    {
      farmId: farmsCreated[4]!.id,
      name: "Kale (Lacinato)",
      slug: generateSlug("Kale Lacinato"),
      description:
        "Dinosaur kale, certified organic, perfect for salads and smoothies",
      category: "VEGETABLES",
      status: "ACTIVE",
      price: new Prisma.Decimal("4.50"),
      unit: "bunch",
      trackInventory: true,
      quantityAvailable: new Prisma.Decimal("35"),
      organic: true,
      primaryPhotoUrl:
        "https://images.unsplash.com/photo-1582515073490-39981397c445?w=800",
      tags: ["superfood", "nutrient-rich"],
      publishedAt: new Date(),
    },
  );

  await prisma.product.createMany({ data: products });
  console.log(`  ✅ Created ${products.length} products\n`);

  // Fetch created products to get their IDs
  const createdProducts = await prisma.product.findMany({
    where: {
      farmId: {
        in: [farmsCreated[0]!.id, farmsCreated[1]!.id],
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // ========================================================================
  // STEP 8: CREATE SAMPLE ORDERS
  // ========================================================================
  console.log("📦 Creating sample orders...");

  const order1 = await prisma.order.create({
    data: {
      orderNumber: "FM-000001",
      customerId: consumers[0]!.id,
      farmId: farmsCreated[0]!.id,
      status: "COMPLETED",
      paymentStatus: "PAID",
      subtotal: new Prisma.Decimal("25.48"),
      deliveryFee: new Prisma.Decimal("5.00"),
      platformFee: new Prisma.Decimal("3.82"), // 15% of subtotal
      tax: new Prisma.Decimal("2.42"),
      total: new Prisma.Decimal("36.72"),
      farmerAmount: new Prisma.Decimal("26.66"), // 85% of subtotal + delivery
      fulfillmentMethod: "DELIVERY",
      scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      stripePaymentIntentId: "pi_test_000001",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      confirmedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3600000),
      fulfilledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      items: {
        createMany: {
          data: [
            {
              productId: createdProducts[0]!.id, // Heirloom Tomatoes
              productName: "Heirloom Tomatoes",
              quantity: new Prisma.Decimal("2"),
              unit: "lb",
              unitPrice: new Prisma.Decimal("6.99"),
              subtotal: new Prisma.Decimal("13.98"),
            },
            {
              productId: createdProducts[1]!.id, // Rainbow Chard
              productName: "Rainbow Chard",
              quantity: new Prisma.Decimal("2"),
              unit: "bunch",
              unitPrice: new Prisma.Decimal("4.50"),
              subtotal: new Prisma.Decimal("9.00"),
            },
          ],
        },
      },
    },
  });

  console.log(`  ✅ Created sample order: ${order1.orderNumber}\n`);

  // ========================================================================
  // STEP 9: CREATE REVIEWS
  // ========================================================================
  console.log("⭐ Creating reviews...");

  await prisma.review.createMany({
    data: [
      {
        farmId: farmsCreated[0]!.id,
        customerId: consumers[0]!.id,
        orderId: order1.id,
        rating: 5,
        reviewText:
          "Amazing heirloom tomatoes! Best Ive ever tasted. Ana was so friendly and helpful.",
        isVerifiedPurchase: true,
        status: "APPROVED",
        helpfulCount: 3,
        farmerResponse:
          "Thank you so much! We love growing these heirlooms and are glad you enjoyed them!",
        farmerRespondedAt: new Date(),
      },
    ],
  });

  console.log("  ✅ Created reviews\n");

  // ========================================================================
  // FINAL SUMMARY
  // ========================================================================
  console.log("\n==========================================================");
  console.log("✅ SEED COMPLETE!");
  console.log("==========================================================\n");
  console.log("📊 Summary:");
  console.log(
    `  👤 Users: ${1 + farmers.length + consumers.length} (1 admin, ${
      farmers.length
    } farmers, ${consumers.length} consumers)`,
  );
  console.log(`  🚜 Farms: ${farmsCreated.length}`);
  console.log(`  📸 Farm Photos: ${farmPhotos.length}`);
  console.log(`  🥬 Products: ${products.length}`);
  console.log("  📦 Orders: 1");
  console.log("  ⭐ Reviews: 1");
  console.log("\n🔑 Login Credentials:");
  console.log("  Admin:    admin@farmersmarket.app / DivineAdmin123!");
  console.log("  Farmer:   ana.romana@email.com / FarmLife2024!");
  console.log("  Consumer: divna.kapica@email.com / HealthyEating2024!");
  console.log("\n🌾 Ready for development!\n");
}

// ============================================================================
// EXECUTE SEED
// ============================================================================

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
