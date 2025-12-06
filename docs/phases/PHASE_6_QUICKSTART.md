# 🚀 PHASE 6: ORDER MANAGEMENT SYSTEM - QUICK START GUIDE

**For Developers**: Get started with the Order Management System in 5 minutes.

---

## 📦 What's Included

- ✅ Complete order lifecycle management (create → fulfill → complete)
- ✅ React components (OrderCard, OrderList)
- ✅ React hooks (useOrders, useSingleOrder)
- ✅ RESTful API endpoints (/api/orders)
- ✅ Order service with business logic
- ✅ Role-based access control
- ✅ Inventory management
- ✅ Agricultural consciousness

---

## 🎯 Quick Start

### 1. Import the Components

```typescript
import { OrderList, OrderCard } from "@/features/order-management";
```

### 2. Use in Your Page

```typescript
// Customer Orders Page
export default function MyOrdersPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      <OrderList variant="customer" />
    </div>
  );
}
```

### 3. Done! 🎉

The `OrderList` component handles everything:

- ✅ Fetching orders from API
- ✅ Filtering and searching
- ✅ Pagination
- ✅ Loading states
- ✅ Empty states
- ✅ Role-based display

---

## 📖 Common Use Cases

### Use Case 1: Customer Orders Page

```typescript
"use client";

import { OrderList } from "@/features/order-management";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CustomerOrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <OrderList
      variant="customer"
      onViewDetails={(orderId) => router.push(`/orders/${orderId}`)}
      onCancel={async (orderId) => {
        if (confirm("Cancel this order?")) {
          // Handle cancellation
        }
      }}
    />
  );
}
```

### Use Case 2: Farmer Orders Dashboard

```typescript
"use client";

import { useOrders } from "@/features/order-management";
import { OrderList } from "@/features/order-management";

export default function FarmOrdersPage({ farmId }: { farmId: string }) {
  const {
    orders,
    isLoading,
    updateOrderStatus,
  } = useOrders({
    initialFilters: {
      farmId,
      status: ["CONFIRMED", "PREPARING", "READY"],
    },
  });

  const handleStatusUpdate = async (orderId: string, status: string) => {
    await updateOrderStatus(orderId, status as any);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Active Orders</h1>
      <OrderList
        orders={orders}
        isLoading={isLoading}
        variant="farmer"
        onUpdateStatus={handleStatusUpdate}
      />
    </div>
  );
}
```

### Use Case 3: Create Order from Cart

```typescript
"use client";

import { useOrders } from "@/features/order-management";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const { createOrder, isLoading } = useOrders({ autoFetch: false });
  const [cartItems, setCartItems] = useState([...]);

  const handleCheckout = async () => {
    try {
      const order = await createOrder({
        customerId: session.user.id,
        farmId: selectedFarmId,
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        fulfillmentMethod: "DELIVERY",
        deliveryAddressId: selectedAddressId,
        scheduledDate: selectedDate,
        specialInstructions: instructions,
      });

      // Redirect to order confirmation
      router.push(`/orders/${order.id}`);
    } catch (error) {
      toast.error("Failed to create order");
    }
  };

  return (
    <div>
      <h1>Checkout</h1>
      {/* Cart items display */}
      <Button onClick={handleCheckout} disabled={isLoading}>
        {isLoading ? "Processing..." : "Place Order"}
      </Button>
    </div>
  );
}
```

### Use Case 4: Order Details Page

```typescript
"use client";

import { useSingleOrder } from "@/features/order-management";
import { OrderCard } from "@/features/order-management";

export default function OrderDetailsPage({
  params
}: {
  params: { orderId: string }
}) {
  const {
    order,
    isLoading,
    cancelOrder,
  } = useSingleOrder({
    orderId: params.orderId,
    autoFetch: true,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="container mx-auto p-6">
      <OrderCard
        order={order}
        variant="customer"
        onCancel={async (orderId) => {
          await cancelOrder(session.user.id, "Customer requested");
          toast.success("Order cancelled");
        }}
      />
    </div>
  );
}
```

---

## 🎨 Component Props

### OrderList Props

```typescript
interface OrderListProps {
  orders?: OrderWithRelations[]; // Optional: provide orders directly
  isLoading?: boolean; // Loading state
  variant?: "customer" | "farmer" | "admin";
  filters?: OrderFilterOptions; // Initial filters
  pagination?: PaginationMetadata; // Pagination info
  onFilterChange?: (filters) => void; // Filter callback
  onPageChange?: (page) => void; // Page change callback
  onViewDetails?: (orderId) => void; // View details callback
  onCancel?: (orderId) => void; // Cancel callback
  onMessage?: (orderId) => void; // Message callback
  onUpdateStatus?: (orderId, status) => void;
  emptyMessage?: string; // Custom empty message
  className?: string;
}
```

### OrderCard Props

```typescript
interface OrderCardProps {
  order: OrderWithRelations; // Required: order data
  variant?: "customer" | "farmer" | "admin";
  onViewDetails?: (orderId) => void;
  onCancel?: (orderId) => void;
  onMessage?: (orderId) => void;
  onUpdateStatus?: (orderId, status) => void;
  className?: string;
}
```

---

## 🔧 Hooks API

### useOrders Hook

```typescript
const {
  // State
  orders, // OrderWithRelations[]
  isLoading, // boolean
  isError, // boolean
  error, // Error | null
  filters, // OrderFilterOptions
  pagination, // PaginationMetadata

  // Actions
  fetchOrders, // () => Promise<void>
  setFilters, // (filters: OrderFilterOptions) => void
  setPage, // (page: number) => void
  createOrder, // (request: CreateOrderRequest) => Promise<Order>
  updateOrder, // (id: string, updates: UpdateOrderRequest) => Promise<Order>
  cancelOrder, // (request: CancelOrderRequest) => Promise<Order>
  updateOrderStatus, // (id: string, status: OrderStatus) => Promise<Order>
  refreshOrders, // () => Promise<void>
} = useOrders(options);
```

**Options**:

```typescript
{
  initialFilters?: OrderFilterOptions;  // Initial filter state
  autoFetch?: boolean;                  // Auto-fetch on mount (default: true)
  refetchInterval?: number;             // Auto-refresh interval in ms
}
```

### useSingleOrder Hook

```typescript
const {
  // State
  order, // OrderWithRelations | null
  isLoading, // boolean
  isError, // boolean
  error, // Error | null

  // Actions
  fetchOrder, // () => Promise<void>
  updateOrder, // (updates: UpdateOrderRequest) => Promise<Order>
  cancelOrder, // (by: string, reason: string) => Promise<Order>
  refreshOrder, // () => Promise<void>
} = useSingleOrder(options);
```

**Options**:

```typescript
{
  orderId: string;      // Required: order ID
  autoFetch?: boolean;  // Auto-fetch on mount (default: true)
}
```

---

## 🌐 API Endpoints

### List Orders

```typescript
GET /api/orders?status=PENDING&page=1&pageSize=20

Response:
{
  success: true,
  data: {
    orders: [...],
    pagination: { page: 1, totalCount: 100, ... },
    filters: { ... }
  }
}
```

### Create Order

```typescript
POST /api/orders
Content-Type: application/json

{
  "farmId": "farm123",
  "items": [
    { "productId": "prod1", "quantity": 5 },
    { "productId": "prod2", "quantity": 3 }
  ],
  "fulfillmentMethod": "DELIVERY",
  "deliveryAddressId": "addr123",
  "scheduledDate": "2024-12-01",
  "specialInstructions": "Leave at door"
}

Response:
{
  success: true,
  data: { /* OrderWithRelations */ }
}
```

### Get Order Details

```typescript
GET /api/orders/[orderId]

Response:
{
  success: true,
  data: { /* OrderWithRelations */ }
}
```

### Update Order

```typescript
PATCH /api/orders/[orderId]
Content-Type: application/json

{
  "status": "PREPARING",
  "trackingNumber": "TRACK123"
}

Response:
{
  success: true,
  data: { /* OrderWithRelations */ }
}
```

### Cancel Order

```typescript
POST /api/orders/[orderId]/cancel
Content-Type: application/json

{
  "cancelReason": "Changed my mind"
}

Response:
{
  success: true,
  data: { /* OrderWithRelations */ }
}
```

---

## 🔐 Authorization

### Customer Role

- ✅ Create orders
- ✅ View own orders
- ✅ Cancel own orders (if PENDING/CONFIRMED)
- ❌ Cannot view other customers' orders
- ❌ Cannot update order status

### Farmer Role

- ✅ View orders for own farms
- ✅ Update order status
- ✅ Cancel orders (with reason)
- ❌ Cannot view orders for other farms
- ❌ Cannot create orders

### Admin Role

- ✅ View all orders
- ✅ Update any order
- ✅ Cancel any order
- ✅ Full access

---

## 📊 Order Status Flow

```
PENDING → CONFIRMED → PREPARING → READY → FULFILLED → COMPLETED
    ↓         ↓           ↓          ↓         ↓
    └─────────────→ CANCELLED ←──────────────┘
```

**Status Descriptions**:

- `PENDING` - Order created, awaiting confirmation
- `CONFIRMED` - Payment received, order confirmed
- `PREPARING` - Farmer is preparing the order
- `READY` - Order ready for pickup/delivery
- `FULFILLED` - Order picked up or delivered
- `COMPLETED` - Order completed successfully
- `CANCELLED` - Order cancelled (inventory restored)
- `REFUNDED` - Payment refunded to customer

---

## 💡 Pro Tips

### 1. Optimistic Updates

```typescript
const { updateOrderStatus, refreshOrders } = useOrders();

const handleQuickUpdate = async (orderId: string, status: OrderStatus) => {
  // Optimistic update in UI
  setLocalOrderStatus(orderId, status);

  try {
    await updateOrderStatus(orderId, status);
  } catch (error) {
    // Revert on error
    await refreshOrders();
  }
};
```

### 2. Real-time Filtering

```typescript
const [searchQuery, setSearchQuery] = useState("");
const { setFilters } = useOrders();

useDebounce(
  () => {
    setFilters({ searchQuery });
  },
  300,
  [searchQuery],
);
```

### 3. Bulk Operations

```typescript
const handleBulkStatusUpdate = async (
  orderIds: string[],
  status: OrderStatus,
) => {
  await Promise.all(orderIds.map((id) => updateOrderStatus(id, status)));
  toast.success(`Updated ${orderIds.length} orders`);
};
```

### 4. Export Orders

```typescript
const handleExport = async () => {
  const response = await fetch("/api/orders/export", {
    method: "POST",
    body: JSON.stringify({ filters }),
  });
  const blob = await response.blob();
  downloadFile(blob, "orders.csv");
};
```

---

## 🧪 Testing

### Component Test Example

```typescript
import { render, screen } from "@testing-library/react";
import { OrderCard } from "@/features/order-management";

describe("OrderCard", () => {
  it("renders order information", () => {
    const mockOrder = createMockOrder();
    render(<OrderCard order={mockOrder} variant="customer" />);

    expect(screen.getByText(mockOrder.orderNumber)).toBeInTheDocument();
    expect(screen.getByText(/\$\d+\.\d{2}/)).toBeInTheDocument();
  });
});
```

### Hook Test Example

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { useOrders } from "@/features/order-management";

describe("useOrders", () => {
  it("fetches orders on mount", async () => {
    const { result } = renderHook(() => useOrders({ autoFetch: true }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.orders.length).toBeGreaterThan(0);
    });
  });
});
```

---

## 🐛 Troubleshooting

### Issue: Orders not loading

**Solution**: Check authentication and role permissions

```typescript
const session = await auth();
console.log("User role:", session?.user?.role);
```

### Issue: Filter not working

**Solution**: Ensure filter values match expected types

```typescript
// ❌ Wrong
setFilters({ status: "pending" });

// ✅ Correct
setFilters({ status: "PENDING" as OrderStatus });
```

### Issue: Inventory not updating

**Solution**: Check product `trackInventory` flag

```typescript
const product = await database.product.findUnique({
  where: { id: productId },
});
console.log("Track inventory:", product.trackInventory);
```

---

## 📚 Additional Resources

- **Full Documentation**: `PHASE_6_ORDER_MANAGEMENT_COMPLETE.md`
- **Type Definitions**: `src/features/order-management/types/index.ts`
- **Service Code**: `src/features/order-management/services/order.service.ts`
- **API Routes**: `src/app/api/orders/`
- **Components**: `src/features/order-management/components/`

---

## 🎉 You're Ready!

You now have everything you need to:

- ✅ Display orders in your app
- ✅ Create new orders
- ✅ Update order status
- ✅ Cancel orders
- ✅ Filter and search
- ✅ Handle all user roles

**Happy coding!** 🌾✨

---

**Questions?** Check the full documentation or ask the team! 💬
