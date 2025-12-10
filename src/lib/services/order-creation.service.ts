/**
 * 📦 ORDER CREATION SERVICE - Divine Order Manifestation
 *
 * Handles all order creation operations:
 * - Order validation and preparation
 * - Cart to order transformation
 * - Order number generation
 * - Total calculations
 * - Initial order persistence
 *
 * Split from the monolithic order.service.ts for better maintainability.
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 */

import { database } from "@/lib/database";
import type { Order, OrderItem } from "@prisma/client";
import { ValidationError } from "@/lib/errors/ValidationError";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { BusinessLogicError } from "@/lib/errors/BusinessLogicError";
import type { Prisma } from "@prisma/client";

// Helper to convert Prisma Decimal to number
function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  return value.toNumber();
}

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CreateOrderRequest {
  customerId: string;
  farmId: string;
  items: OrderItemInput[];
  fulfillmentMethod: FulfillmentMethod;
  deliveryAddressId?: string;
  specialInstructions?: string;
  scheduledDate?: Date;
  promoCode?: string;
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export type FulfillmentMethod = "DELIVERY" | "FARM_PICKUP" | "MARKET_PICKUP";

export interface OrderTotals {
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  discount: number;
  total: number;
  farmerAmount: number;
}

export interface CartToOrderRequest {
  cartId: string;
  customerId: string;
  farmId: string;
  fulfillmentMethod: FulfillmentMethod;
  deliveryAddressId?: string;
  scheduledDate?: Date;
  specialInstructions?: string;
}

export interface OrderValidationResult {
  isValid: boolean;
  errors: OrderValidationError[];
  warnings: OrderValidationWarning[];
}

export interface OrderValidationError {
  field: string;
  message: string;
  code: string;
}

export interface OrderValidationWarning {
  field: string;
  message: string;
  severity: "low" | "medium" | "high";
  suggestion?: string;
}

export interface CreatedOrder extends Order {
  items: OrderItem[];
}

// ============================================
// CONSTANTS
// ============================================

const TAX_RATE = 0.08; // 8%
const PLATFORM_FEE_RATE = 0.05; // 5%
const DELIVERY_FEE = 5.99;
const FREE_DELIVERY_THRESHOLD = 50;

// ============================================
// ORDER CREATION SERVICE
// ============================================

export class OrderCreationService {
  // ========================================
  // MAIN ORDER CREATION
  // ========================================

  /**
   * Create a new order from validated request
   */
  async createOrder(request: CreateOrderRequest): Promise<CreatedOrder> {
    // Step 1: Validate the order request
    const validation = await this.validateOrderRequest(request);
    if (!validation.isValid) {
      const firstError = validation.errors[0];
      throw new ValidationError(
        firstError?.field || "order",
        firstError?.message || "Order validation failed",
        undefined,
        { errors: validation.errors },
      );
    }

    // Step 2: Calculate totals
    const totals = await this.calculateOrderTotals(
      request.items,
      request.fulfillmentMethod,
    );

    // Step 3: Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Step 4: Create order in transaction
    const order = await database.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: request.customerId,
          farmId: request.farmId,
          status: "PENDING",
          paymentStatus: "PENDING",
          fulfillmentMethod: request.fulfillmentMethod,
          subtotal: totals.subtotal,
          deliveryFee: totals.deliveryFee,
          platformFee: totals.platformFee,
          tax: totals.tax,
          total: totals.total,
          farmerAmount: totals.farmerAmount,
          deliveryAddressId: request.deliveryAddressId,
          specialInstructions: request.specialInstructions,
          scheduledDate: request.scheduledDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          customer: true,
          farm: true,
          items: true,
        },
      });

      // Create order items
      const orderItems: OrderItem[] = [];
      for (const item of request.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundError("Product", item.productId);
        }

        const unitPrice = Number(product.price);
        const itemSubtotal = unitPrice * item.quantity;

        const orderItem = await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            productName: product.name,
            quantity: item.quantity,
            unit: product.unit,
            unitPrice,
            subtotal: itemSubtotal,
            productSnapshot: {
              name: product.name,
              price: product.price,
              unit: product.unit,
              description: product.description,
            },
          },
        });

        orderItems.push(orderItem);

        // Decrement product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantityAvailable: {
              decrement: item.quantity,
            },
          },
        });
      }

      return { ...newOrder, items: orderItems };
    });

    return order as CreatedOrder;
  }

  /**
   * Transform cart to order
   */
  async transformCartToOrder(
    request: CartToOrderRequest,
  ): Promise<CreatedOrder> {
    // Fetch cart items
    const cartItems = await database.cartItem.findMany({
      where: {
        userId: request.customerId,
      },
      include: {
        product: true,
      },
    });

    if (cartItems.length === 0) {
      throw new BusinessLogicError("Cart is empty", "EMPTY_CART", {
        customerId: request.customerId,
      });
    }

    // Build order items from cart
    const orderItems: OrderItemInput[] = cartItems.map((item) => ({
      productId: item.productId,
      quantity: toNumber(item.quantity),
    }));

    // Create the order
    const orderRequest: CreateOrderRequest = {
      customerId: request.customerId,
      farmId: request.farmId,
      items: orderItems,
      fulfillmentMethod: request.fulfillmentMethod,
      deliveryAddressId: request.deliveryAddressId,
      specialInstructions: request.specialInstructions,
      scheduledDate: request.scheduledDate,
    };

    const order = await this.createOrder(orderRequest);

    // Clear cart after successful order
    await database.cartItem.deleteMany({
      where: {
        userId: request.customerId,
      },
    });

    return order;
  }

  // ========================================
  // VALIDATION
  // ========================================

  /**
   * Validate order request with detailed errors and warnings
   */
  async validateOrderRequest(
    request: CreateOrderRequest,
  ): Promise<OrderValidationResult> {
    const errors: OrderValidationError[] = [];
    const warnings: OrderValidationWarning[] = [];

    // Validate customer exists
    const customer = await database.user.findUnique({
      where: { id: request.customerId },
    });

    if (!customer) {
      errors.push({
        field: "customerId",
        message: "Customer not found",
        code: "CUSTOMER_NOT_FOUND",
      });
    }

    // Validate farm exists and is active
    const farm = await database.farm.findUnique({
      where: { id: request.farmId },
    });

    if (!farm) {
      errors.push({
        field: "farmId",
        message: "Farm not found",
        code: "FARM_NOT_FOUND",
      });
    } else if (farm.status !== "ACTIVE") {
      errors.push({
        field: "farmId",
        message: "Farm is not accepting orders",
        code: "FARM_NOT_ACTIVE",
      });
    }

    // Validate items
    if (!request.items || request.items.length === 0) {
      errors.push({
        field: "items",
        message: "Order must contain at least one item",
        code: "EMPTY_ORDER",
      });
    } else {
      for (let i = 0; i < request.items.length; i++) {
        const item = request.items[i];
        if (!item) continue;

        const product = await database.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          errors.push({
            field: `items[${i}].productId`,
            message: `Product not found: ${item.productId}`,
            code: "PRODUCT_NOT_FOUND",
          });
          continue;
        }

        const availableQty = toNumber(product.quantityAvailable);

        if (!product.inStock) {
          errors.push({
            field: `items[${i}].productId`,
            message: `Product is out of stock: ${product.name}`,
            code: "OUT_OF_STOCK",
          });
        }

        if (item.quantity > availableQty) {
          errors.push({
            field: `items[${i}].quantity`,
            message: `Insufficient stock for ${product.name}. Available: ${availableQty}`,
            code: "INSUFFICIENT_STOCK",
          });
        }

        if (item.quantity <= 0) {
          errors.push({
            field: `items[${i}].quantity`,
            message: "Quantity must be greater than 0",
            code: "INVALID_QUANTITY",
          });
        }

        // Warnings for low stock
        if (availableQty > 0 && item.quantity >= availableQty * 0.8) {
          warnings.push({
            field: `items[${i}].quantity`,
            message: `Low stock warning for ${product.name}`,
            severity: "medium",
            suggestion: "Consider ordering soon as stock is limited",
          });
        }
      }
    }

    // Validate delivery address for delivery orders
    if (request.fulfillmentMethod === "DELIVERY") {
      if (!request.deliveryAddressId) {
        errors.push({
          field: "deliveryAddressId",
          message: "Delivery address is required for delivery orders",
          code: "MISSING_DELIVERY_ADDRESS",
        });
      } else {
        const address = await database.address.findUnique({
          where: { id: request.deliveryAddressId },
        });

        if (!address) {
          errors.push({
            field: "deliveryAddressId",
            message: "Delivery address not found",
            code: "ADDRESS_NOT_FOUND",
          });
        } else if (address.userId !== request.customerId) {
          errors.push({
            field: "deliveryAddressId",
            message: "Address does not belong to customer",
            code: "INVALID_ADDRESS_OWNER",
          });
        }
      }
    }

    // Validate scheduled date
    if (request.scheduledDate) {
      const now = new Date();
      if (request.scheduledDate < now) {
        errors.push({
          field: "scheduledDate",
          message: "Scheduled date cannot be in the past",
          code: "INVALID_SCHEDULED_DATE",
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ========================================
  // CALCULATIONS
  // ========================================

  /**
   * Calculate order totals
   */
  async calculateOrderTotals(
    items: OrderItemInput[],
    fulfillmentMethod: FulfillmentMethod,
  ): Promise<OrderTotals> {
    let subtotal = 0;

    for (const item of items) {
      const product = await database.product.findUnique({
        where: { id: item.productId },
      });

      if (product) {
        subtotal += Number(product.price) * item.quantity;
      }
    }

    // Calculate fees
    const deliveryFee =
      fulfillmentMethod === "DELIVERY" && subtotal < FREE_DELIVERY_THRESHOLD
        ? DELIVERY_FEE
        : 0;

    const platformFee = subtotal * PLATFORM_FEE_RATE;
    const taxBase = subtotal + deliveryFee;
    const tax = taxBase * TAX_RATE;
    const total = subtotal + deliveryFee + platformFee + tax;
    const farmerAmount = subtotal - platformFee;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      platformFee: Math.round(platformFee * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      discount: 0,
      total: Math.round(total * 100) / 100,
      farmerAmount: Math.round(farmerAmount * 100) / 100,
    };
  }

  // ========================================
  // UTILITIES
  // ========================================

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const prefix = "ORD";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `${prefix}-${timestamp}-${random}`;

    // Ensure uniqueness
    const existing = await database.order.findUnique({
      where: { orderNumber },
    });

    if (existing) {
      // Recursively generate if collision (very rare)
      return this.generateOrderNumber();
    }

    return orderNumber;
  }

  /**
   * Get order creation preview (totals without creating)
   */
  async getOrderPreview(
    items: OrderItemInput[],
    fulfillmentMethod: FulfillmentMethod,
  ): Promise<{
    totals: OrderTotals;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }>;
  }> {
    const totals = await this.calculateOrderTotals(items, fulfillmentMethod);

    const itemDetails = await Promise.all(
      items.map(async (item) => {
        const product = await database.product.findUnique({
          where: { id: item.productId },
        });

        return {
          productId: item.productId,
          productName: product?.name || "Unknown Product",
          quantity: item.quantity,
          unitPrice: Number(product?.price || 0),
          subtotal: Number(product?.price || 0) * item.quantity,
        };
      }),
    );

    return {
      totals,
      items: itemDetails,
    };
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const orderCreationService = new OrderCreationService();
export default orderCreationService;
