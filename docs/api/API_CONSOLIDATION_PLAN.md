# 🔄 API Route Consolidation Plan

**Created:** December 2024  
**Status:** 🚧 In Progress  
**Goal:** Consolidate redundant API routes into clean, RESTful structure

---

## 📊 Current API Structure Analysis

### Redundant/Overlapping Routes

#### Farm-Related Routes (CONSOLIDATE)

```
❌ /api/farmer        - Individual farmer operations
❌ /api/farmers       - Multiple farmers
❌ /api/farming       - Farming operations
✅ /api/farms         - KEEP THIS (main farms endpoint)
```

**Decision:** Merge all into `/api/farms` with proper sub-routes

#### Agricultural Routes (SIMPLIFY)

```
❌ /api/agricultural              - Generic agricultural data
❌ /api/agricultural-consciousness - Divine patterns (internal only)
```

**Decision:** Move to `/api/farms/analytics` or remove if unused

---

## 🎯 Target API Structure (RESTful)

### Core Resources

```
/api/
├── auth/                           # Authentication & Authorization
│   ├── [...nextauth]/             # NextAuth.js handlers
│   ├── register/                  # POST - User registration
│   ├── verify-email/              # POST - Email verification
│   ├── reset-password/            # POST - Password reset
│   └── refresh/                   # POST - Token refresh
│
├── farms/                          # Farm Management (CONSOLIDATED)
│   ├── GET    /                   # List all farms (with filters)
│   ├── POST   /                   # Create new farm
│   ├── GET    /my                 # Current user's farms
│   ├── GET    /featured           # Featured farms
│   ├── GET    /[id]               # Get farm by ID
│   ├── PUT    /[id]               # Update farm
│   ├── DELETE /[id]               # Delete farm
│   ├── GET    /[id]/products      # Farm's products
│   ├── GET    /[id]/orders        # Farm's orders
│   ├── GET    /[id]/analytics     # Farm analytics
│   ├── GET    /[id]/reviews       # Farm reviews
│   └── POST   /[id]/verify        # Verify farm (admin)
│
├── products/                       # Product Management
│   ├── GET    /                   # List products (with filters)
│   ├── POST   /                   # Create product
│   ├── GET    /my                 # Current user's products
│   ├── GET    /featured           # Featured products
│   ├── GET    /search             # Advanced search
│   ├── GET    /[id]               # Get product by ID
│   ├── PUT    /[id]               # Update product
│   ├── DELETE /[id]               # Delete product
│   ├── GET    /[id]/reviews       # Product reviews
│   └── POST   /[id]/reviews       # Add review
│
├── orders/                         # Order Management
│   ├── GET    /                   # List orders (role-based)
│   ├── POST   /                   # Create order
│   ├── GET    /my                 # Current user's orders
│   ├── GET    /[id]               # Get order details
│   ├── PUT    /[id]               # Update order
│   ├── POST   /[id]/cancel        # Cancel order
│   ├── POST   /[id]/refund        # Refund order
│   ├── PUT    /[id]/status        # Update status
│   └── GET    /[id]/tracking      # Tracking info
│
├── users/                          # User Management
│   ├── GET    /                   # List users (admin only)
│   ├── GET    /me                 # Current user
│   ├── PUT    /me                 # Update current user
│   ├── GET    /[id]               # Get user by ID
│   ├── PUT    /[id]               # Update user (admin)
│   ├── DELETE /[id]               # Delete user (admin)
│   └── GET    /[id]/activity      # User activity
│
├── payments/                       # Payment Processing
│   ├── POST   /create-intent      # Create payment intent
│   ├── POST   /confirm            # Confirm payment
│   ├── POST   /refund             # Process refund
│   ├── GET    /methods            # Payment methods
│   └── webhooks/                  # Stripe webhooks
│       └── POST /stripe           # Stripe webhook handler
│
├── reviews/                        # Reviews & Ratings
│   ├── GET    /                   # List reviews
│   ├── POST   /                   # Create review
│   ├── GET    /[id]               # Get review
│   ├── PUT    /[id]               # Update review
│   ├── DELETE /[id]               # Delete review
│   └── POST   /[id]/report        # Report review
│
├── notifications/                  # Notifications
│   ├── GET    /                   # List notifications
│   ├── PUT    /[id]/read          # Mark as read
│   ├── PUT    /read-all           # Mark all as read
│   ├── DELETE /[id]               # Delete notification
│   └── stream/                    # SSE stream
│
├── search/                         # Global Search
│   ├── GET    /                   # Search everything
│   ├── GET    /farms              # Search farms
│   ├── GET    /products           # Search products
│   └── GET    /autocomplete       # Search suggestions
│
├── analytics/                      # Platform Analytics
│   ├── GET    /platform           # Platform stats
│   ├── GET    /farm/[id]          # Farm analytics
│   └── GET    /user/[id]          # User analytics
│
├── admin/                          # Admin Operations
│   ├── GET    /dashboard          # Admin dashboard data
│   ├── GET    /stats              # Platform statistics
│   ├── farms/
│   │   ├── GET    /               # All farms (admin view)
│   │   ├── POST   /[id]/verify   # Verify farm
│   │   └── POST   /[id]/suspend  # Suspend farm
│   ├── users/
│   │   ├── GET    /               # All users
│   │   ├── PUT    /[id]/role     # Update user role
│   │   └── POST   /[id]/suspend  # Suspend user
│   └── system/
│       ├── GET    /health         # System health
│       ├── GET    /logs           # System logs
│       └── POST   /maintenance    # Maintenance mode
│
├── upload/                         # File Upload
│   ├── POST   /image              # Upload image
│   ├── POST   /document           # Upload document
│   └── DELETE /[id]               # Delete file
│
├── marketplace/                    # Marketplace Features
│   ├── GET    /featured           # Featured items
│   ├── GET    /trending           # Trending products
│   ├── GET    /nearby             # Nearby farms
│   └── GET    /categories         # Browse by category
│
├── health/                         # System Health
│   ├── GET    /                   # Basic health check
│   ├── GET    /database           # Database health
│   └── GET    /services           # External services
│
├── support/                        # Customer Support
│   ├── POST   /ticket             # Create support ticket
│   ├── GET    /tickets            # List tickets
│   └── GET    /tickets/[id]       # Get ticket
│
└── webhooks/                       # External Webhooks
    ├── POST   /stripe             # Stripe events
    └── POST   /sendgrid           # SendGrid events
```

---

## 🔄 Migration Strategy

### Phase 1: Analysis & Documentation (Week 1)

- [x] Audit current API routes
- [x] Document route usage
- [x] Identify redundancies
- [x] Create consolidation plan
- [ ] Review with team

### Phase 2: Create New Consolidated Routes (Week 2)

- [ ] Create `/api/farms` consolidated endpoint
- [ ] Add proper sub-routes
- [ ] Implement request validation
- [ ] Add comprehensive error handling
- [ ] Write tests for new routes

### Phase 3: Update Client Code (Week 2-3)

- [ ] Update frontend API calls
- [ ] Update service layer
- [ ] Update types/interfaces
- [ ] Test all user flows

### Phase 4: Deprecate Old Routes (Week 3)

- [ ] Add deprecation warnings to old routes
- [ ] Log usage of deprecated routes
- [ ] Monitor for remaining usage
- [ ] Update documentation

### Phase 5: Remove Old Routes (Week 4)

- [ ] Remove deprecated routes
- [ ] Final testing
- [ ] Update API documentation
- [ ] Deploy to production

---

## 📝 Detailed Consolidation: Farms

### Current Structure

```
/api/farmer/              # Individual farmer CRUD
/api/farmers/             # List/search farmers
/api/farming/             # Farming operations
/api/farms/               # Farm entities
```

### New Consolidated Structure

```typescript
// GET /api/farms - List all farms
interface GetFarmsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: "PENDING" | "VERIFIED" | "SUSPENDED";
  location?: string;
  radius?: number; // miles
  category?: string;
  organic?: boolean;
  sort?: "name" | "rating" | "distance" | "created";
}

// POST /api/farms - Create new farm
interface CreateFarmBody {
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  };
  certifications?: string[];
  images?: string[];
}

// GET /api/farms/my - Current user's farms
// Returns farms owned by authenticated user

// GET /api/farms/[id] - Get specific farm
// Returns full farm details including products, reviews, etc.

// PUT /api/farms/[id] - Update farm
interface UpdateFarmBody {
  name?: string;
  description?: string;
  location?: Location;
  certifications?: string[];
  images?: string[];
  operatingHours?: OperatingHours;
}

// DELETE /api/farms/[id] - Delete farm
// Soft delete (sets status to 'DELETED')

// GET /api/farms/[id]/products - Get farm's products
interface GetFarmProductsQuery {
  page?: number;
  limit?: number;
  category?: string;
  inStock?: boolean;
}

// GET /api/farms/[id]/orders - Get farm's orders
// Only accessible by farm owner or admin
interface GetFarmOrdersQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
}

// GET /api/farms/[id]/analytics - Farm analytics
// Returns sales, views, revenue, etc.

// GET /api/farms/[id]/reviews - Farm reviews
interface GetFarmReviewsQuery {
  page?: number;
  limit?: number;
  sort?: "recent" | "rating";
}

// POST /api/farms/[id]/verify - Verify farm (admin only)
// Changes status from PENDING to VERIFIED
```

---

## 🔧 Implementation Template

### Example: Consolidated Farms Route

**File:** `src/app/api/farms/route.ts`

```typescript
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const GetFarmsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["PENDING", "VERIFIED", "SUSPENDED"]).optional(),
  location: z.string().optional(),
  radius: z.coerce.number().min(1).max(100).optional(),
  organic: z.coerce.boolean().optional(),
  sort: z.enum(["name", "rating", "distance", "created"]).default("name"),
});

// GET /api/farms - List all farms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = GetFarmsSchema.parse(Object.fromEntries(searchParams));

    const where: any = {};

    // Apply filters
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    } else {
      where.status = "VERIFIED"; // Default to verified only
    }

    if (query.organic !== undefined) {
      where.certifications = {
        has: "ORGANIC",
      };
    }

    // Pagination
    const skip = (query.page - 1) * query.limit;

    const [farms, total] = await Promise.all([
      database.farm.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: {
          [query.sort === "created" ? "createdAt" : query.sort]: "desc",
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              products: true,
              reviews: true,
            },
          },
        },
      }),
      database.farm.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: farms,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error("Error fetching farms:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FARMS_FETCH_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch farms",
        },
      },
      { status: 500 },
    );
  }
}

// POST /api/farms - Create new farm
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validate input (add proper Zod schema)
    const farm = await database.farm.create({
      data: {
        ...body,
        ownerId: session.user.id,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      data: farm,
    });
  } catch (error) {
    console.error("Error creating farm:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FARM_CREATE_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to create farm",
        },
      },
      { status: 500 },
    );
  }
}
```

---

## 📋 Migration Checklist

### Farm Routes

- [ ] Create `/api/farms/route.ts` (GET, POST)
- [ ] Create `/api/farms/my/route.ts`
- [ ] Create `/api/farms/[id]/route.ts` (GET, PUT, DELETE)
- [ ] Create `/api/farms/[id]/products/route.ts`
- [ ] Create `/api/farms/[id]/orders/route.ts`
- [ ] Create `/api/farms/[id]/analytics/route.ts`
- [ ] Create `/api/farms/[id]/reviews/route.ts`
- [ ] Create `/api/farms/[id]/verify/route.ts`
- [ ] Update frontend to use new endpoints
- [ ] Test all farm operations
- [ ] Remove old routes: `/api/farmer`, `/api/farmers`, `/api/farming`

### Product Routes

- [ ] Ensure `/api/products/route.ts` follows pattern
- [ ] Add missing sub-routes
- [ ] Standardize response format

### Order Routes

- [ ] Ensure `/api/orders/route.ts` follows pattern
- [ ] Add missing sub-routes
- [ ] Standardize response format

### User Routes

- [ ] Ensure `/api/users/route.ts` follows pattern
- [ ] Add `/api/users/me` endpoint
- [ ] Standardize response format

---

## 🎯 Success Criteria

- ✅ All API routes follow RESTful conventions
- ✅ No redundant or duplicate endpoints
- ✅ Clear, predictable URL structure
- ✅ Consistent response formats
- ✅ Comprehensive error handling
- ✅ Input validation on all routes
- ✅ Proper authentication/authorization
- ✅ API documentation updated
- ✅ All tests passing
- ✅ Zero breaking changes for frontend

---

## 📊 Expected Benefits

### Developer Experience

- **Before:** Confusion about which endpoint to use
- **After:** Clear, predictable route structure

### API Maintenance

- **Before:** 26 top-level API folders
- **After:** 15 well-organized resource endpoints

### Documentation

- **Before:** Scattered, inconsistent
- **After:** Clear OpenAPI/Swagger docs

### Performance

- **Before:** Multiple similar queries
- **After:** Optimized, consolidated queries

---

## 🚀 Next Steps

1. **Review this plan** with development team
2. **Prioritize routes** to consolidate first
3. **Begin Phase 2** - Create new consolidated routes
4. **Update frontend** incrementally
5. **Deploy with deprecation warnings**
6. **Monitor usage** and remove old routes

---

**Status:** 📋 Ready for Implementation  
**Priority:** HIGH  
**Effort:** Medium (2-3 weeks)  
**Impact:** HIGH (Better DX, maintainability, performance)

---

_"From chaos to clarity through RESTful design."_ 🌾✨
