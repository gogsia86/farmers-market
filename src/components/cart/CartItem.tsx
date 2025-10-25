/**
 * CART ITEM COMPONENT - INDIVIDUAL PRODUCT IN CART
 *
 * Displays a single product in the shopping cart with:
 * - Product image
 * - Name and details
 * - Quantity controls
 * - Price
 * - Remove button
 */

"use client";

import type { CartItem as CartItemType } from "@/types/cart.types";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartProvider";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;

  const price = product.pricing.salePrice || product.pricing.basePrice;
  const subtotal = price * quantity;

  const handleIncrease = () => {
    updateQuantity(product.identity.id, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      updateQuantity(product.identity.id, quantity - 1);
    } else {
      removeItem(product.identity.id);
    }
  };

  const handleRemove = () => {
    removeItem(product.identity.id);
  };

  return (
    <div className="flex gap-4">
      {/* Product Image */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <Image
          src={product.gallery.primaryImage.url}
          alt={product.identity.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3>
              <Link
                href={`/products/${product.identity.id}`}
                className="hover:text-agricultural-600"
              >
                {product.identity.name}
              </Link>
            </h3>
            <p className="ml-4">${(subtotal / 100).toFixed(2)}</p>
          </div>

          {/* Unit Price */}
          <p className="mt-1 text-sm text-gray-500">
            ${(price / 100).toFixed(2)} / {product.inventory.unit}
          </p>

          {/* Badges */}
          <div className="mt-1 flex items-center gap-2">
            {product.quality.organic && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                Organic
              </span>
            )}
            {product.pricing.onSale && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                On Sale
              </span>
            )}
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrease}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>

            <span className="w-12 text-center font-medium text-gray-900">
              {quantity}
            </span>

            <button
              onClick={handleIncrease}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={handleRemove}
            className="flex items-center gap-1 font-medium text-red-600 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
