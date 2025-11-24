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
// CONFIGURATION
// ============================================================================

const CONFIG = {
  FARMERS_COUNT: 15,
  CONSUMERS_COUNT: 25,
  FARMS_PER_FARMER: 2,
  PRODUCTS_PER_FARM: 12,
  ORDERS_COUNT: 100,
  REVIEWS_PER_FARM: 5,
  MESSAGES_COUNT: 50,
  NOTIFICATIONS_COUNT: 100,
};

// ============================================================================
// DATA TEMPLATES
// ============================================================================

const FARM_NAMES = [
  "Sunshine Valley Farm",
  "Green Acres Organic",
  "Harvest Moon Ranch",
  "Prairie View Homestead",
  "Riverside Gardens",
  "Mountain Peak Farm",
  "Coastal Breeze Agriculture",
  "Heritage Family Farm",
  "Wildflower Meadows",
  "Golden Grain Homestead",
  "Blue Sky Ranch",
  "Evergreen Valley Farm",
  "Maple Ridge Organics",
  "Rolling Hills Estate",
  "Cedar Creek Farm",
  "Sunset Acres",
  "Morning Dew Gardens",
  "Harmony Hills Farm",
  "Peaceful Valley Ranch",
  "Nature's Bounty Farm",
  "Fresh Start Homestead",
  "Crystal Lake Farm",
  "Pine Forest Agriculture",
  "Rainbow Ridge Farm",
  "Serenity Springs Ranch",
  "Abundant Harvest Farm",
  "Tranquil Meadows",
  "Prosperity Farm",
  "Eden Valley Organics",
  "Paradise Fields",
];

const FARM_DESCRIPTIONS = [
  "Family-owned organic farm dedicated to sustainable agriculture and community wellness.",
  "Certified organic vegetables and fruits grown with love and care for over 20 years.",
  "Regenerative agriculture practices producing nutrient-dense food for our community.",
  "Small-batch artisanal produce with focus on heirloom varieties and biodiversity.",
  "Permaculture-based farm offering seasonal vegetables, herbs, and microgreens.",
  "Biodynamic certified farm practicing holistic, ecological, and ethical farming.",
  "Community-supported agriculture providing fresh, local produce year-round.",
  "Heritage breed livestock and organic vegetables in harmony with nature.",
  "Specialty crops and rare varieties for discerning culinary enthusiasts.",
  "No-till organic farm focused on soil health and ecosystem restoration.",
];

const CERTIFICATIONS = [
  "USDA Organic",
  "Certified Naturally Grown",
  "Biodynamic Certified",
  "Rainforest Alliance",
  "Fair Trade",
  "Non-GMO Project",
  "Animal Welfare Approved",
  "Regenerative Organic",
  "Food Safety Certified",
  "Gap Certified",
];

const PRODUCT_VEGETABLES = [
  {
    name: "Organic Tomatoes",
    unit: "lb",
    basePrice: 4.99,
    category: "VEGETABLES",
  },
  {
    name: "Fresh Lettuce",
    unit: "head",
    basePrice: 2.99,
    category: "VEGETABLES",
  },
  {
    name: "Rainbow Carrots",
    unit: "bunch",
    basePrice: 3.49,
    category: "VEGETABLES",
  },
  {
    name: "Sweet Bell Peppers",
    unit: "lb",
    basePrice: 5.49,
    category: "VEGETABLES",
  },
  {
    name: "Organic Cucumbers",
    unit: "each",
    basePrice: 2.49,
    category: "VEGETABLES",
  },
  {
    name: "Heirloom Squash",
    unit: "lb",
    basePrice: 3.99,
    category: "VEGETABLES",
  },
  {
    name: "Fresh Broccoli",
    unit: "head",
    basePrice: 4.49,
    category: "VEGETABLES",
  },
  {
    name: "Organic Kale",
    unit: "bunch",
    basePrice: 3.99,
    category: "VEGETABLES",
  },
  {
    name: "Sweet Corn",
    unit: "dozen",
    basePrice: 6.99,
    category: "VEGETABLES",
  },
  { name: "Red Beets", unit: "bunch", basePrice: 3.49, category: "VEGETABLES" },
  { name: "Green Beans", unit: "lb", basePrice: 4.49, category: "VEGETABLES" },
  { name: "Zucchini", unit: "lb", basePrice: 2.99, category: "VEGETABLES" },
];

const PRODUCT_FRUITS = [
  {
    name: "Organic Strawberries",
    unit: "pint",
    basePrice: 5.99,
    category: "FRUITS",
  },
  {
    name: "Fresh Blueberries",
    unit: "pint",
    basePrice: 6.99,
    category: "FRUITS",
  },
  { name: "Crisp Apples", unit: "lb", basePrice: 3.99, category: "FRUITS" },
  { name: "Juicy Peaches", unit: "lb", basePrice: 4.99, category: "FRUITS" },
  { name: "Sweet Cherries", unit: "lb", basePrice: 7.99, category: "FRUITS" },
  { name: "Ripe Plums", unit: "lb", basePrice: 4.49, category: "FRUITS" },
  { name: "Watermelon", unit: "each", basePrice: 6.99, category: "FRUITS" },
  { name: "Cantaloupe", unit: "each", basePrice: 4.99, category: "FRUITS" },
];

const PRODUCT_HERBS = [
  { name: "Fresh Basil", unit: "bunch", basePrice: 2.99, category: "HERBS" },
  {
    name: "Organic Cilantro",
    unit: "bunch",
    basePrice: 2.49,
    category: "HERBS",
  },
  { name: "Fresh Parsley", unit: "bunch", basePrice: 2.49, category: "HERBS" },
  { name: "Rosemary", unit: "bunch", basePrice: 3.49, category: "HERBS" },
  { name: "Thyme", unit: "bunch", basePrice: 2.99, category: "HERBS" },
  { name: "Mint", unit: "bunch", basePrice: 2.49, category: "HERBS" },
];

const PRODUCT_DAIRY = [
  { name: "Raw Milk", unit: "gallon", basePrice: 8.99, category: "DAIRY" },
  {
    name: "Farm Fresh Eggs",
    unit: "dozen",
    basePrice: 6.99,
    category: "DAIRY",
  },
  { name: "Artisan Cheese", unit: "lb", basePrice: 12.99, category: "DAIRY" },
  { name: "Greek Yogurt", unit: "quart", basePrice: 7.99, category: "DAIRY" },
  { name: "Fresh Butter", unit: "lb", basePrice: 9.99, category: "DAIRY" },
];

const ALL_PRODUCTS = [
  ...PRODUCT_VEGETABLES,
  ...PRODUCT_FRUITS,
  ...PRODUCT_HERBS,
  ...PRODUCT_DAIRY,
];

const REVIEW_COMMENTS = [
  "Absolutely fresh and delicious! Best vegetables I've had in years.",
  "Amazing quality and the farmer was so helpful with cooking tips.",
  "Love supporting local farms. These products are always top-notch.",
  "Fresh, organic, and sustainably grown. What more could you ask for?",
  "The taste is incredible - you can really tell the difference!",
  "Great farm with friendly staff and excellent produce.",
  "These vegetables transformed my cooking. So much flavor!",
  "Wonderful farm visit and the products exceeded expectations.",
  "High quality organic produce at fair prices. Highly recommend!",
  "Supporting this farm has been one of the best decisions.",
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
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

function randomPrice(basePrice: number): number {
  const variance = basePrice * 0.2;
  return Number((basePrice + (Math.random() - 0.5) * variance).toFixed(2));
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log("🌾 Starting Comprehensive Farmers Market Database Seeding...\n");

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
  // STEP 2: CREATE ADMIN USER
  // ========================================================================
  console.log("👤 Creating admin user...");

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
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    },
  });

  console.log(`  ✅ Created admin: ${adminUser.email}\n`);

  // ========================================================================
  // STEP 3: CREATE FARMER USERS
  // ========================================================================
  console.log(`👨‍🌾 Creating ${CONFIG.FARMERS_COUNT} farmer users...`);

  const farmerNames = [
    { firstName: "Ana", lastName: "Romana" },
    { firstName: "Sarah", lastName: "Greenfield" },
    { firstName: "John", lastName: "Harvest" },
    { firstName: "Maria", lastName: "Flores" },
    { firstName: "David", lastName: "Organicson" },
    { firstName: "Emma", lastName: "Sprout" },
    { firstName: "James", lastName: "Cultivate" },
    { firstName: "Olivia", lastName: "Earthwise" },
    { firstName: "William", lastName: "Grower" },
    { firstName: "Sophia", lastName: "Farmstead" },
    { firstName: "Michael", lastName: "Rootwell" },
    { firstName: "Isabella", lastName: "Sunshine" },
    { firstName: "Alexander", lastName: "Harvest" },
    { firstName: "Charlotte", lastName: "Meadowbrook" },
    { firstName: "Daniel", lastName: "Greenthumb" },
  ];

  const farmers = await Promise.all(
    farmerNames.slice(0, CONFIG.FARMERS_COUNT).map(async (name, i) => {
      return prisma.user.create({
        data: {
          email: `${name.firstName.toLowerCase()}.${name.lastName.toLowerCase()}@farm.com`,
          password: await hashPassword(`Farm${i}Life2024!`),
          firstName: name.firstName,
          lastName: name.lastName,
          phone: `+1555${String(i + 1).padStart(7, "0")}`,
          role: "FARMER",
          emailVerified: true,
          emailVerifiedAt: randomDate(new Date(2023, 0, 1), new Date()),
          phoneVerified: Math.random() > 0.3,
          phoneVerifiedAt:
            Math.random() > 0.3
              ? randomDate(new Date(2023, 0, 1), new Date())
              : null,
          profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.firstName}`,
          bio: `Passionate farmer dedicated to sustainable agriculture and providing fresh, quality produce to the community.`,
        },
      });
    }),
  );

  console.log(`  ✅ Created ${farmers.length} farmers\n`);

  // ========================================================================
  // STEP 4: CREATE CONSUMER USERS
  // ========================================================================
  console.log(`👥 Creating ${CONFIG.CONSUMERS_COUNT} consumer users...`);

  const consumerNames = [
    { firstName: "Divna", lastName: "Kapica" },
    { firstName: "Emily", lastName: "Conscious" },
    { firstName: "Michael", lastName: "Green" },
    { firstName: "Jennifer", lastName: "Healthy" },
    { firstName: "Robert", lastName: "Local" },
    { firstName: "Jessica", lastName: "Organic" },
    { firstName: "Christopher", lastName: "Fresh" },
    { firstName: "Ashley", lastName: "Wellness" },
    { firstName: "Matthew", lastName: "Sustainable" },
    { firstName: "Amanda", lastName: "Natural" },
    { firstName: "Joshua", lastName: "Wholesome" },
    { firstName: "Melissa", lastName: "Foodie" },
    { firstName: "Andrew", lastName: "Chef" },
    { firstName: "Stephanie", lastName: "Baker" },
    { firstName: "Daniel", lastName: "Cook" },
    { firstName: "Lauren", lastName: "Kitchen" },
    { firstName: "Ryan", lastName: "Gourmet" },
    { firstName: "Nicole", lastName: "Taste" },
    { firstName: "Brandon", lastName: "Flavor" },
    { firstName: "Rachel", lastName: "Savory" },
    { firstName: "Kevin", lastName: "Delicious" },
    { firstName: "Samantha", lastName: "Yummy" },
    { firstName: "Justin", lastName: "Homemade" },
    { firstName: "Brittany", lastName: "Cooking" },
    { firstName: "Tyler", lastName: "Nutrition" },
  ];

  const dietaryOptions = [
    ["vegetarian", "organic"],
    ["vegan", "gluten-free"],
    ["organic"],
    ["gluten-free"],
    ["vegetarian"],
    [],
  ];

  const consumers = await Promise.all(
    consumerNames.slice(0, CONFIG.CONSUMERS_COUNT).map(async (name, i) => {
      return prisma.user.create({
        data: {
          email: `${name.firstName.toLowerCase()}.${name.lastName.toLowerCase()}@email.com`,
          password: await hashPassword(`Consumer${i}Pass2024!`),
          firstName: name.firstName,
          lastName: name.lastName,
          phone: `+1556${String(i + 1).padStart(7, "0")}`,
          role: "CONSUMER",
          emailVerified: Math.random() > 0.2,
          emailVerifiedAt:
            Math.random() > 0.2
              ? randomDate(new Date(2023, 0, 1), new Date())
              : null,
          profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.firstName}${i}`,
          dietaryPreferences: randomElement(dietaryOptions),
          preferredLanguage: randomElement(["en", "en", "en", "es", "fr"]),
        },
      });
    }),
  );

  console.log(`  ✅ Created ${consumers.length} consumers\n`);

  // ========================================================================
  // STEP 5: CREATE USER ADDRESSES
  // ========================================================================
  console.log("📍 Creating user addresses...");

  const cities = [
    { city: "Portland", state: "OR", lat: 45.5152, lng: -122.6784 },
    { city: "Eugene", state: "OR", lat: 44.0521, lng: -123.0868 },
    { city: "Salem", state: "OR", lat: 44.9429, lng: -123.0351 },
    { city: "Bend", state: "OR", lat: 44.0582, lng: -121.3153 },
    { city: "Corvallis", state: "OR", lat: 44.5646, lng: -123.262 },
  ];

  const streets = [
    "Oak Street",
    "Maple Avenue",
    "Pine Road",
    "Cedar Lane",
    "Elm Drive",
    "Birch Court",
    "Willow Way",
    "Ash Boulevard",
    "Spruce Street",
    "Poplar Place",
  ];

  for (const consumer of consumers.slice(0, 20)) {
    const city = randomElement(cities);
    await prisma.userAddress.create({
      data: {
        userId: consumer.id,
        type: "HOME",
        label: "Home",
        street: `${randomInt(100, 9999)} ${randomElement(streets)}`,
        city: city.city,
        state: city.state,
        zipCode: String(randomInt(97000, 97999)),
        latitude: new Prisma.Decimal(city.lat + (Math.random() - 0.5) * 0.1),
        longitude: new Prisma.Decimal(city.lng + (Math.random() - 0.5) * 0.1),
        isDefault: true,
      },
    });
  }

  console.log(`  ✅ Created addresses for consumers\n`);

  // ========================================================================
  // STEP 6: CREATE FARMS
  // ========================================================================
  console.log(`🏡 Creating farms...`);

  const farms = [];
  let farmIndex = 0;

  for (const farmer of farmers) {
    const farmsForThisFarmer = randomInt(1, CONFIG.FARMS_PER_FARMER);

    for (let i = 0; i < farmsForThisFarmer; i++) {
      if (farmIndex >= FARM_NAMES.length) break;

      const farmName = FARM_NAMES[farmIndex]!;
      const city = randomElement(cities);

      const farm = await prisma.farm.create({
        data: {
          name: farmName,
          slug: generateSlug(farmName),
          description: randomElement(FARM_DESCRIPTIONS),
          ownerId: farmer.id,
          status: randomElement(["ACTIVE", "ACTIVE", "ACTIVE", "PENDING"]),
          address: `${randomInt(1000, 9999)} ${randomElement(streets)}`,
          city: city.city,
          state: city.state,
          zipCode: String(randomInt(97000, 97999)),
          latitude: new Prisma.Decimal(city.lat + (Math.random() - 0.5) * 0.2),
          longitude: new Prisma.Decimal(city.lng + (Math.random() - 0.5) * 0.2),
          phone: `+1555${String(randomInt(1000000, 9999999))}`,
          email: `info@${generateSlug(farmName)}.com`,
          website: `https://${generateSlug(farmName)}.com`,
          coverImage: `https://images.unsplash.com/photo-${randomInt(1500000000000, 1700000000000)}-farm?w=1200&h=600&fit=crop`,
          operatingHours: {
            monday: { open: "08:00", close: "18:00", closed: false },
            tuesday: { open: "08:00", close: "18:00", closed: false },
            wednesday: { open: "08:00", close: "18:00", closed: false },
            thursday: { open: "08:00", close: "18:00", closed: false },
            friday: { open: "08:00", close: "18:00", closed: false },
            saturday: { open: "09:00", close: "17:00", closed: false },
            sunday: { open: "10:00", close: "16:00", closed: false },
          },
          rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
          reviewCount: randomInt(5, 50),
          minimumOrder: new Prisma.Decimal(randomElement([0, 10, 15, 20])),
          deliveryFee: new Prisma.Decimal(randomElement([0, 5, 7.5, 10])),
          deliveryRadius: randomInt(10, 30),
          acceptsOrders: true,
          acceptsPickup: true,
          acceptsDelivery: Math.random() > 0.3,
          verified: Math.random() > 0.2,
          verifiedAt:
            Math.random() > 0.2
              ? randomDate(new Date(2023, 0, 1), new Date())
              : null,
        },
      });

      farms.push(farm);
      farmIndex++;

      // Add certifications
      const farmCerts = randomElements(CERTIFICATIONS, randomInt(1, 4));
      for (const cert of farmCerts) {
        await prisma.farmCertification.create({
          data: {
            farmId: farm.id,
            name: cert,
            issuedBy: "Agricultural Certification Board",
            issuedAt: randomDate(new Date(2020, 0, 1), new Date(2023, 0, 1)),
            expiresAt: randomDate(new Date(2025, 0, 1), new Date(2027, 0, 1)),
            certificateUrl: `https://certifications.example.com/${generateSlug(cert)}-${farm.id}`,
            verified: true,
          },
        });
      }

      // Add farm photos
      const photoCount = randomInt(3, 6);
      for (let p = 0; p < photoCount; p++) {
        await prisma.farmPhoto.create({
          data: {
            farmId: farm.id,
            url: `https://images.unsplash.com/photo-${randomInt(1500000000000, 1700000000000)}-farm${p}?w=800&h=600&fit=crop`,
            caption: randomElement([
              "Our beautiful farm",
              "Fresh organic produce",
              "Sustainable farming practices",
              "Happy harvest season",
              "Farm to table excellence",
            ]),
            isPrimary: p === 0,
            displayOrder: p,
          },
        });
      }
    }
  }

  console.log(
    `  ✅ Created ${farms.length} farms with certifications and photos\n`,
  );

  // ========================================================================
  // STEP 7: CREATE PRODUCTS
  // ========================================================================
  console.log(`🥬 Creating products for farms...`);

  let productCount = 0;

  for (const farm of farms) {
    const productsForFarm = randomInt(
      Math.floor(CONFIG.PRODUCTS_PER_FARM * 0.7),
      CONFIG.PRODUCTS_PER_FARM,
    );

    const selectedProducts = randomElements(ALL_PRODUCTS, productsForFarm);

    for (const productTemplate of selectedProducts) {
      const price = randomPrice(productTemplate.basePrice);
      const inStock = Math.random() > 0.1; // 90% in stock
      const quantity = inStock ? randomInt(10, 200) : 0;

      await prisma.product.create({
        data: {
          farmId: farm.id,
          name: productTemplate.name,
          slug: generateSlug(`${productTemplate.name}-${farm.id}`),
          description: `Fresh ${productTemplate.name.toLowerCase()} from ${farm.name}. Organically grown with care and harvested at peak ripeness for maximum flavor and nutrition.`,
          category: productTemplate.category,
          price: new Prisma.Decimal(price),
          unit: productTemplate.unit,
          quantity: quantity,
          inStock: inStock,
          organic: Math.random() > 0.3,
          seasonal: randomElement([
            "SPRING",
            "SUMMER",
            "FALL",
            "WINTER",
            null,
            null,
          ]),
          harvestDate: inStock
            ? randomDate(
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                new Date(),
              )
            : null,
          availableFrom: randomDate(new Date(2024, 0, 1), new Date()),
          availableTo: randomDate(new Date(2025, 0, 1), new Date(2025, 11, 31)),
          images: [
            `https://images.unsplash.com/photo-${randomInt(1500000000000, 1700000000000)}-${productTemplate.category.toLowerCase()}?w=800&h=600&fit=crop`,
            `https://images.unsplash.com/photo-${randomInt(1500000000000, 1700000000000)}-${productTemplate.category.toLowerCase()}2?w=800&h=600&fit=crop`,
          ],
          tags: randomElements(
            [
              "fresh",
              "organic",
              "local",
              "heirloom",
              "non-gmo",
              "sustainable",
              "farm-fresh",
            ],
            randomInt(2, 4),
          ),
          featured: Math.random() > 0.8,
          status: inStock ? "AVAILABLE" : "OUT_OF_STOCK",
          minOrderQuantity: randomInt(1, 3),
          maxOrderQuantity: randomInt(10, 50),
        },
      });

      productCount++;
    }
  }

  console.log(`  ✅ Created ${productCount} products\n`);

  // ========================================================================
  // STEP 8: CREATE ORDERS
  // ========================================================================
  console.log(`🛒 Creating orders...`);

  const orderStatuses = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "COMPLETED",
    "COMPLETED",
    "COMPLETED",
  ];

  for (let i = 0; i < CONFIG.ORDERS_COUNT; i++) {
    const customer = randomElement(consumers);
    const farm = randomElement(farms.filter((f) => f.status === "ACTIVE"));

    // Get products from this farm
    const farmProducts = await prisma.product.findMany({
      where: { farmId: farm.id, inStock: true },
      take: 20,
    });

    if (farmProducts.length === 0) continue;

    const orderItems = randomElements(farmProducts, randomInt(1, 5));
    let orderTotal = 0;

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        farmId: farm.id,
        status: randomElement(orderStatuses),
        orderNumber: `FM${Date.now()}${randomInt(1000, 9999)}`,
        subtotal: new Prisma.Decimal(0), // Will update
        deliveryFee: farm.deliveryFee,
        tax: new Prisma.Decimal(0), // Will update
        total: new Prisma.Decimal(0), // Will update
        paymentMethod: randomElement([
          "CREDIT_CARD",
          "CREDIT_CARD",
          "DEBIT_CARD",
          "PAYPAL",
        ]),
        paymentStatus: randomElement(["PAID", "PAID", "PAID", "PENDING"]),
        deliveryMethod: randomElement(["DELIVERY", "PICKUP", "PICKUP"]),
        deliveryAddress: `${randomInt(100, 9999)} ${randomElement(streets)}, ${randomElement(cities).city}`,
        scheduledFor: randomDate(
          new Date(),
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ),
        createdAt: randomDate(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          new Date(),
        ),
      },
    });

    // Create order items
    for (const product of orderItems) {
      const quantity = randomInt(1, 5);
      const itemPrice = Number(product.price) * quantity;
      orderTotal += itemPrice;

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: quantity,
          price: product.price,
          subtotal: new Prisma.Decimal(itemPrice),
        },
      });
    }

    // Update order totals
    const subtotal = orderTotal;
    const tax = orderTotal * 0.08;
    const total = subtotal + Number(farm.deliveryFee) + tax;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        subtotal: new Prisma.Decimal(subtotal),
        tax: new Prisma.Decimal(tax),
        total: new Prisma.Decimal(total),
      },
    });
  }

  console.log(`  ✅ Created ${CONFIG.ORDERS_COUNT} orders\n`);

  // ========================================================================
  // STEP 9: CREATE REVIEWS
  // ========================================================================
  console.log(`⭐ Creating reviews...`);

  let reviewCount = 0;

  for (const farm of farms.slice(0, 20)) {
    const reviewsForFarm = randomInt(3, CONFIG.REVIEWS_PER_FARM);

    for (let i = 0; i < reviewsForFarm; i++) {
      const reviewer = randomElement(consumers);

      await prisma.review.create({
        data: {
          farmId: farm.id,
          userId: reviewer.id,
          rating: randomInt(3, 5),
          comment: randomElement(REVIEW_COMMENTS),
          helpful: randomInt(0, 20),
          createdAt: randomDate(
            new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            new Date(),
          ),
        },
      });

      reviewCount++;
    }
  }

  console.log(`  ✅ Created ${reviewCount} reviews\n`);

  // ========================================================================
  // STEP 10: CREATE NOTIFICATIONS
  // ========================================================================
  console.log(`🔔 Creating notifications...`);

  const notificationTypes = [
    {
      type: "ORDER_CONFIRMATION",
      title: "Order Confirmed",
      message: "Your order has been confirmed and is being prepared.",
    },
    {
      type: "ORDER_READY",
      title: "Order Ready",
      message: "Your order is ready for pickup!",
    },
    {
      type: "ORDER_DELIVERED",
      title: "Order Delivered",
      message: "Your order has been delivered successfully.",
    },
    {
      type: "NEW_MESSAGE",
      title: "New Message",
      message: "You have a new message from a farmer.",
    },
    {
      type: "PRODUCT_AVAILABLE",
      title: "Product Available",
      message: "A product you were interested in is now available!",
    },
  ];

  for (let i = 0; i < CONFIG.NOTIFICATIONS_COUNT; i++) {
    const user = randomElement([...farmers, ...consumers]);
    const notif = randomElement(notificationTypes);

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        read: Math.random() > 0.4,
        readAt:
          Math.random() > 0.4
            ? randomDate(
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                new Date(),
              )
            : null,
        createdAt: randomDate(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          new Date(),
        ),
      },
    });
  }

  console.log(`  ✅ Created ${CONFIG.NOTIFICATIONS_COUNT} notifications\n`);

  // ========================================================================
  // STEP 11: CREATE MESSAGES
  // ========================================================================
  console.log(`💬 Creating messages...`);

  for (let i = 0; i < CONFIG.MESSAGES_COUNT; i++) {
    const consumer = randomElement(consumers);
    const farmer = randomElement(farmers);

    await prisma.message.create({
      data: {
        senderId: Math.random() > 0.5 ? consumer.id : farmer.id,
        recipientId: Math.random() > 0.5 ? farmer.id : consumer.id,
        subject: randomElement([
          "Question about product availability",
          "Pickup time confirmation",
          "Custom order request",
          "Product quality inquiry",
          "Delivery schedule question",
        ]),
        body: "Hello! I'm interested in learning more about your products and availability. When would be a good time to discuss?",
        read: Math.random() > 0.3,
        readAt:
          Math.random() > 0.3
            ? randomDate(
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                new Date(),
              )
            : null,
        createdAt: randomDate(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          new Date(),
        ),
      },
    });
  }

  console.log(`  ✅ Created ${CONFIG.MESSAGES_COUNT} messages\n`);

  // ========================================================================
  // FINAL SUMMARY
  // ========================================================================
  console.log("✨ Database seeding completed successfully!\n");
  console.log("📊 Summary:");
  console.log(
    `   👤 Users: ${farmers.length} farmers + ${consumers.length} consumers + 1 admin = ${farmers.length + consumers.length + 1}`,
  );
  console.log(`   🏡 Farms: ${farms.length}`);
  console.log(`   🥬 Products: ${productCount}`);
  console.log(`   🛒 Orders: ${CONFIG.ORDERS_COUNT}`);
  console.log(`   ⭐ Reviews: ${reviewCount}`);
  console.log(`   💬 Messages: ${CONFIG.MESSAGES_COUNT}`);
  console.log(`   🔔 Notifications: ${CONFIG.NOTIFICATIONS_COUNT}`);
  console.log(
    "\n🌟 Divine database is ready for agricultural consciousness!\n",
  );
}

// ============================================================================
// EXECUTION
// ============================================================================

main()
  .catch((e) => {
    console.error("❌ Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
