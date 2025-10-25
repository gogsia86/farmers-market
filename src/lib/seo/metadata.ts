/**
 * SEO METADATA GENERATOR
 * Divine search engine optimization utilities
 */

import type { Metadata } from 'next';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
}

/**
 * Generate comprehensive SEO metadata
 */
export function generateSEO(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = '/images/og-default.jpg',
    url = 'https://farmersmarket.app',
    type = 'website',
  } = config;

  const fullTitle = `${title} | Farmers Market`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    
    // Open Graph (Facebook, LinkedIn)
    openGraph: {
      title: fullTitle,
      description,
      url,
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: 'Farmers Market',
      locale: 'en_US',
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@farmersmarket',
      site: '@farmersmarket',
    },

    // Additional meta tags
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Verification
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
    },
  };
}

/**
 * Product SEO metadata
 */
export function generateProductSEO(product: {
  name: string;
  description: string;
  price: number;
  image: string;
  farmName: string;
  category: string;
}) {
  return generateSEO({
    title: `${product.name} - ${product.farmName}`,
    description: `${product.description} | Fresh from ${product.farmName}. Order now for $${product.price}`,
    keywords: [
      product.name,
      product.category,
      'local farm',
      'organic',
      'fresh produce',
      product.farmName,
      'farmers market',
    ],
    image: product.image,
    type: 'product',
  });
}

/**
 * Farm SEO metadata
 */
export function generateFarmSEO(farm: {
  name: string;
  description: string;
  location: string;
  image: string;
  products: string[];
}) {
  return generateSEO({
    title: farm.name,
    description: `${farm.description} | Located in ${farm.location}. Shop fresh local produce from ${farm.name}.`,
    keywords: [
      farm.name,
      'local farm',
      farm.location,
      'organic farm',
      'farmers market',
      ...farm.products,
    ],
    image: farm.image,
    type: 'profile',
  });
}

/**
 * Blog/Article SEO metadata
 */
export function generateArticleSEO(article: {
  title: string;
  description: string;
  author: string;
  publishedAt: Date;
  image: string;
  tags: string[];
}) {
  return generateSEO({
    title: article.title,
    description: article.description,
    keywords: [...article.tags, 'farming', 'agriculture', 'local food'],
    image: article.image,
    type: 'article',
  });
}

/**
 * Generate JSON-LD structured data for products
 */
export function generateProductSchema(product: {
  name: string;
  description: string;
  price: number;
  image: string;
  farmName: string;
  rating?: number;
  reviewCount?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.farmName,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: product.farmName,
      },
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 0,
      },
    }),
  };
}

/**
 * Generate JSON-LD structured data for farms
 */
export function generateFarmSchema(farm: {
  name: string;
  description: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  image: string;
  rating?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `https://farmersmarket.app/farms/${farm.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: farm.name,
    description: farm.description,
    image: farm.image,
    address: {
      '@type': 'PostalAddress',
      streetAddress: farm.address,
    },
    ...(farm.phone && { telephone: farm.phone }),
    ...(farm.email && { email: farm.email }),
    ...(farm.website && { url: farm.website }),
    ...(farm.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: farm.rating,
      },
    }),
  };
}

/**
 * Generate sitemap entries
 */
export function generateSitemapEntry(url: string, priority: number = 0.5, changeFreq: string = 'weekly') {
  return {
    url: `https://farmersmarket.app${url}`,
    lastModified: new Date(),
    changeFrequency: changeFreq as 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
    priority,
  };
}

/**
 * Agricultural SEO keywords by category
 */
export const AGRICULTURAL_KEYWORDS = {
  vegetables: ['fresh vegetables', 'organic vegetables', 'local vegetables', 'seasonal vegetables'],
  fruits: ['fresh fruits', 'organic fruits', 'local fruits', 'seasonal fruits'],
  dairy: ['farm fresh dairy', 'organic dairy', 'local dairy', 'raw milk'],
  meat: ['farm fresh meat', 'grass fed', 'pasture raised', 'organic meat'],
  eggs: ['farm fresh eggs', 'free range eggs', 'organic eggs', 'pasture raised eggs'],
  honey: ['local honey', 'raw honey', 'organic honey', 'farm honey'],
  general: [
    'farmers market',
    'local farm',
    'organic farm',
    'farm to table',
    'support local farmers',
    'buy local',
    'fresh produce',
    'sustainable farming',
  ],
};
