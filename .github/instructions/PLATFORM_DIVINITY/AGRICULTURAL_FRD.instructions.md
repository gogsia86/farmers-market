---
applyTo: "**/*"
description: "Agricultural marketplace functional requirements - Comprehensive feature specifications for 19 core platform capabilities with acceptance criteria, success metrics, and technical specifications"
---

# AGRICULTURAL FUNCTIONAL REQUIREMENTS DOCUMENT (FRD)

### Comprehensive Feature Specifications for Farmers Market Platform

---

## 🔗 DIVINE INTEGRATION

This FRD integrates with:

- **[AGRICULTURAL_BRD](./AGRICULTURAL_BRD.instructions.md)** - Business objectives and success metrics
- **[AGRICULTURAL_PERSONAS](./AGRICULTURAL_PERSONAS.instructions.md)** - User stories and prioritization
- **[COMPETITIVE_DOMINANCE](./COMPETITIVE_DOMINANCE.instructions.md)** - Competitive differentiation requirements
- **[MASTER_PLATFORM_FRAMEWORK](./MASTER_PLATFORM_FRAMEWORK.instructions.md)** - Product vision and architecture
- **[MASTER_TEST_REPORT](../../docs/testing/MASTER_TEST_REPORT.md)** - Testing standards and coverage

---

## 1. DOCUMENT GOVERNANCE & ARCHITECTURE

### 🌾 Agricultural Requirements Hierarchy

````text
LEVEL 1 - STRATEGIC (WHY)
├── AGRICULTURAL_BRD.instructions.md (Business requirements, anti-goals)
├── AGRICULTURAL_PERSONAS.instructions.md (User needs, pain points)
└── COMPETITIVE_DOMINANCE.instructions.md (Market differentiation)

LEVEL 2 - TACTICAL (WHAT) ← CURRENT DOCUMENT
├── AGRICULTURAL_FRD.instructions.md (Feature specifications)
├── AGRICULTURAL_USER_FLOWS.instructions.md (User journey flows)
└── Acceptance Criteria Framework (Per-feature validation)

LEVEL 3 - OPERATIONAL (HOW)
├── AGRICULTURAL_TECHNICAL_ARCHITECTURE.instructions.md (Tech specs)
├── AGRICULTURAL_QA_STRATEGY.instructions.md (Testing approach)
└── Database Schema & API Documentation (Implementation details)
```text
### Version Control Protocol

```text
v1.0.0 - October 2025: Initial MVP scope definition (19 core features)
v1.1.0 - Month 1: Pilot farmer feedback incorporation
v1.2.0 - Month 3: Technical feasibility validation
v2.0.0 - Month 6: Scale phase features (CSA advanced, analytics)
v2.x.x - Ongoing: Iterative updates during development
v3.0.0 - Year 1: Post-launch revision with learnings
```text
---

## 2. AGRICULTURAL PRODUCT VISION & SCOPE

### 🎯 Platform Vision Statement

### "To become the trusted digital infrastructure that empowers sustainable farmers to reach consumers directly, automates farm business operations, and builds transparent food system connections - serving as the farmer-first alternative to exploitative middlemen and opaque industrial agriculture."
### Problem-Solution Fit Framework

```text
═══════════════════════════════════════════════════════════════
CORE FARMER PROBLEMS ADDRESSED
═══════════════════════════════════════════════════════════════
1. "Limited Market Access"
   • Farmers markets = 2-3 days/week, 4-8 hour commitment each
   • Missing 60-70% of potential sales opportunities
   • Weather-dependent, location-dependent, time-constrained

2. "Unfair Margins"
   • Distributors take 50-60% of retail price
   • Farmers keep only 40-50 cents per dollar
   • Payment delays of 30-60 days strain cash flow

3. "Time Burden"
   • Harvest season = 60-80 hour work weeks
   • Market setup/teardown adds 6+ hours per market day
   • Manual order management (email/text/calls) = chaos

4. "No Customer Relationships"
   • Distributors own customer data and relationships
   • Farmers don't know who buys their products
   • No direct feedback or loyalty building

═══════════════════════════════════════════════════════════════
SOLUTION PILLARS (OUR PLATFORM)
═══════════════════════════════════════════════════════════════
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  24/7 Market    │  85% Margins    │  Mobile-First   │  Direct         │
│  Access         │  Kept           │  Efficiency     │  Relationships  │
│  - Online store │  - 15% fair     │  - 3-min list   │  - Customer     │
│  - Multi-farm   │    commission   │  - Field mgmt   │    database     │
│  - Discovery    │  - Weekly payout│  - Automated    │  - Reviews      │
│  - 24/7 orders  │  - Transparent  │  - Real-time    │  - Messaging    │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

═══════════════════════════════════════════════════════════════
CORE CONSUMER PROBLEMS ADDRESSED
═══════════════════════════════════════════════════════════════
1. "Inconvenient Access"
   • Farmers markets = weekend mornings only (8am-1pm)
   • Bad weather = no market or unpleasant experience
   • Must drive, park, carry heavy bags
   • Popular items sold out by 10am if arrive late

2. "Limited Transparency"
   • Grocery stores = no idea where food comes from
   • "Local" labels = often misleading (200+ miles)
   • Farming practices unknown (pesticides? GMOs?)

3. "Fragmented Experience"
   • Must visit multiple farms for variety
   • Each farm = different ordering process
   • No unified shopping experience

═══════════════════════════════════════════════════════════════
SOLUTION PILLARS (OUR PLATFORM)
═══════════════════════════════════════════════════════════════
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  Convenience    │  Transparency   │  Multi-Farm     │  Quality        │
│  - Browse 24/7  │  - Farm stories │  - One cart     │  - Freshness    │
│  - Delivery     │  - Practices    │  - Single       │  - Guarantee    │
│  - Pickup       │  - Certifications│   checkout     │  - Reviews      │
│  - Flexible     │  - Photos/videos│  - 5+ farms     │  - Support      │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```text
### Scope Boundary Definition

### IN-SCOPE (MVP - Phase 1: Months 0-6):
```text
FARMER FEATURES:
├── FR-001: Farmer Registration & Profile Management
├── FR-002: Farm Profile & Storytelling (photos, practices, certifications)
├── FR-003: Product Listing Management (mobile-first, 3-minute listing)
├── FR-004: Real-Time Inventory Tracking (field updates via mobile)
├── FR-005: Order Management Dashboard (view, accept, fulfill orders)
├── FR-006: Payment Processing (Stripe Connect, 85% payout, weekly auto-payout)
├── FR-007: Fulfillment Coordination (delivery, farm pickup, farmers market pickup)
├── FR-008: Basic Analytics (sales, popular products, customer insights)
└── FR-009: Customer Communication (messaging, order updates)

CONSUMER FEATURES:
├── FR-010: Consumer Registration & Profile Management
├── FR-011: Location-Based Farm Discovery (50-mile radius search)
├── FR-012: Multi-Farm Product Browsing (search, filter, sort)
├── FR-013: Multi-Farm Shopping Cart (consolidate farms in one order)
├── FR-014: Unified Checkout & Payment (Stripe, credit/debit, Apple Pay)
├── FR-015: Flexible Fulfillment Selection (delivery, farm pickup, market pickup)
├── FR-016: Order Tracking & Notifications (status updates, reminders)
├── FR-017: Review & Rating System (farm ratings, product reviews)
└── FR-018: Quality Guarantee & Support (refunds, replacements, help)

PLATFORM FOUNDATION:
├── FR-019: Multi-Tenant Platform Architecture
├── FR-020: Mobile-First Progressive Web App (offline capability)
├── FR-021: Real-Time Sync Infrastructure (inventory, orders)
├── FR-022: Security & Compliance (encryption, PCI DSS, GDPR)
└── FR-023: Monitoring & Observability (uptime, performance, errors)

TOTAL MVP FEATURES: 19 core features
```text
### OUT-OF-SCOPE (Phase 2: Months 7-12):
```text
ADVANCED FARMER TOOLS:
├── CSA Subscription Management (recurring boxes, customization)
├── Advanced Analytics Dashboard (predictive demand, seasonal trends)
├── Bulk Product Upload (CSV import for large catalogs)
├── Multi-Channel Integration (sync with Barn2Door, LocalHarvest)
└── Automated Marketing Tools (email campaigns, promotions)

ADVANCED CONSUMER FEATURES:
├── Mobile Native Apps (iOS & Android dedicated apps)
├── Subscription Boxes (weekly/bi-weekly automated orders)
├── Recipe Suggestions & Meal Planning (AI-powered)
├── Farm Visit Booking (tours, U-pick events)
└── Gift Cards & Referral Program (friend invitations)

BUSINESS EXPANSION:
├── Restaurant/Business Buyer Portal (B2B farm-to-table sales)
├── Wholesale Marketplace (bulk orders for food hubs, co-ops)
├── Multi-Language Support (Spanish for farm workers, consumers)
├── Regional Expansion (replicate model in 10+ regions)
└── API Marketplace (third-party integrations, developer ecosystem)
```text
### OUT-OF-SCOPE (Never - Anti-Goals from AGRICULTURAL_BRD):
```text
❌ COMMODITY MARKETPLACE MODEL
   • We will NOT become a price-driven commodity exchange
   • We will NOT allow anonymous bulk trading
   • We will NOT prioritize volume over relationship quality

❌ MIDDLEMAN EXTRACTION MODEL
   • We will NOT take ownership of farmer products
   • We will NOT negotiate prices on behalf of farmers
   • We will NOT control farmer-customer relationships

❌ INDUSTRIAL AGRICULTURE ENABLER
   • We will NOT onboard factory farms or CAFOs
   • We will NOT support exploitative labor practices
   • We will NOT allow greenwashing or false organic claims

❌ FARMER DATA EXPLOITATION
   • We will NOT sell farmer data to third parties
   • We will NOT use farmer data for competing businesses
   • We will NOT lock farmers into non-portable platform
```text
---

## 3. USER ROLES & PERMISSION MATRIX

### 🔐 Role-Based Access Control (RBAC)

### Role Hierarchy:
```text
PLATFORM ROLES:
├── Platform Admin (System Level - Internal Team)
│   ├── Manage all farms and users (emergency support)
│   ├── Access system-wide analytics and health dashboards
│   ├── Configure platform settings (commission rates, features)
│   ├── Handle disputes and escalations
│   └── Manage platform integrations (Stripe, payment processors)
│
├── Farm Owner (Per Farm - Farmer Primary Account)
│   ├── Manage farm profile, story, photos, certifications
│   ├── Add/remove farm team members and assign roles
│   ├── List/edit/archive products and inventory
│   ├── View/accept/fulfill/cancel orders
│   ├── Access financial dashboard (sales, payouts, reports)
│   ├── Configure fulfillment options (delivery, pickup, markets)
│   ├── Respond to customer messages and reviews
│   └── Export farm data (customers, orders, products)
│
├── Farm Manager (Per Farm - Delegated Admin)
│   ├── List/edit products and update inventory
│   ├── View and fulfill orders (cannot cancel)
│   ├── Update fulfillment status and tracking
│   ├── Respond to customer messages
│   ├── View sales analytics (read-only financial data)
│   └── Cannot change farm profile or payment settings
│
├── Consumer (Standard Buyer)
│   ├── Browse farms and products (location-based discovery)
│   ├── Add items to cart from multiple farms
│   ├── Place orders and make payments
│   ├── Select fulfillment options (delivery, pickup, market)
│   ├── Track orders and receive notifications
│   ├── Leave reviews and ratings for farms/products
│   ├── Message farms with questions
│   ├── Manage account settings and payment methods
│   └── Export personal data (GDPR compliance)
│
└── Guest (Unauthenticated - Browse Only)
    ├── View farm profiles and stories (public info only)
    ├── Browse products with prices (cannot see inventory)
    ├── Search farms by location and products
    ├── View reviews and ratings (anonymized)
    └── Must create account to add to cart or purchase
```text
### Permission Matrix (CRUD Operations):
```text
┌──────────────────┬─────────────┬──────────────┬──────────────┬──────────┬────────┐
│ Entity           │ Platform    │ Farm Owner   │ Farm Manager │ Consumer │ Guest  │
│                  │ Admin       │              │              │          │        │
├──────────────────┼─────────────┼──────────────┼──────────────┼──────────┼────────┤
│ Farm Profile     │ CRUDL       │ CRUDL (own)  │ R (own)      │ R        │ R      │
│ Product Listing  │ CRUDL       │ CRUDL (own)  │ CRUDL (own)  │ R        │ R      │
│ Inventory        │ CRUDL       │ CRUDL (own)  │ CRUDL (own)  │ R        │ -      │
│ Order (Farmer)   │ CRUDL       │ RUDL (own)   │ RU (own)     │ -        │ -      │
│ Order (Consumer) │ CRUDL       │ R (own farm) │ R (own farm) │ CRUDL    │ -      │
│ Payment Method   │ RU          │ CRUD (own)   │ -            │ CRUD     │ -      │
│ Payout Settings  │ RU          │ CRUD (own)   │ R (own)      │ -        │ -      │
│ Review/Rating    │ CRUDL       │ R            │ R            │ CRUDL    │ R      │
│ Message/Chat     │ R           │ CRUDL (own)  │ CRUDL (own)  │ CRUDL    │ -      │
│ User Account     │ CRUDL       │ RUD (own)    │ RUD (own)    │ RUD      │ -      │
│ Analytics        │ CRUDL       │ R (own)      │ R (own)      │ R (own)  │ -      │
└──────────────────┴─────────────┴──────────────┴──────────────┴──────────┴────────┘

Legend: C=Create, R=Read, U=Update, D=Delete, L=List All, (own)=Own entities only
```text
---

## 4. CORE FEATURE SPECIFICATIONS

### 📋 Feature Specification Template

Each feature below follows this structure:

- **Feature ID & Priority**
- **User Story** (from AGRICULTURAL_PERSONAS)
- **Business Value** (alignment with AGRICULTURAL_BRD objectives)
- **Detailed Requirements** (functional, technical, UX)
- **Acceptance Criteria** (testable conditions)
- **Success Metrics** (measurable KPIs)
- **Dependencies** (other features, services)
- **Risk Assessment** (technical, UX, business risks)

---

### FR-001: FARMER REGISTRATION & PROFILE MANAGEMENT

### Feature Metadata:
```text
Feature ID:      FR-001
Priority:        P0 - Critical (MVP Blocker)
Effort Estimate: 21 story points (≈ 1 developer-week)
Business Value:  85/100 (foundation for farmer onboarding)
Dependencies:    None (first feature to build)
User Story:      FARM-001 from AGRICULTURAL_PERSONAS
```text
### User Story:
```text
As a small-scale organic farmer like Ana Romana,
I want to create a farm profile in under 5 minutes from my smartphone,
so that I can start selling online without technical barriers or time-consuming setup,
validated by 80% of farmers completing profile setup on first session.
```text
### Business Value Alignment:
- **AGRICULTURAL_BRD Objective**: Onboard 50 farms by Month 6
- **Success Metric**: <5 minutes average onboarding time
- **Farmer Retention**: 85% complete profiles = 85% activation rate
- **Competitive Advantage**: Faster than Barn2Door (2-4 hours), LocalHarvest (15+ min)

### Detailed Requirements:
```text
FUNCTIONAL REQUIREMENTS:
═══════════════════════════════════════════════════════════════

1. REGISTRATION FLOW (3 steps, <5 minutes total)

   Step 1: Account Creation (90 seconds)
   ├── Email address (validated, becomes username)
   ├── Password (min 12 chars, complexity: 1 uppercase, 1 number, 1 special)
   ├── Farm name (string, 3-100 chars, unique within region)
   ├── Mobile phone number (verified via SMS code)
   └── Terms of Service & Platform Commission acknowledgment (15% checkbox)

   Step 2: Farm Location & Basics (90 seconds)
   ├── Farm address (Google Maps autocomplete, geocoded for location-based search)
   ├── Farm size (dropdown: <5 acres, 5-20, 20-50, 50-100, 100+ acres)
   ├── Primary products (multi-select: vegetables, fruit, dairy, meat, eggs, flowers, etc.)
   ├── Certifications (optional multi-select: USDA Organic, Biodynamic, Certified Humane, etc.)
   └── Growing season (dropdown: Year-round, Spring-Fall, Seasonal with dates)

   Step 3: Farm Story & Photo (90 seconds)
   ├── Farm description (textarea, 100-500 chars, markdown support)
   ├── Farm photo upload (mobile camera, min 800x600px, max 5MB, auto-resize)
   ├── Farming practices (checkboxes: organic methods, no-till, regenerative, pesticide-free, etc.)
   └── Contact preferences (email, SMS, both)

2. PROFILE MANAGEMENT (Post-Registration)

   Editable Fields:
   ├── Farm story & description (expandable to 2,000 chars)
   ├── Additional photos (up to 10 photos, gallery view)
   ├── Detailed certifications (upload cert photos, expiration dates)
   ├── Farm team members (add/remove managers with email invites)
   ├── Fulfillment options configuration:
   │   ├── Delivery (enable/disable, delivery days, fees, radius)
   │   ├── Farm pickup (enable/disable, hours, instructions)
   │   └── Farmers market pickup (add markets: name, location, days, hours)
   ├── Payment settings (Stripe Connect onboarding, bank account)
   └── Notification preferences (order alerts, message alerts, payout notifications)

TECHNICAL REQUIREMENTS:
═══════════════════════════════════════════════════════════════

Data Model - Farms Table:
├── id (UUID, primary key)
├── owner_user_id (UUID, foreign key to users table, indexed)
├── farm_name (string, 100 chars, unique per region, indexed)
├── slug (string, URL-friendly version of farm_name, unique, indexed)
├── email (string, 255 chars, unique, indexed)
├── phone (string, E.164 format, validated)
├── address_line1, address_line2, city, state, zip (string fields)
├── latitude, longitude (decimal, indexed for geo-queries)
├── farm_size_acres (enum: <5, 5-20, 20-50, 50-100, 100+)
├── primary_products (JSONB array: ["vegetables", "fruit", ...])
├── certifications (JSONB array with expiration dates)
├── growing_season (JSONB: {type: "seasonal", start: "03-15", end: "11-30"})
├── description (text, 2000 chars max)
├── farming_practices (JSONB array: ["organic", "no-till", ...])
├── profile_photo_url (string, S3 URL)
├── gallery_photo_urls (JSONB array of S3 URLs, max 10)
├── stripe_connect_account_id (string, nullable until onboarded)
├── payout_enabled (boolean, default false until Stripe verification)
├── status (enum: PENDING_VERIFICATION, ACTIVE, SUSPENDED, ARCHIVED)
├── created_at, updated_at (timestamps, indexed)
└── deleted_at (timestamp, soft delete, nullable)

Data Model - Farm_Team_Members Table:
├── id (UUID, primary key)
├── farm_id (UUID, foreign key, indexed)
├── user_id (UUID, foreign key, indexed)
├── role (enum: OWNER, MANAGER)
├── invited_by (UUID, foreign key to users)
├── invited_at, accepted_at (timestamps)
└── status (enum: PENDING, ACTIVE, REVOKED)

Performance Requirements:
├── Registration API response: <500ms (p95)
├── Profile update API response: <300ms (p95)
├── Photo upload: <10 seconds for 5MB file with progress indicator
├── Stripe Connect onboarding: <30 seconds to redirect (external dependency)
└── Mobile-first: All forms optimized for touch, large tap targets (44x44px min)

Security Requirements:
├── Password hashing: bcrypt with salt, cost factor 12
├── Email verification: Required before farm goes live
├── Phone verification: SMS code (6 digits, 10-minute expiry)
├── Rate limiting: 5 registration attempts per IP per hour
├── CSRF protection: Token-based for all form submissions
└── Data encryption: All PII encrypted at rest (AES-256)

UX/UI Requirements:
├── Mobile-first design: Thumb-zone optimization, bottom navigation
├── Progress indicator: "Step 1 of 3" with visual progress bar
├── Auto-save: Draft profile saved every 30 seconds (prevent data loss)
├── Inline validation: Real-time field validation with helpful error messages
├── Photo preview: Show cropped preview before upload
├── Example farms: Show 2-3 example profiles for inspiration
└── Accessibility: WCAG 2.1 AA compliance, screen reader support
```text
### Acceptance Criteria:
```text
FUNCTIONAL ACCEPTANCE:
═══════════════════════════════════════════════════════════════

[ ] GIVEN a farmer visits the registration page on mobile
    WHEN they complete all 3 steps with valid information
    THEN their farm profile is created with status PENDING_VERIFICATION
    AND they receive email verification link within 60 seconds
    AND they receive SMS verification code within 60 seconds
    AND registration completes in <5 minutes (90th percentile)

[ ] GIVEN a farmer uploads a farm photo
    WHEN the image is >5MB or wrong format
    THEN they see clear error message with size/format requirements
    AND are prompted to select a different photo

[ ] GIVEN a farmer enters duplicate farm name in same region
    WHEN they attempt to register
    THEN they see error: "Farm name already taken in your area. Try [suggested alternative]"
    AND system suggests 2-3 alternative names

[ ] GIVEN a registered farmer logs in
    WHEN they navigate to farm profile settings
    THEN they can edit all profile fields except email (requires verification)
    AND changes save within 300ms (p95)
    AND they see success confirmation message

[ ] GIVEN a farm owner wants to add a farm manager
    WHEN they enter manager email and send invite
    THEN manager receives email with accept/decline link
    AND manager can accept invite and gain MANAGER role permissions
    AND manager appears in farm team list

SECURITY ACCEPTANCE:
═══════════════════════════════════════════════════════════════

[ ] GIVEN a user attempts registration with weak password
    WHEN they submit the form
    THEN they see error: "Password must be 12+ characters with uppercase, number, special character"
    AND form does not submit until requirements met

[ ] GIVEN a farmer has not verified email
    WHEN they attempt to publish products
    THEN they see modal: "Verify email to activate farm profile"
    AND are blocked from publishing until verified

[ ] GIVEN a malicious user attempts 6 registrations from same IP in 1 hour
    WHEN they make 6th attempt
    THEN they are rate-limited for 1 hour
    AND see message: "Too many registration attempts. Try again in 60 minutes"

PERFORMANCE ACCEPTANCE:
═══════════════════════════════════════════════════════════════

[ ] GIVEN normal system load (1,000 concurrent users)
    WHEN 100 farmers register simultaneously
    THEN 95% complete in <5 minutes total time
    AND API response times stay <500ms (p95)
    AND no registration failures due to system load

[ ] GIVEN a farmer uploads 5MB farm photo on 3G mobile connection
    WHEN upload begins
    THEN progress bar shows real-time upload percentage
    AND upload completes in <30 seconds
    AND farmer sees preview of uploaded photo within 2 seconds

ACCESSIBILITY ACCEPTANCE:
═══════════════════════════════════════════════════════════════

[ ] GIVEN a visually impaired farmer using screen reader
    WHEN they navigate registration form
    THEN all form fields have proper ARIA labels
    AND error messages are announced by screen reader
    AND they can complete registration with keyboard only (no mouse required)

[ ] GIVEN farmer with motor impairment using touchscreen
    WHEN they interact with form elements
    THEN all tap targets are ≥44x44px
    AND form is usable with single-finger touch
    AND no hover-dependent interactions
```text
### Success Metrics:
```text
ADOPTION METRICS:
├── Registration start → completion rate: >80% (target)
├── Average time to complete registration: <5 minutes (90th percentile)
├── Mobile registration: >75% of registrations from mobile devices
├── Email verification rate: >90% within 24 hours
└── Profile completeness: >85% farms complete all optional fields

QUALITY METRICS:
├── Registration errors: <2% of attempts result in errors
├── Failed photo uploads: <5% failure rate
├── Support tickets for registration: <3% of farmers request help
└── Stripe Connect completion: >80% complete within 7 days

BUSINESS IMPACT:
├── Month 1: 15-20 farms registered (pilot phase)
├── Month 3: 50 farms registered (MVP milestone)
├── Month 6: 100-150 farms registered (scale phase)
└── Farmer retention: >85% of registered farms remain active after 3 months
```text
### Risk Assessment:
```text
TECHNICAL RISKS:
├── Stripe Connect onboarding complexity (Medium Impact, Medium Probability)
│   └── Mitigation: Clear step-by-step guide, video tutorial, email support
├── Photo upload failures on slow rural internet (High Impact, High Probability)
│   └── Mitigation: Aggressive compression, retry logic, offline queue
└── Geocoding API rate limits (Low Impact, Low Probability)
    └── Mitigation: Cache geocoded addresses, fallback manual lat/long entry

UX RISKS:
├── Farmer abandonment if >5 minutes (High Impact, Medium Probability)
│   └── Mitigation: Auto-save drafts, allow partial completion, return later
├── Confusion about commission model (Medium Impact, High Probability)
│   └── Mitigation: Clear 15% commission explanation, calculator showing net earnings
└── Mobile form fatigue (Medium Impact, Medium Probability)
    └── Mitigation: Progress indicators, motivational copy, example profiles

BUSINESS RISKS:
├── Low farmer adoption if onboarding too complex (Critical Impact, Medium Probability)
│   └── Mitigation: In-person onboarding events at farmers markets, phone support
├── Stripe verification delays (Medium Impact, High Probability for some farmers)
│   └── Mitigation: Set expectations (2-3 business days), allow profile creation before verification
└── Duplicate/fake farms (Low Impact, Low Probability)
    └── Mitigation: Email/phone verification, manual review for first 100 farms
```text
### Dependencies:
```text
EXTERNAL SERVICES:
├── Stripe Connect (Required for payment processing setup)
│   └── API: Create connected account, onboarding flow, verification status
├── Google Maps Geocoding API (Required for location-based discovery)
│   └── API: Address autocomplete, lat/long conversion
├── AWS S3 (Required for photo storage)
│   └── API: Upload, resize, CDN delivery via CloudFront
├── Twilio (Required for SMS verification)
│   └── API: Send verification code, verify code
└── SendGrid (Required for email notifications)
    └── API: Verification emails, welcome emails, transactional emails

INTERNAL DEPENDENCIES:
├── User authentication system (build first, foundation)
├── File upload service (reusable for products, gallery)
└── Notification service (email + SMS infrastructure)
```text
---

### FR-002: FARM PROFILE & STORYTELLING

### Feature Metadata:
```text
Feature ID:      FR-002
Priority:        P0 - Critical (MVP Blocker)
Effort Estimate: 13 story points (≈ 3-4 days)
Business Value:  90/100 (consumer trust & differentiation)
Dependencies:    FR-001 (Farmer Registration)
User Story:      CONS-002 from AGRICULTURAL_PERSONAS
```text
### User Story:
```text
As a conscious consumer like Divna Kapica,
I want to see detailed farm profiles with photos, practices, and certifications,
so that I can make informed purchasing decisions and support farms aligned with my values,
validated by 70% of consumers viewing farm profiles before first purchase.
```text
### Business Value Alignment:
- **AGRICULTURAL_BRD Anti-Goal**: Transparency (not anonymous commodity marketplace)
- **Competitive Advantage**: LocalHarvest (basic listings), Barn2Door (fragmented), Farm Fresh To You (no individual farms)
- **Consumer Trust**: Farm stories increase conversion by 40% (hypothesis to test)
- **Differentiation**: Emotional connection through storytelling

### Detailed Requirements:
```text
FUNCTIONAL REQUIREMENTS:
═══════════════════════════════════════════════════════════════

1. PUBLIC FARM PROFILE PAGE (Consumer-Facing View)

   Hero Section:
   ├── Farm name (H1, prominent)
   ├── Primary farm photo (hero image, full-width, responsive)
   ├── Location (city, state, "12 miles from you" if consumer logged in)
   ├── Quick stats: Farm size, years farming, certifications (badge icons)
   └── Action buttons: "Shop Products", "Message Farm", "Share"

   About Section:
   ├── Farm story (markdown-rendered, 100-2000 chars, line breaks preserved)
   ├── Farming practices (visual badges: Organic, No-till, Pesticide-free, etc.)
   ├── Primary products (category tags: Vegetables, Fruit, Eggs, etc.)
   └── Growing season (e.g., "March-November: Peak harvest June-September")

   Photo Gallery:
   ├── Grid layout (2-3 columns on mobile, 3-4 on desktop)
   ├── Up to 10 photos (farm photos, product photos, farmer photos)
   ├── Lightbox view (full-screen gallery with swipe/arrow navigation)
   └── Photo captions (optional, 100 chars max per photo)

   Certifications Section:
   ├── Visual badges for each certification (USDA Organic, Biodynamic, etc.)
   ├── Certification details on hover/tap (issuer, expiration date)
   ├── Uploaded cert photos (viewable, PDF downloads)
   └── "Verified" indicator if platform has validated cert

   Fulfillment Options:
   ├── Delivery (if enabled: days available, fee, delivery radius map)
   ├── Farm pickup (if enabled: address, hours, instructions with map)
   ├── Farmers market pickup (list of markets with days/times/locations)
   └── Interactive map showing farm location and pickup points

   Products Preview:
   ├── "Featured Products" section (4-6 products, randomized or farmer-selected)
   ├── Product cards: Photo, name, price, "Add to Cart" button
   └── "See All Products" link to full product catalog

   Reviews & Ratings:
   ├── Overall farm rating (1-5 stars, aggregate from all reviews)
   ├── Review count (e.g., "Based on 47 reviews")
   ├── Recent reviews (3-5 most recent, expandable to "See All")
   ├── Review content: Star rating, text (500 chars), reviewer name (first name + initial), date
   └── Farmer responses to reviews (optional, public)

   Contact Section:
   ├── "Message Farm" button (opens chat/message modal)
   ├── Social media links (Facebook, Instagram, website if provided)
   └── Farm email/phone (optional, farmer can choose to display)

2. FARM PROFILE EDITING (Farmer Dashboard View)

   Edit Mode Features:
   ├── Inline editing (click to edit, auto-save on blur)
   ├── "Preview" mode (see public view before publishing changes)
   ├── Rich text editor for farm story (markdown toolbar, formatting buttons)
   ├── Photo management:
   │   ├── Drag-and-drop reorder (set primary photo, reorder gallery)
   │   ├── Bulk upload (select multiple photos at once)
   │   ├── Edit captions and alt text (accessibility)
   │   └── Delete/archive photos
   ├── Certification uploads:
   │   ├── Photo/PDF upload for cert documents
   │   ├── Expiration date field (optional, reminder notifications)
   │   └── Status: Pending Verification, Verified, Expired
   └── SEO optimization:
       ├── Meta description (auto-generated from farm story, editable)
       ├── Farm slug/URL (auto from farm name, editable once)
       └── Keywords (auto-extracted from products/practices)

TECHNICAL REQUIREMENTS:
═══════════════════════════════════════════════════════════════

Database Schema Enhancements:
├── Farms table (extends FR-001):
│   ├── seo_meta_description (string, 160 chars, for search engines)
│   ├── seo_keywords (JSONB array, auto-generated from products/practices)
│   ├── social_facebook_url, social_instagram_url, social_website_url (strings, nullable)
│   ├── display_email, display_phone (boolean flags, default false for privacy)
│   ├── featured_product_ids (JSONB array of product UUIDs, max 6, farmer-selected)
│   └── profile_views_count, profile_clicks_count (integer counters for analytics)
│
├── Farm_Photos table:
│   ├── id (UUID, primary key)
│   ├── farm_id (UUID, foreign key, indexed)
│   ├── photo_url (string, S3 URL)
│   ├── photo_url_thumbnail (string, S3 URL, 300x300 auto-generated)
│   ├── caption (string, 100 chars, nullable)
│   ├── alt_text (string, 100 chars, for accessibility)
│   ├── sort_order (integer, for reordering, default 0)
│   ├── is_primary (boolean, only one true per farm)
│   └── created_at, updated_at (timestamps)
│
└── Farm_Certifications table:
    ├── id (UUID, primary key)
    ├── farm_id (UUID, foreign key, indexed)
    ├── certification_type (enum: USDA_ORGANIC, BIODYNAMIC, CERTIFIED_HUMANE, etc.)
    ├── certification_document_url (string, S3 URL to PDF/photo)
    ├── issuing_organization (string, 100 chars)
    ├── issue_date, expiration_date (dates, nullable)
    ├── status (enum: PENDING_VERIFICATION, VERIFIED, EXPIRED)
    ├── verified_by_user_id (UUID, platform admin who verified, nullable)
    └── created_at, updated_at, verified_at (timestamps)

API Endpoints:
├── GET /api/farms/:slug (Public farm profile)
│   ├── Response: Full farm object with photos, certs, featured products
│   ├── Increment profile_views_count (analytics)
│   ├── Include distance from consumer location (if logged in)
│   └── Cache: 5 minutes (Redis), invalidate on farm update
│
├── PUT /api/farms/:id/profile (Update farm profile, authenticated farmer only)
│   ├── Request: Updated farm fields (story, practices, social links)
│   ├── Validation: Markdown sanitization, URL format validation
│   └── Invalidate cache on successful update
│
├── POST /api/farms/:id/photos (Upload farm photo, authenticated farmer only)
│   ├── Request: Multipart form with image file
│   ├── Processing: Resize original (max 2000x2000), create thumbnail (300x300)
│   ├── Storage: S3 with unique filenames, public-read ACL
│   └── Response: Photo object with URLs
│
├── DELETE /api/farms/:id/photos/:photoId (Delete farm photo)
│   ├── Soft delete (mark as deleted, remove from S3 after 30 days)
│   └── If primary photo deleted, auto-promote next photo to primary
│
└── POST /api/farms/:id/certifications (Upload certification)
    ├── Request: Multipart form with PDF/image + cert metadata
    ├── Processing: OCR expiration date extraction (future enhancement)
    └── Status: PENDING_VERIFICATION (manual review by platform admin)

Performance Requirements:
├── Farm profile page load: <2 seconds (p95) on 3G mobile
├── Photo gallery load: Lazy loading (load images as user scrolls)
├── SEO: Server-side rendering (SSR) for farm profile pages (Next.js getServerSideProps)
└── CDN: CloudFront edge caching for all farm photos (reduce S3 load)

SEO Requirements:
├── Meta tags: Open Graph (Facebook/social sharing), Twitter Card
├── Schema.org markup: LocalBusiness structured data for Google
├── Sitemap: Include all active farm profiles (auto-generated, daily)
└── Canonical URLs: Prevent duplicate content (handle www vs non-www, trailing slashes)
```text
### Acceptance Criteria:
```text
[ ] GIVEN a consumer searches for "organic farms near Portland"
    WHEN Google indexes farm profile pages
    THEN farm profiles appear in local search results with star ratings
    AND Open Graph tags show farm photo + description when shared on Facebook

[ ] GIVEN a consumer lands on Ana Romana's farm profile page
    WHEN page loads on mobile device
    THEN hero photo displays full-width within 1 second
    AND farm story is readable without zooming (16px+ font size)
    AND "Shop Products" button is visible above fold (no scrolling required)
    AND page passes Google Core Web Vitals (LCP <2.5s, FID <100ms, CLS <0.1)

[ ] GIVEN a consumer views farm photo gallery (10 photos)
    WHEN they scroll down page
    THEN only first 3 photos load initially (lazy loading)
    AND remaining photos load as user scrolls within 200px of viewport
    AND clicking photo opens lightbox with swipe navigation

[ ] GIVEN a farmer uploads new farm certification (PDF)
    WHEN they save changes
    THEN certification appears in profile with "Pending Verification" badge
    AND platform admin receives notification to review cert
    AND farmer receives email when cert is verified (within 2 business days)

[ ] GIVEN a consumer clicks "Message Farm" on profile page
    WHEN they are logged in
    THEN message modal opens with pre-filled farm name
    AND they can send message within 30 seconds
    WHEN they are NOT logged in
    THEN they see "Log in to message this farm" prompt

[ ] GIVEN a farm profile page is shared on social media
    WHEN link preview renders
    THEN correct farm name, photo, and description appear
    AND Open Graph tags are present (verified via Facebook Debugger)
```text
### Success Metrics:
```text
CONSUMER ENGAGEMENT:
├── Profile views before first purchase: 70% of consumers view ≥1 farm profile
├── Average time on farm profile: >90 seconds (engagement indicator)
├── Photo gallery interactions: 40% of visitors view ≥3 photos
├── Review section engagement: 50% scroll to reviews, 20% expand "See All"
└── "Message Farm" clicks: 15% of profile visitors send message

FARMER ENGAGEMENT:
├── Profile completeness: 85% of farms complete story + 5+ photos
├── Certification uploads: 60% of farms upload ≥1 certification within 30 days
├── Profile updates: Farms update profile average 2x per month (seasonal changes)
└── Featured products: 70% of farms select 4-6 featured products

CONVERSION IMPACT:
├── Farms with complete profiles convert 40% higher than incomplete profiles (hypothesis)
├── Certification badges increase conversion by 25% (hypothesis)
├── 5-star rated farms get 3x more orders than <3-star farms
└── Farms with 10+ photos get 50% more profile views than 1-photo farms

SEO IMPACT:
├── Farm profiles indexed by Google within 7 days of creation
├── 30% of traffic from organic search within 6 months
├── Average search ranking: Page 1 for "[farm name] + city" searches
└── Click-through rate from search: >8% (above average for local businesses)
```text
---

### FR-003: PRODUCT LISTING MANAGEMENT (Mobile-First)

### Feature Metadata:
```text
Feature ID:      FR-003
Priority:        P0 - Critical (MVP Blocker)
Effort Estimate: 34 story points (≈ 1.5 developer-weeks)
Business Value:  100/100 (HIGHEST - enables marketplace transactions)
Dependencies:    FR-001 (Farmer Registration)
User Story:      FARM-001 from AGRICULTURAL_PERSONAS (3-minute listing)
```text
````
