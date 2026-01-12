# 🗺️ Farmers Market Platform - Visual Sitemap & User Flows

**Date:** January 12, 2026  
**Version:** 1.1.0  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Complete Sitemap](#complete-sitemap)
2. [User Role Structure](#user-role-structure)
3. [Customer User Flow](#customer-user-flow)
4. [Farmer User Flow](#farmer-user-flow)
5. [Admin User Flow](#admin-user-flow)
6. [Authentication Flow](#authentication-flow)
7. [Purchase Flow](#purchase-flow)
8. [Mobile App Structure](#mobile-app-structure)

---

## 🗺️ Complete Sitemap

```
                    🌾 FARMERS MARKET PLATFORM
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
      ┏━━━━━▼━━━━━┓     ┏━━━━▼━━━━┓     ┏━━━━▼━━━━┓
      ┃  PUBLIC   ┃     ┃ CUSTOMER ┃     ┃ FARMER  ┃
      ┃   PAGES   ┃     ┃  PORTAL  ┃     ┃ PORTAL  ┃
      ┗━━━━━┬━━━━━┛     ┗━━━━┬━━━━━┛     ┗━━━━┬━━━━┛
            │                 │                 │
            │                 │                 │
    ┌───────┼───────┐   ┌─────┼─────┐    ┌─────┼─────┐
    │       │       │   │     │     │    │     │     │
┌───▼───┐ ┌─▼──┐ ┌──▼─┐ │  ┌──▼──┐ │ ┌──▼──┐ │  ┌──▼──┐
│ Home  │ │Auth│ │Info│ │  │Shop │ │ │Manage│ │  │Sales│
└───────┘ └────┘ └────┘ │  └─────┘ │ └─────┘ │  └─────┘
                        │          │         │
                   ┏━━━━▼━━━━┓     │    ┏━━━━▼━━━━┓
                   ┃  ADMIN  ┃     │    ┃  API    ┃
                   ┃ PORTAL  ┃     │    ┃  DOCS   ┃
                   ┗━━━━━━━━━┛     │    ┗━━━━━━━━━┛
                                   │
                            ┌──────┴──────┐
                            │             │
                      ┏━━━━━▼━━━━━┓ ┏━━━━▼━━━━━┓
                      ┃  MOBILE   ┃ ┃  LEGAL  ┃
                      ┃    APP    ┃ ┃  PAGES  ┃
                      ┗━━━━━━━━━━━┛ ┗━━━━━━━━━┛
```

---

## 🌐 Detailed Sitemap Structure

### PUBLIC PAGES (/)

```
/ (Root - Homepage)
│
├── /about
│   └── About Us
│
├── /contact
│   ├── Contact Form
│   └── FAQ
│
├── /how-it-works
│   ├── For Customers
│   └── For Farmers
│
├── /marketplace
│   ├── /products
│   │   ├── /products/[id]
│   │   └── /products/category/[category]
│   └── /search
│       └── Search Results
│
├── /farms
│   ├── Farm Directory
│   └── /farms/[id]
│       ├── Farm Profile
│       ├── Products
│       └── Reviews
│
├── /faq
│   ├── Customer FAQ
│   ├── Farmer FAQ
│   └── General FAQ
│
└── /shipping
    ├── Delivery Areas
    ├── Shipping Rates
    └── Policies
```

### AUTHENTICATION (/auth)

```
/login
│   ├── Email/Password
│   ├── Social Login (Google, Facebook)
│   └── Remember Me
│
/register
│   ├── Customer Registration
│   └── Role Selection
│
/register-farm
│   ├── Farmer Registration
│   ├── Farm Details
│   └── Verification
│
/signup
│   └── Quick Signup
│
/forgot-password
│   └── Password Reset Request
│
└── /reset-password
    └── New Password Form
```

### CUSTOMER PORTAL (/customer)

```
/customer
│
├── /dashboard
│   ├── Overview
│   ├── Recent Orders
│   ├── Favorites
│   └── Recommendations
│
├── /marketplace
│   ├── Browse Products
│   ├── Filter & Search
│   └── /product/[id]
│       ├── Product Details
│       ├── Reviews
│       ├── Similar Products
│       └── Add to Cart
│
├── /farms
│   ├── Browse Farms
│   └── /farm/[id]
│       ├── Farm Profile
│       ├── Farm Products
│       ├── Farm Story
│       └── Reviews
│
├── /cart
│   ├── Cart Items
│   ├── Update Quantities
│   ├── Apply Coupons
│   └── Proceed to Checkout
│
├── /checkout
│   ├── /delivery
│   │   ├── Shipping Address
│   │   └── Delivery Options
│   ├── /payment
│   │   ├── Payment Method
│   │   ├── Billing Address
│   │   └── Order Review
│   └── /confirmation
│       ├── Order Confirmed
│       ├── Order Summary
│       └── Track Order
│
├── /orders
│   ├── Order History
│   ├── /orders/[id]
│   │   ├── Order Details
│   │   ├── Tracking Info
│   │   ├── Invoice
│   │   └── Rate & Review
│   └── /orders/track/[id]
│       └── Live Tracking
│
├── /favorites
│   ├── Saved Products
│   └── Saved Farms
│
├── /reviews
│   ├── My Reviews
│   └── Write Review
│
└── /settings
    ├── /profile
    │   ├── Personal Info
    │   ├── Email/Phone
    │   └── Password
    ├── /addresses
    │   ├── Saved Addresses
    │   └── Add/Edit Address
    ├── /payment-methods
    │   ├── Saved Cards
    │   └── Add Payment Method
    ├── /notifications
    │   ├── Email Preferences
    │   ├── SMS Preferences
    │   └── Push Notifications
    └── /account
        ├── Subscription
        ├── Privacy Settings
        └── Delete Account
```

### FARMER PORTAL (/farmer)

```
/farmer
│
├── /dashboard
│   ├── Overview Stats
│   ├── Recent Orders
│   ├── Revenue Chart
│   ├── Alerts & Notifications
│   ├── Biodynamic Calendar
│   └── AI Recommendations
│
├── /farms
│   ├── My Farms
│   └── /farms/[id]
│       ├── /profile
│       │   ├── Basic Info
│       │   ├── Description
│       │   ├── Photos
│       │   ├── Certifications
│       │   └── Location
│       ├── /settings
│       │   ├── Business Hours
│       │   ├── Delivery Areas
│       │   └── Payment Settings
│       └── /analytics
│           ├── Performance
│           └── Customer Insights
│
├── /products
│   ├── All Products
│   ├── /add
│   │   ├── Basic Info
│   │   ├── Pricing
│   │   ├── Inventory
│   │   ├── Photos
│   │   └── Publish
│   ├── /edit/[id]
│   │   └── Edit Product
│   └── /inventory
│       ├── Stock Levels
│       ├── Low Stock Alerts
│       └── Bulk Update
│
├── /orders
│   ├── All Orders
│   ├── /orders/[id]
│   │   ├── Order Details
│   │   ├── Customer Info
│   │   ├── Items
│   │   └── Actions
│   ├── /pending
│   │   └── New Orders
│   ├── /processing
│   │   └── In Progress
│   ├── /ready
│   │   └── Ready for Pickup
│   └── /completed
│       └── Completed Orders
│
├── /analytics
│   ├── /revenue
│   │   ├── Revenue Trends
│   │   ├── Revenue by Product
│   │   └── Revenue by Category
│   ├── /customers
│   │   ├── Customer Growth
│   │   ├── Top Customers
│   │   └── Customer Lifetime Value
│   ├── /products
│   │   ├── Best Sellers
│   │   ├── Low Performers
│   │   └── Inventory Turnover
│   └── /reports
│       ├── Sales Reports
│       ├── Tax Reports
│       └── Export Data
│
├── /finances
│   ├── /earnings
│   │   ├── Total Earnings
│   │   ├── Pending Payouts
│   │   └── Transaction History
│   ├── /payouts
│   │   ├── Payout Schedule
│   │   └── Bank Account
│   └── /taxes
│       ├── Tax Documents
│       └── 1099 Forms
│
├── /reviews
│   ├── All Reviews
│   ├── Respond to Reviews
│   └── Rating Overview
│
├── /messages
│   ├── Customer Messages
│   ├── Support Tickets
│   └── Send Message
│
└── /settings
    ├── /profile
    │   ├── Farmer Info
    │   └── Change Password
    ├── /notifications
    │   ├── Order Alerts
    │   ├── Low Stock Alerts
    │   └── Review Notifications
    └── /preferences
        ├── Language
        ├── Time Zone
        └── Units (Imperial/Metric)
```

### ADMIN PORTAL (/admin)

```
/admin
│
├── /dashboard
│   ├── Platform Overview
│   ├── Key Metrics
│   ├── Revenue Chart
│   ├── User Growth
│   └── System Health
│
├── /users
│   ├── All Users
│   ├── /users/[id]
│   │   ├── User Profile
│   │   ├── Order History
│   │   ├── Activity Log
│   │   └── Actions (Ban, Delete, etc.)
│   ├── /customers
│   │   └── Customer Management
│   ├── /farmers
│   │   └── Farmer Management
│   └── /admins
│       └── Admin Management
│
├── /farms
│   ├── All Farms
│   ├── /farms/[id]
│   │   ├── Farm Details
│   │   ├── Products
│   │   ├── Orders
│   │   └── Reviews
│   ├── /pending-approval
│   │   └── New Farm Registrations
│   ├── /active
│   │   └── Active Farms
│   └── /suspended
│       └── Suspended Farms
│
├── /products
│   ├── All Products
│   ├── /products/[id]
│   │   ├── Product Details
│   │   └── Edit/Remove
│   ├── /categories
│   │   ├── Manage Categories
│   │   └── Add/Edit Category
│   └── /pending-review
│       └── Products Awaiting Approval
│
├── /orders
│   ├── All Orders
│   ├── /orders/[id]
│   │   ├── Order Details
│   │   └── Take Action
│   ├── /flagged
│   │   └── Flagged Orders
│   └── /disputes
│       ├── Active Disputes
│       └── Resolve Disputes
│
├── /reviews
│   ├── All Reviews
│   ├── /flagged
│   │   └── Flagged Reviews
│   └── /moderate
│       └── Review Moderation
│
├── /reports
│   ├── /financial
│   │   ├── Revenue Reports
│   │   ├── Commission Reports
│   │   └── Tax Reports
│   ├── /operations
│   │   ├── Order Reports
│   │   ├── Delivery Reports
│   │   └── Inventory Reports
│   ├── /analytics
│   │   ├── User Analytics
│   │   ├── Farm Performance
│   │   └── Product Analytics
│   └── /export
│       └── Export Data
│
├── /content
│   ├── /pages
│   │   ├── Homepage
│   │   ├── About
│   │   └── FAQ
│   ├── /blog
│   │   ├── All Posts
│   │   └── Add/Edit Post
│   └── /banners
│       ├── Homepage Banners
│       └── Promotional Banners
│
├── /settings
│   ├── /general
│   │   ├── Site Settings
│   │   ├── Contact Info
│   │   └── Social Media
│   ├── /payment
│   │   ├── Stripe Configuration
│   │   ├── Commission Rates
│   │   └── Payout Settings
│   ├── /shipping
│   │   ├── Delivery Zones
│   │   ├── Shipping Rates
│   │   └── Carriers
│   ├── /email
│   │   ├── Email Templates
│   │   ├── SMTP Settings
│   │   └── Notifications
│   ├── /sms
│   │   ├── Twilio Settings
│   │   └── SMS Templates
│   └── /advanced
│       ├── API Keys
│       ├── Webhooks
│       └── Integrations
│
├── /system
│   ├── /logs
│   │   ├── Error Logs
│   │   ├── Activity Logs
│   │   └── API Logs
│   ├── /cache
│   │   ├── Cache Status
│   │   └── Clear Cache
│   ├── /backup
│   │   ├── Database Backups
│   │   └── File Backups
│   └── /monitoring
│       ├── System Health
│       ├── Performance Metrics
│       └── Alerts
│
└── /security
    ├── /audit-log
    │   └── Security Events
    ├── /access-control
    │   ├── Roles & Permissions
    │   └── Admin Users
    └── /firewall
        ├── IP Whitelist
        └── Rate Limiting
```

### LEGAL PAGES (/legal)

```
/legal
│
├── /terms
│   └── Terms of Service
│
├── /privacy
│   └── Privacy Policy
│
├── /cookies
│   └── Cookie Policy
│
└── /refund
    └── Refund Policy
```

### API DOCUMENTATION (/api-docs)

```
/api-docs
│
├── /swagger
│   └── Interactive API Docs
│
├── /reference
│   ├── Authentication
│   ├── Products API
│   ├── Orders API
│   ├── Farms API
│   └── Users API
│
└── /guides
    ├── Getting Started
    ├── Best Practices
    └── Code Examples
```

---

## 👥 User Role Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    USER HIERARCHY                           │
└─────────────────────────────────────────────────────────────┘

                        ┌─────────┐
                        │  GUEST  │
                        │ Visitor │
                        └────┬────┘
                             │
                    ┌────────┴────────┐
                    │                 │
            ┌───────▼───────┐   ┌────▼─────┐
            │  REGISTERED   │   │  FARMER  │
            │   CUSTOMER    │   │          │
            └───────────────┘   └──────────┘
                    │
            ┌───────┴───────┐
            │               │
        ┌───▼────┐     ┌────▼─────┐
        │ BASIC  │     │ PREMIUM  │
        │CUSTOMER│     │ CUSTOMER │
        └────────┘     └──────────┘

                    ┌──────────┐
                    │  ADMIN   │
                    │          │
                    └─────┬────┘
                          │
            ┌─────────────┼─────────────┐
            │             │             │
      ┌─────▼─────┐ ┌────▼─────┐ ┌────▼─────┐
      │   SUPER   │ │MODERATOR │ │ SUPPORT  │
      │   ADMIN   │ │          │ │  ADMIN   │
      └───────────┘ └──────────┘ └──────────┘
```

### Permission Matrix

| Feature | Guest | Customer | Farmer | Moderator | Admin | Super Admin |
|---------|-------|----------|--------|-----------|-------|-------------|
| Browse Products | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Farms | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Add to Cart | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Place Order | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Leave Reviews | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| List Products | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Manage Orders | ❌ | Own | Own | ❌ | ✅ | ✅ |
| View Analytics | ❌ | Own | Own | ❌ | ✅ | ✅ |
| Moderate Content | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| System Settings | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🛒 Customer User Flow

```
┌─────────────────────────────────────────────────────────────┐
│              CUSTOMER SHOPPING JOURNEY                      │
└─────────────────────────────────────────────────────────────┘

START → [Landing Page]
           │
           ├─→ Browse without login (Guest)
           │   │
           │   ├─→ View Products
           │   ├─→ View Farms
           │   └─→ View Prices
           │
           └─→ Register/Login
               │
               ▼
        [Customer Dashboard]
               │
               ├─→ Browse Marketplace
               │   │
               │   ├─→ Search Products
               │   ├─→ Filter by Category
               │   ├─→ Filter by Farm
               │   └─→ Filter by Price
               │        │
               │        ▼
               │   [Product Detail Page]
               │        │
               │        ├─→ View Photos
               │        ├─→ Read Description
               │        ├─→ Check Reviews
               │        ├─→ See Similar Products
               │        └─→ Add to Cart
               │             │
               │             ▼
               │        [Shopping Cart]
               │             │
               │             ├─→ Update Quantities
               │             ├─→ Apply Coupon
               │             ├─→ View Total
               │             └─→ Proceed to Checkout
               │                  │
               │                  ▼
               │            [Checkout Flow]
               │                  │
               │                  ├─→ 1. Delivery Address
               │                  │    └─→ Select/Add Address
               │                  │
               │                  ├─→ 2. Delivery Options
               │                  │    └─→ Choose Time Slot
               │                  │
               │                  ├─→ 3. Payment Method
               │                  │    └─→ Enter Card Details
               │                  │
               │                  ├─→ 4. Review Order
               │                  │    └─→ Confirm Purchase
               │                  │
               │                  ▼
               │            [Order Confirmed]
               │                  │
               │                  ├─→ View Order Details
               │                  ├─→ Track Delivery
               │                  └─→ Download Invoice
               │                       │
               │                       ▼
               │                [Order Delivered]
               │                       │
               │                       └─→ Rate & Review
               │                            └─→ Reorder
               │
               ├─→ Browse Farms
               │   │
               │   ├─→ Search Farms
               │   ├─→ Filter by Location
               │   └─→ View Farm Profile
               │        │
               │        ├─→ View Products
               │        ├─→ Read Farm Story
               │        ├─→ See Reviews
               │        └─→ Save Farm
               │
               ├─→ View Orders
               │   │
               │   ├─→ Order History
               │   ├─→ Track Active Orders
               │   └─→ Reorder Past Items
               │
               ├─→ Manage Favorites
               │   │
               │   ├─→ Saved Products
               │   └─→ Saved Farms
               │
               └─→ Account Settings
                   │
                   ├─→ Personal Info
                   ├─→ Addresses
                   ├─→ Payment Methods
                   └─→ Notifications

END
```

---

## 🌾 Farmer User Flow

```
┌─────────────────────────────────────────────────────────────┐
│              FARMER BUSINESS WORKFLOW                       │
└─────────────────────────────────────────────────────────────┘

START → [Farmer Registration]
           │
           ├─→ 1. Create Account
           ├─→ 2. Farm Details
           ├─→ 3. Business Info
           ├─→ 4. Verification
           └─→ 5. Submit for Approval
                │
                ▼
        [Approval Process]
                │
                ├─→ Admin Reviews
                └─→ Account Activated
                     │
                     ▼
            [Farmer Dashboard]
                     │
                     ├─→ Setup Farm Profile
                     │   │
                     │   ├─→ Add Photos
                     │   ├─→ Write Description
                     │   ├─→ Add Certifications
                     │   └─→ Set Delivery Areas
                     │
                     ├─→ Add Products
                     │   │
                     │   ├─→ Product Info
                     │   ├─→ Upload Photos
                     │   ├─→ Set Pricing
                     │   ├─→ Set Inventory
                     │   └─→ Publish Product
                     │        │
                     │        ▼
                     │   [Product Listed]
                     │
                     ├─→ Receive Orders
                     │   │
                     │   ├─→ New Order Alert
                     │   │    │
                     │   │    ▼
                     │   ├─→ Review Order
                     │   │    │
                     │   │    ├─→ Accept Order
                     │   │    └─→ Decline Order
                     │   │         │
                     │   │         ▼
                     │   ├─→ Process Order
                     │   │    │
                     │   │    ├─→ Pack Items
                     │   │    ├─→ Mark Ready
                     │   │    └─→ Arrange Delivery
                     │   │         │
                     │   │         ▼
                     │   ├─→ Ship Order
                     │   │    │
                     │   │    ├─→ Update Tracking
                     │   │    └─→ Confirm Delivery
                     │   │         │
                     │   │         ▼
                     │   └─→ Order Complete
                     │        │
                     │        └─→ Receive Payment
                     │
                     ├─→ Manage Inventory
                     │   │
                     │   ├─→ Update Stock Levels
                     │   ├─→ Set Low Stock Alerts
                     │   └─→ Bulk Update
                     │
                     ├─→ View Analytics
                     │   │
                     │   ├─→ Revenue Trends
                     │   ├─→ Best Sellers
                     │   ├─→ Customer Insights
                     │   └─→ Download Reports
                     │
                     ├─→ Manage Reviews
                     │   │
                     │   ├─→ Read Reviews
                     │   └─→ Respond to Reviews
                     │
                     ├─→ Check Biodynamic Calendar
                     │   │
                     │   ├─→ View Moon Phases
                     │   ├─→ Best Harvest Days
                     │   └─→ Planting Recommendations
                     │
                     └─→ Financial Management
                         │
                         ├─→ View Earnings
                         ├─→ Track Payouts
                         └─→ Download Tax Documents

END
```

---

## 👨‍💼 Admin User Flow

```
┌─────────────────────────────────────────────────────────────┐
│              ADMIN MANAGEMENT WORKFLOW                      │
└─────────────────────────────────────────────────────────────┘

START → [Admin Login]
           │
           ▼
    [Admin Dashboard]
           │
           ├─→ Monitor Platform Health
           │   │
           │   ├─→ View Key Metrics
           │   ├─→ Check System Status
           │   └─→ Review Alerts
           │
           ├─→ Manage Users
           │   │
           │   ├─→ View All Users
           │   ├─→ Search Users
           │   ├─→ User Details
           │   └─→ Actions
           │        │
           │        ├─→ Edit User
           │        ├─→ Suspend User
           │        ├─→ Delete User
           │        └─→ View Activity
           │
           ├─→ Manage Farms
           │   │
           │   ├─→ Review New Applications
           │   │    │
           │   │    ├─→ Review Details
           │   │    ├─→ Verify Info
           │   │    └─→ Approve/Reject
           │   │
           │   ├─→ Monitor Active Farms
           │   │    │
           │   │    ├─→ View Performance
           │   │    ├─→ Check Complaints
           │   │    └─→ Take Action
           │   │
           │   └─→ Manage Suspended Farms
           │
           ├─→ Manage Products
           │   │
           │   ├─→ Review Products
           │   ├─→ Moderate Content
           │   ├─→ Remove Violations
           │   └─→ Manage Categories
           │
           ├─→ Manage Orders
           │   │
           │   ├─→ View All Orders
           │   ├─→ Review Flagged Orders
           │   ├─→ Handle Disputes
           │   └─→ Refund Orders
           │
           ├─→ Content Management
           │   │
           │   ├─→ Edit Pages
           │   ├─→ Manage Blog
           │   └─→ Update Banners
           │
           ├─→ Generate Reports
           │   │
           │   ├─→ Financial Reports
           │   ├─→ User Reports
           │   ├─→ Farm Reports
           │   └─→ Export Data
           │
           ├─→ System Settings
           │   │
           │   ├─→ General Settings
           │   ├─→ Payment Config
           │   ├─→ Shipping Settings
           │   ├─→ Email Settings
           │   └─→ API Configuration
           │
           └─→ Security & Logs
               │
               ├─→ View Audit Logs
               ├─→ Monitor Security
               └─→ Manage Access Control

END
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│              AUTHENTICATION FLOW                            │
└─────────────────────────────────────────────────────────────┘

START → [Landing Page]
           │
           ├─→ [Register]
           │      │
           │      ├─→ Choose Role
           │      │    │
           │      │    ├─→ Customer
           │      │    │    │
           │      │    │    ├─→ Email/Password
           │      │    │    ├─→ Verify Email
           │      │    │    └─→ Complete Profile
           │      │    │         │
           │      │    │         ▼
           │      │    │    [Customer Dashboard]
           │      │    │
           │      │    └─→ Farmer
           │      │         │
           │      │         ├─→ Email/Password
           │      │         ├─→ Farm Details
           │      │         ├─→ Business Info
           │      │         ├─→ Verification Docs
           │      │         ├─→ Verify Email
           │      │         └─→ Wait for Approval
           │      │              │
           │      │              ├─→ Approved
           │      │              │    │
           │      │              │    ▼
           │      │              │ [Farmer Dashboard]
           │      │              │
           │      │              └─→ Rejected
           │      │                   │
           │      │                   └─→ Review & Resubmit
           │      │
           │      └─→ Social Registration
           │           │
           │           ├─→ Google
           │           ├─→ Facebook
           │           └─→ Apple
           │                │
           │                ▼
           │           [Complete Profile]
           │                │
           │                ▼
           │           [Dashboard]
           │
           ├─→ [Login]
           │      │
           │      ├─→ Email/Password
           │      │    │
           │      │    ├─→ Valid ✓
           │      │    │    │
           │      │    │    └─→ [Dashboard]
           │      │    │
           │      │    └─→ Invalid ✗
           │      │         │
           │      │         └─→ Show Error
           │      │
           │      ├─→ Social Login
           │      │    │
           │      │    └─→ OAuth Flow
           │      │         │
           │      │         └─→ [Dashboard]
           │      │
           │      └─→ Forgot Password?
           │           │
           │           ├─→ Enter Email
           │           ├─→ Receive Reset Link
           │           ├─→ Click Link
           │           ├─→ Enter New Password
           │           └─→ [Login]
           │
           └─→ [Session Management]
                  │
                  ├─→ Keep Logged In (Remember Me)
                  ├─→ Session Timeout (30 min)
                  ├─→ Logout
                  └─→ Session Expired
                       │
                       └─→ [Login Again]

END
```

---

## 🛍️ Purchase Flow (Detailed)

```
┌─────────────────────────────────────────────────────────────┐
│              COMPLETE PURCHASE FLOW                         │
└─────────────────────────────────────────────────────────────┘

[Browse Products]
       │
       ├─→ Filter/Search
       └─→ Select Product
            │
            ▼
   [Product Detail Page]
            │
            ├─→ View Details
            ├─→ Check Stock
            ├─→ Read Reviews
            ├─→ Select Quantity
            └─→ [Add to Cart]
                 │
                 ├─→ Cart Updated
                 └─→ Continue Shopping?
                      │
                      ├─→ Yes → [Browse More]
                      └─→ No  → [View Cart]
                                     │
                                     ▼
                            [Shopping Cart]
                                     │
                                     ├─→ Review Items
                                     ├─→ Update Quantities
                                     ├─→ Remove Items
                                     ├─→ Apply Coupon Code
                                     ├─→ View Subtotal
                                     └─→ [Proceed to Checkout]
                                              │
                                              ▼
                                     [Checkout - Step 1]
                                     Delivery Address
                                              │
                                              ├─→ Use Saved Address
                                              ├─→ Add New Address
                                              │    │
                                              │    ├─→ Street Address
                                              │    ├─→ City/State/ZIP
                                              │    ├─→ Phone Number
                                              │    └─→ Save for Later?
                                              │
                                              └─→ Validate Address
                                                   │
                                                   ├─→ Valid ✓
                                                   │    │
                                                   │    ▼
                                                   [Checkout - Step 2]
                                                   Delivery Options
                                                        │
                                                        ├─→ Standard (Next Day)
                                                        ├─→ Express (Same Day)
                                                        ├─→ Scheduled
                                                        └─→ Farm Pickup
                                                             │
                                                             ├─→ Select Time Slot
                                                             ├─→ Calculate Delivery Fee
                                                             └─→ [Continue]
                                                                  │
                                                                  ▼
                                                             [Checkout - Step 3]
                                                             Payment Method
                                                                  │
                                                                  ├─→ Credit Card
                                                                  │    │
                                                                  │    ├─→ Use Saved Card
                                                                  │    └─→ New Card
                                                                  │         │
                                                                  │         ├─→ Card Number
                                                                  │         ├─→ Expiry
                                                                  │         ├─→ CVV
                                                                  │         └─→ Save Card?
                                                                  │
                                                                  ├─→ Apple Pay
                                                                  ├─→ Google Pay
                                                                  └─→ PayPal
                                                                       │
                                                                       ▼
                                                                  [Checkout - Step 4]
                                                                  Review Order
                                                                       │
                                                                       ├─→ Items Summary
                                                                       ├─→ Delivery Address
                                                                       ├─→ Delivery Time
                                                                       ├─→ Payment Method
                                                                       ├─→ Subtotal
                                                                       ├─→ Delivery Fee
                                                                       ├─→ Taxes
                                                                       ├─→ Total
                                                                       └─→ [Place Order]
                                                                            │
                                                                            ▼
                                                                       [Processing]
                                                                            │
                                                                            ├─→ Validate Payment
                                                                            ├─→ Create Order
                                                                            ├─→ Send Confirmation
                                                                            └─→ Notify Farmer
                                                                                 │
                                                                                 ▼
                                                                            [Order Confirmed]
                                                                                 │
                                                                                 ├─→ Order Number
                                                                                 ├─→ Est. Delivery
                                                                                 ├─→ Track Order
                                                                                 ├─→ Download Invoice
                                                                                 └─→ [View Order Details]
                                                                                      │
                                                                                      ▼
                                                                                 [Order Tracking]
                                                                                      │
                                                                                      ├─→ Order Placed ✓
                                                                                      ├─→ Accepted by Farmer ✓
                                                                                      ├─→ Being Prepared ⏳
                                                                                      ├─→ Ready for Delivery
                                                                                      ├─→ Out for Delivery
                                                                                      └─→ Delivered ✓
                                                                                           │
                                                                                           ▼
                                                                                      [Delivery Complete]
                                                                                           │
                                                                                           ├─→ Rate Order
                                                                                           ├─→ Review Products
                                                                                           ├─→ Contact Support
                                                                                           └─→ Reorder
                                                   │
                                                   └─→ Invalid ✗
                                                        │
                                                        └─→ [Fix Address]

END
```

---

## 📱 Mobile App Structure

```
┌─────────────────────────────────────────────────────────────┐
│              MOBILE APP NAVIGATION                          │
│        (React Native - Separate Repository)                 │
└─────────────────────────────────────────────────────────────┘

[App Launch]
     │
     ├─→ [Splash Screen]
     │
     └─→ [Auth Check]
          │
          ├─→ Not Logged In
          │    │
          │    ├─→ [Onboarding Screens]
          │    │    │
          │    │    ├─→ Screen 1: Welcome
          │    │    ├─→ Screen 2: Features
          │    │    └─→ Screen 3: Get Started
          │    │         │
          │    │         └─→ [Login/Register]
          │    │
          │    └─→ [Guest Mode]
          │         │
          │         └─→ Browse Only
          │
          └─→ Logged In
               │
               ▼
        [Bottom Tab Navigator]
               │
               ├─→ [Home Tab] 🏠
               │    │
               │    ├─→ Featured Products
               │    ├─→ Featured Farms
               │    ├─→ Recent Orders
               │    └─→ Quick Actions
               │
               ├─→ [Shop Tab] 🛒
               │    │
               │    ├─→ Categories
               │    ├─→ Search
               │    ├─→ Filters
               │    └─→ Product Grid
               │         │
               │         └─→ [Product Details]
               │              │
               │              └─→ Add to Cart
               │
               ├─→ [Cart Tab] 🛒
               │    │
               │    ├─→ Cart Items
               │    ├─→ Checkout
               │    └─→ Order Summary
               │
               ├─→ [Orders Tab] 📦
               │    │
               │    ├─→ Active Orders
               │    ├─→ Past Orders
               │    └─→ Order Tracking
               │
               └─→ [Profile Tab] 👤
                    │
                    ├─→ Profile Info
                    ├─→ Settings
                    ├─→ Favorites
                    ├─→ Addresses
                    ├─→ Payment Methods
                    └─→ Logout

[Push Notifications]
     │
     ├─→ Order Updates
     ├─→ Delivery Alerts
     ├─→ Promotional Offers
     └─→ New Products

[Offline Support]
     │
     ├─→ Cached Products
     ├─→ Saved Cart
     └─→ Sync on Connection
```

---

## 🎯 Key User Journeys Summary

### New Customer Journey
```
Visit Site → Register → Browse → Add to Cart → Checkout → Receive Order → Review
```

### Returning Customer Journey
```
Login → Reorder Favorites → Quick Checkout → Track Delivery
```

### Farmer Journey
```
Register → Get Approved → Add Products → Receive Orders → Process & Ship → Get Paid
```

### Admin Journey
```
Login → Monitor Platform → Review Farms → Moderate Content → Generate Reports
```

---

## 📊 Page Hierarchy Chart

```
Level 1 (Public)         Level 2 (Authenticated)      Level 3 (Deep Pages)
──────────────────      ────────────────────────      ──────────────────────
/ (Home)                                              
├─ /about               
├─ /contact            
├─ /how-it-works       
├─ /marketplace         → /product/[id]              → Reviews, Similar
│                       → /category/[cat]             
├─ /farms               → /farm/[id]                 → Products, Reviews
├─ /login               
└─ /register            

/customer               
├─ /dashboard           
├─ /marketplace         → /product/[id]              → Add to Cart
├─ /cart                → /checkout                  → /confirmation
├─ /orders              → /orders/[id]               → Track, Invoice
├─ /favorites           
└─ /settings            → Multiple sections          

/farmer                 
├─ /dashboard           
├─ /products            → /add, /edit/[id]          → Photos, Pricing
├─ /orders              → /orders/[id]               → Customer Info, Actions
├─ /analytics           → Various reports            
└─ /settings            → Profile, Preferences       

/admin                  
├─ /dashboard           
├─ /users               → /users/[id]                → Activity, Actions
├─ /farms               → /farms/[id]                → Details, Approval
├─ /orders              → /orders/[id]               → Disputes, Refunds
└─ /reports             → Financial, Operations      
```

---

## 🔗 Cross-References & Related Flows

```
Customer ←→ Farmer       : Orders, Reviews, Messages
Customer ←→ Admin        : Support, Disputes
Farmer   ←→ Admin        : Approval, Monitoring
Product  ←→ Farm         : Ownership, Display
Order    ←→ Payment      : Transaction, Stripe
Review   ←→ Order        : Verified Purchase Only
```

---

## 📈 Conversion Funnels

### Customer Conversion Funnel
```
Homepage Visitors (100%)
    ↓ 60% continue
Product Browsing (60%)
    ↓ 40% engage
Add to Cart (24%)
    ↓ 70% proceed
Checkout Started (16.8%)
    ↓ 85% complete
Order Placed (14.3%)
    ↓ 90% success
Order Delivered (12.9%)
    ↓ 60% review
Customer Review (7.7%)
```

### Farmer Conversion Funnel
```
Registration Started (100%)
    ↓ 80% complete
Application Submitted (80%)
    ↓ 90% approved
Account Activated (72%)
    ↓ 85% add products
First Product Listed (61.2%)
    ↓ 70% get order
First Order Received (42.8%)
    ↓ 95% process
Order Completed (40.7%)
    ↓ 80% continue
Active Farmer (32.6%)
```

---

**End of Visual Sitemap & User Flows**

*For technical API documentation, see `/api-docs`*  
*For mobile app details, see the [mobile app repository](https://github.com/gogsia86/farmers-market-mobile-app)*