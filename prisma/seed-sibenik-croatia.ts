#!/usr/bin/env tsx

/**
 * 🇭🇷 ŠIBENIK, CROATIA - AUTHENTIC LOCAL FARMS SEED
 *
 * This seed script creates authentic data based on real agricultural
 * production in Šibenik-Knin County, Dalmatia, Croatia.
 *
 * Based on research of local producers:
 * - OPG (Obiteljsko Poljoprivredno Gospodarstvo) - Family farms
 * - Traditional Dalmatian products
 * - Mediterranean agriculture
 * - Local wine, olive oil, honey, lavender production
 *
 * Geographic Context:
 * - Šibenik: 43.7350° N, 15.8952° E
 * - Dalmatia, Croatia
 * - Mediterranean climate
 * - Coastal and hinterland production
 *
 * @reference https://www.oliveoiltimes.com/trade-events/dalmatian-oil-producers
 * @reference Šibenik-Knin County agricultural heritage
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { Pool } from "pg";

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client
const prisma = new PrismaClient({ adapter });

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/š/g, "s")
    .replace(/đ/g, "d")
    .replace(/č/g, "c")
    .replace(/ć/g, "c")
    .replace(/ž/g, "z")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ============================================================================
// AUTHENTIC ŠIBENIK FARMS DATA
// ============================================================================

const SIBENIK_LOCATION = {
  city: "Šibenik",
  state: "HR", // Croatia ISO code
  country: "HR",
  latitude: 43.735,
  longitude: 15.8952,
  zipCode: "22000",
};

// Real areas around Šibenik known for agriculture
const SIBENIK_AREAS = [
  {
    name: "Donje Polje",
    lat: 43.728,
    lng: 15.882,
    description: "Fertile agricultural valley south of Šibenik",
  },
  {
    name: "Plastovo",
    lat: 43.813,
    lng: 15.924,
    description: "Wine region near Krka National Park",
  },
  {
    name: "Skradin",
    lat: 43.8167,
    lng: 15.9333,
    description: "Historic town at Krka River entrance",
  },
  {
    name: "Tribunj",
    lat: 43.7565,
    lng: 15.7424,
    description: "Coastal fishing village north of Šibenik",
  },
  {
    name: "Vodice",
    lat: 43.7565,
    lng: 15.7783,
    description: "Coastal town with agricultural hinterland",
  },
  {
    name: "Primošten",
    lat: 43.5869,
    lng: 15.9231,
    description: "Famous for Babić wine vineyards",
  },
  {
    name: "Grebaština",
    lat: 43.7,
    lng: 15.85,
    description: "Rural area with olive groves",
  },
  {
    name: "Zaton",
    lat: 43.822,
    lng: 15.932,
    description: "Village near Krka with orchards",
  },
];

// Authentic Croatian farm names (OPG = Obiteljsko Poljoprivredno Gospodarstvo)
const AUTHENTIC_FARMS = [
  {
    name: "OPG Duvnjak - Maslinovo Ulje",
    ownerFirstName: "Tomislav",
    ownerLastName: "Duvnjak",
    email: "tomislav.duvnjak@opg-dalmatia.hr",
    description:
      "Award-winning olive oil producer from Šibenik-Knin County. Our extra virgin olive oil has won prestigious NYIOOC awards. Family tradition since 1920.",
    story:
      "Four generations of olive growing expertise in the heart of Dalmatia. We cultivate indigenous Krvavica and Oblica varieties on ancient stone terraces. Our oils are cold-pressed within hours of harvest, preserving the authentic taste of Dalmatian sun.",
    area: "Donje Polje",
    certifications: ["ORGANIC", "DALMATIAN_PDO"],
    products: [
      "Extra Virgin Olive Oil",
      "Organic Olive Oil",
      "Olive Tapenade",
      "Olive Soap",
    ],
    farmingPractices: ["ORGANIC", "TRADITIONAL"],
    farmSize: 5.5, // hectares
    yearEstablished: 1920,
  },
  {
    name: "OPG Sladić - Vinarija i Masline",
    ownerFirstName: "Ante",
    ownerLastName: "Sladić",
    email: "ante.sladic@vino-dalmacie.hr",
    description:
      "Boutique winery and olive grove at 250m altitude near Krka National Park. Producing authentic Dalmatian wines: Debit, Maraština, Plavina, Lasina.",
    story:
      "Located in Plastovo near Skradin, our vineyards benefit from the unique microclimate created by proximity to river, mountains and sea. We specialize in indigenous Croatian grape varieties that express the true character of Dalmatia.",
    area: "Plastovo",
    certifications: ["CROATIAN_WINE_PDO"],
    products: [
      "Debit Wine (White)",
      "Maraština Wine (White)",
      "Plavina Wine (Red)",
      "Lasina Wine (Red)",
      "Olive Oil",
    ],
    farmingPractices: ["SUSTAINABLE", "TRADITIONAL"],
    farmSize: 8.2,
    yearEstablished: 1995,
  },
  {
    name: "OPG Vicko - Tradicionalna Hrana",
    ownerFirstName: "Vicko",
    ownerLastName: "Petrović",
    email: "vicko.petrovic@dalmatia-food.hr",
    description:
      "Traditional Dalmatian farm producing vegetables, olive oil, wine, honey, and artisan sheep cheese. From our fields in Donje Polje to your table.",
    story:
      "We grow everything the traditional way, just as our grandparents did. Our fertile land produces the freshest vegetables, our bees collect nectar from wild Dalmatian herbs, and our sheep graze on coastal meadows rich with aromatic plants.",
    area: "Donje Polje",
    certifications: [],
    products: [
      "Seasonal Vegetables",
      "Sheep Cheese (Paški Sir)",
      "Lavender Honey",
      "Red Wine",
      "Olive Oil",
    ],
    farmingPractices: ["TRADITIONAL", "FAMILY_BASED"],
    farmSize: 12.0,
    yearEstablished: 1985,
  },
  {
    name: "Pčelarstvo Kornatski Med",
    ownerFirstName: "Marko",
    ownerLastName: "Kovačević",
    email: "marko.kovacevic@kornati-honey.hr",
    description:
      "Artisan beekeeping producing exceptional Kornati sage honey with high purity. Also rosemary, lavender, and wildflower varieties from Dalmatian coast.",
    story:
      "Our hives are strategically placed across the pristine landscapes of Kornati National Park and Šibenik archipelago. The bees collect nectar from wild sage, lavender, rosemary, and Mediterranean wildflowers, creating honey with unique flavors found nowhere else.",
    area: "Tribunj",
    certifications: ["ORGANIC", "KORNATI_PROTECTED"],
    products: [
      "Sage Honey",
      "Lavender Honey",
      "Rosemary Honey",
      "Wildflower Honey",
      "Propolis",
      "Beeswax Candles",
    ],
    farmingPractices: ["ORGANIC", "WILD_FORAGING"],
    farmSize: 0, // Beekeeping - mobile hives
    yearEstablished: 2008,
  },
  {
    name: "OPG Babić - Vina Primošten",
    ownerFirstName: "Ivana",
    ownerLastName: "Babić",
    email: "ivana.babic@primosten-vina.hr",
    description:
      "Historic vineyard producing the famous Babić wine from Primošten region. Our vines grow in rocky karst terrain, creating wines of exceptional character.",
    story:
      "Babić wine is the pride of Primošten, where vines have been cultivated since the 15th century on steep stone terraces. Our wine is recognized as a Croatian treasure, with intense ruby color and rich tannins that come from our unique terroir.",
    area: "Primošten",
    certifications: ["PRIMOŠTEN_PDO", "CROATIAN_HERITAGE"],
    products: [
      "Babić Wine (Red)",
      "Debit Wine (White)",
      "Rosé Wine",
      "Grape Rakija",
    ],
    farmingPractices: ["TRADITIONAL", "TERRACED"],
    farmSize: 4.5,
    yearEstablished: 1970,
  },
  {
    name: "Eko Vrt Lavanda Dalmatia",
    ownerFirstName: "Ana",
    ownerLastName: "Jurić",
    email: "ana.juric@lavanda-dalmatia.hr",
    description:
      "Organic lavender farm producing essential oils, dried lavender, and lavender honey. Beautiful purple fields in the Dalmatian hinterland.",
    story:
      "Inspired by the lavender tradition of nearby Hvar Island, we brought this fragrant purple treasure to Šibenik's countryside. Our 100% organic lavender is harvested by hand at peak bloom, distilled on-site to create pure essential oil.",
    area: "Grebaština",
    certifications: ["ORGANIC", "EU_ORGANIC"],
    products: [
      "Lavender Essential Oil",
      "Dried Lavender",
      "Lavender Honey",
      "Lavender Soap",
      "Lavender Sachets",
    ],
    farmingPractices: ["ORGANIC", "AROMATIC_HERBS"],
    farmSize: 6.0,
    yearEstablished: 2012,
  },
  {
    name: "OPG Krka Voćnjak",
    ownerFirstName: "Josip",
    ownerLastName: "Matić",
    email: "josip.matic@krka-vocnjak.hr",
    description:
      "Traditional orchard near Krka National Park growing figs, cherries, pomegranates, and stone fruits. Fresh seasonal fruit and homemade preserves.",
    story:
      "Our orchards benefit from the microclimate created by Krka River and pristine national park. We grow heritage varieties of Mediterranean fruits that have been cultivated in this region for centuries. No pesticides, just patience and tradition.",
    area: "Zaton",
    certifications: [],
    products: [
      "Fresh Figs",
      "Sweet Cherries",
      "Pomegranates",
      "Fig Jam",
      "Cherry Preserves",
      "Fruit Rakija",
    ],
    farmingPractices: ["TRADITIONAL", "HERITAGE_VARIETIES"],
    farmSize: 7.5,
    yearEstablished: 1978,
  },
  {
    name: "Kozje Gospodarstvo Šibenik",
    ownerFirstName: "Mirela",
    ownerLastName: "Šimunović",
    email: "mirela.simunovic@koze-sibenik.hr",
    description:
      "Artisan goat dairy producing fresh and aged goat cheese. Our goats graze on wild herbs of Dalmatian karst, creating cheese with distinctive flavor.",
    story:
      "Goat keeping is an ancient tradition in Dalmatia. Our free-range goats feed on aromatic Mediterranean herbs - rosemary, sage, thyme - which gives our cheese its unique herbal notes. All cheese is made by hand using traditional methods.",
    area: "Skradin",
    certifications: ["ARTISAN", "TRADITIONAL_METHOD"],
    products: [
      "Fresh Goat Cheese",
      "Aged Goat Cheese",
      "Goat Yogurt",
      "Goat Milk",
      "Cheese in Olive Oil",
    ],
    farmingPractices: ["FREE_RANGE", "TRADITIONAL"],
    farmSize: 15.0,
    yearEstablished: 2005,
  },
  {
    name: "Morska Sola Domagoj",
    ownerFirstName: "Domagoj",
    ownerLastName: "Perić",
    email: "domagoj.peric@morska-sol.hr",
    description:
      "Traditional sea salt harvesting from centuries-old salt pans. Hand-harvested Croatian sea salt and salt flower (fleur de sel).",
    story:
      "Salt production in Dalmatia dates back to Roman times. Our solar salt pans near Šibenik use only sun and wind to crystallize pure Adriatic sea salt. Each crystal contains the essence of the cleanest part of the Mediterranean.",
    area: "Tribunj",
    certifications: ["ADRIATIC_SEA_SALT", "TRADITIONAL_HARVEST"],
    products: [
      "Sea Salt (Coarse)",
      "Sea Salt (Fine)",
      "Fleur de Sel",
      "Salt with Herbs",
      "Salt with Lavender",
    ],
    farmingPractices: ["TRADITIONAL", "SOLAR_EVAPORATION"],
    farmSize: 2.0,
    yearEstablished: 2000,
  },
  {
    name: "Eko Farma Adriatica",
    ownerFirstName: "Petra",
    ownerLastName: "Brkić",
    email: "petra.brkic@eko-adriatica.hr",
    description:
      "Certified organic farm growing seasonal Mediterranean vegetables, herbs, and edible flowers. Farm-to-table freshness with sustainable practices.",
    story:
      "We practice regenerative agriculture on our coastal farm. Every vegetable, from heirloom tomatoes to wild rocket, is grown without synthetic chemicals. We believe healthy soil creates healthy food, and healthy food creates healthy communities.",
    area: "Vodice",
    certifications: ["ORGANIC", "EU_ORGANIC", "REGENERATIVE"],
    products: [
      "Organic Tomatoes",
      "Heirloom Vegetables",
      "Fresh Herbs",
      "Edible Flowers",
      "Microgreens",
      "Seasonal Produce Box",
    ],
    farmingPractices: ["ORGANIC", "REGENERATIVE", "PERMACULTURE"],
    farmSize: 3.8,
    yearEstablished: 2015,
  },
];

// ============================================================================
// CROATIAN PRODUCT TEMPLATES
// ============================================================================

const CROATIAN_PRODUCTS = {
  // Olive Oil (Maslinovo Ulje)
  oliveOil: [
    {
      name: "Ekstra Djevičansko Maslinovo Ulje",
      category: "PANTRY",
      unit: "bottle",
      minPrice: 15.0,
      maxPrice: 30.0,
      season: null,
    },
    {
      name: "Organski Maslinovo Ulje",
      category: "PANTRY",
      unit: "bottle",
      minPrice: 18.0,
      maxPrice: 35.0,
      season: null,
    },
    {
      name: "Oblica Sorta Ulje",
      category: "PANTRY",
      unit: "bottle",
      minPrice: 20.0,
      maxPrice: 40.0,
      season: null,
    },
    {
      name: "Maslinada (Olive Tapenade)",
      category: "PANTRY",
      unit: "jar",
      minPrice: 8.0,
      maxPrice: 12.0,
      season: null,
    },
  ],

  // Wine (Vino)
  wine: [
    {
      name: "Debit Bijelo Vino",
      category: "BEVERAGES",
      unit: "bottle",
      minPrice: 12.0,
      maxPrice: 25.0,
      season: null,
    },
    {
      name: "Maraština Bijelo Vino",
      category: "BEVERAGES",
      unit: "bottle",
      minPrice: 14.0,
      maxPrice: 28.0,
      season: null,
    },
    {
      name: "Plavina Crno Vino",
      category: "BEVERAGES",
      unit: "bottle",
      minPrice: 15.0,
      maxPrice: 30.0,
      season: null,
    },
    {
      name: "Lasina Crno Vino",
      category: "BEVERAGES",
      unit: "bottle",
      minPrice: 16.0,
      maxPrice: 32.0,
      season: null,
    },
    {
      name: "Babić Premium Vino",
      category: "BEVERAGES",
      unit: "bottle",
      minPrice: 20.0,
      maxPrice: 50.0,
      season: null,
    },
    {
      name: "Rosé Vino",
      category: "BEVERAGES",
      unit: "bottle",
      minPrice: 10.0,
      maxPrice: 20.0,
      season: null,
    },
  ],

  // Honey (Med)
  honey: [
    {
      name: "Kaduljin Med (Sage Honey)",
      category: "PANTRY",
      unit: "jar",
      minPrice: 12.0,
      maxPrice: 20.0,
      season: "summer",
    },
    {
      name: "Lavandini Med (Lavender Honey)",
      category: "PANTRY",
      unit: "jar",
      minPrice: 14.0,
      maxPrice: 22.0,
      season: "summer",
    },
    {
      name: "Ružmarinski Med (Rosemary Honey)",
      category: "PANTRY",
      unit: "jar",
      minPrice: 12.0,
      maxPrice: 18.0,
      season: "spring",
    },
    {
      name: "Livadski Med (Wildflower Honey)",
      category: "PANTRY",
      unit: "jar",
      minPrice: 10.0,
      maxPrice: 16.0,
      season: null,
    },
    {
      name: "Kornatski Med",
      category: "PANTRY",
      unit: "jar",
      minPrice: 18.0,
      maxPrice: 28.0,
      season: "summer",
    },
  ],

  // Cheese (Sir)
  cheese: [
    {
      name: "Svježi Kozji Sir (Fresh Goat Cheese)",
      category: "DAIRY",
      unit: "kg",
      minPrice: 18.0,
      maxPrice: 25.0,
      season: null,
    },
    {
      name: "Zreli Kozji Sir (Aged Goat Cheese)",
      category: "DAIRY",
      unit: "kg",
      minPrice: 25.0,
      maxPrice: 40.0,
      season: null,
    },
    {
      name: "Paški Sir (Sheep Cheese)",
      category: "DAIRY",
      unit: "kg",
      minPrice: 30.0,
      maxPrice: 50.0,
      season: null,
    },
    {
      name: "Sir u Maslinovom Ulju",
      category: "DAIRY",
      unit: "jar",
      minPrice: 15.0,
      maxPrice: 22.0,
      season: null,
    },
  ],

  // Vegetables (Povrće)
  vegetables: [
    {
      name: "Dalmatinski Rajčica (Dalmatian Tomatoes)",
      category: "VEGETABLES",
      unit: "kg",
      minPrice: 2.5,
      maxPrice: 4.5,
      season: "summer",
    },
    {
      name: "Organska Paprika",
      category: "VEGETABLES",
      unit: "kg",
      minPrice: 3.0,
      maxPrice: 5.0,
      season: "summer",
    },
    {
      name: "Blitva (Swiss Chard)",
      category: "VEGETABLES",
      unit: "bunch",
      minPrice: 2.0,
      maxPrice: 3.5,
      season: null,
    },
    {
      name: "Rikula (Arugula)",
      category: "VEGETABLES",
      unit: "bunch",
      minPrice: 2.5,
      maxPrice: 4.0,
      season: null,
    },
    {
      name: "Sezonsko Povrće (Seasonal Mix)",
      category: "VEGETABLES",
      unit: "box",
      minPrice: 15.0,
      maxPrice: 25.0,
      season: null,
    },
  ],

  // Herbs (Začinsko Bilje)
  herbs: [
    {
      name: "Svježi Ružmarin (Fresh Rosemary)",
      category: "HERBS",
      unit: "bunch",
      minPrice: 2.0,
      maxPrice: 4.0,
      season: null,
    },
    {
      name: "Svježa Kadulja (Fresh Sage)",
      category: "HERBS",
      unit: "bunch",
      minPrice: 2.0,
      maxPrice: 4.0,
      season: null,
    },
    {
      name: "Svježa Lavanda",
      category: "HERBS",
      unit: "bunch",
      minPrice: 3.0,
      maxPrice: 5.0,
      season: "summer",
    },
    {
      name: "Mješavina Mediteranskih Začina",
      category: "HERBS",
      unit: "box",
      minPrice: 8.0,
      maxPrice: 12.0,
      season: null,
    },
  ],

  // Fruits (Voće)
  fruits: [
    {
      name: "Smokve (Figs)",
      category: "FRUITS",
      unit: "kg",
      minPrice: 4.0,
      maxPrice: 8.0,
      season: "summer",
    },
    {
      name: "Trešnje (Cherries)",
      category: "FRUITS",
      unit: "kg",
      minPrice: 5.0,
      maxPrice: 10.0,
      season: "summer",
    },
    {
      name: "Šipci (Pomegranates)",
      category: "FRUITS",
      unit: "kg",
      minPrice: 3.0,
      maxPrice: 6.0,
      season: "autumn",
    },
    {
      name: "Smokvin Džem (Fig Jam)",
      category: "PANTRY",
      unit: "jar",
      minPrice: 6.0,
      maxPrice: 10.0,
      season: null,
    },
  ],

  // Lavender Products (Lavanda)
  lavender: [
    {
      name: "Lavandino Eterično Ulje",
      category: "PANTRY",
      unit: "bottle",
      minPrice: 15.0,
      maxPrice: 30.0,
      season: null,
    },
    {
      name: "Sušena Lavanda",
      category: "HERBS",
      unit: "bag",
      minPrice: 5.0,
      maxPrice: 10.0,
      season: null,
    },
    {
      name: "Lavandini Sapun",
      category: "PANTRY",
      unit: "piece",
      minPrice: 4.0,
      maxPrice: 8.0,
      season: null,
    },
    {
      name: "Lavandin Mirisni Jastučići",
      category: "PANTRY",
      unit: "piece",
      minPrice: 6.0,
      maxPrice: 10.0,
      season: null,
    },
  ],

  // Sea Salt (Morska Sol)
  salt: [
    {
      name: "Morska Sol Krupna",
      category: "PANTRY",
      unit: "kg",
      minPrice: 4.0,
      maxPrice: 8.0,
      season: null,
    },
    {
      name: "Morska Sol Sitna",
      category: "PANTRY",
      unit: "kg",
      minPrice: 4.0,
      maxPrice: 8.0,
      season: null,
    },
    {
      name: "Fleur de Sel",
      category: "PANTRY",
      unit: "jar",
      minPrice: 10.0,
      maxPrice: 18.0,
      season: null,
    },
    {
      name: "Sol sa Začinskim Biljem",
      category: "PANTRY",
      unit: "jar",
      minPrice: 6.0,
      maxPrice: 12.0,
      season: null,
    },
  ],

  // Spirits (Rakija)
  spirits: [
    {
      name: "Smokovna Rakija (Fig Brandy)",
      category: "BEVERAGES",
      unit: "bottle",
      minPrice: 15.0,
      maxPrice: 30.0,
      season: null,
    },
    {
      name: "Lozovača (Grape Brandy)",
      category: "BEVERAGES",
      unit: "bottle",
      minPrice: 12.0,
      maxPrice: 25.0,
      season: null,
    },
    {
      name: "Travarica (Herbal Brandy)",
      category: "BEVERAGES",
      unit: "bottle",
      minPrice: 14.0,
      maxPrice: 28.0,
      season: null,
    },
  ],
};

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log("\n" + "=".repeat(80));
  console.log("🇭🇷 SEEDING ŠIBENIK, CROATIA FARMERS MARKET DATABASE");
  console.log("   Authentic Dalmatian Family Farms & Traditional Products");
  console.log("=".repeat(80) + "\n");

  try {
    // Step 1: Clean existing data
    console.log("🧹 Cleaning existing data...");
    await prisma.$transaction([
      prisma.cartItem.deleteMany(),
      prisma.orderItem.deleteMany(),
      prisma.order.deleteMany(),
      prisma.review.deleteMany(),
      prisma.product.deleteMany(),
      prisma.farmPhoto.deleteMany(),
      prisma.farm.deleteMany(),
      prisma.address.deleteMany(),
      prisma.session.deleteMany(),
      prisma.account.deleteMany(),
      prisma.user.deleteMany(),
    ]);
    console.log("✅ Database cleaned\n");

    // Step 2: Create Admin User (You!)
    console.log("👤 Creating platform admin...");
    const adminPassword = await hashPassword("Gogsia2025!");
    const admin = await prisma.user.create({
      data: {
        email: "gogsia@gmail.com",
        password: adminPassword,
        firstName: "Goran",
        lastName: "Gogsia",
        name: "Goran Gogsia",
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        phoneVerified: true,
        phone: "+385 22 123 4567",
      },
    });
    console.log(`✅ Admin created: ${admin.email}\n`);

    // Step 3: Create Farmer Users from Authentic Farms
    console.log("👨‍🌾 Creating Croatian farmers...");
    const farmers = [];

    for (const farmData of AUTHENTIC_FARMS) {
      const password = await hashPassword("Farmer2025!");
      const farmer = await prisma.user.create({
        data: {
          email: farmData.email,
          password: password,
          firstName: farmData.ownerFirstName,
          lastName: farmData.ownerLastName,
          name: `${farmData.ownerFirstName} ${farmData.ownerLastName}`,
          role: "FARMER",
          status: "ACTIVE",
          emailVerified: true,
          emailVerifiedAt: new Date(),
          phone: `+385 ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
        },
      });
      farmers.push({ user: farmer, farmData });
      console.log(`  ✓ ${farmer.name} (${farmData.area})`);
    }
    console.log(`✅ Created ${farmers.length} Croatian farmers\n`);

    // Step 4: Create Consumer Users
    console.log("🛒 Creating consumer accounts...");
    const consumerData = [
      {
        firstName: "Marija",
        lastName: "Kovač",
        email: "marija.kovac@gmail.com",
      },
      { firstName: "Luka", lastName: "Babić", email: "luka.babic@gmail.com" },
      { firstName: "Ivana", lastName: "Novak", email: "ivana.novak@gmail.com" },
      {
        firstName: "Petar",
        lastName: "Horvat",
        email: "petar.horvat@gmail.com",
      },
    ];

    const consumers = [];
    for (const data of consumerData) {
      const password = await hashPassword("Consumer2025!");
      const consumer = await prisma.user.create({
        data: {
          email: data.email,
          password: password,
          firstName: data.firstName,
          lastName: data.lastName,
          name: `${data.firstName} ${data.lastName}`,
          role: "CONSUMER",
          status: "ACTIVE",
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
      consumers.push(consumer);
      console.log(`  ✓ ${consumer.name}`);
    }
    console.log(`✅ Created ${consumers.length} consumers\n`);

    // Step 5: Create Farms with Authentic Croatian Data
    console.log("🏡 Creating Šibenik family farms...");
    const farms = [];

    for (const { user, farmData } of farmers) {
      const area =
        SIBENIK_AREAS.find((a) => a.name === farmData.area) || SIBENIK_AREAS[0];

      const farm = await prisma.farm.create({
        data: {
          name: farmData.name,
          slug: generateSlug(farmData.name),
          description: farmData.description,
          story: farmData.story,
          status: "ACTIVE",
          verificationStatus: "VERIFIED",
          verifiedAt: new Date(),
          ownerId: user.id,
          email: user.email,
          phone: user.phone,
          address: `${area.description}`,
          city: area.name === "Šibenik" ? "Šibenik" : `${area.name} - Šibenik`,
          state: "Šibenik-Knin County",
          zipCode:
            farmData.area === "Šibenik"
              ? "22000"
              : `220${Math.floor(Math.random() * 90 + 10)}`,
          country: "HR",
          latitude: area.lat.toFixed(6),
          longitude: area.lng.toFixed(6),
          certificationsArray: farmData.certifications,
          isOrganic: farmData.certifications.includes("ORGANIC"),
          farmSize: farmData.farmSize,
          yearEstablished: farmData.yearEstablished,
          farmingPractices: farmData.farmingPractices,
          images: [],
        },
      });
      farms.push({ farm, farmData });
      console.log(`  ✓ ${farm.name} (${area.name})`);
    }
    console.log(`✅ Created ${farms.length} authentic Croatian farms\n`);

    // Step 6: Create Products Based on Farm Specialties
    console.log("🥕 Creating Croatian products...");
    let totalProducts = 0;

    for (const { farm, farmData } of farms) {
      const farmProducts = [];

      // Determine which product categories to use based on farm specialty
      let productCategories: any[] = [];

      if (
        farmData.products.some(
          (p) => p.includes("Olive Oil") || p.includes("Maslin"),
        )
      ) {
        productCategories = [
          ...productCategories,
          ...CROATIAN_PRODUCTS.oliveOil,
        ];
      }
      if (
        farmData.products.some((p) => p.includes("Wine") || p.includes("Vin"))
      ) {
        productCategories = [...productCategories, ...CROATIAN_PRODUCTS.wine];
      }
      if (
        farmData.products.some((p) => p.includes("Honey") || p.includes("Med"))
      ) {
        productCategories = [...productCategories, ...CROATIAN_PRODUCTS.honey];
      }
      if (
        farmData.products.some((p) => p.includes("Cheese") || p.includes("Sir"))
      ) {
        productCategories = [...productCategories, ...CROATIAN_PRODUCTS.cheese];
      }
      if (farmData.products.some((p) => p.includes("Vegetable"))) {
        productCategories = [
          ...productCategories,
          ...CROATIAN_PRODUCTS.vegetables,
        ];
      }
      if (farmData.products.some((p) => p.includes("Lavender"))) {
        productCategories = [
          ...productCategories,
          ...CROATIAN_PRODUCTS.lavender,
        ];
      }
      if (
        farmData.products.some((p) => p.includes("Fruit") || p.includes("Fig"))
      ) {
        productCategories = [...productCategories, ...CROATIAN_PRODUCTS.fruits];
      }
      if (farmData.products.some((p) => p.includes("Salt"))) {
        productCategories = [...productCategories, ...CROATIAN_PRODUCTS.salt];
      }
      if (farmData.products.some((p) => p.includes("Rakija"))) {
        productCategories = [
          ...productCategories,
          ...CROATIAN_PRODUCTS.spirits,
        ];
      }
      if (farmData.products.some((p) => p.toLowerCase().includes("herb"))) {
        productCategories = [...productCategories, ...CROATIAN_PRODUCTS.herbs];
      }

      // Create 4-8 products per farm
      const numProducts = Math.min(
        productCategories.length,
        Math.floor(Math.random() * 5) + 4,
      );

      for (let i = 0; i < numProducts && i < productCategories.length; i++) {
        const template = productCategories[i];
        const price = parseFloat(
          (
            Math.random() * (template.maxPrice - template.minPrice) +
            template.minPrice
          ).toFixed(2),
        );

        const product = await prisma.product.create({
          data: {
            name: template.name,
            slug: `${generateSlug(template.name)}-${generateSlug(farm.name)}`,
            description: `Authentic Croatian ${template.name} from ${farm.name}. Produced using traditional Dalmatian methods in ${farmData.area}, Šibenik region.`,
            price: price,
            unit: template.unit,
            category: template.category,
            quantityAvailable: Math.floor(Math.random() * 50) + 10,
            inStock: true,
            status: "ACTIVE",
            farmId: farm.id,
            organic: farm.isOrganic,
            seasonal: template.season !== null,
            seasonalStart:
              template.season === "summer"
                ? new Date("2025-06-01")
                : template.season === "spring"
                  ? new Date("2025-03-01")
                  : template.season === "autumn"
                    ? new Date("2025-09-01")
                    : undefined,
            seasonalEnd:
              template.season === "summer"
                ? new Date("2025-09-30")
                : template.season === "spring"
                  ? new Date("2025-05-31")
                  : template.season === "autumn"
                    ? new Date("2025-11-30")
                    : undefined,
            tags: [
              `croatian`,
              `dalmatian`,
              `sibenik`,
              farmData.area.toLowerCase(),
              ...farmData.certifications.map((c) => c.toLowerCase()),
            ],
            images: [],
          },
        });
        farmProducts.push(product);
        totalProducts++;
      }

      console.log(`  ✓ ${farm.name}: ${farmProducts.length} products`);
    }
    console.log(`✅ Created ${totalProducts} Croatian products\n`);

    // Step 7: Create Sample Reviews
    console.log("⭐ Creating customer reviews...");
    const reviewTexts = [
      { text: "Odlično maslinovo ulje! Najbolje koje sam probala.", rating: 5 },
      { text: "Tradicionalni okus Dalmacije. Preporučujem!", rating: 5 },
      { text: "Svježe i kvalitetno. Kao kod bake na selu.", rating: 5 },
      { text: "Izvrsna kvaliteta, brza dostava. Zadovoljna sam.", rating: 5 },
      { text: "Autentični proizvodi, vrijedni svake kune!", rating: 4 },
      { text: "Domaće i ukusno. Podržavam lokalne proizvođače!", rating: 5 },
    ];

    let reviewCount = 0;
    for (const { farm } of farms.slice(0, 5)) {
      const farmProducts = await prisma.product.findMany({
        where: { farmId: farm.id },
        take: 2,
      });

      for (const product of farmProducts) {
        const reviewData =
          reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
        await prisma.review.create({
          data: {
            farmId: farm.id,
            customerId:
              consumers[Math.floor(Math.random() * consumers.length)].id,
            rating: reviewData.rating,
            reviewText: reviewData.text,
            isVerifiedPurchase: true,
            status: "APPROVED",
            helpfulCount: Math.floor(Math.random() * 20),
          },
        });
        reviewCount++;
      }
    }
    console.log(`✅ Created ${reviewCount} reviews\n`);

    // Final Summary
    console.log("\n" + "=".repeat(80));
    console.log("🎉 ŠIBENIK CROATIA DATABASE SEEDING COMPLETE!");
    console.log("=".repeat(80));
    console.log("\n📊 Summary:");
    console.log(`  • Platform Admin: 1 (You!)`);
    console.log(`  • Croatian Farmers: ${farmers.length}`);
    console.log(`  • Local Consumers: ${consumers.length}`);
    console.log(`  • Family Farms (OPG): ${farms.length}`);
    console.log(`  • Croatian Products: ${totalProducts}`);
    console.log(`  • Customer Reviews: ${reviewCount}`);

    console.log("\n🔐 Login Credentials:");
    console.log("  Admin (Platform Owner):");
    console.log("    Email: gogsia@gmail.com");
    console.log("    Password: Gogsia2025!");

    console.log("\n  Sample Farmer (Tomislav Duvnjak):");
    console.log("    Email: tomislav.duvnjak@opg-dalmatia.hr");
    console.log("    Password: Farmer2025!");

    console.log("\n  Sample Consumer (Marija Kovač):");
    console.log("    Email: marija.kovac@gmail.com");
    console.log("    Password: Consumer2025!");

    console.log("\n📍 Geographic Coverage:");
    console.log("  Šibenik-Knin County, Dalmatia, Croatia");
    console.log(
      "  Areas: Donje Polje, Plastovo, Skradin, Tribunj, Vodice, Primošten",
    );

    console.log("\n🌿 Traditional Products:");
    console.log("  • Award-winning olive oil (NYIOOC winners)");
    console.log(
      "  • Indigenous Croatian wines (Babić, Debit, Plavina, Maraština)",
    );
    console.log("  • Kornati sage honey & lavender honey");
    console.log("  • Artisan goat & sheep cheese");
    console.log("  • Adriatic sea salt");
    console.log("  • Dalmatian lavender products");
    console.log("  • Traditional rakija & preserves");

    console.log("\n🇭🇷 Dobrodošli na tržnicu lokalnih OPG-ova!");
    console.log("   Welcome to the Šibenik local farmers market!\n");
    console.log("=".repeat(80) + "\n");
  } catch (error) {
    console.error("\n❌ Error during seeding:");
    console.error(error);
    throw error;
  }
}

// Execute seeding
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
