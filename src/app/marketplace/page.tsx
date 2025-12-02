import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ShoppingCart,
  Store,
  Leaf,
  TrendingUp,
  Award,
  MapPin,
} from "lucide-react";
import {
  generateMetadata as generateMeta,
  generateOrganizationJsonLd,
} from "@/lib/utils/metadata";

/**
 * 🌟 MARKETPLACE LANDING PAGE
 * Entry point for the marketplace - no redirect
 * Features:
 * - Quick navigation to products and farms
 * - SEO optimized
 * - Fast loading (no redirect delay)
 */

// Generate metadata for SEO
export const metadata: Metadata = generateMeta({
  title: "Marketplace | Shop Local Products",
  description:
    "Browse our farmers market marketplace. Discover fresh, organic produce from local farms. Support sustainable agriculture and buy directly from farmers.",
  path: "/marketplace",
  keywords: [
    "marketplace",
    "farmers market",
    "organic produce",
    "local farms",
    "fresh vegetables",
    "buy local",
    "sustainable agriculture",
    "farm to table",
  ],
});

export default function MarketplacePage() {
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
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 bg-green-600/10 border border-green-600/20 text-green-700 backdrop-blur-sm px-5 py-2.5 rounded-full text-sm font-semibold mb-6">
                <Leaf className="h-5 w-5" />
                Fresh from Local Farms
              </span>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
                Marketplace
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                Discover fresh, organic produce and artisan goods from
                sustainable farms in your area
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/marketplace/products">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Shop Products
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/marketplace/farms">
                    <Store className="h-5 w-5 mr-2" />
                    Browse Farms
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Products Card */}
                <Link href="/marketplace/products">
                  <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <ShoppingCart className="h-10 w-10 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                        Shop Products
                      </h2>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-lg text-muted-foreground mb-6">
                        Browse fresh produce, dairy, meats, and artisan goods
                        from local farms
                      </p>
                      <ul className="space-y-3 text-left max-w-sm mx-auto mb-6">
                        <li className="flex items-center gap-3">
                          <Leaf className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span>Organic & sustainable products</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span>Certified quality</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span>Delivered to your door</span>
                        </li>
                      </ul>
                      <Button className="w-full" size="lg">
                        View All Products
                      </Button>
                    </CardContent>
                  </Card>
                </Link>

                {/* Farms Card */}
                <Link href="/marketplace/farms">
                  <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Store className="h-10 w-10 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                        Browse Farms
                      </h2>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-lg text-muted-foreground mb-6">
                        Discover local farms, read reviews, and shop directly
                        from farmers
                      </p>
                      <ul className="space-y-3 text-left max-w-sm mx-auto mb-6">
                        <li className="flex items-center gap-3">
                          <Store className="h-5 w-5 text-amber-600 flex-shrink-0" />
                          <span>Family-owned farms</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-amber-600 flex-shrink-0" />
                          <span>Farm profiles & certifications</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-amber-600 flex-shrink-0" />
                          <span>Find farms near you</span>
                        </li>
                      </ul>
                      <Button className="w-full" size="lg" variant="outline">
                        View All Farms
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
                Why Shop Our Marketplace?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    500+
                  </div>
                  <p className="text-lg font-semibold text-foreground mb-2">
                    Fresh Products
                  </p>
                  <p className="text-muted-foreground">
                    Organic produce, dairy, meats & more
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    50+
                  </div>
                  <p className="text-lg font-semibold text-foreground mb-2">
                    Local Farms
                  </p>
                  <p className="text-muted-foreground">
                    Supporting sustainable agriculture
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    100%
                  </div>
                  <p className="text-lg font-semibold text-foreground mb-2">
                    Quality Guaranteed
                  </p>
                  <p className="text-muted-foreground">
                    Fresh from farm to your table
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Shopping?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join thousands of customers supporting local farms and enjoying
                fresh, sustainable produce
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/marketplace/products">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Shop Now
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/register-farm">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Sell Your Products
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
