#!/usr/bin/env tsx
/**
 * Comprehensive Seed Script - Wave 3
 * Generates rich, production-quality demo data
 *
 * Usage:
 *   npm run seed:comprehensive
 *   tsx scripts/seed-comprehensive.ts
 *
 * Generates:
 *   - 50+ farms with detailed stories
 *   - 200+ products with AI-quality descriptions
 *   - Reviews, ratings, certifications
 *   - Orders and inventory
 *   - Realistic timestamps and relationships
 */

import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ========================================================================
// CONFIGURATION
// ========================================================================

const CONFIG = {
  FARMS_COUNT: 50,
  PRODUCTS_PER_FARM_MIN: 3,
  PRODUCTS_PER_FARM_MAX: 8,
  REVIEWS_PER_FARM_MIN: 2,
  REVIEWS_PER_FARM_MAX: 10,
  ORDERS_COUNT: 100,
  CONSUMERS_COUNT: 30,
  VERBOSE: true,
};

// ========================================================================
// UTILITY FUNCTIONS
// ========================================================================

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

function randomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomDate(startDays: number, endDays: number): Date {
  const now = new Date();
  const start = new Date(now.getTime() - startDays * 24 * 60 * 60 * 1000);
  const end = new Date(now.getTime() - endDays * 24 * 60 * 60 * 1000);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function log(message: string, data?: any) {
  if (CONFIG.VERBOSE) {
    console.log(`  ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}

// ========================================================================
// DATA TEMPLATES
// ========================================================================

const FARM_NAME_PREFIXES = [
  'Sunny', 'Green', 'Golden', 'Fresh', 'Pure', 'Blue', 'Red', 'Silver',
  'Mountain', 'Valley', 'River', 'Creek', 'Meadow', 'Hill', 'Forest',
  'Harvest', 'Abundant', 'Flourishing', 'Thriving', 'Heritage', 'Legacy',
  'Family', 'Organic', 'Natural', 'Wild', 'Sacred', 'Living', 'Growing'
];

const FARM_NAME_SUFFIXES = [
  'Acres', 'Farm', 'Ranch', 'Gardens', 'Homestead', 'Fields', 'Grove',
  'Orchard', 'Meadows', 'Valley', 'Hills', 'Springs', 'Creek', 'Ridge',
  'Hollow', 'Bend', 'Glen', 'Dale', 'Haven', 'Place', 'Estate', 'Co-op'
];

const FARM_OWNER_FIRST_NAMES = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
  'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael',
  'Emily', 'Daniel', 'Elizabeth', 'Jacob', 'Sofia', 'Logan', 'Avery', 'Jackson',
  'Ella', 'Sebastian', 'Scarlett', 'Jack', 'Grace', 'Aiden', 'Chloe', 'Owen',
  'Victoria', 'Samuel', 'Riley', 'Matthew', 'Aria', 'Joseph', 'Lily', 'Levi',
  'Aubrey', 'David', 'Zoey', 'John'
];

const FARM_OWNER_LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Walker', 'Hall',
  'Allen', 'Young', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green',
  'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell', 'Roberts', 'Turner', 'Phillips',
  'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Morris', 'Rogers'
];

const OREGON_CITIES = [
  { name: 'Portland', lat: 45.5152, lng: -122.6784 },
  { name: 'Salem', lat: 44.9429, lng: -123.0351 },
  { name: 'Eugene', lat: 44.0521, lng: -123.0868 },
  { name: 'Bend', lat: 44.0582, lng: -121.3153 },
  { name: 'Medford', lat: 42.3265, lng: -122.8756 },
  { name: 'Corvallis', lat: 44.5646, lng: -123.2620 },
  { name: 'Hillsboro', lat: 45.5228, lng: -122.9898 },
  { name: 'Hood River', lat: 45.7054, lng: -121.5212 },
  { name: 'Ashland', lat: 42.1946, lng: -122.7095 },
  { name: 'Grants Pass', lat: 42.4390, lng: -123.3284 },
];

const FARMING_PRACTICES = [
  'organic', 'regenerative', 'biodynamic', 'permaculture', 'no-till',
  'pasture-raised', 'heritage-varieties', 'integrated-pest-management',
  'crop-rotation', 'companion-planting', 'water-conservation', 'solar-powered'
];

const PRODUCT_CATEGORIES = [
  'VEGETABLES', 'FRUITS', 'HERBS', 'EGGS', 'DAIRY', 'MEAT', 'POULTRY',
  'HONEY', 'PRESERVES', 'BAKED_GOODS', 'FLOWERS', 'PLANTS'
];

const VEGETABLES = [
  { name: 'Heirloom Tomatoes', unit: 'lb', price: [4.50, 7.00] },
  { name: 'Cherry Tomatoes', unit: 'pint', price: [4.00, 6.00] },
  { name: 'Bell Peppers', unit: 'lb', price: [3.50, 5.50] },
  { name: 'Zucchini', unit: 'lb', price: [2.50, 4.00] },
  { name: 'Summer Squash', unit: 'lb', price: [2.50, 4.00] },
  { name: 'Cucumbers', unit: 'each', price: [1.50, 3.00] },
  { name: 'Carrots', unit: 'bunch', price: [3.00, 5.00] },
  { name: 'Beets', unit: 'bunch', price: [3.50, 5.50] },
  { name: 'Kale', unit: 'bunch', price: [3.00, 5.00] },
  { name: 'Swiss Chard', unit: 'bunch', price: [3.50, 5.50] },
  { name: 'Lettuce Mix', unit: 'bag', price: [4.00, 6.00] },
  { name: 'Spinach', unit: 'bag', price: [4.50, 6.50] },
  { name: 'Arugula', unit: 'bag', price: [5.00, 7.00] },
  { name: 'Radishes', unit: 'bunch', price: [2.50, 4.00] },
  { name: 'Turnips', unit: 'lb', price: [2.00, 3.50] },
  { name: 'Green Beans', unit: 'lb', price: [4.00, 6.00] },
  { name: 'Snap Peas', unit: 'lb', price: [5.00, 7.00] },
  { name: 'Broccoli', unit: 'head', price: [3.00, 5.00] },
  { name: 'Cauliflower', unit: 'head', price: [4.00, 6.00] },
  { name: 'Cabbage', unit: 'head', price: [2.50, 4.50] },
];

const FRUITS = [
  { name: 'Strawberries', unit: 'pint', price: [5.00, 8.00] },
  { name: 'Blueberries', unit: 'pint', price: [6.00, 9.00] },
  { name: 'Raspberries', unit: 'pint', price: [6.50, 9.50] },
  { name: 'Blackberries', unit: 'pint', price: [5.50, 8.50] },
  { name: 'Apples', unit: 'lb', price: [2.50, 4.50] },
  { name: 'Pears', unit: 'lb', price: [3.00, 5.00] },
  { name: 'Peaches', unit: 'lb', price: [4.00, 6.00] },
  { name: 'Plums', unit: 'lb', price: [3.50, 5.50] },
  { name: 'Cherries', unit: 'lb', price: [6.00, 9.00] },
  { name: 'Melons', unit: 'each', price: [4.00, 8.00] },
];

const HERBS = [
  { name: 'Basil', unit: 'bunch', price: [3.00, 5.00] },
  { name: 'Cilantro', unit: 'bunch', price: [2.50, 4.00] },
  { name: 'Parsley', unit: 'bunch', price: [2.50, 4.00] },
  { name: 'Dill', unit: 'bunch', price: [3.00, 4.50] },
  { name: 'Mint', unit: 'bunch', price: [3.00, 4.50] },
  { name: 'Oregano', unit: 'bunch', price: [3.50, 5.00] },
  { name: 'Thyme', unit: 'bunch', price: [3.50, 5.00] },
  { name: 'Rosemary', unit: 'bunch', price: [3.50, 5.00] },
];

const OTHER_PRODUCTS = [
  { name: 'Farm Fresh Eggs', category: 'EGGS', unit: 'dozen', price: [5.00, 8.00] },
  { name: 'Raw Honey', category: 'HONEY', unit: 'jar', price: [8.00, 14.00] },
  { name: 'Goat Cheese', category: 'DAIRY', unit: 'oz', price: [12.00, 18.00] },
  { name: 'Fresh Pasta', category: 'BAKED_GOODS', unit: 'lb', price: [8.00, 12.00] },
  { name: 'Sourdough Bread', category: 'BAKED_GOODS', unit: 'loaf', price: [6.00, 10.00] },
  { name: 'Apple Cider', category: 'PRESERVES', unit: 'quart', price: [6.00, 10.00] },
  { name: 'Strawberry Jam', category: 'PRESERVES', unit: 'jar', price: [7.00, 11.00] },
  { name: 'Tomato Sauce', category: 'PRESERVES', unit: 'jar', price: [6.00, 10.00] },
];

const PRODUCT_DESCRIPTIONS = {
  tomatoes: 'Sun-ripened on the vine, our heirloom tomatoes burst with rich, complex flavors. Each variety is hand-picked at peak ripeness.',
  peppers: 'Crisp and colorful bell peppers, perfect for fresh eating or cooking. Grown without synthetic pesticides.',
  zucchini: 'Tender summer squash harvested young for the best flavor and texture. Great for grilling or spiralizing.',
  cucumbers: 'Crisp, refreshing cucumbers perfect for salads or pickling. Picked fresh daily.',
  carrots: 'Sweet, crunchy carrots with vibrant color and excellent flavor. Our soil produces the best carrots in the region.',
  greens: 'Fresh-cut salad greens harvested the morning of delivery. Maximum freshness and nutrition.',
  herbs: 'Aromatic fresh herbs that will elevate your cooking. Cut to order for maximum flavor.',
  berries: 'Plump, juicy berries picked at perfect ripeness. So fresh they may not make it home!',
  eggs: 'Farm-fresh eggs from pasture-raised hens. Deep orange yolks and superior flavor.',
  honey: 'Raw, unfiltered honey from our hives. Packed with local pollen and incredible flavor.',
};

// ========================================================================
// MAIN SEED FUNCTION
// ========================================================================

async function main() {
  console.log('🌾 Starting Comprehensive Seed Script - Wave 3');
  console.log('================================================\n');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.farmPhoto.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  console.log('  ✅ Database cleaned\n');

  // ========================================================================
  // CREATE ADMIN USER
  // ========================================================================
  console.log('👤 Creating admin user...');
  const hashedPassword = await hashPassword('Admin123!');

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@farmersmarket.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+15555000001',
      role: 'ADMIN',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      phoneVerified: true,
      phoneVerifiedAt: new Date(),
      lastLoginAt: new Date(),
      loginCount: 10,
    },
  });
  console.log(`  ✅ Admin created: ${adminUser.email}\n`);

  // ========================================================================
  // CREATE FARMERS
  // ========================================================================
  console.log(`👨‍🌾 Creating ${CONFIG.FARMS_COUNT} farmers...`);
  const farmers = [];

  for (let i = 0; i < CONFIG.FARMS_COUNT; i++) {
    const firstName = randomElement(FARM_OWNER_FIRST_NAMES);
    const lastName = randomElement(FARM_OWNER_LAST_NAMES);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@farm.com`;

    const farmer = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: `+1555${1000 + i}`,
        role: 'FARMER',
        emailVerified: true,
        emailVerifiedAt: randomDate(365, 30),
        phoneVerified: Math.random() > 0.2,
        phoneVerifiedAt: Math.random() > 0.2 ? randomDate(365, 30) : null,
        lastLoginAt: randomDate(7, 0),
        loginCount: randomInt(5, 50),
      },
    });

    farmers.push(farmer);
    if ((i + 1) % 10 === 0) {
      log(`  Created ${i + 1}/${CONFIG.FARMS_COUNT} farmers`);
    }
  }
  console.log(`  ✅ Created ${farmers.length} farmers\n`);

  // ========================================================================
  // CREATE CONSUMERS
  // ========================================================================
  console.log(`🛒 Creating ${CONFIG.CONSUMERS_COUNT} consumers...`);
  const consumers = [];

  for (let i = 0; i < CONFIG.CONSUMERS_COUNT; i++) {
    const firstName = randomElement(FARM_OWNER_FIRST_NAMES);
    const lastName = randomElement(FARM_OWNER_LAST_NAMES);
    const email = `customer${i}@example.com`;

    const consumer = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: `+1555${2000 + i}`,
        role: 'CUSTOMER',
        emailVerified: true,
        emailVerifiedAt: randomDate(180, 10),
        phoneVerified: Math.random() > 0.3,
        dietaryPreferences: randomElements(['organic', 'local', 'gluten-free', 'vegetarian'], randomInt(0, 2)),
      },
    });

    consumers.push(consumer);
  }
  console.log(`  ✅ Created ${consumers.length} consumers\n`);

  // ========================================================================
  // CREATE FARMS
  // ========================================================================
  console.log(`🚜 Creating ${CONFIG.FARMS_COUNT} farms...`);
  const farms = [];

  for (let i = 0; i < CONFIG.FARMS_COUNT; i++) {
    const farmName = `${randomElement(FARM_NAME_PREFIXES)} ${randomElement(FARM_NAME_SUFFIXES)}`;
    const city = randomElement(OREGON_CITIES);
    const farmer = farmers[i]!;
    const farmSize = randomInt(5, 100);
    const practices = randomElements(FARMING_PRACTICES, randomInt(2, 4));
    const categories = randomElements(PRODUCT_CATEGORIES, randomInt(1, 3));

    const isOrganic = practices.includes('organic') || practices.includes('biodynamic');
    const createdDate = randomDate(1800, 30);

    const farm = await prisma.farm.create({
      data: {
        ownerId: farmer.id,
        name: farmName,
        slug: generateSlug(farmName) + `-${i}`,
        description: `${isOrganic ? 'Certified organic' : 'Sustainably grown'} ${categories[0]?.toLowerCase()} from our ${farmSize}-acre farm. ${practices.join(', ')} practices.`,
        story: `${farmer.firstName} ${farmer.lastName} started ${farmName} with a passion for ${practices.includes('regenerative') ? 'regenerative agriculture' : 'sustainable farming'}. Located in ${city.name}, Oregon, we've been ${practices.includes('organic') ? 'certified organic since 2015' : 'farming sustainably for over a decade'}. Our ${farmSize} acres produce some of the finest ${categories[0]?.toLowerCase()} in the region. We believe in growing food that nourishes both people and planet, using ${practices.slice(0, 2).join(' and ')} methods.`,
        email: `contact@${generateSlug(farmName)}.farm`,
        phone: `+1555${3000 + i}`,
        address: `${randomInt(100, 9999)} ${randomElement(['Farm', 'Ranch', 'Country', 'Harvest', 'Valley'])} ${randomElement(['Road', 'Lane', 'Drive', 'Way
