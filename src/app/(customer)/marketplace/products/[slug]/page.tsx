/**
 * PRODUCT DETAIL PAGE
 * Divine product display for agricultural marketplace
 * Features: SEO, JSON-LD, image gallery, variants, cart integration, reviews, related products
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import {
  MapPin,
  Star,
  Heart,
  Share2,
  Leaf,
  Calendar,
  Package,
  Shield,
  ChevronRight,
} from "lucide-react";
import { ProductService } from "@/lib/services/product.service";
import { ProductImageGallery } from "@/components/products/ProductImageGallery";
import { StockIndicator } from "@/components/products/StockIndicator";
import { RelatedProducts } from "@/components/products/RelatedProducts";
import { ProductActions } from "@/components/products/ProductActions";
import { cn } from "@/lib/utils";
import { database } from "@/lib/database";

// ============================================
// TYPES
// ============================================

interface ProductPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    farm?: string;
  };
}

// ============================================
// METADATA GENERATION (SEO)
// ============================================

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  try {
    // Query product by slug alone - get first match
    const product = await database.product.findFirst({
      where: {
        slug: params.slug,
        status: "PUBLISHED" as any,
      },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      return {
        title: "Product Not Found",
        description: "The requested product could not be found.",
      };
    }

    const productName = product.name;
    const farmName = product.farm?.name || "Local Farm";
    const description =
      product.description ||
      `Fresh ${productName} from ${farmName}. Order now for farm-fresh delivery!`;

    return {
      title: `${productName} - ${farmName} | Farmers Market`,
      description: description.substring(0, 160),
      keywords: [
        productName,
        farmName,
        product.category,
        product.organic ? "organic" : "",
        "farmers market",
        "local produce",
        "farm fresh",
      ].filter(Boolean),
      openGraph: {
        title: `${productName} - ${farmName}`,
        description: description.substring(0, 160),
        images: product.primaryPhotoUrl
          ? [
              {
                url: product.primaryPhotoUrl,
                width: 1200,
                height: 630,
                alt: productName,
              },
            ]
          : [],
        type: "website",
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title: `${productName} - ${farmName}`,
        description: description.substring(0, 160),
        images: product.primaryPhotoUrl ? [product.primaryPhotoUrl] : [],
      },
      alternates: {
        canonical: `/marketplace/products/${params.slug}`,
      },
    };
  } catch (_error) {
    return {
      title: "Product Details | Farmers Market",
      description: "Browse fresh, local produce from verified farms.",
    };
  }
}

// ============================================
// PRODUCT DETAIL PAGE COMPONENT
// ============================================

export default async function ProductDetailPage({ params }: ProductPageProps) {
  // Fetch product data - query by slug alone
  const product = await database.product.findFirst({
    where: {
      slug: params.slug,
      status: "PUBLISHED" as any,
    },
    include: {
      farm: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          verificationStatus: true,
          location: true,
          description: true,
        },
      },
      reviews: {
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Increment view count (fire and forget)
  ProductService.incrementViewCount(product.id).catch(() => {
    // Silently fail - view counting is non-critical
  });

  // Use available quantity from product
  const availableQuantity = product.quantityAvailable
    ? Number(product.quantityAvailable)
    : 0;

  // Fetch related products
  const relatedProducts = await ProductService.getRelatedProducts(
    product.id,
    8,
  );

  // Prepare images array
  const images = [
    product.primaryPhotoUrl || "",
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter(Boolean) as string[];

  // Extract product data - farm is included in query
  const farm = product.farm ?? {
    name: "Local Farm",
    slug: "unknown",
    verificationStatus: null,
  };
  const productPrice = Number(product.price);
  const productUnit = product.unit;
  const isOrganic = product.organic;
  const isSeasonal = product.seasonal;
  const isFeatured = product.featured;

  // JSON-LD Structured Data for SEO
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description || `Fresh ${product.name} from ${farm.name}`,
    image: images,
    brand: {
      "@type": "Brand",
      name: farm.name,
    },
    offers: {
      "@type": "Offer",
      price: Number(productPrice),
      priceCurrency: "USD",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: farm.name,
      },
    },
    ...(product.averageRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.averageRating ? Number(product.averageRating) : 0,
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb Navigation */}
          <nav
            className="mb-6 flex items-center gap-2 text-sm text-gray-600"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-green-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href="/marketplace/products"
              className="hover:text-green-600 transition-colors"
            >
              Products
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/marketplace/farms/${farm.slug}`}
              className="hover:text-green-600 transition-colors"
            >
              {farm.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-gray-900">{product.name}</span>
          </nav>

          {/* Main Product Section */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column - Images */}
            <div>
              <ProductImageGallery images={images} productName={product.name} />
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-6">
              {/* Product Header */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  {isOrganic && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                      <Leaf className="h-4 w-4" />
                      Organic
                    </span>
                  )}
                  {isSeasonal && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-800">
                      <Calendar className="h-4 w-4" />
                      Seasonal
                    </span>
                  )}
                  {isFeatured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-800">
                      ⭐ Featured
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 lg:text-4xl">
                  {product.name}
                </h1>

                {/* Farm Info */}
                <Link
                  href={`/marketplace/farms/${farm.slug}`}
                  className="mt-3 inline-flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors"
                >
                  <MapPin className="h-5 w-5" />
                  <span className="font-medium">{farm.name}</span>
                  {farm.verificationStatus === "VERIFIED" && (
                    <span
                      className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800"
                      title="Verified Farm"
                    >
                      ✓ Verified
                    </span>
                  )}
                </Link>

                {/* Rating */}
                {product.averageRating && product.reviewCount > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "h-5 w-5",
                            star <= Number(product.averageRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300",
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {Number(product.averageRating).toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-600">
                      ({product.reviewCount} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="border-t border-b border-gray-200 py-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ${Number(productPrice).toFixed(2)}
                  </span>
                  <span className="text-xl text-gray-600">/ {productUnit}</span>
                </div>
                {product.compareAtPrice &&
                  Number(product.compareAtPrice) > productPrice && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-lg text-gray-500 line-through">
                        ${Number(product.compareAtPrice).toFixed(2)}
                      </span>
                      <span className="rounded-full bg-red-100 px-2 py-1 text-sm font-semibold text-red-800">
                        Save{" "}
                        {(
                          ((Number(product.compareAtPrice) - productPrice) /
                            Number(product.compareAtPrice)) *
                          100
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                  )}
              </div>

              {/* Stock Status */}
              <StockIndicator
                availableQuantity={availableQuantity}
                unit={productUnit}
                lowStockThreshold={10}
                size="lg"
              />

              {/* Description */}
              {product.description && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    About This Product
                  </h2>
                  <p className="mt-2 text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Variant Selector & Add to Cart */}
              <Suspense fallback={<div>Loading...</div>}>
                <ProductActions
                  productId={product.id}
                  farmId={product.farmId}
                  unit={productUnit}
                  price={productPrice}
                  availableQuantity={availableQuantity}
                />
              </Suspense>

              {/* Additional Info */}
              <div className="space-y-3 rounded-lg bg-gray-50 p-4 text-sm">
                {product.harvestDate && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      Harvested:{" "}
                      {new Date(product.harvestDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {product.storageInstructions && (
                  <div className="flex items-start gap-2 text-gray-700">
                    <Package className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                    <span>{product.storageInstructions}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span>100% Farm Fresh Guarantee</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Add to favorites"
                >
                  <Heart className="h-5 w-5" />
                  <span className="font-medium">Save</span>
                </button>
                <button
                  className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Share product"
                >
                  <Share2 className="h-5 w-5" />
                  <span className="font-medium">Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <RelatedProducts
                products={relatedProducts as any}
                currentProductId={product.id}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
