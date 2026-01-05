# 🏗️ Complete Website Structure - Farmers Market Platform

**Version**: 2.0 - Professional Architecture
**Date**: January 3, 2026
**Status**: Production-Ready Blueprint

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Feature Breakdown](#feature-breakdown)
4. [API Routes](#api-routes)
5. [Components Library](#components-library)
6. [Services Layer](#services-layer)
7. [Database Schema Overview](#database-schema-overview)
8. [Implementation Priority](#implementation-priority)

---

## 🎯 Overview

This is a comprehensive marketplace platform connecting local farmers with customers, featuring:

- **Multi-role authentication** (Consumer, Farmer, Admin)
- **Farm management** (profiles, products, inventory)
- **E-commerce** (cart, checkout, payments via Stripe)
- **Order fulfillment** (delivery zones, pickup locations)
- **Analytics & reporting** (sales, performance metrics)
- **Communication** (notifications, messaging, support tickets)
- **Reviews & ratings** (farm and product reviews)
- **Advanced features** (saved searches, personalization, ML recommendations)

---

## 🗂️ Directory Structure

```
src/
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                  # Auth route group (unauthenticated layout)
│   │   ├── login/
│   │   │   └── page.tsx         # Login page
│   │   ├── signup/
│   │   │   └── page.tsx         # Registration page
│   │   ├── forgot-password/
│   │   │   └── page.tsx         # Password reset request
│   │   ├── reset-password/
│   │   │   └── page.tsx         # Password reset form
│   │   ├── verify-email/
│   │   │   └── page.tsx         # Email verification
│   │   └── layout.tsx           # Auth layout (minimal header)
│   │
│   ├── (public)/                # Public route group (marketing layout)
│   │   ├── about/
│   │   │   └── page.tsx         # About us
│   │   ├── how-it-works/
│   │   │   └── page.tsx         # Platform guide
│   │   ├── contact/
│   │   │   └── page.tsx         # Contact form
│   │   ├── faq/
│   │   │   └── page.tsx         # FAQ
│   │   ├── privacy/
│   │   │   └── page.tsx         # Privacy policy
│   │   ├── terms/
│   │   │   └── page.tsx         # Terms of service
│   │   └── layout.tsx           # Public layout (full header/footer)
│   │
│   ├── (marketplace)/           # Marketplace route group (browse/shop)
│   │   ├── farms/
│   │   │   ├── page.tsx         # Browse all farms
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx     # Individual farm page
│   │   │   └── loading.tsx      # Loading state
│   │   ├── products/
│   │   │   ├── page.tsx         # Browse products
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx     # Product detail page
│   │   │   ├── categories/
│   │   │   │   └── [category]/
│   │   │   │       └── page.tsx # Products by category
│   │   │   └── loading.tsx      # Loading state
│   │   ├── search/
│   │   │   └── page.tsx         # Search results
│   │   ├── cart/
│   │   │   └── page.tsx         # Shopping cart
│   │   ├── checkout/
│   │   │   └── page.tsx         # Checkout flow
│   │   └── layout.tsx           # Marketplace layout
│   │
│   ├── (customer)/              # Customer dashboard route group
│   │   ├── dashboard/
│   │   │   ├── page.tsx         # Customer dashboard home
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx     # Order history
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Order details
│   │   │   ├── favorites/
│   │   │   │   └── page.tsx     # Favorite farms/products
│   │   │   ├── addresses/
│   │   │   │   └── page.tsx     # Manage addresses
│   │   │   ├── profile/
│   │   │   │   └── page.tsx     # Edit profile
│   │   │   ├── settings/
│   │   │   │   └── page.tsx     # Account settings
│   │   │   └── reviews/
│   │   │       └── page.tsx     # My reviews
│   │   └── layout.tsx           # Customer dashboard layout
│   │
│   ├── (farmer)/                # Farmer dashboard route group
│   │   ├── dashboard/
│   │   │   ├── page.tsx         # Farmer dashboard home
│   │   │   ├── farm/
│   │   │   │   └── page.tsx     # Farm profile management
│   │   │   ├── products/
│   │   │   │   ├── page.tsx     # Product list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx # Add new product
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx # Edit product
│   │   │   │       └── inventory/
│   │   │   │           └── page.tsx # Inventory management
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx     # Order management
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Order fulfillment
│   │   │   ├── finances/
│   │   │   │   ├── page.tsx     # Financial overview
│   │   │   │   ├── payouts/
│   │   │   │   │   └── page.tsx # Payout history
│   │   │   │   └── stripe/
│   │   │   │       └── page.tsx # Stripe setup
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx     # Sales analytics
│   │   │   ├── reviews/
│   │   │   │   └── page.tsx     # Customer reviews
│   │   │   ├── team/
│   │   │   │   └── page.tsx     # Team member management
│   │   │   ├── settings/
│   │   │   │   └── page.tsx     # Farm settings
│   │   │   └── support/
│   │   │       └── page.tsx     # Support tickets
│   │   └── layout.tsx           # Farmer dashboard layout
│   │
│   ├── (admin)/                 # Admin dashboard route group
│   │   ├── dashboard/
│   │   │   ├── page.tsx         # Admin dashboard home
│   │   │   ├── farms/
│   │   │   │   ├── page.tsx     # Farm approvals
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Farm details/approval
│   │   │   ├── users/
│   │   │   │   ├── page.tsx     # User management
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # User details
│   │   │   ├── products/
│   │   │   │   └── page.tsx     # Product moderation
│   │   │   ├── orders/
│   │   │   │   └── page.tsx     # Order monitoring
│   │   │   ├── analytics/
│   │   │   │   ├── page.tsx     # Platform analytics
│   │   │   │   ├── revenue/
│   │   │   │   │   └── page.tsx # Revenue reports
│   │   │   │   └── performance/
│   │   │   │       └── page.tsx # Performance metrics
│   │   │   ├── support/
│   │   │   │   ├── page.tsx     # Support tickets
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Ticket details
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx     # System settings
│   │   │   │   ├── email/
│   │   │   │   │   └── page.tsx # Email templates
│   │   │   │   └── notifications/
│   │   │   │       └── page.tsx # Notification settings
│   │   │   └── audit-logs/
│   │   │       └── page.tsx     # Audit trail
│   │   └── layout.tsx           # Admin dashboard layout
│   │
│   ├── api/                     # API routes (see API Routes section)
│   │
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   ├── globals.css              # Global styles
│   ├── error.tsx                # Error boundary
│   ├── not-found.tsx            # 404 page
│   └── loading.tsx              # Global loading state
│
├── components/                  # React components
│   ├── ui/                      # Base UI components (shadcn/ui style)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── skeleton.tsx
│   │   ├── toast.tsx
│   │   ├── alert.tsx
│   │   ├── table.tsx
│   │   ├── pagination.tsx
│   │   ├── progress.tsx
│   │   └── ...
│   │
│   ├── layout/                  # Layout components
│   │   ├── Header.tsx           # Site header
│   │   ├── Footer.tsx           # Site footer
│   │   ├── Sidebar.tsx          # Dashboard sidebar
│   │   ├── MobileNav.tsx        # Mobile navigation
│   │   └── Breadcrumbs.tsx      # Breadcrumb navigation
│   │
│   ├── auth/                    # Authentication components
│   │   ├── LoginForm.tsx        # Login form
│   │   ├── SignupForm.tsx       # Registration form
│   │   ├── ForgotPasswordForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   ├── UserMenu.tsx         # User dropdown menu
│   │   └── AuthGuard.tsx        # Route protection HOC
│   │
│   ├── farm/                    # Farm-related components
│   │   ├── FarmCard.tsx         # Farm card (list view)
│   │   ├── FarmGrid.tsx         # Farm grid layout
│   │   ├── FarmHeader.tsx       # Farm profile header
│   │   ├── FarmInfo.tsx         # Farm information section
│   │   ├── FarmReviews.tsx      # Farm reviews section
│   │   ├── FarmProducts.tsx     # Farm products list
│   │   ├── FarmMap.tsx          # Farm location map
│   │   ├── FarmForm.tsx         # Farm create/edit form
│   │   ├── FarmStats.tsx        # Farm statistics
│   │   └── FarmTeamList.tsx     # Team member list
│   │
│   ├── product/                 # Product-related components
│   │   ├── ProductCard.tsx      # Product card (list view)
│   │   ├── ProductGrid.tsx      # Product grid layout
│   │   ├── ProductDetail.tsx    # Product detail view
│   │   ├── ProductForm.tsx      # Product create/edit form
│   │   ├── ProductGallery.tsx   # Product image gallery
│   │   ├── ProductFilters.tsx   # Search/filter sidebar
│   │   ├── ProductSort.tsx      # Sort dropdown
│   │   └── ProductInventory.tsx # Inventory management
│   │
│   ├── cart/                    # Shopping cart components
│   │   ├── CartButton.tsx       # Cart icon with count
│   │   ├── CartDrawer.tsx       # Cart sidebar/drawer
│   │   ├── CartItem.tsx         # Individual cart item
│   │   ├── CartSummary.tsx      # Cart total/summary
│   │   └── EmptyCart.tsx        # Empty cart state
│   │
│   ├── checkout/                # Checkout components
│   │   ├── CheckoutWizard.tsx   # Multi-step checkout
│   │   ├── AddressStep.tsx      # Address selection
│   │   ├── DeliveryStep.tsx     # Delivery/pickup selection
│   │   ├── PaymentStep.tsx      # Payment form
│   │   ├── ReviewStep.tsx       # Order review
│   │   ├── ConfirmationStep.tsx # Order confirmation
│   │   └── StripePaymentForm.tsx # Stripe integration
│   │
│   ├── order/                   # Order components
│   │   ├── OrderCard.tsx        # Order card (list view)
│   │   ├── OrderList.tsx        # Order list
│   │   ├── OrderDetail.tsx      # Order details view
│   │   ├── OrderStatus.tsx      # Status badge/timeline
│   │   ├── OrderTracking.tsx    # Order tracking info
│   │   └── OrderActions.tsx     # Cancel/return buttons
│   │
│   ├── dashboard/               # Dashboard components
│   │   ├── DashboardStats.tsx   # Stat cards
│   │   ├── DashboardChart.tsx   # Charts (using recharts)
│   │   ├── RecentOrders.tsx     # Recent orders widget
│   │   ├── QuickActions.tsx     # Quick action buttons
│   │   └── ActivityFeed.tsx     # Activity timeline
│   │
│   ├── analytics/               # Analytics components
│   │   ├── SalesChart.tsx       # Sales over time
│   │   ├── RevenueChart.tsx     # Revenue metrics
│   │   ├── TopProducts.tsx      # Top selling products
│   │   ├── CustomerInsights.tsx # Customer analytics
│   │   └── ExportButton.tsx     # Export data button
│   │
│   ├── review/                  # Review components
│   │   ├── ReviewCard.tsx       # Review display card
│   │   ├── ReviewList.tsx       # Review list
│   │   ├── ReviewForm.tsx       # Write review form
│   │   ├── RatingStars.tsx      # Star rating display
│   │   └── ReviewStats.tsx      # Review statistics
│   │
│   ├── notification/            # Notification components
│   │   ├── NotificationBell.tsx # Notification icon
│   │   ├── NotificationList.tsx # Notification dropdown
│   │   ├── NotificationCard.tsx # Single notification
│   │   └── NotificationSettings.tsx # Preferences form
│   │
│   ├── search/                  # Search components
│   │   ├── SearchBar.tsx        # Search input
│   │   ├── SearchResults.tsx    # Results display
│   │   ├── SearchFilters.tsx    # Filter sidebar
│   │   ├── SavedSearches.tsx    # Saved searches list
│   │   └── SearchSuggestions.tsx # Auto-complete suggestions
│   │
│   ├── admin/                   # Admin-specific components
│   │   ├── FarmApprovalCard.tsx # Farm approval card
│   │   ├── UserTable.tsx        # User management table
│   │   ├── AuditLogTable.tsx    # Audit log table
│   │   ├── SystemSettings.tsx   # System settings form
│   │   └── ModeratorActions.tsx # Moderation tools
│   │
│   ├── support/                 # Support components
│   │   ├── SupportTicketForm.tsx # Create ticket form
│   │   ├── SupportTicketCard.tsx # Ticket display
│   │   ├── TicketMessages.tsx   # Ticket conversation
│   │   └── TicketStatusBadge.tsx # Status indicator
│   │
│   └── shared/                  # Shared/utility components
│       ├── ErrorBoundary.tsx    # Error boundary wrapper
│       ├── LoadingSpinner.tsx   # Loading indicator
│       ├── EmptyState.tsx       # Empty state message
│       ├── ConfirmDialog.tsx    # Confirmation modal
│       ├── ImageUpload.tsx      # Image upload widget
│       ├── DatePicker.tsx       # Date picker
│       ├── LocationPicker.tsx   # Map location picker
│       ├── RichTextEditor.tsx   # WYSIWYG editor
│       └── DataTable.tsx        # Reusable data table
│
├── lib/                         # Business logic & utilities
│   ├── services/                # Service layer (business logic)
│   │   ├── auth.service.ts      # Authentication
│   │   ├── user.service.ts      # User management
│   │   ├── farm.service.ts      # Farm operations
│   │   ├── product.service.ts   # Product operations
│   │   ├── cart.service.ts      # Shopping cart
│   │   ├── order.service.ts     # Order processing
│   │   ├── payment.service.ts   # Payment processing
│   │   ├── notification.service.ts # Notifications
│   │   ├── email.service.ts     # Email sending
│   │   ├── review.service.ts    # Reviews & ratings
│   │   ├── search.service.ts    # Search functionality
│   │   ├── analytics.service.ts # Analytics
│   │   ├── support.service.ts   # Support tickets
│   │   └── storage.service.ts   # File storage (S3/CloudFlare)
│   │
│   ├── database/                # Database utilities
│   │   ├── index.ts             # Prisma singleton
│   │   └── seed/                # Seed scripts
│   │       ├── users.ts
│   │       ├── farms.ts
│   │       └── products.ts
│   │
│   ├── auth/                    # Authentication
│   │   ├── next-auth.config.ts  # NextAuth v5 config
│   │   ├── auth.ts              # Auth helpers
│   │   └── middleware.ts        # Auth middleware
│   │
│   ├── validation/              # Input validation schemas
│   │   ├── auth.schema.ts       # Auth validation
│   │   ├── farm.schema.ts       # Farm validation
│   │   ├── product.schema.ts    # Product validation
│   │   ├── order.schema.ts      # Order validation
│   │   └── user.schema.ts       # User validation
│   │
│   ├── utils/                   # Utility functions
│   │   ├── format.ts            # Formatting (dates, currency)
│   │   ├── slug.ts              # Slug generation
│   │   ├── validation.ts        # Custom validators
│   │   ├── encryption.ts        # Encryption helpers
│   │   ├── image.ts             # Image processing
│   │   └── constants.ts         # App constants
│   │
│   ├── stripe/                  # Stripe integration
│   │   ├── client.ts            # Stripe client setup
│   │   ├── checkout.ts          # Checkout session
│   │   ├── webhooks.ts          # Webhook handlers
│   │   └── connect.ts           # Stripe Connect
│   │
│   └── integrations/            # External integrations
│       ├── sendgrid.ts          # Email service
│       ├── twilio.ts            # SMS service
│       ├── aws-s3.ts            # File storage
│       └── google-maps.ts       # Maps API
│
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts               # Auth state
│   ├── useCart.ts               # Cart state
│   ├── useDebounce.ts           # Debounce
│   ├── useLocalStorage.ts       # Local storage
│   ├── useMediaQuery.ts         # Responsive
│   ├── useToast.ts              # Toast notifications
│   └── usePagination.ts         # Pagination
│
├── types/                       # TypeScript types
│   ├── index.ts                 # Re-exports
│   ├── auth.ts                  # Auth types
│   ├── farm.ts                  # Farm types
│   ├── product.ts               # Product types
│   ├── order.ts                 # Order types
│   ├── api.ts                   # API response types
│   └── ...
│
├── config/                      # Configuration
│   ├── site.ts                  # Site metadata
│   ├── routes.ts                # Route definitions
│   └── features.ts              # Feature flags
│
└── middleware.ts                # Next.js middleware (auth)
```

---

## 🎯 Feature Breakdown

### 1. Authentication & Authorization

**Pages**:
- `/login` - User login
- `/signup` - User registration (role selection: Customer/Farmer)
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form
- `/verify-email` - Email verification

**Features**:
- Email/password authentication
- Email verification flow
- Password reset flow
- Role-based access control (CONSUMER, FARMER, ADMIN)
- Session management
- Protected routes

---

### 2. Public Marketing Pages

**Pages**:
- `/` - Homepage (hero, featured farms, how it works)
- `/about` - About the platform
- `/how-it-works` - How to use the platform
- `/contact` - Contact form
- `/faq` - Frequently asked questions
- `/privacy` - Privacy policy
- `/terms` - Terms of service

**Features**:
- SEO-optimized content
- Responsive design
- Newsletter signup
- Social media links

---

### 3. Marketplace (Browse & Shop)

**Pages**:
- `/farms` - Browse all farms (grid/list view, filters)
- `/farms/[slug]` - Individual farm profile
- `/products` - Browse all products (grid/list view, filters)
- `/products/[id]` - Product detail page
- `/products/categories/[category]` - Products by category
- `/search` - Search results (farms & products)
- `/cart` - Shopping cart
- `/checkout` - Checkout flow (multi-step wizard)

**Features**:
- Farm browsing with filters (location, category, rating)
- Product browsing with filters (category, price, availability)
- Search functionality (fuzzy search, filters)
- Favorites/wishlist
- Shopping cart (add/remove items, quantity)
- Checkout wizard (address → delivery → payment → review → confirm)
- Stripe payment integration
- Order placement

---

### 4. Customer Dashboard

**Pages**:
- `/customer/dashboard` - Dashboard home (stats, recent orders)
- `/customer/dashboard/orders` - Order history
- `/customer/dashboard/orders/[id]` - Order details & tracking
- `/customer/dashboard/favorites` - Favorite farms & products
- `/customer/dashboard/addresses` - Manage delivery addresses
- `/customer/dashboard/profile` - Edit profile
- `/customer/dashboard/settings` - Account settings
- `/customer/dashboard/reviews` - My reviews

**Features**:
- Order history & tracking
- Reorder functionality
- Favorite farms/products
- Multiple delivery addresses
- Profile management
- Notification preferences
- Write/edit reviews

---

### 5. Farmer Dashboard

**Pages**:
- `/farmer/dashboard` - Dashboard home (sales stats, recent orders)
- `/farmer/dashboard/farm` - Farm profile management
- `/farmer/dashboard/products` - Product list (CRUD)
- `/farmer/dashboard/products/new` - Add new product
- `/farmer/dashboard/products/[id]` - Edit product
- `/farmer/dashboard/products/[id]/inventory` - Inventory management
- `/farmer/dashboard/orders` - Order management
- `/farmer/dashboard/orders/[id]` - Order fulfillment
- `/farmer/dashboard/finances` - Financial overview
- `/farmer/dashboard/finances/payouts` - Payout history
- `/farmer/dashboard/finances/stripe` - Stripe Connect setup
- `/farmer/dashboard/analytics` - Sales analytics & charts
- `/farmer/dashboard/reviews` - Customer reviews
- `/farmer/dashboard/team` - Team member management
- `/farmer/dashboard/settings` - Farm settings
- `/farmer/dashboard/support` - Support tickets

**Features**:
- Farm profile management (name, description, images, location)
- Product management (create, edit, delete, bulk upload)
- Inventory tracking (stock levels, low stock alerts)
- Order management (view, fulfill, track)
- Stripe Connect onboarding
- Payout tracking
- Sales analytics (charts, revenue, top products)
- Review management
- Team member invitations
- Delivery zone configuration
- Pickup location setup
- Support ticket creation

---

### 6. Admin Dashboard

**Pages**:
- `/admin/dashboard` - Dashboard home (platform stats)
- `/admin/dashboard/farms` - Farm approval queue
- `/admin/dashboard/farms/[id]` - Farm approval details
- `/admin/dashboard/users` - User management
- `/admin/dashboard/users/[id]` - User details
- `/admin/dashboard/products` - Product moderation
- `/admin/dashboard/orders` - Order monitoring
- `/admin/dashboard/analytics` - Platform analytics
- `/admin/dashboard/analytics/revenue` - Revenue reports
- `/admin/dashboard/analytics/performance` - Performance metrics
- `/admin/dashboard/support` - Support ticket management
- `/admin/dashboard/support/[id]` - Ticket details
- `/admin/dashboard/settings` - System settings
- `/admin/dashboard/settings/email` - Email templates
- `/admin/dashboard/settings/notifications` - Notification config
- `/admin/dashboard/audit-logs` - Audit trail

**Features**:
- Farm approval workflow
- User management (suspend, activate, delete)
- Product moderation
- Order monitoring
- Platform-wide analytics
- Revenue reports
- Support ticket management
- System settings configuration
- Email template management
- Audit log viewing

---

### 7. Reviews & Ratings

**Features**:
- Farm reviews (rating + text review)
- Product reviews (rating + text review)
- Review moderation (admin)
- Review responses (farmer replies)
- Review filtering & sorting
- Average rating calculation
- Review helpful votes

---

### 8. Notifications

**Features**:
- Real-time notifications (new order, order status change)
- Email notifications (order confirmation, payout, etc.)
- In-app notification center
- Notification preferences (email, SMS, push)
- Notification read/unread status
- Bulk mark as read

---

### 9. Search & Discovery

**Features**:
- Global search (farms + products)
- Advanced filters (location, category, price, rating)
- Search suggestions (auto-complete)
- Saved searches
- Search alerts (notify when new items match criteria)
- Personalized recommendations (ML-based)
- Frequently bought together
- Recently viewed items

---

### 10. Analytics & Reporting

**Farmer Analytics**:
- Sales over time (daily, weekly, monthly)
- Revenue metrics
- Top-selling products
- Order statistics
- Customer insights

**Admin Analytics**:
- Platform-wide sales
- Revenue by farm
- User growth
- Order volume
- Performance metrics

---

### 11. Support System

**Features**:
- Support ticket creation
- Ticket categories (technical, billing, general)
- Ticket priority levels
- Ticket conversation (messages, attachments)
- Ticket status tracking
- Admin ticket management

---

### 12. Advanced Features (Phase 2)

**Machine Learning**:
- Product recommendations
- Search personalization
- Price optimization
- Demand forecasting

**Agricultural Features**:
- Biodynamic calendar
- Soil analysis tracking
- Weather data integration
- Crop rotation planning
- Harvest scheduling

**Community Features**:
- Farmer forums
- Recipe sharing
- Cooking classes
- Farm events

---

## 🌐 API Routes

```
/api/
├── auth/
│   ├── [...nextauth]/route.ts          # NextAuth endpoints
│   ├── signup/route.ts                 # POST - Register
│   ├── verify-email/route.ts           # POST - Verify email
│   ├── forgot-password/route.ts        # POST - Request password reset
│   └── reset-password/route.ts         # POST - Reset password
│
├── users/
│   ├── profile/route.ts                # GET, PATCH - User profile
│   ├── addresses/route.ts              # GET, POST - Addresses
│   ├── addresses/[id]/route.ts         # GET, PATCH, DELETE
│   ├── favorites/route.ts              # GET, POST, DELETE
│   └── settings/route.ts               # GET, PATCH - Settings
│
├── farms/
│   ├── route.ts                        # GET, POST - List/create farms
│   ├── [id]/route.ts                   # GET, PATCH, DELETE
│   ├── [id]/products/route.ts          # GET - Farm products
│   ├── [id]/reviews/route.ts           # GET, POST - Farm reviews
│   └── featured/route.ts               # GET - Featured farms
│
├── products/
│   ├── route.ts                        # GET, POST - List/create products
│   ├── [id]/route.ts                   # GET, PATCH, DELETE
│   ├── [id]/inventory/route.ts         # GET, PATCH - Inventory
│   ├── [id]/reviews/route.ts           # GET, POST - Product reviews
│   ├── search/route.ts                 # GET - Search products
│   └── categories/[category]/route.ts  # GET - By category
│
├── cart/
│   ├── route.ts                        # GET, POST - Cart operations
│   ├── [itemId]/route.ts               # PATCH, DELETE - Update/remove item
│   └── sync/route.ts                   # POST - Sync cart (for auth users)
│
├── checkout/
│   ├── create-payment-intent/route.ts  # POST - Create Stripe intent
│   └── create-order/route.ts           # POST - Place order
│
├── orders/
│   ├── route.ts                        # GET - List orders
│   ├── [id]/route.ts                   # GET, PATCH - Order details
│   ├── [id]/cancel/route.ts            # POST - Cancel order
│   └── [id]/tracking/route.ts          # GET - Tracking info
│
├── payments/
│   ├── webhook/route.ts                # POST - Stripe webhook
│   ├── methods/route.ts                # GET, POST - Payment methods
│   └── refund/route.ts                 # POST - Refund payment
│
├── reviews/
│   ├── route.ts                        # GET, POST - Reviews
│   ├── [id]/route.ts                   # GET, PATCH, DELETE
│   └── [id]/helpful/route.ts           # POST - Mark helpful
│
├── notifications/
│   ├── route.ts                        # GET, POST - Notifications
│   ├── [id]/route.ts                   # PATCH - Mark as read
│   └── mark-all-read/route.ts          # POST - Mark all read
│
├── search/
│   ├── route.ts                        # GET - Global search
│   ├── suggestions/route.ts            # GET - Auto-complete
│   ├── saved/route.ts                  # GET, POST - Saved searches
│   └── alerts/route.ts                 # GET, POST - Search alerts
│
├── analytics/
│   ├── sales/route.ts                  # GET - Sales data
│   ├── revenue/route.ts                # GET - Revenue data
│   ├── products/route.ts               # GET - Product analytics
│   └── customers/route.ts              # GET - Customer insights
│
├── support/
│   ├── tickets/route.ts                # GET, POST - Support tickets
│   ├── tickets/[id]/route.ts           # GET, PATCH
│   └── tickets/[id]/messages/route.ts  # GET, POST - Messages
│
├── admin/
│   ├── farms/approve/route.ts          # POST - Approve farm
│   ├── farms/reject/route.ts           # POST - Reject farm
│   ├── users/[id]/suspend/route.ts     # POST - Suspend user
│   ├── users/[id]/activate/route.ts    # POST - Activate user
│   ├── analytics/platform/route.ts     # GET - Platform analytics
│   └── audit-logs/route.ts             # GET - Audit logs
│
├── stripe/
│   ├── connect/onboard/route.ts        # POST - Start onboarding
│   ├── connect/refresh/route.ts        # POST - Refresh onboarding
│   └── connect/account/route.ts        # GET - Account status
│
└── health/
    ├── route.ts                        # GET - Health check
    └── database/route.ts               # GET - Database health
```

---

## 🧩 Components Library

### Base UI Components (shadcn/ui style)

```typescript
// button.tsx
interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

// card.tsx
interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

// input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// ... and more
```

### Feature Components

```typescript
// FarmCard.tsx
interface FarmCardProps {
  farm: {
    id: string;
    name: string;
    slug: string;
    description: string;
    logoUrl: string;
    city: string;
    state: string;
    averageRating: number;
    reviewCount: number;
  };
  showFavorite?: boolean;
}

// ProductCard.tsx
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    unit: string;
    images: string[];
    farm: { name: string; slug: string };
    inStock: boolean;
  };
  onAddToCart?: () => void;
}

// CheckoutWizard.tsx
interface CheckoutWizardProps {
  cart: CartItem[];
  onComplete: (orderId: string) => void;
}

// ... and more
```

---

## 🔧 Services Layer

### Service Structure

```typescript
// farm.service.ts
export class FarmService {
  async createFarm(data: CreateFarmRequest): Promise<Farm>
  async getFarmById(id: string): Promise<Farm | null>
  async getFarmBySlug(slug: string): Promise<Farm | null>
  async updateFarm(id: string, data: UpdateFarmRequest): Promise<Farm>
  async deleteFarm(id: string): Promise<void>
  async listFarms(filters: FarmFilters): Promise<PaginatedResult<Farm>>
  async approveFarm(id: string, adminId: string): Promise<Farm>
  async rejectFarm(id: string, adminId: string, reason: string): Promise<Farm>
}

// product.service.ts
export class ProductService {
  async createProduct(data: CreateProductRequest): Promise<Product>
  async getProductById(id: string): Promise<Product | null>
  async updateProduct(id: string, data: UpdateProductRequest): Promise<Product>
  async deleteProduct(id: string): Promise<void>
  async listProducts(filters: ProductFilters): Promise<PaginatedResult<Product>>
  async updateInventory(id: string, quantity: number): Promise<Product>
  async searchProducts(query: string, filters: SearchFilters): Promise<PaginatedResult<Product>>
}

// order.service.ts
export class OrderService {
  async createOrder(data: CreateOrderRequest): Promise<Order>
  async getOrderById(id: string): Promise<Order | null>
  async listOrders(userId: string, filters: OrderFilters): Promise<PaginatedResult<Order>>
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order>
  async cancelOrder(id: string, userId: string): Promise<Order>
  async fulfillOrder(id: string, farmId: string, trackingInfo: TrackingInfo): Promise<Order>
}

// payment.service.ts
export class PaymentService {
  async createPaymentIntent(amount: number, currency: string): Promise<PaymentIntent>
  async confirmPayment(paymentIntentId: string): Promise<Payment>
  async refundPayment(paymentId: string, amount: number): Promise<Refund>
  async processStripeWebhook(event: Stripe.Event): Promise<void>
}

// ... and more
```

---

## 🗄️ Database Schema Overview

Based on Prisma schema, the database includes:

### Core Models

- **User** - User accounts (consumers, farmers, admins)
- **Farm** - Farm profiles and information
- **Product** - Products sold by farms
- **Order** - Customer orders
- **OrderItem** - Individual items in an order
- **Payment** - Payment transactions
- **Review** - Farm and product reviews
- **Notification** - User notifications
- **Message** - User messaging

### E-commerce Models

- **CartItem** - Shopping cart items
- **Fulfillment** - Order fulfillment tracking
- **Payout** - Farmer payouts
- **Refund** - Payment refunds

### Farm Management

- **FarmTeamMember** - Farm team members
- **FarmPhoto** - Farm photo gallery
- **FarmCertification** - Organic/certifications
- **Inventory** - Product inventory tracking
- **InventoryLog** - Inventory changes

### Advanced Features

- **SavedSearch** - User saved searches
- **SearchAlert** - Search notifications
- **Recommendation** - ML recommendations
- **AnalyticsEvent** - User interactions
- **SupportTicket** - Support tickets
- **AuditLog** - System audit trail

### Agricultural Features (Optional)

- **BiodynamicCalendar** - Planting calendar
- **SoilAnalysis** - Soil health tracking
- **WeatherData** - Weather integration
- **CropRotation** - Crop rotation plans
- **HarvestSchedule** - Harvest planning

---

## 📅 Implementation Priority

### Phase 1: MVP Core (Weeks 1-3)

**Week 1: Foundation**
- [ ] Authentication (login, signup, email verification)
- [ ] User profile management
- [ ] Database services (farm, product, user)
- [ ] Basic layouts (header, footer, sidebar)

**Week 2: Marketplace**
- [ ] Farm browsing & detail pages
- [ ] Product browsing & detail pages
- [ ] Search functionality
- [ ] Shopping cart
- [ ] Favorites/wishlist

**Week 3: Checkout & Orders**
- [ ] Checkout wizard
- [ ] Stripe payment integration
- [ ] Order creation
- [ ] Order history (customer)
- [ ] Email notifications

### Phase 2: Dashboards (Weeks 4-5)

**Week 4: Farmer Dashboard**
- [ ] Farm profile management
- [ ] Product CRUD operations
- [ ] Inventory management
- [ ] Order fulfillment
- [ ] Stripe Connect onboarding

**Week 5: Customer & Admin Dashboards**
- [ ] Customer dashboard (orders, profile, addresses)
- [ ] Admin dashboard (farm approvals, user management)
- [ ] Basic analytics
- [ ] Review system

### Phase 3: Polish & Launch (Week 6)

**Week 6: Launch Preparation**
- [ ] UI/UX refinement
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Testing (80%+ coverage)
- [ ] SEO optimization
- [ ] Production deployment

### Phase 4: Advanced Features (Post-Launch)

**Future Enhancements**:
- [ ] Advanced analytics & reporting
- [ ] ML recommendations
- [ ] Support ticket system
- [ ] Team member management
- [ ] Agricultural tracking features
- [ ] Community features (forums, events)
- [ ] Mobile app (React Native)

---

## 🎨 Design Patterns

### Naming Conventions

```typescript
// ✅ Components - PascalCase
FarmCard.tsx
ProductGrid.tsx
CheckoutWizard.tsx

// ✅ Services - camelCase with .service suffix
farm.service.ts
product.service.ts
order.service.ts

// ✅ Hooks - camelCase with use prefix
useAuth.ts
useCart.ts
useDebounce.ts

// ✅ Types - PascalCase
Farm
Product
Order
CreateFarmRequest
UpdateProductRequest

// ✅ API Routes - kebab-case
/api/farms
/api/products/[id]
/api/checkout/create-payment-intent
```

### Folder Organization

- **By feature** for domain-specific code (farm/, product/, order/)
- **By type** for shared code (ui/, layout/, shared/)
- **Flat when possible** (avoid deep nesting)

### Code Organization

```typescript
// Component structure
export function FarmCard({ farm }: FarmCardProps) {
  // 1. Hooks
  const { user } = useAuth();
  const { addFavorite } = useFavorites();

  // 2. State
  const [isHovered, setIsHovered] = useState(false);

  // 3. Computed values
  const ratingDisplay = farm.averageRating?.toFixed(1) || 'No ratings';

  // 4. Event handlers
  const handleFavoriteClick = () => {
    addFavorite(farm.id);
  };

  // 5. Effects
  useEffect(() => {
    // ...
  }, []);

  // 6. Render
  return (
    <Card>
      {/* ... */}
    </Card>
  );
}
```

---

## 🚀 Quick Start Checklist

### Setup (Day 1)
- [ ] Review this document
- [ ] Set up environment variables
- [ ] Configure database
- [ ] Run Prisma migrations
- [ ] Seed initial data

### Week 1: Authentication
- [ ] Implement login/signup pages
- [ ] Set up NextAuth v5
- [ ] Create protected route middleware
- [ ] Build user profile page

### Week 2: Marketplace
- [ ] Create farm browsing page
- [ ] Create product browsing page
- [ ] Implement search functionality
- [ ] Build shopping cart

### Week 3: Checkout
- [ ] Build checkout wizard
- [ ] Integrate Stripe
- [ ] Implement order creation
- [ ] Set up email notifications

---

## 📚 Additional Resources

- **Design System**: Use shadcn/ui components as base
- **Icons**: Lucide React or Heroicons
- **Charts**: Recharts or Chart.js
- **Maps**: Google Maps API or Mapbox
- **Email**: SendGrid or Resend
- **File Storage**: AWS S3 or Cloudflare R2
- **Monitoring**: Sentry for errors, Vercel Analytics

---

**Next Steps**: Start with Phase 1, Week 1. Focus on authentication and core layouts first. Build incrementally and test as you go.

**Remember**: Professional naming, clean architecture, and test coverage are priorities. No metaphorical naming!
