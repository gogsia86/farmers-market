// Comprehensive Seed Script - Full demo data
// Creates complete dataset: users, farms, products, orders, reviews

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

// Create PostgreSQL connection pool
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/farmersmarket";

const pool = new Pool({
  connectionString: connectionString,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with adapter (Prisma v7)
const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

// Utility functions
function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function main() {
  console.log(
    "🌾 Comprehensive Database Seed - Creating full demo dataset...\n",
  );

  try {
    // Test connection
    await prisma.$connect();
    console.log("✅ Database connected\n");

    // ========================================
    // 1. CREATE USERS
    // ========================================
    console.log("👥 Creating users...");

    // Admin
    const adminPassword = await bcrypt.hash("Admin123!", 12);
    const admin = await prisma.user.upsert({
      where: { email: "gogsia@gmail.com" },
      update: {
        password: adminPassword,
        role: "ADMIN",
        status: "ACTIVE",
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
    console.log(`  ✅ Admin: ${admin.email}`);

    // Farmers
    const farmerPassword = await bcrypt.hash("Farmer123!", 12);
    const farmerData = [
      {
        email: "ana.romana@email.com",
        firstName: "Ana",
        lastName: "Romana",
        phone: "+15551111001",
      },
      {
        email: "sarah.greenfield@email.com",
        firstName: "Sarah",
        lastName: "Greenfield",
        phone: "+15551111002",
      },
      {
        email: "john.harvest@email.com",
        firstName: "John",
        lastName: "Harvest",
        phone: "+15551111003",
      },
    ];

    const farmers = [];
    for (const data of farmerData) {
      const farmer = await prisma.user.upsert({
        where: { email: data.email },
        update: {
          password: farmerPassword,
          role: "FARMER",
          status: "ACTIVE",
        },
        create: {
          ...data,
          password: farmerPassword,
          role: "FARMER",
          status: "ACTIVE",
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
      farmers.push(farmer);
    }
    console.log(`  ✅ Created ${farmers.length} farmers`);

    // Consumers
    const consumerPassword = await bcrypt.hash("Consumer123!", 12);
    const consumerData = [
      {
        email: "divna.kapica@email.com",
        firstName: "Divna",
        lastName: "Kapica",
        phone: "+15552222001",
      },
      {
        email: "emily.conscious@email.com",
        firstName: "Emily",
        lastName: "Conscious",
        phone: "+15552222002",
      },
    ];

    const consumers = [];
    for (const data of consumerData) {
      const consumer = await prisma.user.upsert({
        where: { email: data.email },
        update: {
          password: consumerPassword,
          role: "CONSUMER",
          status: "ACTIVE",
        },
        create: {
          ...data,
          password: consumerPassword,
          role: "CONSUMER",
          status: "ACTIVE",
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
      consumers.push(consumer);
    }
    console.log(`  ✅ Created ${consumers.length} consumers\n`);

    // ========================================
    // 2. CREATE FARMS
    // ========================================
    console.log("🌾 Creating farms...");

    const farmDataList = [
      {
        ownerId: farmers[0].id,
        name: "Sunny Valley Organic Farm",
        slug: "sunny-valley-organic",
        description:
          "Family-owned organic farm specializing in heirloom tomatoes and seasonal vegetables",
        story:
          "Founded in 2015, Sunny Valley is a 15-acre certified organic farm run by Ana and her family.",
        email: "contact@sunnyvalley.farm",
        phone: "+15551111001",
        address: "4521 Farm Road",
        city: "Boulder",
        state: "CO",
        zipCode: "80301",
        country: "US",
        latitude: 40.015,
        longitude: -105.2705,
        status: "ACTIVE",
        verificationStatus: "VERIFIED",
        verifiedAt: new Date(),
        farmSize: 15.0,
        yearEstablished: 2015,
        deliveryRadius: 30,
      },
      {
        ownerId: farmers[1].id,
        name: "Greenfield Acres",
        slug: "greenfield-acres",
        description:
          "Certified biodynamic farm growing diverse vegetables, herbs, and flowers",
        story:
          "Three generations of sustainable farming, now managed by Sarah Greenfield.",
        email: "hello@greenfieldacres.com",
        phone: "+15551111002",
        address: "8800 Country Lane",
        city: "Portland",
        state: "OR",
        zipCode: "97201",
        country: "US",
        latitude: 45.5152,
        longitude: -122.6784,
        status: "ACTIVE",
        verificationStatus: "VERIFIED",
        verifiedAt: new Date(),
        farmSize: 40.0,
        yearEstablished: 1985,
        deliveryRadius: 25,
      },
      {
        ownerId: farmers[2].id,
        name: "Harvest Moon Ranch",
        slug: "harvest-moon-ranch",
        description:
          "Pasture-raised eggs, chicken, and seasonal vegetables from our 25-acre farm",
        story: "We raise our chickens on pasture with plenty of space to roam.",
        email: "farm@harvestmoon.ranch",
        phone: "+15551111003",
        address: "12345 Ranch Road",
        city: "Austin",
        state: "TX",
        zipCode: "78701",
        country: "US",
        latitude: 30.2672,
        longitude: -97.7431,
        status: "ACTIVE",
        verificationStatus: "VERIFIED",
        verifiedAt: new Date(),
        farmSize: 25.0,
        yearEstablished: 2018,
        deliveryRadius: 20,
      },
    ];

    const farms = [];
    for (const farmData of farmDataList) {
      const farm = await prisma.farm.upsert({
        where: { slug: farmData.slug },
        update: {
          status: farmData.status,
          verificationStatus: farmData.verificationStatus,
        },
        create: farmData,
      });
      farms.push(farm);
    }
    console.log(`  ✅ Created ${farms.length} farms\n`);

    // ========================================
    // 3. CREATE PRODUCTS
    // ========================================
    console.log("🥬 Creating products...");

    const productCategories = {
      VEGETABLES: [
        {
          name: "Organic Tomatoes - Heirloom Mix",
          slug: "organic-tomatoes-heirloom",
          description: "Colorful heirloom tomatoes, vine-ripened to perfection",
          price: 5.99,
          unit: "lb",
        },
        {
          name: "Fresh Carrots - Rainbow",
          slug: "fresh-carrots-rainbow",
          description: "Crunchy rainbow carrots in purple, orange, and yellow",
          price: 3.99,
          unit: "lb",
        },
        {
          name: "Organic Spinach",
          slug: "organic-spinach",
          description: "Tender baby spinach leaves, perfect for salads",
          price: 4.49,
          unit: "bunch",
        },
        {
          name: "Bell Peppers - Mixed Colors",
          slug: "bell-peppers-mixed",
          description: "Sweet bell peppers in red, yellow, and orange",
          price: 4.99,
          unit: "lb",
        },
        {
          name: "Organic Kale - Lacinato",
          slug: "organic-kale-lacinato",
          description: "Dark leafy kale, rich in nutrients",
          price: 3.49,
          unit: "bunch",
        },
      ],
      FRUITS: [
        {
          name: "Apples - Honeycrisp",
          slug: "apples-honeycrisp",
          description: "Sweet and crispy Honeycrisp apples",
          price: 5.99,
          unit: "lb",
        },
        {
          name: "Strawberries - Organic",
          slug: "strawberries-organic",
          description: "Fresh picked organic strawberries",
          price: 6.99,
          unit: "pint",
        },
        {
          name: "Blueberries - Local",
          slug: "blueberries-local",
          description: "Plump, sweet local blueberries",
          price: 7.99,
          unit: "pint",
        },
      ],
      EGGS: [
        {
          name: "Farm Fresh Eggs - Large",
          slug: "farm-fresh-eggs-large",
          description: "Free-range chicken eggs, collected daily",
          price: 6.99,
          unit: "dozen",
        },
        {
          name: "Duck Eggs",
          slug: "duck-eggs",
          description: "Rich, creamy duck eggs from pasture-raised ducks",
          price: 8.99,
          unit: "dozen",
        },
      ],
      HERBS: [
        {
          name: "Fresh Basil",
          slug: "fresh-basil",
          description: "Aromatic Italian basil",
          price: 2.99,
          unit: "bunch",
        },
        {
          name: "Organic Cilantro",
          slug: "organic-cilantro",
          description: "Fresh cilantro for cooking",
          price: 2.49,
          unit: "bunch",
        },
      ],
    };

    const allProducts = [];
    let productCount = 0;

    for (const farm of farms) {
      // Each farm gets products from multiple categories
      const farmCategories = Object.keys(productCategories).slice(0, 3);

      for (const category of farmCategories) {
        const categoryProducts = productCategories[category];
        const numProducts = Math.min(randomInt(2, 4), categoryProducts.length);

        for (let i = 0; i < numProducts; i++) {
          const productTemplate = categoryProducts[i];
          const productSlug = `${productTemplate.slug}-${farm.slug}`;

          const product = await prisma.product.upsert({
            where: {
              farmId_slug: {
                farmId: farm.id,
                slug: productSlug,
              },
            },
            update: {
              inStock: true,
              status: "ACTIVE",
            },
            create: {
              name: productTemplate.name,
              slug: productSlug,
              description: productTemplate.description,
              category: category,
              price: productTemplate.price,
              unit: productTemplate.unit,
              farmId: farm.id,
              inStock: true,
              quantityAvailable: randomInt(20, 200),
              status: "ACTIVE",
              organic: randomInt(0, 1) === 1,
              seasonal: category === "FRUITS",
            },
          });
          allProducts.push(product);
          productCount++;
        }
      }
    }
    console.log(`  ✅ Created ${productCount} products across all farms\n`);

    // ========================================
    // 4. CREATE ORDERS
    // ========================================
    console.log("📦 Creating orders...");

    const orderStatuses = [
      "COMPLETED",
      "COMPLETED",
      "COMPLETED",
      "FULFILLED",
      "FULFILLED",
      "PENDING",
    ];
    const paymentMethods = ["STRIPE", "STRIPE", "CASH"];

    let orderCount = 0;
    for (const consumer of consumers) {
      const numOrders = randomInt(3, 7);

      for (let i = 0; i < numOrders; i++) {
        const farm = randomElement(farms);
        const farmProducts = allProducts.filter((p) => p.farmId === farm.id);

        if (farmProducts.length === 0) continue;

        const numItems = randomInt(2, 5);
        const orderProducts = [];
        let subtotal = 0;

        for (let j = 0; j < numItems; j++) {
          const product = randomElement(farmProducts);
          const quantity = randomInt(1, 4);
          const price = parseFloat(product.price);
          orderProducts.push({
            productId: product.id,
            quantity: quantity,
            price: price,
          });
          subtotal += price * quantity;
        }

        const tax = subtotal * 0.08; // 8% tax
        const deliveryFee = subtotal > 50 ? 0 : 5.99;
        const platformFee = subtotal * 0.05; // 5% platform fee
        const farmerAmount = subtotal - platformFee; // Farmer gets subtotal minus platform fee
        const total = subtotal + tax + deliveryFee;

        const orderStatus = randomElement(orderStatuses);
        const createdAt = randomDate(
          new Date(2024, 0, 1),
          new Date(2024, 10, 28),
        );

        try {
          const order = await prisma.order.create({
            data: {
              orderNumber: `FM-${Date.now()}-${randomInt(1000, 9999)}`,
              customerId: consumer.id,
              farmId: farm.id,
              status: orderStatus,
              paymentStatus:
                orderStatus === "COMPLETED" || orderStatus === "FULFILLED"
                  ? "PAID"
                  : "PENDING",
              paymentMethod: randomElement(paymentMethods),
              subtotal: subtotal,
              tax: tax,
              deliveryFee: deliveryFee,
              platformFee: platformFee,
              farmerAmount: farmerAmount,
              total: total,
              deliveryMethod: randomElement(["DELIVERY", "PICKUP"]),
              deliveryAddress: `${randomInt(100, 9999)} Main St`,
              deliveryCity: consumer.firstName + " City",
              deliveryState: "CA",
              deliveryZipCode: "90001",
              createdAt: createdAt,
              items: {
                create: orderProducts,
              },
            },
          });
          orderCount++;
        } catch (error) {
          console.log(`    ⚠️  Skipping duplicate order`);
        }
      }
    }
    console.log(`  ✅ Created ${orderCount} orders\n`);

    // ========================================
    // 5. CREATE REVIEWS
    // ========================================
    console.log("⭐ Creating reviews...");

    let reviewCount = 0;
    for (const consumer of consumers) {
      const numReviews = randomInt(2, 4);

      for (let i = 0; i < numReviews; i++) {
        const farm = randomElement(farms);
        const rating = randomInt(4, 5); // Mostly positive reviews

        const reviewTexts = [
          "Amazing quality produce! Everything was so fresh and delicious.",
          "Great farm with wonderful variety. Highly recommend!",
          "The best organic vegetables I've found in the area.",
          "Excellent service and the freshest produce. Will order again!",
          "Love supporting this local farm. Quality is outstanding.",
        ];

        try {
          await prisma.review.create({
            data: {
              farmId: farm.id,
              customerId: consumer.id,
              rating: rating,
              comment: randomElement(reviewTexts),
              createdAt: randomDate(
                new Date(2024, 0, 1),
                new Date(2024, 10, 28),
              ),
            },
          });
          reviewCount++;
        } catch (error) {
          console.log(`    ⚠️  Skipping duplicate review`);
        }
      }
    }
    console.log(`  ✅ Created ${reviewCount} reviews\n`);

    // ========================================
    // 6. UPDATE FARM STATS
    // ========================================
    console.log("📊 Updating farm statistics...");

    for (const farm of farms) {
      const orderCount = await prisma.order.count({
        where: { farmId: farm.id, status: { in: ["COMPLETED", "FULFILLED"] } },
      });

      const totalRevenue = await prisma.order.aggregate({
        where: { farmId: farm.id, status: { in: ["COMPLETED", "FULFILLED"] } },
        _sum: { total: true },
      });

      const avgRating = await prisma.review.aggregate({
        where: { farmId: farm.id },
        _avg: { rating: true },
        _count: true,
      });

      await prisma.farm.update({
        where: { id: farm.id },
        data: {
          totalOrdersCount: orderCount,
          totalRevenueUSD: totalRevenue._sum.total || 0,
          averageRating: avgRating._avg.rating || null,
          reviewCount: avgRating._count || 0,
        },
      });
    }
    console.log(`  ✅ Updated statistics for all farms\n`);

    // ========================================
    // SUMMARY
    // ========================================
    console.log("✨ Database seeded successfully!\n");
    console.log("═══════════════════════════════════════════════════");
    console.log("📊 DATA SUMMARY:");
    console.log("═══════════════════════════════════════════════════");
    console.log(`  👥 Users:     ${1 + farmers.length + consumers.length}`);
    console.log(`     - Admins:   1`);
    console.log(`     - Farmers:  ${farmers.length}`);
    console.log(`     - Consumers: ${consumers.length}`);
    console.log(`  🌾 Farms:     ${farms.length}`);
    console.log(`  🥬 Products:  ${productCount}`);
    console.log(`  📦 Orders:    ${orderCount}`);
    console.log(`  ⭐ Reviews:   ${reviewCount}`);
    console.log("═══════════════════════════════════════════════════\n");

    console.log("📋 LOGIN CREDENTIALS:");
    console.log("═══════════════════════════════════════════════════");
    console.log("👤 ADMIN:");
    console.log("   Email:    gogsia@gmail.com");
    console.log("   Password: Admin123!");
    console.log("   Access:   http://localhost:3001/admin-login\n");

    console.log("👨‍🌾 FARMERS:");
    for (const farmer of farmers) {
      console.log(`   ${farmer.email} / Farmer123!`);
    }

    console.log("\n🛒 CONSUMERS:");
    for (const consumer of consumers) {
      console.log(`   ${consumer.email} / Consumer123!`);
    }

    console.log("\n═══════════════════════════════════════════════════");
    console.log("🌾 FARMS CREATED:");
    console.log("═══════════════════════════════════════════════════");
    for (const farm of farms) {
      console.log(`  • ${farm.name}`);
      console.log(`    Location: ${farm.city}, ${farm.state}`);
      console.log(`    URL: http://localhost:3001/farms/${farm.slug}`);
    }

    console.log("\n═══════════════════════════════════════════════════");
    console.log("🚀 READY TO EXPLORE!");
    console.log("═══════════════════════════════════════════════════");
    console.log("  🏠 Home:           http://localhost:3001");
    console.log("  👤 Admin Panel:    http://localhost:3001/admin");
    console.log("  🌾 Browse Farms:   http://localhost:3001/farms");
    console.log("  🥬 Browse Products: http://localhost:3001/products");
    console.log("  🔍 View Database:  npm run db:studio");
    console.log("═══════════════════════════════════════════════════\n");
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
