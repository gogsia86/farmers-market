import { notFound } from "next/navigation";
import { Metadata } from "next";
import { FarmProfileTabs } from "@/components/marketplace/FarmProfileTabs";
import { FarmProfileActions } from "@/components/marketplace/FarmProfileActions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Award, MapPin, Star, Truck, Calendar } from "lucide-react";
import { generateFarmMetadata, generateFarmJsonLd } from "@/lib/utils/metadata";

/**
 * 🌾 ENHANCED FARM PROFILE PAGE - Phase 3
 * Detailed farm profile with tabbed interface
 * Features:
 * - Farm header with hero image and key info
 * - Tabbed content (Products, About, Reviews, Location)
 * - Favorite/Save farm functionality
 * - Social sharing
 * - Comprehensive SEO metadata
 * - JSON-LD structured data
 *
 * ✅ WIRED TO API - Uses /api/farms/[slug]
 */

interface PageProps {
  params: {
    slug: string;
  };
}

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
  };
}

// Fetch farm data from API
async function getFarmBySlug(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const response = await fetch(`${baseUrl}/api/farms/${slug}`, {
      cache: "no-store", // Always fetch fresh data for customer views
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch farm: ${response.statusText}`);
    }

    const result: ApiResponse = await response.json();

    if (!result.success || !result.data) {
      return null;
    }

    return result.data;
  } catch (error) {
    console.error("[FARM_FETCH_ERROR]", error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = params;
  const farm = await getFarmBySlug(slug);

  if (!farm) {
    return {
      title: "Farm Not Found",
      description: "The farm you're looking for could not be found.",
    };
  }

  return generateFarmMetadata({
    title: farm.name,
    farmName: farm.name,
    description:
      farm.description ||
      `Visit ${farm.name} - Fresh, local produce from sustainable farming`,
    location: `${farm.city}, ${farm.state}`,
    path: `/marketplace/farms/${slug}`,
    image:
      farm.bannerUrl || farm.images?.[0] || "/images/farms/placeholder.jpg",
    rating: farm.averageRating || 0,
    reviewCount: farm.reviewCount || 0,
    products: farm.products?.length || 0,
    keywords: [
      farm.name.toLowerCase(),
      `${farm.city} farm`,
      `${farm.state} farm`,
      ...(farm.productCategories || []).map((cat: string) => cat.toLowerCase()),
      ...(farm.farmingPractices || []).map((practice: string) =>
        practice.toLowerCase(),
      ),
    ],
  });
}

export default async function FarmProfilePage({ params }: PageProps) {
  const { slug } = params;
  const farm = await getFarmBySlug(slug);

  if (!farm) {
    notFound();
  }

  // Transform API data to match component expectations
  const transformedFarm = {
    id: farm.id,
    name: farm.name,
    slug: farm.slug,
    tagline: farm.description || "",
    description: farm.description || "",
    story: farm.story || "",
    farmType: farm.businessName || "Farm",
    address: farm.address || "",
    city: farm.city || "",
    state: farm.state || "",
    zipCode: farm.zipCode || "",
    deliveryRadius: farm.deliveryRadius || 0,
    farmSize: farm.farmSize ? `${farm.farmSize} acres` : "N/A",
    establishedYear: farm.yearEstablished || new Date().getFullYear(),
    rating: farm.averageRating || 0,
    reviewCount: farm.reviewCount || 0,
    certifications: farm.certifications || [],
    farmingPractices: farm.farmingPractices || [],
    specialties: farm.productCategories || [],
    email: farm.email || "",
    phone: farm.phone || "",
    website: farm.website || "",
    socialMedia: {
      facebook: "",
      instagram: "",
    },
    operatingHours: {
      Monday: "Contact for hours",
      Tuesday: "Contact for hours",
      Wednesday: "Contact for hours",
      Thursday: "Contact for hours",
      Friday: "Contact for hours",
      Saturday: "Contact for hours",
      Sunday: "Contact for hours",
    },
    products: farm.products.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price,
      unit: product.unit || "each",
      category: product.category || "general",
      inStock: product.inStock,
      image: product.images?.[0] || "/images/products/placeholder.jpg",
      organic: product.organic || false,
      rating: product.averageRating || 0,
    })),
    reviews: farm.reviews.map((review: any) => ({
      id: review.id,
      customerName: review.customer?.name || "Anonymous",
      rating: review.rating,
      reviewText: review.comment || "",
      createdAt: review.createdAt,
      isVerifiedPurchase: true,
    })),
    owner: {
      name: farm.owner?.name || "Farm Owner",
      bio: "",
      joinedYear: farm.owner?.joinedYear || farm.establishedYear,
    },
    heroImage:
      farm.bannerUrl || farm.images?.[0] || "/images/farms/placeholder.jpg",
  };

  // Generate JSON-LD structured data
  const farmJsonLd = generateFarmJsonLd({
    name: transformedFarm.name,
    description: transformedFarm.description,
    address: transformedFarm.address,
    city: transformedFarm.city,
    state: transformedFarm.state,
    zipCode: transformedFarm.zipCode,
    phone: transformedFarm.phone,
    email: transformedFarm.email,
    website: transformedFarm.website,
    logoUrl: transformedFarm.heroImage,
    rating: transformedFarm.rating,
    reviewCount: transformedFarm.reviewCount,
  });

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(farmJsonLd) }}
      />

      <main className="min-h-screen bg-background">
        {/* Farm Hero Section */}
        <section className="relative h-[400px] lg:h-[500px]">
          {/* Hero Image */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800">
            {transformedFarm.heroImage &&
            transformedFarm.heroImage !== "/images/farms/placeholder.jpg" ? (
              <img
                src={transformedFarm.heroImage}
                alt={transformedFarm.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3)_0%,transparent_50%)]"></div>
              </div>
            )}
          </div>

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          {/* Farm Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="container mx-auto px-4 pb-8">
              <div className="max-w-4xl">
                {/* Certifications */}
                {transformedFarm.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {transformedFarm.certifications.map(
                      (cert: string, index: number) => (
                        <Badge
                          key={index}
                          className="bg-white/20 backdrop-blur-md text-white border-white/30"
                        >
                          <Award className="h-3 w-3 mr-1" />
                          {cert}
                        </Badge>
                      ),
                    )}
                  </div>
                )}

                {/* Farm Name & Info */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
                  {transformedFarm.name}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-4">
                  {transformedFarm.tagline}
                </p>

                {/* Quick Stats */}
                <div className="flex flex-wrap items-center gap-6 text-white/90">
                  {transformedFarm.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">
                        {transformedFarm.rating.toFixed(1)}
                      </span>
                      <span className="text-white/70">
                        ({transformedFarm.reviewCount} reviews)
                      </span>
                    </div>
                  )}
                  {transformedFarm.city && transformedFarm.state && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      <span>
                        {transformedFarm.city}, {transformedFarm.state}
                      </span>
                    </div>
                  )}
                  {transformedFarm.deliveryRadius > 0 && (
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      <span>
                        Delivers within {transformedFarm.deliveryRadius} miles
                      </span>
                    </div>
                  )}
                  {transformedFarm.establishedYear && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>Est. {transformedFarm.establishedYear}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <FarmProfileTabs farm={transformedFarm} />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to order from {transformedFarm.name}?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Fresh, local products delivered to your door
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" className="gap-2">
                  Browse Products
                </Button>
                <FarmProfileActions
                  farmId={transformedFarm.id}
                  farmName={transformedFarm.name}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

// Generate static params for known farms (optional - can be removed for fully dynamic)
export async function generateStaticParams() {
  // Return empty array to allow all dynamic slugs
  return [];
}
