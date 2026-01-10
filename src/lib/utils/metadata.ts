/**
 * 🌟 DIVINE METADATA UTILITY
 * Farmers Market Platform - SEO & Metadata Management
 * Version: 1.0.0
 *
 * Features:
 * - Next.js 15 Metadata API integration
 * - Open Graph tags
 * - Twitter Cards
 * - JSON-LD Structured Data
 * - Agricultural consciousness patterns
 * - Divine SEO optimization
 */

import { Metadata } from "next";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MetadataConfig {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "product" | "profile";
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
  canonical?: string;
}

export interface FarmMetadataConfig extends MetadataConfig {
  farmName: string;
  location: string;
  rating?: number;
  reviewCount?: number;
  products?: number;
}

export interface ProductMetadataConfig extends MetadataConfig {
  productName: string;
  price: number;
  currency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  category: string;
  farmName: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://farmersmarket.com";
const siteName = "Farmers Market Platform";
const defaultImage = "/og-image-default.jpg";
const twitterHandle = "@farmersmarket";

// ============================================================================
// CORE METADATA GENERATION
// ============================================================================

/**
 * Generate comprehensive metadata for any page
 *
 * @param config - Metadata configuration
 * @returns Next.js Metadata object
 */
export function generateMetadata(config: MetadataConfig): Metadata {
  const {
    title,
    description,
    path = "/",
    image = defaultImage,
    type = "website",
    keywords = [],
    author,
    publishedTime,
    modifiedTime,
    noIndex = false,
    canonical,
  } = config;

  const fullUrl = canonical || `${baseUrl}${path}`;
  const fullTitle = title === "Home" ? siteName : `${title} | ${siteName}`;
  const imageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`;

  const openGraphConfig: Record<string, any> = {
    title: fullTitle,
    description,
    url: fullUrl,
    siteName,
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
    locale: "en_US",
    type: type === "product" ? "website" : type,
  };

  if (publishedTime) {
    openGraphConfig.publishedTime = publishedTime;
  }

  if (modifiedTime) {
    openGraphConfig.modifiedTime = modifiedTime;
  }

  return {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
    authors: author ? [{ name: author }] : undefined,

    metadataBase: new URL(baseUrl),

    alternates: {
      canonical: fullUrl,
    },

    openGraph: openGraphConfig,

    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: twitterHandle,
      site: twitterHandle,
    },

    robots: {
      index: !noIndex,
      follow: !noIndex,
      nocache: noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    },

    other: {
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "format-detection": "telephone=no",
    },
  };
}

// ============================================================================
// SPECIALIZED METADATA GENERATORS
// ============================================================================

/**
 * Generate metadata for farm pages with agricultural consciousness
 */
export function generateFarmMetadata(config: FarmMetadataConfig): Metadata {
  const {
    farmName,
    location,
    rating,
    reviewCount,
    products,
    description,
    ...baseConfig
  } = config;

  const enhancedDescription =
    description ||
    `Visit ${farmName} in ${location}. ${rating ? `Rated ${rating}/5 stars with ${reviewCount} reviews.` : ""} ${products ? `Offering ${products}+ fresh products.` : ""} Support sustainable, local agriculture.`;

  const keywords = [
    farmName.toLowerCase(),
    location.toLowerCase(),
    "local farm",
    "organic farm",
    "sustainable agriculture",
    "farm to table",
    "fresh produce",
    "local food",
  ];

  return generateMetadata({
    ...baseConfig,
    description: enhancedDescription,
    keywords,
    type: "profile",
  });
}

/**
 * Generate metadata for product pages with e-commerce optimization
 */
export function generateProductMetadata(
  config: ProductMetadataConfig,
): Metadata {
  const {
    productName,
    price,
    currency = "USD",
    availability = "InStock",
    category,
    farmName,
    description,
    ...baseConfig
  } = config;

  const enhancedDescription =
    description ||
    `Fresh ${productName} from ${farmName}. ${availability === "InStock" ? "Available now" : "Currently unavailable"} for $${price.toFixed(2)}. ${category} category. Support local, sustainable farming.`;

  const keywords = [
    productName.toLowerCase(),
    category.toLowerCase(),
    farmName.toLowerCase(),
    "fresh",
    "organic",
    "local",
    "farm fresh",
    "sustainable",
  ];

  return generateMetadata({
    ...baseConfig,
    description: enhancedDescription,
    keywords,
    type: "product",
  });
}

// ============================================================================
// JSON-LD STRUCTURED DATA GENERATORS
// ============================================================================

/**
 * Generate JSON-LD structured data
 *
 * @param type - Schema.org type
 * @param data - Structured data object
 * @returns JSON-LD object
 */
export function generateJsonLd(type: string, data: Record<string, any>) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };
}

/**
 * Generate LocalBusiness schema for farm pages
 */
export function generateFarmJsonLd(farm: {
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviewCount?: number;
}) {
  return generateJsonLd("LocalBusiness", {
    name: farm.name,
    description: farm.description,
    image: farm.logoUrl,
    "@id": `${baseUrl}/farms/${farm.name.toLowerCase().replace(/\s+/g, "-")}`,
    url:
      farm.website ||
      `${baseUrl}/farms/${farm.name.toLowerCase().replace(/\s+/g, "-")}`,
    telephone: farm.phone,
    email: farm.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: farm.address,
      addressLocality: farm.city,
      addressRegion: farm.state,
      postalCode: farm.zipCode,
      addressCountry: "US",
    },
    geo:
      farm.latitude && farm.longitude
        ? {
            "@type": "GeoCoordinates",
            latitude: farm.latitude,
            longitude: farm.longitude,
          }
        : undefined,
    aggregateRating:
      farm.rating && farm.reviewCount
        ? {
            "@type": "AggregateRating",
            ratingValue: farm.rating,
            reviewCount: farm.reviewCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    openingHours: "Mo-Su 00:00-24:00", // 24/7 online
    priceRange: "$$",
  });
}

/**
 * Generate Product schema for product pages
 */
export function generateProductJsonLd(product: {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  imageUrl?: string;
  category: string;
  farmName: string;
  rating?: number;
  reviewCount?: number;
}) {
  return generateJsonLd("Product", {
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    brand: {
      "@type": "Brand",
      name: product.farmName,
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/products/${product.name.toLowerCase().replace(/\s+/g, "-")}`,
      priceCurrency: product.currency || "USD",
      price: product.price,
      availability: `https://schema.org/${product.availability || "InStock"}`,
      seller: {
        "@type": "Organization",
        name: product.farmName,
      },
    },
    category: product.category,
    aggregateRating:
      product.rating && product.reviewCount
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  });
}

/**
 * Generate Organization schema for main site
 */
export function generateOrganizationJsonLd() {
  return generateJsonLd("Organization", {
    name: siteName,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      "Connect directly with local farmers and buy fresh, organic produce",
    sameAs: [
      "https://twitter.com/farmersmarket",
      "https://facebook.com/farmersmarket",
      "https://instagram.com/farmersmarket",
      "https://linkedin.com/company/farmersmarket",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "support@farmersmarket.com",
      availableLanguage: ["en"],
    },
  });
}

/**
 * Generate WebSite schema with search action
 */
export function generateWebsiteJsonLd() {
  return generateJsonLd("WebSite", {
    name: siteName,
    url: baseUrl,
    description:
      "Connect directly with local farmers and buy fresh, organic produce",
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  });
}

/**
 * Generate BreadcrumbList schema for navigation
 */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
) {
  return generateJsonLd("BreadcrumbList", {
    itemListElement: items.map((item: any, index: any) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  });
}

// ============================================================================
// AGRICULTURAL CONSCIOUSNESS METADATA
// ============================================================================

/**
 * Add seasonal context to metadata
 */
export function addSeasonalContext(
  metadata: Metadata,
  season: "SPRING" | "SUMMER" | "FALL" | "WINTER",
): Metadata {
  const seasonalDescriptions = {
    SPRING: "Fresh spring harvest",
    SUMMER: "Abundant summer produce",
    FALL: "Rich fall harvest",
    WINTER: "Hearty winter crops",
  };

  return {
    ...metadata,
    description: `${metadata.description} ${seasonalDescriptions[season]}.`,
  };
}

/**
 * Add biodynamic consciousness to structured data
 */
export function addBiodynamicContext(
  jsonLd: Record<string, any>,
  certifications?: string[],
) {
  return {
    ...jsonLd,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Farming Practice",
        value: "Biodynamic & Sustainable",
      },
      ...(certifications || []).map((cert: any) => ({
        "@type": "PropertyValue",
        name: "Certification",
        value: cert,
      })),
    ],
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Sanitize text for SEO
 */
export function sanitizeForSeo(text: string, maxLength: number = 160): string {
  return text
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
    .slice(0, maxLength)
    .trim();
}

/**
 * Generate slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string, count: number = 10): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((word: any) => word.length > 3);

  const frequency = new Map<string, number>();
  words.forEach((word: any) => {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  });

  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

// ============================================================================
// EXPORT DEFAULT CONFIGS
// ============================================================================

export const defaultMetadata: Metadata = {
  title: siteName,
  description:
    "Connect directly with local farmers and buy fresh, organic produce. Support sustainable agriculture and get farm-fresh products delivered to your door.",
  keywords:
    "farmers market, organic produce, local farms, fresh vegetables, sustainable agriculture, farm to table",
};

export const defaultFarmKeywords = [
  "local farm",
  "organic farm",
  "sustainable agriculture",
  "farm to table",
  "fresh produce",
  "family farm",
  "regenerative agriculture",
  "biodynamic farming",
];

export const defaultProductKeywords = [
  "organic",
  "fresh",
  "local",
  "sustainable",
  "farm fresh",
  "seasonal",
  "natural",
  "pesticide-free",
];
