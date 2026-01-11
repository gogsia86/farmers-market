# 🌾 Farmers Market Platform API Documentation

**Version:** 1.0.0  
**Base URL:** `https://farmersmarket.vercel.app`  
**Documentation:** [Interactive API Docs](/api-docs)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Pagination](#pagination)
- [Examples](#examples)
- [SDKs & Libraries](#sdks--libraries)

---

## 🎯 Overview

The Farmers Market Platform API provides a comprehensive REST API for managing:

- 🚜 **Farms** - Farm profiles, verification, and discovery
- 🌾 **Products** - Product catalog, inventory, and categories
- 📦 **Orders** - Order processing, tracking, and fulfillment
- 🛒 **Cart** - Shopping cart management
- 💳 **Payments** - Stripe integration for secure payments
- 👤 **Users** - User profiles and authentication
- ⭐ **Reviews** - Product and farm ratings
- 🔔 **Notifications** - Real-time updates
- 📊 **Analytics** - Sales reports and metrics

### Key Features

- **RESTful Design** - Standard HTTP methods and status codes
- **Type-Safe** - Complete TypeScript types available
- **Well-Documented** - Interactive Swagger UI documentation
- **Authenticated** - Secure JWT-based authentication
- **Paginated** - Efficient data retrieval
- **Filtered** - Flexible query parameters
- **Real-time** - WebSocket support for live updates

---

## 🚀 Quick Start

### 1. Get Your API Token

```bash
# Sign in to get JWT token
curl -X POST https://farmersmarket.vercel.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "your-password"
  }'
```

### 2. Make Your First Request

```bash
# List all farms
curl -X GET https://farmersmarket.vercel.app/api/farms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Explore Interactive Docs

Visit [/api-docs](/api-docs) to explore the API interactively with Swagger UI.

---

## 🔐 Authentication

### NextAuth v5 (Auth.js)

The API uses NextAuth v5 for authentication with JWT tokens.

### Getting a Token

**Sign In:**

```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_abc123",
      "email": "user@example.com",
      "name": "John Farmer",
      "role": "FARMER"
    }
  }
}
```

### Using the Token

Include the JWT token in the `Authorization` header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration

- **Access tokens** expire after 30 days
- Refresh tokens automatically when expired
- Session endpoint: `GET /api/auth/session`

### Roles & Permissions

| Role         | Permissions                            |
| ------------ | -------------------------------------- |
| **ADMIN**    | Full access to all resources           |
| **FARMER**   | Manage own farm, products, orders      |
| **CUSTOMER** | Browse products, place orders, reviews |

---

## 🛣️ API Endpoints

### Health & Monitoring

| Method | Endpoint      | Description         |
| ------ | ------------- | ------------------- |
| GET    | `/api/health` | System health check |
| GET    | `/api/ready`  | Readiness probe     |

### Authentication

| Method | Endpoint            | Description              |
| ------ | ------------------- | ------------------------ |
| POST   | `/api/auth/signin`  | Sign in with credentials |
| POST   | `/api/auth/signout` | Sign out current user    |
| GET    | `/api/auth/session` | Get current session      |

### Farms

| Method | Endpoint                  | Description      | Auth              |
| ------ | ------------------------- | ---------------- | ----------------- |
| GET    | `/api/farms`              | List all farms   | No                |
| POST   | `/api/farms`              | Create new farm  | Yes (FARMER)      |
| GET    | `/api/farms/{id}`         | Get farm details | No                |
| PUT    | `/api/farms/{id}`         | Update farm      | Yes (Owner/Admin) |
| DELETE | `/api/farms/{id}`         | Delete farm      | Yes (Owner/Admin) |
| GET    | `/api/farms/search?q=...` | Search farms     | No                |

### Products

| Method | Endpoint                     | Description         | Auth              |
| ------ | ---------------------------- | ------------------- | ----------------- |
| GET    | `/api/products`              | List all products   | No                |
| POST   | `/api/products`              | Create product      | Yes (FARMER)      |
| GET    | `/api/products/{id}`         | Get product details | No                |
| PUT    | `/api/products/{id}`         | Update product      | Yes (Owner/Admin) |
| DELETE | `/api/products/{id}`         | Delete product      | Yes (Owner/Admin) |
| GET    | `/api/products/search?q=...` | Search products     | No                |

### Cart

| Method | Endpoint               | Description      | Auth |
| ------ | ---------------------- | ---------------- | ---- |
| GET    | `/api/cart`            | Get user's cart  | Yes  |
| POST   | `/api/cart/items`      | Add item to cart | Yes  |
| PUT    | `/api/cart/items/{id}` | Update cart item | Yes  |
| DELETE | `/api/cart/items/{id}` | Remove from cart | Yes  |

### Orders

| Method | Endpoint           | Description         | Auth               |
| ------ | ------------------ | ------------------- | ------------------ |
| GET    | `/api/orders`      | List user's orders  | Yes                |
| POST   | `/api/orders`      | Create order        | Yes                |
| GET    | `/api/orders/{id}` | Get order details   | Yes                |
| PATCH  | `/api/orders/{id}` | Update order status | Yes (FARMER/Admin) |

### Checkout

| Method | Endpoint        | Description             | Auth |
| ------ | --------------- | ----------------------- | ---- |
| POST   | `/api/checkout` | Create checkout session | Yes  |

### Search

| Method | Endpoint            | Description   | Auth |
| ------ | ------------------- | ------------- | ---- |
| GET    | `/api/search?q=...` | Global search | No   |

### Favorites

| Method | Endpoint              | Description        | Auth |
| ------ | --------------------- | ------------------ | ---- |
| GET    | `/api/favorites`      | Get user favorites | Yes  |
| POST   | `/api/favorites`      | Add to favorites   | Yes  |
| DELETE | `/api/favorites/{id}` | Remove favorite    | Yes  |

### Notifications

| Method | Endpoint                       | Description        | Auth |
| ------ | ------------------------------ | ------------------ | ---- |
| GET    | `/api/notifications`           | List notifications | Yes  |
| POST   | `/api/notifications/{id}/read` | Mark as read       | Yes  |

### User Profile

| Method | Endpoint            | Description      | Auth |
| ------ | ------------------- | ---------------- | ---- |
| GET    | `/api/user/profile` | Get user profile | Yes  |
| PUT    | `/api/user/profile` | Update profile   | Yes  |

### Admin

| Method | Endpoint                       | Description    | Auth        |
| ------ | ------------------------------ | -------------- | ----------- |
| GET    | `/api/admin/users`             | List all users | Yes (ADMIN) |
| POST   | `/api/admin/farms/{id}/verify` | Verify farm    | Yes (ADMIN) |

---

## 📦 Response Format

All API endpoints return a standardized `ServiceResponse<T>` format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data (varies by endpoint)
  },
  "meta": {
    "timestamp": "2025-01-10T12:00:00Z",
    "requestId": "req_abc123",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalPages": 5,
      "totalItems": 100,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "name": "Name must be at least 3 characters",
      "email": "Invalid email format"
    }
  },
  "meta": {
    "timestamp": "2025-01-10T12:00:00Z",
    "requestId": "req_abc123"
  }
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code    | Description           | Common Scenarios                |
| ------- | --------------------- | ------------------------------- |
| **200** | OK                    | Successful GET/PUT/PATCH        |
| **201** | Created               | Successful POST                 |
| **204** | No Content            | Successful DELETE               |
| **400** | Bad Request           | Validation error, invalid input |
| **401** | Unauthorized          | Missing or invalid token        |
| **403** | Forbidden             | Insufficient permissions        |
| **404** | Not Found             | Resource doesn't exist          |
| **409** | Conflict              | Duplicate resource              |
| **422** | Unprocessable Entity  | Business logic error            |
| **429** | Too Many Requests     | Rate limit exceeded             |
| **500** | Internal Server Error | Server error                    |
| **503** | Service Unavailable   | Maintenance mode                |

### Error Codes

| Code                       | Description                      |
| -------------------------- | -------------------------------- |
| `VALIDATION_ERROR`         | Input validation failed          |
| `AUTHENTICATION_REQUIRED`  | User must be authenticated       |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions  |
| `RESOURCE_NOT_FOUND`       | Requested resource doesn't exist |
| `DUPLICATE_RESOURCE`       | Resource already exists          |
| `BUSINESS_LOGIC_ERROR`     | Business rule violation          |
| `RATE_LIMIT_EXCEEDED`      | Too many requests                |
| `INTERNAL_ERROR`           | Unexpected server error          |

### Error Handling Example

```typescript
try {
  const response = await fetch("/api/farms", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(farmData),
  });

  const result = await response.json();

  if (!result.success) {
    console.error("Error:", result.error.code);
    console.error("Message:", result.error.message);
    console.error("Details:", result.error.details);
  }
} catch (error) {
  console.error("Network error:", error);
}
```

---

## 🚦 Rate Limiting

### Limits

- **Authenticated users:** 1,000 requests per hour
- **Anonymous users:** 100 requests per hour

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1641024000
```

### Handling Rate Limits

When rate limit is exceeded (HTTP 429):

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 3600
    }
  }
}
```

---

## 📄 Pagination

List endpoints support pagination via query parameters.

### Parameters

| Parameter   | Type    | Default | Max | Description           |
| ----------- | ------- | ------- | --- | --------------------- |
| `page`      | integer | 1       | -   | Page number (1-based) |
| `pageSize`  | integer | 20      | 100 | Items per page        |
| `sortBy`    | string  | -       | -   | Sort field            |
| `sortOrder` | enum    | desc    | -   | `asc` or `desc`       |

### Example Request

```http
GET /api/farms?page=2&pageSize=50&sortBy=name&sortOrder=asc
```

### Pagination Response

```json
{
  "success": true,
  "data": [
    /* farms */
  ],
  "meta": {
    "pagination": {
      "page": 2,
      "pageSize": 50,
      "totalPages": 10,
      "totalItems": 500,
      "hasNext": true,
      "hasPrevious": true
    }
  }
}
```

---

## 💡 Examples

### Create a Farm

```bash
curl -X POST https://farmersmarket.vercel.app/api/farms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Green Valley Farm",
    "description": "Organic vegetables and fruits",
    "location": {
      "street": "123 Farm Road",
      "city": "Farmville",
      "state": "CA",
      "zipCode": "12345",
      "country": "USA",
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "certifications": ["ORGANIC", "NON_GMO"]
  }'
```

### List Products with Filters

```bash
curl -X GET "https://farmersmarket.vercel.app/api/products?categoryId=cat_123&inStock=true&minPrice=5&maxPrice=20&page=1&pageSize=20"
```

### Add Item to Cart

```bash
curl -X POST https://farmersmarket.vercel.app/api/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_abc123",
    "quantity": 2
  }'
```

### Create Order

```bash
curl -X POST https://farmersmarket.vercel.app/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deliveryAddress": {
      "street": "456 Main St",
      "city": "Springfield",
      "state": "IL",
      "zipCode": "62701",
      "country": "USA"
    },
    "paymentMethodId": "pm_abc123",
    "notes": "Please deliver in the morning"
  }'
```

### Search Farms

```bash
curl -X GET "https://farmersmarket.vercel.app/api/search?q=organic&type=farms"
```

---

## 📚 SDKs & Libraries

### TypeScript/JavaScript

```bash
npm install @farmersmarket/api-client
```

```typescript
import { FarmersMarketAPI } from "@farmersmarket/api-client";

const api = new FarmersMarketAPI({
  token: "YOUR_JWT_TOKEN",
});

// List farms
const farms = await api.farms.list({
  page: 1,
  pageSize: 20,
  status: "ACTIVE",
});

// Create product
const product = await api.products.create({
  name: "Organic Tomatoes",
  description: "Fresh, locally grown",
  price: 4.99,
  unit: "LB",
  farmId: "farm_123",
  categoryId: "cat_456",
});
```

### Python (Coming Soon)

```bash
pip install farmersmarket-api
```

---

## 🔗 Additional Resources

- **[Interactive API Docs](/api-docs)** - Swagger UI
- **[Authentication Guide](./authentication.md)** - Detailed auth documentation
- **[Error Codes Reference](./error-codes.md)** - Complete error code list
- **[Examples](./examples/)** - Code examples for common tasks
- **[Changelog](../../CHANGELOG.md)** - API version history
- **[Status Page](https://status.farmersmarket.com)** - Service status

---

## 🐛 Support

- **Email:** api-support@farmersmarket.com
- **GitHub Issues:** [github.com/farmersmarket/issues](https://github.com)
- **Discord:** [discord.gg/farmersmarket](https://discord.gg)
- **Documentation:** [docs.farmersmarket.com](https://docs.farmersmarket.com)

---

## 📝 Versioning

The API uses semantic versioning (SemVer):

- **Current Version:** 1.0.0
- **Breaking changes** increment major version
- **New features** increment minor version
- **Bug fixes** increment patch version

Version is included in response headers:

```http
X-API-Version: 1.0.0
```

---

## 🔒 Security

- **HTTPS Only** - All requests must use HTTPS
- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - Protection against abuse
- **Input Validation** - All inputs are validated
- **SQL Injection Protection** - Parameterized queries
- **XSS Protection** - Output sanitization
- **CORS** - Configured for security

Report security issues: security@farmersmarket.com

---

**Last Updated:** January 2025  
**API Version:** 1.0.0  
**Documentation Version:** 1.0.0
