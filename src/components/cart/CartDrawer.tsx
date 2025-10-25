/**
 * CART DRAWER - SLIDING SHOPPING CART PANEL
 *
 * Divine sliding cart drawer that appears from the right side.
 * Shows cart items, summary, and checkout button.
 *
 * Features:
 * - Slide-in/slide-out animation
 * - Cart items list
 * - Price summary
 * - Checkout button
 * - Empty cart state
 */

"use client";

import { Dialog, Transition } from "@headlessui/react";
import { ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import CartItem from "./CartItem";
import { useCart } from "./CartProvider";
import CartSummary from "./CartSummary";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart } = useCart();

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

        {/* Drawer Panel */}
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
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Shopping Cart
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={onClose}
                          >
                            <span className="sr-only">Close panel</span>
                            <X className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {/* Cart Items */}
                      <div className="mt-8">
                        {cart.items.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <ShoppingBag className="h-24 w-24 text-gray-300" />
                            <p className="mt-4 text-lg font-medium text-gray-900">
                              Your cart is empty
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                              Add some fresh produce to get started!
                            </p>
                            <button
                              onClick={onClose}
                              className="mt-6 px-6 py-3 bg-agricultural-600 text-white rounded-md hover:bg-agricultural-700 transition-colors"
                            >
                              Continue Shopping
                            </button>
                          </div>
                        ) : (
                          <div className="flow-root">
                            <ul className="-my-6 divide-y divide-gray-200">
                              {cart.items.map((item) => (
                                <li
                                  key={item.product.identity.id}
                                  className="py-6"
                                >
                                  <CartItem item={item} />
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer with Summary */}
                    {cart.items.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <CartSummary cart={cart} />

                        <div className="mt-6 space-y-3">
                          <Link
                            href="/checkout"
                            onClick={onClose}
                            className="flex w-full items-center justify-center rounded-md border border-transparent bg-agricultural-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-agricultural-700"
                          >
                            Checkout
                          </Link>

                          <button
                            onClick={onClose}
                            className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                          >
                            Continue Shopping
                          </button>
                        </div>

                        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                          <p>
                            or{" "}
                            <Link
                              href="/cart"
                              onClick={onClose}
                              className="font-medium text-agricultural-600 hover:text-agricultural-500"
                            >
                              View Full Cart
                            </Link>
                          </p>
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
