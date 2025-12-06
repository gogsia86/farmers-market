import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  MapPin,
  Star,
  ShoppingCart,
  Leaf,
  Heart,
  Store,
  Package,
} from "lucide-react";
import {
  generateMetadata as generateMeta,
  generateOrganizationJsonLd,
} from "@/lib/utils/metadata";

/**
 * 🛒 MARKETPLACE LANDING PAGE - Server Component
 * Main marketplace hub showing featured products and farms
 * Features:
 * - Product grid with product cards
 * - SEO optimized with metadata
 * - Server-side data fetching
 * - Agricultural consciousness
 */

// Generate metadata for SEO
export const metadata: Metadata = generateMeta({
  title: "Marketplace | Shop Fresh Local Products",
  description:
    "Browse fresh, local produce and artisan goods from sustainable farms. Organic vegetables, fruits, dairy, meats, and more delivered to your door.",
  path: "/marketplace",
  keywords: [
    "farmers marketplace",
    "fresh produce",
    "organic products",
    "local marketplace",
    "farm products",
    "buy local",
    "sustainable shopping",
    "farm to table",
  ],
});

interface ApiResponse {
  success: boolean;
  data?:
    | any[]
    | {
        products: any[];
        pagination?: any;
      };
  error?: {
    code: string;
    message: string;
  };
}

// Fetch products data from API
async function getProducts(): Promise<any[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const response = await fetch(`${baseUrl}/api/products?limit=12`, {
      cache: "no-store",
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.warn(`Products API returned ${response.status}`);
      return [];
    }

    const result: ApiResponse = await response.json();

    if (!result.success || !result.data) {
      return [];
    }

    // Handle both response structures
    if (Array.isArray(result.data)) {
      return result.data;
    }

    return result.data.products || [];
  } catch (error) {
    console.error("[MARKETPLACE_FETCH_ERROR]", error);
    return [];
  }
}

export default async function MarketplacePage() {
  const products = await getProducts();

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
        <section className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 py-20 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] bg-repeat"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-5 py-2.5 rounded-full text-sm font-semibold mb-6">
                <Leaf className="h-5 w-5" />
                Fresh & Organic Marketplace
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Farm-Fresh Products
                <br />
                <span className="text-green-600">Delivered to Your Door</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Shop organic produce, artisan goods, and fresh products directly
                from local sustainable farms in your community
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Start Shopping
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                  asChild
                >
                  <Link href="/marketplace/farms">
                    <Store className="h-5 w-5 mr-2" />
                    Browse Farms
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-12 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {products.length}+
                </div>
                <div className="text-gray-600">Fresh Products Available</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  100%
                </div>
                <div className="text-gray-600">Locally Sourced</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  24h
                </div>
                <div className="text-gray-600">Farm to Door Delivery</div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Featured Products
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Handpicked fresh products from our trusted local farmers
                </p>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No Products Available Yet
                  </h3>
                  <p className="text-lg text-gray-600 mb-6">
                    Our farmers are preparing fresh products for you.
                    <br />
                    Check back soon for seasonal produce!
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" asChild>
                      <Link href="/marketplace/farms">Browse Farms</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/">Back to Home</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product: any) => (
                      <Card
                        key={product.id}
                        data-testid="product-card"
                        className="product-card h-full hover:shadow-xl transition-all duration-200 border-2 hover:border-green-200 group"
                      >
                        <CardHeader className="p-0">
                          {/* Product Image */}
                          <div className="relative h-48 bg-gradient-to-br from-green-400 to-emerald-600 rounded-t-lg overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white/90 text-lg font-semibold text-center px-4">
                                  {product.name}
                                </span>
                              </div>
                            )}

                            {/* Badges */}
                            <div className="absolute top-3 left-3 right-3 flex justify-between items-start gap-2">
                              {product.organic && (
                                <Badge className="bg-green-600 text-white hover:bg-green-700 shadow-lg">
                                  <Leaf className="h-3 w-3 mr-1" />
                                  Organic
                                </Badge>
                              )}
                              {product.featured && (
                                <Badge className="bg-amber-500 text-white hover:bg-amber-600 shadow-lg">
                                  ⭐ Featured
                                </Badge>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="ml-auto h-8 w-8 bg-white/90 hover:bg-white shadow-md"
                              >
                                <Heart className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Out of Stock Overlay */}
                            {!product.inStock && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                <Badge
                                  variant="error"
                                  className="text-lg px-4 py-2"
                                >
                                  Out of Stock
                                </Badge>
                              </div>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="p-5">
                          {/* Product Name */}
                          <Link
                            href={`/products/${product.slug || product.id}`}
                          >
                            <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-green-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                              {product.name}
                            </h3>
                          </Link>

                          {/* Description */}
                          {product.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3 min-h-[2.5rem]">
                              {product.description}
                            </p>
                          )}

                          {/* Farm Info */}
                          {product.farm && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                              <MapPin className="h-4 w-4 flex-shrink-0 text-green-600" />
                              <Link
                                href={`/marketplace/farms/${product.farm.slug || product.farm.id}`}
                                className="hover:text-green-600 hover:underline truncate"
                              >
                                {product.farm.name}
                              </Link>
                            </div>
                          )}

                          {/* Rating */}
                          {product.averageRating &&
                          product.averageRating > 0 ? (
                            <div className="flex items-center gap-2 text-sm mb-4">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span className="font-semibold text-gray-900">
                                {product.averageRating.toFixed(1)}
                              </span>
                              <span className="text-gray-600">
                                ({product.reviewCount || 0})
                              </span>
                            </div>
                          ) : (
                            <div className="h-6 mb-4"></div>
                          )}

                          {/* Price and Add to Cart */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div>
                              <p className="text-2xl font-bold text-green-600">
                                $
                                {typeof product.price === "number"
                                  ? product.price.toFixed(2)
                                  : parseFloat(product.price || 0).toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">
                                per {product.unit || "unit"}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              disabled={!product.inStock}
                              className="gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              Add
                            </Button>
                          </div>

                          {/* Category Badge */}
                          {product.category && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <Badge variant="secondary" className="text-xs">
                                {product.category.replace("_", " ")}
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* View All Products Link */}
                  <div className="text-center mt-12">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-50"
                      asChild
                    >
                      <Link href="/marketplace/products">
                        View All Products
                        <Package className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Shop by Category
                </h2>
                <p className="text-lg text-gray-600">
                  Explore our fresh selection of local produce and artisan goods
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-auto py-6 flex-col gap-2 hover:border-green-300 hover:bg-green-50"
                  asChild
                >
                  <Link href="/marketplace/products?category=vegetables">
                    <span className="text-3xl">🥕</span>
                    <span className="font-semibold">Vegetables</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-auto py-6 flex-col gap-2 hover:border-green-300 hover:bg-green-50"
                  asChild
                >
                  <Link href="/marketplace/products?category=fruits">
                    <span className="text-3xl">🍎</span>
                    <span className="font-semibold">Fruits</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-auto py-6 flex-col gap-2 hover:border-green-300 hover:bg-green-50"
                  asChild
                >
                  <Link href="/marketplace/products?category=dairy">
                    <span className="text-3xl">🥛</span>
                    <span className="font-semibold">Dairy</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-auto py-6 flex-col gap-2 hover:border-green-300 hover:bg-green-50"
                  asChild
                >
                  <Link href="/marketplace/products?category=meat">
                    <span className="text-3xl">🥩</span>
                    <span className="font-semibold">Meat</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Farmer Registration */}
        <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Are You a Farmer?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join our marketplace and connect with thousands of customers
                looking for fresh, local products
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-green-700 hover:bg-gray-100"
                asChild
              >
                <Link href="/register-farm">Register Your Farm Today</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
