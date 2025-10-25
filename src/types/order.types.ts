// src/types/order.types.ts
import {
  FulfillmentMethod,
  Order,
  OrderItem,
  OrderStatus,
} from "@prisma/client";

// Complete order with all relations
export type OrderWithRelations = Order & {
  customer: {
    id: string;
    name: string;
    email: string;
  };
  farm: {
    id: string;
    name: string;
  };
  items: OrderItemWithProduct[];
  deliveryAddress?: {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
};

export type OrderItemWithProduct = OrderItem & {
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    images: string[];
  };
};

// Order creation payload
export interface CreateOrderInput {
  customerId: string;
  farmId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  fulfillmentMethod: FulfillmentMethod;
  deliveryAddressId?: string;
  scheduledDate?: Date;
  scheduledTimeSlot?: string;
  specialInstructions?: string;
}

// Order update payload
export interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
  updatedBy: string;
  notes?: string;
}

// Order totals calculation
export interface OrderTotals {
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  discount: number;
  total: number;
  farmerAmount: number;
}

// Order summary for display
export interface OrderSummary {
  id: string;
  orderNumber: string;
  farmName: string;
  itemCount: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
}
