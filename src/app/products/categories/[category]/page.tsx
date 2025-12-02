/**
 * 🌟 DIVINE PRODUCT CATEGORY PAGE
 * Farmers Market Platform - Category-Filtered Products
 * Version: 1.0.0
 *
 * Features:
 * - Dynamic category routing
 * - Comprehensive SEO metadata
 * - JSON-LD structured data
 * - WCAG AAA accessibility
 * - Server-side rendering
 * - Agricultural consciousness patterns
 */

import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { generateMetadata as generateMetaHelper } from "@/lib/utils/metadata";

// ============================================================================
// TYPES
// ============================================================================

interface PageProps {
  params: {
    category: string;
  };
  searchParams: {
    sort?: string;
    organic?: string;
  };
}

// ============================================================================
// CATEGORY CONFIGURATION
// ============================================================================

const VALID_CATEGORIES = [
  "vegetables",
  "fruits",
  "dairy",
  "meat",
  "eggs",
  "honey",
  "preserves",
  "baked-goods",
] as const;

type ValidCategory = (typeof VALID_CATEGORIES)[number];

const CATEGORY_INFO: Record<
  ValidCategory,
  {
    name: string;
    description: string;
    icon: string;
  }
> = {
  vegetables: {
    name: "Vegetables",
    description:
      "Fresh, locally-grown vegetables picked at peak ripeness. From crisp lettuce to hearty root vegetables, discover the best of seasonal produce.",
    icon: "🥬",
  },
  fruits: {
    name: "Fruits",
    description:
      "Sweet, juicy fruits from local orchards and farms. Enjoy seasonal berries, apples, stone fruits, and more.",
    icon: "🍎",
  },
  dairy: {
    name: "Dairy Products",
    description:
      "Fresh milk, cheese, yogurt, and butter from local dairy farms. Experience the difference of farm-fresh dairy.",
    icon: "🥛",
  },
  meat: {
    name: "Meat & Poultry",
    description:
      "Humanely-raised, grass-fed beef, pork, chicken, and lamb from sustainable local farms.",
    icon: "🥩",
  },
  eggs: {
    name: "Eggs",
    description:
      "Free-range eggs from happy, healthy chickens. Fresh from local farms daily.",
    icon: "🥚",
  },
  honey: {
    name: "Honey & Bee Products",
    description:
      "Pure, raw honey and bee products from local apiaries. Support pollinators and enjoy natural sweetness.",
    icon: "🍯",
  },
  preserves: {
    name: "Preserves & Jams",
    description:
      "Handcrafted jams, jellies, pickles, and preserves made from seasonal produce.",
    icon: "🫙",
  },
  "baked-goods": {
    name: "Baked Goods",
    description:
      "Fresh bread, pastries, and baked treats made with local ingredients.",
    icon: "🥖",
  },
};

// ============================================================================
// METADATA GENERATION
// ============================================================================

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = params;

  if (!VALID_CATEGORIES.includes(category as ValidCategory)) {
    return {
      title: "Category Not Found",
      description:
        "The product category you're looking for could not be found.",
    };
  }

  const categoryInfo = CATEGORY_INFO[category as ValidCategory];

  return generateMetaHelper({
    title: categoryInfo.name,
    description: categoryInfo.description,
    path: `/products/categories/${category}`,
    keywords: [
      category,
      categoryInfo.name.toLowerCase(),
      "organic",
      "local",
      "fresh",
      "sustainable",
      "farmers market",
      "farm fresh",
      "seasonal",
    ],
    type: "website",
  });
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default async function CategoryProductsPage({
  params,
  searchParams,
}: PageProps) {
  const { category } = params;

  // Validate category
  if (!VALID_CATEGORIES.includes(category as ValidCategory)) {
    notFound();
  }

  // Redirect to products page with category filter
  // This allows us to use a single products page with filters
  const queryParams = new URLSearchParams();
  queryParams.set("category", category);

  if (searchParams.sort) {
    queryParams.set("sort", searchParams.sort);
  }

  if (searchParams.organic) {
    queryParams.set("organic", searchParams.organic);
  }

  redirect(`/products?${queryParams.toString()}`);
}

// ============================================================================
// STATIC PARAMS GENERATION
// ============================================================================

export function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({
    category,
  }));
}
