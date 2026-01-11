# 🌾 Swagger UI - Interactive API Documentation

**Last Updated:** January 10, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Features](#features)
- [Usage Guide](#usage-guide)
- [Authentication](#authentication)
- [Testing Endpoints](#testing-endpoints)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)
- [Customization](#customization)

---

## 🎯 Overview

The Farmers Market Platform provides **interactive API documentation** powered by Swagger UI. This allows developers to:

- 📖 Browse all available endpoints
- 🧪 Test API calls directly from the browser
- 🔍 Explore request/response schemas
- 🔐 Test authenticated endpoints with JWT tokens
- 📊 View real-time request/response data

**Access URL:** [`http://localhost:3001/api-docs`](http://localhost:3001/api-docs)

---

## 🚀 Quick Start

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Open Swagger UI

Navigate to: **http://localhost:3001/api-docs**

### 3. Explore the API

- Browse endpoints by tag (Health, Authentication, Farms, Products, etc.)
- Click "Try it out" on any endpoint
- Fill in parameters and click "Execute"
- View the response

### 4. Test Authenticated Endpoints (Optional)

1. Sign in via `/api/auth/signin`
2. Copy the JWT token from the response
3. Paste it into the "JWT Authentication Token" field at the top
4. Test protected endpoints

---

## ✨ Features

### 📚 Comprehensive Documentation

- **32+ Documented Endpoints** across 15 categories
- **Type-safe schemas** with validation rules
- **Real-world examples** for all requests/responses
- **Error code reference** with handling strategies

### 🧪 Interactive Testing

- **Try It Out** - Execute API calls directly from the browser
- **Request Builder** - Auto-populated forms with validation
- **Response Inspector** - View headers, status codes, and body
- **cURL Generation** - Copy ready-to-use cURL commands

### 🔐 Authentication Support

- **JWT Bearer Token** authentication
- **Persistent tokens** (saved in localStorage)
- **Auto-injection** into all authenticated requests
- **Visual indicators** for protected endpoints

### 🎨 Custom Styling

- **Tailwind CSS** integration
- **Responsive design** (mobile-friendly)
- **Dark code blocks** with syntax highlighting
- **Color-coded HTTP methods** (GET/POST/PUT/DELETE/PATCH)

### 📦 Production Ready

- **OpenAPI 3.0.3** compliant
- **Type-safe** implementation (TypeScript)
- **Cached responses** (1-hour TTL)
- **CORS enabled** for cross-origin requests

---

## 📖 Usage Guide

### Browsing Endpoints

#### By Category

Endpoints are organized by tags:

- **Health** - System health checks
- **Authentication** - Sign in/out, sessions
- **Farms** - Farm CRUD operations
- **Products** - Product catalog management
- **Orders** - Order processing
- **Cart** - Shopping cart operations
- **Checkout** - Payment and checkout
- **Search** - Global search
- **Favorites** - Wishlist management
- **Notifications** - User notifications
- **Admin** - Administrative operations

#### Quick Navigation

Use the quick links bar at the top:

```
Authentication | Farms | Products | Orders | Cart | Schemas
```

Click any link to jump directly to that section.

### Filtering Endpoints

Use the **filter input** at the top to search:

```
Search: "farm"
```

Shows only endpoints containing "farm" in the path or description.

### Expanding/Collapsing

- **Click the tag name** to expand/collapse all endpoints in that category
- **Click an endpoint** to expand/collapse its details
- **Default:** List view (collapsed)

---

## 🔐 Authentication

### Option 1: Manual Token Entry (Recommended)

1. **Get a JWT Token:**

   ```bash
   # Sign in via API
   curl -X POST http://localhost:3001/api/auth/signin \
     -H "Content-Type: application/json" \
     -d '{"email":"farmer@example.com","password":"password123"}'
   ```

2. **Copy the token** from the response

3. **Paste into Swagger UI:**
   - Find the "JWT Authentication Token" field at the top
   - Paste your token
   - It's automatically saved in localStorage

4. **Test protected endpoints** - Token is auto-injected

### Option 2: Swagger's Built-in Auth

1. **Click "Authorize"** button (top right, if visible)
2. Enter your token in the format: `Bearer YOUR_JWT_TOKEN`
3. Click "Authorize"
4. Close the modal

### Verifying Authentication

Try a protected endpoint like:

```
GET /api/user/profile
```

- **Without token:** Returns `401 Unauthorized`
- **With valid token:** Returns user profile data

### Clearing Authentication

Click the **"Clear"** button next to the token input field.

---

## 🧪 Testing Endpoints

### Example 1: Public Endpoint (No Auth)

**List Farms:**

1. Navigate to **Farms** → `GET /api/farms`
2. Click **"Try it out"**
3. Set parameters (optional):
   - `page`: 1
   - `pageSize`: 20
   - `search`: "organic"
4. Click **"Execute"**
5. View response:

```json
{
  "success": true,
  "data": [
    {
      "id": "farm_abc123",
      "name": "Green Valley Farm",
      "status": "ACTIVE",
      "location": { ... }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "totalPages": 5
    }
  }
}
```

### Example 2: Authenticated Endpoint

**Create Product:**

1. **Set auth token** (see Authentication section)
2. Navigate to **Products** → `POST /api/products`
3. Click **"Try it out"**
4. Fill in the request body:

```json
{
  "name": "Organic Tomatoes",
  "description": "Fresh, locally grown organic tomatoes",
  "price": 4.99,
  "unit": "LB",
  "stock": 100,
  "farmId": "farm_abc123",
  "categoryId": "cat_vegetables",
  "isOrganic": true,
  "isLocalGrown": true
}
```

5. Click **"Execute"**
6. View response (201 Created)

### Example 3: Parameterized Request

**Get Farm Details:**

1. Navigate to **Farms** → `GET /api/farms/{farmId}`
2. Click **"Try it out"**
3. Enter `farmId`: `farm_abc123`
4. Click **"Execute"**
5. View farm details

### Example 4: File Upload (Future)

For multipart/form-data endpoints:

1. Click **"Try it out"**
2. Use the file picker to select an image
3. Fill in other form fields
4. Click **"Execute"**

---

## ❌ Troubleshooting

### Issue: Swagger UI Not Loading

**Symptoms:**
- Blank page or loading spinner forever

**Solutions:**

1. **Check console for errors:**
   ```javascript
   // Open DevTools (F12) → Console tab
   ```

2. **Verify OpenAPI spec is accessible:**
   ```bash
   curl http://localhost:3001/api/openapi.json
   ```

3. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

4. **Restart dev server:**
   ```bash
   npm run dev
   ```

### Issue: 401 Unauthorized on Protected Endpoints

**Symptoms:**
- Protected endpoints return 401 even with token

**Solutions:**

1. **Verify token format:**
   ```javascript
   // Token should be JWT (three parts separated by dots)
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
   ```

2. **Check token expiration:**
   - Tokens expire after a certain time
   - Sign in again to get a fresh token

3. **Verify token is being sent:**
   - Open DevTools → Network tab
   - Execute a request
   - Check request headers for: `Authorization: Bearer YOUR_TOKEN`

4. **Clear and re-enter token:**
   - Click "Clear" button
   - Re-paste the token

### Issue: CORS Errors

**Symptoms:**
- `Access-Control-Allow-Origin` errors in console

**Solutions:**

1. **Check if you're accessing from correct origin:**
   - Must be `http://localhost:3001`
   - Not `127.0.0.1` or other IPs

2. **Verify CORS headers in response:**
   ```bash
   curl -I http://localhost:3001/api/openapi.json
   ```

3. **Restart server if needed:**
   ```bash
   npm run dev
   ```

### Issue: OpenAPI Spec Not Found

**Symptoms:**
- 404 error when loading `/api/openapi.json`

**Solutions:**

1. **Verify file exists:**
   ```bash
   ls docs/api/openapi.yaml
   ```

2. **Check file permissions:**
   ```bash
   # Should be readable
   cat docs/api/openapi.yaml
   ```

3. **Rebuild the app:**
   ```bash
   npm run build
   npm run dev
   ```

### Issue: Schemas Not Displaying

**Symptoms:**
- Response/request schemas show as empty or broken

**Solutions:**

1. **Check OpenAPI spec syntax:**
   ```bash
   # Validate YAML syntax
   npx @apidevtools/swagger-cli validate docs/api/openapi.yaml
   ```

2. **Verify schema references:**
   - All `$ref` paths should be valid
   - Example: `$ref: '#/components/schemas/Farm'`

3. **Check for circular references:**
   - Swagger UI may struggle with deeply nested circular refs

---

## 🏗️ Architecture

### File Structure

```
src/
├── app/
│   ├── api/
│   │   └── openapi.json/
│   │       └── route.ts              # Serves OpenAPI spec as JSON
│   └── api-docs/
│       └── page.tsx                   # Swagger UI page
│
├── components/
│   └── api-docs/
│       └── SwaggerUI.tsx              # Client-side Swagger UI component
│
docs/
└── api/
    ├── openapi.yaml                   # OpenAPI 3.0.3 specification
    ├── README.md                      # API overview
    ├── ERROR_CODES.md                 # Error reference
    └── SWAGGER_UI.md                  # This file
```

### Data Flow

```
┌─────────────┐
│   Browser   │
│             │
│ /api-docs   │
└──────┬──────┘
       │ 1. Load page
       ▼
┌─────────────────────┐
│  SwaggerUI.tsx      │
│  (Client Component) │
└──────┬──────────────┘
       │ 2. Fetch spec
       ▼
┌─────────────────────┐
│ GET /api/openapi.json
│ (API Route)        │
└──────┬──────────────┘
       │ 3. Read YAML
       ▼
┌─────────────────────┐
│ docs/api/           │
│ openapi.yaml        │
│                     │
│ (Source of Truth)   │
└──────┬──────────────┘
       │ 4. Convert YAML → JSON
       ▼
┌─────────────────────┐
│  Swagger UI React   │
│  (Renders UI)       │
└─────────────────────┘
```

### Components Breakdown

#### 1. API Route: `/api/openapi.json/route.ts`

**Purpose:** Serve OpenAPI spec as JSON

**Features:**
- ✅ Reads `openapi.yaml` from disk
- ✅ Converts YAML to JSON using `js-yaml`
- ✅ Dynamically updates server URLs
- ✅ Caches responses (1-hour TTL)
- ✅ CORS-enabled

**Code:**
```typescript
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Read YAML file
  const openapiYaml = readFileSync(openapiPath, "utf8");
  
  // Convert to JSON
  const openapiJson = yaml.load(openapiYaml);
  
  // Return with caching
  return NextResponse.json(openapiJson, {
    headers: { "Cache-Control": "public, max-age=3600" }
  });
}
```

#### 2. Page: `/api-docs/page.tsx`

**Purpose:** Server-rendered page wrapper

**Features:**
- ✅ SEO metadata
- ✅ Header with navigation
- ✅ Quick links bar
- ✅ Footer with info
- ✅ Responsive layout

**Code:**
```typescript
export default function ApiDocsPage() {
  return (
    <div className="min-h-screen">
      <header>...</header>
      <main>
        <SwaggerUI />
      </main>
      <footer>...</footer>
    </div>
  );
}
```

#### 3. Component: `SwaggerUI.tsx`

**Purpose:** Interactive Swagger UI client component

**Features:**
- ✅ Dynamic import (no SSR)
- ✅ JWT token management
- ✅ Request interceptor
- ✅ Custom styling
- ✅ localStorage persistence

**Code:**
```typescript
"use client";

const SwaggerUIComponent = dynamic(
  () => import("swagger-ui-react"),
  { ssr: false }
);

export function SwaggerUI() {
  const [authToken, setAuthToken] = useState("");
  
  const requestInterceptor = (req) => {
    if (authToken) {
      req.headers.Authorization = `Bearer ${authToken}`;
    }
    return req;
  };
  
  return (
    <SwaggerUIComponent
      url="/api/openapi.json"
      requestInterceptor={requestInterceptor}
    />
  );
}
```

---

## 🎨 Customization

### Changing Theme Colors

Edit `SwaggerUI.tsx`:

```typescript
// Change method colors
.swagger-ui .opblock.opblock-get {
  @apply border-l-4 border-l-blue-500;  // Change to any color
}

.swagger-ui .opblock.opblock-post {
  @apply border-l-4 border-l-green-500;
}
```

### Adding Custom Headers

Edit `route.ts`:

```typescript
return NextResponse.json(openapiJson, {
  headers: {
    "X-Custom-Header": "value",
    // ... other headers
  }
});
```

### Modifying Swagger UI Options

Edit `SwaggerUI.tsx`:

```typescript
<SwaggerUIComponent
  url="/api/openapi.json"
  docExpansion="full"          // "none" | "list" | "full"
  defaultModelsExpandDepth={2} // How deep to expand models
  displayRequestDuration={true} // Show request time
  filter={true}                // Enable search filter
  // ... more options
/>
```

**Available Options:**
- `docExpansion`: Control default expansion state
- `defaultModelsExpandDepth`: Model nesting depth
- `displayRequestDuration`: Show request timing
- `filter`: Enable/disable search
- `showExtensions`: Show vendor extensions
- `tryItOutEnabled`: Enable "Try it out" by default
- `persistAuthorization`: Remember auth state

### Custom CSS

Add to `SwaggerUI.tsx`:

```typescript
<style jsx global>{`
  .swagger-ui .topbar {
    background-color: #your-color;
  }
  
  .swagger-ui .btn.execute {
    background-color: #your-color;
  }
`}</style>
```

---

## 📊 OpenAPI Specification

### Location

```
docs/api/openapi.yaml
```

### Format

**OpenAPI 3.0.3** (YAML)

### Structure

```yaml
openapi: 3.0.3
info:
  title: Farmers Market Platform API
  version: 1.0.0
  description: |
    # 🌾 Farmers Market Platform API
    ...

servers:
  - url: https://farmersmarket.vercel.app
    description: Production server
  - url: http://localhost:3001
    description: Development server

tags:
  - name: Health
  - name: Authentication
  - name: Farms
  # ... more tags

paths:
  /api/health:
    get:
      tags: [Health]
      summary: Health check
      # ... endpoint details

components:
  schemas:
    Farm:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        # ... schema definition
```

### Adding New Endpoints

1. **Edit `openapi.yaml`:**

```yaml
paths:
  /api/new-endpoint:
    post:
      tags: [YourCategory]
      summary: Your endpoint summary
      description: Detailed description
      operationId: createSomething
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/YourSchema'
      responses:
        '201':
          description: Created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/YourResponseSchema'
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
```

2. **Define schemas** (if new):

```yaml
components:
  schemas:
    YourSchema:
      type: object
      required:
        - name
      properties:
        name:
          type: string
          minLength: 3
          example: "Example Name"
```

3. **Refresh Swagger UI** - Changes appear automatically

### Validation

Validate your OpenAPI spec:

```bash
# Install validator
npm install -g @apidevtools/swagger-cli

# Validate
swagger-cli validate docs/api/openapi.yaml
```

---

## 🔗 Related Documentation

- [API Overview](./README.md) - General API documentation
- [Error Codes](./ERROR_CODES.md) - Complete error reference
- [Authentication Guide](../onboarding/AUTHENTICATION.md) - Auth setup
- [Testing Guide](../testing/API_TESTING.md) - API testing strategies

---

## 📞 Support

### Issues

If you encounter issues with Swagger UI:

1. **Check this troubleshooting guide** (above)
2. **Search existing issues:** [GitHub Issues](https://github.com/yourusername/farmers-market/issues)
3. **Create new issue:** Include:
   - Browser and version
   - Error messages
   - Steps to reproduce
   - Screenshots

### Resources

- **Swagger UI Docs:** https://swagger.io/docs/open-source-tools/swagger-ui/
- **OpenAPI Spec:** https://spec.openapis.org/oas/v3.0.3
- **Next.js Docs:** https://nextjs.org/docs

---

## ✅ Production Deployment

### Vercel (Recommended)

Swagger UI automatically deploys with your app:

```bash
vercel deploy
```

Access at: `https://your-domain.vercel.app/api-docs`

### Environment Variables

No additional environment variables needed! 🎉

### Performance Considerations

1. **Caching:**
   - OpenAPI spec is cached (1 hour)
   - Static generation in production

2. **Bundle Size:**
   - Swagger UI is dynamically imported
   - Only loads when `/api-docs` is visited
   - ~200KB gzipped

3. **CDN:**
   - Serve static assets via CDN
   - Enable edge caching

### Security

**Production Recommendations:**

1. **Restrict Access:**
   ```typescript
   // Add middleware to /api-docs
   export const middleware = async (request: NextRequest) => {
     if (process.env.NODE_ENV === 'production') {
       // Add IP whitelist or basic auth
       return requireBasicAuth(request);
     }
     return NextResponse.next();
   };
   ```

2. **Disable in Production (Optional):**
   ```typescript
   // In api-docs/page.tsx
   if (process.env.NODE_ENV === 'production') {
     return notFound();
   }
   ```

3. **Rate Limiting:**
   - Apply rate limits to `/api-docs` endpoint

---

## 🎯 Best Practices

### For API Consumers

1. **Use Swagger UI for exploration** - Don't memorize endpoints
2. **Test in development first** - Avoid hitting production
3. **Copy cURL commands** - Easily replicate in other tools
4. **Check schema definitions** - Understand data structures
5. **Read error responses** - Learn proper error handling

### For API Developers

1. **Keep OpenAPI spec updated** - Update with code changes
2. **Add examples to all schemas** - Help users understand
3. **Document error cases** - Don't just show success
4. **Use clear descriptions** - Explain what endpoints do
5. **Version your API** - Use `/api/v1`, `/api/v2`, etc.

---

## 📈 Metrics & Analytics

### Usage Tracking (Optional)

Track Swagger UI usage:

```typescript
// In SwaggerUI.tsx
useEffect(() => {
  // Track page view
  analytics.track('swagger_ui_viewed');
}, []);
```

### Performance Monitoring

Monitor API response times via Swagger UI:

```typescript
const responseInterceptor = (res) => {
  const duration = res.headers.get('x-response-time');
  console.log(`Request took ${duration}ms`);
  return res;
};
```

---

## 🚀 Future Enhancements

### Planned Features

- [ ] **Dark Mode** - Theme toggle
- [ ] **Request History** - Save and replay requests
- [ ] **Collection Export** - Export to Postman/Insomnia
- [ ] **Code Generators** - Generate client SDKs
- [ ] **Mock Server** - Built-in API mocking
- [ ] **Webhooks Documentation** - Interactive webhook tester

### Contributing

Want to improve Swagger UI integration?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 Changelog

### Version 1.0.0 (January 10, 2025)

**Initial Release:**
- ✅ Interactive Swagger UI at `/api-docs`
- ✅ OpenAPI 3.0.3 specification
- ✅ 32+ documented endpoints
- ✅ JWT authentication support
- ✅ Custom Tailwind CSS theme
- ✅ Mobile-responsive design
- ✅ Production-ready deployment

---

**🌾 Happy API Exploring!**

For questions or feedback, reach out to the API team at `api@farmersmarket.com`
