import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Star, ShoppingCart, Leaf } from "lucide-react";
import {
  generateMetadata as generateMeta,
  generateOrganizationJsonLd,
} from "@/lib/utils/metadata";

/**
 * 🍎 PRODUCTS CATALOG PAGE - Server Component
 * Browse and shop fresh, local products
 * Features:
 * - Product grid with filtering
 * - SEO optimized with metadata
 * - Server-side data fetching
 */

// Generate metadata for SEO
export const metadata: Metadata = generateMeta({
  title: "Browse Fresh Products",
  description:
    "Shop fresh, local produce and artisan goods directly from sustainable farms. Organic vegetables, fruits, dairy, and more delivered to your door.",
  path: "/products",
  keywords: [
    "fresh produce",
    "organic vegetables",
    "local products",
    "farm fresh",
    "seasonal produce",
    "organic fruits",
    "artisan goods",
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

// Fetch products data from API
async function getProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const response = await fetch(`${baseUrl}/api/products`, {
      cache: "no-store",
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const result: ApiResponse = await response.json();

    if (!result.success || !result.data) {
      return [];
    }

    return result.data;
  } catch (error) {
    console.error("[PRODUCTS_FETCH_ERROR]", error);
    return [];
  }
}

export default async function ProductsPage() {
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
                Fresh, Local Products
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Shop organic produce and artisan goods from sustainable farms in
                your area
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" variant="default">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Shop Now
                </Button>
                <Button size="lg" variant="outline">
                  View Categories
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              {products.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-xl text-muted-foreground mb-4">
                    No products available at the moment
                  </p>
                  <p className="text-muted-foreground">
                    Check back soon for fresh seasonal products!
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <p className="text-lg text-muted-foreground">
                      Showing {products.length}{" "}
                      {products.length === 1 ? "product" : "products"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product: any) => (
                      <Card
                        key={product.id}
                        className="h-full hover:shadow-lg transition-shadow duration-200"
                      >
                        <CardHeader className="p-0">
                          {/* Product Image */}
                          <div className="relative h-48 bg-gradient-to-br from-green-400 to-emerald-600 rounded-t-lg overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white/80 text-lg font-semibold">
                                  {product.name}
                                </span>
                              </div>
                            )}
                            {/* Organic Badge */}
                            {product.organic && (
                              <div className="absolute top-3 right-3">
                                <Badge className="bg-green-600 text-white hover:bg-green-700">
                                  <Leaf className="h-3 w-3 mr-1" />
                                  Organic
                                </Badge>
                              </div>
                            )}
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

                        <CardContent className="p-6">
                          {/* Product Name */}
                          <h3 className="text-lg font-bold text-foreground mb-2">
                            {product.name}
                          </h3>

                          {/* Description */}
                          {product.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {product.description}
                            </p>
                          )}

                          {/* Farm Info */}
                          {product.farm && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                              <MapPin className="h-4 w-4" />
                              <Link
                                href={`/farms/${product.farm.slug || product.farm.id}`}
                                className="hover:text-primary hover:underline"
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
                                ({product.reviewCount || 0} reviews)
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
                            >
                              <ShoppingCart className="h-4 w-4" />
                              Add
                            </Button>
                          </div>

                          {/* Category */}
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

        {/* Categories CTA */}
        <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Shop by Category
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Discover fresh produce, dairy, meats, and artisan goods
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" variant="outline" asChild>
                  <Link href="/products/categories/vegetables">Vegetables</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/products/categories/fruits">Fruits</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/products/categories/dairy">Dairy</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/categories">View All</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
