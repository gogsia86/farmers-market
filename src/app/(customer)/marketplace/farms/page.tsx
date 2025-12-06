import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { MapPin, Star, Award, Truck, Store } from "lucide-react";
import {
  generateMetadata,
  generateOrganizationJsonLd,
} from "@/lib/utils/metadata";
import { MarketplaceSearch } from "@/components/marketplace/MarketplaceSearch";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * 🌾 MARKETPLACE FARMS INDEX PAGE
 * Browse all farms in the marketplace
 * Features:
 * - Farm grid with key information
 * - Filtering and search (future enhancement)
 * - SEO optimized with metadata and JSON-LD
 *
 * ✅ WIRED TO API - Uses /api/farms
 */

// Generate metadata for SEO
export const metadata: Metadata = generateMetadata({
  title: "Browse Local Farms",
  description:
    "Discover local farms in your area. Browse profiles, read reviews, and shop fresh produce directly from sustainable farms.",
  path: "/marketplace/farms",
  keywords: [
    "local farms",
    "farm directory",
    "sustainable farming",
    "organic farms",
    "farmers market",
    "local produce",
    "farm to table",
  ],
});

interface ApiResponse {
  success: boolean;
  data?: any[];
  error?: {
    code: string;
    message: string;
  };
}

// Fetch farms data from API
async function getFarms() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const response = await fetch(`${baseUrl}/api/farms`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch farms: ${response.statusText}`);
    }

    const result: ApiResponse = await response.json();

    if (!result.success || !result.data) {
      return [];
    }

    return result.data;
  } catch (error) {
    console.error("[FARMS_FETCH_ERROR]", error);
    return [];
  }
}

export default async function MarketplaceFarmsPage() {
  const farms = await getFarms();

  // Generate JSON-LD structured data
  const organizationJsonLd = generateOrganizationJsonLd();

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <main className="min-h-screen bg-background">
        {/* Header Section */}
        <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                Browse Local Farms
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Discover sustainable farms in your area and shop fresh, local
                produce
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" variant="default" asChild>
                  <Link href="/marketplace/products">Shop Products</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <MarketplaceSearch
                type="farms"
                showFilters={true}
                placeholder="Search farms by name, location, or products..."
              />
            </div>
          </div>
        </section>

        {/* Farms Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              {farms.length === 0 ? (
                <EmptyState
                  icon={Store}
                  title="No Farms Found"
                  description="We couldn't find any farms in your area."
                  secondaryDescription="Check back soon as more farms join our marketplace!"
                  action={{
                    label: "Shop Products",
                    href: "/marketplace/products",
                  }}
                  secondaryAction={{
                    label: "Back to Home",
                    href: "/",
                    variant: "outline",
                  }}
                  size="lg"
                  showDecoration
                />
              ) : (
                <>
                  <div className="mb-8">
                    <p className="text-lg text-muted-foreground">
                      Showing {farms.length}{" "}
                      {farms.length === 1 ? "farm" : "farms"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {farms.map((farm: any) => (
                      <Link
                        key={farm.id}
                        href={`/marketplace/farms/${farm.slug}`}
                        className="group"
                      >
                        <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                          <CardHeader className="p-0">
                            {/* Farm Image */}
                            <div className="relative h-48 bg-gradient-to-br from-green-400 to-emerald-600 rounded-t-lg overflow-hidden">
                              {farm.bannerUrl || farm.images?.[0] ? (
                                <img
                                  src={farm.bannerUrl || farm.images[0]}
                                  alt={farm.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-white/80 text-lg font-semibold">
                                    {farm.name}
                                  </span>
                                </div>
                              )}
                              {/* Certifications Badge */}
                              {farm.certifications &&
                                farm.certifications.length > 0 && (
                                  <div className="absolute top-3 right-3">
                                    <Badge className="bg-white/90 text-green-700 hover:bg-white">
                                      <Award className="h-3 w-3 mr-1" />
                                      {farm.certifications[0]}
                                    </Badge>
                                  </div>
                                )}
                            </div>
                          </CardHeader>

                          <CardContent className="p-6">
                            {/* Farm Name */}
                            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                              {farm.name}
                            </h3>

                            {/* Description */}
                            {farm.description && (
                              <p className="text-muted-foreground line-clamp-2 mb-4">
                                {farm.description}
                              </p>
                            )}

                            {/* Stats */}
                            <div className="space-y-2 mb-4">
                              {/* Rating */}
                              {farm.averageRating > 0 && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                  <span className="font-semibold">
                                    {farm.averageRating.toFixed(1)}
                                  </span>
                                  <span className="text-muted-foreground">
                                    ({farm.reviewCount || 0} reviews)
                                  </span>
                                </div>
                              )}

                              {/* Location */}
                              {farm.city && farm.state && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  <span>
                                    {farm.city}, {farm.state}
                                  </span>
                                </div>
                              )}

                              {/* Delivery */}
                              {farm.deliveryRadius > 0 && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Truck className="h-4 w-4" />
                                  <span>
                                    Delivers within {farm.deliveryRadius} miles
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Specialties */}
                            {farm.productCategories &&
                              farm.productCategories.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {farm.productCategories
                                    .slice(0, 3)
                                    .map((category: string, index: number) => (
                                      <Badge
                                        key={index}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {category}
                                      </Badge>
                                    ))}
                                  {farm.productCategories.length > 3 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      +{farm.productCategories.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Are you a farmer?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join our marketplace and connect with customers who value fresh,
                local produce
              </p>
              <Button size="lg" asChild>
                <Link href="/register-farm">Register Your Farm</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
