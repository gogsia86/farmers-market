/**
 * 🇭🇷 CROATIAN FARMERS MARKET SEED DATA
 *
 * Comprehensive seed script for Croatian agricultural market platform
 * - 50+ authentic Croatian OPG (Obiteljsko Poljoprivredno Gospodarstvo) farms
 * - 200+ traditional Croatian agricultural products
 * - Real Croatian regions: Slavonija, Baranja, Dalmatia, Istria, Zagorje
 * - Authentic Croatian farming practices and certifications
 * - Croatian market photos and farm images
 *
 * Usage:
 *   npm run db:seed:croatian
 *   tsx scripts/seed-croatian-market.ts
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
      { name: "Buzet", zip: "52420", lat: 45.4081, lng: 13.9683 },
    ],
    description: "Istra - poznata po tartufima, maslinovom ulju i vinu",
  },
  ZAGORJE: {
    name: "Hrvatsko Zagorje",
    cities: [
      { name: "Krapina", zip: "49000", lat: 46.1603, lng: 15.8794 },
      { name: "Zabok", zip: "49210", lat: 46.0297, lng: 15.9089 },
      { name: "Pregrada", zip: "49218", lat: 46.1653, lng: 15.7494 },
      { name: "Zlatar", zip: "49250", lat: 46.0894, lng: 16.075 },
    ],
    description:
      "Zagorje - brežuljkasta poljoprivreda, tradicionalni proizvodi",
  },
  ZAGREB: {
    name: "Zagrebačka županija",
    cities: [
      { name: "Zagreb", zip: "10000", lat: 45.815, lng: 15.9819 },
      { name: "Velika Gorica", zip: "10410", lat: 45.7125, lng: 16.0758 },
      { name: "Samobor", zip: "10430", lat: 45.8028, lng: 15.7178 },
      { name: "Jastrebarsko", zip: "10450", lat: 45.6681, lng: 15.6503 },
    ],
    description:
      "Zagrebačka regija - povrćarstvo, voćarstvo, blizina glavnog grada",
  },
};

// ============================================================================
// CROATIAN PRODUCT CATEGORIES
// ============================================================================

const CROATIAN_PRODUCTS = {
  VEGETABLES: [
    {
      name: "Rajčica",
      name_en: "Tomato",
      unit: "kg",
      price: [3.5, 6.0],
      seasonal: [4, 10],
    },
    {
      name: "Paprika",
      name_en: "Bell Pepper",
      unit: "kg",
      price: [4.0, 7.0],
      seasonal: [6, 10],
    },
    {
      name: "Krastavac",
      name_en: "Cucumber",
      unit: "kg",
      price: [2.5, 5.0],
      seasonal: [5, 9],
    },
    {
      name: "Kupus",
      name_en: "Cabbage",
      unit: "kg",
      price: [2.0, 4.0],
      seasonal: [9, 3],
    },
    {
      name: "Kelj",
      name_en: "Kale",
      unit: "kg",
      price: [3.0, 5.5],
      seasonal: [10, 4],
    },
    {
      name: "Blitva",
      name_en: "Swiss Chard",
      unit: "kg",
      price: [3.5, 6.0],
      seasonal: [4, 11],
    },
    {
      name: "Salata",
      name_en: "Lettuce",
      unit: "kom",
      price: [2.0, 4.0],
      seasonal: [4, 10],
    },
    {
      name: "Cikla",
      name_en: "Beetroot",
      unit: "kg",
      price: [2.5, 4.5],
      seasonal: [6, 11],
    },
    {
      name: "Mrkva",
      name_en: "Carrot",
      unit: "kg",
      price: [2.0, 4.0],
      seasonal: null,
    },
    {
      name: "Luk",
      name_en: "Onion",
      unit: "kg",
      price: [2.5, 5.0],
      seasonal: null,
    },
    {
      name: "Češnjak",
      name_en: "Garlic",
      unit: "kg",
      price: [15.0, 25.0],
      seasonal: [6, 8],
    },
    {
      name: "Krumpir",
      name_en: "Potato",
      unit: "kg",
      price: [2.0, 4.0],
      seasonal: null,
    },
    {
      name: "Patlidžan",
      name_en: "Eggplant",
      unit: "kg",
      price: [4.0, 7.0],
      seasonal: [6, 10],
    },
    {
      name: "Tikvice",
      name_en: "Zucchini",
      unit: "kg",
      price: [3.0, 6.0],
      seasonal: [5, 10],
    },
    {
      name: "Bundeva",
      name_en: "Pumpkin",
      unit: "kg",
      price: [2.5, 5.0],
      seasonal: [9, 11],
    },
    {
      name: "Grašak",
      name_en: "Peas",
      unit: "kg",
      price: [5.0, 8.0],
      seasonal: [5, 7],
    },
    {
      name: "Mahune",
      name_en: "Green Beans",
      unit: "kg",
      price: [4.0, 7.0],
      seasonal: [6, 9],
    },
    {
      name: "Spanać",
      name_en: "Spinach",
      unit: "kg",
      price: [3.5, 6.0],
      seasonal: [3, 5],
    },
    {
      name: "Raštika",
      name_en: "Turnip Greens",
      unit: "kg",
      price: [3.0, 5.0],
      seasonal: [10, 3],
    },
    {
      name: "Hren",
      name_en: "Horseradish",
      unit: "kg",
      price: [8.0, 12.0],
      seasonal: [10, 2],
    },
  ],
  FRUITS: [
    {
      name: "Jabuka",
      name_en: "Apple",
      unit: "kg",
      price: [3.0, 6.0],
      seasonal: [8, 11],
    },
    {
      name: "Kruška",
      name_en: "Pear",
      unit: "kg",
      price: [3.5, 6.5],
      seasonal: [8, 10],
    },
    {
      name: "Šljiva",
      name_en: "Plum",
      unit: "kg",
      price: [4.0, 7.0],
      seasonal: [7, 9],
    },
    {
      name: "Breskva",
      name_en: "Peach",
      unit: "kg",
      price: [5.0, 8.0],
      seasonal: [6, 8],
    },
    {
      name: "Marelica",
      name_en: "Apricot",
      unit: "kg",
      price: [6.0, 10.0],
      seasonal: [6, 7],
    },
    {
      name: "Trešnja",
      name_en: "Cherry",
      unit: "kg",
      price: [10.0, 15.0],
      seasonal: [5, 6],
    },
    {
      name: "Višnja",
      name_en: "Sour Cherry",
      unit: "kg",
      price: [8.0, 12.0],
      seasonal: [6, 7],
    },
    {
      name: "Jagoda",
      name_en: "Strawberry",
      unit: "kg",
      price: [10.0, 18.0],
      seasonal: [5, 6],
    },
    {
      name: "Malina",
      name_en: "Raspberry",
      unit: "kg",
      price: [15.0, 25.0],
      seasonal: [6, 8],
    },
    {
      name: "Kupina",
      name_en: "Blackberry",
      unit: "kg",
      price: [12.0, 20.0],
      seasonal: [7, 8],
    },
    {
      name: "Borovnica",
      name_en: "Blueberry",
      unit: "kg",
      price: [18.0, 30.0],
      seasonal: [6, 8],
    },
    {
      name: "Lubenica",
      name_en: "Watermelon",
      unit: "kg",
      price: [1.5, 3.0],
      seasonal: [6, 9],
    },
    {
      name: "Dinja",
      name_en: "Melon",
      unit: "kg",
      price: [2.0, 4.0],
      seasonal: [6, 9],
    },
    {
      name: "Smokva",
      name_en: "Fig",
      unit: "kg",
      price: [8.0, 15.0],
      seasonal: [8, 10],
    },
    {
      name: "Grožđe",
      name_en: "Grapes",
      unit: "kg",
      price: [6.0, 12.0],
      seasonal: [8, 10],
    },
  ],
  DAIRY_EGGS: [
    {
      name: "Svježa jaja",
      name_en: "Fresh Eggs",
      unit: "kom",
      price: [2.5, 4.0],
      seasonal: null,
    },
    {
      name: "Ekološka jaja",
      name_en: "Organic Eggs",
      unit: "kom",
      price: [3.5, 5.0],
      seasonal: null,
    },
    {
      name: "Svježi sir",
      name_en: "Fresh Cheese",
      unit: "kg",
      price: [25.0, 40.0],
      seasonal: null,
    },
    {
      name: "Kozji sir",
      name_en: "Goat Cheese",
      unit: "kg",
      price: [40.0, 60.0],
      seasonal: null,
    },
    {
      name: "Paški sir",
      name_en: "Pag Cheese",
      unit: "kg",
      price: [80.0, 120.0],
      seasonal: null,
    },
    {
      name: "Svježe mlijeko",
      name_en: "Fresh Milk",
      unit: "l",
      price: [5.0, 8.0],
      seasonal: null,
    },
    {
      name: "Pavlaka",
      name_en: "Sour Cream",
      unit: "kg",
      price: [15.0, 25.0],
      seasonal: null,
    },
    {
      name: "Kajmak",
      name_en: "Kajmak",
      unit: "kg",
      price: [35.0, 50.0],
      seasonal: null,
    },
  ],
  MEAT_POULTRY: [
    {
      name: "Pileće meso",
      name_en: "Chicken Meat",
      unit: "kg",
      price: [35.0, 50.0],
      seasonal: null,
    },
    {
      name: "Puretina",
      name_en: "Turkey",
      unit: "kg",
      price: [40.0, 60.0],
      seasonal: null,
    },
    {
      name: "Svinjetina",
      name_en: "Pork",
      unit: "kg",
      price: [35.0, 55.0],
      seasonal: null,
    },
    {
      name: "Janjetina",
      name_en: "Lamb",
      unit: "kg",
      price: [60.0, 90.0],
      seasonal: [3, 5],
    },
    {
      name: "Teletina",
      name_en: "Veal",
      unit: "kg",
      price: [70.0, 100.0],
      seasonal: null,
    },
  ],
  HERBS_SPICES: [
    {
      name: "Peršin",
      name_en: "Parsley",
      unit: "svežanj",
      price: [2.0, 4.0],
      seasonal: null,
    },
    {
      name: "Bosiljak",
      name_en: "Basil",
      unit: "svežanj",
      price: [3.0, 5.0],
      seasonal: [5, 9],
    },
    {
      name: "Ružmarin",
      name_en: "Rosemary",
      unit: "svežanj",
      price: [3.0, 5.0],
      seasonal: null,
    },
    {
      name: "Kadulja",
      name_en: "Sage",
      unit: "svežanj",
      price: [3.0, 5.0],
      seasonal: null,
    },
    {
      name: "Origano",
      name_en: "Oregano",
      unit: "svežanj",
      price: [3.0, 5.0],
      seasonal: [6, 9],
    },
    {
      name: "Vlašac",
      name_en: "Dill",
      unit: "svežanj",
      price: [2.5, 4.0],
      seasonal: [5, 9],
    },
    {
      name: "Kopar",
      name_en: "Fennel",
      unit: "svežanj",
      price: [3.0, 5.0],
      seasonal: [6, 9],
    },
    {
      name: "Lavanda",
      name_en: "Lavender",
      unit: "svežanj",
      price: [5.0, 10.0],
      seasonal: [6, 8],
    },
  ],
  HONEY_PRODUCTS: [
    {
      name: "Bagremov med",
      name_en: "Acacia Honey",
      unit: "kg",
      price: [50.0, 80.0],
      seasonal: null,
    },
    {
      name: "Livadski med",
      name_en: "Meadow Honey",
      unit: "kg",
      price: [45.0, 70.0],
      seasonal: null,
    },
    {
      name: "Kaštanov med",
      name_en: "Chestnut Honey",
      unit: "kg",
      price: [55.0, 85.0],
      seasonal: null,
    },
    {
      name: "Propolis",
      name_en: "Propolis",
      unit: "kom",
      price: [30.0, 50.0],
      seasonal: null,
    },
    {
      name: "Pčelinji vosak",
      name_en: "Beeswax",
      unit: "kg",
      price: [80.0, 120.0],
      seasonal: null,
    },
  ],
  OILS_PRESERVES: [
    {
      name: "Maslinovo ulje",
      name_en: "Olive Oil",
      unit: "l",
      price: [80.0, 150.0],
      seasonal: null,
    },
    {
      name: "Bundevo ulje",
      name_en: "Pumpkin Seed Oil",
      unit: "l",
      price: [100.0, 180.0],
      seasonal: null,
    },
    {
      name: "Ajvar",
      name_en: "Ajvar",
      unit: "kg",
      price: [25.0, 40.0],
      seasonal: [9, 11],
    },
    {
      name: "Pekmez",
      name_en: "Fruit Jam",
      unit: "kg",
      price: [20.0, 35.0],
      seasonal: null,
    },
    {
      name: "Kiseli krastavci",
      name_en: "Pickled Cucumbers",
      unit: "kg",
      price: [15.0, 25.0],
      seasonal: [8, 10],
    },
    {
      name: "Turšija",
      name_en: "Mixed Pickles",
      unit: "kg",
      price: [20.0, 35.0],
      seasonal: [9, 11],
    },
  ],
};

// ============================================================================
// CROATIAN FARM NAMES & DATA
// ============================================================================

const CROATIAN_FARM_DATA = [
  // SLAVONIJA FARMS
  {
    region: "SLAVONIJA",
    name: "OPG Horvat",
    owner: {
      firstName: "Marko",
      lastName: "Horvat",
      email: "marko.horvat@opg.hr",
    },
    description:
      "Obiteljsko gospodarstvo s tradicijom od 3 generacije. Specijalizirani smo za ekološku proizvodnju povrća.",
    practices: ["ekološka", "regenerativna", "tradicionalna"],
    size: 12.5,
    products: ["VEGETABLES", "FRUITS"],
  },
  {
    region: "SLAVONIJA",
    name: "OPG Kovačević",
    owner: {
      firstName: "Ivana",
      lastName: "Kovačević",
      email: "ivana.kovacevic@opg.hr",
    },
    description:
      "Voćarsko-vinogradarski OPG u srcu Slavonije. Proizvodimo kvalitetno grožđe i voće.",
    practices: ["integrirana", "održiva"],
    size: 8.0,
    products: ["FRUITS"],
  },
  {
    region: "SLAVONIJA",
    name: "OPG Babić",
    owner: {
      firstName: "Tomislav",
      lastName: "Babić",
      email: "tomislav.babic@opg.hr",
    },
    description:
      "Stočarska proizvodnja s naglaskom na dobrobit životinja. Proizvodimo svježe mlijeko i mliječne proizvode.",
    practices: ["slobodan-uzgoj", "tradicionalna"],
    size: 20.0,
    products: ["DAIRY_EGGS", "MEAT_POULTRY"],
  },
  {
    region: "SLAVONIJA",
    name: "OPG Novak",
    owner: { firstName: "Ana", lastName: "Novak", email: "ana.novak@opg.hr" },
    description:
      "Ekološki uzgoj povrća i bobičastog voća. Certificirani ekološki proizvođač.",
    practices: ["ekološka", "permakultura"],
    size: 6.5,
    products: ["VEGETABLES", "FRUITS"],
  },
  {
    region: "SLAVONIJA",
    name: "OPG Jurić",
    owner: {
      firstName: "Petar",
      lastName: "Jurić",
      email: "petar.juric@opg.hr",
    },
    description:
      "Pčelarstvo i proizvodnja meda već 40 godina. Kvalitetan slavonski med.",
    practices: ["tradicionalna", "ekološka"],
    size: 2.0,
    products: ["HONEY_PRODUCTS"],
  },

  // BARANJA FARMS
  {
    region: "BARANJA",
    name: "OPG Knežević",
    owner: {
      firstName: "Mladen",
      lastName: "Knežević",
      email: "mladen.knezevic@opg.hr",
    },
    description:
      "Ribogojilište i ekološka proizvodnja povrća u Baranji. Tradicionalni ribnjački uzgoj.",
    practices: ["ekološka", "akvakultura"],
    size: 15.0,
    products: ["VEGETABLES"],
  },
  {
    region: "BARANJA",
    name: "OPG Maras",
    owner: {
      firstName: "Sandra",
      lastName: "Maras",
      email: "sandra.maras@opg.hr",
    },
    description:
      "Vinogradarstvo i vinarstvo. Proizvodimo kvalitetna vina baranjske regije.",
    practices: ["integrirana", "održiva"],
    size: 10.0,
    products: ["FRUITS"],
  },
  {
    region: "BARANJA",
    name: "OPG Biljetina",
    owner: {
      firstName: "Nikola",
      lastName: "Biljetina",
      email: "nikola.biljetina@opg.hr",
    },
    description:
      "Ekološka proizvodnja žitarica i stočarska proizvodnja. Autohtone pasmine.",
    practices: ["ekološka", "tradicionalna"],
    size: 25.0,
    products: ["MEAT_POULTRY", "DAIRY_EGGS"],
  },

  // DALMACIJA FARMS
  {
    region: "DALMACIJA",
    name: "OPG Perić",
    owner: { firstName: "Ante", lastName: "Perić", email: "ante.peric@opg.hr" },
    description:
      "Maslinarstvo i proizvodnja ekstra djevičanskog maslinovog ulja. Tradicionalne sorte maslina.",
    practices: ["ekološka", "tradicionalna"],
    size: 5.5,
    products: ["OILS_PRESERVES"],
  },
  {
    region: "DALMACIJA",
    name: "OPG Marković",
    owner: {
      firstName: "Duje",
      lastName: "Marković",
      email: "duje.markovic@opg.hr",
    },
    description:
      "Mediteransko povrće i autohtone sorte rajčice. Ekološki certificirani OPG.",
    practices: ["ekološka", "mediteranska"],
    size: 4.0,
    products: ["VEGETABLES"],
  },
  {
    region: "DALMACIJA",
    name: "OPG Tudor",
    owner: {
      firstName: "Marija",
      lastName: "Tudor",
      email: "marija.tudor@opg.hr",
    },
    description:
      "Ljekovito i aromatično bilje. Lavanda, kadulja, ružmarin s otoka Hvara.",
    practices: ["ekološka", "biodynamička"],
    size: 3.5,
    products: ["HERBS_SPICES"],
  },
  {
    region: "DALMACIJA",
    name: "OPG Radić",
    owner: { firstName: "Ivan", lastName: "Radić", email: "ivan.radic@opg.hr" },
    description:
      "Voćarstvo i vinogradarstvo u Dalmatinskoj zagori. Autohtone sorte grožđa.",
    practices: ["tradicionalna", "integrirana"],
    size: 8.5,
    products: ["FRUITS"],
  },

  // ISTRA FARMS
  {
    region: "ISTRA",
    name: "OPG Matijašić",
    owner: {
      firstName: "Bruno",
      lastName: "Matijašić",
      email: "bruno.matijasic@opg.hr",
    },
    description:
      "Tartufarski centar i ekološko maslinarstvo. Lovimo bijele i crne tartufe.",
    practices: ["ekološka", "tradicionalna"],
    size: 6.0,
    products: ["OILS_PRESERVES"],
  },
  {
    region: "ISTRA",
    name: "OPG Buršić",
    owner: {
      firstName: "Sonja",
      lastName: "Buršić",
      email: "sonja.bursic@opg.hr",
    },
    description:
      "Ekološko vinogradarstvo i proizvodnja vrhunskog vina. Istarski malvazija.",
    practices: ["ekološka", "biodynamička"],
    size: 7.5,
    products: ["FRUITS"],
  },
  {
    region: "ISTRA",
    name: "OPG Kocijančić",
    owner: {
      firstName: "Damir",
      lastName: "Kocijančić",
      email: "damir.kocijancic@opg.hr",
    },
    description:
      "Ekološka pčela, lavanda i aromatično bilje. Istarsko pčelarstvo.",
    practices: ["ekološka"],
    size: 4.5,
    products: ["HONEY_PRODUCTS", "HERBS_SPICES"],
  },

  // ZAGORJE FARMS
  {
    region: "ZAGORJE",
    name: "OPG Grgić",
    owner: {
      firstName: "Stjepan",
      lastName: "Grgić",
      email: "stjepan.grgic@opg.hr",
    },
    description:
      "Tradicionalna zagorska proizvodnja povrća i voća. Organski uzgoj.",
    practices: ["ekološka", "tradicionalna"],
    size: 5.0,
    products: ["VEGETABLES", "FRUITS"],
  },
  {
    region: "ZAGORJE",
    name: "OPG Štrok",
    owner: {
      firstName: "Mirela",
      lastName: "Štrok",
      email: "mirela.strok@opg.hr",
    },
    description:
      "Ekološki uzgoj jagoda, malina i kupina. Bobičasto voće vrhunske kvalitete.",
    practices: ["ekološka", "integrirana"],
    size: 3.5,
    products: ["FRUITS"],
  },
  {
    region: "ZAGORJE",
    name: "OPG Hrženjak",
    owner: {
      firstName: "Josip",
      lastName: "Hrženjak",
      email: "josip.hrzenjak@opg.hr",
    },
    description:
      "Stočarska proizvodnja i mliječni proizvodi. Svježe mlijeko i sirevi.",
    practices: ["tradicionalna", "slobodan-uzgoj"],
    size: 12.0,
    products: ["DAIRY_EGGS", "MEAT_POULTRY"],
  },

  // ZAGREB REGION FARMS
  {
    region: "ZAGREB",
    name: "OPG Veselić",
    owner: {
      firstName: "Tomislav",
      lastName: "Veselić",
      email: "tomislav.veselic@opg.hr",
    },
    description:
      "Ekološka proizvodnja povrća i voća. Certificirani ekološki OPG.",
    practices: ["ekološka", "regenerativna"],
    size: 8.0,
    products: ["VEGETABLES", "FRUITS"],
  },
  {
    region: "ZAGREB",
    name: "OPG Milović",
    owner: {
      firstName: "Nada",
      lastName: "Milović",
      email: "nada.milovic@opg.hr",
    },
    description:
      "Korijenasto povrće, kupusnjače i krumpir. Ekološka proizvodnja.",
    practices: ["ekološka", "tradicionalna"],
    size: 6.5,
    products: ["VEGETABLES"],
  },
  {
    region: "ZAGREB",
    name: "OPG Budrovčan",
    owner: {
      firstName: "Ivica",
      lastName: "Budrovčan",
      email: "ivica.budrovcan@opg.hr",
    },
    description:
      "Zatvoreni ekološki sustav - uzgoj biljaka i životinja. Svježi proizvodi.",
    practices: ["ekološka", "regenerativna"],
    size: 10.0,
    products: ["VEGETABLES", "DAIRY_EGGS"],
  },
];

// Generate additional 30 farms to reach 50+
const additionalFarmNames = [
  "Petković",
  "Šimić",
  "Kranjc",
  "Vidović",
  "Bunčić",
  "Gedžić",
  "Orlić",
  "Caratan",
  "Tonković",
  "Munjas",
  "Dabić",
  "Brdar",
  "Stojaković",
  "Prelec",
  "Salopek",
  "Tandarić",
  "Jakara",
  "Maserko",
  "Murseli",
  "Podoreški",
  "Kartalija",
  "Čačilo",
  "Belavić",
  "Rizman",
  "Glas",
  "Forjan",
  "Bačani",
  "Hazelka",
  "Prđun",
  "Anić",
];

additionalFarmNames.forEach((lastName, idx) => {
  const region = randomElement(
    Object.keys(CROATIAN_REGIONS),
  ) as keyof typeof CROATIAN_REGIONS;
  const firstName = randomElement([
    "Ana",
    "Marko",
    "Ivan",
    "Marija",
    "Petar",
    "Ivana",
    "Tomislav",
    "Kata",
    "Josip",
    "Sandra",
  ]);

  CROATIAN_FARM_DATA.push({
    region,
    name: `OPG ${lastName}`,
    owner: {
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@opg.hr`,
    },
    description: `Obiteljsko poljoprivredno gospodarstvo s tradicijom. Uzgajamo kvalitetne proizvode po načelima održive poljoprivrede.`,
    practices: randomElement([
      ["ekološka", "tradicionalna"],
      ["integrirana", "održiva"],
      ["ekološka", "regenerativna"],
      ["tradicionalna"],
    ]),
    size: randomInt(3, 20) + Math.random() * 0.9,
    products: [
      randomElement([
        "VEGETABLES",
        "FRUITS",
        "DAIRY_EGGS",
        "MEAT_POULTRY",
        "HONEY_PRODUCTS",
      ]),
    ],
  });
});

// ============================================================================
// CROATIAN MARKET PHOTO URLs
// ============================================================================

const CROATIAN_MARKET_PHOTOS = [
  "https://www.farmeraj.hr/images/news/farmeraj-novi-veleprodajni-centar-za-svjeze-voce-i-povrce.jpg",
  "https://croatiawise.com/wp-content/uploads/2017/05/Croatian-farmer-markets-450x253.jpg",
  "https://www.croatiaweek.com/wp-content/uploads/2018/06/preview_dolac-kumice-25-m-vrdoljak-5953785425ef2.jpg",
  "https://www.croatiaweek.com/wp-content/uploads/2022/04/zagreb-farmers-markets-croatia.jpg",
  "https://travelphotodiscovery.com/wp-content/uploads/2014/03/Split-30.jpg",
  "https://i0.wp.com/www.expatincroatia.com/wp-content/uploads/2014/03/split-pazar-farmers-market.jpg",
  "https://www.trznice-zg.hr/UserDocsImages/Aktualnosti/Placemarket/Placemarket1.JPG",
  "https://cdn.agroklub.com/upload/images/text/thumb/trznica-osijek-9-mj-41-880x495.jpg",
  "https://foodperestroika.com/wp-content/uploads/2020/08/ZadarMarket1-small.jpg",
  "https://www.visitzagreb.hr/wp-content/uploads/2016/07/Dolac-Market-800x500.jpg",
  "https://i0.wp.com/askan.biz/wp-content/uploads/2015/01/Kvatric_Market_Zagreb_12.jpg",
  "https://i1.wp.com/foodperestroika.com/wp-content/uploads/2020/09/Dolac6-small.jpg",
  "https://www.zgh.hr/UserDocsImages//galerije/trznice-zg/P4132418_web.JPG",
  "https://www.zagreb.info/wp-content/uploads/2025/07/dolac_jesen1-191011.jpg",
  "https://foodperestroika.com/wp-content/uploads/2020/08/ZadarMarket17-featured-1920x1282.jpg",
  "https://www.totraveltoo.com/wp-content/uploads/2015/04/P1140966.jpg",
  "https://travelhonestly.com/wp-content/uploads/2015/08/Dolac-Just-Zagreb.jpg",
  "https://i1.wp.com/foodperestroika.com/wp-content/uploads/2020/08/ZadarMarket8-small.jpg",
  "https://foodperestroika.com/wp-content/uploads/2020/09/Dolac1-featured-1920x1281.jpg",
  "https://vocarna.hr/wp-content/uploads/naslovna_gotovi_paketi_vocarna.hr_-600x360.jpg",
];

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log("🇭🇷 Starting Croatian Farmers Market Seed...\n");

  // ========================================================================
  // 1. CREATE ADMIN USER
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

  console.log(`✅ Admin created: ${adminUser.email}\n`);

  // ========================================================================
  // 2. CREATE FARMER USERS & FARMS
  // ========================================================================
  console.log("🚜 Creating Croatian OPG farmers and farms...");

  const farmsCreated = [];

  for (const farmData of CROATIAN_FARM_DATA) {
    const regionData =
      CROATIAN_REGIONS[farmData.region as keyof typeof CROATIAN_REGIONS];
    const city = randomElement(regionData.cities);

    // Create farmer user
    const farmer = await prisma.user.create({
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

    // Create farm
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

    farmsCreated.push(farm);

    // Add farm photos
    const photoUrl = randomElement(CROATIAN_MARKET_PHOTOS);
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

    console.log(`  ✅ ${farm.name} (${city.name})`);
  }

  console.log(`\n✅ Created ${farmsCreated.length} Croatian OPG farms\n`);

  // ========================================================================
  // 3. CREATE CERTIFICATIONS
  // ========================================================================
  console.log("📜 Creating farm certifications...");

  const ekoCertificationCount = Math.floor(farmsCreated.length * 0.4); // 40% eko
  for (let i = 0; i < ekoCertificationCount; i++) {
    const farm = farmsCreated[i]!;
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
  }

  console.log(`✅ Created ${ekoCertificationCount} organic certifications\n`);

  // ========================================================================
  // 4. CREATE PRODUCTS
  // ========================================================================
  console.log("🥬 Creating Croatian products...");

  let totalProducts = 0;

  for (const farm of farmsCreated) {
    const productCategories = farm.productCategories as string[];
    const numProducts = randomInt(3, 8);

    for (let i = 0; i < numProducts; i++) {
      const category = randomElement(productCategories);
      const categoryProducts =
        CROATIAN_PRODUCTS[category as keyof typeof CROATIAN_PRODUCTS];

      if (!categoryProducts || categoryProducts.length === 0) continue;

      const productData = randomElement(categoryProducts as any[]);
      const [minPrice, maxPrice] = productData.price;
      const price = minPrice + Math.random() * (maxPrice - minPrice);

      const seasonal = productData.seasonal;
      let seasonalStart = null;
      let seasonalEnd = null;

      if (seasonal) {
        seasonalStart = seasonal[0];
        seasonalEnd = seasonal[1];
      }

      const isOrganic =
        farm.farmingPractices?.includes("ekološka") || Math.random() > 0.7;

      await prisma.product.create({
        data: {
          farmId: farm.id,
          name: productData.name,
          slug: generateSlug(`${productData.name}-${farm.slug}`),
          description: `Svježi ${productData.name.toLowerCase()} s OPG-a ${farm.name}. ${isOrganic ? "Ekološki uzgojeno." : "Tradicionalni uzgoj."} Proizvod iz ${farm.city}.`,
          category: category,
          status: "PUBLISHED",
          price: new Prisma.Decimal(price.toFixed(2)),
          unit: productData.unit,
          trackInventory: true,
          quantityAvailable: randomInt(50, 500),
          lowStockThreshold: 10,
          organic: isOrganic,
          seasonal: seasonal !== null,
          seasonalStart,
          seasonalEnd,
          primaryPhotoUrl: randomElement(CROATIAN_MARKET_PHOTOS),
          tags: [
            "hrvatski",
            "lokalno",
            farm.city.toLowerCase(),
            isOrganic ? "ekološki" : "tradicionalno",
            ...(farm.farmingPractices as string[]),
          ],
          publishedAt: randomDate(new Date("2024-01-01"), new Date()),
        },
      });

      totalProducts++;
    }
  }

  console.log(`✅ Created ${totalProducts} Croatian products\n`);

  // ========================================================================
  // 5. CREATE CONSUMER USERS
  // ========================================================================
  console.log("👥 Creating consumer users...");

  const consumerData = [
    {
      firstName: "Marija",
      lastName: "Kovač",
      email: "marija.kovac@gmail.com",
      city: "Zagreb",
    },
    {
      firstName: "Ivan",
      lastName: "Jurić",
      email: "ivan.juric@gmail.com",
      city: "Split",
    },
    {
      firstName: "Ana",
      lastName: "Horvat",
      email: "ana.horvat@gmail.com",
      city: "Osijek",
    },
    {
      firstName: "Petar",
      lastName: "Novak",
      email: "petar.novak@gmail.com",
      city: "Rijeka",
    },
    {
      firstName: "Kata",
      lastName: "Babić",
      email: "kata.babic@gmail.com",
      city: "Zadar",
    },
  ];

  const consumers = [];
  for (const consumer of consumerData) {
    const user = await prisma.user.create({
      data: {
        email: consumer.email,
        password: await hashPassword("Consumer123!"),
        firstName: consumer.firstName,
        lastName: consumer.lastName,
        phone: `+38591${randomInt(1000000, 9999999)}`,
        role: "CUSTOMER",
        emailVerified: true,
        emailVerifiedAt: randomDate(new Date("2024-01-01"), new Date()),
        phoneVerified: true,
        phoneVerifiedAt: randomDate(new Date("2024-01-01"), new Date()),
        dietaryPreferences: randomElement([
          ["veganski"],
          ["vegetarijanski"],
          ["bezgluten"],
          [],
        ]),
      },
    });

    // Add address
    const regionKey = randomElement(
      Object.keys(CROATIAN_REGIONS),
    ) as keyof typeof CROATIAN_REGIONS;
    const region = CROATIAN_REGIONS[regionKey];
    const city = randomElement(region.cities);

    await prisma.address.create({
      data: {
        userId: user.id,
        type: "DELIVERY",
        label: "Kućna adresa",
        street: `${randomElement(["Ulica", "Trg", "Avenija"])} ${randomInt(1, 100)}`,
        city: city.name,
        state: "HR",
        zipCode: city.zip,
        latitude: new Prisma.Decimal(city.lat),
        longitude: new Prisma.Decimal(city.lng),
        isDefault: true,
      },
    });

    consumers.push(user);
  }

  console.log(`✅ Created ${consumers.length} consumer users\n`);

  // ========================================================================
  // 6. CREATE SAMPLE ORDERS & REVIEWS
  // ========================================================================
  console.log("📦 Creating sample orders and reviews...");

  const products = await prisma.product.findMany({
    take: 50,
    include: { farm: true },
  });

  let orderCount = 0;
  let reviewCount = 0;

  for (const consumer of consumers) {
    const numOrders = randomInt(1, 3);

    for (let i = 0; i < numOrders; i++) {
      const orderProducts = [
        randomElement(products),
        randomElement(products),
        randomElement(products),
      ].filter((p) => p !== undefined);

      const orderItems = orderProducts.map((p) => ({
        productId: p!.id,
        productName: p!.name,
        quantity: randomInt(1, 5),
        unit: p!.unit,
        unitPrice: parseFloat(p!.price.toString()),
        subtotal: parseFloat(p!.price.toString()) * randomInt(1, 5),
      }));

      const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
      const deliveryFee = 5.0;
      const platformFee = subtotal * 0.1;
      const tax = (subtotal + deliveryFee) * 0.25;
      const total = subtotal + deliveryFee + platformFee + tax;

      const order = await prisma.order.create({
        data: {
          orderNumber: `HR-${Date.now()}-${randomInt(1000, 9999)}`,
          customerId: consumer.id,
          farmId: orderProducts[0]!.farmId,
          status: randomElement(["CONFIRMED", "FULFILLED", "COMPLETED"]),
          paymentStatus: "PAID",
          subtotal: new Prisma.Decimal(subtotal),
          deliveryFee: new Prisma.Decimal(deliveryFee),
          platformFee: new Prisma.Decimal(platformFee),
          tax: new Prisma.Decimal(tax),
          total: new Prisma.Decimal(total),
          farmerAmount: new Prisma.Decimal(subtotal * 0.9),
          fulfillmentMethod: randomElement(["DELIVERY", "PICKUP"]),
          scheduledDate: randomDate(new Date("2024-06-01"), new Date()),
          stripePaymentIntentId: `pi_hr_${generateSlug(consumer.email)}_${Date.now()}`,
          createdAt: randomDate(new Date("2024-06-01"), new Date()),
          confirmedAt: randomDate(new Date("2024-06-01"), new Date()),
          fulfilledAt: randomDate(new Date("2024-06-01"), new Date()),
          completedAt: randomDate(new Date("2024-06-01"), new Date()),
          items: {
            createMany: {
              data: orderItems,
            },
          },
        },
      });

      orderCount++;

      // Add review
      if (Math.random() > 0.5) {
        await prisma.review.create({
          data: {
            farmId: orderProducts[0]!.farmId,
            customerId: consumer.id,
            orderId: order.id,
            rating: randomInt(4, 5),
            reviewText: randomElement([
              "Odlični proizvodi! Sve svježe i kvalitetno. Preporučujem!",
              "Vrhunska kvaliteta, brza dostava. Zadovoljna sam kupnjom.",
              "Lokalni proizvođač, ekološki uzgoj. Sve pohvale!",
              "Izvrsno iskustvo. Proizvodi kao s bake iz vrta.",
              "Kvaliteta kakvu očekujem od hrvatskog OPG-a. Top!",
            ]),
            isVerifiedPurchase: true,
            status: "APPROVED",
            helpfulCount: randomInt(0, 10),
          },
        });
        reviewCount++;
      }
    }
  }

  console.log(`✅ Created ${orderCount} orders`);
  console.log(`✅ Created ${reviewCount} reviews\n`);

  // ========================================================================
  // FINAL SUMMARY
  // ========================================================================
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🎉 CROATIAN FARMERS MARKET SEED COMPLETE!");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`\n📊 Summary:`);
  console.log(`   👤 Admin: 1`);
  console.log(`   🚜 OPG Farms: ${farmsCreated.length}`);
  console.log(`   🥬 Products: ${totalProducts}`);
  console.log(`   📜 Certifications: ${ekoCertificationCount}`);
  console.log(`   👥 Consumers: ${consumers.length}`);
  console.log(`   📦 Orders: ${orderCount}`);
  console.log(`   ⭐ Reviews: ${reviewCount}`);
  console.log(`\n🔐 Login Credentials:`);
  console.log(`   Admin: admin@hrvatski-tržnice.hr / Admin123!`);
  console.log(`   Sample Farmer: ${farmsCreated[0]?.email} / Farmer123!`);
  console.log(`   Sample Consumer: ${consumers[0]?.email} / Consumer123!`);
  console.log(`\n🇭🇷 Croatian regions covered:`);
  console.log(`   - Slavonija (Osijek, Vukovar, Đakovo...)`);
  console.log(`   - Baranja (Beli Manastir, Draž...)`);
  console.log(`   - Dalmacija (Split, Zadar, Šibenik...)`);
  console.log(`   - Istra (Pula, Rovinj, Poreč...)`);
  console.log(`   - Zagorje (Krapina, Zabok...)`);
  console.log(`   - Zagreb region`);
  console.log(`\n✅ Database ready for Croatian farmers market platform!`);
  console.log("═══════════════════════════════════════════════════════════\n");
}

// ============================================================================
// EXECUTE
// ============================================================================

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
