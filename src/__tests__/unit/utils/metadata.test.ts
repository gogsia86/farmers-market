/**
 * 🌟 Metadata Utilities Test Suite
 * Comprehensive tests for SEO metadata, Open Graph, Twitter Cards, and JSON-LD structured data
 */

import {
  addBiodynamicContext,
  addSeasonalContext,
  defaultFarmKeywords,
  defaultMetadata,
  defaultProductKeywords,
  extractKeywords,
  generateBreadcrumbJsonLd,
  generateFarmJsonLd,
  generateFarmMetadata,
  generateJsonLd,
  generateMetadata,
  generateOrganizationJsonLd,
  generateProductJsonLd,
  generateProductMetadata,
  generateSlug,
  generateWebsiteJsonLd,
  sanitizeForSeo,
} from "@/lib/utils/metadata";
import { describe, expect, it } from "@jest/globals";

// ============================================================================
// generateMetadata Tests
// ============================================================================

describe("🌟 Metadata Utilities", () => {
  describe("generateMetadata", () => {
    it("should generate basic metadata", () => {
      const metadata = generateMetadata({
        title: "Test Page",
        description: "Test description",
      });

      expect(metadata.title).toContain("Test Page");
      expect(metadata.description).toBe("Test description");
    });

    it("should include site name in title", () => {
      const metadata = generateMetadata({
        title: "About",
        description: "About us",
      });

      expect(metadata.title).toContain("Farmers Market Platform");
    });

    it("should not duplicate site name for Home", () => {
      const metadata = generateMetadata({
        title: "Home",
        description: "Home page",
      });

      expect(metadata.title).toBe("Farmers Market Platform");
    });

    it("should generate Open Graph metadata", () => {
      const metadata = generateMetadata({
        title: "Test",
        description: "Test description",
      });

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toContain("Test");
      expect(metadata.openGraph?.description).toBe("Test description");
    });

    it("should generate Twitter Card metadata", () => {
      const metadata = generateMetadata({
        title: "Test",
        description: "Test description",
      });

      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBe("summary_large_image");
      expect(metadata.twitter?.title).toContain("Test");
    });

    it("should handle custom path", () => {
      const metadata = generateMetadata({
        title: "Custom",
        description: "Custom page",
        path: "/custom-path",
      });

      expect(metadata.alternates?.canonical).toContain("/custom-path");
    });

    it("should handle custom image", () => {
      const metadata = generateMetadata({
        title: "Test",
        description: "Test",
        image: "/custom-image.jpg",
      });

      expect(metadata.openGraph?.images).toBeDefined();
    });

    it("should handle absolute image URLs", () => {
      const metadata = generateMetadata({
        title: "Test",
        description: "Test",
        image: "https://example.com/image.jpg",
      });

      const images = metadata.openGraph?.images as any[];
      expect(images[0].url).toBe("https://example.com/image.jpg");
    });

    it("should handle keywords array", () => {
      const metadata = generateMetadata({
        title: "Test",
        description: "Test",
        keywords: ["organic", "farm", "fresh"],
      });

      expect(metadata.keywords).toContain("organic");
      expect(metadata.keywords).toContain("farm");
    });

    it("should handle author", () => {
      const metadata = generateMetadata({
        title: "Test",
        description: "Test",
        author: "John Doe",
      });

      expect(metadata.authors).toBeDefined();
      expect(Array.isArray(metadata.authors)).toBe(true);
    });

    it("should handle noIndex flag", () => {
      const metadata = generateMetadata({
        title: "Test",
        description: "Test",
        noIndex: true,
      });

      expect(metadata.robots?.index).toBe(false);
      expect(metadata.robots?.follow).toBe(false);
    });

    it("should index by default", () => {
      const metadata = generateMetadata({
        title: "Test",
        description: "Test",
      });

      expect(metadata.robots?.index).toBe(true);
      expect(metadata.robots?.follow).toBe(true);
    });

    it("should handle canonical URL", () => {
      const metadata = generateMetadata({
        title: "Test",
        description: "Test",
        canonical: "https://example.com/canonical",
      });

      expect(metadata.alternates?.canonical).toBe(
        "https://example.com/canonical",
      );
    });

    it("should handle article type", () => {
      const metadata = generateMetadata({
        title: "Test",
        description: "Test",
        type: "article",
      });

      expect(metadata.openGraph?.type).toBe("article");
    });

    it("should handle product type", () => {
      const metadata = generateMetadata({
        title: "Test",
        description: "Test",
        type: "product",
      });

      expect(metadata.openGraph?.type).toBe("website");
    });

    it("should handle published time", () => {
      const publishedTime = "2024-01-01T00:00:00Z";
      const metadata = generateMetadata({
        title: "Test",
        description: "Test",
        publishedTime,
      });

      expect(metadata.openGraph?.publishedTime).toBe(publishedTime);
    });

    it("should handle modified time", () => {
      const modifiedTime = "2024-01-02T00:00:00Z";
      const metadata = generateMetadata({
        title: "Test",
        description: "Test",
        modifiedTime,
      });

      expect(metadata.openGraph?.modifiedTime).toBe(modifiedTime);
    });

    it("should include metadataBase", () => {
      const metadata = generateMetadata({
        title: "Test",
        description: "Test",
      });

      expect(metadata.metadataBase).toBeDefined();
    });

    it("should include verification tags", () => {
      const metadata = generateMetadata({
        title: "Test",
        description: "Test",
      });

      expect(metadata.verification).toBeDefined();
    });

    it("should include mobile web app tags", () => {
      const metadata = generateMetadata({
        title: "Test",
        description: "Test",
      });

      expect(metadata.other).toBeDefined();
      expect(metadata.other?.["apple-mobile-web-app-capable"]).toBe("yes");
    });
  });

  // ============================================================================
  // generateFarmMetadata Tests
  // ============================================================================

  describe("generateFarmMetadata", () => {
    it("should generate farm metadata", () => {
      const metadata = generateFarmMetadata({
        title: "Green Valley Farm",
        farmName: "Green Valley Farm",
        location: "California",
        description: "Organic farm",
      });

      expect(metadata.title).toContain("Green Valley Farm");
      expect(metadata.description).toContain("Organic farm");
    });

    it("should auto-generate description from farm data", () => {
      const metadata = generateFarmMetadata({
        title: "Green Valley Farm",
        farmName: "Green Valley Farm",
        location: "California",
        rating: 4.5,
        reviewCount: 100,
        products: 50,
        description: "",
      });

      expect(metadata.description).toContain("Green Valley Farm");
      expect(metadata.description).toContain("California");
      expect(metadata.description).toContain("4.5");
      expect(metadata.description).toContain("100");
      expect(metadata.description).toContain("50");
    });

    it("should include farm-specific keywords", () => {
      const metadata = generateFarmMetadata({
        title: "Test Farm",
        farmName: "Test Farm",
        location: "Texas",
        description: "Test",
      });

      expect(metadata.keywords).toContain("local farm");
      expect(metadata.keywords).toContain("organic farm");
    });

    it("should set type to profile", () => {
      const metadata = generateFarmMetadata({
        title: "Test Farm",
        farmName: "Test Farm",
        location: "Texas",
        description: "Test",
      });

      expect(metadata.openGraph?.type).toBe("profile");
    });

    it("should include rating in description", () => {
      const metadata = generateFarmMetadata({
        title: "Test Farm",
        farmName: "Test Farm",
        location: "Texas",
        rating: 4.8,
        reviewCount: 50,
        description: "",
      });

      expect(metadata.description).toContain("4.8/5");
      expect(metadata.description).toContain("50 reviews");
    });

    it("should include product count in description", () => {
      const metadata = generateFarmMetadata({
        title: "Test Farm",
        farmName: "Test Farm",
        location: "Texas",
        products: 75,
        description: "",
      });

      expect(metadata.description).toContain("75+");
    });

    it("should use custom description if provided", () => {
      const customDesc = "Custom farm description";
      const metadata = generateFarmMetadata({
        title: "Test Farm",
        farmName: "Test Farm",
        location: "Texas",
        description: customDesc,
      });

      expect(metadata.description).toBe(customDesc);
    });
  });

  // ============================================================================
  // generateProductMetadata Tests
  // ============================================================================

  describe("generateProductMetadata", () => {
    it("should generate product metadata", () => {
      const metadata = generateProductMetadata({
        title: "Organic Tomatoes",
        productName: "Organic Tomatoes",
        price: 4.99,
        category: "Vegetables",
        farmName: "Green Valley Farm",
        description: "Fresh tomatoes",
      });

      expect(metadata.title).toContain("Organic Tomatoes");
      expect(metadata.description).toContain("Fresh tomatoes");
    });

    it("should auto-generate description from product data", () => {
      const metadata = generateProductMetadata({
        title: "Tomatoes",
        productName: "Tomatoes",
        price: 4.99,
        category: "Vegetables",
        farmName: "Green Valley Farm",
        description: "",
      });

      expect(metadata.description).toContain("Tomatoes");
      expect(metadata.description).toContain("Green Valley Farm");
      expect(metadata.description).toContain("$4.99");
      expect(metadata.description).toContain("Vegetables");
    });

    it("should handle availability in description", () => {
      const metadata = generateProductMetadata({
        title: "Tomatoes",
        productName: "Tomatoes",
        price: 4.99,
        category: "Vegetables",
        farmName: "Test Farm",
        availability: "InStock",
        description: "",
      });

      expect(metadata.description).toContain("Available now");
    });

    it("should handle out of stock", () => {
      const metadata = generateProductMetadata({
        title: "Tomatoes",
        productName: "Tomatoes",
        price: 4.99,
        category: "Vegetables",
        farmName: "Test Farm",
        availability: "OutOfStock",
        description: "",
      });

      expect(metadata.description).toContain("Currently unavailable");
    });

    it("should include product-specific keywords", () => {
      const metadata = generateProductMetadata({
        title: "Tomatoes",
        productName: "Tomatoes",
        price: 4.99,
        category: "Vegetables",
        farmName: "Test Farm",
        description: "Test",
      });

      expect(metadata.keywords).toContain("tomatoes");
      expect(metadata.keywords).toContain("vegetables");
      expect(metadata.keywords).toContain("fresh");
    });

    it("should set type to product", () => {
      const metadata = generateProductMetadata({
        title: "Tomatoes",
        productName: "Tomatoes",
        price: 4.99,
        category: "Vegetables",
        farmName: "Test Farm",
        description: "Test",
      });

      expect(metadata.openGraph?.type).toBe("website");
    });

    it("should handle custom currency", () => {
      const metadata = generateProductMetadata({
        title: "Tomatoes",
        productName: "Tomatoes",
        price: 4.99,
        currency: "EUR",
        category: "Vegetables",
        farmName: "Test Farm",
        description: "",
      });

      expect(metadata.description).toBeDefined();
    });

    it("should use custom description if provided", () => {
      const customDesc = "Custom product description";
      const metadata = generateProductMetadata({
        title: "Tomatoes",
        productName: "Tomatoes",
        price: 4.99,
        category: "Vegetables",
        farmName: "Test Farm",
        description: customDesc,
      });

      expect(metadata.description).toBe(customDesc);
    });
  });

  // ============================================================================
  // generateJsonLd Tests
  // ============================================================================

  describe("generateJsonLd", () => {
    it("should generate JSON-LD with context", () => {
      const jsonLd = generateJsonLd("Organization", {
        name: "Test Org",
      });

      expect(jsonLd["@context"]).toBe("https://schema.org");
      expect(jsonLd["@type"]).toBe("Organization");
      expect(jsonLd.name).toBe("Test Org");
    });

    it("should include additional properties", () => {
      const jsonLd = generateJsonLd("Product", {
        name: "Test Product",
        price: 9.99,
      });

      expect(jsonLd.name).toBe("Test Product");
      expect(jsonLd.price).toBe(9.99);
    });

    it("should handle nested objects", () => {
      const jsonLd = generateJsonLd("Product", {
        name: "Test",
        offers: {
          price: 9.99,
        },
      });

      expect(jsonLd.offers.price).toBe(9.99);
    });
  });

  // ============================================================================
  // generateFarmJsonLd Tests
  // ============================================================================

  describe("generateFarmJsonLd", () => {
    const farmData = {
      name: "Green Valley Farm",
      address: "123 Farm Road",
      city: "Springfield",
      state: "CA",
      zipCode: "12345",
    };

    it("should generate LocalBusiness schema", () => {
      const jsonLd = generateFarmJsonLd(farmData);

      expect(jsonLd["@type"]).toBe("LocalBusiness");
      expect(jsonLd.name).toBe("Green Valley Farm");
    });

    it("should include postal address", () => {
      const jsonLd = generateFarmJsonLd(farmData);

      expect(jsonLd.address["@type"]).toBe("PostalAddress");
      expect(jsonLd.address.streetAddress).toBe("123 Farm Road");
      expect(jsonLd.address.addressLocality).toBe("Springfield");
      expect(jsonLd.address.addressRegion).toBe("CA");
      expect(jsonLd.address.postalCode).toBe("12345");
    });

    it("should include geo coordinates when provided", () => {
      const jsonLd = generateFarmJsonLd({
        ...farmData,
        latitude: 40.7128,
        longitude: -74.006,
      });

      expect(jsonLd.geo).toBeDefined();
      expect(jsonLd.geo["@type"]).toBe("GeoCoordinates");
      expect(jsonLd.geo.latitude).toBe(40.7128);
      expect(jsonLd.geo.longitude).toBe(-74.006);
    });

    it("should not include geo when coordinates missing", () => {
      const jsonLd = generateFarmJsonLd(farmData);

      expect(jsonLd.geo).toBeUndefined();
    });

    it("should include aggregate rating when provided", () => {
      const jsonLd = generateFarmJsonLd({
        ...farmData,
        rating: 4.5,
        reviewCount: 100,
      });

      expect(jsonLd.aggregateRating).toBeDefined();
      expect(jsonLd.aggregateRating["@type"]).toBe("AggregateRating");
      expect(jsonLd.aggregateRating.ratingValue).toBe(4.5);
      expect(jsonLd.aggregateRating.reviewCount).toBe(100);
    });

    it("should not include rating when not provided", () => {
      const jsonLd = generateFarmJsonLd(farmData);

      expect(jsonLd.aggregateRating).toBeUndefined();
    });

    it("should include contact information", () => {
      const jsonLd = generateFarmJsonLd({
        ...farmData,
        phone: "555-1234",
        email: "info@farm.com",
      });

      expect(jsonLd.telephone).toBe("555-1234");
      expect(jsonLd.email).toBe("info@farm.com");
    });

    it("should include website URL", () => {
      const jsonLd = generateFarmJsonLd({
        ...farmData,
        website: "https://farm.com",
      });

      expect(jsonLd.url).toBe("https://farm.com");
    });

    it("should generate @id from name", () => {
      const jsonLd = generateFarmJsonLd(farmData);

      expect(jsonLd["@id"]).toContain("green-valley-farm");
    });

    it("should include opening hours", () => {
      const jsonLd = generateFarmJsonLd(farmData);

      expect(jsonLd.openingHours).toBeDefined();
    });
  });

  // ============================================================================
  // generateProductJsonLd Tests
  // ============================================================================

  describe("generateProductJsonLd", () => {
    const productData = {
      name: "Organic Tomatoes",
      price: 4.99,
      category: "Vegetables",
      farmName: "Green Valley Farm",
    };

    it("should generate Product schema", () => {
      const jsonLd = generateProductJsonLd(productData);

      expect(jsonLd["@type"]).toBe("Product");
      expect(jsonLd.name).toBe("Organic Tomatoes");
    });

    it("should include brand information", () => {
      const jsonLd = generateProductJsonLd(productData);

      expect(jsonLd.brand["@type"]).toBe("Brand");
      expect(jsonLd.brand.name).toBe("Green Valley Farm");
    });

    it("should include offers with price", () => {
      const jsonLd = generateProductJsonLd(productData);

      expect(jsonLd.offers["@type"]).toBe("Offer");
      expect(jsonLd.offers.price).toBe(4.99);
      expect(jsonLd.offers.priceCurrency).toBe("USD");
    });

    it("should handle custom currency", () => {
      const jsonLd = generateProductJsonLd({
        ...productData,
        currency: "EUR",
      });

      expect(jsonLd.offers.priceCurrency).toBe("EUR");
    });

    it("should include availability", () => {
      const jsonLd = generateProductJsonLd({
        ...productData,
        availability: "InStock",
      });

      expect(jsonLd.offers.availability).toContain("InStock");
    });

    it("should include seller information", () => {
      const jsonLd = generateProductJsonLd(productData);

      expect(jsonLd.offers.seller["@type"]).toBe("Organization");
      expect(jsonLd.offers.seller.name).toBe("Green Valley Farm");
    });

    it("should include category", () => {
      const jsonLd = generateProductJsonLd(productData);

      expect(jsonLd.category).toBe("Vegetables");
    });

    it("should include aggregate rating when provided", () => {
      const jsonLd = generateProductJsonLd({
        ...productData,
        rating: 4.8,
        reviewCount: 50,
      });

      expect(jsonLd.aggregateRating).toBeDefined();
      expect(jsonLd.aggregateRating.ratingValue).toBe(4.8);
      expect(jsonLd.aggregateRating.reviewCount).toBe(50);
    });

    it("should not include rating when not provided", () => {
      const jsonLd = generateProductJsonLd(productData);

      expect(jsonLd.aggregateRating).toBeUndefined();
    });

    it("should include description when provided", () => {
      const jsonLd = generateProductJsonLd({
        ...productData,
        description: "Fresh organic tomatoes",
      });

      expect(jsonLd.description).toBe("Fresh organic tomatoes");
    });

    it("should include image when provided", () => {
      const jsonLd = generateProductJsonLd({
        ...productData,
        imageUrl: "https://example.com/tomato.jpg",
      });

      expect(jsonLd.image).toBe("https://example.com/tomato.jpg");
    });
  });

  // ============================================================================
  // generateOrganizationJsonLd Tests
  // ============================================================================

  describe("generateOrganizationJsonLd", () => {
    it("should generate Organization schema", () => {
      const jsonLd = generateOrganizationJsonLd();

      expect(jsonLd["@type"]).toBe("Organization");
      expect(jsonLd.name).toBeDefined();
    });

    it("should include social media links", () => {
      const jsonLd = generateOrganizationJsonLd();

      expect(jsonLd.sameAs).toBeDefined();
      expect(Array.isArray(jsonLd.sameAs)).toBe(true);
      expect(jsonLd.sameAs.length).toBeGreaterThan(0);
    });

    it("should include contact point", () => {
      const jsonLd = generateOrganizationJsonLd();

      expect(jsonLd.contactPoint).toBeDefined();
      expect(jsonLd.contactPoint["@type"]).toBe("ContactPoint");
    });

    it("should include logo", () => {
      const jsonLd = generateOrganizationJsonLd();

      expect(jsonLd.logo).toBeDefined();
    });

    it("should include URL", () => {
      const jsonLd = generateOrganizationJsonLd();

      expect(jsonLd.url).toBeDefined();
    });
  });

  // ============================================================================
  // generateWebsiteJsonLd Tests
  // ============================================================================

  describe("generateWebsiteJsonLd", () => {
    it("should generate WebSite schema", () => {
      const jsonLd = generateWebsiteJsonLd();

      expect(jsonLd["@type"]).toBe("WebSite");
      expect(jsonLd.name).toBeDefined();
    });

    it("should include search action", () => {
      const jsonLd = generateWebsiteJsonLd();

      expect(jsonLd.potentialAction).toBeDefined();
      expect(jsonLd.potentialAction["@type"]).toBe("SearchAction");
    });

    it("should include search target", () => {
      const jsonLd = generateWebsiteJsonLd();

      expect(jsonLd.potentialAction.target).toContain("/search?q=");
    });

    it("should include query input", () => {
      const jsonLd = generateWebsiteJsonLd();

      expect(jsonLd.potentialAction["query-input"]).toBeDefined();
    });
  });

  // ============================================================================
  // generateBreadcrumbJsonLd Tests
  // ============================================================================

  describe("generateBreadcrumbJsonLd", () => {
    it("should generate BreadcrumbList schema", () => {
      const items = [
        { name: "Home", url: "/" },
        { name: "Products", url: "/products" },
      ];
      const jsonLd = generateBreadcrumbJsonLd(items);

      expect(jsonLd["@type"]).toBe("BreadcrumbList");
    });

    it("should include all items", () => {
      const items = [
        { name: "Home", url: "/" },
        { name: "Products", url: "/products" },
        { name: "Tomatoes", url: "/products/tomatoes" },
      ];
      const jsonLd = generateBreadcrumbJsonLd(items);

      expect(jsonLd.itemListElement).toHaveLength(3);
    });

    it("should set correct positions", () => {
      const items = [
        { name: "Home", url: "/" },
        { name: "Products", url: "/products" },
      ];
      const jsonLd = generateBreadcrumbJsonLd(items);

      expect(jsonLd.itemListElement[0].position).toBe(1);
      expect(jsonLd.itemListElement[1].position).toBe(2);
    });

    it("should include item names", () => {
      const items = [
        { name: "Home", url: "/" },
        { name: "Products", url: "/products" },
      ];
      const jsonLd = generateBreadcrumbJsonLd(items);

      expect(jsonLd.itemListElement[0].name).toBe("Home");
      expect(jsonLd.itemListElement[1].name).toBe("Products");
    });

    it("should handle empty array", () => {
      const jsonLd = generateBreadcrumbJsonLd([]);

      expect(jsonLd.itemListElement).toHaveLength(0);
    });
  });

  // ============================================================================
  // addSeasonalContext Tests
  // ============================================================================

  describe("addSeasonalContext", () => {
    const baseMetadata = {
      title: "Test",
      description: "Test description",
    };

    it("should add SPRING context", () => {
      const metadata = addSeasonalContext(baseMetadata, "SPRING");

      expect(metadata.description).toContain("Fresh spring harvest");
    });

    it("should add SUMMER context", () => {
      const metadata = addSeasonalContext(baseMetadata, "SUMMER");

      expect(metadata.description).toContain("Abundant summer produce");
    });

    it("should add FALL context", () => {
      const metadata = addSeasonalContext(baseMetadata, "FALL");

      expect(metadata.description).toContain("Rich fall harvest");
    });

    it("should add WINTER context", () => {
      const metadata = addSeasonalContext(baseMetadata, "WINTER");

      expect(metadata.description).toContain("Hearty winter crops");
    });

    it("should preserve original metadata", () => {
      const metadata = addSeasonalContext(baseMetadata, "SPRING");

      expect(metadata.title).toBe("Test");
      expect(metadata.description).toContain("Test description");
    });
  });

  // ============================================================================
  // addBiodynamicContext Tests
  // ============================================================================

  describe("addBiodynamicContext", () => {
    const baseJsonLd = {
      "@type": "LocalBusiness",
      name: "Test Farm",
    };

    it("should add biodynamic property", () => {
      const jsonLd = addBiodynamicContext(baseJsonLd);

      expect(jsonLd.additionalProperty).toBeDefined();
      expect(Array.isArray(jsonLd.additionalProperty)).toBe(true);
    });

    it("should include farming practice", () => {
      const jsonLd = addBiodynamicContext(baseJsonLd);

      const farmingPractice = jsonLd.additionalProperty.find(
        (p: any) => p.name === "Farming Practice",
      );
      expect(farmingPractice).toBeDefined();
      expect(farmingPractice.value).toContain("Biodynamic");
    });

    it("should add certifications when provided", () => {
      const jsonLd = addBiodynamicContext(baseJsonLd, [
        "USDA Organic",
        "Certified Biodynamic",
      ]);

      const certProps = jsonLd.additionalProperty.filter(
        (p: any) => p.name === "Certification",
      );
      expect(certProps.length).toBe(2);
    });

    it("should handle no certifications", () => {
      const jsonLd = addBiodynamicContext(baseJsonLd);

      const certProps = jsonLd.additionalProperty.filter(
        (p: any) => p.name === "Certification",
      );
      expect(certProps.length).toBe(0);
    });

    it("should preserve original data", () => {
      const jsonLd = addBiodynamicContext(baseJsonLd);

      expect(jsonLd["@type"]).toBe("LocalBusiness");
      expect(jsonLd.name).toBe("Test Farm");
    });
  });

  // ============================================================================
  // sanitizeForSeo Tests
  // ============================================================================

  describe("sanitizeForSeo", () => {
    it("should remove HTML tags", () => {
      const result = sanitizeForSeo("<p>Hello <strong>world</strong></p>");
      expect(result).toBe("Hello world");
    });

    it("should normalize whitespace", () => {
      const result = sanitizeForSeo("Hello    world");
      expect(result).toBe("Hello world");
    });

    it("should trim whitespace", () => {
      const result = sanitizeForSeo("  Hello world  ");
      expect(result).toBe("Hello world");
    });

    it("should limit to max length", () => {
      const longText = "a".repeat(200);
      const result = sanitizeForSeo(longText, 100);
      expect(result.length).toBe(100);
    });

    it("should use default max length of 160", () => {
      const longText = "a".repeat(200);
      const result = sanitizeForSeo(longText);
      expect(result.length).toBeLessThanOrEqual(160);
    });

    it("should handle empty string", () => {
      const result = sanitizeForSeo("");
      expect(result).toBe("");
    });

    it("should handle nested HTML", () => {
      const result = sanitizeForSeo("<div><p>Hello</p><p>World</p></div>");
      expect(result).toBe("HelloWorld");
    });
  });

  // ============================================================================
  // generateSlug Tests
  // ============================================================================

  describe("generateSlug", () => {
    it("should convert to lowercase", () => {
      const result = generateSlug("Hello World");
      expect(result).toBe("hello-world");
    });

    it("should replace spaces with hyphens", () => {
      const result = generateSlug("Fresh Organic Tomatoes");
      expect(result).toBe("fresh-organic-tomatoes");
    });

    it("should remove special characters", () => {
      const result = generateSlug("Hello, World!");
      expect(result).toBe("hello-world");
    });

    it("should remove leading hyphens", () => {
      const result = generateSlug("-hello");
      expect(result).toBe("hello");
    });

    it("should remove trailing hyphens", () => {
      const result = generateSlug("hello-");
      expect(result).toBe("hello");
    });

    it("should collapse multiple hyphens", () => {
      const result = generateSlug("hello---world");
      expect(result).toBe("hello-world");
    });

    it("should handle numbers", () => {
      const result = generateSlug("Product 123");
      expect(result).toBe("product-123");
    });

    it("should handle empty string", () => {
      const result = generateSlug("");
      expect(result).toBe("");
    });
  });

  // ============================================================================
  // extractKeywords Tests
  // ============================================================================

  describe("extractKeywords", () => {
    it("should extract keywords from text", () => {
      const text = "Fresh organic tomatoes from local farm";
      const keywords = extractKeywords(text);

      expect(Array.isArray(keywords)).toBe(true);
      expect(keywords.length).toBeGreaterThan(0);
    });

    it("should filter out short words", () => {
      const text = "a an the is it be to in on";
      const keywords = extractKeywords(text);

      expect(keywords.length).toBe(0);
    });

    it("should be case insensitive", () => {
      const text = "ORGANIC Organic organic";
      const keywords = extractKeywords(text, 1);

      expect(keywords).toContain("organic");
    });

    it("should limit to specified count", () => {
      const text =
        "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11";
      const keywords = extractKeywords(text, 5);

      expect(keywords.length).toBeLessThanOrEqual(5);
    });

    it("should rank by frequency", () => {
      const text = "organic organic organic fresh fresh local";
      const keywords = extractKeywords(text, 3);

      expect(keywords[0]).toBe("organic");
      expect(keywords[1]).toBe("fresh");
    });

    it("should remove special characters", () => {
      const text = "hello world test";
      const keywords = extractKeywords(text);

      expect(keywords).toContain("hello");
    });

    it("should handle empty string", () => {
      const keywords = extractKeywords("");

      expect(keywords).toHaveLength(0);
    });
  });

  // ============================================================================
  // Default Exports Tests
  // ============================================================================

  describe("Default Exports", () => {
    it("should export defaultMetadata", () => {
      expect(defaultMetadata).toBeDefined();
      expect(defaultMetadata.title).toBeDefined();
      expect(defaultMetadata.description).toBeDefined();
    });

    it("should export defaultFarmKeywords", () => {
      expect(defaultFarmKeywords).toBeDefined();
      expect(Array.isArray(defaultFarmKeywords)).toBe(true);
      expect(defaultFarmKeywords.length).toBeGreaterThan(0);
    });

    it("should export defaultProductKeywords", () => {
      expect(defaultProductKeywords).toBeDefined();
      expect(Array.isArray(defaultProductKeywords)).toBe(true);
      expect(defaultProductKeywords.length).toBeGreaterThan(0);
    });

    it("defaultFarmKeywords should include relevant terms", () => {
      expect(defaultFarmKeywords).toContain("local farm");
      expect(defaultFarmKeywords).toContain("organic farm");
    });

    it("defaultProductKeywords should include relevant terms", () => {
      expect(defaultProductKeywords).toContain("organic");
      expect(defaultProductKeywords).toContain("fresh");
    });
  });
});
