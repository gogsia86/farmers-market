/**
 * ✅ ORDER VALIDATION SERVICE - Divine Validation Orchestration
 *
 * Handles all order validation operations:
 * - Order request validation
 * - Status transition validation
 * - Business rule enforcement
 * - Seasonal and biodynamic validation
 * - Warning generation
 *
 * Split from the monolithic order.service.ts for better maintainability.
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/12_ERROR_HANDLING_VALIDATION.instructions.md
 */

import { database } from "@/lib/database";
import type { Order, Product } from "@prisma/client";

// ============================================
// TYPE DEFINITIONS
// ============================================

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "FULFILLED"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type FulfillmentMethod = "DELIVERY" | "FARM_PICKUP" | "MARKET_PICKUP";

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

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

export interface ValidationResult {
  isValid: boolean;
  errors: OrderValidationError[];
  warnings: OrderValidationWarning[];
}

export interface StatusTransitionValidation {
  isValid: boolean;
  error?: string;
  allowedTransitions: OrderStatus[];
}

export interface ProductValidation {
  product: Product | null;
  isValid: boolean;
  errors: OrderValidationError[];
  warnings: OrderValidationWarning[];
}

export interface SeasonalValidation {
  isSeasonallyAppropriate: boolean;
  seasonalScore: number;
  recommendations: string[];
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Valid status transitions for orders
 */
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["FULFILLED", "CANCELLED"],
  FULFILLED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

/**
 * Statuses that can be cancelled
 */
export const CANCELLABLE_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
];

/**
 * Maximum items per order
 */
const MAX_ITEMS_PER_ORDER = 100;

/**
 * Maximum quantity per item
 */
const MAX_QUANTITY_PER_ITEM = 1000;

/**
 * Low stock threshold percentage
 */
const LOW_STOCK_THRESHOLD = 0.8;

/**
 * Seasonal products mapping
 */
const SEASONAL_PRODUCTS: Record<string, string[]> = {
  SPRING: ["asparagus", "peas", "lettuce", "spinach", "radish", "strawberry"],
  SUMMER: ["tomato", "corn", "pepper", "zucchini", "melon", "berry", "peach"],
  FALL: ["pumpkin", "apple", "squash", "grape", "pear", "cranberry"],
  WINTER: ["citrus", "kale", "cabbage", "brussels", "potato", "onion"],
};

// ============================================
// ORDER VALIDATION SERVICE
// ============================================

export class OrderValidationService {
  // ========================================
  // MAIN VALIDATION
  // ========================================

  /**
   * Comprehensive order request validation
   */
  async validateOrderRequest(
    request: CreateOrderRequest,
  ): Promise<ValidationResult> {
    const errors: OrderValidationError[] = [];
    const warnings: OrderValidationWarning[] = [];

    // Validate customer
    const customerValidation = await this.validateCustomer(request.customerId);
    errors.push(...customerValidation.errors);
    warnings.push(...customerValidation.warnings);

    // Validate farm
    const farmValidation = await this.validateFarm(request.farmId);
    errors.push(...farmValidation.errors);
    warnings.push(...farmValidation.warnings);

    // Validate items
    const itemsValidation = await this.validateOrderItems(
      request.items,
      request.farmId,
    );
    errors.push(...itemsValidation.errors);
    warnings.push(...itemsValidation.warnings);

    // Validate fulfillment method
    const fulfillmentValidation = await this.validateFulfillmentMethod(
      request.fulfillmentMethod,
      request.deliveryAddressId,
      request.customerId,
    );
    errors.push(...fulfillmentValidation.errors);
    warnings.push(...fulfillmentValidation.warnings);

    // Validate scheduled date
    if (request.scheduledDate) {
      const scheduleValidation = this.validateScheduledDate(
        request.scheduledDate,
      );
      errors.push(...scheduleValidation.errors);
      warnings.push(...scheduleValidation.warnings);
    }

    // Add seasonal validation as warnings
    if (request.items.length > 0) {
      const seasonalValidation = await this.validateSeasonalAppropiateness(
        request.items,
      );
      warnings.push(...seasonalValidation.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Quick validation check (minimal database calls)
   */
  async quickValidate(request: CreateOrderRequest): Promise<boolean> {
    // Basic structure validation
    if (!request.customerId || !request.farmId) return false;
    if (!request.items || request.items.length === 0) return false;
    if (request.items.length > MAX_ITEMS_PER_ORDER) return false;

    // Check for invalid quantities
    for (const item of request.items) {
      if (!item.productId || item.quantity <= 0) return false;
      if (item.quantity > MAX_QUANTITY_PER_ITEM) return false;
    }

    // Validate fulfillment method
    const validMethods: FulfillmentMethod[] = [
      "DELIVERY",
      "FARM_PICKUP",
      "MARKET_PICKUP",
    ];
    if (!validMethods.includes(request.fulfillmentMethod)) return false;

    // Delivery requires address
    if (
      request.fulfillmentMethod === "DELIVERY" &&
      !request.deliveryAddressId
    ) {
      return false;
    }

    return true;
  }

  // ========================================
  // CUSTOMER VALIDATION
  // ========================================

  /**
   * Validate customer exists and is active
   */
  async validateCustomer(customerId: string): Promise<{
    errors: OrderValidationError[];
    warnings: OrderValidationWarning[];
  }> {
    const errors: OrderValidationError[] = [];
    const warnings: OrderValidationWarning[] = [];

    if (!customerId) {
      errors.push({
        field: "customerId",
        message: "Customer ID is required",
        code: "MISSING_CUSTOMER_ID",
      });
      return { errors, warnings };
    }

    const customer = await database.user.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        role: true,
        createdAt: true,
      },
    });

    if (!customer) {
      errors.push({
        field: "customerId",
        message: "Customer not found",
        code: "CUSTOMER_NOT_FOUND",
      });
      return { errors, warnings };
    }

    // Check if email is verified
    if (!customer.emailVerified) {
      warnings.push({
        field: "customerId",
        message: "Customer email is not verified",
        severity: "low",
        suggestion: "Verify your email for better account security",
      });
    }

    // Check for new customer (first order)
    const orderCount = await database.order.count({
      where: { customerId },
    });

    if (orderCount === 0) {
      warnings.push({
        field: "customerId",
        message: "This is the customer's first order",
        severity: "low",
        suggestion: "Consider offering a welcome discount",
      });
    }

    return { errors, warnings };
  }

  // ========================================
  // FARM VALIDATION
  // ========================================

  /**
   * Validate farm exists and is accepting orders
   */
  async validateFarm(farmId: string): Promise<{
    errors: OrderValidationError[];
    warnings: OrderValidationWarning[];
  }> {
    const errors: OrderValidationError[] = [];
    const warnings: OrderValidationWarning[] = [];

    if (!farmId) {
      errors.push({
        field: "farmId",
        message: "Farm ID is required",
        code: "MISSING_FARM_ID",
      });
      return { errors, warnings };
    }

    const farm = await database.farm.findUnique({
      where: { id: farmId },
      select: {
        id: true,
        name: true,
        status: true,
        averageRating: true,
      },
    });

    if (!farm) {
      errors.push({
        field: "farmId",
        message: "Farm not found",
        code: "FARM_NOT_FOUND",
      });
      return { errors, warnings };
    }

    if (farm.status !== "ACTIVE") {
      errors.push({
        field: "farmId",
        message: `Farm "${farm.name}" is not active and cannot accept orders`,
        code: "FARM_NOT_ACTIVE",
      });
    }

    // High-rated farm suggestion
    if (farm.averageRating && Number(farm.averageRating) >= 4.5) {
      warnings.push({
        field: "farmId",
        message: `${farm.name} is a highly-rated farm!`,
        severity: "low",
        suggestion: "Great choice - this farm has excellent reviews",
      });
    }

    return { errors, warnings };
  }

  // ========================================
  // ITEMS VALIDATION
  // ========================================

  /**
   * Validate order items
   */
  async validateOrderItems(
    items: OrderItemInput[],
    farmId: string,
  ): Promise<{
    errors: OrderValidationError[];
    warnings: OrderValidationWarning[];
  }> {
    const errors: OrderValidationError[] = [];
    const warnings: OrderValidationWarning[] = [];

    if (!items || items.length === 0) {
      errors.push({
        field: "items",
        message: "Order must contain at least one item",
        code: "EMPTY_ORDER",
      });
      return { errors, warnings };
    }

    if (items.length > MAX_ITEMS_PER_ORDER) {
      errors.push({
        field: "items",
        message: `Order cannot contain more than ${MAX_ITEMS_PER_ORDER} items`,
        code: "TOO_MANY_ITEMS",
      });
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i]!;
      const fieldPrefix = `items[${i}]`;

      // Validate item structure
      if (!item.productId) {
        errors.push({
          field: `${fieldPrefix}.productId`,
          message: "Product ID is required",
          code: "MISSING_PRODUCT_ID",
        });
        continue;
      }

      if (item.quantity <= 0) {
        errors.push({
          field: `${fieldPrefix}.quantity`,
          message: "Quantity must be greater than 0",
          code: "INVALID_QUANTITY",
        });
        continue;
      }

      if (item.quantity > MAX_QUANTITY_PER_ITEM) {
        errors.push({
          field: `${fieldPrefix}.quantity`,
          message: `Quantity cannot exceed ${MAX_QUANTITY_PER_ITEM}`,
          code: "QUANTITY_TOO_HIGH",
        });
        continue;
      }

      // Validate product
      const productValidation = await this.validateProduct(
        item.productId,
        item.quantity,
        farmId,
        fieldPrefix,
      );
      errors.push(...productValidation.errors);
      warnings.push(...productValidation.warnings);
    }

    // Check for duplicate products
    const productIds = items.map((i) => i.productId);
    const duplicates = productIds.filter(
      (id, index) => productIds.indexOf(id) !== index,
    );
    if (duplicates.length > 0) {
      warnings.push({
        field: "items",
        message: "Order contains duplicate products",
        severity: "medium",
        suggestion: "Consider combining quantities for the same product",
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate individual product
   */
  async validateProduct(
    productId: string,
    quantity: number,
    farmId: string,
    fieldPrefix: string,
  ): Promise<ProductValidation> {
    const errors: OrderValidationError[] = [];
    const warnings: OrderValidationWarning[] = [];

    const product = await database.product.findUnique({
      where: { id: productId },
      include: {
        farm: {
          select: { id: true, name: true },
        },
      },
    });

    if (!product) {
      errors.push({
        field: `${fieldPrefix}.productId`,
        message: `Product not found: ${productId}`,
        code: "PRODUCT_NOT_FOUND",
      });
      return { product: null, isValid: false, errors, warnings };
    }

    // Check product belongs to the specified farm
    if (product.farmId !== farmId) {
      errors.push({
        field: `${fieldPrefix}.productId`,
        message: `Product "${product.name}" does not belong to the selected farm`,
        code: "PRODUCT_FARM_MISMATCH",
      });
    }

    // Check product is in stock
    if (!product.inStock) {
      errors.push({
        field: `${fieldPrefix}.productId`,
        message: `Product "${product.name}" is out of stock`,
        code: "OUT_OF_STOCK",
      });
    }

    // Check available quantity
    const availableQty = Number(product.quantityAvailable ?? 0);
    if (quantity > availableQty) {
      errors.push({
        field: `${fieldPrefix}.quantity`,
        message: `Insufficient stock for "${product.name}". Available: ${availableQty}, Requested: ${quantity}`,
        code: "INSUFFICIENT_STOCK",
      });
    }

    // Low stock warning
    if (availableQty > 0 && quantity >= availableQty * LOW_STOCK_THRESHOLD) {
      warnings.push({
        field: `${fieldPrefix}.quantity`,
        message: `Low stock warning for "${product.name}"`,
        severity: "medium",
        suggestion: `Only ${availableQty} units available - order soon!`,
      });
    }

    // Organic product info
    if (product.organic) {
      warnings.push({
        field: `${fieldPrefix}.productId`,
        message: `"${product.name}" is certified organic`,
        severity: "low",
        suggestion: "Great choice for health-conscious consumers!",
      });
    }

    return {
      product,
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ========================================
  // FULFILLMENT VALIDATION
  // ========================================

  /**
   * Validate fulfillment method and delivery address
   */
  async validateFulfillmentMethod(
    fulfillmentMethod: FulfillmentMethod,
    deliveryAddressId: string | undefined,
    customerId: string,
  ): Promise<{
    errors: OrderValidationError[];
    warnings: OrderValidationWarning[];
  }> {
    const errors: OrderValidationError[] = [];
    const warnings: OrderValidationWarning[] = [];

    const validMethods: FulfillmentMethod[] = [
      "DELIVERY",
      "FARM_PICKUP",
      "MARKET_PICKUP",
    ];

    if (!validMethods.includes(fulfillmentMethod)) {
      errors.push({
        field: "fulfillmentMethod",
        message: `Invalid fulfillment method: ${fulfillmentMethod}`,
        code: "INVALID_FULFILLMENT_METHOD",
      });
      return { errors, warnings };
    }

    // Delivery requires address
    if (fulfillmentMethod === "DELIVERY") {
      if (!deliveryAddressId) {
        errors.push({
          field: "deliveryAddressId",
          message: "Delivery address is required for delivery orders",
          code: "MISSING_DELIVERY_ADDRESS",
        });
      } else {
        const addressValidation = await this.validateDeliveryAddress(
          deliveryAddressId,
          customerId,
        );
        errors.push(...addressValidation.errors);
        warnings.push(...addressValidation.warnings);
      }
    }

    // Pickup suggestions
    if (fulfillmentMethod === "FARM_PICKUP") {
      warnings.push({
        field: "fulfillmentMethod",
        message: "Farm pickup selected",
        severity: "low",
        suggestion:
          "Save on delivery fees and get the freshest products directly from the farm!",
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate delivery address
   */
  async validateDeliveryAddress(
    addressId: string,
    customerId: string,
  ): Promise<{
    errors: OrderValidationError[];
    warnings: OrderValidationWarning[];
  }> {
    const errors: OrderValidationError[] = [];
    const warnings: OrderValidationWarning[] = [];

    const address = await database.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      errors.push({
        field: "deliveryAddressId",
        message: "Delivery address not found",
        code: "ADDRESS_NOT_FOUND",
      });
      return { errors, warnings };
    }

    if (address.userId !== customerId) {
      errors.push({
        field: "deliveryAddressId",
        message: "Address does not belong to customer",
        code: "INVALID_ADDRESS_OWNER",
      });
    }

    // Validate address completeness
    if (
      !address.street ||
      !address.city ||
      !address.state ||
      !address.zipCode
    ) {
      errors.push({
        field: "deliveryAddressId",
        message: "Delivery address is incomplete",
        code: "INCOMPLETE_ADDRESS",
      });
    }

    return { errors, warnings };
  }

  // ========================================
  // SCHEDULE VALIDATION
  // ========================================

  /**
   * Validate scheduled delivery/pickup date
   */
  validateScheduledDate(scheduledDate: Date): {
    errors: OrderValidationError[];
    warnings: OrderValidationWarning[];
  } {
    const errors: OrderValidationError[] = [];
    const warnings: OrderValidationWarning[] = [];

    const now = new Date();
    const minScheduleTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    const maxScheduleTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    if (scheduledDate < now) {
      errors.push({
        field: "scheduledDate",
        message: "Scheduled date cannot be in the past",
        code: "PAST_SCHEDULED_DATE",
      });
    }

    if (scheduledDate < minScheduleTime) {
      errors.push({
        field: "scheduledDate",
        message: "Orders must be scheduled at least 2 hours in advance",
        code: "TOO_SOON_SCHEDULED_DATE",
      });
    }

    if (scheduledDate > maxScheduleTime) {
      errors.push({
        field: "scheduledDate",
        message: "Orders cannot be scheduled more than 30 days in advance",
        code: "TOO_FAR_SCHEDULED_DATE",
      });
    }

    // Weekend scheduling warning
    const dayOfWeek = scheduledDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      warnings.push({
        field: "scheduledDate",
        message: "Order scheduled for weekend",
        severity: "low",
        suggestion:
          "Weekend deliveries may have limited availability in some areas",
      });
    }

    return { errors, warnings };
  }

  // ========================================
  // STATUS TRANSITION VALIDATION
  // ========================================

  /**
   * Validate if a status transition is allowed
   */
  validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): StatusTransitionValidation {
    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
    const isValid = allowedTransitions.includes(newStatus);

    return {
      isValid,
      error: isValid
        ? undefined
        : `Cannot transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedTransitions.join(", ") || "none"}`,
      allowedTransitions,
    };
  }

  /**
   * Get allowed next statuses for an order
   */
  getAllowedNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
    return VALID_STATUS_TRANSITIONS[currentStatus] || [];
  }

  /**
   * Check if order can be cancelled
   */
  canBeCancelled(status: OrderStatus): boolean {
    return CANCELLABLE_STATUSES.includes(status);
  }

  /**
   * Validate cancellation request
   */
  validateCancellation(
    order: Order,
    _requestingUserId: string,
    reason?: string,
  ): { errors: OrderValidationError[]; warnings: OrderValidationWarning[] } {
    const errors: OrderValidationError[] = [];
    const warnings: OrderValidationWarning[] = [];

    if (!this.canBeCancelled(order.status as OrderStatus)) {
      errors.push({
        field: "status",
        message: `Order in ${order.status} status cannot be cancelled`,
        code: "CANNOT_CANCEL",
      });
    }

    if (!reason || reason.trim().length < 10) {
      warnings.push({
        field: "reason",
        message: "Cancellation reason is brief",
        severity: "low",
        suggestion: "Providing a detailed reason helps improve our service",
      });
    }

    // Warn about refund processing time for paid orders
    if (order.paymentStatus === "PAID") {
      warnings.push({
        field: "paymentStatus",
        message: "Refund will be processed",
        severity: "medium",
        suggestion: "Refunds typically take 5-7 business days to process",
      });
    }

    return { errors, warnings };
  }

  // ========================================
  // SEASONAL VALIDATION
  // ========================================

  /**
   * Validate seasonal appropriateness of products
   */
  async validateSeasonalAppropiateness(
    items: OrderItemInput[],
  ): Promise<{ warnings: OrderValidationWarning[] }> {
    const warnings: OrderValidationWarning[] = [];
    const currentSeason = this.getCurrentSeason();
    const seasonalKeywords = SEASONAL_PRODUCTS[currentSeason] || [];

    const productIds = items.map((i) => i.productId);
    const products = await database.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, tags: true },
    });

    let seasonalCount = 0;
    for (const product of products) {
      const productName = product.name.toLowerCase();
      const productTags = (product.tags as string[]) || [];

      const isSeasonal = seasonalKeywords.some(
        (keyword) =>
          productName.includes(keyword) ||
          productTags.some((tag) => tag.toLowerCase().includes(keyword)),
      );

      if (isSeasonal) {
        seasonalCount++;
      }
    }

    const seasonalRatio =
      products.length > 0 ? seasonalCount / products.length : 0;

    if (seasonalRatio < 0.3 && products.length > 0) {
      warnings.push({
        field: "items",
        message: `Consider adding more ${currentSeason.toLowerCase()} seasonal products`,
        severity: "low",
        suggestion: `Seasonal produce is fresher and often more affordable. Try ${seasonalKeywords.slice(0, 3).join(", ")}!`,
      });
    } else if (seasonalRatio >= 0.7) {
      warnings.push({
        field: "items",
        message: "Great seasonal selection!",
        severity: "low",
        suggestion:
          "Your order includes many seasonal items - enjoy the freshest produce!",
      });
    }

    return { warnings };
  }

  /**
   * Get current season
   */
  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "SPRING";
    if (month >= 5 && month <= 7) return "SUMMER";
    if (month >= 8 && month <= 10) return "FALL";
    return "WINTER";
  }

  // ========================================
  // AUTHORIZATION VALIDATION
  // ========================================

  /**
   * Validate user authorization for order operations
   */
  async validateOrderAccess(
    orderId: string,
    userId: string,
    requiredAccess: "view" | "modify" | "cancel",
  ): Promise<{ isAuthorized: boolean; error?: string }> {
    const order = await database.order.findUnique({
      where: { id: orderId },
      include: {
        farm: {
          select: { ownerId: true },
        },
      },
    });

    if (!order) {
      return { isAuthorized: false, error: "Order not found" };
    }

    const isCustomer = order.customerId === userId;
    const isFarmOwner = order.farm?.ownerId === userId;

    // Check user role for admin access
    const user = await database.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isAdmin = user?.role === "ADMIN";

    switch (requiredAccess) {
      case "view":
        if (isCustomer || isFarmOwner || isAdmin) {
          return { isAuthorized: true };
        }
        break;
      case "modify":
        if (isFarmOwner || isAdmin) {
          return { isAuthorized: true };
        }
        break;
      case "cancel":
        if (isCustomer || isFarmOwner || isAdmin) {
          return { isAuthorized: true };
        }
        break;
    }

    return {
      isAuthorized: false,
      error: `User is not authorized to ${requiredAccess} this order`,
    };
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const orderValidationService = new OrderValidationService();
export default orderValidationService;
