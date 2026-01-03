/**
 * @file CartDrawer.tsx
 * @description Slide-out cart drawer with items list and checkout
 *
 * Features:
 * - Slide-out panel animation
 * - Cart items display
 * - Quantity controls
 * - Pricing summary
 * - Checkout button
 * - Empty state
 * - Mobile responsive
 * - Accessibility compliant
 *
 * @module components/features/cart/CartDrawer
 */

"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import {
  useCartStore,
  useCartItems,
  useCartTotals,
} from "@/lib/stores/cart.store";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { EmptyCart } from "./EmptyCart";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface CartDrawerProps {
  /**
   * Whether the drawer is open
   */
  isOpen: boolean;

  /**
   * Callback when drawer should close
   */
  onClose: () => void;

  /**
   * Optional callback after checkout button click
   */
  onCheckout?: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Slide-out cart drawer component
 *
 * @example
 * ```tsx
 * import { CartDrawer } from '@/components/features/cart/CartDrawer';
 *
 * function App() {
 *   const [isOpen, setIsOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <button onClick={() => setIsOpen(true)}>Open Cart</button>
 *       <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
 *     </>
 *   );
 * }
 * ```
 */
export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const router = useRouter();
  const items = useCartItems();
  const totals = useCartTotals();
  const { clearCart, isLoading, isSyncing } = useCartStore();

  const isEmpty = items.length === 0;
  const isProcessing = isLoading || isSyncing;

  /**
   * Handle checkout button click
   */
  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      onClose();
      router.push("/checkout");
    }
  };

  /**
   * Handle clear cart
   */
  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart();
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        {/* Drawer Container */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-6 sm:px-6">
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        Shopping Cart
                        {!isEmpty && (
                          <span className="ml-2 text-sm font-normal text-gray-500">
                            ({items.length}{" "}
                            {items.length === 1 ? "item" : "items"})
                          </span>
                        )}
                      </Dialog.Title>

                      {/* Close Button */}
                      <button
                        type="button"
                        className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        onClick={onClose}
                        aria-label="Close cart"
                      >
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      {isEmpty ? (
                        <EmptyCart onClose={onClose} />
                      ) : (
                        <>
                          {/* Cart Items List */}
                          <div className="space-y-4">
                            {items.map((item) => (
                              <CartItem key={item.id} item={item} />
                            ))}
                          </div>

                          {/* Clear Cart Button */}
                          {!isEmpty && (
                            <div className="mt-6">
                              <button
                                type="button"
                                onClick={handleClearCart}
                                disabled={isProcessing}
                                className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                              >
                                Clear cart
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Footer with Summary and Checkout */}
                    {!isEmpty && (
                      <div className="border-t border-gray-200 bg-gray-50 px-4 py-6 sm:px-6">
                        {/* Cart Summary */}
                        <CartSummary totals={totals} />

                        {/* Checkout Button */}
                        <div className="mt-6">
                          <button
                            type="button"
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className="
                              w-full
                              flex items-center justify-center
                              rounded-md
                              bg-green-600 hover:bg-green-700
                              px-6 py-3
                              text-base font-medium text-white
                              shadow-sm
                              transition-colors duration-200
                              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                              disabled:opacity-50 disabled:cursor-not-allowed
                            "
                            data-testid="checkout-button"
                          >
                            {isProcessing
                              ? "Processing..."
                              : "Proceed to Checkout"}
                          </button>
                        </div>

                        {/* Continue Shopping Link */}
                        <div className="mt-4 text-center">
                          <button
                            type="button"
                            onClick={onClose}
                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                          >
                            Continue Shopping
                          </button>
                        </div>

                        {/* Security Badge */}
                        <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
                          <svg
                            className="h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                          Secure Checkout
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

// ============================================================================
// Mobile Cart Drawer (Full Screen)
// ============================================================================

/**
 * Full-screen cart drawer for mobile devices
 */
export function MobileCartDrawer({
  isOpen,
  onClose,
  onCheckout,
}: CartDrawerProps) {
  const router = useRouter();
  const items = useCartItems();
  const totals = useCartTotals();
  const { clearCart, isLoading, isSyncing } = useCartStore();

  const isEmpty = items.length === 0;
  const isProcessing = isLoading || isSyncing;

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      onClose();
      router.push("/checkout");
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart();
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-300"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="transform transition ease-in-out duration-300"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <Dialog.Panel className="h-full w-full bg-white">
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Cart
                    {!isEmpty && (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({items.length})
                      </span>
                    )}
                  </Dialog.Title>

                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                    aria-label="Close cart"
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  {isEmpty ? (
                    <EmptyCart onClose={onClose} />
                  ) : (
                    <div className="space-y-4">
                      {items.map((item) => (
                        <CartItem key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {!isEmpty && (
                  <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 space-y-4">
                    <CartSummary totals={totals} />

                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={isProcessing}
                      className="
                        w-full
                        rounded-md
                        bg-green-600
                        px-6 py-3
                        text-base font-medium text-white
                        disabled:opacity-50
                      "
                    >
                      {isProcessing ? "Processing..." : "Checkout"}
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full text-sm text-green-600 font-medium"
                    >
                      Continue Shopping
                    </button>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
