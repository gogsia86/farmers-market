---
applyTo: "**/*"
description: "FR-003: Product Listing Management - Mobile-first 3-minute product listing with photo upload, real-time inventory, seasonal availability, and quick actions from the field"
---

# FR-003: PRODUCT LISTING MANAGEMENT (MOBILE-FIRST)

**List Products in 3 Minutes from the Field**

---

## 🔗 FEATURE NAVIGATION

- **[↑ FRD Index](../AGRICULTURAL_FRD_INDEX.instructions.md)** - Master feature index
- **[← FR-002: Farm Profile](./FR-002_FARM_PROFILE.instructions.md)** - Previous feature
- **[→ FR-004: Inventory Tracking](./FR-004_INVENTORY_TRACKING.instructions.md)** - Next feature
- **[AGRICULTURAL_BRD](../AGRICULTURAL_BRD.instructions.md)** - 3-minute listing goal
- **[AGRICULTURAL_PERSONAS](../AGRICULTURAL_PERSONAS.instructions.md)** - Ana Romana user story

---

## 📋 FEATURE METADATA

```yaml
Feature ID: FR-003
Feature Name: Product Listing Management (Mobile-First)
Priority: P0 - Critical (HIGHEST BUSINESS VALUE)
Effort Estimate: 34 story points (≈ 1.5 weeks)
Business Value: 100/100 (enables marketplace transactions)
Sprint: Sprint 3-4 (Week 3-5)
Dependencies: FR-001 (Farmer Registration), FR-002 (Farm Profile)
User Story: FARM-001 from AGRICULTURAL_PERSONAS
Owner: Mobile Team + Backend Team
```

---

## 👤 USER STORY

```
As a small-scale organic farmer like Ana Romana,
I want to list products in under 3 minutes from my smartphone while in the field,
so that I can update my online store during harvest without disrupting farm work,
validated by 75% of product listings completed in <3 minutes.
```

**Persona Context**: Ana Romana during peak harvest season

- **Reality**: 14-hour harvest days, no time for computer
- **Environment**: Muddy hands, wearing gloves, bright sunlight on screen
- **Need**: Quick mobile listing between picking sessions
- **Pain Point**: Barn2Door requires desktop, complex forms, 15+ minutes

---

## 💎 BUSINESS VALUE ALIGNMENT

### Critical Path Justification

```
VALUE SCORE: 100/100 (HIGHEST)

WHY THIS MATTERS:
├── No products = No transactions = No revenue
├── Farmer time savings = Higher adoption
├── Mobile-first = 75%+ farmer usage scenario
└── 3-minute listing = Competitive moat (vs 15+ min competitors)

BUSINESS IMPACT:
├── GMV (Gross Merchandise Value): Direct enabler
├── Farmer retention: Ease-of-use drives loyalty
├── Time-to-value: Farmers sell same day as onboarding
└── Network effects: More products = More consumer engagement
```

---

## 🎯 DETAILED REQUIREMENTS

### 1. QUICK ADD PRODUCT FLOW (Mobile-Optimized)

**Target Time: <3 Minutes from Camera to Listed**

```yaml
Step 1: Product Photo (30 seconds)
  Capture Options:
    - Take photo with camera (default action)
    - Choose from recent photos (last 20 from camera roll)
    - Skip photo (upload later, use placeholder)

  Camera Integration:
    - Auto-focus: Tap to focus on product
    - Grid overlay: Rule of thirds for better composition
    - Brightness adjustment: Slider for outdoor/indoor lighting
    - Flash toggle: Auto/On/Off

  Photo Processing:
    - Auto-crop: Detect product, remove excess background
    - Auto-enhance: Brightness, contrast, saturation boost
    - Compression: 85% quality, max 2MB
    - Preview: Show processed photo before proceeding

Step 2: Product Details (90 seconds)
  Required Fields:
    Name:
      - Text input, 3-100 characters
      - Autocomplete: Suggest common products
      - Examples: "Heirloom Tomatoes", "Free-Range Eggs"

    Price:
      - Number input, 2 decimal places
      - Currency: USD ($)
      - Quick buttons: $1, $2, $3, $5, $10 (tap to fill)

    Unit:
      - Dropdown: /lb, /bunch, /dozen, /each, /pint, /quart, /bag
      - Most common units at top
      - Custom unit: Text input option

    Category:
      - Required: Vegetables, Fruit, Dairy, Meat, Eggs, etc.
      - Single-select dropdown
      - Icons for visual recognition

  Optional Quick Fields:
    Quantity Available:
      - Number input or "Unlimited" toggle
      - Default: Unlimited (track separately in inventory)

    Organic Toggle:
      - Checkbox: "This product is organic"
      - Auto-checked if farm has USDA Organic cert

    Seasonal Toggle:
      - Checkbox: "Available seasonally"
      - Auto-show date range picker if checked

Step 3: Publish (60 seconds)
  Preview:
    - Product card preview (as consumers see it)
    - Edit button: Go back to change any field

  Publish Options:
    - "List Now" (default): Immediately available for purchase
    - "Save as Draft": List later, not visible to consumers
    - "Schedule": Pick future date to auto-publish

  Confirmation:
    - Success message: "Heirloom Tomatoes listed!"
    - Quick actions:
      ├── "Add Another Product" (repeat flow)
      ├── "View Product" (see public listing)
      └── "Share Product" (social media share)
```

---

### 2. PRODUCT MANAGEMENT DASHBOARD

```yaml
Product List View:
  Display:
    - Card layout: Photo, name, price, status
    - Sort options: Newest, A-Z, Price, Popularity
    - Filter: Active, Draft, Out of Stock, Archived

  Quick Actions (per product):
    - Edit: Open edit form
    - Duplicate: Copy product, edit details
    - Mark Out of Stock: Toggle availability
    - Archive: Remove from store (soft delete)

  Bulk Actions:
    - Select multiple products
    - Bulk edit: Price, category, availability
    - Bulk archive: Remove multiple products
    - Export: CSV of product data

Product Edit Form:
  Full Form (Desktop/Expanded Mobile):
    - All fields from Quick Add
    - Additional fields:
      ├── Description: 500 chars, markdown support
      ├── Storage instructions: "Keep refrigerated"
      ├── Harvest date: Date picker
      ├── Multiple photos: Up to 5 photos per product
      ├── Variants: Size options (Small, Medium, Large)
      └── Tags: Custom tags for search (e.g., "heirloom", "GMO-free")

  Mobile Quick Edit:
    - Price and quantity only (most frequent edits)
    - Tap to edit inline, auto-save on blur

Product Visibility Settings:
  Status Options:
    - Active: Visible, purchasable
    - Out of Stock: Visible, not purchasable
    - Draft: Hidden from consumers
    - Archived: Hidden, soft deleted

  Scheduling:
    - Publish on date: Auto-activate on specific date
    - Unpublish on date: Auto-deactivate (seasonal products)
    - Recurring schedule: Weekly/monthly availability
```

---

### 3. PRODUCT TEMPLATES (Time Savers)

```yaml
Save as Template:
  - Save frequently listed products
  - One-tap to create from template
  - Pre-fills: Name, category, unit, typical price
  - Edit only quantity and photo

Common Templates (Pre-Built):
  Vegetables:
    - Heirloom Tomatoes, Mixed Greens, Kale, etc.
    - Default unit: /lb or /bunch

  Fruit:
    - Strawberries, Apples, Peaches, etc.
    - Default unit: /lb or /pint

  Eggs:
    - Free-Range Eggs
    - Default: /dozen, typical prices $6-8

  Dairy:
    - Raw Milk, Cheese, Yogurt
    - Default unit: /quart or /each

Quick Actions from Template:
  - "List Again": Duplicate last week's listings
  - "Seasonal Copy": Copy all summer products for next year
```

---

### 4. TECHNICAL REQUIREMENTS

#### Database Schema

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,

  -- Basic Info
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL, -- URL-friendly
  description TEXT CHECK (char_length(description) <= 500),

  -- Pricing
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  unit VARCHAR(50) NOT NULL, -- '/lb', '/dozen', '/each', etc.
  compare_at_price DECIMAL(10, 2), -- Original price for discounts

  -- Inventory
  quantity_available INTEGER, -- NULL = unlimited
  track_inventory BOOLEAN DEFAULT FALSE,
  allow_backorder BOOLEAN DEFAULT FALSE,

  -- Categorization
  category VARCHAR(50) NOT NULL,
    -- VEGETABLES, FRUIT, DAIRY, MEAT, EGGS, HONEY, FLOWERS, etc.
  tags JSONB DEFAULT '[]', -- ["heirloom", "organic", "GMO-free"]

  -- Attributes
  organic BOOLEAN DEFAULT FALSE,
  seasonal BOOLEAN DEFAULT FALSE,
  seasonal_start DATE, -- NULL if not seasonal
  seasonal_end DATE,

  -- Media
  primary_photo_url VARCHAR(500),
  photo_urls JSONB DEFAULT '[]', -- Up to 5 photos

  -- Metadata
  harvest_date DATE,
  storage_instructions VARCHAR(200),

  -- Variants (future enhancement)
  has_variants BOOLEAN DEFAULT FALSE,
  variants JSONB, -- [{"size": "Small", "price": 3.50}, ...]

  -- Status
  status VARCHAR(20) DEFAULT 'DRAFT',
    -- DRAFT | ACTIVE | OUT_OF_STOCK | ARCHIVED
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_publish_at TIMESTAMP WITH TIME ZONE,
  scheduled_unpublish_at TIMESTAMP WITH TIME ZONE,

  -- Analytics
  views_count INTEGER DEFAULT 0,
  cart_adds_count INTEGER DEFAULT 0,
  purchases_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete

  -- Indexes
  UNIQUE (farm_id, slug)
);

CREATE INDEX idx_products_farm ON products(farm_id);
CREATE INDEX idx_products_status ON products(status) WHERE status = 'ACTIVE';
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_seasonal ON products(seasonal, seasonal_start, seasonal_end);
CREATE FULLTEXT INDEX idx_products_search ON products(name, description, tags);

-- Product Templates
CREATE TABLE product_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  template_name VARCHAR(100) NOT NULL,

  -- Template data (JSON of product fields)
  template_data JSONB NOT NULL,

  -- Metadata
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE (farm_id, template_name)
);
```

#### API Endpoints

```typescript
// POST /api/farms/:farmId/products - Create product
Request:
{
  name: "Heirloom Tomatoes",
  price: 4.50,
  unit: "/lb",
  category: "VEGETABLES",
  organic: true,
  seasonal: true,
  seasonalStart: "2025-06-15",
  seasonalEnd: "2025-10-31",
  quantity: 50,
  trackInventory: true,
  primaryPhoto: File, // Multipart upload
  status: "ACTIVE" // or "DRAFT"
}

Response (201 Created):
{
  success: true,
  product: {
    id: "prod-123",
    name: "Heirloom Tomatoes",
    slug: "heirloom-tomatoes",
    price: 4.50,
    unit: "/lb",
    status: "ACTIVE",
    primaryPhotoUrl: "<https://cdn.../tomatoes.jpg",>
    createdAt: "2025-10-18T10:30:00Z"
  },
  message: "Product listed successfully!",
  nextSteps: [
    "Share product on social media",
    "Add more product photos",
    "List another product"
  ]
}

Performance: <300ms (p95) including photo upload
```

---

### 5. MOBILE UX OPTIMIZATIONS

```yaml
Touch-Optimized:
  - All form fields: 44x44px minimum tap targets
  - Number inputs: Large numeric keyboard
  - Dropdowns: Native iOS/Android pickers (not web select)
  - Photo upload: Native camera/gallery integration

Offline Support:
  - Draft saved locally: IndexedDB storage
  - Auto-sync when online: Background sync API
  - Conflict resolution: Server timestamp wins

Quick Actions:
  - Swipe gestures: Swipe left to edit, swipe right to archive
  - Long press: Bulk select mode
  - Floating action button: "+" to add product (always visible)

Glove-Friendly:
  - Large buttons, no tiny tap targets
  - High contrast for sunlight readability
  - Voice input: Dictate product name/description
```

---

## ✅ ACCEPTANCE CRITERIA

**Given** a farmer in the field during harvest
**When** they take a photo and fill in product details
**Then** product is listed in <3 minutes (75th percentile)
**And** product immediately appears in store
**And** confirmation message shows with quick actions

---

**Given** a farmer lists "Heirloom Tomatoes" at $4.50/lb
**When** they publish the product
**Then** consumers can find and purchase immediately
**And** product appears in search results
**And** product photo is optimized and CDN-cached

---

**Given** a farmer wearing gloves on a sunny day
**When** they use the mobile app
**Then** all buttons are large enough to tap with gloves
**And** screen is readable in bright sunlight
**And** forms auto-save if interrupted

---

## 📊 SUCCESS METRICS

| Metric                  | Target                   | Rationale                          |
| ----------------------- | ------------------------ | ---------------------------------- |
| Listing completion time | <3 min (75th percentile) | Competitive advantage vs Barn2Door |
| Mobile listings         | >80%                     | Field usage validation             |
| Template usage          | >60%                     | Time-saving feature adoption       |
| Products per farm       | 15-25 average            | Catalog depth for viability        |
| Draft abandonment       | <10%                     | UX quality indicator               |

---

## 🔗 DEPENDENCIES

- **FR-001**: Farmer registration (farm must exist)
- **FR-004**: Inventory tracking (quantity management)
- **File upload service**: Photo upload and processing
- **AWS S3 + CloudFront**: Photo storage and CDN

---

**Version**: v1.0.0 - October 2025
**Status**: ✅ Ready for Development
**Owner**: Mobile Team + Backend Team

_"If listing a product takes longer than picking it, we've failed the farmer."_
