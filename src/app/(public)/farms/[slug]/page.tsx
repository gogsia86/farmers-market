/**
 * 🌾 FARM DETAIL PAGE - DIVINE AGRICULTURAL PROFILE
 *
 * Comprehensive farm profile featuring:
 * - Farm story and about section
 * - Products from this farm
 * - Certifications and farming practices
 * - Contact information
 * - Reviews and ratings
 * - Location and delivery info
 *
 * DIVINE PRINCIPLES:
 * - Agricultural consciousness in every interaction
 * - Holographic component patterns
 * - Quantum data loading
 * - Biodynamic user experience
 *
 * ✅ DIRECT DATABASE ACCESS - Server Component pattern
 */

import {
  ArrowLeft,
  Award,
  Globe,
  Heart,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Shield,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { database } from "@/lib/database";

interface PageProps {
  readonly params: Promise<{
    slug: string;
  }>;
}

// Force dynamic rendering - don't try to pre-generate all possible slugs
export const dynamic = "force-dynamic";
export const dynamicParams = true;

// Direct database access for Server Component (no API fetch needed)
async function getFarmBySlug(slug: string) {
  try {
    // Fetch farm with all related data directly from database
    const farm = await database.farm.findUnique({
      where: {
        slug,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true,
          },
        },
        products: {
          where: {
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
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        },
        reviews: {
          where: {
            status: "APPROVED",
          },
          select: {
            id: true,
            rating: true,
            reviewText: true,
            createdAt: true,
            customer: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        _count: {
          select: {
            products: true,
            reviews: true,
            orders: true,
          },
        },
      },
    });

    // Check if farm exists
    if (!farm) {
      return null;
    }

    // Check if farm is accessible (active and verified for public viewing)
    if (farm.status !== "ACTIVE" || farm.verificationStatus !== "VERIFIED") {
      return null;
    }

    // Increment profile views count (fire and forget)
    database.farm
      .update({
        where: { id: farm.id },
        data: {
          profileViewsCount: {
            increment: 1,
          },
        },
      })
      .catch((error) => {
        console.error("[FARM_VIEW_COUNT_ERROR]", error);
        // Don't fail the request if view count update fails
      });

    // Format response data with proper type conversions
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
      reviews: farm.reviews.map((review) => ({
        id: review.id,
        rating: Number(review.rating),
        comment: review.reviewText,
        createdAt: review.createdAt.toISOString(),
        customer: {
          id: review.customer.id,
          name: review.customer.name,
          avatar: review.customer.avatar,
        },
      })),

      // Contact information
      email: farm.email,
      phone: farm.phone,
      website: farm.website,

      // Images
      images: farm.images || [],
      logoUrl: farm.logoUrl,
      bannerUrl: farm.bannerUrl,

      // Metadata
      certifications: farm.certificationsArray || [],
      farmingPractices: farm.farmingPractices || [],
      productCategories: farm.productCategories || [],

      // Owner information
      owner: {
        id: farm.owner.id,
        name:
          farm.owner.name ||
          `${farm.owner.firstName || ""} ${farm.owner.lastName || ""}`.trim(),
        avatar: farm.owner.avatar,
        joinedYear: farm.owner.createdAt.getFullYear(),
      },

      // Products
      products: farm.products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: Number(product.price),
        unit: product.unit,
        inStock: product.inStock,
        images: product.images || [],
        category: product.category,
        organic: product.organic,
        featured: product.featured,
        averageRating: product.averageRating
          ? Number(product.averageRating)
          : null,
        reviewCount: product.reviewCount,
      })),

      // Statistics
      stats: {
        totalProducts: farm._count.products,
        totalReviews: farm._count.reviews,
        totalOrders: farm._count.orders,
        profileViews: farm.profileViewsCount,
      },

      // Timestamps
      createdAt: farm.createdAt.toISOString(),
      updatedAt: farm.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("[FARM_FETCH_ERROR]", error);
    return null;
  }
}

export default async function FarmDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const farm = await getFarmBySlug(resolvedParams.slug);

  if (!farm) {
    notFound();
  }

  // Transform API data to match component expectations
  // Cast JSON fields to proper arrays
  const certifications = Array.isArray(farm.certifications)
    ? (farm.certifications as string[])
    : [];
  const farmingPractices = Array.isArray(farm.farmingPractices)
    ? (farm.farmingPractices as string[])
    : [];
  const productCategories = Array.isArray(farm.productCategories)
    ? (farm.productCategories as string[])
    : [];

  const transformedFarm = {
    id: farm.id,
    name: farm.name,
    slug: farm.slug,
    tagline: farm.description || "",
    description: farm.description || "",
    story: farm.story || "",
    farmType: farm.businessName || "Farm",
    address: farm.address || "",
    city: farm.city || "",
    state: farm.state || "",
    zipCode: farm.zipCode || "",
    deliveryRadius: farm.deliveryRadius || 0,
    farmSize: farm.farmSize ? `${farm.farmSize} acres` : "N/A",
    establishedYear: farm.yearEstablished || new Date().getFullYear(),
    rating: farm.averageRating || 0,
    reviewCount: farm.reviewCount || 0,
    certifications,
    farmingPractices,
    specialties: productCategories,
    email: farm.email || "",
    phone: farm.phone || "",
    website: farm.website || "",
    products: farm.products.map((product) => {
      const productImages = Array.isArray(product.images)
        ? (product.images as string[])
        : [];
      return {
        id: product.id,
        name: product.name,
        description: product.description || "",
        price: product.price,
        unit: product.unit || "each",
        category: product.category || "general",
        inStock: product.inStock,
        image: productImages[0] || "🌾",
        organic: product.organic || false,
      };
    }),
    owner: {
      name: farm.owner?.name || "Farm Owner",
      bio: "",
      joinedYear: farm.owner?.joinedYear || farm.yearEstablished,
    },
  };

  const categories = Array.from(
    new Set(transformedFarm.products.map((p) => p.category)),
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-agricultural-600">
              Home
            </Link>
            <span>/</span>
            <Link href="/farms" className="hover:text-agricultural-600">
              Farms
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              {transformedFarm.name}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-agricultural-50 to-green-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <Link
              href="/farms"
              className="inline-flex items-center gap-2 text-agricultural-600 hover:text-agricultural-700 mb-6 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to All Farms
            </Link>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Farm Image/Logo */}
                <div className="md:col-span-1">
                  <div className="w-full aspect-square bg-gradient-to-br from-agricultural-100 to-green-100 rounded-2xl flex items-center justify-center text-8xl shadow-md">
                    🏡
                  </div>
                </div>

                {/* Farm Info */}
                <div className="md:col-span-2">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {transformedFarm.name}
                      </h1>
                      <p className="text-xl text-gray-600 mb-4">
                        {transformedFarm.tagline}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        aria-label="Add farm to favorites"
                      >
                        <Heart className="h-5 w-5 text-gray-600" />
                      </button>
                      <button
                        className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        aria-label="Share this farm"
                      >
                        <Share2 className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Location & Rating */}
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-5 w-5" />
                      <span>
                        {transformedFarm.city}, {transformedFarm.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">
                        {transformedFarm.rating > 0
                          ? transformedFarm.rating.toFixed(1)
                          : "New"}
                      </span>
                      <span className="text-gray-600">
                        ({transformedFarm.reviewCount} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Truck className="h-5 w-5" />
                      <span>
                        Delivers within {transformedFarm.deliveryRadius} miles
                      </span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-agricultural-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-agricultural-600 mb-1">
                        {transformedFarm.farmSize}
                      </div>
                      <div className="text-sm text-gray-600">Farm Size</div>
                    </div>
                    <div className="bg-agricultural-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-agricultural-600 mb-1">
                        {new Date().getFullYear() -
                          transformedFarm.establishedYear}
                      </div>
                      <div className="text-sm text-gray-600">Years Farming</div>
                    </div>
                    <div className="bg-agricultural-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-agricultural-600 mb-1">
                        {transformedFarm.products.length}
                      </div>
                      <div className="text-sm text-gray-600">Products</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button className="bg-agricultural-600 hover:bg-agricultural-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Contact Farm
                    </button>
                    {transformedFarm.phone && (
                      <a
                        href={`tel:${transformedFarm.phone}`}
                        className="border-2 border-agricultural-600 text-agricultural-600 hover:bg-agricultural-50 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                      >
                        <Phone className="h-5 w-5" />
                        Call Now
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* About Section */}
                <div className="bg-white rounded-2xl shadow-md p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Leaf className="h-6 w-6 text-agricultural-600" />
                    Our Story
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    {transformedFarm.story
                      .split("\n\n")
                      .map((paragraph: string, idx: number) => (
                        <p key={idx} className="text-gray-700 mb-4">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </div>

                {/* Farming Practices */}
                <div className="bg-white rounded-2xl shadow-md p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="h-6 w-6 text-agricultural-600" />
                    Our Practices
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {transformedFarm.farmingPractices.map((practice) => (
                      <div
                        key={practice}
                        className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-agricultural-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Leaf className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-gray-900 font-medium">
                          {practice}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Products Section */}
                <div className="bg-white rounded-2xl shadow-md p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <ShoppingBag className="h-6 w-6 text-agricultural-600" />
                    Our Products
                  </h2>

                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <button className="px-4 py-2 bg-agricultural-600 text-white rounded-lg font-medium">
                      All
                    </button>
                    {categories.map((category) => (
                      <button
                        key={String(category)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        {String(category)}
                      </button>
                    ))}
                  </div>

                  {/* Products Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {transformedFarm.products.map((product) => (
                      <div
                        key={product.id}
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-agricultural-50 to-green-50 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
                            {product.image}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 mb-1">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-agricultural-600">
                                ${product.price}/{product.unit}
                              </span>
                              {product.inStock ? (
                                <button className="bg-agricultural-600 hover:bg-agricultural-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                                  Add
                                </button>
                              ) : (
                                <span className="text-sm text-gray-500">
                                  Out of Stock
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Contact Card */}
                <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          Address
                        </div>
                        <div className="text-sm text-gray-600">
                          {transformedFarm.address}
                        </div>
                      </div>
                    </div>

                    {transformedFarm.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            Phone
                          </div>
                          <a
                            href={`tel:${transformedFarm.phone}`}
                            className="text-sm text-agricultural-600 hover:text-agricultural-700"
                          >
                            {transformedFarm.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {transformedFarm.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            Email
                          </div>
                          <a
                            href={`mailto:${transformedFarm.email}`}
                            className="text-sm text-agricultural-600 hover:text-agricultural-700 break-all"
                          >
                            {transformedFarm.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {transformedFarm.website && (
                      <div className="flex items-start gap-3">
                        <Globe className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            Website
                          </div>
                          <a
                            href={transformedFarm.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-agricultural-600 hover:text-agricultural-700 break-all"
                          >
                            {transformedFarm.website.replace(
                              /^https?:\/\//,
                              "",
                            )}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Certifications */}
                {transformedFarm.certifications.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-agricultural-600" />
                      Certifications
                    </h3>
                    <div className="space-y-2">
                      {transformedFarm.certifications.map((cert: string) => (
                        <div
                          key={cert}
                          className="flex items-center gap-2 p-3 bg-green-50 rounded-lg"
                        >
                          <Shield className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {cert}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specialties */}
                {transformedFarm.specialties.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Specialties
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {transformedFarm.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="px-3 py-1.5 bg-agricultural-50 text-agricultural-700 rounded-full text-sm font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
