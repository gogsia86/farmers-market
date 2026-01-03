/**
 * 🌾 PRODUCT DETAIL PAGE
 * Divine product showcase with agricultural consciousness
 *
 * Features:
 * - Complete product information
 * - Image gallery
 * - Farm information and link
 * - Add to cart functionality
 * - Product reviews
 * - Related products
 * - Organic certification display
 * - Harvest date and storage info
 * - Stock availability
 * - Server Component with ISR
 *
 * Route: /products/[slug]
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { productService } from "@/lib/services/product.service";
import Link from "next/link";
import { notFound } from "next/navigation";

/**
 * 🌱 PAGE PROPS
 */
interface PageProps {
  params: {
    slug: string;
  };
}

/**
 * 🌾 PRODUCT DETAIL PAGE
 */
export default async function ProductDetailPage({ params }: PageProps) {
  const session = await auth();

  // Extract farmId and slug from the combined slug
  // Format: farmId-product-slug or just product-slug
  // For now, we'll search by slug across all farms
  const products = await database.product.findMany({
    where: {
      slug: params.slug,
      status: "ACTIVE",
    },
    include: {
      farm: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          location: true,
          images: true,
          averageRating: true,
          reviewCount: true,
          status: true,
          verificationStatus: true,
        },
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  // If no products found, return 404
  if (!products || products.length === 0) {
    notFound();
  }

  // Take the first product (should only be one per farm with unique slug)
  const product = products[0]!;
  const farm = product.farm;

  // Format dates
  const harvestDate = product.harvestDate
    ? new Date(product.harvestDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : null;

  const quantity = product.quantityAvailable
    ? Number(product.quantityAvailable)
    : 0;
  const inStock = quantity > 0;
  const lowStock = quantity > 0 && quantity < 10;

  // Parse tags
  const tags =
    product.tags && Array.isArray(product.tags) ? product.tags : [];

  // Get related products from the same farm
  const { products: relatedProducts } = await productService.getProductsByFarm(
    farm.id,
    {
      status: "ACTIVE",
      limit: 4,
    }
  );

  const filteredRelated = relatedProducts.filter((p) => p.id !== product.id);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-900">
            Products
          </Link>
          <span>/</span>
          <Link
            href={`/products?category=${product.category}`}
            className="hover:text-gray-900"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          {/* Image Gallery */}
          <div className="lg:sticky lg:top-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0] as string}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <svg
                    className="h-24 w-24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {product.images.slice(1, 5).map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square overflow-hidden rounded-md bg-gray-100"
                  >
                    <img
                      src={img as string}
                      alt={`${product.name} ${idx + 2}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="mt-8 lg:mt-0">
            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold text-gray-900">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="ml-2 text-xl text-gray-500">
                / {product.unit}
              </span>
            </div>

            {/* Badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              {product.organic && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  🌿 Certified Organic
                </span>
              )}
              {farm.verificationStatus === "VERIFIED" && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  ✓ Verified Farm
                </span>
              )}
              {inStock ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  ✓ In Stock
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Stock Warning */}
            {lowStock && (
              <div className="mt-4 rounded-md bg-yellow-50 p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Only {quantity} {product.unit} left in stock!
                </p>
              </div>
            )}

            {/* Description */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">
                About this product
              </h2>
              <p className="mt-2 text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Harvest Date */}
            {harvestDate && (
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Harvest Date:
                </span>
                <span className="ml-2 text-sm text-gray-700">{harvestDate}</span>
              </div>
            )}

            {/* Storage Instructions */}
            {product.storageInstructions && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Storage Instructions
                </h3>
                <p className="mt-1 text-sm text-gray-700">
                  {product.storageInstructions}
                </p>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-900">Tags</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                    >
                      {tag as string}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="mt-8">
              {inStock ? (
                <button
                  disabled={!session}
                  className="w-full rounded-lg bg-green-600 px-6 py-3 text-lg font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {session ? "🛒 Add to Cart" : "Sign in to Purchase"}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full rounded-lg bg-gray-300 px-6 py-3 text-lg font-semibold text-gray-500 cursor-not-allowed"
                >
                  Out of Stock
                </button>
              )}
              {!session && (
                <p className="mt-2 text-center text-sm text-gray-600">
                  <Link href="/auth/signin" className="text-green-600 hover:text-green-700">
                    Sign in
                  </Link>{" "}
                  to add items to your cart
                </p>
              )}
            </div>

            {/* Farm Information */}
            <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                From the Farm
              </h3>
              <div className="mt-4 flex items-start gap-4">
                {farm.images && farm.images.length > 0 && (
                  <img
                    src={farm.images[0] as string}
                    alt={farm.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{farm.name}</h4>
                  {farm.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {farm.description}
                    </p>
                  )}
                  {farm.averageRating && (
                    <div className="mt-2 flex items-center gap-1 text-sm">
                      <span className="text-yellow-400">★</span>
                      <span className="font-medium text-gray-900">
                        {farm.averageRating.toFixed(1)}
                      </span>
                      <span className="text-gray-500">
                        ({farm.reviewCount} reviews)
                      </span>
                    </div>
                  )}
                  <Link
                    href={`/farms/${farm.slug}`}
                    className="mt-3 inline-block text-sm font-medium text-green-600 hover:text-green-700"
                  >
                    Visit Farm →
                  </Link>
                </div>
              </div>
            </div>

            {/* Product Metrics */}
            <div className="mt-6 grid grid-cols-3 gap-4 rounded-lg border border-gray-200 p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {product.purchaseCount || 0}
                </div>
                <div className="text-xs text-gray-600">Purchases</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {product.reviewCount || 0}
                </div>
                <div className="text-xs text-gray-600">Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {product.averageRating
                    ? product.averageRating.toFixed(1)
                    : "N/A"}
                </div>
                <div className="text-xs text-gray-600">Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900">
              Customer Reviews
            </h2>
            <div className="mt-6 space-y-6">
              {product.reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="rounded-lg border border-gray-200 bg-white p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {review.customer.avatar ? (
                        <img
                          src={review.customer.avatar}
                          alt={`${review.customer.firstName} ${review.customer.lastName}`}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                          {review.customer.firstName?.[0]}
                          {review.customer.lastName?.[0]}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {review.customer.firstName} {review.customer.lastName}
                        </h4>
                        <div className="flex items-center gap-1 text-sm text-yellow-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>
                              {i < review.rating ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <time className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="mt-3 text-gray-700">{review.reviewText}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {filteredRelated.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900">
              More from {farm.name}
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredRelated.map((related) => (
                <Link
                  key={related.id}
                  href={`/products/${related.slug}`}
                  className="group overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5 transition hover:shadow-md"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                    {related.images && related.images.length > 0 ? (
                      <img
                        src={related.images[0] as string}
                        alt={related.name}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <svg
                          className="h-12 w-12"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-green-600">
                      {related.name}
                    </h3>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-lg font-bold text-gray-900">
                        ${Number(related.price).toFixed(2)}
                      </span>
                      <span className="ml-1 text-sm text-gray-500">
                        / {related.unit}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 📄 GENERATE METADATA
 */
export async function generateMetadata({ params }: PageProps) {
  const products = await database.product.findMany({
    where: { slug: params.slug },
    take: 1,
    select: {
      name: true,
      description: true,
      images: true,
    },
  });

  if (!products || products.length === 0) {
    return {
      title: "Product Not Found",
    };
  }

  const product = products[0]!;

  return {
    title: `${product.name} | Farmers Market`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images:
        product.images && product.images.length > 0
          ? [product.images[0] as string]
          : [],
    },
  };
}

/**
 * ⚡ REVALIDATION
 * Revalidate every 10 minutes for fresh data
 */
export const revalidate = 600;
