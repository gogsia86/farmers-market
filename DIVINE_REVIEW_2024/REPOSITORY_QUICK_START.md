# 🚀 REPOSITORY LAYER QUICK START GUIDE

**Last Updated**: December 2024  
**Status**: Production Ready ✅  
**Version**: 2.0.0

---

## 📚 TABLE OF CONTENTS

1. [Quick Import](#quick-import)
2. [Available Repositories](#available-repositories)
3. [Common Patterns](#common-patterns)
4. [Code Examples](#code-examples)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## ⚡ QUICK IMPORT

### Always Use This Import Pattern:

```typescript
// ✅ CORRECT - Import from central index
import { 
  farmRepository, 
  productRepository,
  orderRepository,
  userRepository,
  type QuantumFarm,
  type QuantumProduct 
} from "@/lib/repositories";
```

```typescript
// ❌ WRONG - Never import database directly in services/controllers
import { database } from "@/lib/database"; // DON'T DO THIS
```

---

## 📦 AVAILABLE REPOSITORIES

### 1. FarmRepository (`farmRepository`)

**Purpose**: Farm management and location-based queries

**Key Methods**:
- `manifestFarm(data)` - Create new farm
- `findBySlug(slug)` - Find by URL slug
- `findByOwnerId(userId)` - Get user's farms
- `findNearLocation(lat, lng, radius)` - Location search with Haversine
- `searchFarms(term)` - Text search
- `updateStatus(id, status)` - Update farm status

**Common Use Cases**:
- Farm profile pages
- Marketplace listings
- Farmer dashboard
- Location-based search

---

### 2. ProductRepository (`productRepository`)

**Purpose**: Product catalog and inventory management

**Key Methods**:
- `manifestProduct(data)` - Create new product
- `findByFarmId(farmId)` - Get farm products
- `findOrganicProducts()` - Filter organic items
- `findBySeason()` - Seasonal products
- `searchProducts(term)` - Text search
- `updateStock(productId, quantity)` - Set inventory
- `decrementStock(productId, qty)` - Reduce inventory
- `incrementStock(productId, qty)` - Add inventory
- `getFeaturedProducts(limit)` - Featured items
- `findLowStock(threshold)` - Low inventory alert

**Common Use Cases**:
- Product listings
- Inventory management
- Search functionality
- Stock alerts

---

### 3. OrderRepository (`orderRepository`)

**Purpose**: Order lifecycle and fulfillment management

**Key Methods**:
- `manifestOrder(data)` - Create new order
- `findByOrderNumber(number)` - Public order lookup
- `findFarmOrders(farmId, filters)` - Farmer order management
- `findCustomerOrders(customerId)` - Customer order history
- `updateOrderStatus(id, status, userId, reason)` - Status transitions
- `updatePaymentStatus(id, status, details)` - Payment updates
- `addTrackingInfo(id, tracking, service)` - Shipping info
- `getOrderStatistics(farmId, dateFrom, dateTo)` - Analytics
- `findPendingOrders(farmId)` - Orders needing attention
- `findOrdersForFulfillment(farmId)` - Ready to ship

**Common Use Cases**:
- Checkout flow
- Order management dashboard
- Farmer fulfillment tools
- Customer order tracking
- Order analytics

---

### 4. UserRepository (`userRepository`)

**Purpose**: User profiles and authentication support

**Key Methods**:
- `manifestUser(data)` - Create new user (safe - no password in result)
- `findByEmail(email)` - Safe user lookup (NO PASSWORD)
- `findForAuthentication(email)` - Auth only (INCLUDES PASSWORD)
- `findByRole(role)` - Role-based queries
- `findFarmers()` - Get all farmers
- `findActiveFarmers()` - Active farmers only
- `updateProfile(userId, data)` - Update profile
- `updatePassword(userId, hashedPassword)` - Change password
- `verifyEmail(userId)` - Mark email verified
- `setResetToken(userId, token, expiry)` - Password reset
- `suspendUser(userId, adminId, reason)` - Suspend account
- `getUserStatistics()` - User analytics

**Common Use Cases**:
- Authentication flows
- User profiles
- Farmer management
- Admin user management
- Account settings

---

## 🎯 COMMON PATTERNS

### 1. Create (Manifest) Pattern

```typescript
// Create new farm
const farm = await farmRepository.manifestFarm({
  name: "Divine Acres Farm",
  slug: "divine-acres-seattle",
  ownerId: userId,
  email: "farm@example.com",
  phone: "+1234567890",
  address: "123 Farm Lane",
  city: "Seattle",
  state: "WA",
  zipCode: "98101",
  latitude: 47.6062,
  longitude: -122.3321,
  status: "PENDING"
});

console.log(`Farm created with ID: ${farm.id}`);
```

---

### 2. Find by ID Pattern

```typescript
// Find farm by ID
const farm = await farmRepository.findById(farmId);

if (!farm) {
  throw new Error("Farm not found");
}

console.log(`Found farm: ${farm.name}`);
```

---

### 3. Search/Filter Pattern

```typescript
// Search products with filters
const organicProducts = await productRepository.searchWithFilters({
  farmId: "farm_123",
  isOrganic: true,
  category: "VEGETABLES",
  inStock: true,
  minPrice: 5,
  maxPrice: 20
}, {
  take: 20,
  skip: 0,
  orderBy: { name: "asc" }
});

console.log(`Found ${organicProducts.length} products`);
```

---

### 4. Update Pattern

```typescript
// Update product inventory
const product = await productRepository.decrementStock(
  productId,
  quantityOrdered
);

console.log(`New stock: ${product.quantityAvailable}`);
```

---

### 5. Transaction Pattern

```typescript
import { database } from "@/lib/database";

// Use transaction for multi-step operations
await database.$transaction(async (tx) => {
  // Create order
  const order = await orderRepository.manifestOrder({
    customerId: userId,
    farmId: farmId,
    total: 99.99,
    // ...
  }, { tx });

  // Decrement product stock
  for (const item of orderItems) {
    await productRepository.decrementStock(
      item.productId,
      item.quantity,
      { tx }
    );
  }

  // Clear cart
  await cartRepository.clearCart(userId, { tx });
});
```

---

## 💻 CODE EXAMPLES

### Example 1: Marketplace Product Listing

```typescript
import { productRepository } from "@/lib/repositories";

export async function getMarketplaceProducts(filters: {
  category?: string;
  isOrganic?: boolean;
  farmId?: string;
}) {
  const products = await productRepository.searchWithFilters(
    {
      ...filters,
      inStock: true // Only show available products
    },
    {
      take: 50,
      orderBy: { createdAt: "desc" }
    }
  );

  return products;
}
```

---

### Example 2: Farmer Dashboard - Orders Needing Attention

```typescript
import { orderRepository } from "@/lib/repositories";

export async function getFarmerDashboardData(farmId: string) {
  // Get pending orders
  const pendingOrders = await orderRepository.findPendingOrders(farmId);

  // Get orders ready for fulfillment
  const readyToFulfill = await orderRepository.findOrdersForFulfillment(farmId);

  // Get today's scheduled orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayOrders = await orderRepository.findScheduledOrders(
    today,
    tomorrow,
    farmId
  );

  return {
    pendingOrders,
    readyToFulfill,
    todayOrders
  };
}
```

---

### Example 3: User Authentication

```typescript
import { userRepository } from "@/lib/repositories";
import bcrypt from "bcryptjs";

export async function authenticateUser(email: string, password: string) {
  // Use special auth method that includes password
  const user = await userRepository.findForAuthentication(email);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.password) {
    throw new Error("Password not set");
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  // Check account status
  if (user.status !== "ACTIVE") {
    throw new Error("Account is not active");
  }

  // Get safe user data (without password)
  const safeUser = await userRepository.findById(user.id);

  // Update last login
  await userRepository.updateLastLogin(user.id, "192.168.1.1");

  return safeUser;
}
```

---

### Example 4: Location-Based Farm Search

```typescript
import { farmRepository } from "@/lib/repositories";

export async function findNearbyFarms(
  userLat: number,
  userLng: number,
  radiusKm: number = 50
) {
  const farmsWithDistance = await farmRepository.findNearLocation(
    userLat,
    userLng,
    radiusKm
  );

  // Farms are already sorted by distance
  return farmsWithDistance.map(farm => ({
    id: farm.id,
    name: farm.name,
    slug: farm.slug,
    city: farm.city,
    state: farm.state,
    distance: farm.distance, // in kilometers
    distanceMiles: (farm.distance! * 0.621371).toFixed(1) // convert to miles
  }));
}
```

---

### Example 5: Order Analytics

```typescript
import { orderRepository } from "@/lib/repositories";

export async function getFarmOrderAnalytics(
  farmId: string,
  year: number,
  month: number
) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const stats = await orderRepository.getOrderStatistics(
    farmId,
    startDate,
    endDate
  );

  return {
    period: `${year}-${month.toString().padStart(2, '0')}`,
    totalOrders: stats.totalOrders,
    totalRevenue: stats.totalRevenue,
    averageOrderValue: stats.averageOrderValue,
    breakdown: {
      byStatus: stats.ordersByStatus,
      byFulfillment: stats.ordersByFulfillmentMethod
    }
  };
}
```

---

## ✅ BEST PRACTICES

### 1. Always Use Repositories (Never Database Directly)

```typescript
// ✅ GOOD - Use repository
const products = await productRepository.findByFarmId(farmId);

// ❌ BAD - Direct database access in service/controller
const products = await database.product.findMany({ where: { farmId } });
```

---

### 2. Use Transactions for Multi-Step Operations

```typescript
// ✅ GOOD - Transaction ensures atomicity
await database.$transaction(async (tx) => {
  const order = await orderRepository.create(orderData, { tx });
  await productRepository.decrementStock(productId, qty, { tx });
});

// ❌ BAD - No transaction = risk of inconsistency
const order = await orderRepository.create(orderData);
await productRepository.decrementStock(productId, qty);
```

---

### 3. Use Type-Safe Imports

```typescript
// ✅ GOOD - Import types
import { 
  farmRepository, 
  type QuantumFarm, 
  type FarmSearchResult 
} from "@/lib/repositories";

const farm: QuantumFarm = await farmRepository.findById(id);
```

---

### 4. Handle Null Results

```typescript
// ✅ GOOD - Check for null
const farm = await farmRepository.findById(id);

if (!farm) {
  return NextResponse.json(
    { error: "Farm not found" },
    { status: 404 }
  );
}

// Use farm safely here
```

---

### 5. Use Repository Options for Filtering

```typescript
// ✅ GOOD - Use repository options
const products = await productRepository.findByFarmId(farmId, {
  take: 20,
  skip: 0,
  orderBy: { name: "asc" }
});

// ✅ ALSO GOOD - Use search methods
const products = await productRepository.searchWithFilters(
  { farmId, inStock: true },
  { take: 20 }
);
```

---

## 🔧 TROUBLESHOOTING

### Problem: "Cannot find module '@/lib/repositories'"

**Solution**: Check your `tsconfig.json` has the path alias:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### Problem: "Property does not exist on type"

**Solution**: Make sure you're using the correct repository and type:

```typescript
// Check the actual schema field names
// Use: quantityAvailable (not stockQuantity)
// Use: inStock (not isActive)
// Use: organic (not isOrganic)
```

---

### Problem: "Decimal type errors"

**Solution**: Convert Decimal to number when needed:

```typescript
const quantity = product.quantityAvailable 
  ? Number(product.quantityAvailable) 
  : 0;
```

---

### Problem: "Transaction not working"

**Solution**: Pass `{ tx }` to all repository calls in transaction:

```typescript
await database.$transaction(async (tx) => {
  await farmRepository.update(id, data, { tx }); // Pass tx!
});
```

---

## 📖 FURTHER READING

- **BaseRepository**: `src/lib/repositories/base.repository.ts`
- **Farm Repository**: `src/lib/repositories/farm.repository.ts`
- **Product Repository**: `src/lib/repositories/product.repository.ts`
- **Order Repository**: `src/lib/repositories/order.repository.ts`
- **User Repository**: `src/lib/repositories/user.repository.ts`
- **Architecture Guide**: `.github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md`
- **Database Guide**: `.github/instructions/07_DATABASE_QUANTUM_MASTERY.instructions.md`

---

## 🎓 SUMMARY

**Remember**:
1. ✅ Always import from `@/lib/repositories`
2. ✅ Never import `database` directly in services/controllers
3. ✅ Use transactions for multi-step operations
4. ✅ Handle null results properly
5. ✅ Use repository types for type safety

**Pattern**:
```typescript
import { farmRepository, type QuantumFarm } from "@/lib/repositories";

const farm: QuantumFarm | null = await farmRepository.findById(id);

if (!farm) {
  throw new Error("Not found");
}

// Use farm safely
```

---

_Repository layer ready for production with divine agricultural consciousness._ 🌾⚡