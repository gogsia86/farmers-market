"use client";

// 🛒 ADD TO CART BUTTON - Divine Shopping Cart Integration Component
// Interactive button for adding products to cart with quantum consciousness

import { addToCartAction } from "@/app/actions/cart.actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  price: number;
  unit: string;
  availableStock?: number;
  minQuantity?: number;
  maxQuantity?: number;
  userId?: string;
  disabled?: boolean;
  showQuantitySelector?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}

// ============================================================================
// ADD TO CART BUTTON COMPONENT
// ============================================================================

export function AddToCartButton({
  productId,
  productName,
  price,
  unit,
  availableStock = 999,
  minQuantity = 1,
  maxQuantity,
  userId,
  disabled = false,
  showQuantitySelector = true,
  size = "lg",
  className = "",
}: AddToCartButtonProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [quantity, setQuantity] = useState(minQuantity);
  const [isLoading, setIsLoading] = useState(false);

  const effectiveMaxQuantity = maxQuantity
    ? Math.min(maxQuantity, availableStock)
    : availableStock;

  const canIncrement = quantity < effectiveMaxQuantity;
  const canDecrement = quantity > minQuantity;

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleIncrement = () => {
    if (canIncrement) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (canDecrement) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    // Check if user is authenticated
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your cart",
        variant: "warning",
      });
      router.push(`/auth/signin?callbackUrl=/products/${productId}`);
      return;
    }

    // Validate stock
    if (availableStock === 0) {
      toast({
        title: "Out of stock",
        description: `${productName} is currently out of stock`,
        variant: "destructive",
      });
      return;
    }

    if (quantity > availableStock) {
      toast({
        title: "Insufficient stock",
        description: `Only ${availableStock} ${unit}(s) available`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await addToCartAction({
        productId,
        quantity,
        userId,
      });

      if (response.success) {
        toast({
          title: "Added to cart",
          description: `${quantity} ${unit}(s) of ${productName} added to your cart`,
          variant: "success",
        });

        // Reset quantity to minimum after successful add
        setQuantity(minQuantity);
      } else {
        throw new Error(response.error?.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast({
        title: "Failed to add to cart",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // SIZE CLASSES
  // ==========================================================================

  const sizeClasses = {
    sm: {
      button: "h-9 px-4 text-sm",
      icon: "h-4 w-4",
      quantityButton: "h-8 w-8",
      quantityText: "text-sm min-w-[2rem]",
    },
    default: {
      button: "h-10 px-6 text-base",
      icon: "h-5 w-5",
      quantityButton: "h-9 w-9",
      quantityText: "text-base min-w-[2.5rem]",
    },
    lg: {
      button: "h-12 px-8 text-lg",
      icon: "h-5 w-5",
      quantityButton: "h-10 w-10",
      quantityText: "text-lg min-w-[3rem]",
    },
  };

  const currentSize = sizeClasses[size];

  // ==========================================================================
  // RENDER
  // ==========================================================================

  // Out of stock state
  if (availableStock === 0) {
    return (
      <div className={`w-full ${className}`}>
        <Button
          disabled
          size={size}
          className={`w-full bg-gray-300 text-gray-600 cursor-not-allowed ${currentSize.button}`}
        >
          Out of Stock
        </Button>
      </div>
    );
  }

  // Not authenticated state
  if (!userId) {
    return (
      <div className={`w-full ${className}`}>
        <Button
          onClick={handleAddToCart}
          size={size}
          className={`w-full bg-green-600 hover:bg-green-700 text-white ${currentSize.button}`}
        >
          <ShoppingCart className={`mr-2 ${currentSize.icon}`} />
          Sign in to Purchase
        </Button>
      </div>
    );
  }

  // With quantity selector
  if (showQuantitySelector) {
    return (
      <div className={`w-full space-y-3 ${className}`}>
        {/* Quantity Selector */}
        <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-white p-2">
          <span className="text-sm font-medium text-gray-700">Quantity:</span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDecrement}
              disabled={!canDecrement || isLoading}
              className={`${currentSize.quantityButton} flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50`}
            >
              <Minus className="h-4 w-4" />
            </Button>

            <span className={`${currentSize.quantityText} font-semibold text-gray-900 text-center`}>
              {quantity}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleIncrement}
              disabled={!canIncrement || isLoading}
              className={`${currentSize.quantityButton} flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stock Info */}
        {availableStock < 10 && (
          <p className="text-sm text-amber-600">
            ⚠️ Only {availableStock} {unit}(s) available
          </p>
        )}

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={disabled || isLoading}
          size={size}
          className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm transition-all ${currentSize.button} ${isLoading ? "opacity-70 cursor-wait" : ""
            }`}
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart className={`mr-2 ${currentSize.icon}`} />
              Add to Cart · ${(price * quantity).toFixed(2)}
            </>
          )}
        </Button>
      </div>
    );
  }

  // Simple button without quantity selector
  return (
    <div className={`w-full ${className}`}>
      <Button
        onClick={handleAddToCart}
        disabled={disabled || isLoading}
        size={size}
        className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm transition-all ${currentSize.button} ${isLoading ? "opacity-70 cursor-wait" : ""
          }`}
      >
        {isLoading ? (
          <>
            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Adding...
          </>
        ) : (
          <>
            <ShoppingCart className={`mr-2 ${currentSize.icon}`} />
            Add to Cart
          </>
        )}
      </Button>
    </div>
  );
}

// ============================================================================
// COMPACT ADD TO CART BUTTON (for product cards)
// ============================================================================

interface CompactAddToCartButtonProps {
  productId: string;
  productName: string;
  price: number;
  availableStock?: number;
  userId?: string;
}

export function CompactAddToCartButton({
  productId,
  productName,
  price,
  availableStock = 999,
  userId,
}: CompactAddToCartButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      router.push(`/auth/signin?callbackUrl=/products/${productId}`);
      return;
    }

    if (availableStock === 0) {
      toast({
        title: "Out of stock",
        description: `${productName} is currently out of stock`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await addToCartAction({
        productId,
        quantity: 1,
        userId,
      });

      if (response.success) {
        toast({
          title: "Added to cart",
          description: `${productName} added to your cart`,
          variant: "success",
        });
      } else {
        throw new Error(response.error?.message || "Failed to add to cart");
      }
    } catch (error) {
      toast({
        title: "Failed to add to cart",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleQuickAdd}
      disabled={isLoading || availableStock === 0}
      size="sm"
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      {isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
    </Button>
  );
}
