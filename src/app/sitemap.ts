/**
 * DYNAMIC SITEMAP GENERATOR
 * Divine SEO sitemap for search engines
 */

import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://farmersmarket.app";

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/farms`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  // Dynamic farm pages
  const farms = await getFarms();
  const farmPages = farms.map((farm) => ({
    url: `${baseUrl}/farms/${farm.slug}`,
    lastModified: farm.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic product pages
  const products = await getProducts();
  const productPages = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...farmPages, ...productPages];
}

/**
 * Get all farms for sitemap
 */
async function getFarms() {
  // Mock data (in production, query database)
  return [
    {
      slug: "sunshine-valley-farm",
      updatedAt: new Date("2025-10-20"),
    },
    {
      slug: "green-acres-organic",
      updatedAt: new Date("2025-10-18"),
    },
    {
      slug: "heritage-homestead",
      updatedAt: new Date("2025-10-15"),
    },
  ];
}

/**
 * Get all products for sitemap
 */
async function getProducts() {
  // Mock data (in production, query database)
  return [
    {
      slug: "organic-tomatoes",
      updatedAt: new Date("2025-10-24"),
    },
    {
      slug: "fresh-strawberries",
      updatedAt: new Date("2025-10-23"),
    },
    {
      slug: "raw-honey",
      updatedAt: new Date("2025-10-22"),
    },
  ];
}
