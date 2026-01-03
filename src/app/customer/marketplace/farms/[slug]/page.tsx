import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { database } from "@/lib/database";
import { createLogger } from "@/lib/utils/logger";
import {
  Award,
  Calendar,
  Globe,
  Mail,
  MapPin,
  Package,
  Phone,
  Star,
  Truck,
} from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const farmPageLogger = createLogger("CustomerMarketplaceFarmPage");

// Type definitions
interface PageProps {
  params: Promise<{ slug: string }>;
}

interface FarmData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  story: string | null;
  status: string;
  verificationStatus: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  deliveryRadius: number | null;
  businessName: string | null;
  yearEstablished: number | null;
  farmSize: number | null;
  averageRating: number | null;
  reviewCount: number;
  email: string;
  phone: string;
  website: string | null;
  images: string[];
  logoUrl: string | null;
  bannerUrl: string | null;
  certificationsArray: string[];
  farmingPractices: any;
  productCategories: any;
  profileViewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Direct database access for Server Component - SIMPLIFIED to avoid Prisma panic
async function getFarmBySlug(slug: string) {
  try {
    // Step 1: Fetch farm basic data first
    const farm = await database.farm.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
    });

    if (!farm) {
      return null;
    }

    // Check if farm is accessible
    if (farm.status !== "ACTIVE" || farm.verificationStatus !== "VERIFIED") {
      return null;
    }

    // Step 2: Fetch products separately
    const products = await database.product.findMany({
      where: {
        farmId: farm.id,
        inStock: true,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        unit: true,
        inStock: true,
        images: true,
        category: true,
        organic: true,
        featured: true,
        averageRating: true,
        reviewCount: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Step 3: Fetch reviews separately
    const reviews = await database.review.findMany({
      where: {
        farmId: farm.id,
        status: "APPROVED",
      },
      select: {
        id: true,
        rating: true,
        reviewText: true,
        createdAt: true,
        customerId: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Step 4: Fetch customer data for reviews
    const customerIds = reviews.map((r) => r.customerId);
    const customers = await database.user.findMany({
      where: {
        id: { in: customerIds },
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        avatar: true,
      },
    });

    const customerMap = new Map(customers.map((c) => [c.id, c]));

    // Step 5: Get counts
    const [productsCount, reviewsCount, ordersCount] = await Promise.all([
      database.product.count({ where: { farmId: farm.id } }),
      database.review.count({ where: { farmId: farm.id } }),
      database.order.count({ where: { farmId: farm.id } }),
    ]);

    // Increment profile views (fire and forget)
    database.farm
      .update({
        where: { id: farm.id },
        data: {
          profileViewsCount: { increment: 1 },
        },
      })
      .catch((error) => {
        farmPageLogger.warn("Failed to increment farm view count", {
          farmId: farm.id,
          error: error instanceof Error ? error.message : String(error),
        });
      });

    // Format response data
    return {
      id: farm.id,
      name: farm.name,
      slug: farm.slug,
      description: farm.description,
      story: farm.story,
      status: farm.status,
      verificationStatus: farm.verificationStatus,

      // Location information
      address: farm.address,
      city: farm.city,
      state: farm.state,
      zipCode: farm.zipCode,
      country: farm.country,
      latitude: farm.latitude ? Number(farm.latitude) : null,
      longitude: farm.longitude ? Number(farm.longitude) : null,
      deliveryRadius: farm.deliveryRadius,

      // Business details
      businessName: farm.businessName,
      yearEstablished: farm.yearEstablished,
      farmSize: farm.farmSize ? Number(farm.farmSize) : null,

      // Ratings and reviews
      averageRating: farm.averageRating ? Number(farm.averageRating) : null,
      reviewCount: farm.reviewCount,
      reviews: reviews.map((review) => {
        const customer = customerMap.get(review.customerId);
        return {
          id: review.id,
          rating: Number(review.rating),
          comment: review.reviewText,
          createdAt: review.createdAt.toISOString(),
          customer: {
            id: review.customerId,
            name:
              customer?.name ||
              `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim() ||
              "Anonymous",
            avatar: customer?.avatar || null,
          },
        };
      }),

      // Contact information
      email: farm.email,
      phone: farm.phone,
      website: farm.website,

      // Images
      images: farm.images || [],
      logoUrl: farm.logoUrl,
      bannerUrl: farm.bannerUrl,

      // Metadata
      certifications: Array.isArray(farm.certificationsArray)
        ? (farm.certificationsArray as string[])
        : [],
      farmingPractices: Array.isArray(farm.farmingPractices)
        ? (farm.farmingPractices as string[])
        : [],
      productCategories: Array.isArray(farm.productCategories)
        ? (farm.productCategories as string[])
        : [],

      // Owner information
      owner: {
        id: farm.owner.id,
        name:
          farm.owner.name ||
          `${farm.owner.firstName || ""} ${farm.owner.lastName || ""}`.trim() ||
          "Farm Owner",
        avatar: farm.owner.avatar,
        joinedYear: farm.owner.createdAt.getFullYear(),
      },

      // Products
      products: products.map((product) => {
        const productImages = Array.isArray(product.images)
          ? (product.images as string[])
          : [];
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: Number(product.price),
          unit: product.unit,
          inStock: product.inStock,
          images: productImages,
          category: product.category,
          organic: product.organic,
          featured: product.featured,
          averageRating: product.averageRating
            ? Number(product.averageRating)
            : null,
          reviewCount: product.reviewCount,
        };
      }),

      // Statistics
      stats: {
        totalProducts: productsCount,
        totalReviews: reviewsCount,
        totalOrders: ordersCount,
        profileViews: farm.profileViewsCount,
      },

      // Timestamps
      createdAt: farm.createdAt.toISOString(),
      updatedAt: farm.updatedAt.toISOString(),
    };
  } catch (error) {
    farmPageLogger.error(
      "Failed to fetch farm by slug",
      error instanceof Error ? error : new Error(String(error)),
      {
        slug,
      },
    );
    throw error; // Re-throw to handle in component
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const farm = await getFarmBySlug(slug);

    if (!farm) {
      return {
        title: "Farm Not Found",
        description: "The requested farm could not be found.",
      };
    }

    return {
      title: `${farm.name} | Farmers Market Platform`,
      description: farm.description || `Fresh products from ${farm.name}`,
      openGraph: {
        title: farm.name,
        description: farm.description || `Fresh products from ${farm.name}`,
        images: farm.bannerUrl ? [farm.bannerUrl] : farm.images,
      },
    };
  } catch (error) {
    farmPageLogger.error(
      "Failed to generate farm metadata",
      error instanceof Error ? error : new Error(String(error)),
      {
        slug,
      },
    );
    return {
      title: "Farm Profile | Farmers Market Platform",
      description: "View farm profile and products",
    };
  }
}

// Main page component
export default async function FarmProfilePage({ params }: PageProps) {
  const { slug } = await params;

  let farm;
  try {
    farm = await getFarmBySlug(slug);
  } catch (error) {
    farmPageLogger.error(
      "Farm page render error",
      error instanceof Error ? error : new Error(String(error)),
      {
        slug,
      },
    );
    notFound();
  }

  if (!farm) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-green-600 to-green-800">
        {farm.bannerUrl ? (
          <Image
            src={farm.bannerUrl}
            alt={farm.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <Package className="h-24 w-24 opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="container relative mx-auto px-4 h-full flex items-end pb-8">
          <div className="flex items-end gap-6">
            {/* Farm Logo */}
            <div className="w-32 h-32 rounded-lg bg-white p-2 shadow-xl">
              {farm.logoUrl ? (
                <Image
                  src={farm.logoUrl}
                  alt={`${farm.name} logo`}
                  width={128}
                  height={128}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-green-100 rounded-lg">
                  <Package className="h-16 w-16 text-green-600" />
                </div>
              )}
            </div>

            {/* Farm Info */}
            <div className="text-white pb-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{farm.name}</h1>
                {farm.verificationStatus === "VERIFIED" && (
                  <Badge className="bg-blue-500">
                    <Award className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {farm.city}, {farm.state}
                  </span>
                </div>
                {farm.averageRating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{farm.averageRating}</span>
                    <span className="text-gray-300">
                      ({farm.reviewCount} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About {farm.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{farm.description}</p>
                {farm.story && (
                  <div>
                    <h3 className="font-semibold mb-2">Our Story</h3>
                    <p className="text-gray-600">{farm.story}</p>
                  </div>
                )}
                {farm.yearEstablished && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Established in {farm.yearEstablished}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Products Section */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Available Products ({farm.stats.totalProducts})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {farm.products.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {farm.products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/marketplace/products/${product.slug}`}
                        className="group border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-square relative mb-3 rounded-lg overflow-hidden bg-gray-100">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Package className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold group-hover:text-green-600">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-600">
                            ${product.price.toFixed(2)}/{product.unit}
                          </span>
                          {product.organic && (
                            <Badge variant="outline" className="text-xs">
                              Organic
                            </Badge>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No products available at the moment
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews ({farm.reviewCount})</CardTitle>
              </CardHeader>
              <CardContent>
                {farm.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {farm.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b pb-4 last:border-0"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-sm font-semibold text-green-700">
                                {review.customer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-sm">
                                {review.customer.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  review.createdAt,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 text-sm">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No reviews yet. Be the first to review!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="text-sm">
                    <p>{farm.address}</p>
                    <p>
                      {farm.city}, {farm.state} {farm.zipCode}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <a
                    href={`tel:${farm.phone}`}
                    className="text-sm hover:text-green-600"
                  >
                    {farm.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <a
                    href={`mailto:${farm.email}`}
                    className="text-sm hover:text-green-600"
                  >
                    {farm.email}
                  </a>
                </div>
                {farm.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-500" />
                    <a
                      href={farm.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:text-green-600"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Info */}
            {farm.deliveryRadius && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Delivery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Delivers within {farm.deliveryRadius} miles
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {farm.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {farm.certifications.map((cert, idx) => (
                      <Badge key={idx} variant="outline">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Farm Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Products</span>
                  <span className="font-semibold">
                    {farm.stats.totalProducts}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Reviews</span>
                  <span className="font-semibold">
                    {farm.stats.totalReviews}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profile Views</span>
                  <span className="font-semibold">
                    {farm.stats.profileViews}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
