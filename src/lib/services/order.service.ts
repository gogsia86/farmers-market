/**
 * 📦 ORDER SERVICE
 * Handles order creation, management, and tracking
 */

import { database } from "@/lib/database";
import type { Order, OrderItem } from "@prisma/client";

export interface CreateOrderInput {
  userId: string;
  farmId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    unit: string;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  fulfillmentMethod: "DELIVERY" | "FARM_PICKUP" | "MARKET_PICKUP";
  notes?: string;
}

export interface OrderWithDetails extends Order {
  items: OrderItem[];
  farm: {
    id: string;
    name: string;
  };
}

export class OrderService {
  /**
   * Create new order
   */
  static async createOrder(input: CreateOrderInput): Promise<OrderWithDetails> {
    const { userId, farmId, items, shippingAddress, fulfillmentMethod, notes } =
      input;

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const tax = subtotal * 0.08; // 8% tax
    const platformFee = subtotal * 0.15; // 15% platform commission
    const farmerAmount = subtotal - platformFee;
    const total = subtotal + tax;

    // Generate order number
    const orderNumber = `FM-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create order with items
    const order = await database.order.create({
      data: {
        orderNumber,
        customerId: userId,
        farmId,
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal,
        tax,
        platformFee,
        farmerAmount,
        total,
        deliveryFee: 0,
        discount: 0,
        fulfillmentMethod,
        shippingAddress: JSON.stringify(shippingAddress),
        specialInstructions: notes,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.price,
            subtotal: item.price * item.quantity,
          })),
        },
      },
      include: {
        items: true,
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return order as OrderWithDetails;
  }

  /**
   * Get order by ID
   */
  static async getOrderById(orderId: string): Promise<OrderWithDetails | null> {
    const order = await database.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return order as OrderWithDetails | null;
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    orderId: string,
    status:
      | "PENDING"
      | "CONFIRMED"
      | "PREPARING"
      | "READY"
      | "FULFILLED"
      | "COMPLETED"
      | "CANCELLED",
  ): Promise<Order> {
    return database.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  /**
   * Get orders for user
   */
  static async getUserOrders(userId: string): Promise<OrderWithDetails[]> {
    const orders = await database.order.findMany({
      where: { customerId: userId },
      include: {
        items: true,
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders as OrderWithDetails[];
  }

  /**
   * Get orders for farm
   */
  static async getFarmOrders(farmId: string): Promise<OrderWithDetails[]> {
    const orders = await database.order.findMany({
      where: { farmId },
      include: {
        items: true,
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders as OrderWithDetails[];
  }
}
