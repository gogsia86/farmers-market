---
applyTo: "**/*"
description: "FR-002: Farm Profile & Storytelling - Public farm pages with photos, certifications, reviews, and SEO optimization for consumer trust and transparency"
---

# FR-002: FARM PROFILE & STORYTELLING

**Building Consumer Trust Through Transparent Farm Stories**

---

## 🔗 FEATURE NAVIGATION

- **[↑ FRD Index](../AGRICULTURAL_FRD_INDEX.instructions.md)** - Master feature index
- **[← FR-001: Farmer Registration](./FR-001_FARMER_REGISTRATION.instructions.md)** - Previous feature
- **[→ FR-003: Product Listing](./FR-003_PRODUCT_LISTING.instructions.md)** - Next critical feature
- **[AGRICULTURAL_BRD](../AGRICULTURAL_BRD.instructions.md)** - Business objectives
- **[AGRICULTURAL_PERSONAS](../AGRICULTURAL_PERSONAS.instructions.md)** - Divna Kapica user story

---

## 📋 FEATURE METADATA

```yaml
Feature ID: FR-002
Feature Name: Farm Profile & Storytelling
Priority: P0 - Critical (MVP Blocker)
Effort Estimate: 13 story points (≈ 3-4 days)
Business Value: 90/100 (consumer trust & differentiation)
Sprint: Sprint 2 (Week 2-3)
Dependencies: FR-001 (Farmer Registration)
User Story: CONS-002 from AGRICULTURAL_PERSONAS
Owner: Frontend Team + SEO Specialist
```

---

## 👤 USER STORY

```
As a conscious consumer like Divna Kapica,
I want to see detailed farm profiles with photos, practices, and certifications,
so that I can make informed purchasing decisions and support farms aligned with my values,
validated by 70% of consumers viewing farm profiles before first purchase.
```

**Persona Context**: Divna Kapica (34, conscious consumer, environmental advocate)

- **Values**: Transparency, organic practices, supporting small farms
- **Pain Point**: Grocery stores = no farm information, misleading "local" labels
- **Decision Criteria**: Farming practices, certifications, farmer story
- **Goal**: Connect emotionally with farmers before purchasing

---

## 💎 BUSINESS VALUE ALIGNMENT

### AGRICULTURAL_BRD Anti-Goals

```
TRANSPARENCY (NOT Anonymous Commodity Marketplace):
├── Farm stories humanize food producers
├── Certification badges build trust
├── Photo galleries show farm reality
└── Reviews provide social proof

COMPETITIVE DIFFERENTIATION:
├── LocalHarvest: Basic text listings (no storytelling)
├── Barn2Door: Fragmented individual farm websites
├── Farm Fresh To You: No individual farm profiles
└── OUR ADVANTAGE: Rich, consistent farm storytelling platform
```

### Success Metrics

| Metric                        | Target      | Rationale                                |
| ----------------------------- | ----------- | ---------------------------------------- |
| Profile views before purchase | 70%         | Trust prerequisite for online farm sales |
| Time on farm profile          | >90s        | Engagement indicates interest            |
| Photo gallery views           | 40% view ≥3 | Visual storytelling effectiveness        |
| Complete profiles             | 85%         | Farmers invested in platform success     |

---

## 🎯 DETAILED REQUIREMENTS

### 1. PUBLIC FARM PROFILE PAGE (Consumer View)

#### Hero Section

```yaml
Components:
  Farm Name: H1 heading, prominent placement
  Primary Photo: Hero image, full-width responsive, lazy load
  Location: "Portland, OR • 12 miles from you" (distance if logged in)
  Quick Stats:
    - Farm size: "20 acres"
    - Years farming: "Since 1997"
    - Certifications: Badge icons (USDA Organic, Biodynamic)
  Action Buttons:
    - Primary: "Shop Products" (prominent, green)
    - Secondary: "Message Farm", "Share" (outline style)

Design:
  - Mobile: Stacked layout, hero photo 100% width
  - Desktop: Hero photo left 60%, info right 40%
  - Photo: Lazy load with blur-up placeholder
  - Distance calculation: Haversine formula from user location
```

#### About Section

```yaml
Farm Story:
  - Markdown-rendered text (100-2000 chars)
  - Line breaks preserved, basic formatting
  - Links clickable (external: rel="noopener")
  - Character limit indicator for farmers when editing

Farming Practices:
  - Visual badges: Organic methods, No-till, Pesticide-free, etc.
  - Icon + label design, tooltip on hover/tap
  - Color-coded: Green (certified), Blue (practiced)

Primary Products:
  - Category tags: Vegetables, Fruit, Eggs, Dairy, Meat
  - Clickable: Filter farm products by category
  - Max 5 categories displayed (show most relevant)

Growing Season:
  - Display: "March–November: Peak harvest June–September"
  - Visual calendar: Month bars showing growing season
  - Current status: "In season now" or "Seasonal: Opens March 15"
```

#### Photo Gallery

```yaml
Layout:
  - Grid: 2-3 columns mobile, 3-4 columns desktop
  - Masonry layout for varied photo sizes
  - Lazy load: First 3 photos, rest on scroll

Photos (up to 10):
  - Farm photos: Fields, crops, animals
  - Product photos: Harvested produce
  - Farmer photos: People working, family
  - Captions: 100 chars max, optional

Lightbox View:
  - Full-screen gallery on photo click
  - Swipe navigation (mobile), arrow keys (desktop)
  - Photo counter: "3 / 10"
  - Close button: X icon top-right
  - Caption overlay: Bottom, semi-transparent background
```

#### Certifications Section

```yaml
Visual Badges:
  - USDA Organic, Biodynamic, Certified Humane, etc.
  - High-quality badge icons (SVG)
  - Hover/tap: Show cert details

Certification Details:
  - Issuing organization: "Oregon Tilth"
  - Expiration date: "Valid until: December 31, 2025"
  - Uploaded documents: View cert PDF/photo
  - Verification status: "Platform Verified" checkmark

Upload Feature (Farmer):
  - PDF or photo upload
  - OCR future: Auto-extract expiration date
  - Admin review: Pending → Verified (2 business days)
```

#### Fulfillment Options

```yaml
Delivery (if enabled):
  - Days available: "Tuesday, Friday"
  - Delivery fee: "$5" or "Free over $50"
  - Delivery radius: "Within 25 miles" + interactive map
  - Map: Shaded circle showing delivery area

Farm Pickup (if enabled):
  - Address: "1234 Farm Road, Portland, OR 97201"
  - Hours: "Saturday 10am–2pm, Wednesday 4pm–7pm"
  - Instructions: "Park in gravel lot, ring doorbell at farmstand"
  - Map: Pin showing exact farm location

Farmers Market Pickup:
  - List of markets: "PSU Farmers Market, Beaverton Farmers Market"
  - Details per market:
    └── Days/times: "Saturday 8am–1pm"
    └── Booth location: "Section C, Booth 12"
    └── Map: Pin showing market location
```

#### Products Preview

```yaml
Featured Products (4-6):
  - Farmer-selected or randomized from available
  - Product cards: Photo, name, price, "Add to Cart"
  - Grid: 2 columns mobile, 3-4 desktop
  - "See All Products" link: Navigate to full catalog

Product Card Design:
  - Photo: Square crop, 300x300px thumbnail
  - Name: 2-line max, truncate with ellipsis
  - Price: Large, prominent "$3.50 / lb"
  - Availability: "In stock" or "Out of stock" badge
  - Quick add: "Add to Cart" button (if in stock)
```

#### Reviews & Ratings

```yaml
Overall Farm Rating:
  - Star display: 4.8 ★★★★★ (visual stars)
  - Review count: "Based on 47 reviews"
  - Rating breakdown: 5★(35), 4★(10), 3★(2), 2★(0), 1★(0)

Recent Reviews (3-5 most recent):
  - Star rating per review
  - Review text: 500 chars max, expandable
  - Reviewer: First name + initial ("Sarah M.")
  - Date: Relative time ("2 days ago")
  - Farmer response: Optional, public, indented

Farmer Responses:
  - Display: Indented below review, "Farm Owner Response:"
  - Badge: "Response from Ana Romana"
  - Helpful for transparency and customer service
```

#### Contact Section

```yaml
Message Farm Button:
  - Opens chat/message modal
  - Requires login (prompt if not logged in)
  - Pre-filled: Farm name in "To:" field
  - Send within 30 seconds

Social Media Links:
  - Facebook, Instagram, Website (if farmer provided)
  - Icon buttons, open in new tab
  - Optional: Farmer chooses to display or hide

Farm Email/Phone:
  - Optional: Farmer can choose to display publicly
  - Privacy default: Hidden (use in-app messaging)
  - If displayed: Clickable (mailto:, tel: links)
```

---

### 2. FARM PROFILE EDITING (Farmer Dashboard)

```yaml
Edit Mode Features:
  - Inline editing: Click to edit, auto-save on blur
  - Preview mode: "Preview Public View" button
  - Rich text editor: Markdown toolbar for farm story
  - Photo management: Drag-and-drop reorder, bulk upload
  - Certification uploads: PDF/photo with status tracking
  - SEO optimization: Meta description, keywords, slug

Auto-Save:
  - Save on blur: 500ms debounce
  - Draft indicator: "Draft saved 10 seconds ago"
  - Conflict resolution: Warn if another user editing

Photo Management:
  - Primary photo: One primary per farm (hero image)
  - Reorder: Drag-and-drop gallery order
  - Bulk upload: Select multiple files
  - Edit: Caption, alt text (accessibility)
  - Delete: Soft delete, 30-day recovery

Certification Management:
  - Upload: PDF or photo (max 5MB)
  - Metadata: Type, issuer, expiration date
  - Status: Pending Verification → Verified (admin review)
  - Reminder: Email 30 days before cert expires
```

---

### 3. TECHNICAL REQUIREMENTS

#### Database Schema

```sql
-- Farm_Photos Table
CREATE TABLE farm_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  photo_url VARCHAR(500) NOT NULL,
  photo_url_thumbnail VARCHAR(500) NOT NULL, -- 300x300 auto-generated
  caption VARCHAR(100),
  alt_text VARCHAR(100) NOT NULL, -- Accessibility
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT one_primary_per_farm UNIQUE (farm_id, is_primary)
    WHERE is_primary = TRUE
);

CREATE INDEX idx_farm_photos_farm ON farm_photos(farm_id);

-- Farm_Certifications Table
CREATE TABLE farm_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  certification_type VARCHAR(50) NOT NULL,
    -- USDA_ORGANIC, BIODYNAMIC, CERTIFIED_HUMANE,
    -- ANIMAL_WELFARE_APPROVED, REGENERATIVE_ORGANIC
  certification_document_url VARCHAR(500),
  issuing_organization VARCHAR(100) NOT NULL,
  issue_date DATE,
  expiration_date DATE,
  status VARCHAR(30) DEFAULT 'PENDING_VERIFICATION',
    -- PENDING_VERIFICATION | VERIFIED | EXPIRED
  verified_by_user_id UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_farm_certs_farm ON farm_certifications(farm_id);
CREATE INDEX idx_farm_certs_status ON farm_certifications(status);

-- Enhance Farms table (from FR-001)
ALTER TABLE farms ADD COLUMN seo_meta_description VARCHAR(160);
ALTER TABLE farms ADD COLUMN seo_keywords JSONB DEFAULT '[]';
ALTER TABLE farms ADD COLUMN social_facebook_url VARCHAR(255);
ALTER TABLE farms ADD COLUMN social_instagram_url VARCHAR(255);
ALTER TABLE farms ADD COLUMN social_website_url VARCHAR(255);
ALTER TABLE farms ADD COLUMN display_email BOOLEAN DEFAULT FALSE;
ALTER TABLE farms ADD COLUMN display_phone BOOLEAN DEFAULT FALSE;
ALTER TABLE farms ADD COLUMN featured_product_ids JSONB DEFAULT '[]';
ALTER TABLE farms ADD COLUMN profile_views_count INTEGER DEFAULT 0;
ALTER TABLE farms ADD COLUMN profile_clicks_count INTEGER DEFAULT 0;
```

#### API Endpoints

```typescript
// GET /api/farms/:slug - Public farm profile
GET /api/farms/sun-valley-organics

Response (200 OK):
{
  farm: {
    id: "uuid-123",
    name: "Sun Valley Organics",
    slug: "sun-valley-organics",
    description: "Family farm growing organic vegetables since 1997...",
    location: {
      city: "Portland",
      state: "OR",
      distanceFromUser: 12.3 // miles (if user logged in)
    },
    stats: {
      farmSize: "20 acres",
      yearsFarming: 27,
      certifications: ["USDA_ORGANIC"]
    },
    photos: [
      {
        id: "photo-1",
        url: "<https://cdn.farmersmarket.com/farms/sun-valley/hero.jpg",>
        thumbnail: "<https://cdn.farmersmarket.com/farms/sun-valley/hero_300x300.jpg",>
        caption: "Tomato field in peak summer",
        isPrimary: true
      },
      // ... more photos
    ],
    certifications: [
      {
        type: "USDA_ORGANIC",
        issuer: "Oregon Tilth",
        expiresAt: "2025-12-31",
        status: "VERIFIED",
        documentUrl: "<https://cdn.../cert.pdf">
      }
    ],
    fulfillmentOptions: {
      delivery: {
        enabled: true,
        days: ["Tuesday", "Friday"],
        fee: 5.00,
        freeOver: 50.00,
        radiusMiles: 25
      },
      farmPickup: {
        enabled: true,
        address: "1234 Farm Road, Portland, OR",
        hours: "Sat 10am-2pm, Wed 4pm-7pm",
        instructions: "Ring doorbell at farmstand"
      },
      farmersMarkets: [
        {
          name: "PSU Farmers Market",
          days: "Saturday",
          hours: "8am-1pm",
          boothLocation: "Section C, Booth 12"
        }
      ]
    },
    featuredProducts: [...], // 4-6 products
    rating: {
      average: 4.8,
      count: 47,
      distribution: {5: 35, 4: 10, 3: 2, 2: 0, 1: 0}
    },
    recentReviews: [...] // 3-5 most recent
  }
}

Performance:
  - Cache: Redis 5 minutes, invalidate on farm update
  - CDN: CloudFront for all photos
  - Database: Single query with joins (optimized)
```

---

### 4. PERFORMANCE REQUIREMENTS

```yaml
Page Load Times:
  - Farm profile page: <2 seconds (p95) on 3G mobile
  - Hero image: <1 second (blur-up placeholder)
  - Photo gallery: Lazy load (first 3 immediate, rest on scroll)

SEO Requirements:
  - Server-side rendering: Next.js getServerSideProps
  - Meta tags: Open Graph (Facebook), Twitter Card
  - Schema.org: LocalBusiness structured data
  - Sitemap: Include all active farm profiles (daily update)
  - Canonical URLs: Prevent duplicate content

CDN Strategy:
  - CloudFront: All farm photos cached at edge
  - Cache headers: 1 year for photos, 5 min for profile data
  - Invalidation: On photo delete/reorder, purge CDN

Core Web Vitals:
  - LCP (Largest Contentful Paint): <2.5 seconds
  - FID (First Input Delay): <100 milliseconds
  - CLS (Cumulative Layout Shift): <0.1
```

---

## ✅ ACCEPTANCE CRITERIA

### Functional Acceptance

**Given** a consumer searches "organic farms near Portland" on Google
**When** Google indexes farm profile pages
**Then** farm profiles appear in local search results with star ratings
**And** Open Graph tags show farm photo + description when shared on Facebook

---

**Given** a consumer lands on Ana Romana's farm profile
**When** page loads on mobile device
**Then** hero photo displays full-width within 1 second
**And** farm story is readable without zooming (16px+ font)
**And** "Shop Products" button visible above fold
**And** page passes Core Web Vitals (LCP <2.5s, FID <100ms, CLS <0.1)

---

**Given** a consumer views farm photo gallery (10 photos)
**When** they scroll down page
**Then** first 3 photos load immediately
**And** remaining photos load as user scrolls within 200px of viewport
**And** clicking photo opens lightbox with swipe navigation

---

**Given** a farmer uploads new certification PDF
**When** they save changes
**Then** certification appears with "Pending Verification" badge
**And** platform admin receives notification
**And** farmer receives email when verified (within 2 business days)

---

**Given** a farm profile page is shared on Facebook
**When** link preview renders
**Then** correct farm name, photo, and description appear
**And** Open Graph tags present (verified via Facebook Debugger)

---

## 📊 SUCCESS METRICS

### Consumer Engagement

| Metric                        | Target      | Measurement                                       |
| ----------------------------- | ----------- | ------------------------------------------------- |
| Profile views before purchase | 70%         | Analytics: Profile view → Order conversion funnel |
| Time on farm profile          | >90s        | Google Analytics: Average session duration        |
| Photo gallery views           | 40% view ≥3 | Event tracking: Photo clicks                      |
| Review section scroll         | 50%         | Scroll depth tracking                             |
| Message farm clicks           | 15%         | Button click tracking                             |

### Farmer Engagement

| Metric                     | Target           | Measurement                      |
| -------------------------- | ---------------- | -------------------------------- |
| Profile completeness       | 85%              | Farms with story + 5+ photos     |
| Certification uploads      | 60% in 30 days   | Farms with ≥1 cert               |
| Profile updates            | 2x per month avg | Farm profile edit frequency      |
| Featured products selected | 70%              | Farms with 4-6 featured products |

### Conversion Impact

| Metric               | Hypothesis                    | Test Method         |
| -------------------- | ----------------------------- | ------------------- |
| Complete profiles    | +40% conversion vs incomplete | A/B test            |
| Certification badges | +25% conversion               | A/B test            |
| 5-star farms         | 3x orders vs <3-star          | Cohort analysis     |
| 10+ photos           | +50% views vs 1-photo         | Regression analysis |

---

## ⚠️ RISK ASSESSMENT

### Technical Risks

| Risk                                   | Impact | Probability | Mitigation                                               |
| -------------------------------------- | ------ | ----------- | -------------------------------------------------------- |
| Photo upload failures (rural internet) | Medium | Medium      | Aggressive compression, retry logic, progress indicator  |
| SEO indexing delays                    | Low    | Medium      | Submit sitemap to Google, fetch as Google tool           |
| CDN costs for photos                   | Medium | Low         | Image optimization, lazy loading, CloudFront cost alerts |

### UX Risks

| Risk                              | Impact | Probability | Mitigation                                        |
| --------------------------------- | ------ | ----------- | ------------------------------------------------- |
| Farmers skip profile completion   | High   | Medium      | Onboarding wizard, completion checklist, examples |
| Consumers don't scroll to reviews | Medium | Medium      | Reviews higher on page, "See Reviews" CTA in hero |
| Mobile photo gallery awkward      | Medium | Low         | Touch-optimized lightbox, swipe gestures          |

---

## 🔗 DEPENDENCIES

### External Services

- **AWS S3**: Photo storage and delivery
- **CloudFront CDN**: Edge caching for photos
- **Google Maps**: Delivery radius visualization, farm/market pins

### Internal Dependencies

- **FR-001**: Farmer registration (farm data must exist)
- **FR-017**: Review & rating system (display on profile)
- **File upload service**: Reusable photo upload component

---

**Version**: v1.0.0 - October 2025
**Status**: ✅ Ready for Development
**Owner**: Frontend Team + SEO Specialist

_"Every farm has a story. Make it easy to tell and impossible to ignore."_
