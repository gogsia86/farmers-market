# 🚀 API Documentation - Getting Started Guide
## Farmers Market Platform API

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: ✅ PRODUCTION READY  

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Authentication](#authentication)
4. [API Response Format](#api-response-format)
5. [Available Documentation](#available-documentation)
6. [Making Your First Request](#making-your-first-request)
7. [Using Postman](#using-postman)
8. [Using Swagger UI](#using-swagger-ui)
9. [Frontend Integration](#frontend-integration)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)
12. [Support](#support)

---

## 🌟 Overview

The Farmers Market Platform API is a comprehensive RESTful API that powers our divine agricultural e-commerce platform. It provides endpoints for:

- 🚜 **Farm Management** - CRUD operations, search, verification
- 🌾 **Product Catalog** - Inventory, categories, search
- 📦 **Order Processing** - Cart, checkout, fulfillment
- 👤 **User Management** - Authentication, profiles, roles
- 🌍 **Marketplace** - Discovery, featured items, recommendations
- 📊 **Analytics** - Farmer dashboard, sales reports
- 🔔 **Notifications** - Real-time updates, alerts

### Key Features

✅ **RESTful Design** - Standard HTTP methods and status codes  
✅ **ServiceResponse<T> Pattern** - Consistent response structure  
✅ **Type Safety** - Full TypeScript support  
✅ **Agricultural Consciousness** - Biodynamic awareness in every endpoint  
✅ **Comprehensive Documentation** - OpenAPI 3.0, Postman, Markdown  

---

## 🚀 Quick Start

### Base URLs

```bash
# Development
https://localhost:3001/api

# Staging
https://staging.farmersmarket.com/api

# Production
https://farmersmarket.com/api
```

### Health Check

Test the API is running:

```bash
curl https://localhost:3001/api/health
```

Response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

---

## 🔐 Authentication

### Overview

The API uses **NextAuth.js** with JWT tokens for authentication.

### Getting a Token

**1. Sign Up** (if you don't have an account):
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Farmer",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "role": "FARMER"
}
```

**2. Sign In**:
```bash
POST /api/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "john@example.com",
      "name": "John Farmer",
      "role": "FARMER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Using the Token

Include the token in the `Authorization` header:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     https://localhost:3001/api/farms
```

### Token Expiration

- Access tokens expire after **24 hours**
- Refresh tokens expire after **30 days**
- Use the refresh endpoint to get a new token without signing in again

---

## 📦 API Response Format

All API endpoints return a standardized `ServiceResponse<T>` format:

### Success Response

```typescript
{
  success: true,
  data: T,                    // Your actual data
  meta?: {
    message?: string,
    timestamp?: string,
    agricultural?: {
      season: "SPRING" | "SUMMER" | "FALL" | "WINTER",
      consciousness: "DIVINE" | "QUANTUM"
    },
    pagination?: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    }
  }
}
```

### Error Response

```typescript
{
  success: false,
  error: {
    code: string,             // Machine-readable error code
    message: string,          // Human-readable message
    details?: any             // Additional error details
  },
  meta?: {
    timestamp: string,
    requestId?: string
  }
}
```

### Example Success Response

```json
{
  "success": true,
  "data": {
    "id": "farm_123",
    "name": "Green Valley Farm",
    "slug": "green-valley-farm",
    "verified": true
  },
  "meta": {
    "message": "Farm retrieved successfully",
    "timestamp": "2025-01-15T10:30:00Z",
    "agricultural": {
      "season": "WINTER",
      "consciousness": "DIVINE"
    }
  }
}
```

### Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "FARM_NOT_FOUND",
    "message": "Farm with ID 'farm_999' not found",
    "details": {
      "farmId": "farm_999"
    }
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

---

## 📖 Available Documentation

We provide multiple formats of API documentation to suit your needs:

### 1. **Interactive Swagger UI** (Recommended)

**Location**: `docs/api/index.html`

**How to Use**:
```bash
# Option 1: Open directly in browser
open docs/api/index.html

# Option 2: Serve with a local server
npx serve docs/api
# Then open: http://localhost:3000
```

**Features**:
- ✅ Interactive API explorer
- ✅ Try out requests directly
- ✅ See request/response examples
- ✅ Download OpenAPI spec

### 2. **OpenAPI 3.0 Specification**

**Locations**:
- `docs/api/openapi.json` (JSON format)
- `docs/api/openapi.yaml` (YAML format)

**Use Cases**:
- Generate type-safe API clients
- Import into API tools (Insomnia, Paw)
- Auto-generate SDK code
- Contract testing

**Example - Generate TypeScript Client**:
```bash
npx openapi-typescript docs/api/openapi.json --output src/types/api.ts
```

### 3. **Postman Collection**

**Location**: `docs/api/postman-collection.json`

**How to Import**:
1. Open Postman
2. Click **Import** button
3. Select `docs/api/postman-collection.json`
4. Set environment variables (see below)

**Environment Variables**:
```json
{
  "baseUrl": "https://localhost:3001/api",
  "authToken": "YOUR_AUTH_TOKEN_HERE"
}
```

### 4. **Markdown Reference**

**Location**: `docs/api/API_REFERENCE.md`

**Use Cases**:
- Quick reference
- Offline documentation
- Copy-paste examples
- GitHub wiki

---

## 🎯 Making Your First Request

### Example 1: Get All Farms (Public)

```bash
curl -X GET "https://localhost:3001/api/farms?page=1&limit=10" \
     -H "Content-Type: application/json"
```

### Example 2: Create a Farm (Authenticated)

```bash
curl -X POST "https://localhost:3001/api/farms" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -d '{
       "name": "Sunshine Organic Farm",
       "address": "123 Farm Road",
       "city": "Farmville",
       "state": "CA",
       "zipCode": "12345",
       "latitude": 37.7749,
       "longitude": -122.4194,
       "description": "Family-owned organic farm since 1985",
       "farmingPractices": ["ORGANIC", "REGENERATIVE"],
       "productCategories": ["VEGETABLES", "FRUITS"]
     }'
```

### Example 3: Get Farm by ID

```bash
curl -X GET "https://localhost:3001/api/farms/farm_123" \
     -H "Content-Type: application/json"
```

### Example 4: Search Farms

```bash
curl -X GET "https://localhost:3001/api/farms?search=organic&state=CA&verified=true" \
     -H "Content-Type: application/json"
```

---

## 🔧 Using Postman

### Step 1: Import Collection

1. Open Postman
2. Click **Import** → **File**
3. Select `docs/api/postman-collection.json`
4. Collection appears in left sidebar

### Step 2: Set Up Environment

1. Click **Environments** (left sidebar)
2. Click **+** to create new environment
3. Name it "Farmers Market - Local"
4. Add variables:
   ```
   baseUrl = https://localhost:3001/api
   authToken = (leave empty for now)
   ```

### Step 3: Get Authentication Token

1. Open collection → **Auth** → **Sign In**
2. Update request body with your credentials
3. Click **Send**
4. Copy the `token` from response
5. Go to Environment → Paste token into `authToken` variable

### Step 4: Make Authenticated Requests

1. All authenticated requests will now use your token automatically
2. Try: **Farms** → **Create Farm**
3. Modify request body as needed
4. Click **Send**

### Pro Tips

- Use **Pre-request Scripts** to auto-refresh tokens
- Create multiple environments (Local, Staging, Production)
- Use **Tests** tab to validate responses
- Save common requests to **Examples**

---

## 🌐 Using Swagger UI

### Step 1: Open Swagger UI

```bash
# Option 1: Direct file
open docs/api/index.html

# Option 2: Local server (recommended)
npx serve docs/api
# Open: http://localhost:3000
```

### Step 2: Authenticate

1. Click **Authorize** button (top right)
2. Enter your JWT token: `Bearer YOUR_TOKEN_HERE`
3. Click **Authorize**
4. Click **Close**

### Step 3: Try an Endpoint

1. Click on any endpoint to expand it
2. Click **Try it out** button
3. Fill in required parameters
4. Click **Execute**
5. See request, response, and status code

### Step 4: View Schemas

1. Scroll to bottom → **Schemas** section
2. View `ServiceResponse` structure
3. See all available models

---

## 💻 Frontend Integration

### Option 1: Fetch API (Simple)

```typescript
// lib/api/client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ServiceResponse<T>> {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();
  return data;
}

// Usage
const result = await apiFetch<Farm>('/farms/farm_123');
if (result.success) {
  console.log(result.data); // Type-safe!
}
```

### Option 2: React Query (Recommended)

```typescript
// hooks/useFarms.ts
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';

export function useFarms(filters?: FarmFilters) {
  return useQuery({
    queryKey: ['farms', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters as any);
      const result = await apiFetch<Farm[]>(`/farms?${params}`);
      
      if (!result.success) {
        throw new Error(result.error.message);
      }
      
      return result.data;
    },
  });
}

// Usage in component
function FarmsPage() {
  const { data: farms, isLoading, error } = useFarms({ 
    verified: true,
    state: 'CA' 
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {farms?.map(farm => (
        <FarmCard key={farm.id} farm={farm} />
      ))}
    </div>
  );
}
```

### Option 3: Generate Type-Safe Client

```bash
# Install OpenAPI TypeScript generator
npm install -D openapi-typescript

# Generate types from OpenAPI spec
npx openapi-typescript docs/api/openapi.json --output src/types/api.ts

# Now you have full type safety!
```

```typescript
import type { paths } from '@/types/api';

type GetFarmsResponse = paths['/api/farms']['get']['responses']['200']['content']['application/json'];
// Fully type-safe API calls!
```

---

## ⚠️ Error Handling

### Standard Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `AUTHENTICATION_REQUIRED` | 401 | No auth token provided |
| `INVALID_TOKEN` | 401 | Token is invalid or expired |
| `FORBIDDEN` | 403 | User lacks permission |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `FARM_NOT_FOUND` | 404 | Farm doesn't exist |
| `PRODUCT_NOT_FOUND` | 404 | Product doesn't exist |
| `ORDER_NOT_FOUND` | 404 | Order doesn't exist |
| `INSUFFICIENT_INVENTORY` | 400 | Not enough stock |
| `DUPLICATE_FARM` | 409 | Farm already exists |
| `INTERNAL_ERROR` | 500 | Server error |

### Error Handling Pattern

```typescript
async function createFarm(farmData: CreateFarmRequest) {
  const result = await apiFetch<Farm>('/farms', {
    method: 'POST',
    body: JSON.stringify(farmData),
  });

  if (!result.success) {
    switch (result.error.code) {
      case 'AUTHENTICATION_REQUIRED':
        // Redirect to login
        router.push('/login');
        break;
      
      case 'VALIDATION_ERROR':
        // Show validation errors
        setErrors(result.error.details);
        break;
      
      case 'DUPLICATE_FARM':
        // Farm already exists
        toast.error('A farm with this name already exists');
        break;
      
      default:
        // Generic error
        toast.error(result.error.message);
    }
    return;
  }

  // Success!
  toast.success('Farm created successfully');
  router.push(`/farms/${result.data.slug}`);
}
```

---

## 🚦 Rate Limiting

### Current Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Public (read) | 100 requests | 15 minutes |
| Authenticated | 1000 requests | 15 minutes |
| Write operations | 50 requests | 15 minutes |
| Search | 30 requests | 1 minute |

### Rate Limit Headers

Check response headers for rate limit info:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642262400
```

### Handling Rate Limits

```typescript
async function apiCallWithRetry<T>(
  endpoint: string,
  options?: RequestInit,
  retries = 3
): Promise<ServiceResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  
  if (response.status === 429) {
    const resetTime = response.headers.get('X-RateLimit-Reset');
    const waitTime = resetTime 
      ? parseInt(resetTime) * 1000 - Date.now()
      : 60000; // Default 1 minute
    
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return apiCallWithRetry(endpoint, options, retries - 1);
    }
  }
  
  return response.json();
}
```

---

## 🆘 Support

### Getting Help

**Documentation Issues**:
- Check `docs/api/API_REFERENCE.md` for detailed endpoint info
- Review `docs/api/API_DOCUMENTATION.md` for architecture details

**API Issues**:
- Check `TROUBLESHOOTING.md` for common problems
- Review error codes in response

**Contact Support**:
- Email: api-support@farmersmarket.com
- GitHub Issues: [Submit an issue](https://github.com/farmersmarket/platform/issues)
- Discord: [Join our server](https://discord.gg/farmersmarket)

### Useful Resources

- **API Reference**: `docs/api/API_REFERENCE.md`
- **Authentication Guide**: `docs/AUTH_GUIDE.md`
- **Frontend Integration**: `FRONTEND_INTEGRATION_GUIDE.md`
- **Deployment Guide**: `VERCEL_DEPLOYMENT_GUIDE.md`
- **Database Schema**: `PRISMA_SCHEMA_REFERENCE.md`

---

## 🎉 Next Steps

Now that you understand the API, here's what to do next:

1. ✅ **Explore Swagger UI** - Get familiar with all endpoints
2. ✅ **Import Postman Collection** - Test requests interactively
3. ✅ **Generate API Client** - Use OpenAPI TypeScript generator
4. ✅ **Build Frontend Features** - Start integrating with your UI
5. ✅ **Set Up Error Handling** - Implement robust error patterns
6. ✅ **Add Caching** - Use React Query for optimal performance
7. ✅ **Deploy to Production** - Follow deployment checklist

---

## 📊 API Statistics

```
╔════════════════════════════════════════════════════════════╗
║              API DOCUMENTATION COMPLETE ✅                 ║
╠════════════════════════════════════════════════════════════╣
║  Total Endpoints:        15+ endpoints                     ║
║  OpenAPI Version:        3.0.0 ✅                          ║
║  Postman Collection:     Generated ✅                      ║
║  Swagger UI:             Interactive ✅                    ║
║  Type Safety:            Full TypeScript ✅                ║
║  Documentation:          Comprehensive ✅                  ║
╚════════════════════════════════════════════════════════════╝
```

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: ✅ PRODUCTION READY  
**Documentation Owner**: DevOps Team  

---

*"Build with confidence, code with consciousness, deploy with divinity!"* 🌾⚡🚀