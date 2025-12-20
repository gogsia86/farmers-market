# 🗺️ Farmers Market Platform - Complete Route Map

**Last Updated:** December 2024  
**Next.js Version:** 15 (App Router)  
**Architecture:** Route Groups with Role-Based Access

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Route Groups Explained](#route-groups-explained)
3. [Public Routes](#public-routes)
4. [Authentication Routes](#authentication-routes)
5. [Customer Routes](#customer-routes)
6. [Farmer Routes](#farmer-routes)
7. [Admin Routes](#admin-routes)
8. [Monitoring Routes](#monitoring-routes)
9. [Demo Routes](#demo-routes)
10. [Route Patterns & Conventions](#route-patterns--conventions)
11. [Authentication & Authorization](#authentication--authorization)
12. [API Endpoints](#api-endpoints)

---

## Overview

The Farmers Market Platform uses **Next.js 15 App Router** with route groups to organize pages by user role and access level. This document provides a complete reference for all routes in the application.

### Quick Stats

- **Total Pages:** 64
- **Route Groups:** 7
- **Public Routes:** 24
- **Protected Routes:** 40
- **Authentication Required:** 62%

---

## Route Groups Explained

Route groups are folder names wrapped in parentheses like `(public)` or `(admin)`. They organize routes without affecting the URL structure.

### Available Route Groups

| Group          | Purpose                 | Auth Required | Prefix        |
| -------------- | ----------------------- | ------------- | ------------- |
| `(public)`     | Marketing & info pages  | ❌ No         | None          |
| `(auth)`       | Login & signup          | ❌ No         | None          |
| `(customer)`   | Shopping & account      | ✅ Yes        | None          |
| `(farmer)`     | Farmer management       | ✅ Yes        | `/farmer`     |
| `(admin)`      | Platform administration | ✅ Yes        | `/admin`      |
| `(monitoring)` | System monitoring       | ✅ Yes        | `/monitoring` |
| `(demos)`      | Feature demos           | ❌ No         | `/demos`      |

---

## Public Routes

**Purpose:** Marketing, information, and general browsing (no login required)  
**Layout:** Header + Footer  
**Route Group:** `(public)`

### Homepage & Landing

```
/                           → Homepage (landing page)
/marketplace                → Marketplace landing page
/how-it-works               → Platform explanation
```

### Farm & Product Discovery (Read-Only)

```
/farms                      → Browse all farms (marketing view)
  └─ /[slug]                → Individual farm page (public profile)

/products                   → Browse all products (marketing view)
/categories                 → Product categories overview
/products/categories/[category] → Products by category
```

### Information & Support

```
/about                      → About the platform
/blog                       → Blog articles
/careers                    → Career opportunities
/contact                    → Contact form
/faq                        → Frequently asked questions
/help                       → Help center
/support                    → Customer support
/resources                  → Resource hub
  └─ /best-practices        → Farming best practices
```

### Legal & Compliance

```
/privacy                    → Privacy policy
/terms                      → Terms of service
/cookies                    → Cookie policy
```

### Other Public Pages

```
/register-farm              → Farm registration form
/markets                    → Local farmers markets
/search                     → Search results page
/offline                    → Offline fallback (PWA)
```

**Key Difference:** Public farm/product pages are **read-only marketing pages**. For shopping functionality (add to cart, checkout), users must be logged in and use the customer routes.

---

## Authentication Routes

**Purpose:** User authentication (login, signup, password reset)  
**Layout:** Centered auth layout (no header/footer)  
**Route Group:** `(auth)`

### Login Routes

```
/login                      → General user login
/admin/login                → Admin login (moved from /admin-login)
```

### Signup Routes

```
/signup                     → Customer signup
/signup?role=farmer         → Farmer signup (via query parameter)
```

### Password Management

```
/forgot-password            → Request password reset
/reset-password?token=xxx   → Reset password with token
/verify-email?token=xxx     → Verify email address
```

### Legacy Redirects

```
/admin-login                → Redirects to /admin/login (backward compatibility)
```

---

## Customer Routes

**Purpose:** Shopping, cart management, orders, and account settings  
**Layout:** CustomerHeader + Footer  
**Route Group:** `(customer)`  
**Authentication:** Required (CUSTOMER role)

### Shopping & Cart

```
/cart                       → Shopping cart management
/checkout                   → Checkout process
/orders                     → Order history list
```

### Customer Dashboard

```
/dashboard                  → Main customer dashboard
  ├─ /profile               → Profile management
  ├─ /orders                → Order management & history
  ├─ /favorites             → Saved favorite farms/products
  ├─ /addresses             → Shipping addresses
  └─ /reviews               → Product reviews
```

### Marketplace (Interactive Shopping)

```
/marketplace/farms          → Browse farms (with cart functionality)
  └─ /[slug]                → Farm page (add products to cart)

/marketplace/products       → Browse products (with filters & cart)
  └─ /[slug]                → Product detail (add to cart)
```

**Key Difference from Public Routes:**

- Public `/farms` → Marketing/information only
- Customer `/marketplace/farms` → Full shopping with add-to-cart

---

## Farmer Routes

**Purpose:** Farm & product management, order fulfillment, analytics  
**Layout:** Farmer sidebar layout  
**Route Group:** `(farmer)`  
**Authentication:** Required (FARMER role)  
**URL Prefix:** `/farmer/*`

### Dashboard & Overview

```
/farmer/dashboard           → Main farmer dashboard
/farmer/analytics           → Sales analytics & reports
/farmer/finances            → Financial overview
/farmer/payouts             → Payout management
```

### Product Management

```
/farmer/products            → Product list & management
  ├─ /new                   → Add new product
  └─ /[id]                  → Edit existing product
```

### Order Fulfillment

```
/farmer/orders              → Order list & management
  └─ /[id]                  → Individual order details
```

### Settings

```
/farmer/settings            → Farmer account settings
```

---

## Admin Routes

**Purpose:** Platform administration, user management, farm approval  
**Layout:** Admin sidebar layout  
**Route Group:** `(admin)`  
**Authentication:** Required (ADMIN role)  
**URL Prefix:** `/admin/*`

### Dashboard & Overview

```
/admin                      → Main admin dashboard
/admin/financial            → Platform financials
  ├─ /payouts               → Payout management
  └─ /transactions          → Transaction history
```

### Management Modules

```
/admin/farms                → Farm management & approval
/admin/products             → Product moderation
/admin/orders               → Order oversight
/admin/users                → User management
```

### Configuration

```
/admin/settings             → System settings & configuration
```

### Authentication

```
/admin/login                → Admin-specific login page
```

---

## Monitoring Routes

**Purpose:** System monitoring, health checks, performance metrics  
**Layout:** Monitoring-specific layout  
**Route Group:** `(monitoring)`  
**Authentication:** Required (ADMIN role)  
**URL Prefix:** `/monitoring/*`

```
/monitoring                 → System monitoring dashboard
```

---

## Demo Routes

**Purpose:** Feature demonstrations and UI/UX showcases  
**Layout:** Demo layout  
**Route Group:** `(demos)`  
**Authentication:** Not required  
**URL Prefix:** `/demos/*`

```
/demos                      → Demo hub (list all demos)
  ├─ /analytics             → Analytics demo
  ├─ /chat                  → Chat demo
  ├─ /inventory             → Inventory demo
  └─ /demo-test             → Test demo
```

---

## Route Patterns & Conventions

### Naming Conventions

#### URL Structure

- **Kebab-case:** All URLs use lowercase with hyphens: `/forgot-password`, `/best-practices`
- **Plural for collections:** `/farms`, `/products`, `/orders`
- **Singular for single items:** `/dashboard`, `/profile`, `/checkout`
- **Dynamic segments:** Use brackets: `/farms/[slug]`, `/orders/[id]`

#### File Naming

- **Page files:** Always named `page.tsx`
- **Layout files:** Always named `layout.tsx`
- **Loading states:** `loading.tsx`
- **Error boundaries:** `error.tsx`

### Route Group Prefixes

| User Type  | URL Prefix     | Example               |
| ---------- | -------------- | --------------------- |
| Public     | None           | `/farms`, `/products` |
| Customer   | None           | `/cart`, `/dashboard` |
| Farmer     | `/farmer/`     | `/farmer/dashboard`   |
| Admin      | `/admin/`      | `/admin/users`        |
| Monitoring | `/monitoring/` | `/monitoring`         |

**Why no customer prefix?**  
Customer routes have no prefix to keep URLs short and user-friendly. Common e-commerce pattern.

---

## Authentication & Authorization

### Access Control Levels

#### 1. Public Access (No Auth)

Routes accessible to everyone:

- All `(public)` routes
- All `(auth)` routes
- All `(demos)` routes

#### 2. Authenticated Access (Any User)

Must be logged in:

- All `(customer)` routes
- All `(farmer)` routes (+ FARMER role check)
- All `(admin)` routes (+ ADMIN role check)
- All `(monitoring)` routes (+ ADMIN role check)

#### 3. Role-Based Access

**Customer Role:**

```typescript
// Can access:
- /cart
- /checkout
- /dashboard
- /marketplace/*
- /orders
```

**Farmer Role:**

```typescript
// Can access:
- /farmer/*
- All customer routes
```

**Admin Role:**

```typescript
// Can access:
- /admin/*
- /monitoring/*
- All other routes
```

### Middleware Protection

Authentication is enforced by Next.js middleware at:

```
src/middleware.ts
```

Protected route patterns:

- `/dashboard*` → Requires CUSTOMER
- `/farmer*` → Requires FARMER
- `/admin*` → Requires ADMIN
- `/monitoring*` → Requires ADMIN
- `/cart` → Requires authentication
- `/checkout` → Requires authentication
- `/orders` → Requires authentication

---

## API Endpoints

### Authentication APIs

```
POST /api/auth/signin          → User login
POST /api/auth/signout         → User logout
POST /api/auth/signup          → User registration
POST /api/auth/forgot-password → Request password reset
POST /api/auth/reset-password  → Reset password with token
POST /api/auth/verify-email    → Verify email address
POST /api/auth/resend-verification → Resend verification email
```

### Farm APIs

```
GET    /api/farms              → List all farms
POST   /api/farms              → Create new farm
GET    /api/farms/[id]         → Get farm details
PUT    /api/farms/[id]         → Update farm
DELETE /api/farms/[id]         → Delete farm
```

### Product APIs

```
GET    /api/products           → List all products
POST   /api/products           → Create new product
GET    /api/products/[id]      → Get product details
PUT    /api/products/[id]      → Update product
DELETE /api/products/[id]      → Delete product
```

### Order APIs

```
GET    /api/orders             → List orders
POST   /api/orders             → Create new order
GET    /api/orders/[id]        → Get order details
PUT    /api/orders/[id]        → Update order status
```

### Cart APIs

```
GET    /api/cart               → Get cart contents
POST   /api/cart/add           → Add item to cart
PUT    /api/cart/update        → Update cart item
DELETE /api/cart/remove        → Remove from cart
```

### Checkout APIs

```
POST   /api/checkout/create-payment-intent → Create Stripe payment
POST   /api/checkout/confirm   → Confirm order
```

### Utility APIs

```
GET    /api/health             → Health check endpoint
POST   /api/geocoding          → Geocode addresses
GET    /api/search             → Search products/farms
```

---

## User Journey Examples

### Customer Shopping Journey

```
1. Browse Public Pages
   / → /farms → /farms/organic-valley-farm

2. Sign Up / Login
   /signup → /login

3. Shop for Products
   /marketplace/farms → /marketplace/products/[slug]

4. Add to Cart & Checkout
   /cart → /checkout

5. View Orders
   /dashboard/orders
```

### Farmer Onboarding Journey

```
1. Learn About Platform
   / → /how-it-works → /resources

2. Register Farm
   /register-farm → /signup?role=farmer

3. Login & Setup
   /login → /farmer/dashboard

4. Add Products
   /farmer/products/new

5. Manage Orders
   /farmer/orders
```

### Admin Management Journey

```
1. Admin Login
   /admin/login

2. Review Pending Farms
   /admin/farms?status=pending

3. Moderate Products
   /admin/products

4. Monitor System
   /monitoring
```

---

## Route Redirects

### Configured Redirects (next.config.js)

```javascript
// Old → New
/admin-login       → /admin/login       (permanent)
/shops             → /marketplace       (permanent)
/shop              → /marketplace       (permanent)
```

### Dynamic Redirects

**After Login:**

- Customer → `/dashboard`
- Farmer → `/farmer/dashboard`
- Admin → `/admin`

**After Signup:**

- Customer → `/dashboard`
- Farmer → `/farmer/dashboard?new=true`

**Unauthorized Access:**

- Not logged in → `/login?callbackUrl=[original-url]`
- Wrong role → `/login?error=unauthorized`

---

## Common Confusion Points

### 1. Public Farms vs Customer Marketplace Farms

**Question:** Why do we have both `/farms` and `/marketplace/farms`?

**Answer:**

- **`/farms` (Public):** Marketing pages showing farm information. Anyone can view, no login required. Read-only, no shopping features.
- **`/marketplace/farms` (Customer):** Interactive shopping experience. Must be logged in. Can add products to cart, view real-time inventory, etc.

### 2. Why No Customer URL Prefix?

**Question:** Why don't customer routes have `/customer/` prefix?

**Answer:**

- Shorter, more user-friendly URLs
- Standard e-commerce pattern (`/cart` vs `/customer/cart`)
- Middleware handles authentication automatically

### 3. Admin Login Location

**Question:** Why is admin login at `/admin/login` instead of `/admin-login`?

**Answer:**

- Consistency with other admin routes (`/admin/*`)
- Better organization in route groups
- Old `/admin-login` redirects for backward compatibility

---

## Sitemap Structure

```xml
<!-- Generated automatically by src/app/sitemap.ts -->
<urlset>
  <!-- Public Pages (highest priority) -->
  <url><loc>/</loc><priority>1.0</priority></url>
  <url><loc>/farms</loc><priority>0.9</priority></url>
  <url><loc>/products</loc><priority>0.9</priority></url>

  <!-- Information Pages -->
  <url><loc>/about</loc><priority>0.8</priority></url>
  <url><loc>/how-it-works</loc><priority>0.8</priority></url>

  <!-- Legal Pages -->
  <url><loc>/privacy</loc><priority>0.5</priority></url>
  <url><loc>/terms</loc><priority>0.5</priority></url>

  <!-- Protected routes excluded from public sitemap -->
</urlset>
```

---

## Testing Routes

### Manual Testing Checklist

```bash
# Public Routes (no login)
✓ / → Homepage loads
✓ /farms → Farm listing loads
✓ /products → Product listing loads
✓ /about → About page loads

# Auth Routes
✓ /login → Login form appears
✓ /signup → Signup form appears
✓ /forgot-password → Reset form appears

# Customer Routes (requires login)
✓ /cart → Redirects to login if not authenticated
✓ /dashboard → Shows customer dashboard when logged in

# Farmer Routes (requires FARMER role)
✓ /farmer/dashboard → Accessible to farmers only
✓ /farmer/products → Product management loads

# Admin Routes (requires ADMIN role)
✓ /admin → Accessible to admins only
✓ /admin/farms → Farm management loads
```

### Automated Testing

```typescript
// tests/routes/navigation.test.ts
describe("Route Navigation", () => {
  test("public routes are accessible", async () => {
    // Test public routes
  });

  test("protected routes redirect to login", async () => {
    // Test authentication
  });

  test("role-based routes check permissions", async () => {
    // Test authorization
  });
});
```

---

## Troubleshooting

### 404 Errors

**Symptom:** Page not found error

**Common Causes:**

1. ❌ Wrong URL spelling (use kebab-case)
2. ❌ Missing `page.tsx` file in route folder
3. ❌ Route group name in URL (`/public/farms` instead of `/farms`)

### Redirect Loops

**Symptom:** Page keeps redirecting

**Common Causes:**

1. ❌ Middleware redirect configuration conflict
2. ❌ Session expired but trying to access protected route
3. ❌ Missing `callbackUrl` parameter

### Access Denied

**Symptom:** User logged in but can't access page

**Common Causes:**

1. ❌ Wrong role (customer trying to access `/farmer/*`)
2. ❌ Middleware not checking role correctly
3. ❌ Session not updated after role change

---

## Future Considerations

### Planned Routes (Not Yet Implemented)

```
/farmer/setup               → Initial farm setup wizard
/admin/reports              → Advanced reporting
/api/webhooks/*             → Webhook endpoints
/customer/subscriptions     → Subscription management
```

### Internationalization (i18n)

Future route structure with language support:

```
/en/farms                   → English version
/es/farms                   → Spanish version
/fr/farms                   → French version
```

---

## Quick Reference

### File Locations

| Item               | Location               |
| ------------------ | ---------------------- |
| Route files        | `src/app/`             |
| Layouts            | `src/app/*/layout.tsx` |
| Middleware         | `src/middleware.ts`    |
| API routes         | `src/app/api/`         |
| This documentation | `docs/ROUTE_MAP.md`    |

### Related Documentation

- **Divine Core Principles:** `.github/instructions/01_DIVINE_CORE_PRINCIPLES.instructions.md`
- **Next.js Implementation:** `.github/instructions/04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md`
- **Project Rules:** `.cursorrules`
- **Route Analysis:** `WEBSITE_PAGES_ANALYSIS.md`
- **Fix Guide:** `SYNCHRONIZATION_FIXES_REQUIRED.md`

---

## Changelog

### December 2024

- ✅ Moved admin login from `/admin-login` to `/admin/login`
- ✅ Added `/forgot-password`, `/reset-password`, `/verify-email` pages
- ✅ Created comprehensive route documentation
- ✅ Removed broken Navigation.tsx component

---

**Document Maintained By:** Development Team  
**Last Review:** December 2024  
**Status:** ✅ Complete and Up-to-Date

🌾 **May your routes be clear and your navigation divine!** ✨
