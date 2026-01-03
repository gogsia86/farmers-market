import { MarketplaceSearch } from "@/components/marketplace/MarketplaceSearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { database } from "@/lib/database";
import { farmLogger } from "@/lib/utils/logger";
import {
  generateMetadata as generateMeta,
  generateOrganizationJsonLd,
} from "@/lib/utils/metadata";
import { Heart, Leaf, MapPin, ShoppingCart, ShoppingCart as ShoppingCartIcon, Star } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

/**
 * 🛒 MARKETPLACE PRODUCTS PAGE - Server Component
 * Browse all products in the marketplace
 * Features:
 * - Product grid with key information
 * - SEO optimized with metadata
 * - Direct database access (Server Component pattern)
 */

// Generate metadata for SEO
export const metadata: Metadata = generateMeta({
  title: "Shop Fresh Products | Marketplace",
  description:
    "Browse fresh, local produce and artisan goods from sustainable farms. Organic vegetables, fruits, dairy, meats, and more available for delivery.",
  path: "/marketplace/products",
  keywords: [
    "marketplace products",
    "fresh produce",
    "organic products",
    "local marketplace",
    "farm products",
    "buy local",
    "sustainable shopping",
    "farm to table",
  ],
});

// Direct database access for Server Component (no API fetch needed)
async function getProducts() {
  try {
    const products = await database.product.findMany({
      where: {
        status: "ACTIVE",
        inStock: true,
      },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    // Transform to expected format with proper type casting for JSON fields
    return products.map((product) => {
      const images = Array.isArray(product.images)
        ? (product.images as string[])
        : [];

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice
          ? Number(product.compareAtPrice)
          : null,
        unit: product.unit,
        category: product.category,
        organic: product.organic,
        seasonal: product.seasonal,
        featured: product.featured,
        inStock: product.inStock,
        images,
        averageRating: product.averageRating
          ? Number(product.averageRating)
          : null,
        reviewCount: product.reviewCount,
        farm: {
          id: product.farm.id,
          name: product.farm.name,
          slug: product.farm.slug,
          city: product.farm.city,
          state: product.farm.state,
        },
      };
    });
  } catch (error) {
    farmLogger.error("Failed to fetch marketplace products", error instanceof Error ? error : new Error(String(error)), {
      path: "/customer/marketplace/products",
    });
    return [];
  }
}

export default async function MarketplaceProductsPage() {
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
        {/* Header Section */}
        <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                Shop Fresh Products
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Discover organic produce and artisan goods from local farms
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" variant="default">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Start Shopping
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/marketplace/farms">Browse Farms</Link>
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
                type="products"
                showFilters={true}
                placeholder="Search fresh tomatoes, organic honey, free-range eggs..."
              />
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              {products.length === 0 ? (
                <EmptyState
                  icon={ShoppingCartIcon}
                  title="No Products Available"
                  description="We couldn't find any products at the moment."
                  secondaryDescription="Check back soon for fresh seasonal products!"
                  action={{
                    label: "Browse Farms",
                    href: "/marketplace/farms",
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
                    <div>
                      <p className="text-lg text-muted-foreground">
                        Showing {products.length}{" "}
                        {products.length === 1 ? "product" : "products"}
                      </p>
                    </div>
                  </div>

                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    data-testid="products-grid"
                  >
                    {products.map((product: any, index: number) => (
                      <Card
                        key={product.id}
                        className="h-full hover:shadow-lg transition-shadow duration-200 group product-card"
                        data-testid={`product-card-${index}`}
                        data-product-slug={product.slug ?? product.id}
                      >
                        <CardHeader className="p-0">
                          {/* Product Image */}
                          <div className="relative h-48 bg-gradient-to-br from-green-400 to-emerald-600 rounded-t-lg overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white/80 text-lg font-semibold text-center px-4">
                                  {product.name}
                                </span>
                              </div>
                            )}

                            {/* Badges */}
                            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                              {product.organic && (
                                <Badge className="bg-green-600 text-white hover:bg-green-700">
                                  <Leaf className="h-3 w-3 mr-1" />
                                  Organic
                                </Badge>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="ml-auto h-8 w-8 bg-white/90 hover:bg-white"
                              >
                                <Heart className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Out of Stock Badge */}
                            {!product.inStock && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
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

                        <CardContent className="p-4">
                          {/* Product Name */}
                          <Link
                            href={`/marketplace/products/${product.slug ?? product.id}`}
                            data-testid={`product-link-${product.slug ?? product.id}`}
                          >
                            <h3
                              className="text-lg font-bold text-foreground mb-2 hover:text-primary transition-colors line-clamp-2"
                              data-testid="product-name"
                            >
                              {product.name}
                            </h3>
                          </Link>

                          {/* Description */}
                          {product.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {product.description}
                            </p>
                          )}

                          {/* Farm Info */}
                          {product.farm && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <Link
                                href={`/marketplace/farms/${product.farm.slug || product.farm.id}`}
                                className="hover:text-primary hover:underline truncate"
                              >
                                {product.farm.name}
                              </Link>
                            </div>
                          )}

                          {/* Rating */}
                          {product.averageRating > 0 && (
                            <div className="flex items-center gap-2 text-sm mb-3">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span className="font-semibold">
                                {product.averageRating.toFixed(1)}
                              </span>
                              <span className="text-muted-foreground">
                                ({product.reviewCount || 0})
                              </span>
                            </div>
                          )}

                          {/* Price and Add to Cart */}
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div>
                              <p className="text-2xl font-bold text-primary">
                                ${product.price.toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                per {product.unit || "unit"}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              disabled={!product.inStock}
                              className="gap-2"
                              data-testid={`add-to-cart-${product.id}`}
                            >
                              <ShoppingCart className="h-4 w-4" />
                              Add
                            </Button>
                          </div>

                          {/* Category Badge */}
                          {product.category && (
                            <div className="mt-3">
                              <Badge variant="secondary" className="text-xs">
                                {product.category}
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Category Navigation */}
        <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Shop by Category
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Find exactly what you're looking for
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" size="lg" asChild>
                  <Link href="/products/categories/vegetables">
                    🥕 Vegetables
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/products/categories/fruits">🍎 Fruits</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/products/categories/dairy">🥛 Dairy</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/categories">View All</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Are you a farmer?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join our marketplace and sell your products to thousands of
                customers
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register-farm">Register Your Farm</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
