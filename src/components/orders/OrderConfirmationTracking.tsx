"use client";

// 📊 ORDER CONFIRMATION TRACKING - Analytics Integration
// Tracks successful purchase events for Google Analytics
// Following: 09_AI_WORKFLOW_AUTOMATION & Analytics Patterns

import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect } from "react";

import { logger } from '@/lib/monitoring/logger';

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

interface OrderConfirmationTrackingProps {
  orderId: string;
  orderNumber?: string; // Optional, only for logging
  totalValue: number;
  tax?: number;
  shipping?: number;
  items: OrderItem[];
}

/**
 * OrderConfirmationTracking Component
 *
 * Automatically tracks purchase conversion event when order confirmation page loads.
 * This is a critical metric for understanding conversion rates and revenue.
 *
 * Usage:
 * ```tsx
 * <OrderConfirmationTracking
 *   orderId={order.id}
 *   orderNumber={order.orderNumber}
 *   totalValue={order.total}
 *   tax={order.tax}
 *   shipping={order.shipping}
 *   items={order.items.map(item => ({
 *     productId: item.productId,
 *     productName: item.product.name,
 *     price: item.price,
 *     quantity: item.quantity
 *   }))}
 * />
 * ```
 */
export function OrderConfirmationTracking({
  orderId,
  orderNumber,
  totalValue,
  tax = 0,
  shipping = 0,
  items,
}: OrderConfirmationTrackingProps) {
  const { trackPurchase } = useAnalytics();

  useEffect(() => {
    // Track purchase event on component mount
    trackPurchase({
      id: orderId,
      totalValue,
      tax,
      shipping,
      items: items.map(item => ({
        id: item.productId,
        name: item.productName,
        price: item.price,
        quantity: item.quantity,
      })),
    });

    // Log to console in development for debugging
    if (process.env.NODE_ENV === "development") {
      logger.info("📊 Purchase tracked:", {
        orderId,
        orderNumber,
        totalValue,
        itemCount: items.length,
      });
    }
  }, [orderId]); // Only track once per order

  // This component doesn't render anything
  return null;
}

/**
 * Simple version without detailed items (legacy support)
 */
export function SimpleOrderTracking({
  orderId,
  totalValue,
}: {
  orderId: string;
  totalValue: number;
}) {
  const { trackPurchase } = useAnalytics();

  useEffect(() => {
    trackPurchase({
      id: orderId,
      totalValue,
      items: [],
    });
  }, [orderId]);

  return null;
}
