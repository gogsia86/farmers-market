/**
 * 🌾 QUICK FARM SEEDER
 * Creates sample farms with products for testing featured farms functionality
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const sampleFarms = [
  {
    name: "Green Valley Organic Farm",
    slug: "green-valley-organic",
    description: "Family-owned organic farm specializing in fresh vegetables and herbs. We've been farming sustainably for over 30 years.",
    address: "123 Farm Road",
    city: "Portland",
    state: "OR",
    zipCode: "97201",
    country: "USA",
    latitude: 45.5152,
    longitude: -122.6784,
    phone: "(503) 555-0101",
    email: "contact@greenvalley.farm",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    certifications: ["USDA Organic", "Certified Naturally Grown"],
  },
  {
    name: "Sunset Ridge Dairy",
    slug: "sunset-ridge-dairy",
    description: "Premium grass-fed dairy products from happy cows. Fresh milk, cheese, and yogurt delivered daily.",
    address: "456 Meadow Lane",
    city: "Eugene",
    state: "OR",
    zipCode: "97401",
    country: "USA",
    latitude: 44.0521,
    longitude: -123.0868,
    phone: "(541) 555-0202",
    email: "info@sunsetridge.dairy",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    certifications: ["Grass-Fed Certified", "Animal Welfare Approved"],
  },
  {
    name: "Riverside Fruit Orchards",
    slug: "riverside-fruit-orchards",
    description: "Seasonal fruits picked at peak ripeness. Specializing in apples, pears, and stone fruits.",
    address: "789 Orchard Drive",
    city: "Salem",
    state: "OR",
    zipCode: "97301",
    country: "USA",
    latitude: 44.9429,
    longitude: -123.0351,
    phone: "(503) 555-0303",
    email: "hello@riversideorchards.com",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    certifications: ["Organic", "IPM Certified"],
  },
  {
    name: "Heritage Farm & Market",
    slug: "heritage-farm-market",
    description: "Heirloom vegetables, pasture-raised meats, and farm-fresh eggs. Supporting local food systems since 1985.",
    address: "321 Heritage Way",
    city: "Bend",
    state: "OR",
    zipCode: "97701",
    country: "USA",
    latitude: 44.0582,
    longitude: -121.3153,
    phone: "(541) 555-0404",
    email: "market@heritagefarm.com",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    certifications: ["Certified Humane", "Non-GMO Project"],
  },
  {
    name: "Mountain View Honey",
    slug: "mountain-view-honey",
    description: "Raw, unfiltered honey from our mountain apiaries. Also producing beeswax candles and bee pollen.",
    address: "555 Hillside Road",
    city: "Ashland",
    state: "OR",
    zipCode: "97520",
    country: "USA",
    latitude: 42.1946,
    longitude: -122.7095,
    phone: "(541) 555-0505",
    email: "buzz@mountainviewhoney.com",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    certifications: ["True Source Certified"],
  },
  {
    name: "Pacific Coast Greens",
    slug: "pacific-coast-greens",
    description: "Hydroponic lettuce, microgreens, and specialty salad mixes. Fresh harvests available year-round.",
    address: "678 Coastal Highway",
    city: "Newport",
    state: "OR",
    zipCode: "97365",
    country: "USA",
    latitude: 44.6368,
    longitude: -124.0535,
    phone: "(541) 555-0606",
    email: "greens@pacificcoast.farm",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    certifications: ["Food Safety Certified"],
  },
];

const sampleProducts = [
  { name: "Organic Tomatoes", price: 4.99, unit: "lb", category: "VEGETABLES" },
  { name: "Fresh Basil", price: 3.49, unit: "bunch", category: "HERBS" },
  { name: "Baby Spinach", price: 5.99, unit: "lb", category: "VEGETABLES" },
  { name: "Grass-Fed Milk", price: 6.99, unit: "gallon", category: "DAIRY" },
  { name: "Artisan Cheddar", price: 12.99, unit: "lb", category: "DAIRY" },
  { name: "Greek Yogurt", price: 5.49, unit: "quart", category: "DAIRY" },
  { name: "Honeycrisp Apples", price: 3.99, unit: "lb", category: "FRUITS" },
  { name: "Asian Pears", price: 4.49, unit: "lb", category: "FRUITS" },
  { name: "Peaches", price: 5.99, unit: "lb", category: "FRUITS" },
  { name: "Free-Range Eggs", price: 7.99, unit: "dozen", category: "EGGS" },
  { name: "Heritage Pork Chops", price: 14.99, unit: "lb", category: "MEAT" },
  { name: "Grass-Fed Beef", price: 18.99, unit: "lb", category: "MEAT" },
  { name: "Wildflower Honey", price: 12.99, unit: "jar", category: "PANTRY" },
  { name: "Beeswax Candles", price: 8.99, unit: "each", category: "OTHER" },
  { name: "Bee Pollen", price: 15.99, unit: "8oz", category: "PANTRY" },
  { name: "Mixed Greens", price: 6.99, unit: "lb", category: "VEGETABLES" },
  { name: "Microgreens", price: 8.99, unit: "4oz", category: "VEGETABLES" },
  { name: "Arugula", price: 5.49, unit: "lb", category: "VEGETABLES" },
];

const sampleReviews = [
  { rating: 5, comment: "Amazing quality! Best vegetables in town." },
  { rating: 5, comment: "Love supporting this farm. Always fresh and delicious." },
  { rating: 4, comment: "Great products, friendly service. Highly recommend!" },
  { rating: 5, comment: "The freshness is unmatched. Will be a regular customer!" },
  { rating: 4, comment: "Quality produce at fair prices. Very satisfied." },
];

async function main() {
  console.log("🌾 Seeding sample farms and products...\n");

  try {
    // Get farmer users
    const farmers = await prisma.user.findMany({
      where: { role: "FARMER" },
      take: 6,
    });

    if (farmers.length === 0) {
      console.log("⚠️  No farmer users found. Please run seed-quick.js first.");
      return;
    }

    // Get consumer for reviews
    const consumer = await prisma.user.findFirst({
      where: { role: "CONSUMER" },
    });

    console.log(`✅ Found ${farmers.length} farmer(s)\n`);

    // Create farms
    for (let i = 0; i < sampleFarms.length; i++) {
      const farmData = sampleFarms[i];
      const farmer = farmers[i % farmers.length];

      console.log(`📍 Creating ${farmData.name}...`);

      const farm = await prisma.farm.upsert({
        where: { slug: farmData.slug },
        update: {},
        create: {
          ...farmData,
          ownerId: farmer.id,
        },
      });

      console.log(`   ✅ Farm created: ${farm.id}`);

      // Add 3-4 products per farm
      const productCount = 3 + Math.floor(Math.random() * 2);
      const startIdx = i * 3;

      for (let j = 0; j < productCount; j++) {
        const productData = sampleProducts[(startIdx + j) % sampleProducts.length];

        const product = await prisma.product.create({
          data: {
            name: productData.name,
            description: `Fresh ${productData.name.toLowerCase()} from ${farmData.name}`,
            price: productData.price,
            unit: productData.unit,
            category: productData.category,
            inStock: true,
            stockQuantity: 50 + Math.floor(Math.random() * 50),
            status: "ACTIVE",
            farmId: farm.id,
          },
        });

        console.log(`   ✅ Product: ${product.name}`);
      }

      // Add 2-3 reviews per farm
      if (consumer) {
        const reviewCount = 2 + Math.floor(Math.random() * 2);

        for (let k = 0; k < reviewCount; k++) {
          const reviewData = sampleReviews[k % sampleReviews.length];

          await prisma.review.create({
            data: {
              rating: reviewData.rating,
              comment: reviewData.comment,
              farmId: farm.id,
              userId: consumer.id,
            },
          });
        }

        console.log(`   ✅ Added ${reviewCount} reviews\n`);
      }
    }

    console.log("\n✨ Sample farms seeded successfully!");
    console.log(`\n📊 Created:`);
    console.log(`   - ${sampleFarms.length} farms`);
    console.log(`   - ~${sampleFarms.length * 3} products`);
    console.log(`   - ~${sampleFarms.length * 2} reviews`);
    console.log(`\n🌐 View farms at: http://localhost:3001/farms`);
    console.log(`🏠 Homepage featured: http://localhost:3001/`);
  } catch (error) {
    console.error("❌ Error seeding farms:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
