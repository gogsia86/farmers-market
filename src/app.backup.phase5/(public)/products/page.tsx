import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { MapPin, Star, ShoppingCart, Leaf, ArrowRight } from "lucide-react";
import {
  generateMetadata as generateMeta,
  generateOrganizationJsonLd,
} from "@/lib/utils/metadata";
import { database } from "@/lib/database";

/**
 * 🍎 PRODUCTS CATALOG PAGE - Server Component
 * Version: 3.0.0 - UNIFIED AGRICULTURAL DESIGN
 * Browse and shop fresh, local products
 * Features:
 * - Product grid with filtering
 * - SEO optimized with metadata
 * - Server-side data fetching
 * - Consistent agricultural color scheme
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

      <main className="min-h-screen bg-white">
        {/* Header Section */}
        <section className="relative bg-gradient-to-br from-agricultural-50 via-white to-green-50 py-16 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] bg-repeat"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <span className="inline-flex items-center gap-2 bg-agricultural-100 text-agricultural-800 px-5 py-2.5 rounded-full text-sm font-semibold mb-6">
                <Leaf className="h-5 w-5" />
                Fresh & Organic
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
                Fresh, Local Products
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Shop organic produce and artisan goods from sustainable farms in
                your area
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  variant="default"
                  className="bg-agricultural-600 hover:bg-agricultural-700"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Shop Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-agricultural-300 text-agricultural-700 hover:bg-agricultural-50"
                >
                  View Categories
                  <ArrowRight className="ml-2 h-5 w-5" />
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
                  <p className="text-xl text-gray-600 mb-4">
                    No products available at the moment
                  </p>
                  <p className="text-gray-600">
                    Check back soon for fresh seasonal products!
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <p className="text-lg text-gray-600">
                      Showing {products.length}{" "}
                      {products.length === 1 ? "product" : "products"}
                    </p>
                  </div>

                  <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    data-testid="products-grid"
                  >
                    {products.map((product: any, index: number) => (
                      <Card
                        key={product.id}
                        className="h-full hover:shadow-xl transition-all duration-200 border-2 hover:border-agricultural-200"
                        data-testid={`product-card-${index}`}
                      >
                        <CardHeader className="p-0">
                          {/* Product Image */}
                          <div className="relative h-48 bg-gradient-to-br from-agricultural-400 to-agricultural-600 rounded-t-lg overflow-hidden">
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
                                <Badge className="bg-agricultural-600 text-white hover:bg-agricultural-700">
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
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {product.name}
                          </h3>

                          {/* Description */}
                          {product.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {product.description}
                            </p>
                          )}

                          {/* Farm Info */}
                          {product.farm && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                              <MapPin className="h-4 w-4" />
                              <Link
                                href={`/farms/${product.farm.slug || product.farm.id}`}
                                className="hover:text-agricultural-600 hover:underline"
                              >
                                {product.farm.name}
                              </Link>
                            </div>
                          )}

                          {/* Rating */}
                          {product.averageRating > 0 && (
                            <div className="flex items-center gap-2 text-sm mb-3">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span className="font-semibold text-gray-900">
                                {product.averageRating.toFixed(1)}
                              </span>
                              <span className="text-gray-600">
                                ({product.reviewCount || 0} reviews)
                              </span>
                            </div>
                          )}

                          {/* Price and Add to Cart */}
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div>
                              <p
                                className="text-2xl font-bold text-agricultural-600"
                                data-testid="product-price"
                              >
                                ${product.price.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-600">
                                per {product.unit || "unit"}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              disabled={!product.inStock}
                              className="gap-2 bg-agricultural-600 hover:bg-agricultural-700"
                              data-testid="add-to-cart-button"
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
        <section className="py-16 bg-gradient-to-br from-agricultural-50 via-white to-green-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Shop by Category
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Discover fresh produce, dairy, meats, and artisan goods
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-agricultural-300 text-agricultural-700 hover:bg-agricultural-50"
                >
                  <Link href="/products/categories/vegetables">Vegetables</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-agricultural-300 text-agricultural-700 hover:bg-agricultural-50"
                >
                  <Link href="/products/categories/fruits">Fruits</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-agricultural-300 text-agricultural-700 hover:bg-agricultural-50"
                >
                  <Link href="/products/categories/dairy">Dairy</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-agricultural-300 text-agricultural-700 hover:bg-agricultural-50"
                >
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
