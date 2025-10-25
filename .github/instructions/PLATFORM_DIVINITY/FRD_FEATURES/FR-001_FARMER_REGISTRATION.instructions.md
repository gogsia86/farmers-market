---
applyTo: "**/*"
description: "FR-001: Farmer Registration & Profile Management - Complete feature specification with 5-minute mobile onboarding, Stripe Connect integration, and team management"
---

# FR-001: FARMER REGISTRATION & PROFILE MANAGEMENT

**Mobile-First Farmer Onboarding in Under 5 Minutes**

---

## 🔗 FEATURE NAVIGATION

- **[↑ FRD Index](../AGRICULTURAL_FRD_INDEX.instructions.md)** - Master feature index
- **[→ FR-002: Farm Profile & Storytelling](./FR-002_FARM_PROFILE.instructions.md)** - Next logical feature
- **[→ FR-003: Product Listing](./FR-003_PRODUCT_LISTING.instructions.md)** - Critical path continuation
- **[AGRICULTURAL_BRD](../AGRICULTURAL_BRD.instructions.md)** - Business objectives
- **[AGRICULTURAL_PERSONAS](../AGRICULTURAL_PERSONAS.instructions.md)** - Ana Romana user story

---

## 📋 FEATURE METADATA

```yaml
Feature ID: FR-001
Feature Name: Farmer Registration & Profile Management
Priority: P0 - Critical (MVP Blocker)
Effort Estimate: 21 story points (≈ 1 developer-week)
Business Value: 85/100 (foundation for farmer onboarding)
Sprint: Sprint 2 (Week 2-3)
Dependencies: None (first farmer feature to build)
User Story: FARM-001 from AGRICULTURAL_PERSONAS
Owner: Backend Team + Mobile Team
```

---

## 👤 USER STORY

```
As a small-scale organic farmer like Ana Romana,
I want to create a farm profile in under 5 minutes from my smartphone,
so that I can start selling online without technical barriers or time-consuming setup,
validated by 80% of farmers completing profile setup on first session.
```

**Persona Context**: Ana Romana (28, small-scale organic farmer)

- **Tech Literacy**: Basic smartphone user, intimidated by complex tech
- **Time Constraints**: Harvest season = 60-80 hour weeks
- **Pain Point**: Barn2Door onboarding took 2-4 hours, too complex
- **Goal**: List products and start selling within same day as registration

---

## 💎 BUSINESS VALUE ALIGNMENT

### AGRICULTURAL_BRD Objectives

```
┌─────────────────────────────────────────────────────────────┐
│ PRIMARY OBJECTIVE: Onboard 50 farms by Month 6              │
│ SUCCESS METRIC: <5 minutes average onboarding time          │
│ ACTIVATION RATE: 85% complete profiles = 85% activation     │
│ COMPETITIVE ADVANTAGE: Faster than Barn2Door (2-4 hours),   │
│                        LocalHarvest (15+ min)               │
└─────────────────────────────────────────────────────────────┘
```

### Success Metrics Breakdown

| Metric                         | Target       | Rationale                                   |
| ------------------------------ | ------------ | ------------------------------------------- |
| Registration → Completion Rate | >80%         | Industry standard SaaS onboarding           |
| Average Time to Complete       | <5 min (p90) | Competitive advantage vs alternatives       |
| Mobile Registrations           | >75%         | Farmers register during downtime, in fields |
| Email Verification             | >90% in 24h  | Account activation requirement              |
| Profile Completeness           | >85%         | Complete profiles convert 2x better         |

---

## 🎯 DETAILED REQUIREMENTS

### 1. FUNCTIONAL REQUIREMENTS

#### Registration Flow (3 Steps, <5 Minutes Total)

**Step 1: Account Creation (Target: 90 seconds)**

```
REQUIRED FIELDS:
├── Email address (validated, becomes username)
│   └── Format validation: RFC 5322 compliant
│   └── Uniqueness check: Real-time, <200ms response
├── Password (min 12 chars, complexity requirements)
│   └── 1 uppercase, 1 lowercase, 1 number, 1 special character
│   └── Strength indicator: Visual bar (weak/medium/strong)
├── Farm name (3-100 characters, unique within region)
│   └── Real-time availability check
│   └── Auto-suggest alternatives if taken
├── Mobile phone number (E.164 format, verified via SMS)
│   └── SMS verification code (6 digits, 10-minute expiry)
│   └── Twilio API integration
└── Terms of Service & Platform Commission acknowledgment
    └── "I understand Farmers Market takes 15% commission"
    └── Checkbox required, link to full TOS

VALIDATION RULES:
├── Email: Must be unique, valid format, not disposable domain
├── Password: zxcvbn score ≥3, no common passwords (10K list)
├── Farm name: No special chars except dash/apostrophe, profanity filter
├── Phone: Must match country code, SMS-capable number
└── Real-time validation: Inline errors, no page refresh
```

**Step 2: Farm Location & Basics (Target: 90 seconds)**

```
REQUIRED FIELDS:
├── Farm address (Google Maps autocomplete)
│   ├── Geocoded to lat/long for location-based search
│   ├── Accuracy verification: "Is this pin correct?" with map
│   └── Fallback: Manual lat/long entry if autocomplete fails
├── Farm size (dropdown selection)
│   └── Options: <5 acres, 5-20, 20-50, 50-100, 100+ acres
├── Primary products (multi-select, min 1, max 5)
│   └── Options: Vegetables, Fruit, Dairy, Meat, Eggs, Flowers,
│       Herbs, Honey, Preserves, Baked Goods, Plants/Seedlings
├── Certifications (optional multi-select)
│   └── Options: USDA Organic, Biodynamic, Certified Humane,
│       Animal Welfare Approved, Regenerative Organic, None
└── Growing season (dropdown)
    └── Options: Year-round, Spring-Fall (Mar-Nov),
        Summer Only (Jun-Sep), Custom (date picker)

DESIGN CONSIDERATIONS:
├── Mobile-first: Large tap targets (44x44px minimum)
├── Google Maps integration: Address autocomplete for speed
├── Visual icons: Each product category has icon for quick scanning
└── Skip option: "Set these later" link (minimum viable profile first)
```

**Step 3: Farm Story & Photo (Target: 90 seconds)**

```
REQUIRED FIELDS:
├── Farm description (100-500 characters)
│   ├── Placeholder: "Tell customers about your farm..."
│   ├── Character counter: Live update "234/500 chars"
│   └── Markdown support: *italic*, **bold**, links
├── Farm photo upload (mobile camera integration)
│   ├── Min resolution: 800x600px
│   ├── Max file size: 5MB
│   ├── Auto-resize: Server-side to 2000x2000px max
│   ├── Auto-orientation: Fix EXIF rotation issues
│   └── Compression: 85% quality JPEG
├── Farming practices (checkboxes, optional)
│   └── Options: Organic methods, No-till, Regenerative,
│       Pesticide-free, Integrated Pest Management, Pasture-raised
└── Contact preferences (email, SMS, both)
    └── Default: Both (can customize in settings later)

UX ENHANCEMENTS:
├── Mobile camera: "Take Photo" or "Choose from Library"
├── Photo preview: Show cropped/resized preview before upload
├── Progress indicator: "Uploading... 67%" with cancel option
├── Example farms: Link to 2-3 example profiles for inspiration
└── Save draft: Auto-save every 30 seconds to prevent data loss
```

#### Post-Registration Profile Management

```
EDITABLE PROFILE FIELDS:
├── Farm story & description
│   └── Expandable to 2,000 characters (from initial 500)
│   └── Rich text editor: Markdown toolbar, formatting preview
├── Photo gallery (up to 10 photos)
│   └── Drag-and-drop reorder (set primary photo)
│   └── Bulk upload: Select multiple photos at once
│   └── Captions: 100 chars per photo (optional)
├── Detailed certifications
│   └── Upload cert photos/PDFs (USDA Organic cert, etc.)
│   └── Expiration dates: Reminder emails 30 days before expiry
│   └── Status: Pending Verification → Verified by admin
├── Farm team members
│   └── Add/remove managers with email invites
│   └── Roles: Owner (full access), Manager (limited access)
│   └── Permissions: See FR-001 RBAC matrix in main FRD
├── Fulfillment options
│   ├── Delivery: Enable/disable, delivery days, fees, radius
│   ├── Farm pickup: Enable/disable, hours, instructions
│   └── Farmers market: Add markets (name, location, days, hours)
├── Payment settings (Stripe Connect)
│   └── Onboarding flow: Redirect to Stripe, return to dashboard
│   └── Bank account: Required for payouts
│   └── Status: Pending → Verified (2-3 business days)
└── Notification preferences
    └── Order alerts: Email, SMS, Push, None
    └── Message alerts: Instant, Daily digest, None
    └── Payout notifications: Email on each payout

PERMISSIONS:
├── Farm Owner: Full edit access to all profile fields
├── Farm Manager: View-only for profile, edit products/inventory
└── Platform Admin: Full access for support/verification
```

---

### 2. TECHNICAL REQUIREMENTS

#### Database Schema

**Farms Table** (Primary entity)

```sql
CREATE TABLE farms (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly farm name

  -- Contact
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL, -- E.164 format: +1234567890

  -- Location
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip VARCHAR(20) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,

  -- Farm Details
  farm_size_acres VARCHAR(20) NOT NULL, -- '<5', '5-20', '20-50', '50-100', '100+'
  primary_products JSONB NOT NULL DEFAULT '[]', -- ["vegetables", "fruit", ...]
  certifications JSONB DEFAULT '[]', -- [{"type": "USDA_ORGANIC", "expires": "2025-12-31"}, ...]
  growing_season JSONB NOT NULL, -- {"type": "seasonal", "start": "03-15", "end": "11-30"}

  -- Profile Content
  description TEXT CHECK (char_length(description) <= 2000),
  farming_practices JSONB DEFAULT '[]', -- ["organic", "no-till", ...]
  profile_photo_url VARCHAR(500),
  gallery_photo_urls JSONB DEFAULT '[]', -- ["<https://s3.../photo1.jpg",> ...]

  -- Payment
  stripe_connect_account_id VARCHAR(255),
  payout_enabled BOOLEAN DEFAULT FALSE,

  -- Status & Metadata
  status VARCHAR(50) DEFAULT 'PENDING_VERIFICATION',
    -- PENDING_VERIFICATION | ACTIVE | SUSPENDED | ARCHIVED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete

  -- Indexes
  CONSTRAINT farms_email_key UNIQUE (email),
  CONSTRAINT farms_slug_key UNIQUE (slug)
);

-- Indexes for performance
CREATE INDEX idx_farms_owner ON farms(owner_user_id);
CREATE INDEX idx_farms_location ON farms USING GIST (
  ll_to_earth(latitude, longitude)
); -- Geospatial queries
CREATE INDEX idx_farms_status ON farms(status) WHERE status = 'ACTIVE';
CREATE INDEX idx_farms_slug ON farms(slug);
```

**Farm_Team_Members Table** (Farm collaboration)

```sql
CREATE TABLE farm_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'OWNER' | 'MANAGER'

  -- Invitation workflow
  invited_by UUID NOT NULL REFERENCES users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,

  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING | ACTIVE | REVOKED

  -- Indexes
  UNIQUE (farm_id, user_id)
);

CREATE INDEX idx_team_farm ON farm_team_members(farm_id);
CREATE INDEX idx_team_user ON farm_team_members(user_id);
```

#### API Endpoints

**POST /api/auth/register/farmer** - Create farmer account + farm profile

```typescript
Request Body:
{
  // Step 1: Account
  email: string;           // "ana@sunvalley.farm"
  password: string;        // Min 12 chars, complexity requirements
  farmName: string;        // "Sun Valley Organics"
  phone: string;           // "+15035551234" (E.164 format)
  smsCode: string;         // "123456" (verification code)

  // Step 2: Location
  address: {
    line1: string;         // "1234 Farm Road"
    line2?: string;        // "Suite 100"
    city: string;          // "Portland"
    state: string;         // "OR"
    zip: string;           // "97201"
    latitude: number;      // 45.5230
    longitude: number;     // -122.6780
  };
  farmSize: string;        // "5-20"
  primaryProducts: string[]; // ["vegetables", "fruit"]
  certifications?: string[]; // ["USDA_ORGANIC"]
  growingSeason: {
    type: string;          // "seasonal" | "year-round"
    start?: string;        // "03-15" (MM-DD)
    end?: string;          // "11-30" (MM-DD)
  };

  // Step 3: Story
  description: string;     // 100-500 chars
  farmPhoto?: File;        // Multipart upload
  farmingPractices?: string[]; // ["organic", "no-till"]
  contactPreferences: string; // "email" | "sms" | "both"

  // Legal
  agreedToTerms: boolean;  // Must be true
}

Response (201 Created):
{
  success: true;
  farm: {
    id: "uuid-123";
    farmName: "Sun Valley Organics";
    slug: "sun-valley-organics";
    email: "ana@sunvalley.farm";
    status: "PENDING_VERIFICATION";
    stripeConnectRequired: true;
  };
  user: {
    id: "uuid-456";
    email: "ana@sunvalley.farm";
    role: "FARM_OWNER";
    emailVerificationSent: true;
  };
  nextSteps: [
    "Verify email (check inbox for link)",
    "Complete Stripe Connect onboarding (required for payouts)",
    "Add products to start selling"
  ];
}

Errors (400/409/422):
{
  success: false;
  error: "VALIDATION_ERROR" | "DUPLICATE_EMAIL" | "DUPLICATE_FARM_NAME";
  details: {
    email?: "Email already registered";
    farmName?: "Farm name taken. Try: Sun Valley Organics PDX, Sun Valley Farm";
    password?: "Password too weak. Must have uppercase, number, special char";
  };
}
```

**PUT /api/farms/:id/profile** - Update farm profile (authenticated)

```typescript
Request Headers:
Authorization: Bearer <jwt_token>

Request Body (all fields optional, update what changed):
{
  description?: string;           // Max 2000 chars
  farmingPractices?: string[];    // ["organic", "regenerative"]
  growingSeason?: {...};          // Update season dates
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    website?: string;
  };
  displayEmail?: boolean;         // Show email on public profile
  displayPhone?: boolean;         // Show phone on public profile
}

Response (200 OK):
{
  success: true;
  farm: {...}; // Updated farm object
  message: "Profile updated successfully";
}

Performance:
├── API Response Time: <300ms (p95)
├── Cache Invalidation: Purge Redis cache for farm profile
└── Audit Log: Record all profile changes for compliance
```

**POST /api/farms/:id/team/invite** - Invite farm team member

```typescript
Request Body:
{
  email: string;          // Invite email
  role: "MANAGER";        // Only MANAGER role allowed (OWNER auto-assigned)
  message?: string;       // Optional personal message
}

Response (201 Created):
{
  success: true;
  invitation: {
    id: "uuid-789";
    farm: "Sun Valley Organics";
    inviteeEmail: "manager@example.com";
    role: "MANAGER";
    status: "PENDING";
    expiresAt: "2025-11-01T00:00:00Z"; // 7 days
  };
  message: "Invitation sent to manager@example.com";
}

Email Notification Sent:
Subject: "You've been invited to manage Sun Valley Organics"
Body: "Ana Romana invited you to help manage Sun Valley Organics farm..."
CTA Button: "Accept Invitation" (link to /accept-invite/:token)
```

---

### 3. PERFORMANCE REQUIREMENTS

```yaml
API Response Times (p95):
  - Registration endpoint: <500ms
  - Profile update endpoint: <300ms
  - SMS verification send: <2 seconds (Twilio dependency)
  - Email verification send: <1 second (SendGrid dependency)

Photo Upload (Mobile):
  - 5MB photo on 3G connection: <30 seconds
  - Progress indicator: Real-time percentage updates
  - Retry logic: Auto-retry 3 times on network failure
  - Compression: Aggressive (85% quality) for rural internet

Mobile Performance:
  - Registration form render: <1 second
  - Step transition: <200ms (instant feel)
  - Inline validation: <100ms (real-time feedback)
  - Auto-save draft: Every 30 seconds, <200ms save time

Scalability:
  - Concurrent registrations: Support 100 simultaneous registrations
  - Database connection pool: 20 connections (scale horizontally)
  - Rate limiting: 5 registration attempts per IP per hour
```

---

### 4. SECURITY REQUIREMENTS

```yaml
Password Security:
  - Hashing: bcrypt with salt, cost factor 12
  - Minimum length: 12 characters
  - Complexity: 1 uppercase, 1 lowercase, 1 number, 1 special
  - Strength check: zxcvbn library, minimum score 3/4
  - Common password block: Check against 10,000 most common passwords

Email Verification:
  - Required before farm goes live (status = ACTIVE)
  - Verification link: JWT token, 24-hour expiry
  - Resend limit: 3 times per day per email
  - Spam protection: ReCAPTCHA v3 on registration form

Phone Verification:
  - SMS code: 6 digits, 10-minute expiry
  - Rate limiting: 3 SMS per phone per hour
  - Twilio Verify API: Built-in fraud detection
  - Retry limit: 5 incorrect attempts = 1-hour lockout

Data Encryption:
  - At rest: AES-256 encryption for all PII
  - In transit: TLS 1.3 minimum
  - Database: Encrypted connection strings in environment variables
  - S3 uploads: Server-side encryption enabled (AES-256)

CSRF Protection:
  - Token-based: Unique token per form submission
  - SameSite cookies: Strict mode
  - Token expiry: 1 hour (refresh on page load)

Rate Limiting:
  - Registration: 5 attempts per IP per hour
  - Login: 10 attempts per IP per hour
  - Password reset: 3 attempts per email per day
  - API endpoints: 100 requests per user per minute
```

---

### 5. UX/UI REQUIREMENTS

```yaml
Mobile-First Design:
  - Thumb-zone optimization: Critical actions in bottom 1/3 of screen
  - Tap targets: Minimum 44x44px (WCAG 2.1 AAA compliance)
  - Font sizes: Minimum 16px (prevent auto-zoom on iOS)
  - Form inputs: Large, easy to tap, clear labels above (not placeholder-only)
  - Navigation: Fixed bottom nav bar for critical actions

Progress Indicators:
  - Step counter: "Step 1 of 3" with visual progress bar
  - Photo upload: Real-time percentage "Uploading... 67%"
  - Auto-save: "Draft saved 10 seconds ago" subtle indicator
  - SMS verification: Countdown timer "Code expires in 9:43"

Inline Validation:
  - Real-time feedback: Validate as user types (debounced 300ms)
  - Error messages: Specific, actionable, friendly tone
    ✗ "Invalid email" → ✓ "Email format incorrect. Did you mean ana@gmail.com?"
  - Success indicators: Green checkmark on valid input
  - Disable submit: Gray out "Next" button until all fields valid

Helpful Features:
  - Farm name suggestions: "Sun Valley Organics taken. Try: Sun Valley Organics PDX"
  - Photo preview: Show cropped preview before upload
  - Example farms: "See what other farmers have done" link
  - Tooltips: Help icons explain "What's a farm slug?" on hover/tap
  - Autocomplete: Google Maps address autocomplete for speed

Accessibility (WCAG 2.1 AA):
  - Screen reader support: All form fields have proper ARIA labels
  - Keyboard navigation: Tab through all fields, Enter to submit
  - Color contrast: 4.5:1 minimum for text
  - Error announcements: Screen reader announces validation errors
  - Focus indicators: Clear visual focus ring on all interactive elements
```

---

## ✅ ACCEPTANCE CRITERIA

### Functional Acceptance

**Given** a farmer visits the registration page on mobile
**When** they complete all 3 steps with valid information
**Then** their farm profile is created with status `PENDING_VERIFICATION`
**And** they receive email verification link within 60 seconds
**And** they receive SMS verification code within 60 seconds
**And** registration completes in <5 minutes (90th percentile)

---

**Given** a farmer uploads a farm photo
**When** the image is >5MB or wrong format
**Then** they see clear error message with size/format requirements
**And** are prompted to select a different photo

---

**Given** a farmer enters duplicate farm name in same region
**When** they attempt to register
**Then** they see error: "Farm name already taken in your area. Try [suggested alternative]"
**And** system suggests 2-3 alternative names

---

**Given** a registered farmer logs in
**When** they navigate to farm profile settings
**Then** they can edit all profile fields except email (requires verification)
**And** changes save within 300ms (p95)
**And** they see success confirmation message

---

**Given** a farm owner wants to add a farm manager
**When** they enter manager email and send invite
**Then** manager receives email with accept/decline link
**And** manager can accept invite and gain MANAGER role permissions
**And** manager appears in farm team list

---

### Security Acceptance

**Given** a user attempts registration with weak password
**When** they submit the form
**Then** they see error: "Password must be 12+ characters with uppercase, number, special character"
**And** form does not submit until requirements met

---

**Given** a farmer has not verified email
**When** they attempt to publish products
**Then** they see modal: "Verify email to activate farm profile"
**And** are blocked from publishing until verified

---

**Given** a malicious user attempts 6 registrations from same IP in 1 hour
**When** they make 6th attempt
**Then** they are rate-limited for 1 hour
**And** see message: "Too many registration attempts. Try again in 60 minutes"

---

### Performance Acceptance

**Given** normal system load (1,000 concurrent users)
**When** 100 farmers register simultaneously
**Then** 95% complete in <5 minutes total time
**And** API response times stay <500ms (p95)
**And** no registration failures due to system load

---

**Given** a farmer uploads 5MB farm photo on 3G mobile connection
**When** upload begins
**Then** progress bar shows real-time upload percentage
**And** upload completes in <30 seconds
**And** farmer sees preview of uploaded photo within 2 seconds

---

### Accessibility Acceptance

**Given** a visually impaired farmer using screen reader
**When** they navigate registration form
**Then** all form fields have proper ARIA labels
**And** error messages are announced by screen reader
**And** they can complete registration with keyboard only (no mouse required)

---

**Given** farmer with motor impairment using touchscreen
**When** they interact with form elements
**Then** all tap targets are ≥44x44px
**And** form is usable with single-finger touch
**And** no hover-dependent interactions

---

## 📊 SUCCESS METRICS

### Adoption Metrics

| Metric                                | Target       | Current | Status    |
| ------------------------------------- | ------------ | ------- | --------- |
| Registration start → completion rate  | >80%         | TBD     | 🎯 Target |
| Average time to complete registration | <5 min (p90) | TBD     | 🎯 Target |
| Mobile registration percentage        | >75%         | TBD     | 🎯 Target |
| Email verification rate (24h)         | >90%         | TBD     | 🎯 Target |
| Profile completeness                  | >85%         | TBD     | 🎯 Target |

### Quality Metrics

| Metric                             | Target | Current | Status    |
| ---------------------------------- | ------ | ------- | --------- |
| Registration errors                | <2%    | TBD     | 🎯 Target |
| Failed photo uploads               | <5%    | TBD     | 🎯 Target |
| Support tickets for registration   | <3%    | TBD     | 🎯 Target |
| Stripe Connect completion (7 days) | >80%   | TBD     | 🎯 Target |

### Business Impact Milestones

```
Month 1 (Pilot): 15-20 farms registered
├── Hand-picked pilot farmers from farmers markets
├── In-person onboarding events (3-4 markets)
└── Goal: Validate 5-minute onboarding hypothesis

Month 3 (MVP): 50 farms registered
├── Organic growth from pilot farmer referrals
├── Social media marketing campaign launch
└── Goal: Achieve 50 farms milestone for marketplace viability

Month 6 (Scale): 100-150 farms registered
├── Paid marketing campaigns (Facebook, Instagram, Google)
├── Regional expansion (Portland → Seattle → SF)
└── Goal: Profitable unit economics at 100+ farms

Farmer Retention: >85% of registered farms remain active after 3 months
├── Active defined as: Listed ≥1 product, checked dashboard weekly
├── Churn mitigation: Monthly check-in emails, success stories newsletter
└── Reactivation: Personalized outreach to dormant farms
```

---

## ⚠️ RISK ASSESSMENT

### Technical Risks

| Risk                                        | Impact | Probability | Mitigation                                               |
| ------------------------------------------- | ------ | ----------- | -------------------------------------------------------- |
| Stripe Connect onboarding complexity        | Medium | Medium      | Clear step-by-step guide, video tutorial, email support  |
| Photo upload failures (slow rural internet) | High   | High        | Aggressive compression, retry logic, offline queue       |
| Geocoding API rate limits                   | Low    | Low         | Cache geocoded addresses, fallback manual lat/long entry |

### UX Risks

| Risk                             | Impact | Probability | Mitigation                                               |
| -------------------------------- | ------ | ----------- | -------------------------------------------------------- |
| Farmer abandonment if >5 minutes | High   | Medium      | Auto-save drafts, allow partial completion, return later |
| Confusion about commission model | Medium | High        | Clear 15% explanation, calculator showing net earnings   |
| Mobile form fatigue              | Medium | Medium      | Progress indicators, motivational copy, example profiles |

### Business Risks

| Risk                              | Impact   | Probability | Mitigation                                                              |
| --------------------------------- | -------- | ----------- | ----------------------------------------------------------------------- |
| Low farmer adoption (too complex) | Critical | Medium      | In-person onboarding events, phone support, simplify further            |
| Stripe verification delays        | Medium   | High        | Set expectations (2-3 days), allow profile creation before verification |
| Duplicate/fake farms              | Low      | Low         | Email/phone verification, manual review for first 100 farms             |

---

## 🔗 DEPENDENCIES

### External Services

| Service                   | Purpose                  | API Endpoints                                                  | Criticality |
| ------------------------- | ------------------------ | -------------------------------------------------------------- | ----------- |
| **Stripe Connect**        | Payment processing setup | Create connected account, onboarding flow, verification status | Required    |
| **Google Maps Geocoding** | Location-based discovery | Address autocomplete, lat/long conversion                      | Required    |
| **AWS S3**                | Photo storage            | Upload, resize, CDN delivery via CloudFront                    | Required    |
| **Twilio**                | SMS verification         | Send verification code, verify code                            | Required    |
| **SendGrid**              | Email notifications      | Verification emails, welcome emails, transactional             | Required    |

### Internal Dependencies

| Dependency                 | Purpose                                 | Must Be Built First       |
| -------------------------- | --------------------------------------- | ------------------------- |
| User authentication system | Login, JWT tokens, sessions             | Yes (foundation)          |
| File upload service        | Photo upload, resize, S3 integration    | Yes (reusable)            |
| Notification service       | Email + SMS infrastructure              | Yes (reusable)            |
| RBAC system                | Role-based permissions (Owner, Manager) | Yes (security foundation) |

---

## 📅 IMPLEMENTATION TIMELINE

```
Week 1: Backend Foundation
├── Day 1-2: Database schema (Farms, Farm_Team_Members tables)
├── Day 3-4: Registration API endpoint + validation
└── Day 5: SMS/email verification integration (Twilio, SendGrid)

Week 2: Frontend Implementation
├── Day 1-2: Registration form UI (3 steps, mobile-first)
├── Day 3: Photo upload component (camera integration, preview)
├── Day 4: Profile editing UI (dashboard view)
└── Day 5: Team management UI (invite flow)

Week 3: Integration & Testing
├── Day 1: Stripe Connect onboarding flow integration
├── Day 2: End-to-end testing (happy path + error scenarios)
├── Day 3: Performance testing (100 concurrent registrations)
├── Day 4: Accessibility audit (WCAG 2.1 AA compliance check)
└── Day 5: Bug fixes + deployment to staging
```

---

## 🧪 TESTING STRATEGY

### Unit Tests (Jest + React Testing Library)

```typescript
describe('Farmer Registration', () => {
  test('validates email format correctly', () => {...});
  test('checks password strength (zxcvbn)', () => {...});
  test('suggests alternative farm names when duplicate', () => {...});
  test('geocodes address with Google Maps API', () => {...});
  test('generates unique farm slug from name', () => {...});
});
```

### Integration Tests (Playwright E2E)

```typescript
test("farmer completes registration in under 5 minutes", async ({ page }) => {
  await page.goto("/register/farmer");

  // Step 1: Account
  await page.fill('[name="email"]', "ana@sunvalley.farm");
  await page.fill('[name="password"]', "SecurePass123!");
  await page.fill('[name="farmName"]', "Sun Valley Organics");
  await page.fill('[name="phone"]', "+15035551234");
  await page.click('button:has-text("Send Code")');
  await page.fill('[name="smsCode"]', "123456"); // Mock code
  await page.click('button:has-text("Next")');

  // Step 2: Location
  await page.fill('[name="address"]', "1234 Farm Road, Portland, OR");
  await page.selectOption('[name="farmSize"]', "5-20");
  await page.check('[name="products"][value="vegetables"]');
  await page.click('button:has-text("Next")');

  // Step 3: Story
  await page.fill(
    '[name="description"]',
    "Family farm growing organic veggies since 1997"
  );
  await page.setInputFiles('[name="farmPhoto"]', "test-photo.jpg");
  await page.click('button:has-text("Complete Registration")');

  // Verify success
  await expect(page).toHaveURL("/dashboard/onboarding-success");
  await expect(page.locator("text=Check your email to verify")).toBeVisible();
});
```

### Performance Tests (k6 Load Testing)

```javascript
import http from "k6/http";
import { check } from "k6";

export let options = {
  vus: 100, // 100 virtual users
  duration: "5m",
};

export default function () {
  let response = http.post(
    "<https://api.farmersmarket.com/auth/register/farmer",>
    {
      email: `farmer${__VU}@test.com`,
      password: "SecurePass123!",
      farmName: `Test Farm ${__VU}`,
      // ... other fields
    }
  );

  check(response, {
    "status is 201": (r) => r.status === 201,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });
}
```

---

## 📚 RELATED DOCUMENTATION

- **[AGRICULTURAL_FRD_INDEX](../AGRICULTURAL_FRD_INDEX.instructions.md)** - Master feature index
- **[FR-002: Farm Profile & Storytelling](./FR-002_FARM_PROFILE.instructions.md)** - Public profile pages
- **[FR-003: Product Listing](./FR-003_PRODUCT_LISTING.instructions.md)** - List products for sale
- **[AGRICULTURAL_BRD](../AGRICULTURAL_BRD.instructions.md)** - Business objectives (50 farms Month 6)
- **[AGRICULTURAL_PERSONAS](../AGRICULTURAL_PERSONAS.instructions.md)** - Ana Romana user story
- **[MASTER_TEST_REPORT](../../docs/testing/MASTER_TEST_REPORT.md)** - Testing standards

---

**Version**: v1.0.0 - October 2025
**Status**: ✅ Specification Complete - Ready for Development
**Last Updated**: October 18, 2025
**Owner**: Backend Team + Mobile Team

_"Make onboarding so fast and simple that farmers register during coffee break."_

```

```
