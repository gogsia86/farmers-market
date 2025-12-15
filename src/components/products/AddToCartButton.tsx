/**
 * ADD TO CART BUTTON COMPONENT
 * Divine cart integration for agricultural products
 * Features: Loading states, authentication, optimistic updates, error handling
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

// ============================================
// TYPES
// ============================================

interface AddToCartButtonProps {
  productId: string;
  farmId: string;
  quantity: number;
  unit: string;
  price: number;
  availableQuantity: number;
  disabled?: boolean;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

type ButtonState = "idle" | "loading" | "success" | "error";

// ============================================
// ADD TO CART BUTTON COMPONENT
// ============================================

export function AddToCartButton({
  productId,
  farmId,
  quantity,
  unit,
  price,
  availableQuantity,
  disabled = false,
  className,
  onSuccess,
  onError,
}: AddToCartButtonProps) {
  const router = useRouter();
  const { data: _session, status } = useSession();
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const isOutOfStock = availableQuantity <= 0;
  const isDisabled =
    disabled || isOutOfStock || quantity <= 0 || buttonState === "loading";

  const handleAddToCart = async () => {
    // Check authentication
    if (!isAuthenticated) {
      router.push(
        `/auth/signin?callbackUrl=${encodeURIComponent(
          window.location.pathname,
        )}`,
      );
      return;
    }

    // Validate quantity
    if (quantity > availableQuantity) {
      const error = "Quantity exceeds available stock";
      setErrorMessage(error);
      setButtonState("error");
      onError?.(error);
      setTimeout(() => {
        setButtonState("idle");
        setErrorMessage(null);
      }, 3000);
      return;
    }

    setButtonState("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          farmId,
          quantity,
          unit,
          priceAtAdd: price,
          fulfillmentMethod: "PICKUP", // Default to pickup, can be changed in cart
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to add to cart");
      }

      // Success!
      setButtonState("success");
      onSuccess?.();

      // Show success state for 2 seconds, then reset
      setTimeout(() => {
        setButtonState("idle");
      }, 2000);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to add to cart";
      setErrorMessage(errorMsg);
      setButtonState("error");
      onError?.(errorMsg);

      // Reset error state after 3 seconds
      setTimeout(() => {
        setButtonState("idle");
        setErrorMessage(null);
      }, 3000);
    }
  };

  // Button content based on state
  const getButtonContent = () => {
    switch (buttonState) {
      case "loading":
        return (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Adding to Cart...</span>
          </>
        );
      case "success":
        return (
          <>
            <Check className="h-5 w-5" />
            <span>Added to Cart!</span>
          </>
        );
      case "error":
        return (
          <>
            <AlertCircle className="h-5 w-5" />
            <span>Failed to Add</span>
          </>
        );
      default:
        if (isOutOfStock) {
          return <span>Out of Stock</span>;
        }
        if (!isAuthenticated && !isLoading) {
          return (
            <>
              <ShoppingCart className="h-5 w-5" />
              <span>Sign In to Add to Cart</span>
            </>
          );
        }
        return (
          <>
            <ShoppingCart className="h-5 w-5" />
            <span>Add to Cart</span>
          </>
        );
    }
  };

  // Button color based on state
  const getButtonColor = () => {
    switch (buttonState) {
      case "loading":
        return "bg-green-500 hover:bg-green-600";
      case "success":
        return "bg-green-600 hover:bg-green-700";
      case "error":
        return "bg-red-600 hover:bg-red-700";
      default:
        if (isOutOfStock) {
          return "bg-gray-400 cursor-not-allowed";
        }
        return "bg-green-600 hover:bg-green-700";
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isDisabled || isLoading}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold text-white shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
          getButtonColor(),
          (isDisabled || isLoading) && "cursor-not-allowed opacity-60",
          buttonState === "success" && "scale-105",
          className,
        )}
        aria-label={
          isOutOfStock
            ? "Product out of stock"
            : !isAuthenticated
              ? "Sign in to add to cart"
              : "Add product to cart"
        }
        aria-busy={buttonState === "loading"}
        aria-live="polite"
        data-testid="add-to-cart-button"
      >
        {getButtonContent()}
      </button>

      {/* Error Message */}
      {errorMessage && buttonState === "error" && (
        <div
          className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800"
          role="alert"
          data-testid="add-to-cart-error"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {buttonState === "success" && (
        <div
          className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800"
          role="status"
          data-testid="add-to-cart-success"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <p>Item added to your cart</p>
            </div>
            <button
              onClick={() => router.push("/cart")}
              className="text-green-700 underline hover:text-green-800 font-medium"
              data-testid="view-cart-link"
            >
              View Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
