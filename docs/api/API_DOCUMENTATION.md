# 🌾 FARMERS MARKET PLATFORM - API DOCUMENTATION
## Complete REST API Reference - v1.0.0

**Base URL:** `https://api.farmersmarket.com` (Production)  
**Base URL:** `http://localhost:3001` (Development)  
**API Version:** 1.0.0  
**Last Updated:** December 2024  
**Authentication:** Bearer Token (JWT)

---

## 📋 TABLE OF CONTENTS

1. [Authentication](#authentication)
2. [Farms API](#farms-api)
3. [Products API](#products-api)
4. [Orders API](#orders-api)
5. [Users API](#users-api)
6. [Admin API](#admin-api)
7. [Search API](#search-api)
8. [Analytics API](#analytics-api)
9. [Notifications API](#notifications-api)
10. [Resources API](#resources-api)
11. [Upload API](#upload-api)
12. [Error Codes](#error-codes)
13. [Rate Limiting](#rate-limiting)
14. [Webhooks](#webhooks)

---

## 🔐 AUTHENTICATION

### Authentication Flow

All authenticated endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### POST /api/auth/login

User login endpoint.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "CONSUMER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 2592000
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

### POST /api/auth/register

User registration endpoint.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "name": "Jane Smith",
  "role": "CONSUMER"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_124",
      "email": "newuser@example.com",
      "name": "Jane Smith",
      "role": "CONSUMER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 2592000
  }
}
```

### POST /api/auth/logout

Logout current user.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

---

## 🌾 FARMS API

### GET /api/farms

Get all farms with pagination and filtering.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `status` (string) - Filter by status: ACTIVE, PENDING, SUSPENDED
- `verified` (boolean) - Filter by verification status
- `search` (string) - Search by name or location

**Request:**
```http
GET /api/farms?page=1&limit=20&status=ACTIVE&verified=true
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "farms": [
      {
        "id": "farm_001",
        "name": "Green Valley Farm",
        "slug": "green-valley-farm",
        "description": "Organic vegetables and fruits",
        "location": {
          "address": "123 Farm Road",
          "city": "Springfield",
          "state": "CA",
          "zipCode": "12345",
          "coordinates": {
            "lat": 37.7749,
            "lng": -122.4194
          }
        },
        "owner": {
          "id": "user_001",
          "name": "John Farmer"
        },
        "status": "ACTIVE",
        "verificationStatus": "VERIFIED",
        "certifications": ["ORGANIC", "REGENERATIVE"],
        "logoUrl": "https://cdn.example.com/farms/farm_001.jpg",
        "rating": 4.8,
        "reviewCount": 156,
        "productCount": 42,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-12-01T14:22:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### GET /api/farms/:slug

Get farm details by slug.

**Request:**
```http
GET /api/farms/green-valley-farm
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "farm_001",
    "name": "Green Valley Farm",
    "slug": "green-valley-farm",
    "description": "Organic vegetables and fruits grown with biodynamic practices",
    "location": {
      "address": "123 Farm Road",
      "city": "Springfield",
      "state": "CA",
      "zipCode": "12345",
      "coordinates": {
        "lat": 37.7749,
        "lng": -122.4194
      }
    },
    "owner": {
      "id": "user_001",
      "name": "John Farmer",
      "email": "john@greenvalley.com"
    },
    "status": "ACTIVE",
    "verificationStatus": "VERIFIED",
    "certifications": [
      {
        "type": "ORGANIC",
        "certifiedBy": "USDA",
        "certificationNumber": "ORG-12345",
        "expiresAt": "2025-12-31T23:59:59Z"
      }
    ],
    "socialMedia": {
      "facebook": "https://facebook.com/greenvalleyfarm",
      "instagram": "https://instagram.com/greenvalleyfarm"
    },
    "logoUrl": "https://cdn.example.com/farms/farm_001.jpg",
    "bannerUrl": "https://cdn.example.com/farms/farm_001_banner.jpg",
    "photos": [
      "https://cdn.example.com/farms/farm_001_photo1.jpg"
    ],
    "rating": 4.8,
    "reviewCount": 156,
    "productCount": 42,
    "products": [
      {
        "id": "prod_001",
        "name": "Organic Tomatoes",
        "price": 4.99,
        "unit": "lb",
        "inStock": true
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-12-01T14:22:00Z"
  }
}
```

### POST /api/farms

Create a new farm (FARMER role required).

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Sunny Acres Farm",
  "description": "Family-owned organic farm",
  "location": {
    "address": "456 Country Lane",
    "city": "Riverside",
    "state": "CA",
    "zipCode": "92501",
    "coordinates": {
      "lat": 33.9533,
      "lng": -117.3962
    }
  },
  "socialMedia": {
    "facebook": "https://facebook.com/sunnyacres",
    "instagram": "https://instagram.com/sunnyacres"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "farm_002",
    "name": "Sunny Acres Farm",
    "slug": "sunny-acres-farm",
    "status": "PENDING",
    "verificationStatus": "PENDING",
    "message": "Farm created successfully. Awaiting admin verification."
  }
}
```

### PATCH /api/farms/:id

Update farm details (Owner or Admin only).

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "description": "Updated description",
  "socialMedia": {
    "facebook": "https://facebook.com/newfacebook"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "farm_002",
    "name": "Sunny Acres Farm",
    "description": "Updated description",
    "updatedAt": "2024-12-15T10:30:00Z"
  }
}
```

### DELETE /api/farms/:id

Delete farm (Owner or Admin only).

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Farm deleted successfully"
}
```

---

## 🛒 PRODUCTS API

### GET /api/products

Get all products with filtering.

**Query Parameters:**
- `page` (number) - Page number
- `limit` (number) - Items per page
- `farmId` (string) - Filter by farm
- `category` (string) - Filter by category
- `inStock` (boolean) - Filter by stock status
- `minPrice` (number) - Minimum price
- `maxPrice` (number) - Maximum price
- `search` (string) - Search query

**Request:**
```http
GET /api/products?category=VEGETABLES&inStock=true&page=1&limit=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_001",
        "name": "Organic Tomatoes",
        "slug": "organic-tomatoes-green-valley",
        "description": "Fresh organic tomatoes",
        "category": "VEGETABLES",
        "price": 4.99,
        "compareAtPrice": 6.99,
        "unit": "lb",
        "farm": {
          "id": "farm_001",
          "name": "Green Valley Farm",
          "slug": "green-valley-farm"
        },
        "primaryPhotoUrl": "https://cdn.example.com/products/prod_001.jpg",
        "inventory": {
          "quantity": 100,
          "availableQuantity": 95,
          "reservedQuantity": 5,
          "inStock": true,
          "isLowStock": false
        },
        "rating": 4.9,
        "reviewCount": 45,
        "isFeatured": true,
        "createdAt": "2024-02-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 500,
      "totalPages": 25
    }
  }
}
```

### GET /api/products/:slug

Get product details.

**Request:**
```http
GET /api/products/organic-tomatoes-green-valley
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "prod_001",
    "name": "Organic Tomatoes",
    "slug": "organic-tomatoes-green-valley",
    "description": "Fresh organic heirloom tomatoes, grown using biodynamic methods",
    "category": "VEGETABLES",
    "price": 4.99,
    "compareAtPrice": 6.99,
    "unit": "lb",
    "farm": {
      "id": "farm_001",
      "name": "Green Valley Farm",
      "slug": "green-valley-farm",
      "rating": 4.8
    },
    "images": [
      {
        "url": "https://cdn.example.com/products/prod_001_1.jpg",
        "isPrimary": true
      },
      {
        "url": "https://cdn.example.com/products/prod_001_2.jpg",
        "isPrimary": false
      }
    ],
    "inventory": {
      "quantity": 100,
      "availableQuantity": 95,
      "reservedQuantity": 5,
      "inStock": true,
      "isLowStock": false,
      "lowStockThreshold": 10,
      "lastRestocked": "2024-12-10T08:00:00Z"
    },
    "nutritionInfo": {
      "calories": 18,
      "protein": 0.9,
      "carbs": 3.9,
      "fat": 0.2
    },
    "certifications": ["ORGANIC", "NON_GMO"],
    "seasonalAvailability": ["SUMMER", "FALL"],
    "storageInstructions": "Store at room temperature",
    "rating": 4.9,
    "reviewCount": 45,
    "reviews": [],
    "isFeatured": true,
    "createdAt": "2024-02-01T10:00:00Z",
    "updatedAt": "2024-12-10T08:00:00Z"
  }
}
```

### POST /api/products

Create new product (Farm owner only).

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "farmId": "farm_001",
  "name": "Organic Carrots",
  "description": "Fresh organic carrots",
  "category": "VEGETABLES",
  "price": 3.99,
  "unit": "lb",
  "inventory": {
    "quantity": 150,
    "lowStockThreshold": 20
  },
  "images": [
    {
      "url": "https://cdn.example.com/products/carrots.jpg",
      "isPrimary": true
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "prod_100",
    "name": "Organic Carrots",
    "slug": "organic-carrots-green-valley",
    "status": "AVAILABLE",
    "createdAt": "2024-12-15T11:00:00Z"
  }
}
```

---

## 📦 ORDERS API

### GET /api/orders

Get user's orders.

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (string) - Filter by status
- `page` (number) - Page number
- `limit` (number) - Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order_001",
        "orderNumber": "ORD-2024-001",
        "status": "DELIVERED",
        "farm": {
          "id": "farm_001",
          "name": "Green Valley Farm"
        },
        "items": [
          {
            "id": "item_001",
            "product": {
              "id": "prod_001",
              "name": "Organic Tomatoes",
              "imageUrl": "https://cdn.example.com/products/prod_001.jpg"
            },
            "quantity": 3,
            "price": 4.99,
            "subtotal": 14.97
          }
        ],
        "subtotal": 14.97,
        "tax": 1.20,
        "shippingCost": 5.99,
        "total": 22.16,
        "shippingAddress": {
          "name": "John Doe",
          "address": "789 Main St",
          "city": "Los Angeles",
          "state": "CA",
          "zipCode": "90001"
        },
        "paymentStatus": "PAID",
        "fulfillmentMethod": "DELIVERY",
        "createdAt": "2024-12-01T10:00:00Z",
        "deliveredAt": "2024-12-03T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### POST /api/orders

Create new order.

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "farmId": "farm_001",
  "items": [
    {
      "productId": "prod_001",
      "quantity": 3
    },
    {
      "productId": "prod_002",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "address": "789 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "phone": "+1-555-0123"
  },
  "fulfillmentMethod": "DELIVERY",
  "paymentMethod": "CARD",
  "notes": "Please leave at door"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_002",
      "orderNumber": "ORD-2024-002",
      "status": "PENDING",
      "total": 35.43,
      "paymentIntent": {
        "id": "pi_123456",
        "clientSecret": "pi_123456_secret_abc123"
      }
    },
    "message": "Order created successfully. Complete payment to confirm."
  }
}
```

### GET /api/orders/:id

Get order details.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "order_001",
    "orderNumber": "ORD-2024-001",
    "status": "DELIVERED",
    "statusHistory": [
      {
        "status": "PENDING",
        "timestamp": "2024-12-01T10:00:00Z"
      },
      {
        "status": "CONFIRMED",
        "timestamp": "2024-12-01T10:15:00Z"
      },
      {
        "status": "DELIVERED",
        "timestamp": "2024-12-03T14:30:00Z"
      }
    ],
    "items": [],
    "subtotal": 14.97,
    "tax": 1.20,
    "shippingCost": 5.99,
    "total": 22.16,
    "payment": {
      "method": "CARD",
      "status": "PAID",
      "paidAt": "2024-12-01T10:15:00Z"
    }
  }
}
```

---

## 👤 USERS API

### GET /api/users/me

Get current user profile.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_001",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CONSUMER",
    "phone": "+1-555-0123",
    "avatar": "https://cdn.example.com/avatars/user_001.jpg",
    "preferences": {
      "notifications": true,
      "newsletter": true
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### PATCH /api/users/me

Update user profile.

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "John Updated",
  "phone": "+1-555-9999",
  "preferences": {
    "notifications": false
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_001",
    "name": "John Updated",
    "phone": "+1-555-9999",
    "updatedAt": "2024-12-15T12:00:00Z"
  }
}
```

---

## 👑 ADMIN API

### GET /api/admin/farms

Get all farms for admin review (ADMIN role required).

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status` (string) - Filter by status
- `verificationStatus` (string) - Filter by verification

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "farms": [],
    "stats": {
      "total": 150,
      "pending": 12,
      "active": 130,
      "suspended": 8
    }
  }
}
```

### POST /api/admin/farms/:id/verify

Verify a farm (ADMIN role required).

**Headers:**
```http
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**
```json
{
  "status": "VERIFIED",
  "notes": "All documentation verified"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Farm verified successfully"
}
```

---

## 🔍 SEARCH API

### GET /api/search

Universal search across platform.

**Query Parameters:**
- `q` (string, required) - Search query
- `type` (string) - Type: farms, products, all
- `limit` (number) - Results limit

**Request:**
```http
GET /api/search?q=organic%20tomatoes&type=products&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "results": {
      "products": [
        {
          "id": "prod_001",
          "name": "Organic Tomatoes",
          "farm": "Green Valley Farm",
          "price": 4.99,
          "relevanceScore": 0.95
        }
      ],
      "farms": [],
      "total": 1
    },
    "query": "organic tomatoes",
    "executionTime": "45ms"
  }
}
```

---

## 📊 ANALYTICS API

### GET /api/analytics/dashboard

Get analytics dashboard data.

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (string) - ISO date
- `endDate` (string) - ISO date

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalSales": 15420.50,
      "totalOrders": 342,
      "averageOrderValue": 45.09,
      "newCustomers": 67
    },
    "salesByDay": [],
    "topProducts": [],
    "topFarms": []
  }
}
```

---

## 🔔 NOTIFICATIONS API

### GET /api/notifications

Get user notifications.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_001",
        "type": "ORDER_CONFIRMED",
        "title": "Order Confirmed",
        "message": "Your order #ORD-2024-001 has been confirmed",
        "read": false,
        "createdAt": "2024-12-15T10:00:00Z"
      }
    ],
    "unreadCount": 3
  }
}
```

---

## ⚠️ ERROR CODES

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Invalid email format"
    },
    "timestamp": "2024-12-15T12:00:00Z",
    "requestId": "req_abc123"
  }
}
```

---

## 🚦 RATE LIMITING

**Rate Limits:**
- **Authentication:** 5 requests per 15 minutes per IP
- **General API:** 100 requests per minute per user
- **Sensitive Operations:** 10 requests per minute per user

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702650000
```

**Rate Limit Exceeded Response (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retryAfter": 60
  }
}
```

---

## 🪝 WEBHOOKS

Configure webhooks to receive real-time updates.

**Webhook Events:**
- `order.created`
- `order.confirmed`
- `order.delivered`
- `payment.succeeded`
- `payment.failed`
- `farm.verified`
- `product.low_stock`

**Webhook Payload Example:**
```json
{
  "event": "order.confirmed",
  "timestamp": "2024-12-15T12:00:00Z",
  "data": {
    "orderId": "order_001",
    "orderNumber": "ORD-2024-001",
    "status": "CONFIRMED"
  }
}
```

**Webhook Headers:**
```http
X-Webhook-Signature: sha256=abc123...
X-Webhook-Event: order.confirmed
X-Webhook-Timestamp: 1702650000
```

---

## 📝 NOTES

### Pagination
All list endpoints support pagination with `page` and `limit` parameters.

### Filtering
Most endpoints support filtering via query parameters.

### Sorting
Use `sortBy` and `sortOrder` (asc/desc) parameters.

### Versioning
API version is specified in the URL path: `/api/v1/...`

### CORS
CORS is enabled for configured domains.

### Caching
Responses include cache headers for optimization.

---

## 🔗 ADDITIONAL RESOURCES

- **OpenAPI Spec:** `/api/openapi.json`
- **Swagger UI:** `/api-docs`
- **Postman Collection:** Available on request
- **SDK Documentation:** Coming soon

---

**API Status:** ✅ **Production Ready**  
**Documentation Version:** 1.0.0  
**Last Updated:** December 2024  
**Support:** api-support@farmersmarket.com

---

_"API with agricultural consciousness, documented with divine precision."_ 🌾⚡