# 🗺️ User Flows & Sitemap - Farmers Market Platform

**Document Owner**: Product & UX Design Team
**Date**: October 21, 2025
**Status**: Active
**Version**: 1.0

---

## 📋 Executive Summary

This document provides comprehensive user flow diagrams and information architecture for the Farmers Market platform. It maps all key user journeys, decision points, and navigation paths for consumers, farmers, and administrators.

**Purpose:**

- Document complete user journeys from entry to goal completion
- Establish information architecture and sitemap
- Guide UX consistency across development
- Support developer implementation with clear flow definitions

---

## 🎯 Key User Personas & Goals

### Consumer Goals

1. **Discover** fresh, local produce from nearby farms
2. **Browse** product catalogs and farm profiles
3. **Purchase** products through seamless checkout
4. **Track** orders and delivery status
5. **Connect** with farmers and learn about their practices

### Farmer Goals

1. **List** and manage products/inventory
2. **Receive** and fulfill orders
3. **Communicate** with customers
4. **Analyze** sales and business performance
5. **Grow** their customer base

### Admin Goals

1. **Manage** platform users and farms
2. **Monitor** platform health and performance
3. **Verify** farm authenticity and compliance
4. **Generate** reports and analytics
5. **Support** users and resolve issues

---

## 🗺️ Complete Sitemap - Information Architecture

```
FARMERS MARKET PLATFORM
│
├── 🏠 HOME (/)
│   ├── Hero section with search
│   ├── Featured farms
│   ├── Seasonal products
│   └── How it works
│
├── 🔐 AUTHENTICATION (/auth)
│   ├── Login (/auth/login)
│   ├── Register (/auth/register)
│   │   ├── Consumer signup
│   │   └── Farmer signup
│   ├── Forgot Password (/auth/forgot-password)
│   └── Reset Password (/auth/reset-password/[token])
│
├── 🌾 FARMS (/farms)
│   ├── Farm Directory (/farms)
│   │   ├── Grid view (default)
│   │   ├── List view
│   │   └── Map view (future)
│   ├── Farm Detail (/farms/[id])
│   │   ├── Farm profile
│   │   ├── Product catalog
│   │   ├── About & certifications
│   │   ├── Reviews (future)
│   │   └── Contact info
│   └── Search Results (/farms?search=...)
│
├── 🥕 PRODUCTS (/products)
│   ├── Product Catalog (/products)
│   │   ├── All products view
│   │   ├── Category filters
│   │   └── Search/sort
│   ├── Product Detail (/products/[id])
│   │   ├── Product info
│   │   ├── Farm link
│   │   ├── Add to cart
│   │   └── Related products (future)
│   ├── Category Browse (/products/category/[slug])
│   └── Search Results (/products?search=...)
│
├── 🛒 SHOPPING CART (/cart)
│   ├── Cart View (/cart)
│   │   ├── Items list
│   │   ├── Quantity management
│   │   ├── Multi-farm orders
│   │   └── Price calculation
│   └── Cart API (client-side state)
│
├── 💳 CHECKOUT (/checkout)
│   ├── Checkout Flow (/checkout)
│   │   ├── Step 1: Contact info
│   │   ├── Step 2: Delivery options
│   │   ├── Step 3: Payment (Stripe)
│   │   └── Step 4: Confirmation
│   ├── Order Confirmation (/checkout/success)
│   └── Payment Failed (/checkout/failed)
│
├── 👤 USER PROFILE (/profile)
│   ├── My Profile (/profile)
│   ├── Order History (/profile/orders)
│   ├── Order Detail (/profile/orders/[id])
│   ├── Saved Farms (future)
│   └── Account Settings (/profile/settings)
│
├── 👨‍🌾 FARMER DASHBOARD (/dashboard/farmer)
│   ├── Dashboard Home (/dashboard/farmer)
│   │   ├── Sales overview
│   │   ├── Recent orders
│   │   ├── Quick stats
│   │   └── Low stock alerts
│   ├── Products (/dashboard/farmer/products)
│   │   ├── Product list
│   │   ├── Add product
│   │   ├── Edit product
│   │   └── Delete product
│   ├── Orders (/dashboard/farmer/orders)
│   │   ├── All orders
│   │   ├── Pending orders
│   │   ├── Completed orders
│   │   └── Order detail view
│   ├── Customers (/dashboard/farmer/customers)
│   │   ├── Customer list
│   │   └── Customer detail
│   ├── Analytics (/dashboard/farmer/analytics)
│   │   ├── Sales charts
│   │   ├── Top products
│   │   └── Revenue trends
│   └── Profile (/dashboard/farmer/profile)
│       ├── Basic info
│       ├── Contact details
│       ├── Certifications
│       └── Delivery options
│
├── 👨‍💼 ADMIN DASHBOARD (/admin) [PLANNED]
│   ├── Admin Home (/admin)
│   │   ├── Platform statistics
│   │   ├── Recent activity
│   │   └── System health
│   ├── User Management (/admin/users)
│   │   ├── User list
│   │   ├── User detail
│   │   ├── Approve/suspend
│   │   └── Role management
│   ├── Farm Management (/admin/farms)
│   │   ├── Farm list
│   │   ├── Pending verifications
│   │   ├── Verify farms
│   │   └── Farm detail
│   ├── Analytics (/admin/analytics)
│   │   ├── Revenue metrics
│   │   ├── User growth
│   │   ├── Order trends
│   │   └── Geographic data
│   ├── Reports (/admin/reports)
│   │   ├── Generate reports
│   │   ├── Sales reports
│   │   └── Export data
│   └── Settings (/admin/settings)
│       ├── Platform config
│       └── Admin users
│
├── ℹ️ STATIC PAGES
│   ├── About (/about)
│   ├── How It Works (/how-it-works)
│   ├── For Farmers (/for-farmers)
│   ├── FAQ (/faq)
│   ├── Contact (/contact)
│   ├── Privacy Policy (/privacy)
│   └── Terms of Service (/terms)
│
└── 🔧 UTILITY PAGES
    ├── 404 Not Found (/404)
    ├── 500 Server Error (/500)
    └── Offline Page (/offline) [PWA]
```

---

## 🚶 User Flow Diagrams

### Flow 1: Consumer Discovery → Purchase Journey

```
CONSUMER PURCHASE FLOW (Happy Path)

START: Homepage Visit
    ↓
[1. Land on Homepage]
    │
    ├─→ View Featured Farms
    ├─→ Browse Seasonal Products
    └─→ Search for Specific Item
    ↓
[2. Browse/Search]
    │
    ├─→ Farm Directory (/farms)
    │   └─→ Click Farm Card
    │       └─→ Farm Detail Page
    │           └─→ Browse Farm Products
    │
    └─→ Product Catalog (/products)
        └─→ Filter by Category
            └─→ Click Product Card
                └─→ Product Detail Page
    ↓
[3. Product Detail]
    │
    ├─→ Read Description
    ├─→ Check Price/Stock
    ├─→ View Farm Info
    └─→ Click "Add to Cart"
    ↓
[4. Cart Update]
    │
    ├─→ Continue Shopping (back to #2)
    └─→ Go to Cart
    ↓
[5. Cart Review]
    │
    ├─→ Adjust Quantities
    ├─→ Remove Items
    ├─→ View Subtotal/Total
    └─→ Click "Checkout"
    ↓
[6. Checkout Flow]
    │
    ├─→ Step 1: Enter/Confirm Contact Info
    │   └─→ Name, Email, Phone
    │
    ├─→ Step 2: Select Delivery Option
    │   └─→ Pickup or Delivery
    │   └─→ Choose Date/Time
    │
    ├─→ Step 3: Payment
    │   └─→ Enter Card Details (Stripe)
    │   └─→ Review Order
    │   └─→ Submit Payment
    │
    └─→ Step 4: Confirmation
        └─→ Order Number
        └─→ Email Confirmation
        └─→ Next Steps
    ↓
[7. Post-Purchase]
    │
    ├─→ View Order in History
    ├─→ Track Order Status
    └─→ Receive Order
    ↓
END: Order Fulfilled

ALTERNATIVE PATHS:
- Back Button: Returns to previous page
- Cart Badge: Quick access to cart from any page
- Search: Available globally in header
- Login Prompt: If not logged in at checkout
```

### Flow 2: Farmer Onboarding & First Product

```
FARMER ONBOARDING FLOW

START: Farmer Visits Site
    ↓
[1. Discovery]
    │
    ├─→ Homepage "For Farmers" CTA
    └─→ /for-farmers page
    ↓
[2. Registration Decision]
    │
    └─→ Click "Get Started" / "Sign Up"
    ↓
[3. Account Creation] (/auth/register)
    │
    ├─→ Enter: Email, Password
    ├─→ Select Role: "Farmer"
    └─→ Submit Registration
    ↓
[4. Email Verification] (optional future)
    │
    └─→ Verify Email Link
    ↓
[5. First Login]
    │
    └─→ Redirect to Farmer Dashboard
    ↓
[6. Welcome Dashboard] (/dashboard/farmer)
    │
    ├─→ See Empty State
    └─→ Prompts: "Complete Profile" and "Add First Product"
    ↓
[7. Complete Farm Profile] (/dashboard/farmer/profile)
    │
    ├─→ Tab 1: Basic Info
    │   └─→ Farm Name, Description, Logo
    │
    ├─→ Tab 2: Contact
    │   └─→ Email, Phone, Website, Social
    │
    ├─→ Tab 3: Certifications
    │   └─→ Organic Status, Certifications, Practices
    │
    └─→ Tab 4: Delivery
        └─→ Pickup Locations, Delivery Areas
    ↓
[8. Add First Product] (/dashboard/farmer/products)
    │
    ├─→ Click "Add Product"
    │
    ├─→ Enter Product Details:
    │   ├─→ Name, Description
    │   ├─→ Category
    │   ├─→ Price, Unit
    │   ├─→ Stock Quantity
    │   └─→ Upload Images
    │
    └─→ Save Product
    ↓
[9. Product Listed]
    │
    ├─→ Product Appears in Farmer Dashboard
    └─→ Product Visible in Marketplace
    ↓
[10. First Order Received]
    │
    └─→ Email Notification
    └─→ Order Shows in Dashboard
    ↓
[11. Fulfill Order]
    │
    ├─→ View Order Details
    ├─→ Update Status: "Processing"
    ├─→ Prepare Order
    ├─→ Update Status: "Ready for Pickup" / "Delivered"
    └─→ Customer Notified
    ↓
END: Farmer Operational

DECISION POINTS:
- Profile Completeness: Encouragement to complete all tabs
- Product Pricing: Guidance on competitive pricing
- Stock Management: Low stock alerts
- Order Response Time: Metrics tracked
```

### Flow 3: Consumer Search & Filter Journey

```
SEARCH & FILTER FLOW

START: User Wants Specific Product
    ↓
[1. Search Entry Point]
    │
    ├─→ Header Search Bar (global)
    ├─→ Homepage Search Hero
    └─→ Farm/Product Page Search
    ↓
[2. Enter Search Query]
    │
    ├─→ Type: "tomatoes"
    ├─→ Autocomplete Suggestions (future)
    └─→ Press Enter / Click Search
    ↓
[3. Search Results Page]
    │
    ├─→ Products Matching "tomatoes"
    └─→ Farms Growing "tomatoes"
    ↓
[4. Apply Filters]
    │
    ├─→ Category Filter
    │   └─→ Vegetables, Fruits, Dairy, etc.
    │
    ├─→ Location Filter
    │   └─→ Within 5 miles, 10 miles, 25 miles
    │
    ├─→ Availability Filter
    │   └─→ In Stock Only
    │
    ├─→ Certifications Filter (future)
    │   └─→ Organic, Certified Naturally Grown
    │
    └─→ Price Range Filter (future)
        └─→ $0-$5, $5-$10, $10+
    ↓
[5. Sort Results]
    │
    ├─→ Sort by: Relevance (default)
    ├─→ Sort by: Price (Low to High)
    ├─→ Sort by: Price (High to Low)
    ├─→ Sort by: Distance (Nearest)
    └─→ Sort by: Newest
    ↓
[6. Refine or Select]
    │
    ├─→ Refine: Adjust filters/search
    │   └─→ Back to #4
    │
    └─→ Select: Click product/farm
        └─→ Go to Detail Page
    ↓
[7. Add to Cart or Continue]
    │
    ├─→ Add to Cart → Proceed to Checkout
    └─→ Back to Search → Find More
    ↓
END: Product Found

EMPTY STATE:
- No Results: Suggest similar products, nearby farms
- Typo Handling: "Did you mean...?" suggestions
- Expand Search: "Try expanding your search radius"
```

### Flow 4: Cart Management Journey

```
CART MANAGEMENT FLOW

START: User Has Items in Cart
    ↓
[1. Cart Access]
    │
    ├─→ Click Cart Icon (header badge)
    ├─→ Auto-redirect after Add to Cart
    └─→ Navigate to /cart
    ↓
[2. Cart View] (/cart)
    │
    ├─→ See All Items Listed
    │   └─→ Items grouped by Farm
    │
    ├─→ For Each Item:
    │   ├─→ Product Name, Image
    │   ├─→ Farm Name (clickable)
    │   ├─→ Price, Quantity
    │   └─→ Subtotal
    │
    └─→ Cart Totals:
        ├─→ Subtotal (all items)
        ├─→ Estimated Tax
        └─→ Total
    ↓
[3. Cart Actions]
    │
    ├─→ Update Quantity
    │   ├─→ Increase (+)
    │   ├─→ Decrease (-)
    │   └─→ Real-time price update
    │
    ├─→ Remove Item
    │   └─→ Click X / Remove Button
    │   └─→ Confirm deletion
    │
    ├─→ Continue Shopping
    │   └─→ Return to previous page
    │
    └─→ Proceed to Checkout
        └─→ Go to /checkout
    ↓
[4. Stock Validation]
    │
    ├─→ Check: Item still in stock?
    │
    ├─→ Yes: Proceed to Checkout
    │
    └─→ No: Show Error
        └─→ "Item out of stock"
        └─→ Remove from cart or update quantity
    ↓
[5. Cart Persistence]
    │
    ├─→ Logged In: Save to database
    ├─→ Logged Out: Save to localStorage
    └─→ On Login: Merge carts
    ↓
END: Cart Ready for Checkout

EDGE CASES:
- Empty Cart: "Your cart is empty" + Browse Products CTA
- Price Changes: Alert user if prices changed since adding
- Farm Unavailable: Remove items from unavailable farms
- Multiple Farms: Calculate separate totals per farm
```

### Flow 5: Order Fulfillment (Farmer Side)

```
FARMER ORDER FULFILLMENT FLOW

START: Order Received
    ↓
[1. Order Notification]
    │
    ├─→ Email Notification
    ├─→ Dashboard Badge/Alert
    └─→ Push Notification (future PWA)
    ↓
[2. View New Order] (/dashboard/farmer/orders)
    │
    └─→ Order Status: "Pending"
    └─→ Highlighted in Order List
    ↓
[3. Review Order Details]
    │
    ├─→ Customer Information
    │   └─→ Name, Email, Phone
    │
    ├─→ Ordered Items
    │   └─→ Products, Quantities, Prices
    │
    ├─→ Delivery/Pickup Info
    │   └─→ Method, Location, Date/Time
    │
    └─→ Order Total
        └─→ Amount, Payment Status
    ↓
[4. Accept Order]
    │
    └─→ Click "Accept" / "Start Processing"
    └─→ Status Changes: "Pending" → "Processing"
    └─→ Customer Notified via Email
    ↓
[5. Prepare Order]
    │
    ├─→ Harvest/Gather Products
    ├─→ Package Order
    ├─→ Label with Customer Info
    └─→ Ready for Pickup/Delivery
    ↓
[6. Update Order Status]
    │
    ├─→ For Pickup:
    │   └─→ Set Status: "Ready for Pickup"
    │   └─→ Customer Notified
    │   └─→ Include Pickup Instructions
    │
    └─→ For Delivery:
        └─→ Set Status: "Out for Delivery"
        └─→ Customer Notified
        └─→ Update when delivered
    ↓
[7. Complete Order]
    │
    ├─→ Customer Picks Up / Receives Delivery
    └─→ Set Status: "Completed"
    └─→ Payment Settled (if held)
    └─→ Customer Receives Completion Email
    ↓
[8. Post-Order]
    │
    ├─→ Order Moves to "Completed" Tab
    ├─→ Included in Sales Analytics
    ├─→ Customer Added to Customer List
    └─→ Inventory Updated
    ↓
END: Order Fulfilled

ALTERNATIVE PATHS:
- Cancel Order: If can't fulfill, notify customer
- Partial Fulfillment: Some items unavailable
- Delayed: Notify customer of delays
- Issues: Customer service contact
```

### Flow 6: Admin Farm Verification (Planned)

```
ADMIN FARM VERIFICATION FLOW [PLANNED]

START: Farmer Registers
    ↓
[1. New Farm Registration]
    │
    └─→ Farm Status: "Pending Verification"
    └─→ Appears in Admin Queue
    ↓
[2. Admin Notification]
    │
    └─→ Email: "New farm pending verification"
    └─→ Dashboard Alert Badge
    ↓
[3. Admin Reviews Farm] (/admin/farms/pending)
    │
    └─→ Click Farm in Pending List
    ↓
[4. Farm Verification Review]
    │
    ├─→ Review Farm Information:
    │   ├─→ Farm Name, Location
    │   ├─→ Description, Images
    │   ├─→ Contact Information
    │   ├─→ Certifications Claimed
    │   └─→ Delivery Options
    │
    ├─→ Check Against Criteria:
    │   ├─→ Real farm (not spam)
    │   ├─→ Accurate location
    │   ├─→ Reasonable certifications
    │   └─→ Complete profile
    │
    └─→ Research (if needed):
        ├─→ Google farm name
        ├─→ Verify address
        └─→ Check social media presence
    ↓
[5. Admin Decision]
    │
    ├─→ APPROVE:
    │   ├─→ Click "Approve Farm"
    │   ├─→ Farm Status: "Verified"
    │   ├─→ Farmer Notified: "Farm Approved!"
    │   └─→ Farm Visible in Public Marketplace
    │
    ├─→ REQUEST MORE INFO:
    │   ├─→ Click "Request Information"
    │   ├─→ Add Note: What's needed
    │   ├─→ Farmer Notified: "Please provide..."
    │   └─→ Status: "Pending Information"
    │
    └─→ REJECT:
        ├─→ Click "Reject Farm"
        ├─→ Add Reason: Why rejected
        ├─→ Farmer Notified: "Farm not approved"
        └─→ Status: "Rejected"
    ↓
[6. Post-Decision Actions]
    │
    ├─→ Approved Farm:
    │   ├─→ Add to Public Directory
    │   ├─→ Farmer Can List Products
    │   └─→ Analytics: Track farm performance
    │
    ├─→ Rejected Farm:
    │   ├─→ Remove from Pending
    │   ├─→ Farmer Can Appeal (future)
    │   └─→ Archive Decision
    │
    └─→ Awaiting Info:
        └─→ Remain in Pending Queue
        └─→ Follow-up after 7 days
    ↓
END: Verification Complete

QUALITY CONTROLS:
- Verification Checklist: Standard criteria
- Approval Time: Target <24 hours
- Transparency: Clear rejection reasons
- Appeal Process: Farmers can reapply (future)
```

---

## 🔀 Navigation Patterns

### Global Navigation (Header)

```
SITE HEADER (All Pages)
┌────────────────────────────────────────────────────────┐
│ 🌾 Farmers Market   [Search]   🛒(3)   👤 [User Menu] │
└────────────────────────────────────────────────────────┘
    │                    │          │           │
    │                    │          │           └─→ Dropdown:
    │                    │          │              - Profile
    │                    │          │              - Dashboard (role-based)
    │                    │          │              - Orders
    │                    │          │              - Settings
    │                    │          │              - Logout
    │                    │          │
    │                    │          └─→ Cart Page (/cart)
    │                    │              - Badge shows item count
    │                    │
    │                    └─→ Search Overlay
    │                       - Quick search
    │                       - Recent searches (future)
    │
    └─→ Homepage (/)

NAVIGATION LINKS (below header):
- Farms | Products | How It Works | For Farmers
```

### Dashboard Navigation (Farmers)

```
FARMER DASHBOARD SIDEBAR
┌──────────────────────┐
│ 📊 Dashboard         │ ← Overview
│ 📦 Products          │ ← Product Management
│ 📝 Orders            │ ← Order Fulfillment
│ 👥 Customers         │ ← Customer Database
│ 📈 Analytics         │ ← Sales Reports
│ ⚙️  Profile          │ ← Farm Settings
└──────────────────────┘
```

### Mobile Navigation (Responsive)

```
MOBILE NAVIGATION (Hamburger Menu)
┌──────────────────────┐
│ ☰ Menu              │
├──────────────────────┤
│ 🏠 Home              │
│ 🌾 Farms             │
│ 🥕 Products          │
│ ℹ️  How It Works     │
│ 👨‍🌾 For Farmers       │
├──────────────────────┤
│ 👤 My Account        │
│ 📦 Orders            │
│ ⚙️  Settings          │
│ 🚪 Logout            │
└──────────────────────┘

MOBILE STICKY FOOTER:
┌────────────────────────────────────┐
│ [Home] [Search] [Cart] [Profile]  │
└────────────────────────────────────┘
```

---

## 🚦 Decision Trees & Conditional Logic

### Decision Tree: User Type Routing

```
User Visits Site
    │
    ├─→ Not Logged In
    │   ├─→ Can Browse: Farms, Products
    │   ├─→ Can Search
    │   └─→ Cannot: Add to cart (prompts login)
    │
    └─→ Logged In
        │
        ├─→ Role: Consumer
        │   ├─→ Default redirect: Homepage
        │   ├─→ Can: Browse, Purchase, View Orders
        │   └─→ Cannot: Access Farmer/Admin Dashboards
        │
        ├─→ Role: Farmer
        │   ├─→ Default redirect: Farmer Dashboard
        │   ├─→ Can: Manage Farm, Products, Orders
        │   ├─→ Can Also: Browse as Consumer
        │   └─→ Cannot: Access Admin Dashboard
        │
        └─→ Role: Admin [PLANNED]
            ├─→ Default redirect: Admin Dashboard
            ├─→ Can: All Admin Functions
            ├─→ Can Also: Browse as Consumer
            └─→ Cannot: Access Other Farmers' Dashboards
```

### Decision Tree: Cart Item Availability

```
User Adds Item to Cart
    │
    └─→ Check Stock Availability
        │
        ├─→ In Stock (quantity >= requested)
        │   └─→ Add to Cart ✅
        │       └─→ Show Success Message
        │       └─→ Update Cart Badge
        │
        ├─→ Limited Stock (quantity < requested)
        │   └─→ Show Warning ⚠️
        │       └─→ "Only X available"
        │       └─→ Offer to add available quantity
        │       └─→ User Confirms or Cancels
        │
        └─→ Out of Stock (quantity = 0)
            └─→ Show Error ❌
                └─→ "Currently unavailable"
                └─→ Suggest similar products
                └─→ "Notify when available" (future)
```

### Decision Tree: Checkout Validation

```
User Clicks "Checkout"
    │
    ├─→ Check: User Logged In?
    │   ├─→ No: Redirect to Login
    │   │   └─→ Return to Checkout after login
    │   └─→ Yes: Continue
    │
    ├─→ Check: Cart Empty?
    │   ├─→ Yes: Show Empty Cart Message
    │   └─→ No: Continue
    │
    ├─→ Check: All Items Still Available?
    │   ├─→ No: Remove unavailable items
    │   │   └─→ Notify user
    │   └─→ Yes: Continue
    │
    ├─→ Check: Prices Changed?
    │   ├─→ Yes: Show Price Change Alert
    │   │   └─→ User Confirms or Cancels
    │   └─→ No: Continue
    │
    └─→ Proceed to Checkout ✅
```

---

## 🎨 Interaction Patterns

### Pattern 1: Progressive Disclosure

**Used in:** Farmer Profile Editor, Product Forms

```
Show minimal required fields first
    ↓
User completes basics
    ↓
Reveal optional/advanced fields
    ↓
User chooses to complete or skip
    ↓
Save progress incrementally
```

**Benefits:**

- Reduces cognitive load
- Prevents overwhelming new users
- Allows quick starts with basic info
- Encourages profile completion over time

### Pattern 2: Optimistic UI Updates

**Used in:** Cart, Order Status, Inventory

```
User performs action (e.g., Add to Cart)
    ↓
UI updates immediately (optimistic)
    ↓
API call sent in background
    ↓
Success: Keep optimistic update
Failure: Rollback + show error
```

**Benefits:**

- Feels instant and responsive
- Improves perceived performance
- Better UX on slower connections

### Pattern 3: Contextual Actions

**Used in:** Product Cards, Order Lists

```
Hover over item
    ↓
Show contextual action buttons:
- Quick View
- Add to Cart
- View Farm
    ↓
Click action
    ↓
Action performed without page change
```

**Benefits:**

- Reduces clicks
- Maintains context
- Improves efficiency

### Pattern 4: Inline Editing

**Used in:** Dashboard Settings, Product Management

```
Display field as read-only
    ↓
Click to edit (contentEditable or form)
    ↓
Make changes
    ↓
Save automatically or on blur
    ↓
Show save confirmation
```

**Benefits:**

- Seamless editing experience
- No separate edit pages
- Quick updates

---

## 📱 Responsive Flow Considerations

### Desktop (>1024px)

- Side-by-side layouts (filters + products)
- Hover interactions
- Multi-column forms
- Detailed information visible

### Tablet (768px - 1024px)

- Collapsible filters
- 2-column product grids
- Touch-optimized buttons
- Simplified navigation

### Mobile (<768px)

- Single column layouts
- Bottom sheet filters
- Large touch targets
- Hamburger menu
- Sticky footer navigation
- Simplified forms (one field per step)

---

## 🔗 Related Documents

- **[Farmers Market BRD](../business/farmers-market-brd.md)** - Business requirements
- **[Feature Specifications](../product/farmers-market-features.md)** - Complete feature details
- **[Agricultural Design System](./agricultural-design-system.md)** - UI components and patterns
- **[Agricultural Wireframes](./agricultural-wireframes.md)** - Visual wireframes for key screens
- **[Technical Architecture](../technical/architecture.md)** - System architecture
- **[Sprint Backlog](../execution/sprint-backlog.md)** - Development timeline

---

## 📝 Document Maintenance

**Review Schedule**: Quarterly or when major features are added
**Next Review**: January 2026
**Owner**: Product & UX Design Team

**Update Triggers:**

- New feature launches
- User feedback reveals unclear paths
- Navigation changes
- Role or permission changes
- A/B testing results

---

_Last Updated: October 21, 2025_
_Version: 1.0_
_Status: Complete - Reflects current platform (26/34 features)_
