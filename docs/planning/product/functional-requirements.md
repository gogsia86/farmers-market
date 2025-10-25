# 🔧 Functional Requirements Specification - Farmers Market Platform

**Document Owner**: Product & Engineering Team
**Date**: October 21, 2025
**Status**: Active
**Version**: 1.0

---

## 📋 Executive Summary

This document provides detailed technical specifications, API contracts, acceptance criteria, and edge case handling for all 34 features of the Farmers Market platform. It serves as the authoritative reference for implementation, testing, and validation.

**Purpose:**

- Define precise technical requirements for each feature
- Establish API contracts and data models
- Document acceptance criteria for testing
- Identify and handle edge cases
- Guide implementation and QA processes

**Feature Status:**

- ✅ **Completed**: 26/34 features (76%)
- 🔄 **In Development**: 0/34 features (0%)
- 📋 **Planned**: 8/34 features (24%)

---

## 🎯 Feature Categories

### Core Platform (10 features)

1. ✅ User Authentication & Authorization
2. ✅ User Registration (Consumer & Farmer)
3. ✅ User Profile Management
4. ✅ Password Reset
5. ✅ Session Management
6. ✅ Role-Based Access Control (RBAC)
7. 📋 Admin Dashboard (planned)
8. 📋 User Management (Admin) (planned)
9. 📋 Analytics & Reporting (Admin) (planned)
10. ✅ Search & Filtering

### Farm Management (6 features)

1. ✅ Farm Profile Creation
2. ✅ Farm Profile Editing
3. ✅ Farm Directory/Listing
4. ✅ Farm Detail View
5. ✅ Farmer Dashboard
6. 📋 Farm Verification (Admin) (planned)

### Product Management (6 features)

1. ✅ Product Listing (Farmer)
2. ✅ Product Editing
3. ✅ Product Catalog (Consumer)
4. ✅ Product Detail View
5. ✅ Product Categories
6. ✅ Inventory Management

### E-commerce (8 features)

1. ✅ Shopping Cart
2. ✅ Checkout Flow
3. ✅ Payment Processing (Stripe)
4. ✅ Order Creation
5. ✅ Order Management (Farmer)
6. ✅ Order History (Consumer)
7. ✅ Order Status Tracking
8. ✅ Multi-Farm Orders

### Mobile & Progressive (2 features)

1. 📋 Progressive Web App (PWA) (planned)
2. 📋 Push Notifications (planned)

### Advanced Features (2 features)

1. ⏳ Reviews & Ratings (future)
2. ⏳ Messaging System (future)

---

## 🔐 FR-001: User Authentication & Authorization

### Overview

Secure authentication system using NextAuth.js with JWT tokens and session management.

### Technical Specifications

**Authentication Methods:**

- Email/Password (primary)
- OAuth providers (future: Google, Facebook)

**Security Requirements:**

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 30-day expiration
- HTTP-only cookies for token storage
- CSRF protection enabled
- Rate limiting: 5 failed attempts = 15-minute lockout

### API Contracts

#### POST /api/auth/signin

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (Success - 200):**

```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Farmer",
    "role": "FARMER",
    "avatar": "https://...",
    "emailVerified": true
  },
  "token": "eyJhbGc...",
  "expiresAt": "2025-11-20T12:00:00Z"
}
```

**Response (Error - 401):**

```json
{
  "error": "Invalid credentials",
  "code": "INVALID_CREDENTIALS"
}
```

**Response (Rate Limited - 429):**

```json
{
  "error": "Too many failed attempts",
  "code": "RATE_LIMITED",
  "retryAfter": 900
}
```

#### POST /api/auth/signout

**Request:** (Authenticated)

```json
{}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

#### GET /api/auth/session

**Response (Authenticated - 200):**

```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Farmer",
    "role": "FARMER"
  },
  "expires": "2025-11-20T12:00:00Z"
}
```

**Response (Unauthenticated - 401):**

```json
{
  "error": "Not authenticated",
  "code": "UNAUTHENTICATED"
}
```

### Data Models

**User Table (Prisma Schema):**

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String    // bcrypt hashed
  name          String?
  role          Role      @default(CONSUMER)
  avatar        String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  farm          Farm?
  orders        Order[]
  sessions      Session[]

  @@index([email])
  @@index([role])
}

enum Role {
  CONSUMER
  FARMER
  ADMIN
}
```

### Acceptance Criteria

**AC-001-01:** User can log in with valid email/password

- ✅ Given valid credentials, user receives JWT token
- ✅ User redirected to appropriate dashboard based on role
- ✅ Session persists across page refreshes

**AC-001-02:** Invalid credentials are rejected

- ✅ Wrong password returns 401 error
- ✅ Non-existent email returns 401 error
- ✅ Generic error message (no user enumeration)

**AC-001-03:** Rate limiting prevents brute force

- ✅ 5 failed attempts locks account for 15 minutes
- ✅ Lockout notification shown to user
- ✅ Successful login resets failed attempt counter

**AC-001-04:** Session management works correctly

- ✅ Sessions expire after 30 days of inactivity
- ✅ User can manually log out (session deleted)
- ✅ Multiple concurrent sessions supported

### Edge Cases

**EC-001-01:** Concurrent login attempts

- **Scenario:** User submits login form multiple times rapidly
- **Handling:** Debounce login button, ignore duplicate requests
- **Expected:** Only first request processed

**EC-001-02:** Token expiration during active session

- **Scenario:** User's token expires while actively using platform
- **Handling:** Redirect to login with "session expired" message
- **Expected:** Graceful logout, preserve intended destination

**EC-001-03:** Password with special characters

- **Scenario:** Password contains emojis, Unicode, or special chars
- **Handling:** Allow all UTF-8 characters, validate length only
- **Expected:** Password accepted if 8-72 characters

**EC-001-04:** Email case sensitivity

- **Scenario:** User registers as "John@Example.com", logs in as "john@example.com"
- **Handling:** Normalize email to lowercase on registration and login
- **Expected:** Login succeeds regardless of case

---

## 📝 FR-002: User Registration

### Overview

Self-service registration for consumers and farmers with role selection.

### Technical Specifications

**Registration Requirements:**

- Email: Valid format, unique in system
- Password: 8-72 characters, no complexity requirements (passphrase-friendly)
- Name: Optional on registration, required for checkout
- Role: Consumer (default) or Farmer

**Validation Rules:**

- Email: RFC 5322 compliant
- Password: Min 8 chars, max 72 chars (bcrypt limit)
- Name: Max 255 characters
- Role: Must be 'CONSUMER' or 'FARMER'

### API Contracts

#### POST /api/auth/register

**Request:**

```json
{
  "email": "newuser@example.com",
  "password": "MySecurePassword123",
  "name": "Jane Doe",
  "role": "CONSUMER"
}
```

**Response (Success - 201):**

```json
{
  "user": {
    "id": "usr_xyz789",
    "email": "newuser@example.com",
    "name": "Jane Doe",
    "role": "CONSUMER",
    "emailVerified": false
  },
  "token": "eyJhbGc...",
  "message": "Registration successful"
}
```

**Response (Email Exists - 409):**

```json
{
  "error": "Email already registered",
  "code": "EMAIL_EXISTS",
  "field": "email"
}
```

**Response (Validation Error - 400):**

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "fields": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

### Acceptance Criteria

**AC-002-01:** Consumer registration creates account

- ✅ Valid data creates user with CONSUMER role
- ✅ Password is hashed before storage
- ✅ User automatically logged in after registration
- ✅ Welcome email sent (future)

**AC-002-02:** Farmer registration creates account + farm profile

- ✅ Valid data creates user with FARMER role
- ✅ Empty farm profile automatically created
- ✅ User redirected to farm profile completion
- ✅ Onboarding flow initiated

**AC-002-03:** Duplicate email prevents registration

- ✅ Existing email returns 409 error
- ✅ Error message indicates email is taken
- ✅ Suggests login or password reset

**AC-002-04:** Validation errors are descriptive

- ✅ Invalid email format shows specific error
- ✅ Short password shows specific error
- ✅ All field errors returned simultaneously

### Edge Cases

**EC-002-01:** Registration during existing session

- **Scenario:** Logged-in user navigates to registration page
- **Handling:** Redirect to dashboard with "already logged in" message
- **Expected:** No duplicate account created

**EC-002-02:** Rapid duplicate registrations

- **Scenario:** User submits registration form multiple times
- **Handling:** Idempotency check based on email
- **Expected:** Only one account created, subsequent requests return existing user

**EC-002-03:** Email with plus addressing

- **Scenario:** User registers "user+farmers@example.com"
- **Handling:** Treat as separate email, allow registration
- **Expected:** Registration succeeds, separate account created

---

## 🌾 FR-011: Farm Profile Creation

### Overview

Farmers can create and customize their farm profile visible to consumers.

### Technical Specifications

**Farm Profile Fields:**

- **Required:** Farm name, location (address)
- **Optional:** Description, logo, cover image, certifications, delivery options, contact info

**Image Handling:**

- Upload via Vercel Blob Storage
- Max file size: 5MB per image
- Accepted formats: JPEG, PNG, WebP
- Automatic optimization and resizing

### API Contracts

#### POST /api/farms

**Request:** (Authenticated as FARMER)

```json
{
  "name": "Sunshine Valley Farm",
  "description": "Family-owned organic farm growing fresh vegetables since 1985",
  "address": "123 Farm Road, Ruralville, CA 95000",
  "coordinates": {
    "lat": 37.7749,
    "lng": -122.4194
  },
  "certifications": ["USDA Organic", "Certified Naturally Grown"],
  "deliveryOptions": {
    "pickup": true,
    "delivery": true,
    "deliveryRadius": 25
  },
  "contact": {
    "email": "hello@sunshinevalley.com",
    "phone": "(555) 123-4567",
    "website": "https://sunshinevalley.com"
  }
}
```

**Response (Success - 201):**

```json
{
  "farm": {
    "id": "farm_abc123",
    "slug": "sunshine-valley-farm",
    "name": "Sunshine Valley Farm",
    "description": "Family-owned organic farm...",
    "address": "123 Farm Road, Ruralville, CA 95000",
    "coordinates": {
      "lat": 37.7749,
      "lng": -122.4194
    },
    "certifications": ["USDA Organic", "Certified Naturally Grown"],
    "deliveryOptions": {
      "pickup": true,
      "delivery": true,
      "deliveryRadius": 25
    },
    "contact": {
      "email": "hello@sunshinevalley.com",
      "phone": "(555) 123-4567",
      "website": "https://sunshinevalley.com"
    },
    "status": "ACTIVE",
    "createdAt": "2025-10-21T10:00:00Z",
    "updatedAt": "2025-10-21T10:00:00Z"
  }
}
```

**Response (Farmer Already Has Farm - 409):**

```json
{
  "error": "Farm already exists for this user",
  "code": "FARM_EXISTS",
  "existingFarmId": "farm_abc123"
}
```

#### PATCH /api/farms/[id]

**Request:** (Authenticated as farm owner)

```json
{
  "description": "Updated farm description",
  "certifications": [
    "USDA Organic",
    "Certified Naturally Grown",
    "Demeter Biodynamic"
  ]
}
```

**Response (Success - 200):**

```json
{
  "farm": {
    "id": "farm_abc123",
    "slug": "sunshine-valley-farm",
    "description": "Updated farm description",
    "certifications": [
      "USDA Organic",
      "Certified Naturally Grown",
      "Demeter Biodynamic"
    ],
    "updatedAt": "2025-10-21T11:00:00Z"
  }
}
```

### Data Models

**Farm Table (Prisma Schema):**

```prisma
model Farm {
  id            String   @id @default(cuid())
  slug          String   @unique
  name          String
  description   String?  @db.Text

  // Location
  address       String
  latitude      Float
  longitude     Float

  // Media
  logo          String?
  coverImage    String?
  images        String[] // Array of image URLs

  // Certifications & Practices
  certifications String[]
  practices     String[] // e.g., "No-till", "Rotational Grazing"

  // Delivery Options
  pickupEnabled Boolean  @default(true)
  pickupLocation String?
  deliveryEnabled Boolean @default(false)
  deliveryRadius Int?    // in miles

  // Contact
  email         String?
  phone         String?
  website       String?
  socialMedia   Json?    // { instagram: "...", facebook: "..." }

  // Status
  status        FarmStatus @default(ACTIVE)

  // Relations
  owner         User     @relation(fields: [ownerId], references: [id])
  ownerId       String   @unique
  products      Product[]
  orders        Order[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([slug])
  @@index([status])
  @@index([latitude, longitude])
  @@fulltext([name, description])
}

enum FarmStatus {
  ACTIVE
  PENDING_VERIFICATION
  SUSPENDED
  INACTIVE
}
```

### Acceptance Criteria

**AC-011-01:** Farmer can create farm profile

- ✅ Required fields validated before submission
- ✅ Unique slug generated from farm name
- ✅ Geocoding converts address to coordinates
- ✅ Farm immediately visible in directory

**AC-011-02:** Farm profile images upload successfully

- ✅ Images uploaded to Vercel Blob Storage
- ✅ Images optimized automatically
- ✅ Thumbnails generated for cards/lists
- ✅ Full-size images for detail pages

**AC-011-03:** Farmer can only create one farm

- ✅ Attempting to create second farm returns error
- ✅ User redirected to edit existing farm
- ✅ Clear messaging about one-farm limit

**AC-011-04:** Farm profile is public immediately

- ✅ New farm appears in farm directory
- ✅ Searchable by name, location, certifications
- ✅ Visible to all consumers

### Edge Cases

**EC-011-01:** Duplicate farm name

- **Scenario:** Multiple farms with name "Smith Family Farm"
- **Handling:** Append location to slug (smith-family-farm-ca, smith-family-farm-tx)
- **Expected:** Unique slugs, both farms accessible

**EC-011-02:** Invalid coordinates

- **Scenario:** Address cannot be geocoded
- **Handling:** Allow manual coordinate entry, show map picker
- **Expected:** Farm can still be created with approximate location

**EC-011-03:** Very long farm description

- **Scenario:** Farmer enters 10,000+ character description
- **Handling:** Truncate display to 500 chars, show "Read more" link
- **Expected:** Full description accessible, card view clean

**EC-011-04:** Expired image URLs

- **Scenario:** Vercel Blob URLs expire or become invalid
- **Handling:** Graceful fallback to placeholder image
- **Expected:** Farm still displays, placeholder image shown

---

## 🥕 FR-017: Product Listing (Farmer)

### Overview

Farmers can list products with details, pricing, inventory, and images.

### Technical Specifications

**Product Fields:**

- **Required:** Name, price, unit, category, stock status
- **Optional:** Description, images (up to 5), quantity available, SKU

**Pricing:**

- Stored as Decimal(10,2) for precision
- Display formatted with 2 decimal places
- Currency: USD (hardcoded, multi-currency future)

**Inventory:**

- Boolean: inStock (true/false)
- Optional: quantity (integer)
- Auto-update on orders (future)

### API Contracts

#### POST /api/products

**Request:** (Authenticated as FARMER)

```json
{
  "name": "Organic Heirloom Tomatoes",
  "description": "Sweet and juicy heirloom tomatoes in a variety of colors",
  "price": 5.99,
  "unit": "lb",
  "categoryId": "cat_vegetables",
  "inStock": true,
  "quantity": 50,
  "images": [
    "https://blob.vercel-storage.com/tomato1.jpg",
    "https://blob.vercel-storage.com/tomato2.jpg"
  ],
  "tags": ["organic", "heirloom", "local"],
  "seasonal": true
}
```

**Response (Success - 201):**

```json
{
  "product": {
    "id": "prod_xyz789",
    "slug": "organic-heirloom-tomatoes",
    "name": "Organic Heirloom Tomatoes",
    "description": "Sweet and juicy heirloom tomatoes...",
    "price": 5.99,
    "unit": "lb",
    "category": {
      "id": "cat_vegetables",
      "name": "Vegetables",
      "slug": "vegetables"
    },
    "inStock": true,
    "quantity": 50,
    "images": [...],
    "tags": ["organic", "heirloom", "local"],
    "seasonal": true,
    "farm": {
      "id": "farm_abc123",
      "name": "Sunshine Valley Farm",
      "slug": "sunshine-valley-farm"
    },
    "createdAt": "2025-10-21T12:00:00Z",
    "updatedAt": "2025-10-21T12:00:00Z"
  }
}
```

#### PATCH /api/products/[id]

**Request:** (Authenticated as product owner)

```json
{
  "price": 6.49,
  "quantity": 35,
  "inStock": true
}
```

**Response (Success - 200):**

```json
{
  "product": {
    "id": "prod_xyz789",
    "price": 6.49,
    "quantity": 35,
    "inStock": true,
    "updatedAt": "2025-10-21T13:00:00Z"
  }
}
```

#### DELETE /api/products/[id]

**Request:** (Authenticated as product owner)

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Response (Product Has Orders - 409):**

```json
{
  "error": "Cannot delete product with existing orders",
  "code": "PRODUCT_HAS_ORDERS",
  "orderCount": 5
}
```

### Data Models

**Product Table (Prisma Schema):**

```prisma
model Product {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String?  @db.Text

  // Pricing
  price       Decimal  @db.Decimal(10, 2)
  unit        String   // "lb", "each", "bunch", "dozen", "pint", "quart"

  // Inventory
  inStock     Boolean  @default(true)
  quantity    Int?     // null = unlimited

  // Media
  images      String[] // Array of image URLs

  // Categorization
  category    Category @relation(fields: [categoryId], references: [id])
  categoryId  String
  tags        String[]
  seasonal    Boolean  @default(false)
  organic     Boolean  @default(false)

  // Relations
  farm        Farm     @relation(fields: [farmId], references: [id])
  farmId      String
  orderItems  OrderItem[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([farmId])
  @@index([categoryId])
  @@index([inStock])
  @@index([slug])
  @@fulltext([name, description])
}

model Category {
  id          String    @id @default(cuid())
  slug        String    @unique
  name        String
  description String?
  icon        String?   // emoji or icon name
  products    Product[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### Acceptance Criteria

**AC-017-01:** Farmer can create product

- ✅ All required fields validated
- ✅ Unique slug generated from product name
- ✅ Product immediately visible in catalog
- ✅ Associated with farmer's farm

**AC-017-02:** Product images upload and display

- ✅ Up to 5 images can be uploaded
- ✅ Images optimized for web display
- ✅ First image used as primary/thumbnail
- ✅ Image gallery on product detail page

**AC-017-03:** Inventory management works

- ✅ Setting inStock=false hides from catalog
- ✅ Quantity decreases when orders placed (future)
- ✅ Low stock alert at 10 units (future)
- ✅ Out of stock prevents add to cart

**AC-017-04:** Product editing updates in real-time

- ✅ Price changes reflect immediately
- ✅ Stock status updates immediately
- ✅ Description/image changes persist
- ✅ Product stays in same category

### Edge Cases

**EC-017-01:** Product with zero price

- **Scenario:** Farmer sets price to $0.00 (free sample)
- **Handling:** Allow $0.00 prices, show "FREE" in UI
- **Expected:** Product can be added to cart, no payment required

**EC-017-02:** Negative quantity

- **Scenario:** Farmer enters quantity as -5
- **Handling:** Validate quantity >= 0, show error
- **Expected:** Product not created, validation error shown

**EC-017-03:** Product deleted with active cart items

- **Scenario:** Product in consumers' carts, farmer deletes it
- **Handling:** Mark product as unavailable, notify users in cart
- **Expected:** Product removed from carts, users notified

**EC-017-04:** Duplicate product names on same farm

- **Scenario:** Farmer lists "Tomatoes" twice
- **Handling:** Allow duplicates, append ID to slug (tomatoes-1, tomatoes-2)
- **Expected:** Both products accessible, unique URLs

---

## 🛒 FR-023: Shopping Cart

### Overview

Client-side shopping cart with persistent storage and multi-farm order support.

### Technical Specifications

**Cart Storage:**

- Client-side: localStorage (anonymous users)
- Server-side: Database (authenticated users)
- Merge on login: Combine localStorage + DB carts

**Cart Structure:**

```typescript
interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  updatedAt: string;
}

interface CartItem {
  productId: string;
  productName: string;
  productSlug: string;
  farmId: string;
  farmName: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
  inStock: boolean;
  subtotal: number; // price * quantity
}
```

**Cart Operations:**

- Add item (quantity default = 1)
- Update quantity (1-99 range)
- Remove item
- Clear cart
- Get cart summary

### API Contracts

#### GET /api/cart

**Response (Success - 200):**

```json
{
  "cart": {
    "items": [
      {
        "productId": "prod_abc123",
        "productName": "Organic Tomatoes",
        "productSlug": "organic-tomatoes",
        "farmId": "farm_xyz789",
        "farmName": "Sunshine Valley Farm",
        "price": 5.99,
        "quantity": 2,
        "unit": "lb",
        "image": "https://...",
        "inStock": true,
        "subtotal": 11.98
      }
    ],
    "itemCount": 2,
    "subtotal": 11.98,
    "tax": 0.96,
    "total": 12.94,
    "updatedAt": "2025-10-21T14:00:00Z"
  }
}
```

#### POST /api/cart/items

**Request:**

```json
{
  "productId": "prod_abc123",
  "quantity": 2
}
```

**Response (Success - 200):**

```json
{
  "cart": {
    "items": [...],
    "itemCount": 3,
    "subtotal": 17.97,
    "total": 18.93
  },
  "addedItem": {
    "productId": "prod_abc123",
    "productName": "Organic Tomatoes",
    "quantity": 2
  }
}
```

**Response (Product Out of Stock - 409):**

```json
{
  "error": "Product is currently out of stock",
  "code": "OUT_OF_STOCK",
  "productId": "prod_abc123"
}
```

#### PATCH /api/cart/items/[productId]

**Request:**

```json
{
  "quantity": 5
}
```

**Response (Success - 200):**

```json
{
  "cart": {
    "items": [...],
    "itemCount": 5,
    "subtotal": 29.95,
    "total": 31.45
  }
}
```

#### DELETE /api/cart/items/[productId]

**Response (Success - 200):**

```json
{
  "cart": {
    "items": [...],
    "itemCount": 2,
    "subtotal": 11.98,
    "total": 12.94
  },
  "removedItem": {
    "productId": "prod_abc123"
  }
}
```

#### DELETE /api/cart

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

### Acceptance Criteria

**AC-023-01:** Items can be added to cart

- ✅ Add button adds product with quantity 1
- ✅ Adding same product increases quantity
- ✅ Cart badge updates with item count
- ✅ Success notification shown

**AC-023-02:** Quantity can be updated

- ✅ Plus/minus buttons adjust quantity
- ✅ Direct input updates quantity
- ✅ Min quantity = 1, max quantity = 99
- ✅ Subtotal recalculates automatically

**AC-023-03:** Items can be removed

- ✅ Remove button deletes item
- ✅ Confirmation prompt shown (future)
- ✅ Cart updates immediately
- ✅ Empty cart shows empty state

**AC-023-04:** Cart persists across sessions

- ✅ Anonymous: Cart saved to localStorage
- ✅ Authenticated: Cart saved to database
- ✅ On login: Merge localStorage + DB carts
- ✅ Cart survives page refresh

**AC-023-05:** Multi-farm orders supported

- ✅ Items from different farms in one cart
- ✅ Items grouped by farm in UI
- ✅ Separate subtotals per farm shown
- ✅ Single checkout creates multiple orders

### Edge Cases

**EC-023-01:** Product price changes while in cart

- **Scenario:** Price increases from $5.99 to $6.99 after adding to cart
- **Handling:** Show price change alert in cart, update subtotal
- **Expected:** User sees old vs new price, can proceed or remove

**EC-023-02:** Product becomes out of stock in cart

- **Scenario:** Last unit sold, product in user's cart
- **Handling:** Mark item as unavailable, disable checkout
- **Expected:** User notified, cannot checkout until removed

**EC-023-03:** Quantity exceeds available stock

- **Scenario:** User has 10 items, only 5 available
- **Handling:** Reduce quantity to available, notify user
- **Expected:** Quantity adjusted, user can proceed

**EC-023-04:** Farm becomes inactive

- **Scenario:** Farm suspended, products in carts
- **Handling:** Mark all farm products as unavailable
- **Expected:** Items cannot be checked out, removal suggested

**EC-023-05:** localStorage quota exceeded

- **Scenario:** Cart data exceeds 5MB localStorage limit
- **Handling:** Prompt user to log in, move to server storage
- **Expected:** Cart functionality maintained, data preserved

---

## 💳 FR-024: Checkout Flow

### Overview

Multi-step checkout process with contact info, delivery options, and payment.

### Technical Specifications

**Checkout Steps:**

1. Contact Information (name, email, phone)
2. Delivery Options (pickup or delivery, date/time)
3. Payment (Stripe integration)
4. Confirmation (order number, summary)

**Payment Processing:**

- Stripe Checkout Session
- Redirect to Stripe hosted page
- Webhook handles payment success/failure
- Order created on successful payment

### API Contracts

#### POST /api/checkout/session

**Request:** (Authenticated)

```json
{
  "contactInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "(555) 123-4567"
  },
  "deliveryOption": "PICKUP",
  "deliveryDetails": {
    "farmId": "farm_abc123",
    "pickupDate": "2025-10-25",
    "pickupTime": "14:00"
  },
  "items": [
    {
      "productId": "prod_xyz789",
      "quantity": 2,
      "price": 5.99
    }
  ]
}
```

**Response (Success - 200):**

```json
{
  "sessionId": "cs_test_a1b2c3...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3...",
  "orderId": "ord_temp_123" // Temporary, finalized on webhook
}
```

**Response (Cart Empty - 400):**

```json
{
  "error": "Cannot checkout with empty cart",
  "code": "EMPTY_CART"
}
```

**Response (Product Unavailable - 409):**

```json
{
  "error": "Some items are no longer available",
  "code": "ITEMS_UNAVAILABLE",
  "unavailableItems": [
    {
      "productId": "prod_xyz789",
      "productName": "Organic Tomatoes",
      "reason": "out_of_stock"
    }
  ]
}
```

#### Webhook: POST /api/webhooks/stripe

**Stripe Event:** `checkout.session.completed`

**Action:**

- Verify webhook signature
- Create Order in database
- Send order confirmation email
- Clear user's cart
- Update product inventory (future)

### Data Models

**Order Table (Prisma Schema):**

```prisma
model Order {
  id                String      @id @default(cuid())
  orderNumber       String      @unique // e.g., "FM-2025-10-001"

  // Customer
  customer          User        @relation(fields: [customerId], references: [id])
  customerId        String
  customerName      String
  customerEmail     String
  customerPhone     String?

  // Delivery
  deliveryOption    DeliveryOption
  deliveryDate      DateTime?
  deliveryTime      String?
  deliveryAddress   String?
  pickupLocation    String?

  // Farm
  farm              Farm        @relation(fields: [farmId], references: [id])
  farmId            String

  // Items
  items             OrderItem[]

  // Pricing
  subtotal          Decimal     @db.Decimal(10, 2)
  tax               Decimal     @db.Decimal(10, 2)
  total             Decimal     @db.Decimal(10, 2)

  // Payment
  stripeSessionId   String?     @unique
  stripePaymentId   String?
  paymentStatus     PaymentStatus @default(PENDING)

  // Status
  status            OrderStatus @default(PENDING)

  // Timestamps
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  completedAt       DateTime?

  @@index([customerId])
  @@index([farmId])
  @@index([status])
  @@index([orderNumber])
}

model OrderItem {
  id          String   @id @default(cuid())

  order       Order    @relation(fields: [orderId], references: [id])
  orderId     String

  product     Product  @relation(fields: [productId], references: [id])
  productId   String

  productName String   // Snapshot at time of order
  quantity    Int
  unitPrice   Decimal  @db.Decimal(10, 2)
  subtotal    Decimal  @db.Decimal(10, 2)

  @@index([orderId])
  @@index([productId])
}

enum DeliveryOption {
  PICKUP
  DELIVERY
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  READY
  COMPLETED
  CANCELLED
}
```

### Acceptance Criteria

**AC-024-01:** User can complete checkout flow

- ✅ Step 1: Contact info collected and validated
- ✅ Step 2: Delivery option selected
- ✅ Step 3: Redirected to Stripe payment
- ✅ Step 4: Order confirmation shown on success

**AC-024-02:** Stripe payment integration works

- ✅ Stripe Checkout Session created
- ✅ User redirected to Stripe hosted page
- ✅ Webhook receives payment success event
- ✅ Order finalized in database

**AC-024-03:** Order confirmation email sent

- ✅ Email sent to customer email
- ✅ Includes order number, items, total
- ✅ Includes delivery details
- ✅ Includes farm contact info

**AC-024-04:** Cart cleared after successful order

- ✅ Ordered items removed from cart
- ✅ Cart badge resets to 0
- ✅ Cart page shows empty state

**AC-024-05:** Failed payment handled gracefully

- ✅ User returned to cart with error message
- ✅ Cart contents preserved
- ✅ User can retry checkout
- ✅ No partial orders created

### Edge Cases

**EC-024-01:** User closes browser during checkout

- **Scenario:** User at Stripe page, closes tab before paying
- **Handling:** Stripe session expires after 24 hours, no order created
- **Expected:** Cart contents preserved, user can retry

**EC-024-02:** Webhook arrives before redirect

- **Scenario:** Webhook processes payment before user returns
- **Handling:** Order already created, redirect shows confirmation
- **Expected:** User sees completed order, no duplicate

**EC-024-03:** Multiple orders from same cart

- **Scenario:** User clicks checkout multiple times
- **Handling:** Idempotency check, reuse existing session
- **Expected:** Only one Stripe session created

**EC-024-04:** Product price changes during checkout

- **Scenario:** Price updated between cart and payment
- **Handling:** Use snapshot price from cart at session creation
- **Expected:** User pays price shown in cart, not new price

---

## 📊 FR-029: Order Status Tracking

### Overview

Real-time order status tracking for consumers and farmers.

### Technical Specifications

**Order Statuses:**

- PENDING: Order placed, awaiting farmer confirmation
- CONFIRMED: Farmer accepted order
- PROCESSING: Farmer preparing order
- READY: Ready for pickup / Out for delivery
- COMPLETED: Order fulfilled
- CANCELLED: Order cancelled

**Status Transitions:**

```
PENDING → CONFIRMED → PROCESSING → READY → COMPLETED
    ↓
CANCELLED (from any status)
```

### API Contracts

#### GET /api/orders/[id]

**Response (Success - 200):**

```json
{
  "order": {
    "id": "ord_abc123",
    "orderNumber": "FM-2025-10-001",
    "status": "PROCESSING",
    "customer": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "(555) 123-4567"
    },
    "farm": {
      "id": "farm_xyz789",
      "name": "Sunshine Valley Farm",
      "contact": {
        "phone": "(555) 987-6543"
      }
    },
    "items": [
      {
        "productName": "Organic Tomatoes",
        "quantity": 2,
        "unitPrice": 5.99,
        "subtotal": 11.98
      }
    ],
    "subtotal": 11.98,
    "tax": 0.96,
    "total": 12.94,
    "deliveryOption": "PICKUP",
    "deliveryDate": "2025-10-25",
    "deliveryTime": "14:00",
    "pickupLocation": "123 Farm Road, Ruralville, CA",
    "paymentStatus": "PAID",
    "statusHistory": [
      {
        "status": "PENDING",
        "timestamp": "2025-10-21T15:00:00Z"
      },
      {
        "status": "CONFIRMED",
        "timestamp": "2025-10-21T15:30:00Z"
      },
      {
        "status": "PROCESSING",
        "timestamp": "2025-10-22T09:00:00Z"
      }
    ],
    "createdAt": "2025-10-21T15:00:00Z",
    "updatedAt": "2025-10-22T09:00:00Z"
  }
}
```

#### PATCH /api/orders/[id]/status

**Request:** (Authenticated as farm owner or admin)

```json
{
  "status": "READY",
  "note": "Your order is ready for pickup at the farm stand"
}
```

**Response (Success - 200):**

```json
{
  "order": {
    "id": "ord_abc123",
    "status": "READY",
    "updatedAt": "2025-10-22T12:00:00Z"
  },
  "notification": {
    "sent": true,
    "email": "john@example.com",
    "message": "Your order is ready for pickup"
  }
}
```

**Response (Invalid Transition - 400):**

```json
{
  "error": "Invalid status transition",
  "code": "INVALID_TRANSITION",
  "currentStatus": "COMPLETED",
  "requestedStatus": "PROCESSING",
  "message": "Cannot move from COMPLETED to PROCESSING"
}
```

### Acceptance Criteria

**AC-029-01:** Order status updates in real-time

- ✅ Status changes reflected immediately in UI
- ✅ Status history tracked with timestamps
- ✅ Consumer and farmer see same status

**AC-029-02:** Email notifications sent on status change

- ✅ Customer notified on CONFIRMED
- ✅ Customer notified on READY
- ✅ Customer notified on COMPLETED
- ✅ Farmer notified on new order (PENDING)

**AC-029-03:** Invalid status transitions prevented

- ✅ Cannot skip statuses (PENDING → COMPLETED)
- ✅ Cannot move backwards (READY → PENDING)
- ✅ Can CANCEL from any status
- ✅ Cannot change COMPLETED or CANCELLED

**AC-029-04:** Order detail page shows full info

- ✅ Current status prominently displayed
- ✅ Status history timeline shown
- ✅ All order details visible
- ✅ Contact farm button available

### Edge Cases

**EC-029-01:** Simultaneous status updates

- **Scenario:** Farmer updates to READY, customer refreshes
- **Handling:** Last write wins, timestamp determines order
- **Expected:** Most recent status shown, history accurate

**EC-029-02:** Customer cancels after farmer starts processing

- **Scenario:** Status is PROCESSING, customer requests cancel
- **Handling:** Allow cancel, notify farmer, refund payment
- **Expected:** Status → CANCELLED, farmer alerted, payment refunded

**EC-029-03:** Order stuck in PENDING

- **Scenario:** Farmer doesn't confirm order within 24 hours
- **Handling:** Automated reminder email sent
- **Expected:** Farmer receives reminder, order stays PENDING

---

## 🔍 FR-010: Search & Filtering

### Overview

Global search with autocomplete and advanced filtering for farms and products.

### Technical Specifications

**Search Scope:**

- Farms: Name, description, certifications
- Products: Name, description, tags, category

**Filter Options:**

- Location: Distance radius (5, 10, 25, 50 miles)
- Category: Vegetables, Fruits, Dairy, Meat, Eggs, etc.
- Availability: In Stock Only
- Certifications: Organic, Certified Naturally Grown, etc. (future)
- Price Range: $0-$5, $5-$10, $10-$20, $20+ (future)

**Sort Options:**

- Relevance (default)
- Price: Low to High
- Price: High to Low
- Distance: Nearest First
- Newest

### API Contracts

#### GET /api/search

**Request:**

```
GET /api/search?q=tomatoes&type=products&category=vegetables&inStock=true&sort=price_asc&limit=20&offset=0
```

**Response (Success - 200):**

```json
{
  "results": [
    {
      "type": "product",
      "id": "prod_abc123",
      "slug": "organic-heirloom-tomatoes",
      "name": "Organic Heirloom Tomatoes",
      "description": "Sweet and juicy...",
      "price": 5.99,
      "unit": "lb",
      "image": "https://...",
      "inStock": true,
      "farm": {
        "id": "farm_xyz789",
        "name": "Sunshine Valley Farm",
        "slug": "sunshine-valley-farm",
        "distance": 3.2
      },
      "category": {
        "id": "cat_vegetables",
        "name": "Vegetables"
      },
      "relevanceScore": 0.95
    }
  ],
  "pagination": {
    "total": 47,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  },
  "filters": {
    "category": "vegetables",
    "inStock": true,
    "sort": "price_asc"
  }
}
```

#### GET /api/search/autocomplete

**Request:**

```
GET /api/search/autocomplete?q=tom
```

**Response (Success - 200):**

```json
{
  "suggestions": [
    {
      "text": "tomatoes",
      "type": "product",
      "count": 12
    },
    {
      "text": "Tomato Acres Farm",
      "type": "farm",
      "count": 1
    },
    {
      "text": "tom turkey",
      "type": "product",
      "count": 3
    }
  ]
}
```

### Acceptance Criteria

**AC-010-01:** Search returns relevant results

- ✅ Query matches product/farm names
- ✅ Query matches descriptions
- ✅ Results ranked by relevance
- ✅ Typo tolerance (future: fuzzy matching)

**AC-010-02:** Filters narrow results effectively

- ✅ Category filter shows only matching products
- ✅ In Stock filter hides unavailable products
- ✅ Location filter shows farms within radius
- ✅ Multiple filters combine with AND logic

**AC-010-03:** Sorting reorders results

- ✅ Price sort works ascending/descending
- ✅ Distance sort shows nearest first
- ✅ Newest sort shows recent first
- ✅ Relevance sort is default

**AC-010-04:** Autocomplete suggests as user types

- ✅ Suggestions appear after 2 characters
- ✅ Debounced to avoid excessive requests
- ✅ Highlights matching text
- ✅ Click selects suggestion

### Edge Cases

**EC-010-01:** Search with no results

- **Scenario:** Query returns 0 results
- **Handling:** Show "No results found" with suggestions
- **Expected:** Suggest similar products, remove some filters

**EC-010-02:** Very long search query

- **Scenario:** User enters 500+ character search
- **Handling:** Truncate to 100 characters, process normally
- **Expected:** Search works, results based on truncated query

**EC-010-03:** Special characters in search

- **Scenario:** User searches for "tom@toes" or "ca$$h"
- **Handling:** Sanitize input, strip special characters
- **Expected:** Search for "tomtoes" or "cash"

**EC-010-04:** Location search without coordinates

- **Scenario:** User hasn't shared location
- **Handling:** Distance filter disabled, show all results
- **Expected:** Location filter greyed out, prompt to enable

---

## 📱 FR-031: Progressive Web App (PWA) [PLANNED]

### Overview

Transform web app into installable PWA with offline support and native-like experience.

### Technical Specifications (Planned)

**PWA Requirements:**

- Service Worker for offline caching
- Web App Manifest for installation
- HTTPS required (already have)
- Responsive design (already have)

**Offline Capabilities:**

- Cache static assets (JS, CSS, images)
- Cache recently viewed farms/products
- Offline "Add to Cart" (sync when online)
- Offline order viewing

**Installation:**

- Browser install prompt
- Add to Home Screen on mobile
- Desktop installation support
- Custom splash screen

### API Contracts (Planned)

#### Service Worker Caching Strategy

- **Static Assets**: Cache First
- **API Calls**: Network First, fallback to cache
- **Images**: Cache First with expiration

### Acceptance Criteria (Planned)

**AC-031-01:** PWA installable on all devices

- 📋 Install prompt shows on supported browsers
- 📋 App icon appears on home screen
- 📋 Opens in standalone mode (no browser UI)
- 📋 Custom splash screen displays on launch

**AC-031-02:** Offline functionality works

- 📋 Recently viewed content cached
- 📋 "Offline" banner shown when no connection
- 📋 Actions queued and synced when online
- 📋 Cached content accessible offline

**AC-031-03:** Performance optimized

- 📋 Lighthouse score: 90+ overall
- 📋 Service Worker caches assets efficiently
- 📋 App loads in <2s on slow 3G
- 📋 Background sync for queued actions

---

## 🔔 FR-032: Push Notifications (Planned) [PLANNED]

### Overview

Browser push notifications for order updates and farm announcements.

### Technical Specifications (Planned)

**Notification Types:**

- Order status updates (CONFIRMED, READY, COMPLETED)
- New products from followed farms (future)
- Price drops on saved products (future)
- Farm announcements (future)

**Permission Flow:**

1. User opts-in to notifications
2. Browser requests permission
3. User grants/denies permission
4. Subscription stored in database
5. Notifications sent via Firebase Cloud Messaging or similar

### API Contracts (Planned)

#### POST /api/notifications/subscribe

**Request:**

```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "preferences": {
    "orderUpdates": true,
    "newProducts": false,
    "priceDrops": false
  }
}
```

### Acceptance Criteria (Planned)

**AC-032-01:** User can enable push notifications

- 📋 Permission prompt shown at appropriate time
- 📋 User preferences saved
- 📋 Subscription registered with push service

**AC-032-02:** Notifications sent for order updates

- 📋 Push sent when order status changes
- 📋 Click notification opens order detail page
- 📋 Notification includes order number and status

**AC-032-03:** User can manage notification preferences

- 📋 Settings page shows all notification types
- 📋 User can enable/disable each type
- 📋 User can unsubscribe completely

---

## 🔗 Related Documents

- **[Farmers Market Features](./farmers-market-features.md)** - High-level feature descriptions
- **[Technical Architecture](../technical/architecture.md)** - System architecture and tech stack
- **[User Flows & Sitemap](../design/user-flows-sitemap.md)** - User journey diagrams
- **[Sprint Backlog](../execution/sprint-backlog.md)** - Development timeline and priorities
- **[QA & Test Plan](../operations/qa-test-plan.md)** - Testing strategy and test cases

---

## 📝 Document Maintenance

**Review Schedule**: After each sprint or major feature release
**Next Review**: November 2025 (Post Sprint 10)
**Owner**: Product & Engineering Team

**Update Triggers:**

- New feature implementation
- API contract changes
- Edge cases discovered
- Acceptance criteria additions
- Bug fixes requiring spec updates

---

_Last Updated: October 21, 2025_
_Version: 1.0_
_Status: Active - 26 features implemented, 8 planned_
