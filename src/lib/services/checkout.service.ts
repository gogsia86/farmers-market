// 💳 QUANTUM CHECKOUT SERVICE - Divine Order Creation & Payment Orchestration
// Manages checkout process with agricultural consciousness and quantum precision

import { database } from "@/lib/database";
import type { Order, UserAddress } from "@prisma/client";
import { Decimal } from "decimal.js";
import type { CartItemWithProduct } from "./cart.service";
import { cartService } from "./cart.service";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CheckoutSessionRequest {
  userId: string;
  deliveryAddressId?: string;
  fulfillmentMethod: "DELIVERY" | "PICKUP";
  scheduledDate?: Date;
  scheduledTimeSlot?: string;
  specialInstructions?: string;
  promoCode?: string;
}

export interface CheckoutSession {
  id: string;
  userId: string;
  items: CartItemWithProduct[];
  farmOrders: FarmCheckoutOrder[];
  deliveryAddress?: UserAddress;
  fulfillmentMethod: "DELIVERY" | "PICKUP";
  scheduledDate?: Date;
  scheduledTimeSlot?: string;
  specialInstructions?: string;
  totals: CheckoutTotals;
  expiresAt: Date;
  createdAt: Date;
}

export interface FarmCheckoutOrder {
  farmId: string;
  farmName: string;
  items: CartItemWithProduct[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
  farmerAmount: number;
}

export interface CheckoutTotals {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  platformFee: number;
  discount: number;
  total: number;
}

export interface CreateOrdersRequest {
  sessionId: string;
  paymentIntentId: string;
  userId: string;
}

export interface CreateOrdersResult {
  orders: Order[];
  totalAmount: number;
  orderCount: number;
}

export interface ValidateCheckoutRequest {
  userId: string;
  deliveryAddressId?: string;
  fulfillmentMethod: "DELIVERY" | "PICKUP";
}

export interface ValidateCheckoutResult {
  isValid: boolean;
  errors: CheckoutValidationError[];
  warnings: string[];
}

export interface CheckoutValidationError {
  code: string;
  message: string;
  field?: string;
}

// ============================================================================
// CHECKOUT SERVICE - QUANTUM ORDER ORCHESTRATOR
// ============================================================================

export class QuantumCheckoutService {
  private readonly TAX_RATE = 0.08; // 8% - TODO: Make location-based
  private readonly PLATFORM_FEE_RATE = 0.15; // 15% platform fee
  private readonly DELIVERY_FEE_BASE = 5.99;
  private readonly FREE_DELIVERY_THRESHOLD = 50;
  private readonly SESSION_EXPIRATION_MINUTES = 30;

  // In-memory session storage (TODO: Use Redis for production)
  private sessions = new Map<string, CheckoutSession>();

  // ==========================================================================
  // CHECKOUT SESSION MANAGEMENT
  // ==========================================================================

  /**
   * 🎯 Create checkout session from cart
   */
  async createCheckoutSession(
    request: CheckoutSessionRequest
  ): Promise<CheckoutSession> {
    const {
      userId,
      deliveryAddressId,
      fulfillmentMethod,
      scheduledDate,
      scheduledTimeSlot,
      specialInstructions,
    } = request;

    // Validate cart
    const validation = await cartService.validateCart(userId);
    if (!validation.isValid) {
      throw new Error(
        `Cart validation failed: ${validation.errors.map((e) => e.message).join(", ")}`
      );
    }

    // Get cart items
    const cartSummary = await cartService.getCartSummary(userId);
    if (cartSummary.items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Get delivery address if needed
    let deliveryAddress: UserAddress | undefined;
    if (fulfillmentMethod === "DELIVERY") {
      if (!deliveryAddressId) {
        throw new Error("Delivery address is required for delivery orders");
      }

      const address = await database.userAddress.findUnique({
        where: { id: deliveryAddressId },
      });

      if (!address) {
        throw new Error("Delivery address not found");
      }

      if (address.userId !== userId) {
        throw new Error("Delivery address does not belong to user");
      }

      deliveryAddress = address;
    }

    // Group items by farm and calculate totals
    const farmOrders = this.calculateFarmOrders(
      cartSummary.farmGroups,
      fulfillmentMethod
    );

    // Calculate total amounts
    const totals = this.calculateTotals(farmOrders);

    // Create session
    const sessionId = `checkout_${Date.now()}_${userId}`;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.SESSION_EXPIRATION_MINUTES);

    const session: CheckoutSession = {
      id: sessionId,
      userId,
      items: cartSummary.items,
      farmOrders,
      deliveryAddress,
      fulfillmentMethod,
      scheduledDate,
      scheduledTimeSlot,
      specialInstructions,
      totals,
      expiresAt,
      createdAt: new Date(),
    };

    // Store session
    this.sessions.set(sessionId, session);

    return session;
  }

  /**
   * 📦 Get checkout session
   */
  async getCheckoutSession(sessionId: string): Promise<CheckoutSession | null> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    // Check expiration
    if (new Date() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  /**
   * 🔄 Update checkout session
   */
  async updateCheckoutSession(
    sessionId: string,
    updates: Partial<CheckoutSessionRequest>
  ): Promise<CheckoutSession> {
    const session = await this.getCheckoutSession(sessionId);

    if (!session) {
      throw new Error("Checkout session not found or expired");
    }

    // Apply updates
    if (updates.deliveryAddressId !== undefined) {
      const address = await database.userAddress.findUnique({
        where: { id: updates.deliveryAddressId },
      });

      if (!address || address.userId !== session.userId) {
        throw new Error("Invalid delivery address");
      }

      session.deliveryAddress = address;
    }

    if (updates.fulfillmentMethod) {
      session.fulfillmentMethod = updates.fulfillmentMethod;
    }

    if (updates.scheduledDate) {
      session.scheduledDate = updates.scheduledDate;
    }

    if (updates.scheduledTimeSlot) {
      session.scheduledTimeSlot = updates.scheduledTimeSlot;
    }

    if (updates.specialInstructions !== undefined) {
      session.specialInstructions = updates.specialInstructions;
    }

    // Recalculate totals if fulfillment method changed
    if (updates.fulfillmentMethod) {
      const cartSummary = await cartService.getCartSummary(session.userId);
      session.farmOrders = this.calculateFarmOrders(
        cartSummary.farmGroups,
        session.fulfillmentMethod
      );
      session.totals = this.calculateTotals(session.farmOrders);
    }

    // Store updated session
    this.sessions.set(sessionId, session);

    return session;
  }

  /**
   * 🗑️ Delete checkout session
   */
  async deleteCheckoutSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  // ==========================================================================
  // ORDER CREATION
  // ==========================================================================

  /**
   * 📝 Create orders from checkout session
   */
  async createOrdersFromSession(
    request: CreateOrdersRequest
  ): Promise<CreateOrdersResult> {
    const { sessionId, paymentIntentId, userId } = request;

    // Get session
    const session = await this.getCheckoutSession(sessionId);
    if (!session) {
      throw new Error("Checkout session not found or expired");
    }

    if (session.userId !== userId) {
      throw new Error("Session does not belong to user");
    }

    // Validate cart one more time
    const validation = await cartService.validateCart(userId);
    if (!validation.isValid) {
      throw new Error("Cart validation failed. Please review your cart.");
    }

    // Create orders for each farm
    const orders: Order[] = [];

    for (const farmOrder of session.farmOrders) {
      try {
        const order = await this.createSingleOrder({
          userId,
          farmOrder,
          session,
          paymentIntentId,
        });

        orders.push(order);
      } catch (error) {
        logger.error(`Failed to create order for farm ${farmOrder.farmId}:`, error);
        // TODO: Implement rollback mechanism
        throw new Error(`Failed to create order for ${farmOrder.farmName}`);
      }
    }

    // Clear cart after successful order creation
    await cartService.clearCart(userId);

    // Delete session
    await this.deleteCheckoutSession(sessionId);

    return {
      orders,
      totalAmount: session.totals.total,
      orderCount: orders.length,
    };
  }

  /**
   * 📝 Create single order for a farm
   */
  private async createSingleOrder(params: {
    userId: string;
    farmOrder: FarmCheckoutOrder;
    session: CheckoutSession;
    paymentIntentId: string;
  }): Promise<Order> {
    const { userId, farmOrder, session, paymentIntentId } = params;

    // Generate unique order number
    const orderNumber = await this.generateOrderNumber();

    // Create order using order service with correct format
    const order = await database.order.create({
      data: {
        orderNumber,
        customerId: userId,
        farmId: farmOrder.farmId,
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal: new Decimal(farmOrder.subtotal),
        tax: new Decimal(farmOrder.tax),
        deliveryFee: new Decimal(farmOrder.deliveryFee),
        platformFee: new Decimal(farmOrder.platformFee),
        discount: new Decimal(0),
        total: new Decimal(farmOrder.total),
        farmerAmount: new Decimal(farmOrder.farmerAmount),
        fulfillmentMethod: session.fulfillmentMethod as any,
        deliveryAddressId: session.deliveryAddress?.id,
        scheduledDate: session.scheduledDate,
        scheduledTimeSlot: session.scheduledTimeSlot,
        specialInstructions: session.specialInstructions,
        stripePaymentIntentId: paymentIntentId,
        items: {
          create: farmOrder.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.priceAtAdd,
            subtotal: new Decimal(item.quantity.toNumber() * item.priceAtAdd.toNumber()),
            productSnapshot: {
              name: item.product.name,
              description: item.product.description,
              images: item.product.images,
              organic: item.product.organic,
              unit: item.product.unit,
              price: item.product.price.toNumber(),
            },
          })),
        },
      },
      include: {
        items: true,
        customer: true,
        farm: true,
      },
    });

    return order;
  }

  // ==========================================================================
  // CALCULATIONS
  // ==========================================================================

  /**
   * 💰 Calculate orders for each farm
   */
  private calculateFarmOrders(
    farmGroups: Array<{
      farmId: string;
      farmName: string;
      items: CartItemWithProduct[];
      subtotal: number;
    }>,
    fulfillmentMethod: "DELIVERY" | "PICKUP"
  ): FarmCheckoutOrder[] {
    return farmGroups.map((group) => {
      const subtotal = group.subtotal;

      // Calculate delivery fee (per farm)
      const deliveryFee =
        fulfillmentMethod === "DELIVERY"
          ? subtotal >= this.FREE_DELIVERY_THRESHOLD
            ? 0
            : this.DELIVERY_FEE_BASE
          : 0;

      // Calculate tax
      const tax = subtotal * this.TAX_RATE;

      // Calculate total before platform fee
      const totalBeforeFee = subtotal + tax + deliveryFee;

      // Calculate platform fee
      const platformFee = subtotal * this.PLATFORM_FEE_RATE;

      // Calculate total
      const total = totalBeforeFee;

      // Calculate farmer amount (subtotal - platform fee)
      const farmerAmount = subtotal - platformFee;

      return {
        farmId: group.farmId,
        farmName: group.farmName,
        items: group.items,
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        deliveryFee: Math.round(deliveryFee * 100) / 100,
        platformFee: Math.round(platformFee * 100) / 100,
        total: Math.round(total * 100) / 100,
        farmerAmount: Math.round(farmerAmount * 100) / 100,
      };
    });
  }

  /**
   * 💰 Calculate total amounts across all farm orders
   */
  private calculateTotals(farmOrders: FarmCheckoutOrder[]): CheckoutTotals {
    const subtotal = farmOrders.reduce((sum, order) => sum + order.subtotal, 0);
    const tax = farmOrders.reduce((sum, order) => sum + order.tax, 0);
    const deliveryFee = farmOrders.reduce((sum, order) => sum + order.deliveryFee, 0);
    const platformFee = farmOrders.reduce((sum, order) => sum + order.platformFee, 0);
    const total = farmOrders.reduce((sum, order) => sum + order.total, 0);

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      platformFee: Math.round(platformFee * 100) / 100,
      discount: 0, // TODO: Implement promo codes
      total: Math.round(total * 100) / 100,
    };
  }

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  /**
   * ✅ Validate checkout requirements
   */
  async validateCheckout(
    request: ValidateCheckoutRequest
  ): Promise<ValidateCheckoutResult> {
    const { userId, deliveryAddressId, fulfillmentMethod } = request;
    const errors: CheckoutValidationError[] = [];
    const warnings: string[] = [];

    // Validate cart
    const cartValidation = await cartService.validateCart(userId);
    if (!cartValidation.isValid) {
      errors.push(
        ...cartValidation.errors.map((e) => ({
          code: e.type,
          message: e.message,
          field: "cart",
        }))
      );
    }

    // Check cart is not empty
    const cartCount = await cartService.getCartCount(userId);
    if (cartCount === 0) {
      errors.push({
        code: "EMPTY_CART",
        message: "Cart is empty",
        field: "cart",
      });
    }

    // Validate delivery address if delivery
    if (fulfillmentMethod === "DELIVERY") {
      if (!deliveryAddressId) {
        errors.push({
          code: "MISSING_DELIVERY_ADDRESS",
          message: "Delivery address is required",
          field: "deliveryAddressId",
        });
      } else {
        const address = await database.userAddress.findUnique({
          where: { id: deliveryAddressId },
        });

        if (!address) {
          errors.push({
            code: "INVALID_DELIVERY_ADDRESS",
            message: "Delivery address not found",
            field: "deliveryAddressId",
          });
        } else if (address.userId !== userId) {
          errors.push({
            code: "UNAUTHORIZED_DELIVERY_ADDRESS",
            message: "Delivery address does not belong to user",
            field: "deliveryAddressId",
          });
        }
      }
    }

    // Add warnings from cart validation
    if (cartValidation.warnings.length > 0) {
      warnings.push(...cartValidation.warnings.map((w) => w.message));
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  /**
   * 🔢 Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * 🧹 Cleanup expired sessions (call periodically)
   */
  async cleanupExpiredSessions(): Promise<number> {
    const now = new Date();
    let count = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
        count++;
      }
    }

    return count;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const checkoutService = new QuantumCheckoutService();
