# 🔌 API Documentation

> **Complete API Reference**
>
> Comprehensive documentation for all Farmers Market Platform API endpoints, authentication, and integration patterns.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Request/Response Format](#requestresponse-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Pagination](#pagination)
- [Filtering & Sorting](#filtering--sorting)
- [Webhooks](#webhooks)
- [Code Examples](#code-examples)
- [Related Documentation](#related-documentation)

---

## 🎯 Overview

The Farmers Market Platform API is a RESTful API built with Next.js 15 API Routes, providing access to farm management, product catalogs, order processing, and agricultural intelligence features.

### API Characteristics

- **Architecture**: REST with JSON responses
- **Authentication**: NextAuth v5 (Session + JWT)
- **Rate Limiting**: 100 requests/minute per IP
- **Versioning**: URL-based (v1)
- **Format**: JSON only
- **HTTPS**: Required for all endpoints

### API Principles

```
┌──────────────────────────────────────────────────────┐
│  1. RESTful Design - Standard HTTP methods           │
│  2. Consistent Response Format - Predictable structure│
│  3. Comprehensive Errors - Clear error messages      │
│  4. Security First - Authentication on all endpoints │
│  5. Agricultural Context - Domain-aware validation   │
└──────────────────────────────────────────────────────┘
```

---

## 🌐 Base URL

```
Development:  http://localhost:3000/api
Staging:      https://staging.farmersmarket.com/api
Production:   https://farmersmarket.com/api
```

---

## 🔐 Authentication

### Authentication Methods

#### 1. Session-Based (Cookies)

```typescript
// Login via NextAuth
const response = await fetch("/api/auth/callback/credentials", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "farmer@example.com",
    password: "password123",
  }),
});

// Session cookie is automatically set
// Subsequent requests include session automatically
```

#### 2. Bearer Token (API Keys)

```typescript
// Include token in Authorization header
const response = await fetch("/api/farms", {
  headers: {
    Authorization: "Bearer your-api-token-here",
    "Content-Type": "application/json",
  },
});
```

### Getting an API Token

```bash
# POST /api/auth/token
curl -X POST https://farmersmarket.com/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

### Authorization Levels

| Role         | Permissions                                              |
| ------------ | -------------------------------------------------------- |
| **CUSTOMER** | Browse products, create orders, view own orders          |
| **FARMER**   | Manage own farms, products, view orders for own products |
| **ADMIN**    | Full access to all resources                             |

---

## 🔌 API Endpoints

### Authentication Endpoints

#### POST /api/auth/register

Register a new user account.

**Request:**

```json
{
  "email": "farmer@example.com",
  "password": "SecurePass123!",
  "name": "John Farmer",
  "role": "FARMER"
}
```

**Response: 201 Created**

```json
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "email": "farmer@example.com",
    "name": "John Farmer",
    "role": "FARMER",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### POST /api/auth/login

Authenticate and create session.

**Request:**

```json
{
  "email": "farmer@example.com",
  "password": "SecurePass123!"
}
```

**Response: 200 OK**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "farmer@example.com",
      "role": "FARMER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Farm Endpoints

#### GET /api/farms

List all active farms with pagination and filtering.

**Query Parameters:**

- `page` (number, default: 1) - Page number
- `perPage` (number, default: 20, max: 100) - Items per page
- `status` (string) - Filter by status: ACTIVE, PENDING_VERIFICATION, SUSPENDED
- `search` (string) - Search by farm name or description
- `sortBy` (string) - Sort field: name, createdAt
- `sortOrder` (string) - Sort order: asc, desc

**Example Request:**

```bash
GET /api/farms?page=1&perPage=10&status=ACTIVE&sortBy=name&sortOrder=asc
```

**Response: 200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": "farm_xyz789",
      "name": "Green Valley Farm",
      "slug": "green-valley-farm",
      "description": "Organic vegetables and fruits",
      "status": "ACTIVE",
      "location": {
        "address": "123 Farm Road",
        "city": "Seattle",
        "state": "WA",
        "zip": "98101",
        "coordinates": {
          "lat": 47.6062,
          "lng": -122.3321
        }
      },
      "owner": {
        "id": "usr_abc123",
        "name": "John Farmer",
        "email": "farmer@example.com"
      },
      "productsCount": 42,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T15:45:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 10,
      "total": 156,
      "totalPages": 16
    }
  }
}
```

#### GET /api/farms/:id

Get detailed information about a specific farm.

**Response: 200 OK**

```json
{
  "success": true,
  "data": {
    "id": "farm_xyz789",
    "name": "Green Valley Farm",
    "slug": "green-valley-farm",
    "description": "Organic vegetables and fruits since 1985",
    "status": "ACTIVE",
    "location": {
      "address": "123 Farm Road",
      "city": "Seattle",
      "state": "WA",
      "zip": "98101",
      "coordinates": {
        "lat": 47.6062,
        "lng": -122.3321
      }
    },
    "owner": {
      "id": "usr_abc123",
      "name": "John Farmer",
      "email": "farmer@example.com"
    },
    "products": [
      {
        "id": "prod_123",
        "name": "Organic Tomatoes",
        "price": 4.99,
        "unit": "lb",
        "status": "AVAILABLE"
      }
    ],
    "certifications": ["USDA Organic", "Non-GMO"],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T15:45:00Z"
  }
}
```

#### POST /api/farms

Create a new farm (requires FARMER or ADMIN role).

**Request:**

```json
{
  "name": "Sunset Organic Farm",
  "description": "Family-owned organic farm specializing in vegetables",
  "location": {
    "address": "456 Country Lane",
    "city": "Portland",
    "state": "OR",
    "zip": "97201"
  }
}
```

**Response: 201 Created**

```json
{
  "success": true,
  "data": {
    "id": "farm_new456",
    "name": "Sunset Organic Farm",
    "slug": "sunset-organic-farm",
    "status": "PENDING_VERIFICATION",
    "location": {
      "address": "456 Country Lane",
      "city": "Portland",
      "state": "OR",
      "zip": "97201"
    },
    "createdAt": "2024-01-25T14:20:00Z"
  }
}
```

#### PUT /api/farms/:id

Update farm information (requires ownership or ADMIN role).

**Request:**

```json
{
  "description": "Updated farm description",
  "location": {
    "address": "456 Updated Lane",
    "city": "Portland",
    "state": "OR",
    "zip": "97201"
  }
}
```

**Response: 200 OK**

#### DELETE /api/farms/:id

Delete a farm (requires ownership or ADMIN role).

**Response: 204 No Content**

---

### Product Endpoints

#### GET /api/products

List all available products with filtering.

**Query Parameters:**

- `page` (number) - Page number
- `perPage` (number) - Items per page
- `farmId` (string) - Filter by farm
- `category` (string) - Filter by category: VEGETABLES, FRUITS, HERBS, DAIRY, MEAT, EGGS, OTHER
- `status` (string) - Filter by status: AVAILABLE, OUT_OF_STOCK, DISCONTINUED
- `minPrice` (number) - Minimum price
- `maxPrice` (number) - Maximum price
- `search` (string) - Search by name or description

**Example Request:**

```bash
GET /api/products?category=VEGETABLES&status=AVAILABLE&minPrice=2&maxPrice=10
```

**Response: 200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": "prod_123",
      "name": "Organic Tomatoes",
      "description": "Vine-ripened organic heirloom tomatoes",
      "price": 4.99,
      "unit": "lb",
      "category": "VEGETABLES",
      "status": "AVAILABLE",
      "stockQuantity": 150,
      "farm": {
        "id": "farm_xyz789",
        "name": "Green Valley Farm",
        "slug": "green-valley-farm"
      },
      "images": ["https://storage.farmersmarket.com/products/tomatoes-1.jpg"],
      "createdAt": "2024-01-20T09:15:00Z",
      "updatedAt": "2024-01-25T11:30:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 89,
      "totalPages": 5
    }
  }
}
```

#### POST /api/products

Create a new product (requires FARMER or ADMIN role).

**Request:**

```json
{
  "name": "Fresh Strawberries",
  "description": "Sweet, juicy organic strawberries",
  "price": 6.99,
  "unit": "pint",
  "category": "FRUITS",
  "stockQuantity": 100,
  "farmId": "farm_xyz789"
}
```

**Response: 201 Created**

---

### Order Endpoints

#### GET /api/orders

List orders (customers see own orders, farmers see orders for their products).

**Response: 200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": "order_789",
      "orderNumber": "ORD-20240125-001",
      "status": "CONFIRMED",
      "totalAmount": 42.5,
      "customer": {
        "id": "usr_customer1",
        "name": "Jane Customer",
        "email": "customer@example.com"
      },
      "items": [
        {
          "id": "item_1",
          "quantity": 3,
          "price": 4.99,
          "product": {
            "id": "prod_123",
            "name": "Organic Tomatoes",
            "unit": "lb"
          }
        }
      ],
      "createdAt": "2024-01-25T10:00:00Z",
      "updatedAt": "2024-01-25T10:05:00Z"
    }
  ]
}
```

#### POST /api/orders

Create a new order.

**Request:**

```json
{
  "items": [
    {
      "productId": "prod_123",
      "quantity": 3
    },
    {
      "productId": "prod_456",
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "street": "789 Main St",
    "city": "Seattle",
    "state": "WA",
    "zip": "98101"
  },
  "deliveryDate": "2024-01-27T10:00:00Z"
}
```

**Response: 201 Created**

```json
{
  "success": true,
  "data": {
    "id": "order_new123",
    "orderNumber": "ORD-20240125-002",
    "status": "PENDING",
    "totalAmount": 42.5,
    "items": [
      {
        "productId": "prod_123",
        "quantity": 3,
        "price": 4.99
      }
    ],
    "createdAt": "2024-01-25T11:00:00Z"
  }
}
```

#### PUT /api/orders/:id

Update order status (farmers can update to CONFIRMED, PROCESSING, READY_FOR_PICKUP, COMPLETED).

**Request:**

```json
{
  "status": "CONFIRMED"
}
```

**Response: 200 OK**

---

## 📦 Request/Response Format

### Standard Response Structure

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
    };
    requestId?: string;
    timestamp?: string;
  };
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-25T10:30:00Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Email format is invalid"
    }
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-25T10:30:00Z"
  }
}
```

---

## ❌ Error Handling

### Error Codes

| Code                  | HTTP Status | Description                     |
| --------------------- | ----------- | ------------------------------- |
| `VALIDATION_ERROR`    | 400         | Invalid request data            |
| `UNAUTHORIZED`        | 401         | Authentication required         |
| `FORBIDDEN`           | 403         | Insufficient permissions        |
| `NOT_FOUND`           | 404         | Resource not found              |
| `CONFLICT`            | 409         | Resource conflict (duplicate)   |
| `RATE_LIMIT_EXCEEDED` | 429         | Too many requests               |
| `INTERNAL_ERROR`      | 500         | Server error                    |
| `SERVICE_UNAVAILABLE` | 503         | Service temporarily unavailable |

### Error Response Examples

#### Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Farm name must be at least 3 characters",
    "details": {
      "field": "name",
      "value": "AB",
      "constraint": "minLength: 3"
    }
  }
}
```

#### Authentication Error

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required. Please provide valid credentials."
  }
}
```

#### Authorization Error

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to perform this action",
    "details": {
      "requiredRole": "FARMER",
      "currentRole": "CUSTOMER"
    }
  }
}
```

---

## 🔢 Rate Limiting

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706184600
```

### Rate Limits by Endpoint

| Endpoint                    | Limit        | Window   |
| --------------------------- | ------------ | -------- |
| Authentication              | 5 requests   | 1 minute |
| Read Operations (GET)       | 100 requests | 1 minute |
| Write Operations (POST/PUT) | 50 requests  | 1 minute |
| Bulk Operations             | 10 requests  | 1 minute |

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 60 seconds.",
    "details": {
      "retryAfter": 60
    }
  }
}
```

---

## 📄 Pagination

### Query Parameters

```
GET /api/farms?page=2&perPage=20
```

- `page` - Page number (1-indexed, default: 1)
- `perPage` - Items per page (default: 20, max: 100)

### Pagination Metadata

```json
{
  "success": true,
  "data": [
    /* items */
  ],
  "meta": {
    "pagination": {
      "page": 2,
      "perPage": 20,
      "total": 156,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPreviousPage": true
    }
  }
}
```

### Cursor-Based Pagination (Alternative)

```
GET /api/products?cursor=prod_123&limit=20
```

---

## 🔍 Filtering & Sorting

### Filtering

```bash
# Single filter
GET /api/products?category=VEGETABLES

# Multiple filters
GET /api/products?category=VEGETABLES&status=AVAILABLE&minPrice=2

# Search
GET /api/farms?search=organic
```

### Sorting

```bash
# Sort by field
GET /api/farms?sortBy=name&sortOrder=asc

# Multiple sort fields
GET /api/products?sortBy=price,name&sortOrder=asc,desc
```

### Advanced Filtering

```bash
# Range filters
GET /api/products?minPrice=5&maxPrice=20&minStock=10

# Date range
GET /api/orders?createdAfter=2024-01-01&createdBefore=2024-01-31

# Array filters
GET /api/products?categories=VEGETABLES,FRUITS
```

---

## 🔔 Webhooks

### Webhook Events

| Event                  | Trigger                |
| ---------------------- | ---------------------- |
| `farm.created`         | New farm created       |
| `farm.verified`        | Farm verified by admin |
| `product.created`      | New product added      |
| `product.out_of_stock` | Product stock depleted |
| `order.created`        | New order placed       |
| `order.completed`      | Order completed        |

### Webhook Payload

```json
{
  "event": "order.created",
  "timestamp": "2024-01-25T10:30:00Z",
  "data": {
    "orderId": "order_789",
    "customerId": "usr_customer1",
    "totalAmount": 42.5,
    "items": [
      /* order items */
    ]
  }
}
```

### Webhook Configuration

```bash
POST /api/webhooks
{
  "url": "https://your-server.com/webhooks/farmers-market",
  "events": ["order.created", "order.completed"],
  "secret": "your-webhook-secret"
}
```

---

## 💻 Code Examples

### JavaScript/TypeScript

```typescript
// Fetch farms with axios
import axios from "axios";

const api = axios.create({
  baseURL: "https://farmersmarket.com/api",
  headers: {
    Authorization: "Bearer your-token",
    "Content-Type": "application/json",
  },
});

// Get farms
const farms = await api.get("/farms", {
  params: { status: "ACTIVE", page: 1, perPage: 10 },
});

// Create product
const product = await api.post("/products", {
  name: "Fresh Tomatoes",
  price: 4.99,
  unit: "lb",
  category: "VEGETABLES",
  farmId: "farm_123",
});

// Handle errors
try {
  const order = await api.post("/orders", orderData);
  console.log("Order created:", order.data);
} catch (error) {
  if (error.response) {
    console.error("Error:", error.response.data.error);
  }
}
```

### Python

```python
import requests

BASE_URL = "https://farmersmarket.com/api"
headers = {
    "Authorization": "Bearer your-token",
    "Content-Type": "application/json"
}

# Get farms
response = requests.get(
    f"{BASE_URL}/farms",
    headers=headers,
    params={"status": "ACTIVE", "page": 1}
)
farms = response.json()

# Create product
product_data = {
    "name": "Fresh Tomatoes",
    "price": 4.99,
    "unit": "lb",
    "category": "VEGETABLES",
    "farmId": "farm_123"
}
response = requests.post(
    f"{BASE_URL}/products",
    headers=headers,
    json=product_data
)
product = response.json()
```

### cURL

```bash
# Get farms
curl -X GET "https://farmersmarket.com/api/farms?status=ACTIVE" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json"

# Create product
curl -X POST "https://farmersmarket.com/api/products" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fresh Tomatoes",
    "price": 4.99,
    "unit": "lb",
    "category": "VEGETABLES",
    "farmId": "farm_123"
  }'
```

---

## 📚 Related Documentation

### API Documentation Files

- **[API Routes Documentation](./API_ROUTES_DOCUMENTATION.md)** - Detailed route specs
- **[Performance Guide](./PERFORMANCE_GUIDE.md)** - API optimization
- **[OpenAPI Spec](./openapi.yaml)** - OpenAPI 3.0 specification
- **[Migration Guide](./migration-guide.md)** - API version migration

### Related Guides

- **[Getting Started](../getting-started/README.md)** - Setup and onboarding
- **[Architecture](../architecture/README.md)** - System architecture
- **[Testing](../testing/README.md)** - API testing strategies
- **[Authentication Guide](../guides/authentication.md)** - Auth implementation

---

## 🛠️ Testing the API

### Using Postman

1. Import OpenAPI spec from `openapi.yaml`
2. Set environment variables (BASE_URL, TOKEN)
3. Run collection tests

### Using Swagger UI

```bash
# Start dev server
pnpm dev

# Open Swagger UI
open http://localhost:3000/api-docs
```

### Testing with Jest

```typescript
import { GET, POST } from "@/app/api/farms/route";

describe("Farms API", () => {
  it("should list farms", async () => {
    const request = new Request("http://localhost:3000/api/farms");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
```

---

## 📞 Support

### API Support

- **Email**: api-support@farmersmarket.com
- **Documentation**: https://farmersmarket.com/docs
- **Status Page**: https://status.farmersmarket.com
- **GitHub Issues**: https://github.com/your-org/farmers-market/issues

### SLA & Uptime

- **Uptime Target**: 99.9%
- **Response Time**: < 200ms (p95)
- **Support Hours**: 24/7
- **Maintenance Windows**: Sundays 2-4 AM PST

---

**Last Updated**: December 2024  
**API Version**: v1  
**Maintained By**: API Team  
**Status**: ✅ Production Ready

**Quick Navigation**:

- [← Back to Documentation Hub](../README.md)
- [→ Getting Started](../getting-started/README.md)
- [→ Architecture Guide](../architecture/README.md)
- [→ Testing Guide](../testing/README.md)
