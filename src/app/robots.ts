/**
 * ROBOTS.TXT GENERATOR
 * Divine search engine crawler configuration
 */

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://farmersmarket.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/farms",
          "/farms/",
          "/products",
          "/products/",
          "/about",
          "/contact",
          "/how-it-works",
          "/faq",
          "/help",
          "/search",
          "/categories",
          "/categories/",
          "/markets",
          "/markets/",
        ],
        disallow: [
          "/api/",
          "/admin/",
          "/admin-login",
          "/farmer/",
          "/account/",
          "/checkout/",
          "/cart/",
          "/orders/",
          "/dashboard/",
          "/_next/",
          "/diagnostic/",
          "/demos/",
          "/*.json$",
          "/register-farm",
          "/signup",
          "/login",
          "/offline",
        ],
        crawlDelay: 1,
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/farms",
          "/products",
          "/categories",
          "/about",
          "/contact",
          "/how-it-works",
          "/faq",
          "/help",
          "/search",
          "/markets",
        ],
        disallow: [
          "/api/",
          "/admin/",
          "/farmer/",
          "/account/",
          "/checkout/",
          "/cart/",
          "/orders/",
          "/dashboard/",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/images/", "/public/images/"],
        disallow: ["/api/", "/admin/"],
      },
      {
        userAgent: "Bingbot",
        allow: [
          "/",
          "/farms",
          "/products",
          "/categories",
          "/about",
          "/contact",
          "/how-it-works",
        ],
        disallow: [
          "/api/",
          "/admin/",
          "/farmer/",
          "/account/",
          "/checkout/",
          "/cart/",
          "/orders/",
        ],
        crawlDelay: 2,
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
      {
        userAgent: "anthropic-ai",
        disallow: "/",
      },
      {
        userAgent: "Claude-Web",
        disallow: "/",
      },
      {
        userAgent: "cohere-ai",
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
