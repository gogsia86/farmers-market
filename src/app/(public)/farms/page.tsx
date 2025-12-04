/**
 * 🌾 PUBLIC FARMS PAGE - API INTEGRATED
 * Farmers Market Platform - Browse All Verified Farms
 * Version: 2.0.0
 *
 * Divine Patterns Applied:
 * - Next.js Server Components (04_NEXTJS_DIVINE_IMPLEMENTATION)
 * - API Integration with error handling (12_ERROR_HANDLING_VALIDATION)
 * - Agricultural consciousness (02_AGRICULTURAL_QUANTUM_MASTERY)
 *
 * Features:
 * - Real-time farm data from API
 * - Server-side rendering for SEO
 * - Graceful error handling
 * - Empty state management
 * - Responsive grid layout
 *
 * Reference: WEBPAGE_UPDATE_PLAN.md - High Priority Fix #3
 */

import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MapPin, Star, Award, Store, ArrowRight } from "lucide-react";

// ============================================================================
// METADATA - SEO OPTIMIZATION
// ============================================================================

export const metadata: Metadata = {
  title: "Browse Local Farms | Farmers Market Platform",
  description:
    "Discover local farms in your area. Browse verified farm profiles, read reviews, and shop fresh produce directly from sustainable farms. Support local agriculture.",
  keywords: [
    "local farms",
    "farm directory",
    "sustainable farming",
    "organic farms",
    "farmers market",
    "fresh produce",
    "farm to table",
    "agricultural marketplace",
  ],
  openGraph: {
    title: "Browse Local Farms | Farmers Market Platform",
    description:
      "Discover local farms in your area. Browse profiles, read reviews, and shop fresh produce directly from sustainable farms.",
    type: "website",
  },
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ApiResponse {
  success: boolean;
  data?: any[];
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// ============================================================================
// DATA FETCHING - SERVER COMPONENT
// ============================================================================

/**
 * Fetch farms data from API
 *
 * Divine Pattern: Server-side data fetching with graceful degradation
 * Implements error handling and fallback to empty array
 */
async function getFarms(): Promise<any[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const response = await fetch(`${baseUrl}/api/farms`, {
      cache: "no-store",
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      console.warn(`[FARMS_API_WARNING] API returned ${response.status}`);
      return [];
    }

    const result: ApiResponse = await response.json();

    if (!result.success || !result.data) {
      console.warn("[FARMS_API_WARNING] Invalid response structure");
      return [];
    }

    return result.data;
  } catch (error) {
    console.error("[FARMS_FETCH_ERROR]", error);
    return [];
  }
}

// ============================================================================
// PAGE COMPONENT - SERVER COMPONENT
// ============================================================================

export default async function FarmsPage() {
  const farms = await getFarms();

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-emerald-50 to-agricultural-50 py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Store className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Discover Local Farms
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8">
              Connect with sustainable farms in your community
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="default" asChild>
                <Link href="/marketplace/products">
                  Shop Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/marketplace/farms">Browse Marketplace</Link>
              </Button>
            </div>

            {/* Stats */}
            {farms.length > 0 && (
              <div className="mt-12 flex items-center justify-center gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    {farms.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    {farms.length === 1 ? "Farm" : "Farms"}
                  </div>
                </div>
                <div className="h-12 w-px bg-gray-300" />
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    {farms.filter((f) => f.certifications?.length > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Certified</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Farms Grid Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {farms.length === 0 ? (
              /* Empty State */
              <EmptyState
                icon={Store}
                title="No Farms Available Yet"
                description="We're actively onboarding local farms to our platform."
                secondaryDescription="Check back soon as more farms join our marketplace!"
                action={{
                  label: "Browse Marketplace",
                  href: "/marketplace",
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
              /* Farms Grid */
              <>
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    All Farms
                  </h2>
                  <p className="text-lg text-gray-600">
                    Showing {farms.length}{" "}
                    {farms.length === 1 ? "farm" : "farms"}
                  </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {farms.map((farm: any) => (
                    <Link
                      key={farm.id}
                      href={`/marketplace/farms/${farm.slug || farm.id}`}
                      className="group"
                    >
                      <Card className="h-full hover:shadow-xl transition-all duration-200 border-2 hover:border-green-300">
                        <CardHeader className="p-0">
                          {/* Farm Image */}
                          <div className="relative h-48 sm:h-56 bg-gradient-to-br from-green-400 to-emerald-600 rounded-t-lg overflow-hidden">
                            {farm.bannerUrl || farm.images?.[0] ? (
                              <img
                                src={farm.bannerUrl || farm.images[0]}
                                alt={farm.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Store className="h-16 w-16 text-white/60" />
                              </div>
                            )}

                            {/* Certification Badge */}
                            {farm.certifications &&
                              farm.certifications.length > 0 && (
                                <div className="absolute top-3 right-3">
                                  <Badge className="bg-white/95 text-green-700 hover:bg-white shadow-lg">
                                    <Award className="h-3 w-3 mr-1" />
                                    {farm.certifications[0]}
                                  </Badge>
                                </div>
                              )}

                            {/* Featured Badge */}
                            {farm.featured && (
                              <div className="absolute top-3 left-3">
                                <Badge className="bg-amber-500/95 text-white hover:bg-amber-500 shadow-lg">
                                  ⭐ Featured
                                </Badge>
                              </div>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="p-6">
                          {/* Farm Name */}
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-1">
                            {farm.name}
                          </h3>

                          {/* Description */}
                          {farm.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {farm.description}
                            </p>
                          )}

                          {/* Farm Details */}
                          <div className="space-y-2">
                            {/* Rating */}
                            {farm.averageRating > 0 && (
                              <div className="flex items-center gap-2 text-sm">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span className="font-semibold text-gray-900">
                                  {farm.averageRating.toFixed(1)}
                                </span>
                                <span className="text-gray-500">
                                  ({farm.reviewCount || 0}{" "}
                                  {farm.reviewCount === 1
                                    ? "review"
                                    : "reviews"}
                                  )
                                </span>
                              </div>
                            )}

                            {/* Location */}
                            {(farm.city || farm.location) && farm.state && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span className="line-clamp-1">
                                  {farm.city || farm.location}, {farm.state}
                                </span>
                              </div>
                            )}

                            {/* Product Count */}
                            {farm.productCount > 0 && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Store className="h-4 w-4" />
                                <span>
                                  {farm.productCount}{" "}
                                  {farm.productCount === 1
                                    ? "Product"
                                    : "Products"}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Visit Farm Button */}
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="text-green-600 group-hover:text-green-700 font-medium text-sm flex items-center justify-between">
                              <span>Visit Farm</span>
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
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

      {/* CTA Section - Register Farm */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-green-600 via-emerald-600 to-agricultural-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <Store className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Are you a farmer?
            </h2>
            <p className="text-xl sm:text-2xl text-white/90 mb-8">
              Join our marketplace and connect with customers who value fresh,
              local produce
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup?role=farmer">
                  Register Your Farm
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                asChild
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
