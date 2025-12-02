import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FarmProfileTabs } from "@/components/marketplace/FarmProfileTabs";
import { FarmProfileActions } from "@/components/marketplace/FarmProfileActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, MapPin, Star, Truck, Calendar } from "lucide-react";

/**
 * 🌾 ENHANCED FARM PROFILE PAGE - Phase 3
 * Detailed farm profile with tabbed interface
 * Features:
 * - Farm header with hero image and key info
 * - Tabbed content (Products, About, Reviews, Location)
 * - Favorite/Save farm functionality
 * - Social sharing
 */

interface PageProps {
  params: {
    slug: string;
  };
}

// Mock data - will be replaced with API/database calls
async function getFarmBySlug(slug: string) {
  // Mock farms data
  const farms = {
    "green-valley-farm": {
      id: "1",
      name: "Green Valley Farm",
      slug: "green-valley-farm",
      tagline: "Organic vegetables and heritage produce since 1987",
      description:
        "Family-owned organic farm specializing in heirloom vegetables and sustainable farming practices.",
      story: `Green Valley Farm has been a cornerstone of our local food community for over 35 years.

Founded by the Martinez family in 1987, our farm sits on 50 beautiful acres in the heart of Oregon's agricultural heartland. We're committed to growing the highest quality organic vegetables using regenerative farming practices that heal the land and nourish our community.

Our journey began when Maria and Carlos Martinez purchased this land with a dream of creating a sustainable farm that would serve future generations. Today, their grandchildren help tend the fields, continuing a legacy of stewardship and care for the earth.

We grow over 40 varieties of heirloom vegetables, from rainbow carrots to purple cauliflower, preserving biodiversity and bringing unique flavors to your table. Every seed we plant is chosen with intention, every harvest is handled with care, and every relationship with our customers is built on trust and transparency.`,
      farmType: "Organic Vegetable Farm",
      address: "1234 Farm Road",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      deliveryRadius: 30,
      farmSize: "50 acres",
      establishedYear: 1987,
      rating: 4.8,
      reviewCount: 124,
      certifications: ["USDA Organic", "Certified Biodynamic", "Non-GMO"],
      farmingPractices: [
        "Certified organic since 1990",
        "No synthetic pesticides or fertilizers",
        "Crop rotation and cover cropping",
        "Integrated pest management",
        "Water conservation practices",
        "Composting and soil building",
      ],
      specialties: [
        "Heirloom Tomatoes",
        "Rainbow Carrots",
        "Heritage Potatoes",
        "Seasonal Greens",
      ],
      email: "info@greenvalleyfarm.com",
      phone: "(503) 555-0123",
      website: "https://greenvalleyfarm.com",
      socialMedia: {
        facebook: "greenvalleyfarm",
        instagram: "@greenvalleyfarm",
      },
      operatingHours: {
        Monday: "8:00 AM - 6:00 PM",
        Tuesday: "8:00 AM - 6:00 PM",
        Wednesday: "8:00 AM - 6:00 PM",
        Thursday: "8:00 AM - 6:00 PM",
        Friday: "8:00 AM - 6:00 PM",
        Saturday: "9:00 AM - 5:00 PM",
        Sunday: "Closed",
      },
      products: [
        {
          id: "1",
          name: "Organic Heirloom Tomatoes",
          description: "Vine-ripened, bursting with flavor",
          price: 5.99,
          unit: "lb",
          category: "vegetables",
          inStock: true,
          image: "/images/products/tomatoes.jpg",
          organic: true,
          rating: 4.8,
        },
        {
          id: "2",
          name: "Rainbow Carrots",
          description: "Colorful heritage varieties",
          price: 3.99,
          unit: "lb",
          category: "vegetables",
          inStock: true,
          image: "/images/products/carrots.jpg",
          organic: true,
          rating: 4.9,
        },
        {
          id: "3",
          name: "Mixed Salad Greens",
          description: "Fresh-cut seasonal blend",
          price: 4.49,
          unit: "5oz bag",
          category: "greens",
          inStock: true,
          image: "/images/products/greens.jpg",
          organic: true,
          rating: 4.7,
        },
        {
          id: "4",
          name: "Purple Cauliflower",
          description: "Stunning and nutritious",
          price: 4.99,
          unit: "head",
          category: "vegetables",
          inStock: true,
          image: "/images/products/cauliflower.jpg",
          organic: true,
          rating: 4.6,
        },
      ],
      reviews: [
        {
          id: "1",
          customerName: "Sarah Johnson",
          rating: 5,
          reviewText:
            "Absolutely love this farm! The quality of their produce is outstanding, and you can really taste the difference. The heirloom tomatoes are the best I've ever had.",
          createdAt: "2024-01-15T10:00:00Z",
          isVerifiedPurchase: true,
          productName: "Organic Heirloom Tomatoes",
        },
        {
          id: "2",
          customerName: "Michael Chen",
          rating: 5,
          reviewText:
            "Green Valley Farm is our go-to for fresh, organic vegetables. The rainbow carrots are a huge hit with my kids, and I appreciate their commitment to sustainable farming.",
          createdAt: "2024-01-10T14:30:00Z",
          isVerifiedPurchase: true,
          productName: "Rainbow Carrots",
        },
        {
          id: "3",
          customerName: "Emily Rodriguez",
          rating: 4,
          reviewText:
            "Great selection of unique vegetables. Their salad greens stay fresh for days. Would love to see more variety in the winter months.",
          createdAt: "2024-01-05T09:15:00Z",
          isVerifiedPurchase: true,
          productName: "Mixed Salad Greens",
        },
      ],
      owner: {
        name: "Maria Martinez",
        bio: "Third-generation farmer passionate about organic agriculture and community food systems. Maria has been farming since childhood and holds a degree in Sustainable Agriculture.",
        joinedYear: 1987,
      },
      heroImage: "/images/farms/green-valley-hero.jpg",
    },
    "sunny-acres-orchard": {
      id: "2",
      name: "Sunny Acres Orchard",
      slug: "sunny-acres-orchard",
      tagline: "Premium organic fruit from the heart of Hood River",
      description:
        "Family orchard specializing in heritage apple varieties and stone fruits.",
      story: `Sunny Acres Orchard has been growing premium fruit in Hood River Valley since 1952. Our orchard spans 75 acres of prime fruit-growing land, with stunning views of Mount Hood.

We specialize in heritage apple varieties that are becoming rare in commercial agriculture. Our collection includes over 30 unique apple varieties, each chosen for exceptional flavor and historical significance.

Sustainable orchard management is at the heart of everything we do. We use integrated pest management, maintain healthy soil through composting, and protect beneficial insects through habitat preservation.`,
      farmType: "Fruit Orchard",
      address: "5678 Orchard Lane",
      city: "Hood River",
      state: "OR",
      zipCode: "97031",
      deliveryRadius: 50,
      farmSize: "75 acres",
      establishedYear: 1952,
      rating: 4.9,
      reviewCount: 89,
      certifications: ["USDA Organic", "Salmon-Safe"],
      farmingPractices: [
        "Organic orchard management",
        "No synthetic pesticides",
        "Beneficial insect habitat",
        "Minimal tillage",
        "Integrated pest management",
      ],
      specialties: [
        "Honeycrisp Apples",
        "Heritage Apple Varieties",
        "Stone Fruits",
        "Pears",
      ],
      email: "info@sunnyacres.com",
      phone: "(541) 555-0456",
      website: "https://sunnyacresorchard.com",
      products: [
        {
          id: "5",
          name: "Honeycrisp Apples",
          description: "Crisp, sweet, and juicy",
          price: 4.99,
          unit: "lb",
          category: "fruits",
          inStock: true,
          image: "/images/products/apples.jpg",
          organic: true,
          rating: 4.9,
        },
        {
          id: "6",
          name: "Organic Pears",
          description: "Sweet and buttery",
          price: 3.99,
          unit: "lb",
          category: "fruits",
          inStock: true,
          image: "/images/products/pears.jpg",
          organic: true,
          rating: 4.8,
        },
      ],
      reviews: [
        {
          id: "4",
          customerName: "David Wilson",
          rating: 5,
          reviewText:
            "Best apples I've ever tasted! The Honeycrisp variety is absolutely perfect - crisp, sweet, and so fresh.",
          createdAt: "2024-01-20T11:00:00Z",
          isVerifiedPurchase: true,
          productName: "Honeycrisp Apples",
        },
      ],
      owner: {
        name: "Robert Thompson",
        bio: "Fourth-generation orchardist dedicated to preserving heritage fruit varieties and sustainable farming practices.",
        joinedYear: 1952,
      },
      heroImage: "/images/farms/sunny-acres-hero.jpg",
    },
  };

  const farm = farms[slug as keyof typeof farms];
  return farm || null;
}

export default async function FarmProfilePage({ params }: PageProps) {
  const { slug } = params;
  const farm = await getFarmBySlug(slug);

  if (!farm) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Farm Hero Section */}
        <section className="relative h-[400px] lg:h-[500px]">
          {/* Hero Image */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800">
            {/* Placeholder for hero image */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3)_0%,transparent_50%)]"></div>
            </div>
          </div>

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          {/* Farm Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="container mx-auto px-4 pb-8">
              <div className="max-w-4xl">
                {/* Certifications */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {farm.certifications.map((cert, index) => (
                    <Badge
                      key={index}
                      className="bg-white/20 backdrop-blur-md text-white border-white/30"
                    >
                      <Award className="h-3 w-3 mr-1" />
                      {cert}
                    </Badge>
                  ))}
                </div>

                {/* Farm Name & Info */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
                  {farm.name}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-4">
                  {farm.tagline}
                </p>

                {/* Quick Stats */}
                <div className="flex flex-wrap items-center gap-6 text-white/90">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{farm.rating}</span>
                    <span className="text-white/70">
                      ({farm.reviewCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>
                      {farm.city}, {farm.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    <span>Delivers within {farm.deliveryRadius} miles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>Est. {farm.establishedYear}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <FarmProfileTabs farm={farm} />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to order from {farm.name}?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Fresh, local products delivered to your door
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" className="gap-2">
                  Browse Products
                </Button>
                <FarmProfileActions farmId={farm.id} farmName={farm.name} />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// Generate static params for known farms
export async function generateStaticParams() {
  return [
    { slug: "green-valley-farm" },
    { slug: "sunny-acres-orchard" },
    { slug: "happy-hen-farm" },
    { slug: "heritage-bakery" },
  ];
}
