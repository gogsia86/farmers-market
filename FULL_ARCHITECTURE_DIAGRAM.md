# 🏗️ FARMERS MARKET PLATFORM - COMPLETE ARCHITECTURE DIAGRAM

**Version:** 2.0 - Complete System Architecture  
**Last Updated:** December 2024  
**Status:** Production Ready - Full Stack Documentation

---

## 📋 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Complete Layer Architecture](#complete-layer-architecture)
3. [Authentication & Authorization Architecture](#authentication--authorization-architecture)
4. [User Management System](#user-management-system)
5. [Database Schema & Relationships](#database-schema--relationships)
6. [API Architecture](#api-architecture)
7. [Service Layer Architecture](#service-layer-architecture)
8. [Frontend Architecture](#frontend-architecture)
9. [Security Architecture](#security-architecture)
10. [Data Flow Diagrams](#data-flow-diagrams)

---

## 🌐 SYSTEM OVERVIEW

### Technology Stack

```yaml
Frontend:
  Framework: Next.js 15 (App Router)
  Language: TypeScript 5.3+ (Strict Mode)
  UI Library: React 18.3+
  Styling: Tailwind CSS
  State Management: React Context + Server State
  Forms: React Hook Form + Zod Validation

Backend:
  Framework: Next.js API Routes + Server Actions
  Language: TypeScript 5.3+
  ORM: Prisma 5.7+
  Database: PostgreSQL 15+
  Cache: Redis (Upstash)
  Session Store: Redis-backed Sessions

Authentication:
  Provider: NextAuth v5 (Auth.js)
  Strategies:
    - Credentials (Email/Password)
    - OAuth (Google, GitHub)
  Session: JWT + Database Sessions
  Authorization: Role-Based Access Control (RBAC)

Infrastructure:
  Hosting: Vercel (Edge Network)
  Database: PostgreSQL (Managed)
  Cache: Upstash Redis
  Storage: Cloudinary (Images/Assets)
  Payments: Stripe
  Email: SendGrid / Resend
  Monitoring: Sentry + OpenTelemetry + UptimeRobot

AI/ML:
  Framework: Microsoft Agent Framework
  Tracing: OpenTelemetry
  Analytics: Azure Application Insights
```

---

## 🏛️ COMPLETE LAYER ARCHITECTURE

```mermaid
graph TB
    subgraph "CLIENT LAYER - Browser/Device"
        WEB["🌐 Web Browser<br/>(Desktop/Mobile)"]
        PWA["📱 Progressive Web App<br/>(Installable)"]
        MOBILE["📲 Mobile Browser<br/>(Responsive)"]
    end

    subgraph "EDGE & CDN LAYER - Global Distribution"
        VERCEL_EDGE["⚡ Vercel Edge Network<br/>(Global CDN)"]
        STATIC_CDN["📦 Static Asset CDN<br/>(Images, CSS, JS)"]
        EDGE_FUNCTIONS["🔥 Edge Functions<br/>(Middleware, Auth)"]
    end

    subgraph "PRESENTATION LAYER - Next.js Frontend"
        PAGES["📄 Pages & Routes<br/>(App Router)"]
        LAYOUTS["🎨 Layouts<br/>(Root, Auth, Dashboard)"]
        COMPONENTS["🧩 Components<br/>(UI, Features)"]
        HOOKS["🪝 Custom Hooks<br/>(useAuth, useCart, etc)"]
        CONTEXT["🔄 Context Providers<br/>(Auth, Theme, Cart)"]
        SSR["🖥️ Server-Side Rendering<br/>(Dynamic Pages)"]
        SSG["📋 Static Site Generation<br/>(Static Pages)"]
    end

    subgraph "API LAYER - Backend Services"
        API_ROUTES["🔌 API Routes<br/>(/api/*)"]
        SERVER_ACTIONS["⚡ Server Actions<br/>(Form Handlers)"]
        MIDDLEWARE["🛡️ Middleware<br/>(Auth, CORS, Rate Limit)"]
        WEBHOOKS["🪝 Webhooks<br/>(Stripe, External)"]
    end

    subgraph "BUSINESS LOGIC LAYER - Core Application"
        CONTROLLERS["🎮 Controllers<br/>(Request Handling)"]
        SERVICES["⚙️ Services<br/>(Business Logic)"]
        REPOSITORIES["📚 Repositories<br/>(Data Access)"]
        VALIDATORS["✅ Validators<br/>(Zod Schemas)"]
        AI_AGENTS["🤖 AI Agents<br/>(Microsoft Framework)"]
        UTILS["🔧 Utils<br/>(Helpers, Formatters)"]
    end

    subgraph "DATA ACCESS LAYER - ORM & Cache"
        PRISMA["💎 Prisma ORM<br/>(Type-Safe DB Access)"]
        CACHE_MANAGER["🚀 Cache Manager<br/>(Multi-Layer Cache)"]
        QUERY_BUILDER["🔨 Query Builder<br/>(Complex Queries)"]
        TRANSACTION_MGR["📝 Transaction Manager<br/>(ACID Compliance)"]
    end

    subgraph "DATA PERSISTENCE LAYER - Storage"
        POSTGRES[("🐘 PostgreSQL<br/>(Primary Database)<br/>Users, Farms, Products<br/>Orders, Reviews")]
        REDIS[("⚡ Redis Cache<br/>(Upstash)<br/>Sessions, Cache<br/>Rate Limiting")]
        FILE_STORAGE[("☁️ Cloudinary<br/>(File Storage)<br/>Images, Documents")]
    end

    subgraph "EXTERNAL SERVICES LAYER - Integrations"
        STRIPE_API["💳 Stripe API<br/>(Payments, Payouts)"]
        EMAIL_SERVICE["📧 Email Service<br/>(SendGrid/Resend)"]
        MAPS_API["🗺️ Maps API<br/>(Geocoding, Distance)"]
        SMS_SERVICE["💬 SMS Service<br/>(Twilio - Optional)"]
    end

    subgraph "OBSERVABILITY LAYER - Monitoring"
        SENTRY["🔍 Sentry<br/>(Error Tracking)"]
        OTEL["📊 OpenTelemetry<br/>(Distributed Tracing)"]
        APP_INSIGHTS["📈 Azure App Insights<br/>(AI Agent Monitoring)"]
        UPTIME_ROBOT["⏰ UptimeRobot<br/>(Uptime Monitoring)"]
        VERCEL_ANALYTICS["📉 Vercel Analytics<br/>(Web Vitals)"]
    end

    subgraph "SECURITY LAYER - Protection"
        WAF["🛡️ Web Application Firewall"]
        RATE_LIMITER["⏱️ Rate Limiter"]
        CSRF_PROTECTION["🔐 CSRF Protection"]
        XSS_PREVENTION["🚫 XSS Prevention"]
    end

    %% Client to Edge
    WEB --> VERCEL_EDGE
    PWA --> VERCEL_EDGE
    MOBILE --> VERCEL_EDGE

    %% Edge to Security
    VERCEL_EDGE --> WAF
    WAF --> RATE_LIMITER
    RATE_LIMITER --> EDGE_FUNCTIONS

    %% Edge to Presentation
    EDGE_FUNCTIONS --> PAGES
    VERCEL_EDGE --> STATIC_CDN
    STATIC_CDN --> COMPONENTS

    %% Presentation Layer Connections
    PAGES --> LAYOUTS
    PAGES --> SSR
    PAGES --> SSG
    LAYOUTS --> COMPONENTS
    COMPONENTS --> HOOKS
    COMPONENTS --> CONTEXT
    SSR --> API_ROUTES

    %% API Layer Connections
    API_ROUTES --> MIDDLEWARE
    SERVER_ACTIONS --> MIDDLEWARE
    WEBHOOKS --> MIDDLEWARE
    MIDDLEWARE --> CONTROLLERS

    %% Business Logic Connections
    CONTROLLERS --> SERVICES
    SERVICES --> VALIDATORS
    SERVICES --> REPOSITORIES
    SERVICES --> AI_AGENTS
    SERVICES --> UTILS

    %% Data Access Connections
    REPOSITORIES --> PRISMA
    REPOSITORIES --> CACHE_MANAGER
    PRISMA --> QUERY_BUILDER
    PRISMA --> TRANSACTION_MGR

    %% Persistence Connections
    QUERY_BUILDER --> POSTGRES
    TRANSACTION_MGR --> POSTGRES
    CACHE_MANAGER --> REDIS
    SERVICES --> FILE_STORAGE

    %% External Services
    SERVICES --> STRIPE_API
    SERVICES --> EMAIL_SERVICE
    SERVICES --> MAPS_API
    SERVICES --> SMS_SERVICE

    %% Monitoring Connections
    API_ROUTES -.->|Errors| SENTRY
    SERVICES -.->|Traces| OTEL
    AI_AGENTS -.->|Metrics| APP_INSIGHTS
    VERCEL_EDGE -.->|Uptime| UPTIME_ROBOT
    PAGES -.->|Web Vitals| VERCEL_ANALYTICS

    %% Security Connections
    MIDDLEWARE --> CSRF_PROTECTION
    MIDDLEWARE --> XSS_PREVENTION

    style VERCEL_EDGE fill:#000,stroke:#fff,stroke-width:3px,color:#fff
    style POSTGRES fill:#336791,stroke:#fff,stroke-width:2px,color:#fff
    style REDIS fill:#DC382D,stroke:#fff,stroke-width:2px,color:#fff
    style SENTRY fill:#362D59,stroke:#fff,stroke-width:2px,color:#fff
    style AI_AGENTS fill:#0066ff,stroke:#fff,stroke-width:2px,color:#fff
    style STRIPE_API fill:#635BFF,stroke:#fff,stroke-width:2px,color:#fff
    style SERVICES fill:#4CAF50,stroke:#fff,stroke-width:2px,color:#fff
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION ARCHITECTURE

### Complete Auth Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant NextAuth
    participant Middleware
    participant API
    participant Database
    participant Redis
    participant Email

    %% Login Flow
    User->>Browser: Enter Credentials
    Browser->>NextAuth: POST /api/auth/signin
    NextAuth->>Database: Validate User

    alt Valid Credentials
        Database->>NextAuth: User Found
        NextAuth->>Database: Create Session
        NextAuth->>Redis: Store Session Token
        NextAuth->>Database: Update Last Login
        NextAuth->>Browser: Set Session Cookie (HTTP-Only)
        Browser->>User: Redirect to Dashboard
    else Invalid Credentials
        Database->>NextAuth: User Not Found
        NextAuth->>Browser: Authentication Error
        Browser->>User: Show Error Message
    end

    %% OAuth Flow
    User->>Browser: Click "Sign in with Google"
    Browser->>NextAuth: Redirect to OAuth Provider
    NextAuth->>OAuth Provider: Authorization Request
    OAuth Provider->>User: Show Consent Screen
    User->>OAuth Provider: Grant Permission
    OAuth Provider->>NextAuth: Authorization Code
    NextAuth->>OAuth Provider: Exchange Code for Token
    OAuth Provider->>NextAuth: Access Token
    NextAuth->>Database: Find/Create User
    NextAuth->>Database: Link Account
    NextAuth->>Redis: Store Session
    NextAuth->>Browser: Set Session Cookie
    Browser->>User: Redirect to Dashboard

    %% Protected Route Access
    User->>Browser: Access Protected Route
    Browser->>Middleware: HTTP Request + Cookie
    Middleware->>Redis: Validate Session Token

    alt Valid Session
        Redis->>Middleware: Session Data
        Middleware->>Database: Get User Details
        Database->>Middleware: User + Role
        Middleware->>Middleware: Check Permissions (RBAC)

        alt Authorized
            Middleware->>API: Forward Request + User Context
            API->>User: Return Protected Resource
        else Unauthorized (Wrong Role)
            Middleware->>Browser: 403 Forbidden
            Browser->>User: Show Access Denied
        end
    else Invalid/Expired Session
        Middleware->>Browser: 401 Unauthorized
        Browser->>User: Redirect to Login
    end

    %% Password Reset Flow
    User->>Browser: Request Password Reset
    Browser->>API: POST /api/auth/reset-request
    API->>Database: Find User by Email
    Database->>API: User Found
    API->>Database: Generate Reset Token
    API->>Email: Send Reset Link
    Email->>User: Password Reset Email
    User->>Browser: Click Reset Link
    Browser->>API: Verify Token
    API->>Database: Validate Token & Expiry
    Database->>API: Token Valid
    API->>Browser: Show Reset Form
    Browser->>User: Enter New Password
    User->>API: Submit New Password
    API->>Database: Update Password Hash
    API->>Database: Invalidate Reset Token
    API->>Redis: Clear All User Sessions
    API->>Browser: Success Response
    Browser->>User: Redirect to Login
```

### Role-Based Access Control (RBAC)

```mermaid
graph TB
    subgraph "USER ROLES"
        SUPER_ADMIN["👑 SUPER_ADMIN<br/>(Platform Owner)"]
        ADMIN["🔑 ADMIN<br/>(Platform Admin)"]
        FARMER["🌾 FARMER<br/>(Farm Owner)"]
        STAFF["👥 STAFF<br/>(Farm Employee)"]
        CONSUMER["🛒 CONSUMER<br/>(Customer)"]
        GUEST["👤 GUEST<br/>(Unauthenticated)"]
    end

    subgraph "PERMISSIONS - Admin"
        MANAGE_USERS["Manage Users"]
        MANAGE_FARMS["Approve/Reject Farms"]
        VIEW_ANALYTICS["View Platform Analytics"]
        MANAGE_CATEGORIES["Manage Categories"]
        SUSPEND_ACCOUNTS["Suspend Accounts"]
        VIEW_FINANCIALS["View Financials"]
    end

    subgraph "PERMISSIONS - Farmer"
        CREATE_FARM["Create/Edit Farm"]
        MANAGE_PRODUCTS["Manage Products"]
        MANAGE_INVENTORY["Manage Inventory"]
        VIEW_ORDERS["View Farm Orders"]
        MANAGE_TEAM["Manage Team Members"]
        VIEW_FARM_ANALYTICS["View Farm Analytics"]
        SETUP_PAYOUT["Setup Stripe Payout"]
    end

    subgraph "PERMISSIONS - Staff"
        UPDATE_INVENTORY["Update Inventory"]
        PROCESS_ORDERS["Process Orders"]
        VIEW_FARM_PRODUCTS["View Farm Products"]
    end

    subgraph "PERMISSIONS - Consumer"
        BROWSE_PRODUCTS["Browse Products"]
        PLACE_ORDERS["Place Orders"]
        WRITE_REVIEWS["Write Reviews"]
        MANAGE_CART["Manage Shopping Cart"]
        VIEW_ORDER_HISTORY["View Order History"]
        SAVE_FAVORITES["Save Favorites"]
    end

    subgraph "PERMISSIONS - Guest"
        VIEW_FARMS["View Farms (Limited)"]
        VIEW_PRODUCTS_PUBLIC["View Products (Limited)"]
        SIGNUP["Sign Up"]
    end

    SUPER_ADMIN --> MANAGE_USERS
    SUPER_ADMIN --> MANAGE_FARMS
    SUPER_ADMIN --> VIEW_ANALYTICS
    SUPER_ADMIN --> MANAGE_CATEGORIES
    SUPER_ADMIN --> SUSPEND_ACCOUNTS
    SUPER_ADMIN --> VIEW_FINANCIALS

    ADMIN --> MANAGE_FARMS
    ADMIN --> VIEW_ANALYTICS
    ADMIN --> MANAGE_CATEGORIES

    FARMER --> CREATE_FARM
    FARMER --> MANAGE_PRODUCTS
    FARMER --> MANAGE_INVENTORY
    FARMER --> VIEW_ORDERS
    FARMER --> MANAGE_TEAM
    FARMER --> VIEW_FARM_ANALYTICS
    FARMER --> SETUP_PAYOUT

    STAFF --> UPDATE_INVENTORY
    STAFF --> PROCESS_ORDERS
    STAFF --> VIEW_FARM_PRODUCTS

    CONSUMER --> BROWSE_PRODUCTS
    CONSUMER --> PLACE_ORDERS
    CONSUMER --> WRITE_REVIEWS
    CONSUMER --> MANAGE_CART
    CONSUMER --> VIEW_ORDER_HISTORY
    CONSUMER --> SAVE_FAVORITES

    GUEST --> VIEW_FARMS
    GUEST --> VIEW_PRODUCTS_PUBLIC
    GUEST --> SIGNUP

    style SUPER_ADMIN fill:#ff0000,stroke:#fff,stroke-width:2px,color:#fff
    style ADMIN fill:#ff9800,stroke:#fff,stroke-width:2px,color:#fff
    style FARMER fill:#4caf50,stroke:#fff,stroke-width:2px,color:#fff
    style CONSUMER fill:#2196f3,stroke:#fff,stroke-width:2px,color:#fff
```

### Middleware Auth Chain

```mermaid
flowchart LR
    REQUEST["📨 Incoming Request"] --> CHECK_PUBLIC{Public Route?}

    CHECK_PUBLIC -->|Yes| ALLOW["✅ Allow Access"]
    CHECK_PUBLIC -->|No| CHECK_SESSION{Has Session<br/>Cookie?}

    CHECK_SESSION -->|No| REDIRECT_LOGIN["🔒 Redirect to Login"]
    CHECK_SESSION -->|Yes| VALIDATE_SESSION["Validate Session<br/>in Redis"]

    VALIDATE_SESSION --> SESSION_VALID{Session Valid?}

    SESSION_VALID -->|No| REDIRECT_LOGIN
    SESSION_VALID -->|Yes| GET_USER["Get User from DB"]

    GET_USER --> CHECK_STATUS{User Status<br/>Active?}

    CHECK_STATUS -->|Suspended| SHOW_SUSPENDED["⛔ Show Suspended Page"]
    CHECK_STATUS -->|Pending| SHOW_PENDING["⏳ Show Pending Approval"]
    CHECK_STATUS -->|Active| CHECK_ROLE{Check User Role<br/>& Permissions}

    CHECK_ROLE -->|Authorized| INJECT_USER["Inject User Context<br/>into Request"]
    CHECK_ROLE -->|Unauthorized| SHOW_403["🚫 403 Forbidden"]

    INJECT_USER --> ALLOW

    style REQUEST fill:#2196f3,stroke:#fff,stroke-width:2px,color:#fff
    style ALLOW fill:#4caf50,stroke:#fff,stroke-width:2px,color:#fff
    style REDIRECT_LOGIN fill:#ff9800,stroke:#fff,stroke-width:2px,color:#fff
    style SHOW_403 fill:#f44336,stroke:#fff,stroke-width:2px,color:#fff
```

---

## 👥 USER MANAGEMENT SYSTEM

### User Data Model

```mermaid
erDiagram
    User ||--o{ Session : "has"
    User ||--o{ Account : "has"
    User ||--o{ Farm : "owns"
    User ||--o{ Order : "places"
    User ||--o{ Review : "writes"
    User ||--o{ UserAddress : "has"
    User ||--o{ FarmTeamMember : "member of"
    User ||--o{ Notification : "receives"
    User ||--o{ CartItem : "has"
    User ||--o{ Favorite : "saves"
    User ||--o{ AuditLog : "generates"

    User {
        string id PK "cuid()"
        string email UK "Unique email"
        string password "Hashed password"
        string firstName
        string lastName
        string name "Full name"
        string phone
        string avatar "Profile picture URL"
        enum role "CONSUMER|FARMER|ADMIN|SUPER_ADMIN"
        enum status "ACTIVE|SUSPENDED|PENDING"
        boolean emailVerified
        datetime emailVerifiedAt
        boolean phoneVerified
        datetime phoneVerifiedAt
        string verificationToken UK
        datetime verificationExpiry
        string resetToken UK
        datetime resetTokenExpiry
        json dietaryPreferences
        json notificationPreferences
        json privacySettings
        datetime lastLoginAt
        string lastLoginIP
        int loginCount
        datetime createdAt
        datetime updatedAt
    }

    Session {
        string id PK
        string userId FK
        string sessionToken UK
        string accessToken
        string refreshToken
        datetime expiresAt
        datetime createdAt
    }

    Account {
        string id PK
        string userId FK
        string provider "google|github"
        string providerAccountId
        string refreshToken
        string accessToken
        datetime expiresAt
        string tokenType
        string scope
        string idToken
    }

    UserAddress {
        string id PK
        string userId FK
        enum type "HOME|WORK|OTHER"
        string label
        string street
        string city
        string state
        string zipCode
        decimal latitude
        decimal longitude
        boolean isDefault
    }

    FarmTeamMember {
        string id PK
        string farmId FK
        string userId FK
        string email
        enum role "OWNER|MANAGER|STAFF"
        enum status "INVITED|ACTIVE|REMOVED"
        datetime invitedAt
        datetime joinedAt
    }
```

### User Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Guest: Visit Site

    Guest --> Registering: Click Sign Up
    Registering --> PendingVerification: Submit Form

    PendingVerification --> Active: Verify Email
    PendingVerification --> Expired: Token Expires
    Expired --> PendingVerification: Resend Verification

    Active --> Suspended: Admin Suspends
    Active --> Updating: User Updates Profile
    Updating --> Active: Save Changes

    Suspended --> Active: Admin Reactivates
    Suspended --> Deleted: Account Deleted

    Active --> Deleted: User Deletes Account

    Deleted --> [*]

    note right of Active
        User can:
        - Browse products
        - Place orders
        - Create farm (if farmer)
        - Write reviews
    end note

    note right of Suspended
        User cannot:
        - Login
        - Place orders
        - Access dashboard
        Reason displayed on login
    end note
```

### Registration Flow (Complete)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Validation
    participant Database
    participant Email
    participant Redis

    User->>Frontend: Fill Registration Form
    Frontend->>Frontend: Client-Side Validation

    User->>Frontend: Submit Form
    Frontend->>API: POST /api/auth/register

    API->>Validation: Validate Input (Zod)

    alt Validation Fails
        Validation->>API: Validation Errors
        API->>Frontend: 400 Bad Request
        Frontend->>User: Show Field Errors
    else Validation Passes
        Validation->>API: Valid Data

        API->>Database: Check Email Exists

        alt Email Exists
            Database->>API: Email Found
            API->>Frontend: 409 Conflict
            Frontend->>User: "Email already registered"
        else Email Available
            Database->>API: Email Available

            API->>API: Hash Password (bcrypt)
            API->>API: Generate Verification Token

            API->>Database: Create User (status: PENDING)
            Database->>API: User Created

            API->>Email: Send Verification Email
            Email->>User: Verification Link Email

            API->>Redis: Store Temp Session
            API->>Frontend: 201 Created

            Frontend->>User: "Check your email to verify"

            User->>Email: Click Verification Link
            Email->>API: GET /api/auth/verify?token=xxx

            API->>Database: Find User by Token

            alt Token Valid & Not Expired
                Database->>API: User Found
                API->>Database: Update User (emailVerified: true, status: ACTIVE)
                API->>Database: Clear Verification Token
                API->>API: Create Session
                API->>Redis: Store Session
                API->>Frontend: Redirect to Dashboard
                Frontend->>User: "Email verified! Welcome!"
            else Token Invalid/Expired
                API->>Frontend: 400 Bad Request
                Frontend->>User: "Invalid or expired token"
                Frontend->>User: Show "Resend Verification" Button
            end
        end
    end
```

---

## 🗄️ DATABASE SCHEMA & RELATIONSHIPS

### Complete Entity Relationship Diagram

```mermaid
erDiagram
    %% USERS & AUTH
    User ||--o{ Session : has
    User ||--o{ Account : has
    User ||--o{ UserAddress : has

    %% FARMS
    User ||--o{ Farm : owns
    Farm ||--o{ FarmTeamMember : has
    Farm ||--o{ FarmPhoto : has
    Farm ||--o{ FarmCertification : has
    Farm ||--o{ MarketLocation : "sells at"

    %% PRODUCTS
    Farm ||--o{ Product : "produces"
    Product ||--o{ ProductImage : has
    Product ||--o{ ProductVariant : has
    Product ||--o{ Inventory : has

    %% ORDERS
    User ||--o{ Order : places
    Farm ||--o{ Order : receives
    Order ||--o{ OrderItem : contains
    Product ||--o{ OrderItem : "ordered as"
    Order ||--|| Payment : has
    Order ||--o{ OrderStatusHistory : tracks

    %% REVIEWS
    User ||--o{ Review : writes
    Farm ||--o{ Review : receives
    Product ||--o{ Review : "reviewed in"

    %% FAVORITES & CART
    User ||--o{ Favorite : saves
    Farm ||--o{ Favorite : "favorited by"
    User ||--o{ CartItem : has
    Product ||--o{ CartItem : "added to"

    %% DELIVERY
    Farm ||--o{ DeliveryZone : defines
    Farm ||--o{ PickupLocation : has
    Order ||--|| Delivery : has

    %% AGRICULTURAL
    Farm ||--o{ BiodynamicCalendar : follows
    Farm ||--o{ SoilAnalysis : "analyzed with"
    Farm ||--o{ WeatherData : "tracked for"
    Farm ||--o{ CropRotation : plans
    Farm ||--o{ HarvestSchedule : schedules

    %% PAYMENTS
    Farm ||--o{ Payout : receives
    Order ||--|| Payment : "paid with"

    %% NOTIFICATIONS
    User ||--o{ Notification : receives
    Farm ||--o{ Notification : "sent by"

    %% SUPPORT
    User ||--o{ SupportTicket : creates
    User ||--o{ Message : sends

    User {
        cuid id PK
        varchar email UK
        varchar password
        varchar name
        enum role
        enum status
        boolean emailVerified
        datetime createdAt
    }

    Farm {
        cuid id PK
        varchar name
        varchar slug UK
        text description
        string ownerId FK
        enum status
        enum verificationStatus
        json location
        decimal latitude
        decimal longitude
        datetime createdAt
    }

    Product {
        cuid id PK
        string farmId FK
        varchar name
        varchar slug
        text description
        enum category
        decimal price
        int stock
        enum status
        datetime createdAt
    }

    Order {
        cuid id PK
        varchar orderNumber UK
        string customerId FK
        string farmId FK
        decimal subtotal
        decimal tax
        decimal deliveryFee
        decimal total
        enum status
        string paymentIntentId
        datetime createdAt
    }

    OrderItem {
        cuid id PK
        string orderId FK
        string productId FK
        int quantity
        decimal price
        decimal subtotal
    }

    Review {
        cuid id PK
        string userId FK
        string farmId FK
        string productId FK
        int rating
        text comment
        boolean verified
        datetime createdAt
    }

    Payment {
        cuid id PK
        string orderId FK
        string stripePaymentIntentId UK
        decimal amount
        enum status
        string paymentMethod
        datetime paidAt
    }
```

### Key Database Indexes

```sql
-- User Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Farm Indexes
CREATE INDEX idx_farms_owner_id ON farms(owner_id);
CREATE INDEX idx_farms_slug ON farms(slug);
CREATE INDEX idx_farms_status ON farms(status);
CREATE INDEX idx_farms_location ON farms(latitude, longitude);
CREATE INDEX idx_farms_verification_status ON farms(verification_status);

-- Product Indexes
CREATE INDEX idx_products_farm_id ON products(farm_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);

-- Order Indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_farm_id ON orders(farm_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- Session Indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

---

## 🔌 API ARCHITECTURE

### API Route Structure

```
/api/
├── auth/                          # Authentication endpoints
│   ├── [...nextauth]/route.ts    # NextAuth handler
│   ├── register/route.ts          # User registration
│   ├── verify/route.ts            # Email verification
│   ├── reset-password/route.ts    # Password reset
│   └── logout/route.ts            # Logout endpoint
│
├── users/                         # User management
│   ├── route.ts                   # GET /users, POST /users
│   ├── [id]/route.ts              # GET /users/:id, PATCH /users/:id
│   ├── [id]/addresses/route.ts    # User addresses
│   └── profile/route.ts           # Current user profile
│
├── farms/                         # Farm management
│   ├── route.ts                   # GET /farms (list), POST /farms (create)
│   ├── [id]/route.ts              # GET, PATCH, DELETE /farms/:id
│   ├── [id]/products/route.ts     # Farm products
│   ├── [id]/team/route.ts         # Team management
│   ├── [id]/certifications/route.ts
│   └── [slug]/route.ts            # Get farm by slug
│
├── products/                      # Product management
│   ├── route.ts                   # GET /products (list), POST /products
│   ├── [id]/route.ts              # GET, PATCH, DELETE /products/:id
│   ├── [id]/inventory/route.ts    # Inventory management
│   ├── [id]/reviews/route.ts      # Product reviews
│   └── search/route.ts            # Product search
│
├── orders/                        # Order management
│   ├── route.ts                   # GET /orders (list), POST /orders
│   ├── [id]/route.ts              # GET /orders/:id, PATCH /orders/:id
│   ├── [id]/status/route.ts       # Update order status
│   └── [id]/cancel/route.ts       # Cancel order
│
├── cart/                          # Shopping cart
│   ├── route.ts                   # GET /cart, POST /cart (add item)
│   ├── [itemId]/route.ts          # PATCH, DELETE cart items
│   └── checkout/route.ts          # Checkout process
│
├── payments/                      # Payment processing
│   ├── create-intent/route.ts     # Create Stripe payment intent
│   ├── confirm/route.ts           # Confirm payment
│   └── webhooks/stripe/route.ts   # Stripe webhooks
│
├── reviews/                       # Reviews
│   ├── route.ts                   # POST /reviews (create)
│   ├── [id]/route.ts              # GET, PATCH, DELETE
│   └── farm/[farmId]/route.ts     # Farm reviews
│
├── favorites/                     # User favorites
│   ├── route.ts                   # GET, POST /favorites
│   └── [id]/route.ts              # DELETE favorite
│
├── search/                        # Search functionality
│   ├── farms/route.ts             # Search farms
│   ├── products/route.ts          # Search products
│   └── global/route.ts            # Global search
│
├── admin/                         # Admin endpoints
│   ├── users/route.ts             # User management
│   ├── farms/approve/route.ts     # Farm approval
│   ├── analytics/route.ts         # Platform analytics
│   └── audit-logs/route.ts        # Audit logs
│
└── webhooks/                      # External webhooks
    ├── stripe/route.ts            # Stripe events
    └── sendgrid/route.ts          # Email events
```

### API Response Format (Standardized)

```typescript
// Success Response
{
  "success": true,
  "data": {
    // Response payload
  },
  "meta": {
    "timestamp": "2024-12-20T10:30:00Z",
    "requestId": "req_abc123",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["Email is required"],
      "password": ["Password must be at least 8 characters"]
    }
  },
  "meta": {
    "timestamp": "2024-12-20T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

---

## ⚙️ SERVICE LAYER ARCHITECTURE

### Service Layer Pattern

```mermaid
graph TB
    subgraph "CONTROLLERS - Request Handlers"
        USER_CTRL[UserController]
        FARM_CTRL[FarmController]
        PRODUCT_CTRL[ProductController]
        ORDER_CTRL[OrderController]
    end

    subgraph "SERVICES - Business Logic"
        USER_SVC[UserService]
        FARM_SVC[FarmService]
        PRODUCT_SVC[ProductService]
        ORDER_SVC[OrderService]
        EMAIL_SVC[EmailService]
        PAYMENT_SVC[PaymentService]
        NOTIFICATION_SVC[NotificationService]
    end

    subgraph "REPOSITORIES - Data Access"
        USER_REPO[UserRepository]
        FARM_REPO[FarmRepository]
        PRODUCT_REPO[ProductRepository]
        ORDER_REPO[OrderRepository]
    end

    subgraph "DATABASE - Persistence"
        PRISMA[(Prisma Client)]
        CACHE[(Redis Cache)]
    end

    USER_CTRL --> USER_SVC
    FARM_CTRL --> FARM_SVC
    PRODUCT_CTRL --> PRODUCT_SVC
    ORDER_CTRL --> ORDER_SVC

    USER_SVC --> USER_REPO
    USER_SVC --> EMAIL_SVC
    USER_SVC --> NOTIFICATION_SVC

    FARM_SVC --> FARM_REPO
    FARM_SVC --> NOTIFICATION_SVC

    PRODUCT_SVC --> PRODUCT_REPO

    ORDER_SVC --> ORDER_REPO
    ORDER_SVC --> PAYMENT_SVC
    ORDER_SVC --> EMAIL_SVC
    ORDER_SVC --> NOTIFICATION_SVC

    USER_REPO --> PRISMA
    USER_REPO --> CACHE
    FARM_REPO --> PRISMA
    FARM_REPO --> CACHE
    PRODUCT_REPO --> PRISMA
    PRODUCT_REPO --> CACHE
    ORDER_REPO --> PRISMA

    style USER_SVC fill:#4CAF50,stroke:#fff,stroke-width:2px,color:#fff
    style PRISMA fill:#336791,stroke:#fff,stroke-width:2px,color:#fff
    style CACHE fill:#DC382D,stroke:#fff,stroke-width:2px,color:#fff
```

### Service Implementation Example

```typescript
// UserService - Business Logic Layer
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
    private notificationService: NotificationService,
  ) {}

  /**
   * Create new user account
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    // 1. Validate input
    const validated = CreateUserSchema.parse(data);

    // 2. Check if email exists
    const existingUser = await this.userRepository.findByEmail(validated.email);
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // 4. Generate verification token
    const verificationToken = generateSecureToken();
    const verificationExpiry = addHours(new Date(), 24);

    // 5. Create user
    const user = await this.userRepository.create({
      ...validated,
      password: hashedPassword,
      verificationToken,
      verificationExpiry,
      status: "PENDING",
    });

    // 6. Send verification email (async, don't wait)
    this.emailService
      .sendVerificationEmail(user.email, verificationToken)
      .catch((error) =>
        logger.error("Failed to send verification email", error),
      );

    // 7. Return user (without sensitive data)
    return this.sanitizeUser(user);
  }

  /**
   * Verify user email
   */
  async verifyEmail(token: string): Promise<User> {
    const user = await this.userRepository.findByVerificationToken(token);

    if (!user) {
      throw new NotFoundError("Invalid verification token");
    }

    if (user.verificationExpiry < new Date()) {
      throw new BadRequestError("Verification token expired");
    }

    // Update user status
    const updatedUser = await this.userRepository.update(user.id, {
      emailVerified: true,
      emailVerifiedAt: new Date(),
      status: "ACTIVE",
      verificationToken: null,
      verificationExpiry: null,
    });

    // Send welcome notification
    await this.notificationService.sendWelcomeNotification(updatedUser.id);

    return this.sanitizeUser(updatedUser);
  }

  /**
   * Remove sensitive fields from user object
   */
  private sanitizeUser(user: User): User {
    const { password, verificationToken, resetToken, ...safeUser } = user;
    return safeUser as User;
  }
}
```

---

## 🎨 FRONTEND ARCHITECTURE

### Component Hierarchy

```
src/
├── app/                          # Next.js 15 App Router
│   ├── layout.tsx                # Root layout (auth provider, theme)
│   ├── page.tsx                  # Homepage
│   ├── (auth)/                   # Auth route group
│   │   ├── layout.tsx            # Auth layout
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   ├── (customer)/               # Customer routes
│   │   ├── layout.tsx            # Customer layout (with nav)
│   │   ├── farms/
│   │   │   ├── page.tsx          # Farm listing
│   │   │   └── [slug]/page.tsx   # Farm detail
│   │   ├── products/
│   │   │   ├── page.tsx          # Product listing
│   │   │   └── [slug]/page.tsx   # Product detail
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   └── orders/
│   │       ├── page.tsx          # Order history
│   │       └── [id]/page.tsx     # Order detail
│   │
│   ├── (farmer)/                 # Farmer routes
│   │   ├── layout.tsx            # Farmer dashboard layout
│   │   ├── dashboard/page.tsx
│   │   ├── farm/
│   │   │   ├── setup/page.tsx
│   │   │   ├── edit/page.tsx
│   │   │   └── team/page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx          # Product management
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── payouts/page.tsx
│   │
│   └── (admin)/                  # Admin routes
│       ├── layout.tsx            # Admin layout
│       ├── dashboard/page.tsx
│       ├── users/page.tsx
│       ├── farms/
│       │   ├── page.tsx          # Pending approvals
│       │   └── [id]/review/page.tsx
│       └── analytics/page.tsx
│
├── components/
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   └── Spinner.tsx
│   │
│   ├── features/                 # Feature-specific components
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── PasswordResetForm.tsx
│   │   ├── farms/
│   │   │   ├── FarmCard.tsx
│   │   │   ├── FarmGrid.tsx
│   │   │   ├── FarmProfile.tsx
│   │   │   └── FarmEditForm.tsx
│   │   ├── products/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   └── ProductForm.tsx
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   └── orders/
│   │       ├── OrderList.tsx
│   │       ├── OrderCard.tsx
│   │       └── OrderTimeline.tsx
│   │
│   └── layout/                   # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── Sidebar.tsx
│       └── Navigation.tsx
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Authentication hook
│   ├── useCart.ts                # Shopping cart hook
│   ├── useFarms.ts               # Farm data hook
│   ├── useProducts.ts            # Product data hook
│   └── useOrders.ts              # Order data hook
│
└── context/                      # React Context providers
    ├── AuthContext.tsx           # Auth state
    ├── CartContext.tsx           # Cart state
    └── ThemeContext.tsx          # Theme state
```

### Component Communication Pattern

```mermaid
graph TB
    subgraph "PAGE LEVEL - Server Components"
        FARM_PAGE[FarmPage<br/>Fetches data server-side]
        PRODUCT_PAGE[ProductPage<br/>Fetches data server-side]
    end

    subgraph "FEATURE COMPONENTS - Mixed"
        FARM_PROFILE[FarmProfile<br/>Server Component]
        PRODUCT_GRID[ProductGrid<br/>Server Component]
        CART_BUTTON["CartButton<br/>(Client Component)"]
        FAVORITE_BUTTON["FavoriteButton<br/>(Client Component)"]
    end

    subgraph "UI COMPONENTS - Reusable"
        CARD[Card<br/>Server Component]
        BUTTON["Button<br/>(Client Component)"]
        BADGE[Badge<br/>Server Component]
    end

    subgraph "STATE MANAGEMENT"
        CART_CONTEXT["CartContext<br/>(Client)"]
        AUTH_CONTEXT["AuthContext<br/>(Client)"]
    end

    FARM_PAGE --> FARM_PROFILE
    PRODUCT_PAGE --> PRODUCT_GRID

    FARM_PROFILE --> CARD
    FARM_PROFILE --> FAVORITE_BUTTON

    PRODUCT_GRID --> CARD
    PRODUCT_GRID --> CART_BUTTON

    CARD --> BUTTON
    CARD --> BADGE

    CART_BUTTON --> CART_CONTEXT
    FAVORITE_BUTTON --> AUTH_CONTEXT

    style FARM_PAGE fill:#4CAF50,stroke:#fff,stroke-width:2px,color:#fff
    style CART_CONTEXT fill:#2196F3,stroke:#fff,stroke-width:2px,color:#fff
```

---

## 🔒 SECURITY ARCHITECTURE

### Security Layers

```mermaid
graph TB
    subgraph "NETWORK SECURITY"
        HTTPS["🔐 HTTPS/TLS 1.3<br/>(SSL Certificate)"]
        WAF["🛡️ Web Application Firewall<br/>(Vercel WAF)"]
        DDOS["⚡ DDoS Protection<br/>(Vercel Edge)"]
    end

    subgraph "APPLICATION SECURITY"
        RATE_LIMIT["⏱️ Rate Limiting<br/>(Redis-based)"]
        CORS["🌐 CORS Policy<br/>(Strict origins)"]
        CSP["📋 Content Security Policy<br/>(Header-based)"]
        CSRF["🔑 CSRF Protection<br/>(Token-based)"]
        XSS["🚫 XSS Prevention<br/>(Input sanitization)"]
    end

    subgraph "AUTHENTICATION SECURITY"
        JWT["🎫 JWT Tokens<br/>(HTTP-only cookies)"]
        SESSION["🔐 Secure Sessions<br/>(Redis store)"]
        PASSWORD["🔒 Password Hashing<br/>(bcrypt, 10 rounds)"]
        MFA["📱 2FA (Optional)<br/>(TOTP)"]
    end

    subgraph "AUTHORIZATION SECURITY"
        RBAC["👥 Role-Based Access<br/>(User roles)"]
        PERMISSION["✅ Permission Checks<br/>(Middleware)"]
        RESOURCE_OWNER["🔑 Resource Ownership<br/>(User validation)"]
    end

    subgraph "DATA SECURITY"
        ENCRYPTION["🔐 Data Encryption<br/>(At rest & transit)"]
        SECRETS["🗝️ Secret Management<br/>(Environment vars)"]
        SQL_INJECTION["💉 SQL Injection Prevention<br/>(Prisma ORM)"]
        INPUT_VALIDATION["✅ Input Validation<br/>(Zod schemas)"]
    end

    subgraph "MONITORING & RESPONSE"
        AUDIT_LOG["📝 Audit Logging<br/>(User actions)"]
        THREAT_DETECTION["🔍 Threat Detection<br/>(Sentry)"]
        INCIDENT_RESPONSE["🚨 Incident Response<br/>(Alerts)"]
    end

    HTTPS --> WAF
    WAF --> DDOS
    DDOS --> RATE_LIMIT

    RATE_LIMIT --> CORS
    CORS --> CSP
    CSP --> CSRF
    CSRF --> XSS

    XSS --> JWT
    JWT --> SESSION
    SESSION --> PASSWORD
    PASSWORD --> MFA

    MFA --> RBAC
    RBAC --> PERMISSION
    PERMISSION --> RESOURCE_OWNER

    RESOURCE_OWNER --> ENCRYPTION
    ENCRYPTION --> SECRETS
    SECRETS --> SQL_INJECTION
    SQL_INJECTION --> INPUT_VALIDATION

    INPUT_VALIDATION --> AUDIT_LOG
    AUDIT_LOG --> THREAT_DETECTION
    THREAT_DETECTION --> INCIDENT_RESPONSE

    style HTTPS fill:#4CAF50,stroke:#fff,stroke-width:2px,color:#fff
    style ENCRYPTION fill:#f44336,stroke:#fff,stroke-width:2px,color:#fff
    style RBAC fill:#2196F3,stroke:#fff,stroke-width:2px,color:#fff
```

### Security Headers Configuration

```typescript
// next.config.mjs
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
  {
    key: "Content-Security-Policy",
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel.app;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' *.stripe.com;
      frame-src 'self' *.stripe.com;
    `
      .replace(/\s{2,}/g, " ")
      .trim(),
  },
];
```

---

## 📊 DATA FLOW DIAGRAMS

### Complete Order Flow (Customer Journey)

```mermaid
sequenceDiagram
    participant Customer
    participant Frontend
    participant API
    participant CartService
    participant OrderService
    participant PaymentService
    participant ProductService
    participant NotificationService
    participant Database
    participant Stripe
    participant Email

    %% 1. Browse & Add to Cart
    Customer->>Frontend: Browse Products
    Frontend->>API: GET /api/products
    API->>ProductService: Fetch Products
    ProductService->>Database: Query Products
    Database->>ProductService: Product List
    ProductService->>API: Return Products
    API->>Frontend: Product Data
    Frontend->>Customer: Display Products

    Customer->>Frontend: Add to Cart
    Frontend->>CartService: addToCart(productId, quantity)
    CartService->>CartService: Store in LocalStorage
    CartService->>Frontend: Cart Updated
    Frontend->>Customer: Show Cart Badge

    %% 2. Checkout Process
    Customer->>Frontend: Click Checkout
    Frontend->>API: POST /api/cart/checkout
    API->>CartService: Validate Cart Items
    CartService->>ProductService: Check Stock Availability
    ProductService->>Database: Query Product Stock
    Database->>ProductService: Stock Data

    alt Stock Available
        ProductService->>CartService: Stock OK
        CartService->>API: Cart Valid

        API->>OrderService: Create Order
        OrderService->>Database: Insert Order (status: PENDING)
        Database->>OrderService: Order Created

        OrderService->>PaymentService: Create Payment Intent
        PaymentService->>Stripe: Create Payment Intent
        Stripe->>PaymentService: Client Secret
        PaymentService->>OrderService: Payment Intent Data
        OrderService->>API: Order + Client Secret
        API->>Frontend: Checkout Data
        Frontend->>Customer: Show Payment Form

    else Stock Insufficient
        ProductService->>CartService: Stock Insufficient
        CartService->>API: Stock Error
        API->>Frontend: Error Response
        Frontend->>Customer: "Product out of stock"
    end

    %% 3. Payment Processing
    Customer->>Frontend: Enter Card Details
    Frontend->>Stripe: Submit Payment (Stripe.js)
    Stripe->>Stripe: Process Payment

    alt Payment Success
        Stripe->>API: Webhook: payment_intent.succeeded
        API->>PaymentService: Handle Success Webhook
        PaymentService->>Database: Create Payment Record
        PaymentService->>OrderService: Payment Confirmed

        OrderService->>Database: Update Order Status (PAID)
        OrderService->>ProductService: Reduce Stock
        ProductService->>Database: Update Product Stock

        OrderService->>NotificationService: Order Confirmed
        NotificationService->>Database: Create Notification (Customer)
        NotificationService->>Database: Create Notification (Farmer)
        NotificationService->>Email: Send Confirmation Email
        Email->>Customer: Order Confirmation Email

        API->>Stripe: Webhook 200 OK
        Stripe->>Frontend: Payment Success Event
        Frontend->>CartService: Clear Cart
        Frontend->>Customer: Redirect to Order Success Page

    else Payment Failed
        Stripe->>API: Webhook: payment_intent.failed
        API->>PaymentService: Handle Failed Webhook
        PaymentService->>OrderService: Payment Failed
        OrderService->>Database: Update Order Status (FAILED)
        API->>Stripe: Webhook 200 OK
        Stripe->>Frontend: Payment Failed Event
        Frontend->>Customer: Show Error Message
    end

    %% 4. Order Fulfillment
    Note over Customer,Email: Farmer receives notification and prepares order

    Customer->>Frontend: Check Order Status
    Frontend->>API: GET /api/orders/:id
    API->>OrderService: Get Order Details
    OrderService->>Database: Query Order
    Database->>OrderService: Order Data
    OrderService->>API: Order Details
    API->>Frontend: Order Status
    Frontend->>Customer: Display Order Timeline
```

### Farm Registration & Verification Flow

```mermaid
sequenceDiagram
    participant Farmer
    participant Frontend
    participant API
    participant FarmService
    participant ValidationService
    participant Database
    participant NotificationService
    participant Admin
    participant Email

    %% 1. Farm Creation
    Farmer->>Frontend: Complete Farm Profile Form
    Frontend->>Frontend: Client Validation
    Farmer->>Frontend: Submit Form
    Frontend->>API: POST /api/farms

    API->>ValidationService: Validate Farm Data

    alt Validation Passes
        ValidationService->>API: Valid Data
        API->>FarmService: Create Farm

        FarmService->>Database: Insert Farm (status: PENDING)
        Database->>FarmService: Farm Created

        FarmService->>NotificationService: Farm Submitted
        NotificationService->>Database: Notify Admins
        NotificationService->>Email: Email Admin Team
        Email->>Admin: "New farm pending approval"

        FarmService->>API: Farm Data
        API->>Frontend: 201 Created
        Frontend->>Farmer: "Farm submitted for review"

    else Validation Fails
        ValidationService->>API: Validation Errors
        API->>Frontend: 400 Bad Request
        Frontend->>Farmer: Show Field Errors
    end

    %% 2. Admin Review
    Admin->>Frontend: Login to Admin Panel
    Frontend->>API: GET /api/admin/farms?status=PENDING
    API->>Database: Query Pending Farms
    Database->>API: Farm List
    API->>Frontend: Pending Farms
    Frontend->>Admin: Display Farm Queue

    Admin->>Frontend: Click Review Farm
    Frontend->>API: GET /api/admin/farms/:id
    API->>Database: Get Farm Details
    Database->>API: Farm Data
    API->>Frontend: Full Farm Profile
    Frontend->>Admin: Show Farm Details

    alt Admin Approves
        Admin->>Frontend: Click Approve
        Frontend->>API: POST /api/admin/farms/:id/approve
        API->>FarmService: Approve Farm

        FarmService->>Database: Update Farm (status: ACTIVE, verificationStatus: VERIFIED)
        Database->>FarmService: Farm Updated

        FarmService->>NotificationService: Farm Approved
        NotificationService->>Database: Create Notification (Farmer)
        NotificationService->>Email: Send Approval Email
        Email->>Farmer: "Your farm has been approved!"

        FarmService->>API: Success
        API->>Frontend: Farm Approved
        Frontend->>Admin: "Farm approved successfully"

    else Admin Rejects
        Admin->>Frontend: Enter Rejection Reason
        Admin->>Frontend: Click Reject
        Frontend->>API: POST /api/admin/farms/:id/reject
        API->>FarmService: Reject Farm

        FarmService->>Database: Update Farm (status: REJECTED, rejectionReason: "...")
        Database->>FarmService: Farm Updated

        FarmService->>NotificationService: Farm Rejected
        NotificationService->>Database: Create Notification (Farmer)
        NotificationService->>Email: Send Rejection Email
        Email->>Farmer: "Farm rejected: [reason]"

        FarmService->>API: Success
        API->>Frontend: Farm Rejected
        Frontend->>Admin: "Farm rejected"
    end

    %% 3. Farmer Response
    Farmer->>Frontend: Check Notification
    Frontend->>API: GET /api/notifications
    API->>Database: Query User Notifications
    Database->>API: Notifications
    API->>Frontend: Notification Data
    Frontend->>Farmer: Show Farm Status

    alt Farm Approved
        Farmer->>Frontend: Access Farm Dashboard
        Frontend->>API: GET /api/farms/my-farm
        API->>Database: Query Farmer's Farm
        Database->>API: Active Farm
        API->>Frontend: Farm Data
        Frontend->>Farmer: Farm Management Dashboard

    else Farm Rejected
        Farmer->>Frontend: Edit Farm Details
        Frontend->>API: PATCH /api/farms/:id
        API->>FarmService: Update Farm
        FarmService->>Database: Update & Resubmit (status: PENDING)
        Database->>FarmService: Farm Updated
        FarmService->>NotificationService: Notify Admins (Resubmission)
        NotificationService->>Email: Email Admin Team
        Email->>Admin: "Farm resubmitted for review"
    end
```

---

## 🎯 ARCHITECTURAL PRINCIPLES

### 1. **Separation of Concerns**

- **Presentation Layer**: UI components, pages, layouts
- **Business Logic Layer**: Services, validation, business rules
- **Data Access Layer**: Repositories, ORM, caching
- **Clear boundaries** between layers

### 2. **Type Safety First**

- **100% TypeScript** with strict mode
- **Zod validation** for runtime type checking
- **Prisma** for type-safe database access
- **No `any` types** allowed in production code

### 3. **Scalability by Design**

- **Stateless architecture** (scales horizontally)
- **Multi-layer caching** (Memory → Redis → Database)
- **Edge-first delivery** (Vercel global CDN)
- **Database connection pooling**

### 4. **Security by Default**

- **All routes authenticated** by default (opt-out for public)
- **HTTPS only** (no HTTP)
- **Security headers** on all responses
- **Input validation** on all endpoints
- **RBAC** for authorization

### 5. **Agricultural Consciousness**

- **Domain-driven design** (farming terminology)
- **Seasonal awareness** in business logic
- **Biodynamic patterns** in data models
- **Sustainability tracking**

### 6. **Performance Optimization**

- **Server-side rendering** for SEO
- **Static generation** for content pages
- **Code splitting** for smaller bundles
- **Image optimization** (Next.js Image)
- **Database query optimization** (indexes, select specific fields)

### 7. **Observability & Monitoring**

- **Comprehensive error tracking** (Sentry)
- **Distributed tracing** (OpenTelemetry)
- **Performance monitoring** (Vercel Analytics)
- **Uptime monitoring** (UptimeRobot)
- **Audit logging** (all critical actions)

### 8. **Developer Experience**

- **Clear code organization**
- **Consistent naming conventions**
- **Comprehensive documentation**
- **Automated testing** (unit, integration, e2e)
- **CI/CD pipeline** (automated deployments)

---

## 📈 PERFORMANCE TARGETS

```yaml
Load Times:
  Homepage (First Load): < 2.0 seconds
  Page Transitions: < 500ms
  API Response Time: < 200ms (average)
  Database Query Time: < 50ms (average)
  Time to Interactive (TTI): < 3.5 seconds

Throughput:
  Concurrent Users: 10,000+
  Requests per Second: 1,000+
  Database Connections: 100 (pooled)
  Redis Operations: 10,000+ ops/sec

Reliability:
  Uptime: 99.9%+
  Error Rate: < 0.1%
  Cache Hit Rate: > 80%
  Mean Time to Recovery (MTTR): < 5 minutes

Web Vitals (Core Web Vitals):
  Largest Contentful Paint (LCP): < 2.5 seconds
  First Input Delay (FID): < 100ms
  Cumulative Layout Shift (CLS): < 0.1

Security:
  SSL Labs Rating: A+
  Security Headers Score: A+
  OWASP Top 10: All addressed
  Vulnerability Scan: Weekly
```

---

## 🚀 DEPLOYMENT ARCHITECTURE

```mermaid
graph TB
    subgraph "DEVELOPMENT"
        DEV_CODE["💻 Local Development<br/>(localhost:3000)"]
        GIT["📦 Git Repository<br/>(GitHub)"]
    end

    subgraph "CI/CD PIPELINE"
        GITHUB_ACTIONS["⚙️ GitHub Actions<br/>(Automated Tests)"]
        TESTS["✅ Test Suite<br/>(Jest + Playwright)"]
        BUILD["🔨 Build Process<br/>(Next.js Build)"]
        LINT["🔍 Linting<br/>(ESLint + TypeScript)"]
    end

    subgraph "STAGING ENVIRONMENT"
        PREVIEW["🔍 Preview Deployment<br/>(Vercel Preview)"]
        STAGING_DB[("🐘 Staging Database")]
    end

    subgraph "PRODUCTION ENVIRONMENT"
        PROD_DEPLOY["🚀 Production Deployment<br/>(Vercel)"]
        PROD_DB[("🐘 Production Database")]
        PROD_REDIS[("⚡ Production Redis")]
        PROD
```
