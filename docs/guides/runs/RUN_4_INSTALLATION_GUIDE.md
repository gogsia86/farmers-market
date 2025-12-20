# 🚀 Run 4: Saved Searches, Analytics & Personalization - Installation Guide

**Version:** 1.0.0  
**Status:** ✅ READY TO IMPLEMENT  
**Prerequisites:** Run 3 Complete  
**Estimated Time:** 4-6 hours (Phase 1)

---

## 📋 Table of Contents

1. [Prerequisites Check](#prerequisites-check)
2. [Phase 1: Database Setup](#phase-1-database-setup)
3. [Phase 2: Core Services](#phase-2-core-services)
4. [Phase 3: API Routes](#phase-3-api-routes)
5. [Phase 4: React Query Integration](#phase-4-react-query-integration)
6. [Phase 5: UI Components](#phase-5-ui-components)
7. [Phase 6: Testing](#phase-6-testing)
8. [Phase 7: Deployment](#phase-7-deployment)
9. [Troubleshooting](#troubleshooting)
10. [Verification Checklist](#verification-checklist)

---

## ✅ Prerequisites Check

### Before You Begin

Run this checklist to ensure you're ready:

```bash
# 1. Verify Run 3 is complete
npm run test -- src/hooks/search # Should pass all React Query tests

# 2. Check database connection
npx prisma db pull

# 3. Verify current schema
npx prisma validate

# 4. Create backup
pg_dump -U postgres farmers_market > backup_before_run4.sql

# 5. Check Git status
git status # Should be clean or on feature branch
```

### Required Packages

Ensure these are installed (should already be from previous runs):

```json
{
  "@tanstack/react-query": "^5.x.x",
  "@tanstack/react-query-devtools": "^5.x.x",
  "prisma": "^5.x.x",
  "@prisma/client": "^5.x.x",
  "zod": "^3.x.x",
  "date-fns": "^3.x.x"
}
```

If any are missing:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install -D prisma
npm install @prisma/client zod date-fns
```

---

## 🗄️ Phase 1: Database Setup

### Step 1.1: Update Prisma Schema

Add the new models to `prisma/schema.prisma`:

```bash
# Open schema file
code prisma/schema.prisma
```

**Add at the end of the file (before enums):**

```prisma
// ============================================
// RUN 4: SAVED SEARCHES, ANALYTICS & PERSONALIZATION
// ============================================

model SavedSearch {
  id                    String                 @id @default(cuid())
  userId                String
  name                  String                 @db.VarChar(255)
  description           String?

  // Search Parameters
  query                 String?                @db.VarChar(500)
  filters               Json                   @default("{}")
  sortBy                String?                @db.VarChar(50)
  location              Json?

  // Metadata
  isPublic              Boolean                @default(false)
  shareToken            String?                @unique @db.VarChar(100)
  folderId              String?
  tags                  String[]

  // Notifications
  notificationsEnabled  Boolean                @default(true)
  notificationFrequency NotificationFrequency  @default(DAILY)
  lastNotificationSent  DateTime?

  // Stats
  executionCount        Int                    @default(0)
  lastExecutedAt        DateTime?
  resultsCount          Int?

  // Agricultural Consciousness
  seasonalPreference    Season?
  preferredFarms        String[]
  biodynamicOnly        Boolean                @default(false)

  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt

  user                  User                   @relation("UserSavedSearches", fields: [userId], references: [id], onDelete: Cascade)
  folder                SavedSearchFolder?     @relation(fields: [folderId], references: [id])
  alerts                SearchAlert[]
  shares                SavedSearchShare[]

  @@index([userId])
  @@index([shareToken])
  @@index([createdAt])
  @@index([lastExecutedAt])
  @@map("saved_searches")
}

model SavedSearchFolder {
  id          String        @id @default(cuid())
  userId      String
  name        String        @db.VarChar(100)
  description String?
  icon        String?       @db.VarChar(50)
  sortOrder   Int           @default(0)
  color       String?       @db.VarChar(20)

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  user        User          @relation("UserSavedSearchFolders", fields: [userId], references: [id], onDelete: Cascade)
  searches    SavedSearch[]

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

  type            SearchAlertType @default(NEW_PRODUCTS)
  conditions      Json            @default("{}")

  isActive        Boolean         @default(true)
  lastTriggered   DateTime?
  triggerCount    Int             @default(0)

  channels        Json            @default("{\"email\": true, \"push\": false}")

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  savedSearch     SavedSearch     @relation(fields: [savedSearchId], references: [id], onDelete: Cascade)

  @@index([savedSearchId])
  @@index([userId])
  @@index([isActive])
  @@map("search_alerts")
}

model SearchEvent {
  id              String    @id @default(cuid())
  userId          String?
  sessionId       String    @db.VarChar(100)

  query           String?   @db.VarChar(500)
  filters         Json      @default("{}")
  sortBy          String?   @db.VarChar(50)

  resultsCount    Int
  resultsShown    Int
  clickedResults  String[]

  source          String?   @db.VarChar(50)
  location        Json?
  userAgent       String?   @db.VarChar(500)

  responseTime    Int
  timestamp       DateTime  @default(now())

  currentSeason   Season?
  lunarPhase      String?   @db.VarChar(50)

  abTestVariant   String?   @db.VarChar(50)

  @@index([userId])
  @@index([sessionId])
  @@index([timestamp])
  @@index([query])
  @@map("search_events")
}

model UserInteraction {
  id         String          @id @default(cuid())
  userId     String?
  sessionId  String          @db.VarChar(100)

  type       InteractionType
  entityType String          @db.VarChar(50)
  entityId   String

  source     String?         @db.VarChar(50)
  metadata   Json?

  value      Decimal?        @db.Decimal(10, 2)

  timestamp  DateTime        @default(now())

  @@index([userId])
  @@index([sessionId])
  @@index([entityType, entityId])
  @@index([type])
  @@index([timestamp])
  @@map("user_interactions")
}

model SearchAnalytics {
  id              String     @id @default(cuid())

  periodType      PeriodType
  periodStart     DateTime
  periodEnd       DateTime

  totalSearches   Int        @default(0)
  uniqueUsers     Int        @default(0)
  uniqueQueries   Int        @default(0)

  avgResponseTime Int
  p95ResponseTime Int

  avgResultsCount Decimal    @db.Decimal(10, 2)
  avgClickThrough Decimal    @db.Decimal(5, 4)
  conversionRate  Decimal    @db.Decimal(5, 4)

  topQueries      Json       @default("[]")
  topFilters      Json       @default("[]")
  topCategories   Json       @default("[]")

  seasonalTrends  Json       @default("{}")
  farmPopularity  Json       @default("{}")

  createdAt       DateTime   @default(now())

  @@unique([periodType, periodStart])
  @@index([periodType, periodStart])
  @@map("search_analytics")
}

model UserPreference {
  id                    String   @id @default(cuid())
  userId                String   @unique

  dietaryRestrictions   String[]
  allergens             String[]
  certifications        String[]

  favoriteFarms         String[]
  favoriteCategories    String[]
  budgetRange           Json?

  preferredLocations    Json[]
  maxDistance           Int?

  preferredPickupDays   String[]
  preferredDeliveryTime String?

  springPreferences     Json?
  summerPreferences     Json?
  fallPreferences       Json?
  winterPreferences     Json?

  lunarPhaseAware       Boolean  @default(false)
  biodynamicOnly        Boolean  @default(false)

  allowPersonalization  Boolean  @default(true)
  shareDataForAnalytics Boolean  @default(true)

  autoApplyFilters      Boolean  @default(true)
  autoApplySort         Boolean  @default(true)

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  user                  User     @relation("UserPreferences", fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("user_preferences")
}

model PersonalizationScore {
  id              String   @id @default(cuid())
  userId          String
  entityType      String   @db.VarChar(50)
  entityId        String

  relevanceScore  Int
  affinityScore   Int
  seasonalScore   Int
  proximityScore  Int
  popularityScore Int

  totalScore      Int

  season          Season
  calculatedAt    DateTime @default(now())
  expiresAt       DateTime

  @@unique([userId, entityType, entityId, season])
  @@index([userId])
  @@index([entityType, entityId])
  @@index([totalScore])
  @@index([expiresAt])
  @@map("personalization_scores")
}

model Recommendation {
  id          String             @id @default(cuid())
  userId      String

  type        RecommendationType

  entityType  String             @db.VarChar(50)
  entityId    String

  score       Decimal            @db.Decimal(5, 2)
  confidence  Decimal            @db.Decimal(5, 4)

  reasons     Json               @default("[]")

  season      Season?
  source      String?            @db.VarChar(50)

  shown       Boolean            @default(false)
  shownAt     DateTime?
  clicked     Boolean            @default(false)
  clickedAt   DateTime?
  converted   Boolean            @default(false)
  convertedAt DateTime?

  createdAt   DateTime           @default(now())
  expiresAt   DateTime

  @@index([userId])
  @@index([type])
  @@index([entityType, entityId])
  @@index([shown, clicked, converted])
  @@index([expiresAt])
  @@map("recommendations")
}

model ABTest {
  id              String           @id @default(cuid())
  name            String           @db.VarChar(255)
  description     String?

  variants        Json             @default("[]")
  trafficSplit    Json             @default("{}")

  targetAudience  Json?

  status          ABTestStatus     @default(DRAFT)
  startedAt       DateTime?
  endedAt         DateTime?

  results         Json?
  winnerVariant   String?

  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  assignments     ABTestAssignment[]

  @@index([status])
  @@index([startedAt, endedAt])
  @@map("ab_tests")
}

model ABTestAssignment {
  id         String   @id @default(cuid())
  testId     String
  userId     String?
  sessionId  String   @db.VarChar(100)

  variant    String   @db.VarChar(50)
  assignedAt DateTime @default(now())

  test       ABTest   @relation(fields: [testId], references: [id], onDelete: Cascade)

  @@unique([testId, userId])
  @@unique([testId, sessionId])
  @@index([testId])
  @@index([userId])
  @@map("ab_test_assignments")
}

// ============================================
// RUN 4: NEW ENUMS
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

**Update User model to include new relations:**

Find the `model User` and add these relations before the `@@index` lines:

```prisma
  // Run 4: New Relations
  savedSearches       SavedSearch[]        @relation("UserSavedSearches")
  savedSearchFolders  SavedSearchFolder[]  @relation("UserSavedSearchFolders")
  preferences         UserPreference?      @relation("UserPreferences")
```

### Step 1.2: Create and Run Migration

```bash
# Format the schema
npx prisma format

# Validate schema
npx prisma validate

# Create migration
npx prisma migrate dev --name add_saved_searches_analytics_personalization

# Generate Prisma Client
npx prisma generate
```

**Expected output:**

```
✓ Prisma Migrate created and applied the migration
✓ Generated Prisma Client
```

### Step 1.3: Verify Migration

```bash
# Check database
npx prisma studio
# Navigate to new tables: saved_searches, search_events, user_preferences, etc.

# Or via psql
psql -U postgres farmers_market
\dt saved_*
\dt search_*
\dt user_preferences
\q
```

---

## 🛠️ Phase 2: Core Services

### Step 2.1: Create Service Base Class

**File:** `src/lib/services/base.service.ts`

```typescript
import { database } from "@/lib/database";
import type { Prisma } from "@prisma/client";

export abstract class BaseService {
  protected db = database;

  protected async withTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return await this.db.$transaction(callback);
  }

  protected handleError(error: unknown, context: string): never {
    console.error(`[${context}] Error:`, error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(`Unknown error in ${context}`);
  }
}
```

### Step 2.2: Saved Search Service

**File:** `src/lib/services/saved-search.service.ts`

```typescript
import { BaseService } from "./base.service";
import type { SavedSearch, Prisma } from "@prisma/client";
import { nanoid } from "nanoid";

export interface CreateSavedSearchInput {
  name: string;
  description?: string;
  query?: string;
  filters: Record<string, any>;
  sortBy?: string;
  location?: {
    lat: number;
    lng: number;
    radius?: number;
  };
  folderId?: string;
  tags?: string[];
  notificationsEnabled?: boolean;
  notificationFrequency?:
    | "REALTIME"
    | "HOURLY"
    | "DAILY"
    | "WEEKLY"
    | "MONTHLY";
}

export interface UpdateSavedSearchInput extends Partial<CreateSavedSearchInput> {
  id: string;
}

export class SavedSearchService extends BaseService {
  /**
   * Create a new saved search
   */
  async create(
    userId: string,
    data: CreateSavedSearchInput,
  ): Promise<SavedSearch> {
    try {
      const savedSearch = await this.db.savedSearch.create({
        data: {
          userId,
          name: data.name,
          description: data.description,
          query: data.query,
          filters: data.filters as Prisma.InputJsonValue,
          sortBy: data.sortBy,
          location: data.location as Prisma.InputJsonValue,
          folderId: data.folderId,
          tags: data.tags || [],
          notificationsEnabled: data.notificationsEnabled ?? true,
          notificationFrequency: data.notificationFrequency || "DAILY",
        },
        include: {
          folder: true,
          alerts: true,
        },
      });

      return savedSearch;
    } catch (error) {
      return this.handleError(error, "SavedSearchService.create");
    }
  }

  /**
   * Get all saved searches for a user
   */
  async getByUserId(userId: string): Promise<SavedSearch[]> {
    try {
      return await this.db.savedSearch.findMany({
        where: { userId },
        include: {
          folder: true,
          alerts: true,
        },
        orderBy: [{ folder: { sortOrder: "asc" } }, { createdAt: "desc" }],
      });
    } catch (error) {
      return this.handleError(error, "SavedSearchService.getByUserId");
    }
  }

  /**
   * Get saved search by ID
   */
  async getById(id: string, userId: string): Promise<SavedSearch | null> {
    try {
      return await this.db.savedSearch.findFirst({
        where: { id, userId },
        include: {
          folder: true,
          alerts: true,
          shares: true,
        },
      });
    } catch (error) {
      return this.handleError(error, "SavedSearchService.getById");
    }
  }

  /**
   * Update saved search
   */
  async update(
    userId: string,
    data: UpdateSavedSearchInput,
  ): Promise<SavedSearch> {
    try {
      const { id, ...updateData } = data;

      return await this.db.savedSearch.update({
        where: { id, userId },
        data: {
          ...updateData,
          filters: updateData.filters as Prisma.InputJsonValue,
          location: updateData.location as Prisma.InputJsonValue,
        },
        include: {
          folder: true,
          alerts: true,
        },
      });
    } catch (error) {
      return this.handleError(error, "SavedSearchService.update");
    }
  }

  /**
   * Delete saved search
   */
  async delete(id: string, userId: string): Promise<void> {
    try {
      await this.db.savedSearch.delete({
        where: { id, userId },
      });
    } catch (error) {
      return this.handleError(error, "SavedSearchService.delete");
    }
  }

  /**
   * Generate share token
   */
  async generateShareToken(id: string, userId: string): Promise<string> {
    try {
      const shareToken = nanoid(32);

      await this.db.savedSearch.update({
        where: { id, userId },
        data: {
          isPublic: true,
          shareToken,
        },
      });

      return shareToken;
    } catch (error) {
      return this.handleError(error, "SavedSearchService.generateShareToken");
    }
  }

  /**
   * Get saved search by share token
   */
  async getByShareToken(token: string): Promise<SavedSearch | null> {
    try {
      return await this.db.savedSearch.findUnique({
        where: { shareToken: token, isPublic: true },
        include: {
          folder: true,
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });
    } catch (error) {
      return this.handleError(error, "SavedSearchService.getByShareToken");
    }
  }

  /**
   * Track search execution
   */
  async trackExecution(id: string, resultsCount: number): Promise<void> {
    try {
      await this.db.savedSearch.update({
        where: { id },
        data: {
          executionCount: { increment: 1 },
          lastExecutedAt: new Date(),
          resultsCount,
        },
      });
    } catch (error) {
      console.error("Failed to track search execution:", error);
      // Don't throw - tracking is non-critical
    }
  }
}

export const savedSearchService = new SavedSearchService();
```

### Step 2.3: Analytics Service

**File:** `src/lib/services/analytics.service.ts`

```typescript
import { BaseService } from "./base.service";
import type { SearchEvent, UserInteraction } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

export interface TrackSearchEventInput {
  userId?: string;
  sessionId: string;
  query?: string;
  filters: Record<string, any>;
  sortBy?: string;
  resultsCount: number;
  resultsShown: number;
  responseTime: number;
  source?: string;
  location?: Record<string, any>;
  currentSeason?: "SPRING" | "SUMMER" | "FALL" | "WINTER";
}

export interface TrackInteractionInput {
  userId?: string;
  sessionId: string;
  type:
    | "SEARCH"
    | "VIEW"
    | "CLICK"
    | "ADD_TO_CART"
    | "PURCHASE"
    | "FAVORITE"
    | "REVIEW"
    | "SHARE";
  entityType: string;
  entityId: string;
  source?: string;
  metadata?: Record<string, any>;
  value?: number;
}

export class AnalyticsService extends BaseService {
  /**
   * Track search event
   */
  async trackSearchEvent(data: TrackSearchEventInput): Promise<SearchEvent> {
    try {
      return await this.db.searchEvent.create({
        data: {
          userId: data.userId,
          sessionId: data.sessionId,
          query: data.query,
          filters: data.filters,
          sortBy: data.sortBy,
          resultsCount: data.resultsCount,
          resultsShown: data.resultsShown,
          responseTime: data.responseTime,
          source: data.source,
          location: data.location,
          currentSeason: data.currentSeason,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Failed to track search event:", error);
      // Return mock object - don't fail user experience
      return { id: uuidv4() } as SearchEvent;
    }
  }

  /**
   * Track user interaction
   */
  async trackInteraction(
    data: TrackInteractionInput,
  ): Promise<UserInteraction> {
    try {
      return await this.db.userInteraction.create({
        data: {
          userId: data.userId,
          sessionId: data.sessionId,
          type: data.type,
          entityType: data.entityType,
          entityId: data.entityId,
          source: data.source,
          metadata: data.metadata,
          value: data.value,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Failed to track interaction:", error);
      return { id: uuidv4() } as UserInteraction;
    }
  }

  /**
   * Get user's search analytics
   */
  async getUserSearchAnalytics(
    userId: string,
    period: "WEEK" | "MONTH" | "YEAR" = "MONTH",
  ) {
    try {
      const startDate = this.getStartDate(period);

      const [searches, interactions] = await Promise.all([
        this.db.searchEvent.findMany({
          where: {
            userId,
            timestamp: { gte: startDate },
          },
          orderBy: { timestamp: "desc" },
        }),
        this.db.userInteraction.findMany({
          where: {
            userId,
            timestamp: { gte: startDate },
          },
          orderBy: { timestamp: "desc" },
        }),
      ]);

      return {
        searches,
        interactions,
        summary: this.calculateSummary(searches, interactions),
      };
    } catch (error) {
      return this.handleError(error, "AnalyticsService.getUserSearchAnalytics");
    }
  }

  private getStartDate(period: "WEEK" | "MONTH" | "YEAR"): Date {
    const now = new Date();
    switch (period) {
      case "WEEK":
        return new Date(now.setDate(now.getDate() - 7));
      case "MONTH":
        return new Date(now.setMonth(now.getMonth() - 1));
      case "YEAR":
        return new Date(now.setFullYear(now.getFullYear() - 1));
    }
  }

  private calculateSummary(
    searches: SearchEvent[],
    interactions: UserInteraction[],
  ) {
    const totalSearches = searches.length;
    const uniqueQueries = new Set(searches.map((s) => s.query).filter(Boolean))
      .size;
    const avgResponseTime =
      searches.reduce((acc, s) => acc + s.responseTime, 0) / totalSearches || 0;

    const clicks = interactions.filter((i) => i.type === "CLICK").length;
    const purchases = interactions.filter((i) => i.type === "PURCHASE").length;

    return {
      totalSearches,
      uniqueQueries,
      avgResponseTime: Math.round(avgResponseTime),
      totalClicks: clicks,
      totalPurchases: purchases,
      conversionRate: totalSearches > 0 ? (purchases / totalSearches) * 100 : 0,
    };
  }
}

export const analyticsService = new AnalyticsService();
```

### Step 2.4: User Preferences Service

**File:** `src/lib/services/user-preferences.service.ts`

```typescript
import { BaseService } from "./base.service";
import type { UserPreference, Prisma } from "@prisma/client";

export interface UpdateUserPreferencesInput {
  dietaryRestrictions?: string[];
  allergens?: string[];
  certifications?: string[];
  favoriteFarms?: string[];
  favoriteCategories?: string[];
  budgetRange?: { min: number; max: number };
  preferredLocations?: Array<{
    type: string;
    address: string;
    radius: number;
  }>;
  maxDistance?: number;
  autoApplyFilters?: boolean;
  autoApplySort?: boolean;
  allowPersonalization?: boolean;
}

export class UserPreferencesService extends BaseService {
  /**
   * Get or create user preferences
   */
  async getOrCreate(userId: string): Promise<UserPreference> {
    try {
      let preferences = await this.db.userPreference.findUnique({
        where: { userId },
      });

      if (!preferences) {
        preferences = await this.db.userPreference.create({
          data: { userId },
        });
      }

      return preferences;
    } catch (error) {
      return this.handleError(error, "UserPreferencesService.getOrCreate");
    }
  }

  /**
   * Update user preferences
   */
  async update(
    userId: string,
    data: UpdateUserPreferencesInput,
  ): Promise<UserPreference> {
    try {
      return await this.db.userPreference.upsert({
        where: { userId },
        create: {
          userId,
          ...data,
          budgetRange: data.budgetRange as Prisma.InputJsonValue,
          preferredLocations:
            data.preferredLocations as Prisma.InputJsonValue[],
        },
        update: {
          ...data,
          budgetRange: data.budgetRange as Prisma.InputJsonValue,
          preferredLocations:
            data.preferredLocations as Prisma.InputJsonValue[],
        },
      });
    } catch (error) {
      return this.handleError(error, "UserPreferencesService.update");
    }
  }

  /**
   * Add favorite farm
   */
  async addFavoriteFarm(
    userId: string,
    farmId: string,
  ): Promise<UserPreference> {
    try {
      const prefs = await this.getOrCreate(userId);

      if (prefs.favoriteFarms.includes(farmId)) {
        return prefs;
      }

      return await this.db.userPreference.update({
        where: { userId },
        data: {
          favoriteFarms: {
            push: farmId,
          },
        },
      });
    } catch (error) {
      return this.handleError(error, "UserPreferencesService.addFavoriteFarm");
    }
  }

  /**
   * Remove favorite farm
   */
  async removeFavoriteFarm(
    userId: string,
    farmId: string,
  ): Promise<UserPreference> {
    try {
      const prefs = await this.getOrCreate(userId);

      return await this.db.userPreference.update({
        where: { userId },
        data: {
          favoriteFarms: prefs.favoriteFarms.filter((id) => id !== farmId),
        },
      });
    } catch (error) {
      return this.handleError(
        error,
        "UserPreferencesService.removeFavoriteFarm",
      );
    }
  }
}

export const userPreferencesService = new UserPreferencesService();
```

---

## 🔌 Phase 3: API Routes

### Step 3.1: Saved Searches API

**File:** `src/app/api/saved-searches/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { savedSearchService } from "@/lib/services/saved-search.service";
import { z } from "zod";

const CreateSavedSearchSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  query: z.string().optional(),
  filters: z.record(z.any()),
  sortBy: z.string().optional(),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
      radius: z.number().optional(),
    })
    .optional(),
  folderId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notificationsEnabled: z.boolean().optional(),
  notificationFrequency: z
    .enum(["REALTIME", "HOURLY", "DAILY", "WEEKLY", "MONTHLY"])
    .optional(),
});

/**
 * GET /api/saved-searches
 * List all saved searches for current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const searches = await savedSearchService.getByUserId(session.user.id);

    return NextResponse.json({
      success: true,
      data: searches,
      total: searches.length,
    });
  } catch (error) {
    console.error("[GET /api/saved-searches] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch saved searches" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/saved-searches
 * Create new saved search
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const validation = CreateSavedSearchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error,
        },
        { status: 400 },
      );
    }

    const savedSearch = await savedSearchService.create(
      session.user.id,
      validation.data,
    );

    return NextResponse.json(
      { success: true, data: savedSearch },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/saved-searches] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create saved search" },
      { status: 500 },
    );
  }
}
```

**File:** `src/app/api/saved-searches/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { savedSearchService } from "@/lib/services/saved-search.service";

/**
 * GET /api/saved-searches/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const savedSearch = await savedSearchService.getById(
      params.id,
      session.user.id,
    );

    if (!savedSearch) {
      return NextResponse.json(
        { success: false, error: "Saved search not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: savedSearch });
  } catch (error) {
    console.error("[GET /api/saved-searches/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch saved search" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/saved-searches/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const updatedSearch = await savedSearchService.update(session.user.id, {
      id: params.id,
      ...body,
    });

    return NextResponse.json({ success: true, data: updatedSearch });
  } catch (error) {
    console.error("[PUT /api/saved-searches/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update saved search" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/saved-searches/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await savedSearchService.delete(params.id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/saved-searches/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete saved search" },
      { status: 500 },
    );
  }
}
```

### Step 3.2: Analytics API

**File:** `src/app/api/analytics/events/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyticsService } from "@/lib/services/analytics.service";
import { z } from "zod";

const TrackEventSchema = z.object({
  type: z.enum(["search", "interaction"]),
  data: z.any(),
});

/**
 * POST /api/analytics/events
 * Track analytics events (async, non-blocking)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    const validation = TrackEventSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid event data" },
        { status: 400 },
      );
    }

    const { type, data } = validation.data;

    // Track asynchronously (don't await)
    if (type === "search") {
      analyticsService
        .trackSearchEvent({
          userId: session?.user?.id,
          sessionId: data.sessionId,
          ...data,
        })
        .catch(console.error);
    } else if (type === "interaction") {
      analyticsService
        .trackInteraction({
          userId: session?.user?.id,
          sessionId: data.sessionId,
          ...data,
        })
        .catch(console.error);
    }

    // Return immediately
    return NextResponse.json({ success: true }, { status: 202 });
  } catch (error) {
    console.error("[POST /api/analytics/events] Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
```

### Step 3.3: User Preferences API

**File:** `src/app/api/user/preferences/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { userPreferencesService } from "@/lib/services/user-preferences.service";

/**
 * GET /api/user/preferences
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const preferences = await userPreferencesService.getOrCreate(
      session.user.id,
    );

    return NextResponse.json({ success: true, data: preferences });
  } catch (error) {
    console.error("[GET /api/user/preferences] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch preferences" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/user/preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const preferences = await userPreferencesService.update(
      session.user.id,
      body,
    );

    return NextResponse.json({ success: true, data: preferences });
  } catch (error) {
    console.error("[PUT /api/user/preferences] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update preferences" },
      { status: 500 },
    );
  }
}
```

---

## 🎣 Phase 4: React Query Integration

### Step 4.1: Extend Query Keys

**File:** `src/lib/react-query/query-keys.ts`

Add to existing `queryKeys` object:

```typescript
// Add to existing queryKeys export
export const queryKeys = {
  // ... existing keys ...

  // Saved Searches
  savedSearches: {
    all: ["saved-searches"] as const,
    lists: () => [...queryKeys.savedSearches.all, "list"] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.savedSearches.lists(), { filters }] as const,
    details: () => [...queryKeys.savedSearches.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.savedSearches.details(), id] as const,
  },

  // User Preferences
  preferences: {
    all: ["preferences"] as const,
    current: () => [...queryKeys.preferences.all, "current"] as const,
  },

  // Analytics
  analytics: {
    all: ["analytics"] as const,
    search: (period: string) =>
      [...queryKeys.analytics.all, "search", period] as const,
  },
};
```

### Step 4.2: Create Custom Hooks

**File:** `src/hooks/saved-searches/useSavedSearches.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/query-keys";
import type { SavedSearch } from "@prisma/client";

interface CreateSavedSearchInput {
  name: string;
  description?: string;
  query?: string;
  filters: Record<string, any>;
  sortBy?: string;
}

/**
 * Get all saved searches for current user
 */
export function useSavedSearches() {
  return useQuery({
    queryKey: queryKeys.savedSearches.list(),
    queryFn: async () => {
      const res = await fetch("/api/saved-searches");
      if (!res.ok) throw new Error("Failed to fetch saved searches");
      const json = await res.json();
      return json.data as SavedSearch[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get saved search by ID
 */
export function useSavedSearch(id: string) {
  return useQuery({
    queryKey: queryKeys.savedSearches.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/saved-searches/${id}`);
      if (!res.ok) throw new Error("Failed to fetch saved search");
      const json = await res.json();
      return json.data as SavedSearch;
    },
    enabled: !!id,
  });
}

/**
 * Create saved search
 */
export function useCreateSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSavedSearchInput) => {
      const res = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create saved search");
      const json = await res.json();
      return json.data as SavedSearch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.savedSearches.all,
      });
    },
  });
}

/**
 * Update saved search
 */
export function useUpdateSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<CreateSavedSearchInput> & { id: string }) => {
      const res = await fetch(`/api/saved-searches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update saved search");
      const json = await res.json();
      return json.data as SavedSearch;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.savedSearches.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.savedSearches.detail(data.id),
      });
    },
  });
}

/**
 * Delete saved search
 */
export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/saved-searches/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete saved search");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.savedSearches.all,
      });
    },
  });
}
```

**File:** `src/hooks/preferences/useUserPreferences.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/query-keys";
import type { UserPreference } from "@prisma/client";

/**
 * Get current user preferences
 */
export function useUserPreferences() {
  return useQuery({
    queryKey: queryKeys.preferences.current(),
    queryFn: async () => {
      const res = await fetch("/api/user/preferences");
      if (!res.ok) throw new Error("Failed to fetch preferences");
      const json = await res.json();
      return json.data as UserPreference;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Update user preferences
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<UserPreference>) => {
      const res = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update preferences");
      const json = await res.json();
      return json.data as UserPreference;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.preferences.all,
      });
    },
  });
}
```

---

## 🎨 Phase 5: UI Components

### Step 5.1: Saved Search List Component

**File:** `src/components/saved-searches/SavedSearchList.tsx`

```typescript
"use client";

import { useSavedSearches, useDeleteSavedSearch } from "@/hooks/saved-searches/useSavedSearches";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Trash2, Play, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SavedSearchList() {
  const { data: searches, isLoading } = useSavedSearches();
  const deleteMutation = useDeleteSavedSearch();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this saved search?")) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Deleted",
        description: "Saved search deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete saved search",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading saved searches...</div>;
  }

  if (!searches || searches.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No saved searches yet. Create one from any search page!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {searches.map((search) => (
        <Card key={search.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{search.name}</span>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" title="Execute search">
                  <Play className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" title="Share">
                  <Share className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  title="Delete"
                  onClick={() => handleDelete(search.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
            {search.description && (
              <CardDescription>{search.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {search.query && <p>Query: {search.query}</p>}
              <p>
                Executed {search.executionCount} times
                {search.lastExecutedAt && (
                  <> • Last: {new Date(search.lastExecutedAt).toLocaleDateString()}</>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Step 5.2: Save Search Button

**File:** `src/components/saved-searches/SaveSearchButton.tsx`

```typescript
"use client";

import { useState } from "react";
import { useCreateSavedSearch } from "@/hooks/saved-searches/useSavedSearches";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SaveSearchButtonProps {
  query?: string;
  filters: Record<string, any>;
  sortBy?: string;
}

export function SaveSearchButton({ query, filters, sortBy }: SaveSearchButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = useCreateSavedSearch();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for this search",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        name,
        description,
        query,
        filters,
        sortBy,
      });

      toast({
        title: "Saved!",
        description: "Search saved successfully",
      });

      setOpen(false);
      setName("");
      setDescription("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save search",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save Search
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save This Search</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Organic Vegetables Near Me"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this search..."
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={createMutation.isPending}
            className="w-full"
          >
            {createMutation.isPending ? "Saving..." : "Save Search"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 🧪 Phase 6: Testing

### Step 6.1: Service Tests

**File:** `src/__tests__/lib/saved-search.service.test.ts`

```typescript
import { savedSearchService } from "@/lib/services/saved-search.service";
import { database } from "@/lib/database";

describe("SavedSearchService", () => {
  const mockUserId = "test-user-id";

  beforeEach(async () => {
    // Clean up test data
    await database.savedSearch.deleteMany({
      where: { userId: mockUserId },
    });
  });

  describe("create", () => {
    it("should create saved search with valid data", async () => {
      const searchData = {
        name: "Test Search",
        description: "Test description",
        query: "tomatoes",
        filters: { category: "VEGETABLES", organic: true },
      };

      const result = await savedSearchService.create(mockUserId, searchData);

      expect(result).toHaveProperty("id");
      expect(result.name).toBe(searchData.name);
      expect(result.userId).toBe(mockUserId);
      expect(result.filters).toEqual(searchData.filters);
    });

    it("should set default notification frequency", async () => {
      const result = await savedSearchService.create(mockUserId, {
        name: "Test",
        filters: {},
      });

      expect(result.notificationFrequency).toBe("DAILY");
      expect(result.notificationsEnabled).toBe(true);
    });
  });

  describe("getByUserId", () => {
    it("should return all saved searches for user", async () => {
      await savedSearchService.create(mockUserId, {
        name: "Search 1",
        filters: {},
      });
      await savedSearchService.create(mockUserId, {
        name: "Search 2",
        filters: {},
      });

      const searches = await savedSearchService.getByUserId(mockUserId);

      expect(searches).toHaveLength(2);
    });
  });

  describe("delete", () => {
    it("should delete saved search", async () => {
      const search = await savedSearchService.create(mockUserId, {
        name: "To Delete",
        filters: {},
      });

      await savedSearchService.delete(search.id, mockUserId);

      const result = await savedSearchService.getById(search.id, mockUserId);
      expect(result).toBeNull();
    });
  });
});
```

### Step 6.2: API Tests

**File:** `src/__tests__/api/saved-searches.test.ts`

```typescript
import { POST, GET } from "@/app/api/saved-searches/route";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

jest.mock("@/lib/auth");

describe("POST /api/saved-searches", () => {
  it("should return 401 when not authenticated", async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/saved-searches", {
      method: "POST",
      body: JSON.stringify({ name: "Test", filters: {} }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("should create saved search when authenticated", async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: "test-user-id" },
    });

    const request = new NextRequest("http://localhost/api/saved-searches", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Search",
        filters: { category: "VEGETABLES" },
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty("id");
  });
});
```

### Step 6.3: Hook Tests

**File:** `src/__tests__/hooks/useSavedSearches.test.ts`

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSavedSearches, useCreateSavedSearch } from "@/hooks/saved-searches/useSavedSearches";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe("useSavedSearches", () => {
  it("should fetch saved searches", async () => {
    const { result } = renderHook(() => useSavedSearches(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
  });
});

describe("useCreateSavedSearch", () => {
  it("should create saved search", async () => {
    const { result } = renderHook(() => useCreateSavedSearch(), {
      wrapper: createWrapper(),
    });

    const searchData = {
      name: "Test Search",
      filters: { category: "VEGETABLES" },
    };

    result.current.mutate(searchData);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveProperty("id");
  });
});
```

### Step 6.4: Run Tests

```bash
# Run all tests
npm run test

# Run specific test suite
npm run test -- src/__tests__/lib/saved-search.service.test.ts

# Run with coverage
npm run test -- --coverage

# Expected output:
# ✓ SavedSearchService tests (5 passed)
# ✓ API tests (4 passed)
# ✓ Hook tests (3 passed)
# Coverage: >80%
```

---

## 🚀 Phase 7: Deployment

### Step 7.1: Pre-deployment Checks

```bash
# 1. Run full test suite
npm run test

# 2. Type check
npm run type-check

# 3. Lint
npm run lint

# 4. Build
npm run build

# 5. Verify migration in production database (staging first!)
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### Step 7.2: Deploy to Staging

```bash
# Push to staging branch
git checkout -b run-4-staging
git push origin run-4-staging

# Run migration on staging database
# (via your deployment pipeline)

# Test staging environment
curl https://staging.yourapp.com/api/saved-searches

# Verify features work
```

### Step 7.3: Deploy to
