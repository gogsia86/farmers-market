/**
 * DYNAMIC SITEMAP GENERATOR - REAL DATABASE INTEGRATION
 * Divine SEO sitemap with actual platform data
 */

import { database } from "@/lib/database";
import { createLogger } from "@/lib/utils/logger";
import { MetadataRoute } from "next";

// Create logger for sitemap generation
const sitemapLogger = createLogger("Sitemap");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://farmersmarket.app";

  try {
    // Static pages with correct priorities
    const staticPages: MetadataRoute.Sitemap = [
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
        priority: 0.6,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/how-it-works`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/faq`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/help`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
    ];

    // Real dynamic farm pages from database
    const farms = await database.farm.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 1000, // Limit for performance
    });

    const farmPages: MetadataRoute.Sitemap = farms.map((farm) => ({
      url: `${baseUrl}/farms/${farm.slug}`,
      lastModified: farm.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Real dynamic product pages from database
    const products = await database.product.findMany({
      where: {
        status: "ACTIVE",
        inStock: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 2000, // Limit for performance
    });

    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

    // Category pages (if you have a Category model)
    let categoryPages: MetadataRoute.Sitemap = [];
    try {
      const categories = await database.$queryRaw<
        Array<{ slug: string; updatedAt: Date }>
      >`
        SELECT DISTINCT category as slug, MAX("updatedAt") as "updatedAt"
        FROM products
        WHERE category IS NOT NULL
        GROUP BY category
      `;

      categoryPages = categories.map((category) => ({
        url: `${baseUrl}/categories/${category.slug.toLowerCase().replace(/\s+/g, "-")}`,
        lastModified: category.updatedAt || new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    } catch (error) {
      sitemapLogger.warn("Error fetching categories for sitemap", {
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      // Continue without category pages if there's an error
    }

    // Combine all pages
    const allPages = [
      ...staticPages,
      ...farmPages,
      ...productPages,
      ...categoryPages,
    ];

    sitemapLogger.info("Sitemap generated successfully", {
      totalUrls: allPages.length,
      staticPages: staticPages.length,
      farmPages: farmPages.length,
      productPages: productPages.length,
      categoryPages: categoryPages.length,
    });

    return allPages;
  } catch (error) {
    sitemapLogger.error(
      "Error generating sitemap",
      error instanceof Error ? error : new Error(String(error)),
    );

    // Fallback to static pages only if database fails
    return [
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
    ];
  }
}
