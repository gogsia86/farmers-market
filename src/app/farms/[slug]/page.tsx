/**
 * 🌾 FARM DETAIL PAGE - DIVINE AGRICULTURAL PROFILE
 *
 * Comprehensive farm profile featuring:
 * - Farm story and about section
 * - Products from this farm
 * - Certifications and farming practices
 * - Contact information
 * - Reviews and ratings
 * - Location and delivery info
 *
 * DIVINE PRINCIPLES:
 * - Agricultural consciousness in every interaction
 * - Holographic component patterns
 * - Quantum data loading
 * - Biodynamic user experience
 */

import { Header } from "@/components/layout/Header";
import {
  ArrowLeft,
  Award,
  Globe,
  Heart,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Shield,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  readonly params: Promise<{
    slug: string;
  }>;
}

// This would normally fetch from API
async function getFarmBySlug(slug: string) {
  // TODO: Replace with actual API call
  // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/farms/${slug}`)

  // Mock data for now - keyed by farm ID to match the listing page links
  const mockFarms: Record<string, any> = {
    "1": {
      id: "1",
      name: "Harvest Moon Farm",
      slug: "harvest-moon-farm",
      tagline: "Certified organic farm for 3 generations",
      description:
        "Certified organic farm specializing in seasonal vegetables and heritage pumpkins. Family-owned for 3 generations.",
      story:
        "For three generations, our family has been dedicated to organic farming practices that honor the land and nourish our community. What began as a small vegetable patch has blossomed into a thriving organic operation specializing in seasonal vegetables and heritage pumpkins.\n\nWe believe in the power of biodiversity and natural farming methods. Our fields rotate through carefully planned crops, and we use companion planting to create a balanced ecosystem. Every pumpkin, every vegetable tells the story of our commitment to quality and sustainability.",
      farmType: "ORGANIC",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      address: "456 Harvest Lane, Portland, OR 97201",
      deliveryRadius: 15,
      farmSize: "75 acres",
      establishedYear: 1952,
      rating: 4.9,
      reviewCount: 127,
      certifications: ["USDA Organic", "Biodynamic"],
      farmingPractices: [
        "Crop rotation",
        "Companion planting",
        "Cover cropping",
        "Integrated pest management",
      ],
      specialties: [
        "Heritage Pumpkins",
        "Seasonal Vegetables",
        "Root Vegetables",
      ],
      email: "contact@harvestmoon.farm",
      phone: "(503) 555-0156",
      website: "https://harvestmoon.farm",
      products: [
        {
          id: "1",
          name: "Heritage Pumpkins",
          description: "Heirloom varieties perfect for cooking and display",
          price: 4.99,
          unit: "lb",
          category: "Vegetables",
          inStock: true,
          image: "🎃",
        },
        {
          id: "2",
          name: "Butternut Squash",
          description: "Sweet, nutty squash for roasting and soups",
          price: 2.99,
          unit: "lb",
          category: "Vegetables",
          inStock: true,
          image: "🥔",
        },
        {
          id: "3",
          name: "Root Vegetable Mix",
          description: "Assorted carrots, parsnips, and turnips",
          price: 5.99,
          unit: "bag",
          category: "Vegetables",
          inStock: true,
          image: "🥕",
        },
        {
          id: "4",
          name: "Fresh Herbs Bundle",
          description: "Rosemary, thyme, and sage",
          price: 6.99,
          unit: "bundle",
          category: "Herbs",
          inStock: true,
          image: "🌿",
        },
      ],
      owner: {
        name: "Sarah Martinez",
        bio: "Third-generation organic farmer",
        joinedYear: 2008,
      },
    },
    "2": {
      id: "2",
      name: "Autumn Ridge Orchard",
      slug: "autumn-ridge-orchard",
      tagline: "Apple orchard with over 20 varieties",
      description:
        "Apple orchard with over 20 varieties. Pick-your-own and fresh cider available daily.",
      story:
        "Our orchard has been producing exceptional apples since 1968. With over 20 varieties ranging from sweet to tart, we offer something for every apple lover. During harvest season, visitors can pick their own apples and enjoy fresh-pressed cider.\n\nWe practice sustainable orchard management, using beneficial insects and natural methods to keep our trees healthy. Our apples are hand-picked at peak ripeness to ensure the best flavor and quality.",
      farmType: "ORGANIC",
      city: "Hillsboro",
      state: "OR",
      zipCode: "97123",
      address: "789 Orchard Road, Hillsboro, OR 97123",
      deliveryRadius: 20,
      farmSize: "45 acres",
      establishedYear: 1968,
      rating: 4.8,
      reviewCount: 89,
      certifications: ["USDA Organic"],
      farmingPractices: [
        "Organic pest control",
        "Beneficial insects",
        "Natural fertilizers",
        "Water conservation",
      ],
      specialties: ["Apples", "Fresh Cider", "Honey"],
      email: "info@autumnridge.com",
      phone: "(503) 555-0189",
      website: "https://autumnridge.com",
      products: [
        {
          id: "1",
          name: "Honeycrisp Apples",
          description: "Sweet, crisp apples perfect for snacking",
          price: 3.99,
          unit: "lb",
          category: "Fruit",
          inStock: true,
          image: "🍎",
        },
        {
          id: "2",
          name: "Fresh Apple Cider",
          description: "Pressed daily from our orchard apples",
          price: 8.99,
          unit: "gallon",
          category: "Beverages",
          inStock: true,
          image: "🥤",
        },
        {
          id: "3",
          name: "Orchard Honey",
          description: "Raw honey from our orchard bees",
          price: 12.99,
          unit: "jar",
          category: "Honey",
          inStock: true,
          image: "🍯",
        },
        {
          id: "4",
          name: "Apple Preserves",
          description: "Homemade apple butter and jam",
          price: 7.99,
          unit: "jar",
          category: "Preserves",
          inStock: true,
          image: "🫙",
        },
      ],
      owner: {
        name: "David Thompson",
        bio: "Second-generation orchard keeper",
        joinedYear: 2012,
      },
    },
    "3": {
      id: "3",
      name: "Green Valley Produce",
      slug: "green-valley-produce",
      tagline: "Sustainable farming with weekly CSA boxes",
      description:
        "Sustainable farm growing seasonal vegetables, with weekly CSA boxes and farm stand.",
      story:
        "Green Valley Produce has been providing fresh, seasonal vegetables to the community since 2005. We specialize in growing a diverse array of vegetables using sustainable practices that protect our soil and water resources.\n\nOur weekly CSA program allows customers to receive a curated selection of the freshest produce directly from our fields. We also operate a farm stand where you can pick up seasonal favorites throughout the growing season.",
      farmType: "SUSTAINABLE",
      city: "Beaverton",
      state: "OR",
      zipCode: "97005",
      address: "321 Valley View Drive, Beaverton, OR 97005",
      deliveryRadius: 10,
      farmSize: "30 acres",
      establishedYear: 2005,
      rating: 4.7,
      reviewCount: 64,
      certifications: ["Sustainable Agriculture"],
      farmingPractices: [
        "Water conservation",
        "Soil health management",
        "Pollinator habitats",
        "Composting",
      ],
      specialties: ["Mixed Vegetables", "Greens", "Tomatoes"],
      email: "hello@greenvalleyproduce.com",
      phone: "(503) 555-0142",
      website: "https://greenvalleyproduce.com",
      products: [
        {
          id: "1",
          name: "CSA Box - Weekly",
          description: "Seasonal vegetable selection, changes weekly",
          price: 35.0,
          unit: "box",
          category: "CSA",
          inStock: true,
          image: "📦",
        },
        {
          id: "2",
          name: "Mixed Greens",
          description: "Lettuce, kale, and chard mix",
          price: 5.99,
          unit: "bag",
          category: "Vegetables",
          inStock: true,
          image: "🥬",
        },
        {
          id: "3",
          name: "Heirloom Tomatoes",
          description: "Colorful, flavorful heirloom varieties",
          price: 4.99,
          unit: "lb",
          category: "Vegetables",
          inStock: true,
          image: "🍅",
        },
        {
          id: "4",
          name: "Bell Peppers",
          description: "Red, yellow, and orange sweet peppers",
          price: 3.99,
          unit: "lb",
          category: "Vegetables",
          inStock: true,
          image: "🫑",
        },
      ],
      owner: {
        name: "Emily Rodriguez",
        bio: "Sustainable agriculture advocate",
        joinedYear: 2011,
      },
    },
    "4": {
      id: "4",
      name: "Maple Leaf Dairy",
      slug: "maple-leaf-dairy",
      tagline: "Artisan dairy from grass-fed cows",
      description:
        "Small family dairy producing artisan cheeses, fresh milk, and butter from grass-fed cows.",
      story:
        "At Maple Leaf Dairy, our grass-fed cows produce rich, flavorful milk that we transform into artisan cheeses, butter, and other dairy products. We believe in treating our animals with respect and providing them with a natural, grass-based diet.\n\nOur small-batch approach allows us to maintain the highest quality standards and create unique flavors that reflect the seasons and our pastures. Every product is crafted with care and attention to detail.",
      farmType: "DAIRY",
      city: "Forest Grove",
      state: "OR",
      zipCode: "97116",
      address: "654 Dairy Lane, Forest Grove, OR 97116",
      deliveryRadius: 25,
      farmSize: "60 acres",
      establishedYear: 1982,
      rating: 4.9,
      reviewCount: 112,
      certifications: ["Grass-Fed", "Animal Welfare Approved"],
      farmingPractices: [
        "Rotational grazing",
        "Grass-fed only",
        "No antibiotics",
        "Humane treatment",
      ],
      specialties: ["Artisan Cheese", "Grass-Fed Dairy", "Butter"],
      email: "contact@mapleleafdairy.com",
      phone: "(503) 555-0178",
      website: "https://mapleleafdairy.com",
      products: [
        {
          id: "1",
          name: "Aged Cheddar",
          description: "Sharp, flavorful cheddar aged 12 months",
          price: 14.99,
          unit: "lb",
          category: "Cheese",
          inStock: true,
          image: "🧀",
        },
        {
          id: "2",
          name: "Whole Milk",
          description: "Fresh, grass-fed whole milk",
          price: 6.99,
          unit: "half gallon",
          category: "Dairy",
          inStock: true,
          image: "🥛",
        },
        {
          id: "3",
          name: "Cultured Butter",
          description: "Rich, creamy European-style butter",
          price: 8.99,
          unit: "lb",
          category: "Dairy",
          inStock: true,
          image: "🧈",
        },
        {
          id: "4",
          name: "Greek Yogurt",
          description: "Thick, creamy Greek-style yogurt",
          price: 5.99,
          unit: "quart",
          category: "Dairy",
          inStock: true,
          image: "🥄",
        },
      ],
      owner: {
        name: "Robert Johnson",
        bio: "Dairy farmer and cheesemaker",
        joinedYear: 2009,
      },
    },
    "5": {
      id: "5",
      name: "Sunset Berry Farm",
      slug: "sunset-berry-farm",
      tagline: "U-pick berries from June to October",
      description:
        "U-pick berry farm with strawberries, blueberries, and seasonal produce from June to October.",
      story:
        "Sunset Berry Farm has been delighting berry lovers since 1995. Our U-pick operation allows families to come enjoy the farm experience while harvesting fresh, ripe berries directly from the plants.\n\nWe grow strawberries, blueberries, and raspberries using organic methods, ensuring that every berry is bursting with natural flavor. Our farm is a favorite destination for summer outings and creating lasting family memories.",
      farmType: "ORGANIC",
      city: "Tigard",
      state: "OR",
      zipCode: "97223",
      address: "987 Berry Lane, Tigard, OR 97223",
      deliveryRadius: 12,
      farmSize: "25 acres",
      establishedYear: 1995,
      rating: 4.6,
      reviewCount: 78,
      certifications: ["USDA Organic"],
      farmingPractices: [
        "Organic cultivation",
        "Drip irrigation",
        "Mulching",
        "Natural weed control",
      ],
      specialties: ["Strawberries", "Blueberries", "Raspberries"],
      email: "upick@sunsetberry.com",
      phone: "(503) 555-0165",
      website: "https://sunsetberry.com",
      products: [
        {
          id: "1",
          name: "Fresh Strawberries",
          description: "Sweet, juicy strawberries",
          price: 5.99,
          unit: "pint",
          category: "Berries",
          inStock: true,
          image: "🍓",
        },
        {
          id: "2",
          name: "Blueberries",
          description: "Plump, antioxidant-rich blueberries",
          price: 6.99,
          unit: "pint",
          category: "Berries",
          inStock: true,
          image: "🫐",
        },
        {
          id: "3",
          name: "Raspberries",
          description: "Delicate, sweet raspberries",
          price: 7.99,
          unit: "pint",
          category: "Berries",
          inStock: true,
          image: "🍇",
        },
        {
          id: "4",
          name: "Mixed Berry Jam",
          description: "Homemade jam from our berries",
          price: 8.99,
          unit: "jar",
          category: "Preserves",
          inStock: true,
          image: "🫙",
        },
      ],
      owner: {
        name: "Lisa Chen",
        bio: "Berry farming specialist",
        joinedYear: 2013,
      },
    },
    "6": {
      id: "6",
      name: "Heritage Grains Collective",
      slug: "heritage-grains-collective",
      tagline: "Ancient grains and specialty flours",
      description:
        "Growing ancient grains and milling flour on-site. Specialty flours and baking mixes available.",
      story:
        "Heritage Grains Collective is dedicated to preserving and promoting ancient grain varieties that have nourished humanity for millennia. We grow heritage wheat, spelt, emmer, and other grains using organic methods, then mill them fresh on our farm.\n\nOur stone-milled flours retain all the nutrition and flavor that modern processing removes. Whether you're a home baker or a professional chef, our specialty flours will elevate your baking to new heights.",
      farmType: "ORGANIC",
      city: "Cornelius",
      state: "OR",
      zipCode: "97113",
      address: "234 Grain Road, Cornelius, OR 97113",
      deliveryRadius: 30,
      farmSize: "120 acres",
      establishedYear: 2008,
      rating: 4.8,
      reviewCount: 45,
      certifications: ["USDA Organic", "Heritage Grain"],
      farmingPractices: [
        "Ancient grain cultivation",
        "Stone milling",
        "Seed saving",
        "Soil regeneration",
      ],
      specialties: ["Heritage Wheat", "Specialty Flours", "Ancient Grains"],
      email: "grains@heritagegrains.coop",
      phone: "(503) 555-0193",
      website: "https://heritagegrains.coop",
      products: [
        {
          id: "1",
          name: "Stone-Ground Whole Wheat Flour",
          description: "Fresh-milled heritage wheat flour",
          price: 8.99,
          unit: "5 lb bag",
          category: "Flour",
          inStock: true,
          image: "🌾",
        },
        {
          id: "2",
          name: "Spelt Flour",
          description: "Nutty, digestible ancient grain flour",
          price: 10.99,
          unit: "5 lb bag",
          category: "Flour",
          inStock: true,
          image: "🌾",
        },
        {
          id: "3",
          name: "Emmer Wheat Berries",
          description: "Whole ancient wheat grains for cooking",
          price: 7.99,
          unit: "2 lb bag",
          category: "Grains",
          inStock: true,
          image: "🌾",
        },
        {
          id: "4",
          name: "Artisan Bread Mix",
          description: "Pre-mixed heritage grain bread blend",
          price: 12.99,
          unit: "mix",
          category: "Baking",
          inStock: true,
          image: "🍞",
        },
      ],
      owner: {
        name: "James Anderson",
        bio: "Heritage grain specialist and miller",
        joinedYear: 2010,
      },
    },
    "sunny-valley-farm": {
      id: "sunny-valley-farm",
      name: "Sunny Valley Organic Farm",
      slug: "sunny-valley-farm",
      tagline: "Growing organic produce with love since 1985",
      description:
        "At Sunny Valley, we're passionate about sustainable farming and providing our community with the freshest, most nutritious organic produce. Our 50-acre farm has been family-owned for three generations.",
      story:
        "Our journey began in 1985 when my grandparents decided to leave the city and pursue their dream of organic farming. What started as a small vegetable garden has grown into a thriving 50-acre farm that serves hundreds of families in our community.\n\nWe practice regenerative agriculture, focusing on soil health and biodiversity. Every season brings new challenges and rewards, but our commitment to organic, sustainable farming has never wavered.",
      farmType: "ORGANIC",
      city: "Sacramento",
      state: "CA",
      zipCode: "95814",
      address: "123 Farm Road, Sacramento, CA 95814",
      deliveryRadius: 25,
      farmSize: "50 acres",
      establishedYear: 1985,
      rating: 4.8,
      reviewCount: 127,
      certifications: ["USDA Organic", "Biodynamic", "Non-GMO"],
      farmingPractices: [
        "No-till farming",
        "Crop rotation",
        "Companion planting",
        "Natural pest control",
      ],
      specialties: ["Heirloom Tomatoes", "Organic Vegetables", "Fresh Herbs"],
      email: "contact@sunnyvalley.farm",
      phone: "(916) 555-0123",
      website: "https://sunnyvalley.farm",
      socialMedia: {
        facebook: "sunnyvalleyfarm",
        instagram: "@sunnyvalleyfarm",
      },
      products: [
        {
          id: "1",
          name: "Organic Heirloom Tomatoes",
          description: "Sweet, juicy heirloom tomatoes in various colors",
          price: 5.99,
          unit: "lb",
          category: "Vegetables",
          inStock: true,
          image: "🍅",
        },
        {
          id: "2",
          name: "Mixed Salad Greens",
          description: "Fresh mix of lettuce, arugula, and spinach",
          price: 4.99,
          unit: "bag",
          category: "Vegetables",
          inStock: true,
          image: "🥬",
        },
        {
          id: "3",
          name: "Fresh Basil",
          description: "Aromatic basil perfect for pesto and salads",
          price: 3.99,
          unit: "bunch",
          category: "Herbs",
          inStock: true,
          image: "🌿",
        },
        {
          id: "4",
          name: "Organic Carrots",
          description: "Sweet, crunchy carrots harvested fresh",
          price: 3.49,
          unit: "lb",
          category: "Vegetables",
          inStock: true,
          image: "🥕",
        },
        {
          id: "5",
          name: "Cherry Tomatoes",
          description: "Sweet cherry tomatoes, perfect for snacking",
          price: 6.99,
          unit: "pint",
          category: "Vegetables",
          inStock: false,
          image: "🍒",
        },
        {
          id: "6",
          name: "Fresh Mint",
          description: "Fragrant mint for teas and cooking",
          price: 3.49,
          unit: "bunch",
          category: "Herbs",
          inStock: true,
          image: "🌱",
        },
      ],
      owner: {
        name: "Michael Chen",
        bio: "Third-generation farmer passionate about organic agriculture",
        joinedYear: 2010,
      },
    },
  };

  const farm = mockFarms[slug];
  if (!farm) {
    return null;
  }
  return farm;
}

export default async function FarmDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const farm = await getFarmBySlug(resolvedParams.slug);

  if (!farm) {
    notFound();
  }

  const categories = Array.from(
    new Set(farm.products.map((p: any) => p.category))
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-agricultural-600">
                Home
              </Link>
              <span>/</span>
              <Link href="/farms" className="hover:text-agricultural-600">
                Farms
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{farm.name}</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-agricultural-50 to-green-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Back Button */}
              <Link
                href="/farms"
                className="inline-flex items-center gap-2 text-agricultural-600 hover:text-agricultural-700 mb-6 font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to All Farms
              </Link>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Farm Image/Logo */}
                  <div className="md:col-span-1">
                    <div className="w-full aspect-square bg-gradient-to-br from-agricultural-100 to-green-100 rounded-2xl flex items-center justify-center text-8xl shadow-md">
                      🏡
                    </div>
                  </div>

                  {/* Farm Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                          {farm.name}
                        </h1>
                        <p className="text-xl text-gray-600 mb-4">
                          {farm.tagline}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          aria-label="Add farm to favorites"
                        >
                          <Heart className="h-5 w-5 text-gray-600" />
                        </button>
                        <button
                          className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          aria-label="Share this farm"
                        >
                          <Share2 className="h-5 w-5 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Location & Rating */}
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-5 w-5" />
                        <span>
                          {farm.city}, {farm.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">
                          {farm.rating}
                        </span>
                        <span className="text-gray-600">
                          ({farm.reviewCount} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Truck className="h-5 w-5" />
                        <span>Delivers within {farm.deliveryRadius} miles</span>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-agricultural-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-agricultural-600 mb-1">
                          {farm.farmSize}
                        </div>
                        <div className="text-sm text-gray-600">Farm Size</div>
                      </div>
                      <div className="bg-agricultural-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-agricultural-600 mb-1">
                          {new Date().getFullYear() - farm.establishedYear}
                        </div>
                        <div className="text-sm text-gray-600">
                          Years Farming
                        </div>
                      </div>
                      <div className="bg-agricultural-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-agricultural-600 mb-1">
                          {farm.products.length}
                        </div>
                        <div className="text-sm text-gray-600">Products</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button className="bg-agricultural-600 hover:bg-agricultural-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Contact Farm
                      </button>
                      <a
                        href={`tel:${farm.phone}`}
                        className="border-2 border-agricultural-600 text-agricultural-600 hover:bg-agricultural-50 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                      >
                        <Phone className="h-5 w-5" />
                        Call Now
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* About Section */}
                  <div className="bg-white rounded-2xl shadow-md p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Leaf className="h-6 w-6 text-agricultural-600" />
                      Our Story
                    </h2>
                    <div className="prose prose-lg max-w-none">
                      {farm.story
                        .split("\n\n")
                        .map((paragraph: string, idx: number) => (
                          <p key={idx} className="text-gray-700 mb-4">
                            {paragraph}
                          </p>
                        ))}
                    </div>
                  </div>

                  {/* Farming Practices */}
                  <div className="bg-white rounded-2xl shadow-md p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield className="h-6 w-6 text-agricultural-600" />
                      Our Practices
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {farm.farmingPractices.map((practice: string) => (
                        <div
                          key={practice}
                          className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                        >
                          <div className="w-8 h-8 bg-agricultural-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Leaf className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-gray-900 font-medium">
                            {practice}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Products Section */}
                  <div className="bg-white rounded-2xl shadow-md p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <ShoppingBag className="h-6 w-6 text-agricultural-600" />
                      Our Products
                    </h2>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <button className="px-4 py-2 bg-agricultural-600 text-white rounded-lg font-medium">
                        All
                      </button>
                      {categories.map((category) => (
                        <button
                          key={String(category)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                        >
                          {String(category)}
                        </button>
                      ))}
                    </div>

                    {/* Products Grid */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {farm.products.map((product: any) => (
                        <div
                          key={product.id}
                          className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex gap-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-agricultural-50 to-green-50 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
                              {product.image}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 mb-1">
                                {product.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {product.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-agricultural-600">
                                  ${product.price}/{product.unit}
                                </span>
                                {product.inStock ? (
                                  <button className="bg-agricultural-600 hover:bg-agricultural-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                                    Add
                                  </button>
                                ) : (
                                  <span className="text-sm text-gray-500">
                                    Out of Stock
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Contact Card */}
                  <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            Address
                          </div>
                          <div className="text-sm text-gray-600">
                            {farm.address}
                          </div>
                        </div>
                      </div>

                      {farm.phone && (
                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              Phone
                            </div>
                            <a
                              href={`tel:${farm.phone}`}
                              className="text-sm text-agricultural-600 hover:text-agricultural-700"
                            >
                              {farm.phone}
                            </a>
                          </div>
                        </div>
                      )}

                      {farm.email && (
                        <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              Email
                            </div>
                            <a
                              href={`mailto:${farm.email}`}
                              className="text-sm text-agricultural-600 hover:text-agricultural-700 break-all"
                            >
                              {farm.email}
                            </a>
                          </div>
                        </div>
                      )}

                      {farm.website && (
                        <div className="flex items-start gap-3">
                          <Globe className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              Website
                            </div>
                            <a
                              href={farm.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-agricultural-600 hover:text-agricultural-700 break-all"
                            >
                              {farm.website.replace(/^https?:\/\//, "")}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Certifications */}
                  {farm.certifications.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-md p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5 text-agricultural-600" />
                        Certifications
                      </h3>
                      <div className="space-y-2">
                        {farm.certifications.map((cert: string) => (
                          <div
                            key={cert}
                            className="flex items-center gap-2 p-3 bg-green-50 rounded-lg"
                          >
                            <Shield className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-900">
                              {cert}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specialties */}
                  {farm.specialties.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-md p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Specialties
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {farm.specialties.map((specialty: string) => (
                          <span
                            key={specialty}
                            className="px-3 py-1.5 bg-agricultural-50 text-agricultural-700 rounded-full text-sm font-medium"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
