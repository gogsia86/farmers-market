/**
 * 🌾 FARM DETAIL PAGE
 * Comprehensive farm profile with photo gallery, products, reviews, and certifications
 */

import { farmService } from "@/lib/services/farm.service";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";

// Enable ISR with smart revalidation
// Revalidate every 10 minutes for optimal performance
export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Type definitions for optimized data
type FarmDetailData = Awaited<ReturnType<typeof farmService.getFarmDetailData>>;
type FarmProduct = Awaited<
  ReturnType<typeof farmService.getFarmProducts>
>[number];
type FarmCertification = Awaited<
  ReturnType<typeof farmService.getFarmCertifications>
>[number];

// ============================================================================
// PHOTO GALLERY COMPONENT
// ============================================================================

function FarmPhotoGallery({
  images,
  logoUrl,
  bannerUrl,
  farmName,
}: {
  images: string[];
  logoUrl: string | null;
  bannerUrl: string | null;
  farmName: string;
}) {
  // Collect all available photos
  const allPhotos = [
    ...(bannerUrl ? [bannerUrl] : []),
    ...(logoUrl && logoUrl !== bannerUrl ? [logoUrl] : []),
    ...images,
  ];

  // Always show at least a placeholder
  if (allPhotos.length === 0) {
    return (
      <div className="relative h-96 w-full bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-9xl">🌾</div>
            <p className="text-xl font-semibold text-gray-700">{farmName}</p>
          </div>
        </div>
      </div>
    );
  }

  const primaryPhoto = allPhotos[0];
  const additionalPhotos = allPhotos.slice(1, 5);

  return (
    <div className="mb-8">
      {/* Primary Photo */}
      <div className="relative h-96 w-full overflow-hidden rounded-t-lg">
        <Image
          src={primaryPhoto ?? "/images/placeholder-farm.jpg"}
          alt={`${farmName} - Main Photo`}
          fill
          className="object-cover"
          priority
          quality={85}
          sizes="100vw"
        />
      </div>

      {/* Additional Photos Grid */}
      {additionalPhotos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 rounded-b-lg bg-white p-2 md:grid-cols-4">
          {additionalPhotos.map((photo: any, index: any) => (
            <div
              key={index}
              className="relative h-24 overflow-hidden rounded-md"
            >
              <Image
                src={photo}
                alt={`${farmName} - Photo ${index + 2}`}
                fill
                className="object-cover transition-transform hover:scale-110"
                loading="lazy"
                quality={75}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          ))}
          {allPhotos.length > 5 && (
            <div className="relative flex h-24 items-center justify-center rounded-md bg-gray-100">
              <span className="text-lg font-semibold text-gray-600">
                +{allPhotos.length - 5} more
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FARM PRODUCTS COMPONENT
// ============================================================================

// Optimized product fetching with caching via service layer
async function FarmProducts({ farmId }: { farmId: string }) {
  const products = await farmService.getFarmProducts(farmId, 12);

  if (products.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
          <span className="text-3xl">📦</span>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          No products available
        </h3>
        <p className="text-gray-600">
          This farm hasn&apos;t listed any products yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product: any) => {
        // Get product image - always show something
        const productImage =
          product.primaryPhotoUrl ||
          (product.images && product.images.length > 0
            ? product.images[0]
            : null);

        return (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-lg"
          >
            {/* Product Image - ALWAYS SHOW */}
            <div className="relative h-48 w-full overflow-hidden bg-gray-100">
              {productImage ? (
                <Image
                  src={productImage}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                  quality={80}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
                  <span className="text-6xl">🥬</span>
                </div>
              )}

              {/* Badges */}
              <div className="absolute left-2 top-2 flex flex-col gap-1">
                {product.featured && (
                  <span className="rounded-full bg-yellow-500 px-2 py-1 text-xs font-semibold text-white">
                    Featured
                  </span>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-green-700">
                {product.name}
              </h3>
              {product.description && (
                <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                  {product.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-green-700">
                  ${product.price.toString()}
                  <span className="text-sm font-normal text-gray-600">
                    /{product.unit}
                  </span>
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ============================================================================
// FARM CERTIFICATIONS COMPONENT
// ============================================================================

// Optimized certification fetching with caching via service layer
async function FarmCertifications({ farmId }: { farmId: string }) {
  const certifications = await farmService.getFarmCertifications(farmId);

  if (certifications.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h3 className="mb-4 flex items-center text-xl font-bold text-gray-900">
        <span className="mr-2">✓</span> Certifications
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {certifications.map((cert: any) => (
          <div key={cert.id} className="flex items-start rounded-lg border p-4">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <span className="text-xl">🏅</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">
                {cert.type.replace(/_/g, " ")}
              </h4>
              <p className="text-sm text-gray-600">{cert.certifierName}</p>
              {cert.expirationDate && (
                <p className="mt-1 text-xs text-gray-500">
                  Valid until{" "}
                  {new Date(cert.expirationDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

// Cached farm data fetching with React cache for request deduplication
// This ensures the same farm data is only fetched once per request
const getFarmData = cache(async (slug: string) => {
  const data = await farmService.getFarmDetailData(slug);
  return data;
});

export default async function FarmDetailPage({ params }: PageProps) {
  // Await params in Next.js 15 (params is now a Promise)
  const { slug } = await params;

  // Optimized data fetching with service layer caching
  const farm = await getFarmData(slug);

  if (!farm) {
    notFound();
  }

  // Collect all photo URLs
  const photoUrls = farm?.photos?.map((photo: any) => photo.photoUrl) ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Photo Gallery - Loaded immediately with farm data */}
      <FarmPhotoGallery
        images={[...photoUrls, ...farm.images]}
        logoUrl={farm.logoUrl}
        bannerUrl={farm.bannerUrl}
        farmName={farm.name}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Farm Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h1 className="text-4xl font-bold text-gray-900">
                  {farm.name}
                </h1>
                {farm.verificationStatus === "VERIFIED" && (
                  <span className="flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                    <svg
                      className="mr-1 h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified Farm
                  </span>
                )}
              </div>

              {/* Location */}
              <div className="mb-4 flex items-center text-gray-600">
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>
                  {farm.city}, {farm.state} {farm.zipCode}
                </span>
              </div>

              {/* Description */}
              {farm.description && (
                <p className="mb-4 text-lg text-gray-700">{farm.description}</p>
              )}

              {/* Story */}
              {farm.story && (
                <div className="mb-4 rounded-lg bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    Our Story
                  </h3>
                  <p className="whitespace-pre-line text-gray-700">
                    {farm.story}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar Info */}
            <div className="w-full lg:w-80">
              <div className="rounded-lg bg-white p-6 shadow-md">
                {/* Stats */}
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {farm._count.products}
                    </div>
                    <div className="text-sm text-gray-600">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {farm._count.reviews}
                    </div>
                    <div className="text-sm text-gray-600">Reviews</div>
                  </div>
                </div>

                {/* Rating */}
                {farm.averageRating && (
                  <div className="mb-4 border-t pt-4">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {farm.averageRating.toString()}
                      </span>
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_: any, i: any) => (
                          <svg
                            key={i}
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-3 border-t pt-4">
                  {farm.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        className="mr-2 h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span>{farm.phone}</span>
                    </div>
                  )}
                  {farm.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        className="mr-2 h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{farm.email}</span>
                    </div>
                  )}
                  {farm.website && (
                    <a
                      href={farm.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-green-700 hover:underline"
                    >
                      <svg
                        className="mr-2 h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                      <span>Visit Website</span>
                    </a>
                  )}
                </div>

                {/* Year Established */}
                {farm.yearEstablished && (
                  <div className="mt-4 border-t pt-4 text-center text-sm text-gray-600">
                    Established in {farm.yearEstablished}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Certifications Section */}
        <Suspense
          fallback={
            <div className="mb-8 h-32 animate-pulse rounded-lg bg-white" />
          }
        >
          <div className="mb-8">
            <FarmCertifications farmId={farm.id} />
          </div>
        </Suspense>

        {/* Products Section */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Products</h2>
              <p className="text-gray-600">Fresh produce from {farm.name}</p>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_: any, i: any) => (
                  <div
                    key={i}
                    className="h-80 animate-pulse rounded-lg bg-white"
                  />
                ))}
              </div>
            }
          >
            <FarmProducts farmId={farm.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LOADING SKELETONS
// ============================================================================

function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_: any, i: any) => (
        <div
          key={i}
          className="animate-pulse rounded-lg bg-white p-4 shadow-sm"
        >
          <div className="mb-4 aspect-square rounded-lg bg-gray-200" />
          <div className="mb-2 h-5 w-3/4 rounded bg-gray-200" />
          <div className="mb-3 h-4 w-1/2 rounded bg-gray-200" />
          <div className="mb-2 h-6 w-1/3 rounded bg-gray-200" />
          <div className="h-10 w-full rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

function CertificationsSkeleton() {
  return (
    <section className="mb-12">
      <h2 className="mb-6 text-3xl font-bold text-gray-900">Certifications</h2>
      <div className="space-y-4">
        {[...Array(3)].map((_: any, i: any) => (
          <div
            key={i}
            className="animate-pulse rounded-lg bg-white p-6 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-1/3 rounded bg-gray-200" />
                <div className="h-4 w-1/2 rounded bg-gray-200" />
                <div className="h-4 w-2/3 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// METADATA (Optimized with minimal fields)
// ============================================================================

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // Await params in Next.js 15 (params is now a Promise)
  const { slug } = await params;

  // Use cached farm data for metadata generation
  const farm = await getFarmData(slug);

  if (!farm) {
    return {
      title: "Farm Not Found",
    };
  }

  const image =
    farm?.bannerUrl ||
    farm?.logoUrl ||
    (farm?.images && farm.images[0]) ||
    "/images/placeholder-farm.jpg";

  return {
    title: `${farm.name} | Fresh Farm`,
    description: farm.description || `Discover fresh produce from ${farm.name}`,
    openGraph: {
      title: farm.name,
      description:
        farm.description || `Discover fresh produce from ${farm.name}`,
      images: [image],
    },
  };
}
