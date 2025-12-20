# 🚀 E-commerce Components Quick Reference

**Quick copy-paste patterns for Day 10 e-commerce components**

---

## 📦 Component Imports

```typescript
// Product Comparison
import {
  ProductComparison,
  type ComparisonProduct,
} from "@/components/products/ProductComparison";

// Product Recommendations
import {
  ProductRecommendations,
  type RecommendedProduct,
  type RecommendationType,
} from "@/components/products/ProductRecommendations";

// Quick Checkout
import {
  QuickCheckout,
  type CartItem,
  type SavedAddress,
  type SavedPaymentMethod,
} from "@/components/cart/QuickCheckout";

// Order Summary Enhanced
import {
  OrderSummaryEnhanced,
  type OrderItem,
  type PromoCode,
} from "@/components/checkout/OrderSummaryEnhanced";

// Tracking Timeline
import {
  TrackingTimeline,
  type OrderStatus,
  type TimelineEvent,
} from "@/components/orders/TrackingTimeline";
```

---

## 1️⃣ ProductComparison

### Basic Usage

```tsx
<ProductComparison
  products={[product1, product2, product3]}
  onRemoveProduct={(id) => handleRemove(id)}
  onAddToCart={(id) => handleAddToCart(id)}
/>
```

### Full Configuration

```tsx
<ProductComparison
  products={comparisonProducts}
  onRemoveProduct={(productId) => removeFromComparison(productId)}
  onAddToCart={(productId) => addToCart(productId)}
  maxProducts={4}
  className="my-8"
/>
```

### Product Data Structure

```typescript
const comparisonProduct: ComparisonProduct = {
  id: "prod_123",
  name: "Organic Tomatoes",
  slug: "organic-tomatoes",
  price: 4.99,
  unit: "lb",
  category: "Vegetables",
  organic: true,
  inStock: true,
  quantityAvailable: 50,
  averageRating: 4.8,
  reviewCount: 124,
  primaryPhotoUrl: "/images/tomatoes.jpg",
  seasonalAvailability: {
    spring: true,
    summer: true,
    fall: true,
    winter: false,
  },
  growingMethod: "ORGANIC",
  soilHealthImpact: "POSITIVE",
  waterUsage: "MEDIUM",
  certifications: ["USDA Organic", "Non-GMO"],
  nutritionalInfo: {
    calories: 18,
    protein: 0.9,
    fiber: 1.2,
    vitamins: ["Vitamin C", "Vitamin K", "Potassium"],
  },
  harvestDate: "2024-01-15",
  shelfLife: 7,
  farm: {
    id: "farm_456",
    name: "Green Valley Farm",
    slug: "green-valley",
    city: "Springfield",
    state: "CA",
    verificationStatus: "VERIFIED",
  },
};
```

---

## 2️⃣ ProductRecommendations

### Basic Usage

```tsx
<ProductRecommendations
  recommendationType="SIMILAR"
  contextProductId={currentProduct.id}
/>
```

### Full Configuration

```tsx
<ProductRecommendations
  contextProductId={product.id}
  userId={user?.id}
  recommendationType="SIMILAR"
  category="Vegetables"
  maxProducts={12}
  autoScroll={true}
  showReasons={true}
  onAddToCart={(productId) => handleAddToCart(productId)}
  title="You May Also Like"
  className="my-8"
/>
```

### Recommendation Types

```typescript
type RecommendationType =
  | "SIMILAR" // Based on product characteristics
  | "COMPLEMENTARY" // Products that pair well
  | "SEASONAL" // Fresh this season
  | "POPULAR" // Customer favorites
  | "PERSONALIZED" // Based on user history
  | "FREQUENTLY_BOUGHT_TOGETHER"; // Collaborative filtering
```

### Multiple Recommendation Sections

```tsx
<>
  <ProductRecommendations
    recommendationType="SIMILAR"
    contextProductId={product.id}
    maxProducts={8}
  />

  <ProductRecommendations
    recommendationType="SEASONAL"
    category={product.category}
    maxProducts={8}
  />

  <ProductRecommendations
    recommendationType="FREQUENTLY_BOUGHT_TOGETHER"
    contextProductId={product.id}
    maxProducts={4}
  />
</>
```

---

## 3️⃣ QuickCheckout

### Basic Usage

```tsx
<QuickCheckout
  items={cartItems}
  savedAddresses={userAddresses}
  savedPaymentMethods={paymentMethods}
  deliverySlots={availableSlots}
  onCheckoutComplete={(orderId) => router.push(`/orders/${orderId}`)}
/>
```

### Full Configuration

```tsx
<QuickCheckout
  items={cartItems}
  savedAddresses={userAddresses}
  savedPaymentMethods={paymentMethods}
  deliverySlots={availableSlots}
  onCheckoutComplete={(orderId) => handleCheckoutComplete(orderId)}
  onEditCart={() => router.push("/cart")}
  enableExpressCheckout={true}
  className="max-w-6xl mx-auto"
/>
```

### Data Structures

```typescript
// Cart Item
const cartItem: CartItem = {
  id: "item_123",
  productId: "prod_456",
  productName: "Organic Tomatoes",
  productImage: "/images/tomatoes.jpg",
  farmName: "Green Valley Farm",
  price: 4.99,
  quantity: 2,
  unit: "lb",
  inStock: true,
  maxQuantity: 50,
};

// Saved Address
const address: SavedAddress = {
  id: "addr_789",
  label: "Home",
  name: "John Doe",
  streetAddress: "123 Main St",
  city: "Springfield",
  state: "CA",
  zipCode: "12345",
  isDefault: true,
};

// Saved Payment Method
const payment: SavedPaymentMethod = {
  id: "pay_abc",
  type: "CARD",
  last4: "4242",
  brand: "Visa",
  expiryMonth: 12,
  expiryYear: 2025,
  isDefault: true,
};

// Delivery Slot
const slot: DeliverySlot = {
  id: "slot_def",
  date: "2024-01-16",
  dayOfWeek: "Tuesday",
  timeWindow: "2:00 PM - 4:00 PM",
  available: true,
  fee: 5.99,
};
```

---

## 4️⃣ OrderSummaryEnhanced

### Basic Usage

```tsx
<OrderSummaryEnhanced items={orderItems} showSustainability={true} />
```

### Full Configuration

```tsx
<OrderSummaryEnhanced
  items={orderItems}
  deliveryAddress={{
    city: "Springfield",
    state: "CA",
    zipCode: "12345",
  }}
  taxRate={0.08}
  freeDeliveryThreshold={50}
  showSustainability={true}
  showDetailedBreakdown={true}
  enablePromoCodes={true}
  onPromoCodeApplied={(code) => console.log("Applied:", code)}
  className="sticky top-6"
/>
```

### Order Item Structure

```typescript
const orderItem: OrderItem = {
  id: "item_123",
  productId: "prod_456",
  productName: "Organic Tomatoes",
  productSlug: "organic-tomatoes",
  productImage: "/images/tomatoes.jpg",
  farmId: "farm_789",
  farmName: "Green Valley Farm",
  farmSlug: "green-valley",
  price: 4.99,
  quantity: 2,
  unit: "lb",
  organic: true,
  seasonal: true,
  inStock: true,
  category: "Vegetables",
  // Agricultural attributes
  carbonFootprint: 0.5, // kg CO2 per unit
  localDistance: 15, // miles
};
```

### In Checkout Flow

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Main checkout content */}
  <div className="lg:col-span-2">
    <CheckoutSteps />
  </div>

  {/* Order Summary Sidebar */}
  <div className="lg:col-span-1">
    <OrderSummaryEnhanced
      items={orderItems}
      showSustainability={true}
      enablePromoCodes={true}
      className="sticky top-6"
    />
  </div>
</div>
```

---

## 5️⃣ TrackingTimeline

### Basic Usage

```tsx
<TrackingTimeline
  orderId={order.id}
  currentStatus={order.status}
  events={timelineEvents}
/>
```

### Full Configuration

```tsx
<TrackingTimeline
  orderId={order.id}
  currentStatus="OUT_FOR_DELIVERY"
  events={timelineEvents}
  farmStatuses={farmOrderStatuses}
  driver={{
    id: "driver_123",
    name: "Mike Johnson",
    phone: "+1234567890",
    photoUrl: "/images/driver.jpg",
    vehicleInfo: "Blue Toyota Prius - ABC 123",
    rating: 4.9,
    deliveryCount: 847,
  }}
  deliveryLocation={{
    latitude: 37.7749,
    longitude: -122.4194,
    address: "Near Main St & Oak Ave",
    lastUpdated: new Date().toISOString(),
  }}
  estimatedDelivery="Tomorrow, 2-4 PM"
  deliveryAddress={{
    name: "John Doe",
    streetAddress: "123 Main St",
    city: "Springfield",
    state: "CA",
    zipCode: "12345",
  }}
  enableLiveTracking={true}
  enableNotifications={true}
  onRefresh={() => refetchOrderData()}
/>
```

### Timeline Event Structure

```typescript
const timelineEvent: TimelineEvent = {
  id: "event_123",
  status: "PREPARING",
  title: "Order Being Prepared",
  description: "Farms are harvesting and packing your fresh products",
  timestamp: "2024-01-15T10:30:00Z",
  isCompleted: true,
  isCurrent: false,
  metadata: {
    farmName: "Green Valley Farm",
    estimatedTime: "30 minutes",
    location: "Springfield, CA",
    notes: "Fresh tomatoes picked this morning",
  },
};
```

### Order Status Flow

```typescript
type OrderStatus =
  | "PENDING" // Order received, awaiting confirmation
  | "CONFIRMED" // Order confirmed by farms
  | "PREPARING" // Being harvested/packed
  | "READY_FOR_PICKUP" // Ready, waiting for driver
  | "OUT_FOR_DELIVERY" // On the way
  | "DELIVERED" // Successfully delivered
  | "CANCELLED"; // Order cancelled
```

### Farm Status Structure

```typescript
const farmStatus: FarmOrderStatus = {
  farmId: "farm_123",
  farmName: "Green Valley Farm",
  farmSlug: "green-valley",
  farmLogo: "/images/farm-logo.jpg",
  status: "PREPARING",
  itemCount: 3,
  estimatedReadyTime: "1:30 PM",
  notes: "Fresh harvest ready by afternoon",
};
```

---

## 🎨 Common Patterns

### Page Integration

```tsx
// Product Detail Page
export default function ProductPage({ product }: { product: Product }) {
  return (
    <div className="container mx-auto py-8">
      <ProductDetails product={product} />

      {/* Recommendations */}
      <ProductRecommendations
        contextProductId={product.id}
        recommendationType="SIMILAR"
        maxProducts={8}
        className="mt-12"
      />

      <ProductRecommendations
        contextProductId={product.id}
        recommendationType="FREQUENTLY_BOUGHT_TOGETHER"
        maxProducts={4}
        className="mt-12"
      />
    </div>
  );
}

// Comparison Page
export default function ComparePage({ products }: { products: Product[] }) {
  return (
    <div className="container mx-auto py-8">
      <ProductComparison
        products={products}
        onRemoveProduct={handleRemove}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

// Checkout Page
export default function CheckoutPage() {
  return (
    <div className="container mx-auto py-8">
      <QuickCheckout
        items={cartItems}
        savedAddresses={addresses}
        savedPaymentMethods={paymentMethods}
        deliverySlots={slots}
        onCheckoutComplete={(orderId) => router.push(`/orders/${orderId}`)}
      />
    </div>
  );
}

// Order Tracking Page
export default function OrderTrackingPage({ orderId }: { orderId: string }) {
  const { order, events, isLoading } = useOrder(orderId);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto py-8">
      <TrackingTimeline
        orderId={order.id}
        currentStatus={order.status}
        events={events}
        farmStatuses={order.farmStatuses}
        driver={order.driver}
        deliveryLocation={order.deliveryLocation}
        estimatedDelivery={order.estimatedDelivery}
        enableLiveTracking={true}
        onRefresh={() => refetch()}
      />
    </div>
  );
}
```

---

## 🔌 API Integration

### Recommendations API

```typescript
// GET /api/recommendations
interface RecommendationsQuery {
  productId?: string;
  userId?: string;
  category?: string;
  type: RecommendationType;
  limit?: number;
}

// Response
interface RecommendationsResponse {
  products: RecommendedProduct[];
  total: number;
}
```

### Quick Checkout API

```typescript
// POST /api/checkout/quick-order
interface QuickOrderRequest {
  items: Array<{ productId: string; quantity: number }>;
  addressId: string;
  paymentMethodId: string;
  deliverySlotId: string;
}

// Response
interface QuickOrderResponse {
  orderId: string;
  status: string;
  total: number;
}
```

### Promo Code API

```typescript
// POST /api/promo-codes/validate
interface PromoCodeRequest {
  code: string;
  orderTotal: number;
}

// Response
interface PromoCodeResponse {
  isValid: boolean;
  discountType: "PERCENTAGE" | "FIXED" | "FREE_DELIVERY";
  discountValue: number;
  description: string;
  errorMessage?: string;
}
```

### Order Tracking API

```typescript
// GET /api/orders/{orderId}/tracking
interface OrderTrackingResponse {
  orderId: string;
  currentStatus: OrderStatus;
  events: TimelineEvent[];
  farmStatuses: FarmOrderStatus[];
  driver?: DeliveryDriver;
  deliveryLocation?: DeliveryLocation;
  estimatedDelivery: string;
}
```

---

## 🎯 Best Practices

### Performance

```typescript
// Lazy load heavy components
const ProductComparison = dynamic(
  () => import("@/components/products/ProductComparison"),
  { ssr: false },
);

// Memoize expensive calculations
const sustainabilityMetrics = useMemo(
  () => calculateSustainability(items),
  [items],
);

// Debounce API calls
const debouncedFetch = useDebouncedCallback(
  (query) => fetchRecommendations(query),
  300,
);
```

### Error Handling

```typescript
// Graceful fallbacks
<ProductRecommendations
  contextProductId={product.id}
  recommendationType="SIMILAR"
  // Falls back to mock data on error
/>

// Error boundaries
<ErrorBoundary fallback={<RecommendationsError />}>
  <ProductRecommendations {...props} />
</ErrorBoundary>
```

### Accessibility

```typescript
// Always provide labels
<button
  aria-label={`Remove ${product.name} from comparison`}
  onClick={handleRemove}
>
  <X className="h-4 w-4" />
</button>

// Keyboard navigation
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "ArrowRight") navigateNext();
  if (e.key === "ArrowLeft") navigatePrevious();
};
```

---

## 🐛 Troubleshooting

### ProductComparison not showing

```typescript
// Check: Are products provided?
console.log("Products:", products.length);

// Check: Is farm data included?
console.log("First product farm:", products[0]?.farm);

// Solution: Ensure full product structure
const product = await fetchProductWithFarm(productId);
```

### ProductRecommendations loading forever

```typescript
// Check: Is API endpoint accessible?
const response = await fetch("/api/recommendations?type=SIMILAR");

// Check: Fallback to mock data
// Component automatically falls back on error

// Solution: Implement API endpoint or use mock data
```

### QuickCheckout validation errors

```typescript
// Check: Required data present?
console.log("Items:", items.length);
console.log("Address:", selectedAddress);
console.log("Payment:", selectedPayment);

// Solution: Ensure all required fields populated
if (!items.length) return <EmptyCart />;
```

### TrackingTimeline not auto-refreshing

```typescript
// Check: Is onRefresh provided?
<TrackingTimeline
  {...props}
  onRefresh={() => refetchOrderData()} // Required for auto-refresh
/>

// Check: Is order active?
// Auto-refresh only works for non-delivered/cancelled orders
```

---

## 📱 Mobile Optimization

```tsx
// Responsive grid for recommendations
<ProductRecommendations
  maxProducts={12} // Shows 1-4 columns based on screen
  className="px-4" // Mobile padding
/>

// Collapsible sections for mobile
<OrderSummaryEnhanced
  showDetailedBreakdown={true} // Auto-collapses on mobile
  className="fixed bottom-0 lg:sticky lg:top-6" // Bottom sheet on mobile
/>

// Touch-friendly targets
// All buttons are minimum 44x44px for touch accessibility
```

---

## ✅ Production Checklist

- [ ] Import statements correct
- [ ] All required props provided
- [ ] Optional props configured
- [ ] API endpoints implemented
- [ ] Error handling in place
- [ ] Loading states shown
- [ ] Mobile responsive tested
- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] Analytics events tracked

---

**Quick Reference Version**: 1.0  
**Last Updated**: December 2025  
**Status**: Production Ready ✅
