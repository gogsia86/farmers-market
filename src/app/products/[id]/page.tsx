/**
 * PRODUCT DETAIL PAGE - DIVINE INDIVIDUAL PRODUCT VIEW
 *
 * Dynamic product detail page with full information display.
 * Shows product images, details, farmer info, reviews, and related products.
 *
 * Divine Patterns Applied:
 * - Next.js 14 Dynamic Routes
 * - Server-Side Rendering
 * - Agricultural Consciousness
 * - UX Design Consciousness
 *
 * Functional Requirements: FR-001 (Product Details)
 */

import { generateMockProducts } from "@/app/api/products/mockData";
import ProductDetailView from "@/components/products/ProductDetailView";
import RelatedProducts from "@/components/products/RelatedProducts";
import type { ProductId, QuantumProduct } from "@/types/product.types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

// ============================================================================
// FETCH PRODUCT DATA
// ============================================================================

async function getProduct(id: string): Promise<QuantumProduct | undefined> {
  const products = generateMockProducts();
  const found = products.find((p) => p.id === id);
  if (!found) return undefined;

  const quantumProduct: QuantumProduct = {
    identity: {
      id: found.id as ProductId,
      slug: found.name.toLowerCase().replace(/\s+/g, "-") as any,
      name: found.name,
      description: found.description,
    },
    metadata: {
      category: found.category as any,
      farmId: found.farmId as any,
      tags: [],
      searchKeywords: [],
    },
    inventory: {
      quantumState: (found.inStock ? "AVAILABLE" : "OUT_OF_STOCK") as any,
      quantityAvailable: 100,
      quantityReserved: 0,
      quantityTotal: 100,
      unit: found.unit,
    },
    pricing: {
      basePrice: Math.round(found.price * 100),
      currency: "USD",
      pricePerUnit: `$${found.price}/${found.unit}`,
      onSale: false,
    },
    quality: {
      organic: found.organic,
      certifications: [],
      freshness: 90,
    },
    seasonality: {
      primarySeasons: ["SUMMER"] as any,
      availability: [],
      isYearRound: true,
    },
    gallery: {
      images: [],
      primaryImage: {
        id: "primary",
        url: "/images/placeholder.png",
        alt: found.name,
        isPrimary: true,
        width: 800,
        height: 800,
        format: "JPEG" as any,
        order: 0,
      },
      thumbnails: [],
    },
    temporal: {
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    metrics: {
      views: 0,
      likes: 0,
      purchases: 0,
      rating: found.rating,
      reviewCount: found.reviewCount,
    },
  };

  return quantumProduct;
}

async function getRelatedProducts(productId: string, category: string) {
  // TODO: Replace with real database query
  const products = generateMockProducts();

  // Filter by category and exclude current product id
  const filtered = products
    .filter((p) => p.id !== productId && p.category === category)
    .slice(0, 4);

  // Map to QuantumProduct minimal shape to satisfy RelatedProducts typing
  return filtered.map(
    (p) =>
      ({
        identity: {
          id: p.id as unknown as ProductId,
          slug: p.name.toLowerCase().replace(/\s+/g, "-") as any,
          name: p.name,
          description: p.description,
        },
        metadata: {
          category: p.category as unknown as any,
          farmId: p.farmId as unknown as any,
          tags: [],
          searchKeywords: [],
        },
        inventory: {
          quantumState: p.inStock
            ? ("AVAILABLE" as any)
            : ("OUT_OF_STOCK" as any),
          quantityAvailable: 100,
          quantityReserved: 0,
          quantityTotal: 100,
          unit: p.unit,
        },
        pricing: {
          basePrice: Math.round(p.price * 100),
          currency: "USD",
          pricePerUnit: `$${p.price}/${p.unit}`,
          onSale: false,
        },
        quality: { organic: p.organic, certifications: [], freshness: 90 },
        seasonality: {
          primarySeasons: ["SUMMER"],
          availability: [],
          isYearRound: true,
        },
        gallery: {
          images: [],
          primaryImage: {
            id: "primary",
            url: "/images/placeholder.png",
            alt: p.name,
            isPrimary: true,
            width: 800,
            height: 800,
            format: "JPEG",
            order: 0,
          },
          thumbnails: [],
        },
        temporal: { createdAt: new Date(), updatedAt: new Date() },
        metrics: {
          views: 0,
          likes: 0,
          purchases: 0,
          rating: p.rating,
          reviewCount: p.reviewCount,
        },
      }) as QuantumProduct
  );
}

// ============================================================================
// PRODUCT DETAIL PAGE
// ============================================================================

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    product.identity.id,
    product.metadata.category as unknown as string
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Product Detail */}
      <ProductDetailView product={product} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <RelatedProducts
            products={relatedProducts}
            currentProductId={product.identity.id}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// METADATA
// ============================================================================

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: "Product Not Found | Farmers Market",
    };
  }

  return {
    title: `${product.identity.name} | Farmers Market`,
    description:
      product.identity.description ||
      `Buy ${product.identity.name} from local farms`,
  };
}
