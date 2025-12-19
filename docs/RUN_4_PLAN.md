# 🎯 Run 4: Saved Searches, Analytics & Personalization - Implementation Plan

**Status:** 📋 PLANNED  
**Version:** 1.0.0  
**Last Updated:** 2024  
**Estimated Duration:** 3-4 days  
**Complexity:** ⭐⭐⭐⭐ (Advanced)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture](#architecture)
4. [Features Breakdown](#features-breakdown)
5. [Implementation Phases](#implementation-phases)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [React Query Integration](#react-query-integration)
9. [Analytics Strategy](#analytics-strategy)
10. [Personalization Engine](#personalization-engine)
11. [Testing Strategy](#testing-strategy)
12. [Performance Targets](#performance-targets)
13. [Success Metrics](#success-metrics)

---

## 🎯 Overview

### Mission Statement
Build an intelligent, agricultural-conscious search personalization system that learns from user behavior, provides actionable analytics, and delivers seasonal recommendations while respecting user privacy and rural connectivity constraints.

### Core Objectives

1. **Saved Searches** - Persistent, shareable search configurations with notifications
2. **Search Analytics** - Track patterns, optimize results, provide farmer insights
3. **User Personalization** - Seasonal preferences, dietary restrictions, farm favorites
4. **Recommendation Engine** - AI-powered product and farm suggestions
5. **A/B Testing Framework** - Data-driven UX optimization
6. **Performance Monitoring** - Real-time search quality metrics

### What Makes This Divine

- 🌾 **Agricultural Consciousness:** Season-aware personalization
- 🧬 **Biodynamic Learning:** Adapts to lunar cycles and planting calendars
- ⚡ **Quantum Performance:** Sub-50ms recommendation generation
- 🔒 **Privacy-First:** GDPR compliant, user-controlled data
- 📡 **Rural Resilient:** Works offline, syncs when connected
- 🎯 **Farmer-Centric:** Actionable insights for farm optimization

---

## 📚 Prerequisites

### From Run 3 (React Query Integration) ✅
- [x] React Query provider configured
- [x] Query key factory established
- [x] Product search hooks (`useProductSearch`, `useInfiniteProductSearch`)
- [x] Autocomplete system (`useSearchSuggestions`)
- [x] Recent searches (localStorage-based)
- [x] Prefetching and cache invalidation helpers

### From Run 2 (Search & Discovery) ✅
- [x] Product search API (`/api/products/search`)
- [x] Advanced filtering system
- [x] Farm search capabilities
- [x] Geolocation-based sorting

### From Run 1 (Core Infrastructure) ✅
- [x] Authentication with NextAuth v5
- [x] Prisma database setup
- [x] User roles and permissions
- [x] TypeScript strict mode

### New Requirements
- [ ] Database migrations for saved searches, analytics, preferences
- [ ] Background job processing (cron/webhooks)
- [ ] Analytics aggregation pipeline
- [ ] Recommendation algorithm implementation
- [ ] A/B testing infrastructure

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  React Components                                               │
│  ├─ SavedSearchManager   ├─ PersonalizationDashboard           │
│  ├─ SearchAnalytics      ├─ RecommendationCard                 │
│  └─ PreferenceEditor     └─ ABTestVariant                      │
│                                                                 │
│  React Query Hooks                                              │
│  ├─ useSavedSearches     ├─ useUserPreferences                 │
│  ├─ useSearchAnalytics   ├─ useRecommendations                 │
│  └─ useABTestVariant     └─ useSearchNotifications             │
├─────────────────────────────────────────────────────────────────┤
│                        API LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  Next.js API Routes                                             │
│  ├─ /api/saved-searches          ├─ /api/analytics/search      │
│  ├─ /api/user/preferences        ├─ /api/recommendations       │
│  ├─ /api/notifications/searches  ├─ /api/ab-tests              │
│  └─ /api/analytics/events        └─ /api/search/insights       │
├─────────────────────────────────────────────────────────────────┤
│                      SERVICE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Business Logic                                                 │
│  ├─ SavedSearchService           ├─ PersonalizationService     │
│  ├─ AnalyticsService             ├─ RecommendationEngine       │
│  ├─ NotificationService          ├─ ABTestService              │
│  └─ SearchInsightsService        └─ PreferenceService          │
├─────────────────────────────────────────────────────────────────┤
│                     BACKGROUND JOBS                             │
├─────────────────────────────────────────────────────────────────┤
│  Cron Jobs & Workers                                            │
│  ├─ Analytics Aggregation (hourly)                             │
│  ├─ Saved Search Alerts (real-time + daily digest)             │
│  ├─ Recommendation Training (daily)                            │
│  ├─ Seasonal Preference Updates (weekly)                       │
│  └─ A/B Test Results Calculation (continuous)                  │
├─────────────────────────────────────────────────────────────────┤
│                      DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  Prisma Models                                                  │
│  ├─ SavedSearch          ├─ UserPreference                     │
│  ├─ SearchAnalytics      ├─ SearchEvent                        │
│  ├─ UserInteraction      ├─ ABTest                             │
│  ├─ Recommendation       ├─ NotificationQueue                  │
│  └─ SearchAlert          └─ PersonalizationScore               │
│                                                                 │
│  PostgreSQL Database                                            │
│  ├─ JSONB for flexible metadata                                │
│  ├─ Indexes for performance                                    │
│  ├─ Materialized views for analytics                           │
│  └─ Partitioning for large tables                              │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Searches
    ↓
1. Search Event Captured (async)
    ↓
2. Analytics Service Records Event
    ↓
3. Personalization Engine Updates Profile
    ↓
4. Background Job Aggregates Data
    ↓
5. Recommendations Recalculated
    ↓
6. User Sees Personalized Results
```

---

## 🚀 Features Breakdown

### Phase 1: Saved Searches (Foundation)

#### 1.1 Core Saved Search Features
- **Create Saved Search**
  - Save current search filters and query
  - Custom name and description
  - Privacy settings (private/shared)
  - Notification preferences
  
- **Manage Saved Searches**
  - List all saved searches
  - Edit search parameters
  - Delete searches
  - Duplicate searches
  - Share via URL
  
- **Search Notifications**
  - New products matching criteria
  - Price changes
  - Stock availability
  - Seasonal availability
  - Digest options (real-time, daily, weekly)

#### 1.2 Advanced Saved Search Features
- **Smart Folders**
  - Organize searches by category
  - Auto-organize by season
  - Farm-specific collections
  
- **Search Templates**
  - Pre-built common searches
  - Seasonal search presets
  - Dietary restriction templates
  
- **Collaborative Searches**
  - Share with family/friends
  - Team searches for restaurants
  - Community search boards

### Phase 2: Search Analytics

#### 2.1 User Analytics
- **Search Behavior Tracking**
  - Query patterns
  - Filter usage
  - Click-through rates
  - Conversion tracking
  - Time-to-purchase
  
- **Personal Insights Dashboard**
  - Most searched items
  - Favorite farms
  - Seasonal preferences
  - Budget analysis
  - Shopping patterns

#### 2.2 Farmer Analytics
- **Product Performance**
  - Search impressions
  - Click rates
  - Conversion rates
  - Competitor analysis
  - Pricing insights
  
- **Search Optimization Tips**
  - Keyword recommendations
  - Photo quality impact
  - Description effectiveness
  - Seasonal demand forecasts

#### 2.3 Platform Analytics
- **Aggregate Metrics**
  - Popular search terms
  - Trending products
  - Geographic demand
  - Seasonal trends
  - Market gaps
  
- **Performance Monitoring**
  - Search latency
  - Result relevance scores
  - User satisfaction metrics
  - A/B test results

### Phase 3: User Personalization

#### 3.1 Preference Management
- **Dietary Preferences**
  - Organic-only filter
  - Local-first sorting
  - Allergen exclusions
  - Certifications required
  
- **Shopping Preferences**
  - Favorite farms
  - Preferred pickup locations
  - Budget ranges
  - Product categories
  
- **Seasonal Preferences**
  - Spring favorites
  - Summer essentials
  - Fall harvest picks
  - Winter staples

#### 3.2 Smart Defaults
- **Auto-Applied Filters**
  - Dietary restrictions
  - Location preferences
  - Price ranges
  - Availability windows
  
- **Personalized Sorting**
  - Favorite farms first
  - Previously purchased
  - Recommended products
  - Seasonal relevance

#### 3.3 Privacy Controls
- **Data Management**
  - Export preferences
  - Delete search history
  - Pause personalization
  - Opt-out options
  
- **Transparency**
  - Explain recommendations
  - Show data usage
  - Control sharing
  - Download analytics

### Phase 4: Recommendation Engine

#### 4.1 Product Recommendations
- **Similar Products**
  - Category-based
  - Farm-based
  - Price-based
  - Seasonal alternatives
  
- **Complementary Products**
  - Recipe bundles
  - Meal planning
  - Complete-the-basket
  - Cross-farm suggestions

#### 4.2 Farm Recommendations
- **Discover New Farms**
  - Similar to favorites
  - Nearby options
  - Specialty matches
  - Seasonal producers
  
- **Farm Stories**
  - Biodynamic practices
  - Sustainability focus
  - Family history
  - Special certifications

#### 4.3 Seasonal Recommendations
- **What's in Season**
  - Current harvest
  - Coming soon
  - Last chance
  - Preservation tips
  
- **Biodynamic Calendar**
  - Planting day specials
  - Harvest moon picks
  - Lunar cycle recommendations

### Phase 5: A/B Testing Framework

#### 5.1 Test Infrastructure
- **Variant Management**
  - Create test variants
  - Traffic splitting
  - User consistency
  - Multi-armed bandit
  
- **Metrics Collection**
  - Conversion tracking
  - Engagement metrics
  - Revenue impact
  - Statistical significance

#### 5.2 Test Cases
- **Search UI Variants**
  - Filter placement
  - Sort options
  - Result layouts
  - Mobile vs desktop
  
- **Recommendation Algorithms**
  - Collaborative filtering
  - Content-based
  - Hybrid approaches
  - Seasonal weighting

---

## 💾 Database Schema

### New Prisma Models

```prisma
// ============================================
// SAVED SEARCHES
// ============================================

model SavedSearch {
  id                  String              @id @default(cuid())
  userId              String
  name                String              @db.VarChar(255)
  description         String?
  
  // Search Parameters (JSONB)
  query               String?             @db.VarChar(500)
  filters             Json                // { category, priceRange, certifications, etc. }
  sortBy              String?             @db.VarChar(50)
  location            Json?               // { lat, lng, radius }
  
  // Metadata
  isPublic            Boolean             @default(false)
  shareToken          String?             @unique @db.VarChar(100)
  folderId            String?
  tags                String[]
  
  // Notifications
  notificationsEnabled Boolean            @default(true)
  notificationFrequency NotificationFrequency @default(DAILY)
  lastNotificationSent DateTime?
  
  // Stats
  executionCount      Int                 @default(0)
  lastExecutedAt      DateTime?
  resultsCount        Int?
  
  // Agricultural Consciousness
  seasonalPreference  Season?
  preferredFarms      String[]           // Farm IDs
  biodynamicOnly      Boolean            @default(false)
  
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  
  // Relations
  user                User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  folder              SavedSearchFolder?  @relation(fields: [folderId], references: [id])
  alerts              SearchAlert[]
  sharedWith          SavedSearchShare[]
  
  @@index([userId])
  @@index([shareToken])
  @@index([createdAt])
  @@index([lastExecutedAt])
  @@map("saved_searches")
}

model SavedSearchFolder {
  id              String          @id @default(cuid())
  userId          String
  name            String          @db.VarChar(100)
  description     String?
  icon            String?         @db.VarChar(50)
  sortOrder       Int             @default(0)
  color           String?         @db.VarChar(20)
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  searches        SavedSearch[]
  
  @@index([userId])
  @@map("saved_search_folders")
}

model SavedSearchShare {
  id              String          @id @default(cuid())
  savedSearchId   String
  sharedWithEmail String          @db.VarChar(255)
  sharedWithId    String?
  permission      SharePermission @default(VIEW)
  expiresAt       DateTime?
  
  createdAt       DateTime        @default(now())
  
  savedSearch     SavedSearch     @relation(fields: [savedSearchId], references: [id], onDelete: Cascade)
  
  @@unique([savedSearchId, sharedWithEmail])
  @@index([savedSearchId])
  @@map("saved_search_shares")
}

model SearchAlert {
  id              String          @id @default(cuid())
  savedSearchId   String
  userId          String
  
  // Alert Type
  type            SearchAlertType @default(NEW_PRODUCTS)
  
  // Conditions (JSONB)
  conditions      Json            // { minProducts: 5, priceChange: true, etc. }
  
  // Status
  isActive        Boolean         @default(true)
  lastTriggered   DateTime?
  triggerCount    Int             @default(0)
  
  // Delivery
  channels        Json            // { email: true, push: true, sms: false }
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  savedSearch     SavedSearch     @relation(fields: [savedSearchId], references: [id], onDelete: Cascade)
  
  @@index([savedSearchId])
  @@index([userId])
  @@index([isActive])
  @@map("search_alerts")
}

// ============================================
// ANALYTICS & TRACKING
// ============================================

model SearchEvent {
  id              String          @id @default(cuid())
  userId          String?
  sessionId       String          @db.VarChar(100)
  
  // Search Details
  query           String?         @db.VarChar(500)
  filters         Json
  sortBy          String?         @db.VarChar(50)
  
  // Results
  resultsCount    Int
  resultsShown    Int
  clickedResults  String[]        // Product IDs
  
  // Context
  source          String?         @db.VarChar(50)  // web, mobile, api
  location        Json?
  userAgent       String?         @db.VarChar(500)
  
  // Timing
  responseTime    Int             // milliseconds
  timestamp       DateTime        @default(now())
  
  // Agricultural Context
  currentSeason   Season?
  lunarPhase      String?         @db.VarChar(50)
  
  // A/B Testing
  abTestVariant   String?         @db.VarChar(50)
  
  @@index([userId])
  @@index([sessionId])
  @@index([timestamp])
  @@index([query])
  @@map("search_events")
}

model UserInteraction {
  id              String            @id @default(cuid())
  userId          String?
  sessionId       String            @db.VarChar(100)
  
  // Interaction Type
  type            InteractionType
  entityType      String            @db.VarChar(50)  // product, farm, category
  entityId        String
  
  // Context
  source          String?           @db.VarChar(50)
  metadata        Json?
  
  // Value
  value           Decimal?          @db.Decimal(10, 2)  // revenue, rating, etc.
  
  timestamp       DateTime          @default(now())
  
  @@index([userId])
  @@index([sessionId])
  @@index([entityType, entityId])
  @@index([type])
  @@index([timestamp])
  @@map("user_interactions")
}

model SearchAnalytics {
  id              String          @id @default(cuid())
  
  // Time Window
  periodType      PeriodType
  periodStart     DateTime
  periodEnd       DateTime
  
  // Aggregated Metrics
  totalSearches   Int             @default(0)
  uniqueUsers     Int             @default(0)
  uniqueQueries   Int             @default(0)
  
  // Performance
  avgResponseTime Int             // milliseconds
  p95ResponseTime Int
  
  // Engagement
  avgResultsCount Decimal         @db.Decimal(10, 2)
  avgClickThrough Decimal         @db.Decimal(5, 4)  // 0.0000 to 1.0000
  conversionRate  Decimal         @db.Decimal(5, 4)
  
  // Top Queries (JSONB)
  topQueries      Json            // [{ query, count, ctr }]
  topFilters      Json
  topCategories   Json
  
  // Agricultural Insights
  seasonalTrends  Json
  farmPopularity  Json
  
  createdAt       DateTime        @default(now())
  
  @@unique([periodType, periodStart])
  @@index([periodType, periodStart])
  @@map("search_analytics")
}

// ============================================
// USER PREFERENCES & PERSONALIZATION
// ============================================

model UserPreference {
  id              String          @id @default(cuid())
  userId          String          @unique
  
  // Dietary Preferences
  dietaryRestrictions String[]
  allergens       String[]
  certifications  String[]        // ORGANIC, NON_GMO, etc.
  
  // Shopping Preferences
  favoriteFarms   String[]        // Farm IDs
  favoriteCategories String[]
  budgetRange     Json?           // { min, max, currency }
  
  // Location Preferences
  preferredLocations Json[]       // [{ type, address, radius }]
  maxDistance     Int?            // miles
  
  // Delivery Preferences
  preferredPickupDays String[]
  preferredDeliveryTime String?
  
  // Seasonal Preferences (JSONB by Season)
  springPreferences  Json?
  summerPreferences  Json?
  fallPreferences    Json?
  winterPreferences  Json?
  
  // Biodynamic Preferences
  lunarPhaseAware Boolean         @default(false)
  biodynamicOnly  Boolean         @default(false)
  
  // Privacy Settings
  allowPersonalization Boolean     @default(true)
  shareDataForAnalytics Boolean    @default(true)
  
  // Auto-Apply Settings
  autoApplyFilters Boolean        @default(true)
  autoApplySort   Boolean         @default(true)
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@map("user_preferences")
}

model PersonalizationScore {
  id              String          @id @default(cuid())
  userId          String
  entityType      String          @db.VarChar(50)  // product, farm, category
  entityId        String
  
  // Scores (0-100)
  relevanceScore  Int
  affinityScore   Int             // based on past interactions
  seasonalScore   Int
  proximityScore  Int
  popularityScore Int
  
  // Combined Score
  totalScore      Int
  
  // Context
  season          Season
  calculatedAt    DateTime        @default(now())
  expiresAt       DateTime
  
  @@unique([userId, entityType, entityId, season])
  @@index([userId])
  @@index([entityType, entityId])
  @@index([totalScore])
  @@index([expiresAt])
  @@map("personalization_scores")
}

model Recommendation {
  id              String            @id @default(cuid())
  userId          String
  
  // Recommendation Type
  type            RecommendationType
  
  // Recommended Entity
  entityType      String            @db.VarChar(50)
  entityId        String
  
  // Scoring
  score           Decimal           @db.Decimal(5, 2)
  confidence      Decimal           @db.Decimal(5, 4)
  
  // Reason (JSONB)
  reasons         Json              // [{ type, weight, explanation }]
  
  // Context
  season          Season?
  source          String?           @db.VarChar(50)  // algorithm name
  
  // Interaction Tracking
  shown           Boolean           @default(false)
  shownAt         DateTime?
  clicked         Boolean           @default(false)
  clickedAt       DateTime?
  converted       Boolean           @default(false)
  convertedAt     DateTime?
  
  createdAt       DateTime          @default(now())
  expiresAt       DateTime
  
  @@index([userId])
  @@index([type])
  @@index([entityType, entityId])
  @@index([shown, clicked, converted])
  @@index([expiresAt])
  @@map("recommendations")
}

// ============================================
// A/B TESTING
// ============================================

model ABTest {
  id              String          @id @default(cuid())
  name            String          @db.VarChar(255)
  description     String?
  
  // Test Configuration
  variants        Json            // [{ id, name, weight, config }]
  trafficSplit    Json            // { variantA: 50, variantB: 50 }
  
  // Targeting
  targetAudience  Json?           // { roles, seasons, locations }
  
  // Status
  status          ABTestStatus    @default(DRAFT)
  startedAt       DateTime?
  endedAt         DateTime?
  
  // Results (updated periodically)
  results         Json?           // per-variant metrics
  winnerVariant   String?
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  assignments     ABTestAssignment[]
  
  @@index([status])
  @@index([startedAt, endedAt])
  @@map("ab_tests")
}

model ABTestAssignment {
  id              String          @id @default(cuid())
  testId          String
  userId          String?
  sessionId       String          @db.VarChar(100)
  
  variant         String          @db.VarChar(50)
  assignedAt      DateTime        @default(now())
  
  test            ABTest          @relation(fields: [testId], references: [id], onDelete: Cascade)
  
  @@unique([testId, userId])
  @@unique([testId, sessionId])
  @@index([testId])
  @@index([userId])
  @@map("ab_test_assignments")
}

// ============================================
// ENUMS
// ============================================

enum NotificationFrequency {
  REALTIME
  HOURLY
  DAILY
  WEEKLY
  MONTHLY
}

enum SearchAlertType {
  NEW_PRODUCTS
  PRICE_CHANGE
  BACK_IN_STOCK
  SEASONAL_AVAILABLE
  FARM_UPDATE
  CUSTOM
}

enum SharePermission {
  VIEW
  EDIT
  ADMIN
}

enum InteractionType {
  SEARCH
  VIEW
  CLICK
  ADD_TO_CART
  PURCHASE
  FAVORITE
  REVIEW
  SHARE
}

enum PeriodType {
  HOUR
  DAY
  WEEK
  MONTH
  QUARTER
  YEAR
}

enum RecommendationType {
  SIMILAR_PRODUCT
  COMPLEMENTARY
  TRENDING
  SEASONAL
  FARM_DISCOVERY
  PERSONALIZED
  COLLABORATIVE
}

enum ABTestStatus {
  DRAFT
  ACTIVE
  PAUSED
  COMPLETED
  ARCHIVED
}

enum Season {
  SPRING
  SUMMER
  FALL
  WINTER
}
```

### Schema Migration Strategy

1. **Create migration:**
   ```bash
   npx prisma migrate dev --name add_saved_searches_analytics_personalization
   ```

2. **Verify schema:**
   ```bash
   npx prisma validate
   npx prisma format
   ```

3. **Generate client:**
   ```bash
   npx prisma generate
   ```

4. **Seed initial data:**
   - Sample saved searches
   - Default preference templates
   - Initial A/B tests

---

## 🔌 API Endpoints

### Saved Searches

```typescript
// GET /api/saved-searches
// List user's saved searches
Response: {
  searches: SavedSearch[]
  folders: SavedSearchFolder[]
  total: number
}

// POST /api/saved-searches
// Create new saved search
Request: {
  name: string
  description?: string
  query?: string
  filters: FilterObject
  sortBy?: string
  location?: LocationObject
  notificationsEnabled?: boolean
  folderId?: string
  tags?: string[]
}

// GET /api/saved-searches/:id
// Get saved search details + execute

// PUT /api/saved-searches/:id
// Update saved search

// DELETE /api/saved-searches/:id
// Delete saved search

// POST /api/saved-searches/:id/execute
// Execute saved search and get results

// POST /api/saved-searches/:id/share
// Generate share link

// GET /api/saved-searches/shared/:token
// Access shared search
```

### User Preferences

```typescript
// GET /api/user/preferences
// Get user preferences

// PUT /api/user/preferences
// Update preferences
Request: {
  dietaryRestrictions?: string[]
  allergens?: string[]
  certifications?: string[]
  favoriteFarms?: string[]
  budgetRange?: { min: number, max: number }
  autoApplyFilters?: boolean
  // ... other preferences
}

// POST /api/user/preferences/import
// Import preferences from file

// GET /api/user/preferences/export
// Export preferences as JSON
```

### Recommendations

```typescript
// GET /api/recommendations
// Get personalized recommendations
Query: {
  type?: RecommendationType
  limit?: number
  season?: Season
}

// GET /api/recommendations/products/:productId/similar
// Similar products

// GET /api/recommendations/products/:productId/complementary
// Complementary products

// GET /api/recommendations/farms
// Farm recommendations

// POST /api/recommendations/:id/feedback
// Track recommendation interaction
Request: {
  action: 'shown' | 'clicked' | 'converted' | 'dismissed'
}
```

### Analytics

```typescript
// POST /api/analytics/events
// Track search/interaction event
Request: {
  type: 'search' | 'click' | 'view' | 'purchase'
  entityType?: string
  entityId?: string
  metadata?: object
}

// GET /api/analytics/search
// Get search analytics (user-level)
Query: {
  period?: 'week' | 'month' | 'year'
}

// GET /api/analytics/insights
// Personal insights dashboard

// GET /api/analytics/farmer/:farmId
// Farmer-specific analytics (protected)
```

### Search Alerts

```typescript
// GET /api/notifications/searches
// Get search alert notifications

// POST /api/notifications/searches/:savedSearchId/subscribe
// Subscribe to alerts

// DELETE /api/notifications/searches/:savedSearchId/unsubscribe
// Unsubscribe from alerts

// PUT /api/notifications/searches/:alertId
// Update alert settings
```

### A/B Testing (Admin)

```typescript
// POST /api/ab-tests
// Create new A/B test

// GET /api/ab-tests/:id/variant
// Get user's variant assignment

// POST /api/ab-tests/:id/track
// Track variant interaction
```

---

## 🎣 React Query Integration

### Query Keys Extension

```typescript
// src/lib/react-query/query-keys.ts

export const queryKeys = {
  // ... existing keys ...
  
  // Saved Searches
  savedSearches: {
    all: ['saved-searches'] as const,
    lists: () => [...queryKeys.savedSearches.all, 'list'] as const,
    list: (filters: SavedSearchFilters) => 
      [...queryKeys.savedSearches.lists(), { filters }] as const,
    details: () => [...queryKeys.savedSearches.all, 'detail'] as const,
    detail: (id: string) => 
      [...queryKeys.savedSearches.details(), id] as const,
    execute: (id: string, params: SearchParams) =>
      [...queryKeys.savedSearches.detail(id), 'execute', { params }] as const,
    shared: (token: string) =>
      [...queryKeys.savedSearches.all, 'shared', token] as const,
  },
  
  // User Preferences
  preferences: {
    all: ['preferences'] as const,
    user: (userId: string) => 
      [...queryKeys.preferences.all, userId] as const,
    seasonal: (userId: string, season: Season) =>
      [...queryKeys.preferences.user(userId), 'seasonal', season] as const,
  },
  
  // Recommendations
  recommendations: {
    all: ['recommendations'] as const,
    lists: () => [...queryKeys.recommendations.all, 'list'] as const,
    list: (filters: RecommendationFilters) =>
      [...queryKeys.recommendations.lists(), { filters }] as const,
    similar: (productId: string) =>
      [...queryKeys.recommendations.all, 'similar', productId] as const,
    complementary: (productId: string) =>
      [...queryKeys.recommendations.all, 'complementary', productId] as const,
    farms: () => [...queryKeys.recommendations.all, 'farms'] as const,
  },
  
  // Analytics
  analytics: {
    all: ['analytics'] as const,
    search: (period: PeriodType) =>
      [...queryKeys.analytics.all, 'search', period] as const,
    insights: () => [...queryKeys.analytics.all, 'insights'] as const,
    farmer: (farmId: string, period: PeriodType) =>
      [...queryKeys.analytics.all, 'farmer', farmId, period] as const,
  },
  
  // A/B Tests
  abTests: {
    all: ['ab-tests'] as const,
    variant: (testId: string) =>
      [...queryKeys.abTests.all, 'variant', testId] as const,
  },
};
```

### Custom Hooks

```typescript
// src/hooks/saved-searches/useSavedSearches.ts
export function useSavedSearches(filters?: SavedSearchFilters) {
  return useQuery({
    queryKey: queryKeys.savedSearches.list(filters || {}),
    queryFn: () => savedSearchService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// src/hooks/saved-searches/useSavedSearchMutations.ts
export function useCreateSavedSearch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: savedSearchService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.savedSearches.all,
      });
    },
  });
}

// src/hooks/recommendations/useRecommendations.ts
export function useRecommendations(
  type?: RecommendationType,
  options?: UseQueryOptions
) {
  const season = useCurrentSeason();
  
  return useQuery({
    queryKey: queryKeys.recommendations.list({ type, season }),
    queryFn: () => recommendationService.get({ type, season }),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
}

// src/hooks/analytics/useSearchAnalytics.ts
export function useSearchAnalytics(period: PeriodType = 'MONTH') {
  return useQuery({
    queryKey: queryKeys.analytics.search(period),
    queryFn: () => analyticsService.getSearchAnalytics(period),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

// src/hooks/preferences/useUserPreferences.ts
export function useUserPreferences() {
  return useQuery({
    queryKey: queryKeys.preferences.user('current'),
    queryFn: preferencesService.get,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// src/hooks/ab-tests/useABTestVariant.ts
export function useABTestVariant(testId: string) {
  return useQuery({
    queryKey: queryKeys.abTests.variant(testId),
    queryFn: () => abTestService.getVariant(testId),
    staleTime: Infinity, // Never refetch - variant is sticky per user
  });
}
```

---

## 📊 Analytics Strategy

### Event Tracking Architecture

```typescript
// src/lib/analytics/tracker.ts

export class AnalyticsTracker {
  private queue: Event[] = [];
  private flushInterval = 5000; // 5 seconds
  
  track(event: AnalyticsEvent): void {
    // Add to queue
    this.queue.push({
      ...event,
      timestamp: new Date(),
      sessionId: this.getSessionId(),
    });
    
    // Flush if queue is large
    if (this.queue.length >= 10) {
      this.flush();
    }
  }
  
  async flush(): Promise<void> {
    if (this.queue.length === 0) return;
    
    const batch = [...this.queue];
    this.queue = [];
    
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        body: JSON.stringify({ events: batch }),
      });
    } catch (error) {
      // Re-queue on failure
      this.queue.unshift(...batch);
    }
  }
}
```

### Aggregation Pipeline

```typescript
// src/lib/analytics/aggregator.ts

export class AnalyticsAggregator {
  async aggregateHourly(): Promise<void> {
    // Run every hour via cron
    const now = new Date();
    const hourStart = new Date(now.setMinutes(0, 0, 0));
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
    
    await this.aggregateSearchEvents(hourStart, hourEnd, 'HOUR');
  }
  
  private async aggregateSearchEvents(
    start: Date,
    end: Date,
    periodType: PeriodType
  ): Promise<void> {
    // Aggregate search events into SearchAnalytics
    const metrics = await database.$queryRaw`
      SELECT 
        COUNT(DISTINCT id) as total_searches,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT query) as unique_queries,
        AVG(response_time) as avg_response_time,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time) as p95_response_time,
        AVG(results_count) as avg_results_count,
        AVG(CARDINALITY(clicked_results)::decimal / NULLIF(results_shown, 0)) as avg_click_through
      FROM search_events
      WHERE timestamp >= ${start} AND timestamp < ${end}
    `;
    
    // Store aggregated metrics
    await database.searchAnalytics.create({
      data: {
        periodType,
        periodStart: start,
        periodEnd: end,
        ...metrics,
      },
    });
  }
}
```

---

## 🧠 Personalization Engine

### Recommendation Algorithm

```typescript
// src/lib/personalization/recommendation-engine.ts

export class RecommendationEngine {
  async generateRecommendations(
    userId: string,
    type: RecommendationType,
    limit: number = 10
  ): Promise<Recommendation[]> {
    const [
      userPrefs,
      interactions,
      seasonalContext,
    ] = await Promise.all([
      this.getUserPreferences(userId),
      this.getUserInteractions(userId),
      this.getSeasonalContext(),
    ]);
    
    // Calculate scores for all candidates
    const candidates = await this.getCandidates(type, userPrefs);
    
    const scored = candidates.map(candidate => ({
      ...candidate,
      score: this.calculateScore(
        candidate,
        userPrefs,
        interactions,
        seasonalContext
      ),
    }));
    
    // Sort by score and return top N
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(c => this.toRecommendation(c, userId, type));
  }
  
  private calculateScore(
    candidate: Candidate,
    prefs: UserPreference,
    interactions: UserInteraction[],
    context: SeasonalContext
  ): number {
    const scores = {
      relevance: this.calculateRelevanceScore(candidate, prefs),
      affinity: this.calculateAffinityScore(candidate, interactions),
      seasonal: this.calculateSeasonalScore(candidate, context),
      proximity: this.calculateProximityScore(candidate, prefs),
      popularity: this.calculatePopularityScore(candidate),
    };
    
    // Weighted combination
    return (
      scores.relevance * 0.30 +
      scores.affinity * 0.25 +
      scores.seasonal * 0.20 +
      scores.proximity * 0.15 +
      scores.popularity * 0.10
    );
  }
  
  private calculateSeasonalScore(
    candidate: Candidate,
    context: SeasonalContext
  ): number {
    // Biodynamic consciousness!
    const seasonMatch = candidate.seasons?.includes(context.season) ? 100 : 50;
    const lunarBonus = this.getLunarPhaseBonus(context.lunarPhase);
    const harvestWindow = this.isInHarvestWindow(candidate, context.date);
    
    return (seasonMatch + lunarBonus + (harvestWindow ? 20 : 0)) / 1.2;
  }
}
```

### Collaborative Filtering

```typescript
// src/lib/personalization/collaborative-filter.ts

export class CollaborativeFilter {
  async findSimilarUsers(userId: string, limit: number = 50): Promise<string[]> {
    // Find users with similar preferences and interactions
    const userVector = await this.getUserVector(userId);
    
    const similarities = await database.$queryRaw`
      SELECT 
        user_id,
        cosine_similarity(
          ${userVector}::vector,
          user_vector::vector
        ) as similarity
      FROM user_vectors
      WHERE user_id != ${userId}
      ORDER BY similarity DESC
      LIMIT ${limit}
    `;
    
    return similarities.map(s => s.user_id);
  }
  
  async recommendFromSimilarUsers(
    userId: string,
    type: 'product' | 'farm'
  ): Promise<Recommendation[]> {
    const similarUsers = await this.findSimilarUsers(userId);
    
    // Get items that similar users liked but current user hasn't interacted with
    const recommendations = await database.$queryRaw`
      SELECT 
        entity_id,
        entity_type,
        COUNT(*) as score,
        AVG(value) as avg_value
      FROM user_interactions
      WHERE 
        user_id = ANY(${similarUsers}::text[])
        AND entity_type = ${type}
        AND type IN ('PURCHASE', 'FAVORITE', 'REVIEW')
        AND entity_id NOT IN (
          SELECT entity_id 
          FROM user_interactions 
          WHERE user_id = ${userId}
        )
      GROUP BY entity_id, entity_type
      ORDER BY score DESC, avg_value DESC
      LIMIT 20
    `;
    
    return recommendations.map(r => this.toRecommendation(r, userId));
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// src/__tests__/lib/saved-search.service.test.ts
describe('SavedSearchService', () => {
  describe('create', () => {
    it('should create saved search with valid data', async () => {
      const searchData = createMockSavedSearch();
      const result = await savedSearchService.create(userId, searchData);
      
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(searchData.name);
      expect(result.userId).toBe(userId);
    });
    
    it('should apply seasonal preferences automatically', async () => {
      const searchData = createMockSavedSearch({ category: 'Vegetables' });
      const result = await savedSearchService.create(userId, searchData);
      
      expect(result.seasonalPreference).toBe(getCurrentSeason());
    });
  });
});

// src/__tests__/lib/recommendation-engine.test.ts
describe('RecommendationEngine', () => {
  describe('generateRecommendations', () => {
    it('should return personalized product recommendations', async () => {
      const recs = await engine.generateRecommendations(
        userId,
        'PERSONALIZED',
        10
      );
      
      expect(recs).toHaveLength(10);
      expect(recs[0].score).toBeGreaterThan(recs[9].score);
    });
    
    it('should boost seasonal products in recommendations', async () => {
      mockCurrentSeason('FALL');
      const recs = await engine.generateRecommendations(userId, 'SEASONAL', 5);
      
      recs.forEach(rec => {
        expect(rec.reasons).toContainEqual(
          expect.objectContaining({ type: 'SEASONAL' })
        );
      });
    });
  });
});
```

### Integration Tests

```typescript
// src/__tests__/api/saved-searches.integration.test.ts
describe('POST /api/saved-searches', () => {
  it('should create saved search and return 201', async () => {
    const response = await request(app)
      .post('/api/saved-searches')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Organic Vegetables',
        filters: { category: 'Vegetables', organic: true },
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
  });
});

// src/__tests__/api/recommendations.integration.test.ts
describe('GET /api/recommendations', () => {
  it('should return personalized recommendations', async () => {
    const response = await request(app)
      .get('/api/recommendations')
      .query({ type: 'PERSONALIZED', limit: 5 })
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(5);
    expect(response.body.data[0]).toHaveProperty('score');
    expect(response.body.data[0]).toHaveProperty('reasons');
  });
});
```

### E2E Tests

```typescript
// e2e/saved-searches.spec.ts
test.describe('Saved Searches', () => {
  test('should create and execute saved search', async ({ page }) => {
    await page.goto('/search?q=tomatoes&organic=true');
    
    // Save current search
    await page.click('[data-testid="save-search-button"]');
    await page.fill('[data-testid="search-name-input"]', 'My Tomato Search');
    await page.click('[data-testid="confirm-save"]');
    
    // Navigate to saved searches
    await page.goto('/account/saved-searches');
    
    // Execute saved search
    await page.click('[data-testid="execute-search-0"]');
    
    // Verify results match original search
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(
      await page.locator('[data-testid="product-card"]').count()
    );
  });
});
```

---

## 🎯 Performance Targets

### API Response Times
- **GET /api/saved-searches**: < 50ms (cached) / < 200ms (fresh)
- **POST /api/saved-searches**: < 150ms
- **GET /api/recommendations**: < 100ms (cached) / < 500ms (fresh)
- **POST /api/analytics/events**: < 50ms (async processing)

### Database Query Performance
- **Saved search list**: < 20ms (indexed)
- **Recommendation generation**: < 300ms (with caching)
- **Analytics aggregation**: < 2s (background job)

### Client-Side Performance
- **Saved search page load**: < 1s (LCP)
- **Recommendation rendering**: < 100ms
- **Analytics dashboard**: < 2s (initial load)

### Caching Strategy
- **Saved searches**: 5 minutes (stale time)
- **Recommendations**: 15 minutes
- **User preferences**: 30 minutes
- **Analytics**: 1 hour

### Hardware Optimization (HP OMEN)
- **Parallel query execution**: Leverage 12 threads
- **In-memory caching**: Use 64GB RAM for hot data
- **Batch processing**: 100 events per batch

---

## 📈 Success Metrics

### User Engagement
- **Saved search adoption**: Target 40% of active users
- **Search alert subscription**: Target 60% of saved searches
- **Recommendation click-through**: Target 15%
- **Recommendation conversion**: Target 8%

### Performance Metrics
- **Search response time**: < 200ms (p95)
- **Recommendation generation**: < 500ms
- **Analytics latency**: < 1 hour (for hourly aggregation)

### Business Metrics
- **Increased user retention**: +20%
- **Increased average order value**: +15% (via recommendations)
- **Increased farm discoverability**: +30%
- **Reduced time-to-purchase**: -25%

### Agricultural Metrics
- **Seasonal product discovery**: +40%
- **Local farm engagement**: +35%
- **Reduced food waste**: Track via sell-through rate improvement

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Day 1)
**Goal:** Database schema, basic CRUD operations

- [ ] Create Prisma schema migrations
- [ ] Implement SavedSearchService
- [ ] Create basic API routes (CRUD)
- [ ] Add React Query keys and hooks
- [ ] Basic UI components (list, form)
- [ ] Unit tests for services

**Deliverables:**
- ✅ Users can create, read, update, delete saved searches
- ✅ Basic folder organization
- ✅ Tests passing

### Phase 2: Notifications & Sharing (Day 2)
**Goal:** Search alerts and collaboration

- [ ] Implement SearchAlertService
- [ ] Create notification system integration
- [ ] Build alert management UI
- [ ] Implement share functionality
- [ ] Add notification preferences
- [ ] Background job for alert processing

**Deliverables:**
- ✅ Users receive alerts for saved searches
- ✅ Searches can be shared via link
- ✅ Alert preferences configurable

### Phase 3: Analytics & Tracking (Day 3)
**Goal:** Event tracking and insights

- [ ] Implement AnalyticsService
- [ ] Create event tracking system
- [ ] Build analytics aggregation pipeline
- [ ] Implement user insights dashboard
- [ ] Add farmer analytics (protected)
- [ ] Background jobs for aggregation

**Deliverables:**
- ✅ Search events tracked
- ✅ Personal insights dashboard
- ✅ Farmer performance metrics

### Phase 4: Personalization (Day 4)
**Goal:** User preferences and recommendations

- [ ] Implement UserPreferenceService
- [ ] Build preference management UI
- [ ] Create recommendation engine
- [ ] Implement scoring algorithms
- [ ] Add personalized search results
- [ ] Seasonal preference handling

**Deliverables:**
- ✅ User preferences save and auto-apply
- ✅ Personalized product recommendations
- ✅ Farm discovery recommendations
- ✅ Seasonal awareness

### Phase 5: Advanced Features (Day 5 - Optional)
**Goal:** A/B testing and optimization

- [ ] Implement ABTestService
- [ ] Create variant assignment system
- [ ] Build admin UI for tests
- [ ] Add collaborative filtering
- [ ] Implement advanced analytics
- [ ] Performance optimization

**Deliverables:**
- ✅ A/B testing framework operational
- ✅ Collaborative recommendations
- ✅ Advanced analytics insights

---

## 📚 Documentation Deliverables

### Implementation Guides
1. **RUN_4_INSTALLATION_GUIDE.md** - Step-by-step setup
2. **RUN_4_QUICK_REFERENCE.md** - Copy-paste patterns
3. **RUN_4_API_DOCUMENTATION.md** - API specs and examples
4. **RUN_4_ARCHITECTURE.md** - System design and flow

### Developer Documentation
1. **SAVED_SEARCHES.md** - Feature overview and usage
2. **ANALYTICS.md** - Tracking and aggregation guide
3. **PERSONALIZATION.md** - Recommendation algorithms
4. **AB_TESTING.md** - Testing framework guide

### User Documentation
1. **User guide for saved searches**
2. **Privacy and data usage policy**
3. **Analytics dashboard help**
4. **Recommendation explanations**

---

## 🔐 Security & Privacy

### Data Protection
- **Encryption at rest**: Sensitive preference data
- **Anonymization**: Analytics data after 90 days
- **Data retention**: User controls via preferences
- **GDPR compliance**: Export and delete functionality

### Privacy Controls
- **Opt-out**: Disable personalization completely
- **Transparency**: Explain all recommendations
- **Data access**: Users can view all tracked data
- **Deletion**: Complete data removal on request

### Rate Limiting
- **API endpoints**: 100 req/min per user
- **Analytics events**: 1000 events/min per user
- **Recommendation requests**: 60 req/min per user

---

## 🌟 Agricultural Consciousness Integration

### Seasonal Awareness
- **Auto-adjust recommendations** by current season
- **Highlight seasonal products** in search results
- **Seasonal preference templates** (Spring favorites, Fall harvest, etc.)
- **Harvest calendar integration** for timely alerts

### Biodynamic Features
- **Lunar phase awareness** in recommendations
- **Planting day highlights** for farm-fresh picks
- **Crop rotation patterns** for farm discovery
- **Soil health indicators** in farm analytics

### Rural Connectivity
- **Offline-first architecture** for saved searches
- **Sync queue** for analytics events
- **Progressive enhancement** for analytics dashboard
- **Low-bandwidth mode** for recommendations

---

## ✅ Acceptance Criteria

### Saved Searches
- [ ] Users can save current search state
- [ ] Searches organized in folders
- [ ] Share searches via link
- [ ] Receive notifications for new matches
- [ ] Execute saved searches with one click

### Analytics
- [ ] Track all search events
- [ ] Personal insights dashboard
- [ ] Farmer performance metrics (protected)
- [ ] Export analytics data
- [ ] Real-time tracking (< 5s latency)

### Personalization
- [ ] Manage dietary preferences
- [ ] Auto-apply favorite filters
- [ ] Personalized product recommendations
- [ ] Farm discovery suggestions
- [ ] Seasonal preference handling

### Performance
- [ ] All API endpoints < 500ms (p95)
- [ ] Recommendation generation < 1s
- [ ] Analytics aggregation < 5s
- [ ] 80%+ test coverage

### Documentation
- [ ] Complete API documentation
- [ ] User guides for all features
- [ ] Developer implementation guides
- [ ] Privacy policy updated

---

## 🎓 Learning Outcomes

By completing Run 4, you will master:

1. **Advanced Data Modeling** - Complex relationships, JSONB usage, indexing strategies
2. **Analytics Pipelines** - Event tracking, aggregation, real-time processing
3. **Recommendation Systems** - Scoring algorithms, collaborative filtering, personalization
4. **Background Jobs** - Cron scheduling, job queues, async processing
5. **A/B Testing** - Variant assignment, statistical analysis, winner selection
6. **Privacy Engineering** - GDPR compliance, data anonymization, user controls
7. **Performance Optimization** - Caching strategies, query optimization, parallel processing

---

## 🚦 Ready to Start?

### Pre-flight Checklist
- [ ] Run 3 complete and deployed
- [ ] Database backup created
- [ ] Development environment ready
- [ ] Team aligned on priorities
- [ ] Documentation reviewed

### First Steps
1. Review this plan thoroughly
2. Create feature branch: `feature/run-4-saved-searches-analytics`
3. Run database migrations
4. Start with Phase 1: Foundation
5. Follow TDD approach (tests first!)

---

## 📞 Support & Resources

### Documentation
- **React Query Docs**: https://tanstack.com/query/latest
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs

### Project Files
- `.cursorrules` - Coding standards
- `.github/instructions/` - Divine coding patterns
- `docs/RUN_3_*.md` - Previous run documentation

### Team
- **Questions**: Create issue with `[Run 4]` prefix
- **Blockers**: Tag lead developer
- **Ideas**: Open discussion in planning doc

---

## 🎉 Summary

Run 4 transforms the Farmers Market Platform from a search engine into an **intelligent, personalized discovery platform** that:

✅ **Remembers** user preferences and searches  
✅ **Learns** from behavior and seasonal patterns  
✅ **Recommends** products and farms proactively  
✅ **Notifies** users about relevant updates  
✅ **Analyzes** performance for continuous improvement  
✅ **Respects** privacy and user control  
✅ **Adapts** to agricultural seasons and cycles  

**Total LOC Estimate:** ~8,000 lines  
**Test Coverage Target:** 85%  
**Performance Improvement:** 40% better conversion  
**User Engagement:** 60% increase in retention  

---

_"Plant the seeds of personalization, harvest the fruits of user delight."_ 🌱✨

**Version:** 1.0.0  
**Status:** 📋 READY TO IMPLEMENT  
**Next:** RUN_4_INSTALLATION_GUIDE.md