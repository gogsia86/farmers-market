import { PrismaClient, ProductCategory } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌾 Seeding database with basic data...");

  // 1. Create Admin User
  console.log("\n📝 Creating admin user...");
  const adminPassword = await bcrypt.hash("Admin123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "gogsia@gmail.com" },
    update: {},
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
  console.log(`✅ Admin user: ${admin.email}`);

  // 2. Create Farmer Users
  console.log("\n👨‍🌾 Creating farmer users...");
  const farmerPassword = await bcrypt.hash("Farmer123!", 12);

  const farmer1 = await prisma.user.upsert({
    where: { email: "farmer1@example.com" },
    update: {},
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

  const farmer2 = await prisma.user.upsert({
    where: { email: "farmer2@example.com" },
    update: {},
    create: {
      email: "farmer2@example.com",
      password: farmerPassword,
      firstName: "Sarah",
      lastName: "Green",
      role: "FARMER",
      status: "ACTIVE",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  const farmer3 = await prisma.user.upsert({
    where: { email: "farmer3@example.com" },
    update: {},
    create: {
      email: "farmer3@example.com",
      password: farmerPassword,
      firstName: "Michael",
      lastName: "Harvest",
      role: "FARMER",
      status: "ACTIVE",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`✅ Created ${3} farmers`);

  // 3. Create Consumer User
  console.log("\n🛒 Creating consumer user...");
  const consumerPassword = await bcrypt.hash("Consumer123!", 12);

  const consumer = await prisma.user.upsert({
    where: { email: "consumer@example.com" },
    update: {},
    create: {
      email: "consumer@example.com",
      password: consumerPassword,
      firstName: "Jane",
      lastName: "Consumer",
      role: "CONSUMER",
      status: "ACTIVE",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✅ Consumer user: ${consumer.email}`);

  // 4. Create Farms
  console.log("\n🏡 Creating farms...");

  const farm1 = await prisma.farm.create({
    data: {
      name: "Sunshine Valley Farm",
      slug: "sunshine-valley-farm",
      description:
        "Family-owned organic farm dedicated to sustainable agriculture and community wellness.",
      ownerId: farmer1.id,
      email: "info@sunshinevalley.com",
      phone: "+1-555-0101",
      address: "123 Farm Road",
      city: "Farmville",
      state: "CA",
      zipCode: "12345",
      country: "US",
      latitude: 37.7749,
      longitude: -122.4194,
      status: "ACTIVE",
      verificationStatus: "VERIFIED",
      images: [],
      certificationsArray: ["USDA Organic", "Certified Naturally Grown"],
    },
  });

  const farm2 = await prisma.farm.create({
    data: {
      name: "Green Acres Organic",
      slug: "green-acres-organic",
      description:
        "Certified organic vegetables and fruits grown with love and care for over 20 years.",
      ownerId: farmer2.id,
      email: "contact@greenacres.com",
      phone: "+1-555-0102",
      address: "456 Organic Lane",
      city: "Greenfield",
      state: "WA",
      zipCode: "98001",
      country: "US",
      latitude: 47.6062,
      longitude: -122.3321,
      status: "ACTIVE",
      verificationStatus: "VERIFIED",
      images: [],
      certificationsArray: ["USDA Organic", "Non-GMO Project"],
    },
  });

  const farm3 = await prisma.farm.create({
    data: {
      name: "Harvest Moon Ranch",
      slug: "harvest-moon-ranch",
      description:
        "Regenerative agriculture practices producing nutrient-dense food for our community.",
      ownerId: farmer3.id,
      email: "hello@harvestmoon.com",
      phone: "+1-555-0103",
      address: "789 Ranch Drive",
      city: "Harvestville",
      state: "OR",
      zipCode: "97001",
      country: "US",
      latitude: 45.5152,
      longitude: -122.6784,
      status: "ACTIVE",
      verificationStatus: "VERIFIED",
      images: [],
      certificationsArray: ["Regenerative Organic", "Animal Welfare Approved"],
    },
  });

  const farm4 = await prisma.farm.create({
    data: {
      name: "Prairie View Homestead",
      slug: "prairie-view-homestead",
      description:
        "Small-batch artisanal produce with focus on heirloom varieties and biodiversity.",
      ownerId: farmer1.id,
      email: "info@prairieview.com",
      phone: "+1-555-0104",
      address: "321 Prairie Path",
      city: "Prairie City",
      state: "TX",
      zipCode: "75001",
      country: "US",
      latitude: 32.7767,
      longitude: -96.797,
      status: "ACTIVE",
      verificationStatus: "VERIFIED",
      images: [],
      certificationsArray: ["Certified Naturally Grown"],
    },
  });

  const farm5 = await prisma.farm.create({
    data: {
      name: "Riverside Gardens",
      slug: "riverside-gardens",
      description:
        "Permaculture-based farm offering seasonal vegetables, herbs, and microgreens.",
      ownerId: farmer2.id,
      email: "info@riversidegardens.com",
      phone: "+1-555-0105",
      address: "555 River Road",
      city: "Riverside",
      state: "NY",
      zipCode: "10001",
      country: "US",
      latitude: 40.7128,
      longitude: -74.006,
      status: "ACTIVE",
      verificationStatus: "VERIFIED",
      images: [],
      certificationsArray: ["USDA Organic"],
    },
  });

  const farm6 = await prisma.farm.create({
    data: {
      name: "Mountain Peak Farm",
      slug: "mountain-peak-farm",
      description:
        "High-altitude organic farming with spectacular mountain views.",
      ownerId: farmer3.id,
      email: "info@mountainpeak.com",
      phone: "+1-555-0106",
      address: "777 Mountain Road",
      city: "Boulder",
      state: "CO",
      zipCode: "80301",
      country: "US",
      latitude: 40.015,
      longitude: -105.2705,
      status: "ACTIVE",
      verificationStatus: "VERIFIED",
      images: [],
      certificationsArray: ["USDA Organic", "Biodynamic Certified"],
    },
  });

  console.log(`✅ Created ${6} farms`);

  // 5. Create Products
  console.log("\n🥬 Creating products...");

  const products = [
    // Farm 1 - Sunshine Valley
    {
      farmId: farm1.id,
      name: "Organic Tomatoes",
      category: "VEGETABLES" as ProductCategory,
      unit: "lb",
      price: 4.99,
      stock: 100,
    },
    {
      farmId: farm1.id,
      name: "Fresh Lettuce",
      category: "VEGETABLES" as ProductCategory,
      unit: "head",
      price: 2.99,
      stock: 150,
    },
    {
      farmId: farm1.id,
      name: "Sweet Corn",
      category: "VEGETABLES" as ProductCategory,
      unit: "ear",
      price: 1.49,
      stock: 200,
    },
    {
      farmId: farm1.id,
      name: "Strawberries",
      category: "FRUITS" as ProductCategory,
      unit: "pint",
      price: 5.99,
      stock: 75,
    },
    {
      farmId: farm1.id,
      name: "Fresh Eggs",
      category: "DAIRY" as ProductCategory,
      unit: "dozen",
      price: 6.99,
      stock: 50,
    },

    // Farm 2 - Green Acres
    {
      farmId: farm2.id,
      name: "Organic Carrots",
      category: "VEGETABLES" as ProductCategory,
      unit: "lb",
      price: 3.49,
      stock: 120,
    },
    {
      farmId: farm2.id,
      name: "Bell Peppers",
      category: "VEGETABLES" as ProductCategory,
      unit: "lb",
      price: 4.49,
      stock: 80,
    },
    {
      farmId: farm2.id,
      name: "Blueberries",
      category: "FRUITS" as ProductCategory,
      unit: "pint",
      price: 6.99,
      stock: 60,
    },
    {
      farmId: farm2.id,
      name: "Honey",
      category: "PANTRY" as ProductCategory,
      unit: "jar",
      price: 12.99,
      stock: 40,
    },
    {
      farmId: farm2.id,
      name: "Organic Milk",
      category: "DAIRY" as ProductCategory,
      unit: "gallon",
      price: 8.99,
      stock: 30,
    },

    // Farm 3 - Harvest Moon
    {
      farmId: farm3.id,
      name: "Grass-Fed Beef",
      category: "MEAT" as ProductCategory,
      unit: "lb",
      price: 12.99,
      stock: 50,
    },
    {
      farmId: farm3.id,
      name: "Free-Range Chicken",
      category: "MEAT" as ProductCategory,
      unit: "lb",
      price: 8.99,
      stock: 60,
    },
    {
      farmId: farm3.id,
      name: "Organic Potatoes",
      category: "VEGETABLES" as ProductCategory,
      unit: "lb",
      price: 2.99,
      stock: 200,
    },
    {
      farmId: farm3.id,
      name: "Fresh Herbs",
      category: "VEGETABLES" as ProductCategory,
      unit: "bunch",
      price: 3.99,
      stock: 100,
    },
    {
      farmId: farm3.id,
      name: "Pumpkins",
      category: "VEGETABLES" as ProductCategory,
      unit: "each",
      price: 5.99,
      stock: 40,
    },

    // Farm 4 - Prairie View
    {
      farmId: farm4.id,
      name: "Heirloom Tomatoes",
      category: "VEGETABLES" as ProductCategory,
      unit: "lb",
      price: 6.99,
      stock: 80,
    },
    {
      farmId: farm4.id,
      name: "Rainbow Chard",
      category: "VEGETABLES" as ProductCategory,
      unit: "bunch",
      price: 4.49,
      stock: 70,
    },
    {
      farmId: farm4.id,
      name: "Peaches",
      category: "FRUITS" as ProductCategory,
      unit: "lb",
      price: 5.49,
      stock: 90,
    },
    {
      farmId: farm4.id,
      name: "Artisan Bread",
      category: "PANTRY" as ProductCategory,
      unit: "loaf",
      price: 7.99,
      stock: 25,
    },
    {
      farmId: farm4.id,
      name: "Goat Cheese",
      category: "DAIRY" as ProductCategory,
      unit: "lb",
      price: 14.99,
      stock: 20,
    },

    // Farm 5 - Riverside Gardens
    {
      farmId: farm5.id,
      name: "Microgreens Mix",
      category: "VEGETABLES" as ProductCategory,
      unit: "oz",
      price: 8.99,
      stock: 50,
    },
    {
      farmId: farm5.id,
      name: "Organic Cucumbers",
      category: "VEGETABLES" as ProductCategory,
      unit: "lb",
      price: 3.99,
      stock: 100,
    },
    {
      farmId: farm5.id,
      name: "Zucchini",
      category: "VEGETABLES" as ProductCategory,
      unit: "lb",
      price: 2.99,
      stock: 120,
    },
    {
      farmId: farm5.id,
      name: "Basil",
      category: "VEGETABLES" as ProductCategory,
      unit: "bunch",
      price: 3.49,
      stock: 80,
    },
    {
      farmId: farm5.id,
      name: "Cherry Tomatoes",
      category: "VEGETABLES" as ProductCategory,
      unit: "pint",
      price: 4.99,
      stock: 90,
    },

    // Farm 6 - Mountain Peak
    {
      farmId: farm6.id,
      name: "Alpine Lettuce",
      category: "VEGETABLES" as ProductCategory,
      unit: "head",
      price: 3.99,
      stock: 100,
    },
    {
      farmId: farm6.id,
      name: "Mountain Apples",
      category: "FRUITS" as ProductCategory,
      unit: "lb",
      price: 4.99,
      stock: 150,
    },
    {
      farmId: farm6.id,
      name: "Wild Mushrooms",
      category: "VEGETABLES" as ProductCategory,
      unit: "lb",
      price: 15.99,
      stock: 30,
    },
    {
      farmId: farm6.id,
      name: "Organic Spinach",
      category: "VEGETABLES" as ProductCategory,
      unit: "bunch",
      price: 3.99,
      stock: 80,
    },
    {
      farmId: farm6.id,
      name: "Fresh Yogurt",
      category: "DAIRY" as ProductCategory,
      unit: "quart",
      price: 7.99,
      stock: 40,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        farmId: product.farmId,
        name: product.name,
        slug: product.name.toLowerCase().replace(/\s+/g, "-"),
        description: `Fresh ${product.name.toLowerCase()} from our farm`,
        category: product.category,
        unit: product.unit,
        price: product.price,
        quantityAvailable: product.stock,
        inStock: true,
        status: "ACTIVE",
        featured: Math.random() > 0.7, // 30% chance of being featured
      },
    });
  }

  console.log(`✅ Created ${products.length} products`);

  // 6. Create Reviews for farms
  console.log("\n⭐ Creating reviews...");

  const reviews = [
    {
      farmId: farm1.id,
      customerId: consumer.id,
      rating: 5,
      reviewText: "Amazing quality! Fresh and delicious produce.",
    },
    {
      farmId: farm1.id,
      customerId: consumer.id,
      rating: 5,
      reviewText: "Best farm in the area. Highly recommend!",
    },
    {
      farmId: farm2.id,
      customerId: consumer.id,
      rating: 5,
      reviewText: "Love their organic vegetables. Always fresh!",
    },
    {
      farmId: farm2.id,
      customerId: consumer.id,
      rating: 4,
      reviewText: "Great products, friendly service.",
    },
    {
      farmId: farm3.id,
      customerId: consumer.id,
      rating: 5,
      reviewText: "The grass-fed beef is incredible!",
    },
    {
      farmId: farm3.id,
      customerId: consumer.id,
      rating: 5,
      reviewText: "True regenerative farming. You can taste the difference.",
    },
    {
      farmId: farm4.id,
      customerId: consumer.id,
      rating: 5,
      reviewText: "Heirloom varieties are spectacular!",
    },
    {
      farmId: farm5.id,
      customerId: consumer.id,
      rating: 4,
      reviewText: "Great microgreens and herbs.",
    },
    {
      farmId: farm6.id,
      customerId: consumer.id,
      rating: 5,
      reviewText: "Mountain fresh produce is unbeatable!",
    },
  ];

  for (const review of reviews) {
    await prisma.review.create({
      data: {
        farmId: review.farmId,
        customerId: review.customerId,
        rating: review.rating,
        reviewText: review.reviewText,
        status: "APPROVED",
      },
    });
  }

  console.log(`✅ Created ${reviews.length} reviews`);

  console.log("\n🎉 Database seeding complete!");
  console.log("\n📋 Test Credentials:");
  console.log("   Admin: gogsia@gmail.com / Admin123!");
  console.log("   Farmer: farmer1@example.com / Farmer123!");
  console.log("   Consumer: consumer@example.com / Consumer123!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
