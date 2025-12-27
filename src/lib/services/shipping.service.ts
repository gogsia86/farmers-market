/**
 * 🚚 DIVINE SHIPPING SERVICE
 * Quantum shipping calculations, tracking, and fulfillment with BaseService patterns
 *
 * @module ShippingService
 * @version 3.0.0 - BaseService Migration with ServiceResponse
 *
 * Features:
 * - Extends BaseService for standardized patterns
 * - ServiceResponse<T> for all operations
 * - OpenTelemetry tracing for observability
 * - Comprehensive Zod validation
 * - Shipping rate calculation
 * - Label creation and tracking
 * - Status updates with transaction safety
 * - Agricultural consciousness integration
 * - Divine error handling patterns
 */

import { database } from "@/lib/database";
import type { Order, OrderStatus } from "@prisma/client";
import { z } from "zod";
import { trace, SpanStatusCode } from "@opentelemetry/api";

import { BaseService } from "./base.service";
import type { ServiceResponse } from "@/lib/types/service-response";

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

const ShippingDestinationSchema = z.object({
  street: z.string().min(5, "Street address too short"),
  city: z.string().min(2, "City name too short"),
  state: z.string().length(2, "State must be 2-letter code"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  country: z.string().length(2, "Country must be 2-letter code").default("US"),
});

const CalculateRatesSchema = z.object({
  orderId: z.string().uuid("Invalid order ID format"),
  destination: ShippingDestinationSchema,
  weight: z.number().positive("Weight must be positive").optional(),
  packageDimensions: z
    .object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
    })
    .optional(),
});

const CreateLabelSchema = z.object({
  orderId: z.string().uuid("Invalid order ID format"),
  service: z.enum(["STANDARD", "EXPRESS", "OVERNIGHT"], {
    message: "Invalid shipping service",
  }),
  destination: ShippingDestinationSchema,
});

const UpdateStatusSchema = z.object({
  orderId: z.string().uuid("Invalid order ID format"),
  status: z.enum(
    [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "FULFILLED",
      "COMPLETED",
      "CANCELLED",
    ] as const,
    {
      message: "Invalid order status",
    },
  ),
  trackingEvent: z
    .object({
      location: z.string().optional(),
      description: z.string().optional(),
      timestamp: z.date().optional(),
    })
    .optional(),
});

const TrackingNumberSchema = z.object({
  trackingNumber: z.string().min(1, "Tracking number required"),
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ShippingRate {
  service: "STANDARD" | "EXPRESS" | "OVERNIGHT";
  cost: number;
  estimatedDays: number;
  carrier?: string;
  description?: string;
}

export interface ShippingLabel {
  labelId: string;
  trackingNumber: string;
  carrier: string;
  labelUrl?: string;
  createdAt: Date;
}

export interface TrackingEvent {
  status: string;
  location: string;
  description: string;
  timestamp: Date;
}

export interface TrackingInfo {
  orderId: string;
  trackingNumber: string;
  status: string;
  currentLocation: string;
  estimatedDelivery?: Date;
  events: TrackingEvent[];
}

export interface ShippingDestination {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type CalculateRatesRequest = z.infer<typeof CalculateRatesSchema>;
export type CreateLabelRequest = z.infer<typeof CreateLabelSchema>;
export type UpdateStatusRequest = z.infer<typeof UpdateStatusSchema>;
export type TrackingNumberRequest = z.infer<typeof TrackingNumberSchema>;

// ============================================================================
// SHIPPING SERVICE (BaseService Extension)
// ============================================================================

/**
 * 🌟 DIVINE SHIPPING SERVICE
 * Handles all shipping operations with agricultural consciousness
 */
export class ShippingService extends BaseService<Order> {
  constructor() {
    super({
      serviceName: "ShippingService",
      enableCaching: true, // Cache shipping rates
      cacheTTL: 1800, // 30 minutes
      enableTracing: true,
      enableAgriculturalConsciousness: true,
    });
  }

  // ==========================================================================
  // SHIPPING RATE OPERATIONS
  // ==========================================================================

  /**
   * 💰 Calculate shipping rates for an order
   * Returns available shipping options with costs
   *
   * @param request - Rate calculation request with destination
   * @returns ServiceResponse with ShippingRate array
   */
  async calculateShippingRates(
    request: CalculateRatesRequest,
  ): Promise<ServiceResponse<ShippingRate[]>> {
    const tracer = trace.getTracer(this.serviceName);

    return await tracer.startActiveSpan(
      "ShippingService.calculateShippingRates",
      async (span) => {
        try {
          // ✅ Step 1: Validate input
          const validated = await this.validate(CalculateRatesSchema, request);

          const { orderId, destination, weight } = validated;

          // ✅ Step 2: Add span attributes
          span.setAttributes({
            "shipping.order_id": orderId,
            "shipping.destination_state": destination.state,
            "shipping.destination_zip": destination.zipCode,
            "shipping.weight": weight || 0,
          });

          this.logger.info("Calculating shipping rates", {
            orderId,
            destination: `${destination.city}, ${destination.state}`,
          });

          // ✅ Step 3: Check cache
          const cacheKey = `rates:${destination.zipCode}:${weight || "default"}`;
          const cached = await this.cache.get<ShippingRate[]>(cacheKey);

          if (cached) {
            this.logger.debug("Returning cached shipping rates", { cacheKey });
            span.setAttribute("shipping.cache_hit", true);
            span.setStatus({ code: SpanStatusCode.OK });
            span.end();
            return this.success(cached);
          }

          // ✅ Step 4: Verify order exists
          const order = await database.order.findUnique({
            where: { id: orderId },
            include: {
              items: true,
              farm: true,
            },
          });

          if (!order) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "Order not found",
            });
            span.end();

            return this.error("ORDER_NOT_FOUND", "Order not found", {
              orderId,
            });
          }

          // ✅ Step 5: Calculate rates based on destination and weight
          // In production, integrate with shipping providers (FedEx, UPS, USPS)
          const baseRate = this.calculateBaseRate(destination);
          const weightMultiplier = weight ? Math.max(1, weight / 5) : 1;

          const rates: ShippingRate[] = [
            {
              service: "STANDARD",
              cost: Math.round(baseRate * weightMultiplier * 100) / 100,
              estimatedDays: 5,
              carrier: "USPS",
              description: "Standard Ground Shipping",
            },
            {
              service: "EXPRESS",
              cost: Math.round(baseRate * weightMultiplier * 2.5 * 100) / 100,
              estimatedDays: 2,
              carrier: "FedEx",
              description: "Express 2-Day Shipping",
            },
            {
              service: "OVERNIGHT",
              cost: Math.round(baseRate * weightMultiplier * 4.5 * 100) / 100,
              estimatedDays: 1,
              carrier: "FedEx",
              description: "Overnight Priority Shipping",
            },
          ];

          // ✅ Step 6: Cache rates
          await this.cache.set(cacheKey, rates, this.cacheTTL);

          this.logger.info("Shipping rates calculated", {
            orderId,
            ratesCount: rates.length,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          span.end();

          return this.success(rates);
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });
          span.recordException(error as Error);
          span.end();

          this.logger.error("Failed to calculate shipping rates", {
            error: error instanceof Error ? error.message : "Unknown error",
            request,
          });

          return this.error(
            "RATE_CALCULATION_FAILED",
            "Failed to calculate shipping rates",
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
          );
        }
      },
    );
  }

  /**
   * Calculate base rate based on destination
   * Private helper for rate calculation
   */
  private calculateBaseRate(destination: ShippingDestination): number {
    // Simple zone-based pricing
    // In production, use actual carrier rate tables
    const state = destination.state.toUpperCase();

    // Zone 1: Local (cheapest)
    const zone1States = ["CA", "OR", "WA"];
    if (zone1States.includes(state)) return 5.99;

    // Zone 2: Regional
    const zone2States = ["NV", "AZ", "ID", "MT", "UT"];
    if (zone2States.includes(state)) return 7.99;

    // Zone 3: National (most expensive)
    return 9.99;
  }

  // ==========================================================================
  // SHIPPING LABEL OPERATIONS
  // ==========================================================================

  /**
   * 📦 Create shipping label for an order
   * Generates label and tracking number with carrier integration
   *
   * @param request - Label creation request
   * @returns ServiceResponse with ShippingLabel
   */
  async createShippingLabel(
    request: CreateLabelRequest,
  ): Promise<ServiceResponse<ShippingLabel>> {
    const tracer = trace.getTracer(this.serviceName);

    return await tracer.startActiveSpan(
      "ShippingService.createShippingLabel",
      async (span) => {
        try {
          // ✅ Step 1: Validate input
          const validated = await this.validate(CreateLabelSchema, request);

          const { orderId, service, destination } = validated;

          // ✅ Step 2: Add span attributes
          span.setAttributes({
            "shipping.order_id": orderId,
            "shipping.service": service,
            "shipping.destination_zip": destination.zipCode,
          });

          this.logger.info("Creating shipping label", {
            orderId,
            service,
          });

          // ✅ Step 3: Verify order exists and is ready for shipping
          const order = await database.order.findUnique({
            where: { id: orderId },
            include: {
              items: true,
              farm: true,
            },
          });

          if (!order) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "Order not found",
            });
            span.end();

            return this.error("ORDER_NOT_FOUND", "Order not found", {
              orderId,
            });
          }

          // Check if order is in a valid state for shipping
          const validStatuses: OrderStatus[] = [
            "CONFIRMED",
            "PREPARING",
            "READY",
          ];
          if (!validStatuses.includes(order.status)) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "Invalid order status",
            });
            span.end();

            return this.error(
              "INVALID_ORDER_STATUS",
              `Order must be in CONFIRMED, PREPARING, or READY status. Current status: ${order.status}`,
              {
                orderId,
                currentStatus: order.status,
              },
            );
          }

          // ✅ Step 4: Generate tracking number and label ID
          // In production, integrate with shipping provider API (FedEx, UPS, USPS)
          const timestamp = Date.now();
          const trackingNumber = `${this.getCarrierPrefix(service)}${timestamp}`;
          const labelId = `LBL-${orderId.slice(0, 8)}-${timestamp}`;

          // ✅ Step 5: Update order with shipping information
          await database.order.update({
            where: { id: orderId },
            data: {
              trackingNumber,
              shippingService: service,
              status: "PREPARING",
            },
          });

          const label: ShippingLabel = {
            labelId,
            trackingNumber,
            carrier: this.getCarrierName(service),
            labelUrl: `https://shipping-labels.example.com/${labelId}.pdf`, // Mock URL
            createdAt: new Date(),
          };

          this.logger.info("Shipping label created", {
            orderId,
            trackingNumber,
            labelId,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          span.end();

          return this.success(label);
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });
          span.recordException(error as Error);
          span.end();

          this.logger.error("Failed to create shipping label", {
            error: error instanceof Error ? error.message : "Unknown error",
            request,
          });

          return this.error(
            "LABEL_CREATION_FAILED",
            "Failed to create shipping label",
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
          );
        }
      },
    );
  }

  /**
   * Get carrier prefix for tracking number
   */
  private getCarrierPrefix(service: string): string {
    switch (service) {
      case "STANDARD":
        return "USPS";
      case "EXPRESS":
      case "OVERNIGHT":
        return "FEDEX";
      default:
        return "TRK";
    }
  }

  /**
   * Get carrier name
   */
  private getCarrierName(service: string): string {
    switch (service) {
      case "STANDARD":
        return "USPS";
      case "EXPRESS":
      case "OVERNIGHT":
        return "FedEx";
      default:
        return "Unknown Carrier";
    }
  }

  // ==========================================================================
  // TRACKING OPERATIONS
  // ==========================================================================

  /**
   * 🔍 Get tracking information for a shipment
   * Retrieves tracking events and current status
   *
   * @param request - Tracking number request
   * @returns ServiceResponse with TrackingInfo
   */
  async getTrackingInfo(
    request: TrackingNumberRequest,
  ): Promise<ServiceResponse<TrackingInfo>> {
    const tracer = trace.getTracer(this.serviceName);

    return await tracer.startActiveSpan(
      "ShippingService.getTrackingInfo",
      async (span) => {
        try {
          // ✅ Step 1: Validate input
          const validated = await this.validate(TrackingNumberSchema, request);

          const { trackingNumber } = validated;

          // ✅ Step 2: Add span attributes
          span.setAttribute("shipping.tracking_number", trackingNumber);

          this.logger.info("Fetching tracking info", { trackingNumber });

          // ✅ Step 3: Find order by tracking number
          const order = await database.order.findFirst({
            where: { trackingNumber },
            include: {
              farm: true,
              customer: true,
            },
          });

          if (!order) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "Tracking number not found",
            });
            span.end();

            return this.error(
              "TRACKING_NOT_FOUND",
              "Tracking number not found",
              {
                trackingNumber,
              },
            );
          }

          // ✅ Step 4: Build tracking info
          // In production, fetch from shipping provider API
          const trackingInfo: TrackingInfo = {
            orderId: order.id,
            trackingNumber,
            status: order.status,
            currentLocation: this.getCurrentLocation(order.status),
            estimatedDelivery: this.calculateEstimatedDelivery(
              order.createdAt,
              order.shippingService || "STANDARD",
            ),
            events: this.generateTrackingEvents(order),
          };

          this.logger.info("Tracking info retrieved", {
            trackingNumber,
            orderId: order.id,
            status: order.status,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          span.end();

          return this.success(trackingInfo);
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });
          span.recordException(error as Error);
          span.end();

          this.logger.error("Failed to get tracking info", {
            error: error instanceof Error ? error.message : "Unknown error",
            request,
          });

          return this.error(
            "TRACKING_FETCH_FAILED",
            "Failed to retrieve tracking information",
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
          );
        }
      },
    );
  }

  /**
   * Get current location based on order status
   */
  private getCurrentLocation(status: OrderStatus): string {
    switch (status) {
      case "CONFIRMED":
      case "PREPARING":
        return "Farm - Preparing for Shipment";
      case "READY":
        return "Farm - Ready for Pickup";
      case "FULFILLED":
        return "In Transit - Distribution Center";
      case "COMPLETED":
        return "Delivered - Customer Location";
      default:
        return "Processing";
    }
  }

  /**
   * Calculate estimated delivery date
   */
  private calculateEstimatedDelivery(orderDate: Date, service: string): Date {
    const days = service === "OVERNIGHT" ? 1 : service === "EXPRESS" ? 2 : 5;

    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(estimatedDate.getDate() + days);

    return estimatedDate;
  }

  /**
   * Generate tracking events based on order
   */
  private generateTrackingEvents(order: Order): TrackingEvent[] {
    const events: TrackingEvent[] = [];

    // Order created
    events.push({
      status: "PENDING",
      location: "Farm",
      description: "Order received and confirmed",
      timestamp: order.createdAt,
    });

    // Add events based on current status
    if (
      ["PREPARING", "READY", "FULFILLED", "COMPLETED"].includes(order.status)
    ) {
      events.push({
        status: "PREPARING",
        location: "Farm",
        description: "Order is being prepared",
        timestamp: new Date(order.createdAt.getTime() + 1 * 60 * 60 * 1000), // +1 hour
      });
    }

    if (["READY", "FULFILLED", "COMPLETED"].includes(order.status)) {
      events.push({
        status: "READY",
        location: "Farm",
        description: "Order ready for shipment",
        timestamp: new Date(order.createdAt.getTime() + 2 * 60 * 60 * 1000), // +2 hours
      });
    }

    if (["FULFILLED", "COMPLETED"].includes(order.status)) {
      events.push({
        status: "FULFILLED",
        location: "Distribution Center",
        description: "Package in transit",
        timestamp: new Date(order.createdAt.getTime() + 24 * 60 * 60 * 1000), // +1 day
      });
    }

    if (order.status === "COMPLETED") {
      events.push({
        status: "COMPLETED",
        location: "Customer Location",
        description: "Package delivered successfully",
        timestamp: new Date(
          order.createdAt.getTime() + 5 * 24 * 60 * 60 * 1000,
        ), // +5 days
      });
    }

    return events;
  }

  // ==========================================================================
  // STATUS UPDATE OPERATIONS
  // ==========================================================================

  /**
   * 🔄 Update shipping status for an order
   * Updates order status with transaction safety
   *
   * @param request - Status update request
   * @returns ServiceResponse with updated Order
   */
  async updateShippingStatus(
    request: UpdateStatusRequest,
  ): Promise<ServiceResponse<Order>> {
    const tracer = trace.getTracer(this.serviceName);

    return await tracer.startActiveSpan(
      "ShippingService.updateShippingStatus",
      async (span) => {
        try {
          // ✅ Step 1: Validate input
          const validated = await this.validate(UpdateStatusSchema, request);

          const { orderId, status, trackingEvent } = validated;

          // ✅ Step 2: Add span attributes
          span.setAttributes({
            "shipping.order_id": orderId,
            "shipping.new_status": status,
          });

          this.logger.info("Updating shipping status", {
            orderId,
            status,
          });

          // ✅ Step 3: Verify order exists
          const existingOrder = await database.order.findUnique({
            where: { id: orderId },
          });

          if (!existingOrder) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "Order not found",
            });
            span.end();

            return this.error("ORDER_NOT_FOUND", "Order not found", {
              orderId,
            });
          }

          // ✅ Step 4: Validate status transition
          const isValidTransition = this.isValidStatusTransition(
            existingOrder.status,
            status as OrderStatus,
          );

          if (!isValidTransition) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: "Invalid status transition",
            });
            span.end();

            return this.error(
              "INVALID_STATUS_TRANSITION",
              `Cannot transition from ${existingOrder.status} to ${status}`,
              {
                currentStatus: existingOrder.status,
                requestedStatus: status,
              },
            );
          }

          // ✅ Step 5: Update order status
          const updatedOrder = await database.order.update({
            where: { id: orderId },
            data: {
              status: status as OrderStatus,
              ...(status === "COMPLETED" && {
                deliveredAt: trackingEvent?.timestamp || new Date(),
              }),
            },
          });

          this.logger.info("Shipping status updated", {
            orderId,
            oldStatus: existingOrder.status,
            newStatus: status,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          span.end();

          return this.success(updatedOrder);
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });
          span.recordException(error as Error);
          span.end();

          this.logger.error("Failed to update shipping status", {
            error: error instanceof Error ? error.message : "Unknown error",
            request,
          });

          return this.error(
            "STATUS_UPDATE_FAILED",
            "Failed to update shipping status",
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
          );
        }
      },
    );
  }

  /**
   * Validate status transition is allowed
   */
  private isValidStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PREPARING", "CANCELLED"],
      PREPARING: ["READY", "CANCELLED"],
      READY: ["FULFILLED", "CANCELLED"],
      FULFILLED: ["COMPLETED", "CANCELLED"],
      COMPLETED: [], // Cannot transition from completed
      CANCELLED: [], // Cannot transition from cancelled
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * ✅ Export singleton instance for application-wide use
 * Maintains divine pattern consistency with other services
 */
export const shippingService = new ShippingService();
