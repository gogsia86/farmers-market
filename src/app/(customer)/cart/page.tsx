"use client";

// 🛒 CART PAGE - Divine Shopping Cart Experience
// Full cart view with farm-grouped items and agricultural consciousness

import { CartItemCard } from "@/components/features/cart/cart-item-card";
import { CartSummary } from "@/components/features/cart/cart-summary";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { AlertTriangle, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ============================================================================
// CART PAGE COMPONENT
// ============================================================================

export default function CartPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);

  const {
    cart,
    count,
    isLoading,
    isValidating,
    isEmpty,
    updateCartItem,
    removeFromCart,
    clearCart,
    clearFarmCart,
    validateCart,
    syncPrices,
  } = useCart({ userId });

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  useEffect(() => {
    setIsMounted(true);
    // TODO: Get userId from auth session
    // For now, using mock user ID
    setUserId("user_123");
  }, []);

  useEffect(() => {
    if (isMounted && userId) {
      // Validate cart on mount
      validateCart();
      // Sync prices
      syncPrices();
    }
  }, [isMounted, userId]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    await updateCartItem(itemId, quantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const handleClearCart = async () => {
    if (confirm("Are you sure you want to clear your entire cart?")) {
      await clearCart();
    }
  };

  const handleClearFarmCart = async (farmId: string, farmName: string) => {
    if (confirm(`Remove all items from ${farmName}?`)) {
      await clearFarmCart(farmId);
    }
  };

  const handleCheckout = async () => {
    // Validate cart before checkout
    const validation = await validateCart();

    if (validation && !validation.isValid) {
      // Show validation errors
      return;
    }

    // Proceed to checkout
    router.push("/checkout");
  };

  // ==========================================================================
  // RENDER LOADING
  // ==========================================================================

  if (!isMounted || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER EMPTY CART
  // ==========================================================================

  if (isEmpty || !cart) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="mt-2 text-gray-600">Your cart is currently empty</p>
        </div>

        {/* Empty State */}
        <Card className="mx-auto max-w-2xl">
          <CardBody className="flex flex-col items-center justify-center py-16">
            <div className="mb-6 rounded-full bg-gray-100 p-6">
              <ShoppingBag className="h-16 w-16 text-gray-400" />
            </div>

            <h2 className="mb-2 text-2xl font-semibold text-gray-900">
              Your cart is empty
            </h2>
            <p className="mb-6 text-center text-gray-600">
              Looks like you haven't added any items to your cart yet.
              <br />
              Start shopping for fresh, local produce!
            </p>

            <div className="flex gap-3">
              <Link href="/products">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Browse Products
                </Button>
              </Link>
              <Link href="/farms">
                <Button size="lg" variant="outline">
                  Explore Farms
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // ==========================================================================
  // RENDER CART WITH ITEMS
  // ==========================================================================

  const { farmGroups } = cart;
  const hasValidationIssues = cart.items.some((item) => {
    const availableStock = item.product.quantityAvailable?.toNumber() || 0;
    return (
      item.product.status !== "ACTIVE" ||
      availableStock === 0 ||
      item.quantity.toNumber() > availableStock
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="mt-2 text-gray-600">
            {count} item{count !== 1 ? "s" : ""} from {farmGroups.length} farm
            {farmGroups.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleClearCart}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear Cart
        </Button>
      </div>

      {/* Validation Warning */}
      {hasValidationIssues && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-900">
                Some items need your attention
              </h3>
              <p className="mt-1 text-sm text-amber-800">
                Some items in your cart are out of stock or have insufficient quantity.
                Please review and update your cart before checkout.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items - 2 columns */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Group items by farm */}
            {farmGroups.map((farmGroup) => (
              <div key={farmGroup.farmId}>
                {/* Farm Header */}
                <div className="mb-4 flex items-center justify-between border-b pb-3">
                  <div>
                    <Link
                      href={`/farms/${farmGroup.farmSlug}`}
                      className="text-lg font-semibold text-gray-900 hover:text-green-600"
                    >
                      {farmGroup.farmName}
                    </Link>
                    <p className="text-sm text-gray-600">
                      {farmGroup.itemCount} item{farmGroup.itemCount !== 1 ? "s" : ""} · $
                      {farmGroup.subtotal.toFixed(2)}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleClearFarmCart(farmGroup.farmId, farmGroup.farmName)
                    }
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Remove All
                  </Button>
                </div>

                {/* Farm Items */}
                <div className="space-y-3">
                  {farmGroup.items.map((item) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemoveItem}
                      isUpdating={isValidating}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Continue Shopping Link */}
          <div className="mt-6">
            <Link href="/products">
              <Button variant="outline" size="lg" className="w-full">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        {/* Cart Summary - 1 column */}
        <div className="lg:col-span-1">
          <CartSummary
            summary={cart}
            showCheckoutButton={true}
            isValidating={isValidating}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}
