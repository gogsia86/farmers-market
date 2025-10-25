// src/lib/services/shipping.service.ts
import { database } from "@/lib/database";
import type {
  CalculateShippingInput,
  DeliverySlot,
  PickupLocation,
  ShippingCarrier,
  ShippingRateResult,
  TrackingInfo,
} from "@/types/shipping.types";
import {
  calculateShippingRate,
  estimateDeliveryDate,
  getAvailableShippingMethods,
  validateDeliveryAddress,
} from "../shipping/rate-calculator";
import {
  createShippingLabel,
  getTrackingInfo,
  parseTrackingNumber,
} from "../shipping/tracking";

export class ShippingService {
  /**
   * Calculate shipping rates for order
   */
  static async calculateRates(
    input: CalculateShippingInput
  ): Promise<ShippingRateResult[]> {
    // Validate delivery address
    const validation = await validateDeliveryAddress(
      input.farmId,
      input.deliveryZipCode
    );

    if (!validation.valid) {
      throw new Error(validation.message || "Invalid delivery address");
    }

    return await calculateShippingRate(input);
  }

  /**
   * Get all available shipping methods for order
   */
  static async getAvailableMethods(
    farmId: string,
    zipCode: string,
    orderWeight: number,
    orderValue: number
  ): Promise<ShippingRateResult[]> {
    return await getAvailableShippingMethods(
      farmId,
      zipCode,
      orderWeight,
      orderValue
    );
  }

  /**
   * Get tracking information for shipment
   */
  static async getTracking(
    trackingNumber: string,
    carrier?: ShippingCarrier
  ): Promise<TrackingInfo> {
    // Parse carrier from tracking number if not provided
    let resolvedCarrier = carrier;
    if (!resolvedCarrier) {
      const parsed = parseTrackingNumber(trackingNumber);
      if (!parsed.valid) {
        throw new Error("Invalid tracking number format");
      }
      resolvedCarrier = parsed.carrier;
    }

    return await getTrackingInfo(trackingNumber, resolvedCarrier);
  }

  /**
   * Create shipping label for order
   */
  static async createLabel(
    orderId: string,
    carrier: ShippingCarrier
  ): Promise<{ trackingNumber: string; labelUrl: string }> {
    // Get order details
    const order = await database.order.findUnique({
      where: { id: orderId },
      include: {
        farm: {
          select: {
            name: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
          },
        },
        shippingAddress: true,
        items: {
          include: {
            product: {
              select: { weight: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (!order.shippingAddress) {
      throw new Error("Shipping address not found");
    }

    // Calculate total weight
    const totalWeight = order.items.reduce(
      (sum, item) => sum + (item.product.weight || 0) * item.quantity,
      0
    );

    // Create label with carrier
    const label = await createShippingLabel(
      orderId,
      carrier,
      {
        name: order.farm.name,
        street: order.farm.address,
        city: order.farm.city,
        state: order.farm.state,
        zipCode: order.farm.zipCode,
      },
      {
        name: order.shippingAddress.fullName,
        street: order.shippingAddress.street,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        zipCode: order.shippingAddress.zipCode,
      },
      {
        weight: totalWeight,
        length: 12,
        width: 12,
        height: 6,
      }
    );

    // Update order with tracking info
    await database.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: label.trackingNumber,
        shippingCarrier: carrier,
        shippedAt: new Date(),
      },
    });

    return label;
  }

  /**
   * Get available delivery slots for farm
   */
  static async getDeliverySlots(
    farmId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DeliverySlot[]> {
    const slots = await database.deliverySlot.findMany({
      where: {
        farmId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    });

    return slots.map((slot) => ({
      id: slot.id,
      farmId: slot.farmId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxOrders: slot.maxOrders,
      currentOrders: slot.currentOrders,
      isAvailable: slot.currentOrders < slot.maxOrders,
    }));
  }

  /**
   * Get pickup locations for farm
   */
  static async getPickupLocations(farmId: string): Promise<PickupLocation[]> {
    const locations = await database.pickupLocation.findMany({
      where: { farmId, isActive: true },
      orderBy: { name: "asc" },
    });

    return locations.map((location) => ({
      id: location.id,
      farmId: location.farmId,
      name: location.name,
      address: location.address,
      city: location.city,
      state: location.state,
      zipCode: location.zipCode,
      instructions: location.instructions || undefined,
      hours: location.hours as Record<string, { open: string; close: string }>,
    }));
  }

  /**
   * Reserve delivery slot for order
   */
  static async reserveDeliverySlot(
    slotId: string,
    orderId: string
  ): Promise<DeliverySlot> {
    // Check slot availability
    const slot = await database.deliverySlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new Error("Delivery slot not found");
    }

    if (slot.currentOrders >= slot.maxOrders) {
      throw new Error("Delivery slot is full");
    }

    // Reserve slot and update order
    const [updatedSlot] = await database.$transaction([
      database.deliverySlot.update({
        where: { id: slotId },
        data: { currentOrders: { increment: 1 } },
      }),
      database.order.update({
        where: { id: orderId },
        data: {
          deliverySlotId: slotId,
          estimatedDelivery: slot.date,
        },
      }),
    ]);

    return {
      id: updatedSlot.id,
      farmId: updatedSlot.farmId,
      date: updatedSlot.date,
      startTime: updatedSlot.startTime,
      endTime: updatedSlot.endTime,
      maxOrders: updatedSlot.maxOrders,
      currentOrders: updatedSlot.currentOrders,
      isAvailable: updatedSlot.currentOrders < updatedSlot.maxOrders,
    };
  }

  /**
   * Calculate estimated delivery date
   */
  static estimateDelivery(method: string): Date {
    return estimateDeliveryDate(method as any);
  }
}
