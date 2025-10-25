// src/types/shipping.types.ts

/**
 * Delivery method options
 */
export type DeliveryMethod =
  | "STANDARD"
  | "EXPRESS"
  | "LOCAL_PICKUP"
  | "FARM_PICKUP";

/**
 * Shipping carrier options
 */
export type ShippingCarrier = "USPS" | "UPS" | "FEDEX" | "LOCAL" | "FARM";

/**
 * Tracking status
 */
export type TrackingStatus =
  | "PENDING"
  | "LABEL_CREATED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED"
  | "RETURNED";

/**
 * Delivery zone for calculating shipping rates
 */
export interface DeliveryZone {
  id: string;
  farmId: string;
  name: string;
  zipCodes: string[];
  radiusMiles: number;
  baseRate: number;
  perMileRate: number;
  freeShippingThreshold: number;
}

/**
 * Shipping rate calculation input
 */
export interface CalculateShippingInput {
  farmId: string;
  deliveryZipCode: string;
  orderWeight: number; // in pounds
  orderValue: number;
  deliveryMethod: DeliveryMethod;
}

/**
 * Shipping rate calculation result
 */
export interface ShippingRateResult {
  method: DeliveryMethod;
  carrier: ShippingCarrier;
  rate: number;
  estimatedDays: number;
  isFree: boolean;
  reason?: string;
}

/**
 * Tracking information
 */
export interface TrackingInfo {
  trackingNumber: string;
  carrier: ShippingCarrier;
  status: TrackingStatus;
  currentLocation?: string;
  estimatedDelivery?: Date;
  events: TrackingEvent[];
}

/**
 * Tracking event
 */
export interface TrackingEvent {
  timestamp: Date;
  status: TrackingStatus;
  location: string;
  description: string;
}

/**
 * Delivery schedule slot
 */
export interface DeliverySlot {
  id: string;
  farmId: string;
  date: Date;
  startTime: string;
  endTime: string;
  maxOrders: number;
  currentOrders: number;
  isAvailable: boolean;
}

/**
 * Pickup location
 */
export interface PickupLocation {
  id: string;
  farmId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  instructions?: string;
  hours: {
    [key: string]: { open: string; close: string };
  };
}

/**
 * Shipping label data
 */
export interface ShippingLabel {
  orderId: string;
  trackingNumber: string;
  carrier: ShippingCarrier;
  labelUrl: string;
  createdAt: Date;
}

/**
 * Distance calculation result
 */
export interface DistanceResult {
  distanceMiles: number;
  durationMinutes: number;
  origin: string;
  destination: string;
}
