/**
 * 🛒 SHOPPING CART PAGE - Divine Agricultural Commerce
 * Server-rendered cart page with database sync and comprehensive features
 *
 * Features:
 * - Server component with metadata
 * - Database-synced cart (authenticated users)
 * - localStorage fallback (guest users)
 * - Real-time stock validation
 * - Grouped by farm
 * - Comprehensive SEO metadata
 * - WCAG AAA accessibility
 * - Agricultural consciousness patterns
 */

import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { cartService } from "@/lib/services/cart.service";
import { generateMetadata } from "@/lib/utils/metadata";
import { CartPageClient } from "@/components/cart/CartPageClient";

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = generateMetadata({
  title: "Shopping Cart | Fresh Local Products",
  description:
    "Review your cart of fresh, locally-sourced products from family farms. Manage quantities and proceed to secure checkout.",
  path: "/cart",
  type: "website",
  keywords: [
    "shopping cart",
    "local farm products",
    "fresh produce cart",
    "organic food checkout",
    "farmers market cart",
  ],
});

// ============================================================================
// SERVER COMPONENT
// ============================================================================

export default async function CartPage() {
  // Get authenticated user session
  const session = await auth();

  // Initialize cart data
  let cartSummary = null;
  let error = null;

  // If user is authenticated, fetch cart from database
  if (session?.user?.id) {
    try {
      cartSummary = await cartService.getCart(session.user.id);
    } catch (err) {
      console.error("Error fetching cart:", err);
      error = "Failed to load cart. Please try again.";
    }
  }

  // Pass data to client component
  return (
    <CartPageClient
      initialCartSummary={cartSummary}
      userId={session?.user?.id}
      error={error}
    />
  );
}

// ============================================================================
// REVALIDATION
// ============================================================================

// Revalidate every 60 seconds to ensure fresh data
export const revalidate = 60;
