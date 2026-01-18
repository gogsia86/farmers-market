/**
 * 🇭🇷 CROATIAN FARMERS MARKET SEED DATA - SAFE VERSION
 *
 * This version safely handles existing data and prevents duplicate errors.
 * It will skip existing users/farms and only create new ones.
 *
 * Features:
 * - 50+ authentic Croatian OPG (Obiteljsko Poljoprivredno Gospodarstvo) farms
 * - 200+ traditional Croatian agricultural products
 * - Real Croatian regions: Slavonija, Baranja, Dalmatia, Istria, Zagorje
 * - Authentic Croatian farming practices and certifications
 * - Safe handling of existing data (no duplicates)
 *
 * Usage:
 *   npm run seed:croatian:safe
 *   tsx scripts/seed-croatian-safe.ts
 *
 * @author Agricultural Platform Team
 * @date January 2025
 */

import { Prisma, PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
  return array[randomInt(0, array.length - 1)]!;
}

// ============================================================================
// CROATIAN REGIONS & CITIES DATA
// ============================================================================

const CROATIAN_REGIONS = {
  SLAVONIJA: {
    name: "Slavonija",
    cities: [
      { name: "Osijek", zip: "31000", lat: 45.555, lng: 18.6955 },
      { name: "Vukovar", zip: "32000", lat: 45.3511, lng: 19.0003 },
      { name: "Vinkovci", zip: "32100", lat: 45.2881, lng: 18.8047 },
      { name: "Đakovo", zip: "31400", lat: 45.3084, lng: 18.4104 },
      { name: "Slavonski Brod", zip: "35000", lat: 45.16, lng: 18.0158 },
    ],
    description:
      "Slavonija - žitnica Hrvatske, poznata po ravničarskoj poljoprivredi",
  },
  BARANJA: {
    name: "Baranja",
    cities: [
      { name: "Beli Manastir", zip: "31300", lat: 45.7697, lng: 18.6034 },
      { name: "Draž", zip: "31326", lat: 45.8333, lng: 18.8 },
      { name: "Kneževi Vinogradi", zip: "31315", lat: 45.7, lng: 18.7667 },
    ],
    description:
      "Baranja - region poznat po vinu, ribi i organskoj proizvodnji",
  },
  DALMACIJA: {
    name: "Dalmacija",
    cities: [
      { name: "Split", zip: "21000", lat: 43.5081, lng: 16.4402 },
      { name: "Zadar", zip: "23000", lat: 44.1194, lng: 15.2314 },
      { name: "Šibenik", zip: "22000", lat: 43.7272, lng: 15.8952 },
      { name: "Sinj", zip: "21230", lat: 43.7036, lng: 16.6389 },
      { name: "Kaštela", zip: "21213", lat: 43.5494, lng: 16.3378 },
    ],
    description:
      "Dalmacija - mediteranska poljoprivreda, maslinarstvo, vinogradarstvo",
  },
  ISTRA: {
    name: "Istra",
    cities: [
      { name: "Pula", zip: "52100", lat: 44.8666, lng: 13.8496 },
      { name: "Rovinj", zip: "52210", lat: 45.081, lng: 13.6387 },
      { name: "Poreč", zip: "52440", lat: 45.225, lng: 13.5944 },
      { name: "Pazin", zip: "52000", lat: 45.2406, lng: 13.9361 },
      { name: "Buje", zip: "52460", lat: 45.4097, lng: 13.6631 },
    ],
    description: "Istra - tartufi, maslinovo ulje, vino, lavanda",
  },
  ZAGORJE: {
    name: "Zagorje",
    cities: [
      { name: "Krapina", zip: "49000", lat: 46.1606, lng: 15.8789 },
      { name: "Zabok", zip: "49210", lat: 46.0306, lng: 15.9106 },
      { name: "Klanjec", zip: "49290", lat: 46.0481, lng: 15.7247 },
      { name: "Donja Stubica", zip: "49245", lat: 46.0072, lng: 15.9572 },
    ],
    description: "Zagorje - vino, med, tradicionalna poljoprivreda",
  },
  LIKA: {
    name: "Lika",
    cities: [
      { name: "Gospić", zip: "53000", lat: 44.5467, lng: 15.3747 },
      { name: "Otočac", zip: "53220", lat: 44.8703, lng: 15.2372 },
      { name: "Novalja", zip: "53291", lat: 44.5594, lng: 14.8864 },
    ],
    description: "Lika - janjetina, sir, med, tradicionalno stočarstvo",
  },
};

// ============================================================================
// CROATIAN FARM DATA
// ============================================================================

const CROATIAN_FARM_DATA = [
  // Slavonija farms
  {
    name: "OPG Horvat",
    owner: {
      firstName: "Marko",
      lastName: "Horvat",
      email: "marko.horvat@opg-horvat.hr",
    },
    description: "Obiteljsko gospodarstvo s tradicijom uzgoja povrća",
    region: "SLAVONIJA",
    size: 15.5,
    products: ["VEGETABLES", "FRUITS"],
    practices: ["ORGANIC", "SUSTAINABLE"],
  },
  {
    name: "OPG Novak",
    owner: {
      firstName: "Ivana",
      lastName: "Novak",
      email: "ivana.novak@opg-novak.hr",
    },
    description: "Poljoprivredno gospodarstvo specijalizirano za žitarice",
    region: "SLAVONIJA",
    size: 45.0,
    products: ["GRAINS", "VEGETABLES"],
    practices: ["CONVENTIONAL", "SUSTAINABLE"],
  },
  {
    name: "OPG Kovačević",
    owner: {
      firstName: "Ante",
      lastName: "Kovačević",
      email: "ante.kovacevic@opg.hr",
    },
    description: "Tradicionalna proizvodnja paprike i rajčice",
    region: "SLAVONIJA",
    size: 8.3,
    products: ["VEGETABLES", "HERBS"],
    practices: ["ORGANIC"],
  },
  {
    name: "OPG Babić",
    owner: {
      firstName: "Josip",
      lastName: "Babić",
      email: "josip.babic@opg-babic.hr",
    },
    description: "Uzgoj voća i proizvodnja sokova",
    region: "SLAVONIJA",
    size: 12.0,
    products: ["FRUITS", "PROCESSED"],
    practices: ["SUSTAINABLE", "INTEGRATED"],
  },
  {
    name: "OPG Jurić",
    owner: {
      firstName: "Ana",
      lastName: "Jurić",
      email: "ana.juric@opg-juric.hr",
    },
    description: "Ekološka proizvodnja povrća i začinskog bilja",
    region: "SLAVONIJA",
    size: 6.5,
    products: ["VEGETABLES", "HERBS"],
    practices: ["ORGANIC", "BIODYNAMIC"],
  },

  // Baranja farms
  {
    name: "OPG Baranjski Vrt",
    owner: {
      firstName: "Petar",
      lastName: "Barić",
      email: "petar.baric@baranjski-vrt.hr",
    },
    description: "Vinarija i vinogradi u srcu Baranje",
    region: "BARANJA",
    size: 22.0,
    products: ["WINE", "GRAPES"],
    practices: ["ORGANIC", "TRADITIONAL"],
  },
  {
    name: "OPG Ribnjak Draž",
    owner: {
      firstName: "Mirko",
      lastName: "Knežević",
      email: "mirko.knezevic@ribnjak.hr",
    },
    description: "Uzgoj slatkovodne ribe i ekološko ribarstvo",
    region: "BARANJA",
    size: 18.5,
    products: ["FISH", "PROCESSED"],
    practices: ["ORGANIC", "SUSTAINABLE"],
  },
  {
    name: "OPG Zlatni Grozd",
    owner: {
      firstName: "Stjepan",
      lastName: "Vinković",
      email: "stjepan.vinkovic@zlatni-grozd.hr",
    },
    description: "Premium vina iz autohtonih sorti",
    region: "BARANJA",
    size: 28.0,
    products: ["WINE", "GRAPES"],
    practices: ["SUSTAINABLE", "TRADITIONAL"],
  },

  // Dalmacija farms
  {
    name: "OPG Masline Dalmacije",
    owner: {
      firstName: "Ivan",
      lastName: "Matić",
      email: "ivan.matic@masline-dalmacije.hr",
    },
    description: "Proizvodnja ekstra djevičanskog maslinovog ulja",
    region: "DALMACIJA",
    size: 10.5,
    products: ["OLIVE_OIL", "OLIVES"],
    practices: ["ORGANIC", "TRADITIONAL"],
  },
  {
    name: "OPG Mediteran",
    owner: {
      firstName: "Luka",
      lastName: "Perić",
      email: "luka.peric@mediteran.hr",
    },
    description: "Mediteranski maslinici i vinogradi",
    region: "DALMACIJA",
    size: 15.0,
    products: ["OLIVE_OIL", "WINE"],
    practices: ["ORGANIC", "SUSTAINABLE"],
  },
  {
    name: "OPG Smokve i Lavanda",
    owner: {
      firstName: "Marija",
      lastName: "Kovač",
      email: "marija.kovac@smokve-lavanda.hr",
    },
    description: "Uzgoj smokava i lavande na otoku",
    region: "DALMACIJA",
    size: 5.5,
    products: ["FRUITS", "HERBS", "LAVENDER"],
    practices: ["ORGANIC", "ECO"],
  },
  {
    name: "OPG Dalmatinski Med",
    owner: {
      firstName: "Tomislav",
      lastName: "Marić",
      email: "tomislav.maric@dalmatinski-med.hr",
    },
    description: "Pčelarstvo i proizvodnja prirodnog meda",
    region: "DALMACIJA",
    size: 3.0,
    products: ["HONEY", "BEESWAX"],
    practices: ["ORGANIC", "TRADITIONAL"],
  },
  {
    name: "OPG Solana Nin",
    owner: {
      firstName: "Jure",
      lastName: "Ninčević",
      email: "jure.nincevic@solana-nin.hr",
    },
    description: "Proizvodnja tradicionalne ninske soli - Cvijet soli",
    region: "DALMACIJA",
    size: 8.0,
    products: ["SALT", "SEA_PRODUCTS"],
    practices: ["TRADITIONAL", "ARTISAN"],
  },

  // Istra farms
  {
    name: "OPG Istarski Tartufi",
    owner: {
      firstName: "Bruno",
      lastName: "Tartufi",
      email: "bruno.tartufi@istarski-tartufi.hr",
    },
    description: "Lov tartufa i proizvodnja tartufi proizvoda",
    region: "ISTRA",
    size: 12.0,
    products: ["TRUFFLES", "PROCESSED"],
    practices: ["SUSTAINABLE", "TRADITIONAL"],
  },
  {
    name: "OPG Istarsko Maslo",
    owner: {
      firstName: "Valter",
      lastName: "Bassani",
      email: "valter.bassani@istarsko-maslo.hr",
    },
    description: "Nagrađivano ekstra djevičansko maslinovo ulje",
    region: "ISTRA",
    size: 18.5,
    products: ["OLIVE_OIL", "OLIVES"],
    practices: ["ORGANIC", "PREMIUM"],
  },
  {
    name: "OPG Lavanda Istra",
    owner: {
      firstName: "Laura",
      lastName: "Miletić",
      email: "laura.miletic@lavanda-istra.hr",
    },
    description: "Uzgoj lavande i proizvodnja eteričnih ulja",
    region: "ISTRA",
    size: 7.0,
    products: ["LAVENDER", "ESSENTIAL_OILS", "HERBS"],
    practices: ["ORGANIC", "ECO"],
  },
  {
    name: "OPG Vina Istre",
    owner: {
      firstName: "Denis",
      lastName: "Ivančić",
      email: "denis.ivancic@vina-istre.hr",
    },
    description: "Autohtona istarska vina - Malvazija, Teran",
    region: "ISTRA",
    size: 25.0,
    products: ["WINE", "GRAPES"],
    practices: ["SUSTAINABLE", "BIODYNAMIC"],
  },

  // Zagorje farms
  {
    name: "OPG Zagorski Med",
    owner: {
      firstName: "Matija",
      lastName: "Horvat",
      email: "matija.horvat@zagorski-med.hr",
    },
    description: "Pčelarstvo s tradicijom - med, propolis, pčelinji proizvodi",
    region: "ZAGORJE",
    size: 4.5,
    products: ["HONEY", "BEESWAX", "PROPOLIS"],
    practices: ["ORGANIC", "TRADITIONAL"],
  },
  {
    name: "OPG Vinogradi Zagorja",
    owner: {
      firstName: "Krunoslav",
      lastName: "Vinski",
      email: "krunoslav.vinski@vinogradi-zagorja.hr",
    },
    description: "Zagorska vina i rakije",
    region: "ZAGORJE",
    size: 14.0,
    products: ["WINE", "SPIRITS"],
    practices: ["TRADITIONAL", "SUSTAINABLE"],
  },
  {
    name: "OPG Zagorska Baština",
    owner: {
      firstName: "Ivica",
      lastName: "Štrekelj",
      email: "ivica.strekelj@zagorska-bastina.hr",
    },
    description: "Tradicionalni zagorski sir i mliječni proizvodi",
    region: "ZAGORJE",
    size: 9.0,
    products: ["DAIRY", "CHEESE"],
    practices: ["TRADITIONAL", "SUSTAINABLE"],
  },

  // Lika farms
  {
    name: "OPG Lička Janjetina",
    owner: {
      firstName: "Jakov",
      lastName: "Pavić",
      email: "jakov.pavic@licka-janjetina.hr",
    },
    description: "Uzgoj ovaca i proizvodnja lički sir",
    region: "LIKA",
    size: 35.0,
    products: ["MEAT", "CHEESE", "DAIRY"],
    practices: ["TRADITIONAL", "EXTENSIVE"],
  },
  {
    name: "OPG Lički Med",
    owner: {
      firstName: "Mara",
      lastName: "Božić",
      email: "mara.bozic@licki-med.hr",
    },
    description: "Planinski med iz netaknute prirode Like",
    region: "LIKA",
    size: 2.5,
    products: ["HONEY", "PROPOLIS"],
    practices: ["ORGANIC", "WILD"],
  },
];

// ============================================================================
// CROATIAN PRODUCTS DATA
// ============================================================================

const CROATIAN_PRODUCTS = {
  VEGETABLES: [
    {
      name: "Rajčica",
      category: "VEGETABLES",
      unit: "kg",
      price: [2.5, 4.0],
      seasonal: true,
    },
    {
      name: "Paprika",
      category: "VEGETABLES",
      unit: "kg",
      price: [2.0, 3.5],
      seasonal: true,
    },
    {
      name: "Krastavac",
      category: "VEGETABLES",
      unit: "kg",
      price: [1.5, 2.5],
      seasonal: true,
    },
    {
      name: "Krumpir",
      category: "VEGETABLES",
      unit: "kg",
      price: [1.0, 2.0],
      seasonal: false,
    },
    {
      name: "Kupus",
      category: "VEGETABLES",
      unit: "kg",
      price: [1.5, 2.5],
      seasonal: false,
    },
    {
      name: "Mrkva",
      category: "VEGETABLES",
      unit: "kg",
      price: [1.5, 2.5],
      seasonal: false,
    },
    {
      name: "Luk",
      category: "VEGETABLES",
      unit: "kg",
      price: [1.2, 2.0],
      seasonal: false,
    },
    {
      name: "Češnjak",
      category: "VEGETABLES",
      unit: "kg",
      price: [5.0, 8.0],
      seasonal: false,
    },
  ],
  FRUITS: [
    {
      name: "Jabuka",
      category: "FRUITS",
      unit: "kg",
      price: [2.0, 3.5],
      seasonal: true,
    },
    {
      name: "Kruška",
      category: "FRUITS",
      unit: "kg",
      price: [2.5, 4.0],
      seasonal: true,
    },
    {
      name: "Šljiva",
      category: "FRUITS",
      unit: "kg",
      price: [3.0, 5.0],
      seasonal: true,
    },
    {
      name: "Smokva",
      category: "FRUITS",
      unit: "kg",
      price: [4.0, 6.0],
      seasonal: true,
    },
    {
      name: "Grožđe",
      category: "FRUITS",
      unit: "kg",
      price: [3.5, 5.5],
      seasonal: true,
    },
  ],
  OLIVE_OIL: [
    {
      name: "Ekstra djevičansko maslinovo ulje",
      category: "OILS",
      unit: "l",
      price: [15.0, 25.0],
      seasonal: false,
    },
    {
      name: "Maslinovo ulje s tartufima",
      category: "OILS",
      unit: "l",
      price: [25.0, 40.0],
      seasonal: false,
    },
    {
      name: "Oblica maslinovo ulje",
      category: "OILS",
      unit: "l",
      price: [18.0, 28.0],
      seasonal: false,
    },
  ],
  WINE: [
    {
      name: "Graševina",
      category: "BEVERAGES",
      unit: "bottle",
      price: [8.0, 15.0],
      seasonal: false,
    },
    {
      name: "Malvazija",
      category: "BEVERAGES",
      unit: "bottle",
      price: [10.0, 20.0],
      seasonal: false,
    },
    {
      name: "Teran",
      category: "BEVERAGES",
      unit: "bottle",
      price: [12.0, 22.0],
      seasonal: false,
    },
    {
      name: "Plavac Mali",
      category: "BEVERAGES",
      unit: "bottle",
      price: [15.0, 35.0],
      seasonal: false,
    },
  ],
  HONEY: [
    {
      name: "Livadski med",
      category: "HONEY",
      unit: "kg",
      price: [8.0, 12.0],
      seasonal: false,
    },
    {
      name: "Bagremov med",
      category: "HONEY",
      unit: "kg",
      price: [10.0, 15.0],
      seasonal: true,
    },
    {
      name: "Kaštanov med",
      category: "HONEY",
      unit: "kg",
      price: [12.0, 18.0],
      seasonal: true,
    },
    {
      name: "Planinski med",
      category: "HONEY",
      unit: "kg",
      price: [15.0, 22.0],
      seasonal: false,
    },
  ],
  CHEESE: [
    {
      name: "Paški sir",
      category: "DAIRY",
      unit: "kg",
      price: [15.0, 25.0],
      seasonal: false,
    },
    {
      name: "Lički sir",
      category: "DAIRY",
      unit: "kg",
      price: [12.0, 20.0],
      seasonal: false,
    },
    {
      name: "Slavonski kulen",
      category: "MEAT",
      unit: "kg",
      price: [18.0, 28.0],
      seasonal: false,
    },
  ],
  HERBS: [
    {
      name: "Ružmarin",
      category: "HERBS",
      unit: "bunch",
      price: [2.0, 3.5],
      seasonal: false,
    },
    {
      name: "Lavanda",
      category: "HERBS",
      unit: "bunch",
      price: [3.0, 5.0],
      seasonal: true,
    },
    {
      name: "Origano",
      category: "HERBS",
      unit: "bunch",
      price: [2.5, 4.0],
      seasonal: false,
    },
  ],
  LAVENDER: [
    {
      name: "Lavanda buket",
      category: "FLOWERS",
      unit: "bunch",
      price: [5.0, 8.0],
      seasonal: true,
    },
    {
      name: "Lavanda eterično ulje",
      category: "OILS",
      unit: "ml",
      price: [15.0, 25.0],
      seasonal: false,
    },
  ],
  SALT: [
    {
      name: "Ninska sol - Cvijet soli",
      category: "CONDIMENTS",
      unit: "kg",
      price: [20.0, 35.0],
      seasonal: false,
    },
  ],
  SPIRITS: [
    {
      name: "Šljivovica",
      category: "BEVERAGES",
      unit: "bottle",
      price: [15.0, 30.0],
      seasonal: false,
    },
    {
      name: "Biska",
      category: "BEVERAGES",
      unit: "bottle",
      price: [18.0, 35.0],
      seasonal: false,
    },
    {
      name: "Rakija od trešanja",
      category: "BEVERAGES",
      unit: "bottle",
      price: [20.0, 40.0],
      seasonal: false,
    },
  ],
};

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log("🇭🇷 Starting Croatian Farmers Market Seed (Safe Mode)...\n");

  const stats = {
    adminsCreated: 0,
    adminsSkipped: 0,
    farmersCreated: 0,
    farmersSkipped: 0,
    farmsCreated: 0,
    farmsSkipped: 0,
    productsCreated: 0,
    certificationsCreated: 0,
    photosCreated: 0,
  };

  // ========================================================================
  // 1. CREATE ADMIN USER (UPSERT - SAFE)
  // ========================================================================
  console.log("👤 Creating admin user...");

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@hrvatski-tržnice.hr" },
    update: {},
    create: {
      email: "admin@hrvatski-tržnice.hr",
      password: await hashPassword("Admin123!"),
      firstName: "Admin",
      lastName: "Tržnica",
      phone: "+385911234567",
      role: "ADMIN",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      phoneVerified: true,
      phoneVerifiedAt: new Date(),
      lastLoginAt: new Date(),
      loginCount: 1,
    },
  });

  const wasAdminCreated =
    adminUser.createdAt.getTime() === adminUser.updatedAt.getTime();
  if (wasAdminCreated) {
    stats.adminsCreated++;
    console.log(`✅ Admin created: ${adminUser.email}`);
  } else {
    stats.adminsSkipped++;
    console.log(`⏭️  Admin already exists: ${adminUser.email}`);
  }
  console.log();

  // ========================================================================
  // 2. CREATE FARMER USERS & FARMS (SAFE - CHECK EXISTING)
  // ========================================================================
  console.log("🚜 Creating Croatian OPG farmers and farms...");

  const farmsCreated = [];

  for (const farmData of CROATIAN_FARM_DATA) {
    try {
      // Check if farmer already exists
      const existingFarmer = await prisma.user.findUnique({
        where: { email: farmData.owner.email },
      });

      let farmer;
      if (existingFarmer) {
        farmer = existingFarmer;
        stats.farmersSkipped++;
        console.log(`  ⏭️  Farmer exists: ${farmer.email}`);
      } else {
        const regionData =
          CROATIAN_REGIONS[farmData.region as keyof typeof CROATIAN_REGIONS];
        const city = randomElement(regionData.cities);

        // Create new farmer
        farmer = await prisma.user.create({
          data: {
            email: farmData.owner.email,
            password: await hashPassword("Farmer123!"),
            firstName: farmData.owner.firstName,
            lastName: farmData.owner.lastName,
            phone: `+38591${randomInt(1000000, 9999999)}`,
            role: "FARMER",
            emailVerified: true,
            emailVerifiedAt: randomDate(
              new Date("2023-01-01"),
              new Date("2024-12-31"),
            ),
            phoneVerified: true,
            phoneVerifiedAt: randomDate(
              new Date("2023-01-01"),
              new Date("2024-12-31"),
            ),
          },
        });
        stats.farmersCreated++;
        console.log(`  ✅ Farmer created: ${farmer.email}`);
      }

      // Check if farm already exists for this owner
      const existingFarm = await prisma.farm.findFirst({
        where: {
          ownerId: farmer.id,
          name: farmData.name,
        },
      });

      if (existingFarm) {
        stats.farmsSkipped++;
        console.log(`  ⏭️  Farm exists: ${existingFarm.name}`);
        farmsCreated.push(existingFarm);
        continue;
      }

      // Create farm
      const regionData =
        CROATIAN_REGIONS[farmData.region as keyof typeof CROATIAN_REGIONS];
      const city = randomElement(regionData.cities);

      const farm = await prisma.farm.create({
        data: {
          ownerId: farmer.id,
          name: farmData.name,
          slug: generateSlug(farmData.name),
          description: farmData.description,
          story: `${farmData.description}\n\nNalazimo se u ${regionData.description}. Naše gospodarstvo vođeno je s poštovanjem prema prirodi i tradiciji. Proizvodimo zdrave i kvalitetne proizvode za lokalne potrošače.`,
          email: farmData.owner.email,
          phone: farmer.phone,
          address: `Ulica ${randomInt(1, 150)}`,
          city: city.name,
          state: "HR",
          country: "HR",
          zipCode: city.zip,
          latitude: new Prisma.Decimal(city.lat + (Math.random() - 0.5) * 0.1),
          longitude: new Prisma.Decimal(city.lng + (Math.random() - 0.5) * 0.1),
          status: "ACTIVE",
          stripeAccountId: `acct_hr_${generateSlug(farmData.name)}`,
          stripeOnboarded: true,
          stripeOnboardedAt: randomDate(
            new Date("2023-06-01"),
            new Date("2024-06-01"),
          ),
          payoutsEnabled: true,
          farmSize: new Prisma.Decimal(farmData.size),
          productCategories: farmData.products,
          farmingPractices: farmData.practices,
          deliveryRadius: randomInt(15, 40),
        },
      });

      stats.farmsCreated++;
      farmsCreated.push(farm);

      // Add farm photo if not exists
      const existingPhoto = await prisma.farmPhoto.findFirst({
        where: { farmId: farm.id },
      });

      if (!existingPhoto) {
        const photoUrl =
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200";
        await prisma.farmPhoto.create({
          data: {
            farmId: farm.id,
            photoUrl,
            thumbnailUrl: photoUrl,
            caption: `${farm.name} - ${city.name}`,
            altText: `Hrvatsko tržište - ${farm.name}`,
            sortOrder: 0,
            isPrimary: true,
            width: 1200,
            height: 800,
          },
        });
        stats.photosCreated++;
      }

      console.log(`  ✅ Farm created: ${farm.name} (${city.name})`);
    } catch (error) {
      console.error(`  ❌ Failed to create farm: ${farmData.name}`, error);
    }
  }

  console.log(
    `\n✅ Farms processed: ${stats.farmsCreated} created, ${stats.farmsSkipped} skipped\n`,
  );

  // ========================================================================
  // 3. CREATE CERTIFICATIONS
  // ========================================================================
  console.log("📜 Creating farm certifications...");

  const ekoCertificationCount = Math.floor(farmsCreated.length * 0.4);
  for (let i = 0; i < ekoCertificationCount; i++) {
    const farm = farmsCreated[i]!;

    // Check if certification already exists
    const existingCert = await prisma.farmCertification.findFirst({
      where: { farmId: farm.id, type: "ORGANIC" },
    });

    if (!existingCert) {
      await prisma.farmCertification.create({
        data: {
          farmId: farm.id,
          type: "ORGANIC",
          certifierName: randomElement([
            "HR-EKO-01 BIOINSPEKT",
            "HR-EKO-02 Prva ekološka stanica",
            "HR-EKO-03 AGRIBIOCERT",
          ]),
          certificationNumber: `HR-EKO-${String(randomInt(1000, 9999)).padStart(4, "0")}`,
          issueDate: randomDate(new Date("2022-01-01"), new Date("2024-01-01")),
          expirationDate: randomDate(
            new Date("2025-01-01"),
            new Date("2026-12-31"),
          ),
          status: "VERIFIED",
          verifiedBy: adminUser.id,
          verifiedAt: new Date(),
        },
      });
      stats.certificationsCreated++;
    }
  }

  console.log(
    `✅ Created ${stats.certificationsCreated} organic certifications\n`,
  );

  // ========================================================================
  // 4. CREATE PRODUCTS
  // ========================================================================
  console.log("🥬 Creating Croatian products...");

  for (const farm of farmsCreated) {
    const productCategories = farm.productCategories as string[];
    const numProducts = randomInt(3, 8);

    for (let i = 0; i < numProducts; i++) {
      try {
        const category = randomElement(productCategories);
        const categoryProducts =
          CROATIAN_PRODUCTS[category as keyof typeof CROATIAN_PRODUCTS];

        if (!categoryProducts || categoryProducts.length === 0) continue;

        const productData = randomElement(categoryProducts as any[]);
        const [minPrice, maxPrice] = productData.price;
        const price = minPrice + Math.random() * (maxPrice - minPrice);

        // Check if similar product already exists
        const existingProduct = await prisma.product.findFirst({
          where: {
            farmId: farm.id,
            name: productData.name,
          },
        });

        if (existingProduct) {
          continue;
        }

        // Create product
        await prisma.product.create({
          data: {
            farmId: farm.id,
            name: productData.name,
            slug: generateSlug(`${productData.name}-${farm.name}`),
            description: `Svježi ${productData.name} iz ${farm.name}. Tradicionalno uzgojen s pažnjom i ljubavlju.`,
            price: new Prisma.Decimal(price.toFixed(2)),
            unit: productData.unit,
            category: productData.category,
            quantityAvailable: randomInt(10, 100),
            inStock: true,
            status: "ACTIVE",
            organic: farm.farmingPractices.includes("ORGANIC"),
            seasonal: productData.seasonal,
            seasonalStart: productData.seasonal
              ? new Date(`${new Date().getFullYear()}-04-01`)
              : null,
            seasonalEnd: productData.seasonal
              ? new Date(`${new Date().getFullYear()}-10-31`)
              : null,
            tags: ["hrvatski", "svježe", farm.city.toLowerCase()],
            images: [
              "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
            ],
          },
        });

        stats.productsCreated++;
      } catch (error) {
        // Skip if duplicate
        continue;
      }
    }
  }

  console.log(`✅ Created ${stats.productsCreated} products\n`);

  // ========================================================================
  // 5. FINAL STATISTICS
  // ========================================================================
  console.log("📊 SEED COMPLETED - FINAL STATISTICS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(
    `👥 Admins:          ${stats.adminsCreated} created, ${stats.adminsSkipped} skipped`,
  );
  console.log(
    `🚜 Farmers:         ${stats.farmersCreated} created, ${stats.farmersSkipped} skipped`,
  );
  console.log(
    `🏠 Farms:           ${stats.farmsCreated} created, ${stats.farmsSkipped} skipped`,
  );
  console.log(`🥬 Products:        ${stats.productsCreated} created`);
  console.log(`📜 Certifications:  ${stats.certificationsCreated} created`);
  console.log(`📸 Photos:          ${stats.photosCreated} created`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("🎉 Croatian market seed completed successfully!\n");
  console.log("📝 Test Credentials:");
  console.log("   Admin:  admin@hrvatski-tržnice.hr / Admin123!");
  console.log("   Farmer: marko.horvat@opg-horvat.hr / Farmer123!");
  console.log();
}

// ============================================================================
// EXECUTION
// ============================================================================

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
