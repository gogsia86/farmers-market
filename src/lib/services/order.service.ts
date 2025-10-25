// src/lib/services/order.service.ts
import { database } from "@/lib/database";
import type {
  CreateOrderInput,
  OrderTotals,
  OrderWithRelations,
  UpdateOrderStatusInput,
} from "@/types/order.types";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { OrderValidator } from "../validation/order.validation";

export class OrderService {
  /**
   * Generate unique order number (FM-YYYYMMDD-XXXX)
   */
  static async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const prefix = `FM-${year}${month}${day}`;

    // Get count of orders today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const count = await database.order.count({
      where: {
        createdAt: { gte: startOfDay },
      },
    });

    const sequence = String(count + 1).padStart(4, "0");
    return `${prefix}-${sequence}`;
  }

  /**
   * Calculate order totals
   */
  static async calculateTotals(
    items: Array<{ productId: string; quantity: number }>,
    farmId: string,
    fulfillmentMethod: string
  ): Promise<OrderTotals> {
    // Fetch product prices
    const products = await database.product.findMany({
      where: {
        id: { in: items.map((i) => i.productId) },
      },
      select: { id: true, price: true },
    });

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product ? Number(product.price) * item.quantity : 0);
    }, 0);

    // Calculate fees
    const deliveryFee = fulfillmentMethod === "DELIVERY" ? 5.0 : 0;
    const platformFee = subtotal * 0.15; // 15% commission
    const tax = (subtotal + deliveryFee) * 0.08; // 8% tax (adjust per region)
    const discount = 0; // TODO: Apply coupons
    const total = subtotal + deliveryFee + tax - discount;
    const farmerAmount = subtotal + deliveryFee - platformFee - tax;

    return {
      subtotal,
      deliveryFee,
      platformFee,
      tax,
      discount,
      total,
      farmerAmount,
    };
  }

  /**
   * Create new order
   */
  static async createOrder(
    input: CreateOrderInput
  ): Promise<OrderWithRelations> {
    // Validate order creation
    const validation = await OrderValidator.validateOrderCreation(
      input.customerId,
      input.farmId,
      input.items,
      input.fulfillmentMethod,
      input.deliveryAddressId,
      input.scheduledDate
    );

    if (!validation.valid) {
      throw new Error(
        `Order validation failed: ${validation.errors.join(", ")}`
      );
    }

    // Fetch product prices for order items
    const products = await database.product.findMany({
      where: {
        id: { in: input.items.map((i) => i.productId) },
      },
      select: { id: true, price: true },
    });

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Calculate totals
    const totals = await this.calculateTotals(
      input.items,
      input.farmId,
      input.fulfillmentMethod
    );

    // Create order with items
    const order = await database.order.create({
      data: {
        orderNumber,
        customerId: input.customerId,
        farmId: input.farmId,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        ...totals,
        fulfillmentMethod: input.fulfillmentMethod,
        deliveryAddressId: input.deliveryAddressId,
        scheduledDate: input.scheduledDate,
        scheduledTimeSlot: input.scheduledTimeSlot,
        specialInstructions: input.specialInstructions,
        items: {
          create: input.items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            const pricePerUnit = product ? Number(product.price) : 0;
            const total = pricePerUnit * item.quantity;

            return {
              productId: item.productId,
              quantity: item.quantity,
              pricePerUnit,
              total,
            };
          }),
        },
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        farm: {
          select: { id: true, name: true },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                unit: true,
                images: true,
              },
            },
          },
        },
        deliveryAddress: true,
      },
    });

    return order as OrderWithRelations;
  }

  /**
   * Get order by ID
   */
  static async getOrderById(
    orderId: string
  ): Promise<OrderWithRelations | null> {
    return (await database.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        farm: {
          select: { id: true, name: true },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                unit: true,
                images: true,
              },
            },
          },
        },
        deliveryAddress: true,
      },
    })) as OrderWithRelations | null;
  }

  /**
   * Get customer's orders
   */
  static async getCustomerOrders(
    customerId: string
  ): Promise<OrderWithRelations[]> {
    return (await database.order.findMany({
      where: { customerId },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        farm: {
          select: { id: true, name: true },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                unit: true,
                images: true,
              },
            },
          },
        },
        deliveryAddress: true,
      },
      orderBy: { createdAt: "desc" },
    })) as OrderWithRelations[];
  }

  /**
   * Get farm's orders
   */
  static async getFarmOrders(farmId: string): Promise<OrderWithRelations[]> {
    return (await database.order.findMany({
      where: { farmId },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        farm: {
          select: { id: true, name: true },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                unit: true,
                images: true,
              },
            },
          },
        },
        deliveryAddress: true,
      },
      orderBy: { createdAt: "desc" },
    })) as OrderWithRelations[];
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    input: UpdateOrderStatusInput
  ): Promise<OrderWithRelations> {
    // Get current order
    const currentOrder = await database.order.findUnique({
      where: { id: input.orderId },
    });

    if (!currentOrder) {
      throw new Error("Order not found");
    }

    // Validate status transition
    const validation = OrderValidator.validateStatusTransition(
      currentOrder.status,
      input.status
    );

    if (!validation.valid) {
      throw new Error(`Status update failed: ${validation.errors.join(", ")}`);
    }

    const order = await database.order.update({
      where: { id: input.orderId },
      data: {
        status: input.status,
        ...(input.status === OrderStatus.CONFIRMED && {
          confirmedAt: new Date(),
        }),
        ...(input.status === OrderStatus.FULFILLED && {
          fulfilledAt: new Date(),
        }),
        ...(input.status === OrderStatus.COMPLETED && {
          completedAt: new Date(),
        }),
        ...(input.status === OrderStatus.CANCELLED && {
          cancelledAt: new Date(),
          cancelledBy: input.updatedBy,
          cancelReason: input.notes,
        }),
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        farm: {
          select: { id: true, name: true },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                unit: true,
                images: true,
              },
            },
          },
        },
        deliveryAddress: true,
      },
    });

    return order as OrderWithRelations;
  }

  /**
   * Cancel order
   */
  static async cancelOrder(
    orderId: string,
    cancelledBy: string,
    reason: string
  ): Promise<OrderWithRelations> {
    return await this.updateOrderStatus({
      orderId,
      status: OrderStatus.CANCELLED,
      updatedBy: cancelledBy,
      notes: reason,
    });
  }
}
