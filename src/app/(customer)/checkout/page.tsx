// 🛒 CHECKOUT PAGE - Divine Server Component
// Handles authentication, data fetching, and empty cart validation
// Follows Next.js 15 App Router + Server Component patterns

import { CheckoutWizard } from "@/components/features/checkout/checkout-wizard";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { Prisma } from "@prisma/client";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

// ============================================================================
// DECIMAL SERIALIZATION HELPER
// ============================================================================

/**
 * Converts Prisma Decimal objects to plain numbers for client serialization
 */
function serializeDecimal(
  value: Prisma.Decimal | number | null | undefined,
): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  return value.toNumber();
}

/**
 * Recursively serializes cart items with Decimal fields
 */
function serializeCart(cart: any[]): any[] {
  return cart.map((item: any) => ({
    ...item,
    quantity: serializeDecimal(item.quantity),
    priceAtAdd: serializeDecimal(item.priceAtAdd),
    product: {
      ...item.product,
      price: serializeDecimal(item.product.price),
      compareAtPrice: serializeDecimal(item.product.compareAtPrice),
      quantityAvailable: serializeDecimal(item.product.quantityAvailable),
      lowStockThreshold: serializeDecimal(item.product.lowStockThreshold),
      averageRating: serializeDecimal(item.product.averageRating),
    },
  }));
}

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: "Checkout | Farmers Market Platform",
  description: "Complete your order - Divine agricultural commerce",
};

// Force dynamic rendering - don't pre-render at build time
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================================
// SERVER COMPONENT
// ============================================================================

export default async function CheckoutPage() {
  // ==========================================================================
  // AUTHENTICATION CHECK
  // ==========================================================================
  const session = await auth();

  if (!session?.user?.id) {
    // Redirect unauthenticated users to login
    redirect("/auth/signin?callbackUrl=/checkout");
  }

  const userId = session.user.id;

  // ==========================================================================
  // FETCH CART DATA (with all relationships)
  // ==========================================================================
  const cart = await database.cartItem.findMany({
    where: {
      userId,
    },
    include: {
      product: {
        include: {
          farm: {
            select: {
              id: true,
              name: true,
              slug: true,
              address: true,
              state: true,
              zipCode: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // ==========================================================================
  // EMPTY CART VALIDATION
  // ==========================================================================
  if (cart.length === 0) {
    // Redirect to cart page if empty
    redirect("/cart");
  }

  // ==========================================================================
  // FETCH USER'S SAVED ADDRESSES
  // ==========================================================================
  const addresses = await database.userAddress.findMany({
    where: {
      userId,
    },
    orderBy: [
      { isDefault: "desc" }, // Default address first
      { updatedAt: "desc" }, // Then by most recently used
    ],
  });

  // ==========================================================================
  // RENDER CLIENT WIZARD
  // ==========================================================================
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">
            Complete your order from {cart.length} item
            {cart.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Checkout Wizard (Client Component) */}
        <CheckoutWizard
          cart={serializeCart(cart)}
          savedAddresses={addresses}
          userId={userId}
        />
      </div>
    </div>
  );
}
