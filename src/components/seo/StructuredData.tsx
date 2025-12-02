/**
 * STRUCTURED DATA (JSON-LD) COMPONENTS
 * SEO-optimized structured data for Google rich snippets
 *
 * Supports:
 * - Product schema
 * - Farm/LocalBusiness schema
 * - Organization schema
 * - BreadcrumbList schema
 * - Review/Rating schema
 */

// ============================================
// PRODUCT STRUCTURED DATA
// ============================================

interface ProductStructuredDataProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency?: string;
    image: string | string[];
    availability: "InStock" | "OutOfStock" | "PreOrder" | "Discontinued";
    sku?: string;
    brand?: string;
    rating?: number;
    reviewCount?: number;
    farm: {
      name: string;
    };
    category?: string;
  };
}

export function ProductStructuredData({ product }: ProductStructuredDataProps) {
  const images = Array.isArray(product.image) ? product.image : [product.image];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `https://farmersmarket.app/products/${product.id}`,
    name: product.name,
    description: product.description,
    image: images,
    ...(product.sku && { sku: product.sku }),
    ...(product.category && { category: product.category }),
    brand: {
      "@type": "Brand",
      name: product.brand || product.farm.name,
    },
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: product.currency || "USD",
      availability: `https://schema.org/${product.availability}`,
      url: `https://farmersmarket.app/products/${product.id}`,
      seller: {
        "@type": "Organization",
        name: product.farm.name,
      },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    ...(product.rating &&
      product.reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// ============================================
// FARM/LOCAL BUSINESS STRUCTURED DATA
// ============================================

interface FarmStructuredDataProps {
  farm: {
    id: string;
    name: string;
    description: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    phone?: string;
    email?: string;
    website?: string;
    image?: string;
    rating?: number;
    reviewCount?: number;
    latitude: number;
    longitude: number;
    priceRange?: string;
    openingHours?: string[];
  };
}

export function FarmStructuredData({ farm }: FarmStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://farmersmarket.app/farms/${farm.id}`,
    name: farm.name,
    description: farm.description,
    ...(farm.image && { image: farm.image }),
    address: {
      "@type": "PostalAddress",
      streetAddress: farm.address,
      addressLocality: farm.city,
      addressRegion: farm.state,
      postalCode: farm.zipCode,
      addressCountry: farm.country || "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: farm.latitude,
      longitude: farm.longitude,
    },
    ...(farm.phone && { telephone: farm.phone }),
    ...(farm.email && { email: farm.email }),
    ...(farm.website && { url: farm.website }),
    ...(farm.priceRange && { priceRange: farm.priceRange }),
    ...(farm.openingHours && {
      openingHoursSpecification: farm.openingHours.map((hours) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: hours.split(":")[0],
        opens: hours.split(":")[1]?.split("-")[0],
        closes: hours.split(":")[1]?.split("-")[1],
      })),
    }),
    ...(farm.rating &&
      farm.reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: farm.rating,
          reviewCount: farm.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// ============================================
// ORGANIZATION STRUCTURED DATA (Homepage)
// ============================================

interface OrganizationStructuredDataProps {
  name?: string;
  description?: string;
  logo?: string;
  url?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialProfiles?: string[];
}

export function OrganizationStructuredData({
  name = "Farmers Market Platform",
  description = "Connect with local farmers and buy fresh, organic produce directly from the source",
  logo = "https://farmersmarket.app/logo.png",
  url = "https://farmersmarket.app",
  contactEmail = "support@farmersmarket.app",
  contactPhone = "+1-555-0100",
  socialProfiles = [],
}: OrganizationStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    description,
    url,
    logo,
    contactPoint: {
      "@type": "ContactPoint",
      email: contactEmail,
      telephone: contactPhone,
      contactType: "customer service",
      availableLanguage: ["English", "Spanish", "French"],
    },
    ...(socialProfiles.length > 0 && { sameAs: socialProfiles }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// ============================================
// BREADCRUMB STRUCTURED DATA
// ============================================

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbStructuredDataProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbStructuredData({
  items,
}: BreadcrumbStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// ============================================
// REVIEW STRUCTURED DATA
// ============================================

interface ReviewStructuredDataProps {
  reviews: Array<{
    author: string;
    rating: number;
    reviewBody: string;
    datePublished: Date;
  }>;
  itemReviewed: {
    type: "Product" | "LocalBusiness";
    name: string;
    image?: string;
  };
}

export function ReviewStructuredData({
  reviews,
  itemReviewed,
}: ReviewStructuredDataProps) {
  const structuredData = reviews.map((review) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    author: {
      "@type": "Person",
      name: review.author,
    },
    datePublished: review.datePublished.toISOString(),
    reviewBody: review.reviewBody,
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    itemReviewed: {
      "@type": itemReviewed.type,
      name: itemReviewed.name,
      ...(itemReviewed.image && { image: itemReviewed.image }),
    },
  }));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// ============================================
// SEARCH ACTION STRUCTURED DATA
// ============================================

export function SearchActionStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://farmersmarket.app",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://farmersmarket.app/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// ============================================
// RECIPE STRUCTURED DATA (Future use)
// ============================================

interface RecipeStructuredDataProps {
  recipe: {
    name: string;
    description: string;
    image: string;
    author: string;
    datePublished: Date;
    prepTime: string; // ISO 8601 duration (e.g., "PT30M")
    cookTime: string;
    totalTime: string;
    recipeYield: string;
    recipeCategory?: string;
    recipeCuisine?: string;
    ingredients: string[];
    instructions: string[];
    nutrition?: {
      calories: string;
      proteinContent?: string;
      fatContent?: string;
      carbohydrateContent?: string;
    };
    rating?: number;
    reviewCount?: number;
  };
}

export function RecipeStructuredData({ recipe }: RecipeStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.name,
    description: recipe.description,
    image: recipe.image,
    author: {
      "@type": "Person",
      name: recipe.author,
    },
    datePublished: recipe.datePublished.toISOString(),
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: recipe.totalTime,
    recipeYield: recipe.recipeYield,
    ...(recipe.recipeCategory && { recipeCategory: recipe.recipeCategory }),
    ...(recipe.recipeCuisine && { recipeCuisine: recipe.recipeCuisine }),
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.instructions.map((instruction, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: instruction,
    })),
    ...(recipe.nutrition && {
      nutrition: {
        "@type": "NutritionInformation",
        calories: recipe.nutrition.calories,
        ...(recipe.nutrition.proteinContent && {
          proteinContent: recipe.nutrition.proteinContent,
        }),
        ...(recipe.nutrition.fatContent && {
          fatContent: recipe.nutrition.fatContent,
        }),
        ...(recipe.nutrition.carbohydrateContent && {
          carbohydrateContent: recipe.nutrition.carbohydrateContent,
        }),
      },
    }),
    ...(recipe.rating &&
      recipe.reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: recipe.rating,
          reviewCount: recipe.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// ============================================
// FAQ STRUCTURED DATA
// ============================================

interface FAQStructuredDataProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQStructuredData({ faqs }: FAQStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// ============================================
// EXPORT ALL
// ============================================

export default {
  ProductStructuredData,
  FarmStructuredData,
  OrganizationStructuredData,
  BreadcrumbStructuredData,
  ReviewStructuredData,
  SearchActionStructuredData,
  RecipeStructuredData,
  FAQStructuredData,
};
