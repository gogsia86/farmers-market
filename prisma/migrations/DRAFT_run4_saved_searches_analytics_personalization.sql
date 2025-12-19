-- Run 4: Saved Searches, Analytics & Personalization
-- Migration: add_saved_searches_analytics_personalization
-- Generated: 2024
-- Description: Adds tables for saved searches, search analytics, user preferences,
--              recommendations, A/B testing, and personalization features

-- ============================================
-- ENUMS
-- ============================================

-- Notification frequency for saved search alerts
CREATE TYPE "NotificationFrequency" AS ENUM (
  'REALTIME',
  'HOURLY',
  'DAILY',
  'WEEKLY',
  'MONTHLY'
);

-- Search alert types
CREATE TYPE "SearchAlertType" AS ENUM (
  'NEW_PRODUCTS',
  'PRICE_CHANGE',
  'BACK_IN_STOCK',
  'SEASONAL_AVAILABLE',
  'FARM_UPDATE',
  'CUSTOM'
);

-- Share permissions
CREATE TYPE "SharePermission" AS ENUM (
  'VIEW',
  'EDIT',
  'ADMIN'
);

-- User interaction types for analytics
CREATE TYPE "InteractionType" AS ENUM (
  'SEARCH',
  'VIEW',
  'CLICK',
  'ADD_TO_CART',
  'PURCHASE',
  'FAVORITE',
  'REVIEW',
  'SHARE'
);

-- Time period types for analytics aggregation
CREATE TYPE "PeriodType" AS ENUM (
  'HOUR',
  'DAY',
  'WEEK',
  'MONTH',
  'QUARTER',
  'YEAR'
);

-- Recommendation types
CREATE TYPE "RecommendationType" AS ENUM (
  'SIMILAR_PRODUCT',
  'COMPLEMENTARY',
  'TRENDING',
  'SEASONAL',
  'FARM_DISCOVERY',
  'PERSONALIZED',
  'COLLABORATIVE'
);

-- A/B test status
CREATE TYPE "ABTestStatus" AS ENUM (
  'DRAFT',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'ARCHIVED'
);

-- Season enum for agricultural consciousness
CREATE TYPE "Season" AS ENUM (
  'SPRING',
  'SUMMER',
  'FALL',
  'WINTER'
);

-- ============================================
-- SAVED SEARCHES & FOLDERS
-- ============================================

-- Folders to organize saved searches
CREATE TABLE "saved_search_folders" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "icon" VARCHAR(50),
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "color" VARCHAR(20),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "saved_search_folders_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Main saved searches table
CREATE TABLE "saved_searches" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,

  -- Search parameters stored as JSONB
  "query" VARCHAR(500),
  "filters" JSONB NOT NULL DEFAULT '{}',
  "sortBy" VARCHAR(50),
  "location" JSONB,

  -- Metadata
  "isPublic" BOOLEAN NOT NULL DEFAULT FALSE,
  "shareToken" VARCHAR(100) UNIQUE,
  "folderId" TEXT,
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Notifications
  "notificationsEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "notificationFrequency" "NotificationFrequency" NOT NULL DEFAULT 'DAILY',
  "lastNotificationSent" TIMESTAMP(3),

  -- Statistics
  "executionCount" INTEGER NOT NULL DEFAULT 0,
  "lastExecutedAt" TIMESTAMP(3),
  "resultsCount" INTEGER,

  -- Agricultural consciousness
  "seasonalPreference" "Season",
  "preferredFarms" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "biodynamicOnly" BOOLEAN NOT NULL DEFAULT FALSE,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "saved_searches_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "saved_searches_folderId_fkey"
    FOREIGN KEY ("folderId") REFERENCES "saved_search_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Saved search sharing
CREATE TABLE "saved_search_shares" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "savedSearchId" TEXT NOT NULL,
  "sharedWithEmail" VARCHAR(255) NOT NULL,
  "sharedWithId" TEXT,
  "permission" "SharePermission" NOT NULL DEFAULT 'VIEW',
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "saved_search_shares_savedSearchId_fkey"
    FOREIGN KEY ("savedSearchId") REFERENCES "saved_searches"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "saved_search_shares_savedSearchId_sharedWithEmail_key"
    UNIQUE ("savedSearchId", "sharedWithEmail")
);

-- Search alerts/notifications
CREATE TABLE "search_alerts" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "savedSearchId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,

  -- Alert configuration
  "type" "SearchAlertType" NOT NULL DEFAULT 'NEW_PRODUCTS',
  "conditions" JSONB NOT NULL DEFAULT '{}',

  -- Status
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "lastTriggered" TIMESTAMP(3),
  "triggerCount" INTEGER NOT NULL DEFAULT 0,

  -- Delivery channels
  "channels" JSONB NOT NULL DEFAULT '{"email": true, "push": false, "sms": false}',

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "search_alerts_savedSearchId_fkey"
    FOREIGN KEY ("savedSearchId") REFERENCES "saved_searches"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- ANALYTICS & TRACKING
-- ============================================

-- Individual search events (raw data)
CREATE TABLE "search_events" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT,
  "sessionId" VARCHAR(100) NOT NULL,

  -- Search details
  "query" VARCHAR(500),
  "filters" JSONB NOT NULL DEFAULT '{}',
  "sortBy" VARCHAR(50),

  -- Results
  "resultsCount" INTEGER NOT NULL,
  "resultsShown" INTEGER NOT NULL,
  "clickedResults" TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Context
  "source" VARCHAR(50),
  "location" JSONB,
  "userAgent" VARCHAR(500),

  -- Performance
  "responseTime" INTEGER NOT NULL, -- milliseconds
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Agricultural context
  "currentSeason" "Season",
  "lunarPhase" VARCHAR(50),

  -- A/B testing
  "abTestVariant" VARCHAR(50)
);

-- User interactions (clicks, purchases, etc.)
CREATE TABLE "user_interactions" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT,
  "sessionId" VARCHAR(100) NOT NULL,

  -- Interaction details
  "type" "InteractionType" NOT NULL,
  "entityType" VARCHAR(50) NOT NULL,
  "entityId" TEXT NOT NULL,

  -- Context
  "source" VARCHAR(50),
  "metadata" JSONB,

  -- Value (revenue, rating, etc.)
  "value" DECIMAL(10, 2),

  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Aggregated search analytics (materialized view)
CREATE TABLE "search_analytics" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,

  -- Time window
  "periodType" "PeriodType" NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,

  -- Aggregated metrics
  "totalSearches" INTEGER NOT NULL DEFAULT 0,
  "uniqueUsers" INTEGER NOT NULL DEFAULT 0,
  "uniqueQueries" INTEGER NOT NULL DEFAULT 0,

  -- Performance
  "avgResponseTime" INTEGER NOT NULL, -- milliseconds
  "p95ResponseTime" INTEGER NOT NULL,

  -- Engagement
  "avgResultsCount" DECIMAL(10, 2) NOT NULL,
  "avgClickThrough" DECIMAL(5, 4) NOT NULL, -- 0.0000 to 1.0000
  "conversionRate" DECIMAL(5, 4) NOT NULL,

  -- Top queries (JSONB arrays)
  "topQueries" JSONB NOT NULL DEFAULT '[]',
  "topFilters" JSONB NOT NULL DEFAULT '[]',
  "topCategories" JSONB NOT NULL DEFAULT '[]',

  -- Agricultural insights
  "seasonalTrends" JSONB NOT NULL DEFAULT '{}',
  "farmPopularity" JSONB NOT NULL DEFAULT '{}',

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "search_analytics_periodType_periodStart_key"
    UNIQUE ("periodType", "periodStart")
);

-- ============================================
-- USER PREFERENCES & PERSONALIZATION
-- ============================================

-- User preferences for personalization
CREATE TABLE "user_preferences" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL UNIQUE,

  -- Dietary preferences
  "dietaryRestrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "allergens" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Shopping preferences
  "favoriteFarms" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "favoriteCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "budgetRange" JSONB,

  -- Location preferences
  "preferredLocations" JSONB[] DEFAULT ARRAY[]::JSONB[],
  "maxDistance" INTEGER,

  -- Delivery preferences
  "preferredPickupDays" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "preferredDeliveryTime" TEXT,

  -- Seasonal preferences (JSONB by season)
  "springPreferences" JSONB,
  "summerPreferences" JSONB,
  "fallPreferences" JSONB,
  "winterPreferences" JSONB,

  -- Biodynamic preferences
  "lunarPhaseAware" BOOLEAN NOT NULL DEFAULT FALSE,
  "biodynamicOnly" BOOLEAN NOT NULL DEFAULT FALSE,

  -- Privacy settings
  "allowPersonalization" BOOLEAN NOT NULL DEFAULT TRUE,
  "shareDataForAnalytics" BOOLEAN NOT NULL DEFAULT TRUE,

  -- Auto-apply settings
  "autoApplyFilters" BOOLEAN NOT NULL DEFAULT TRUE,
  "autoApplySort" BOOLEAN NOT NULL DEFAULT TRUE,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "user_preferences_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Personalization scores (cached scoring results)
CREATE TABLE "personalization_scores" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL,
  "entityType" VARCHAR(50) NOT NULL,
  "entityId" TEXT NOT NULL,

  -- Individual scores (0-100)
  "relevanceScore" INTEGER NOT NULL,
  "affinityScore" INTEGER NOT NULL,
  "seasonalScore" INTEGER NOT NULL,
  "proximityScore" INTEGER NOT NULL,
  "popularityScore" INTEGER NOT NULL,

  -- Combined score
  "totalScore" INTEGER NOT NULL,

  -- Context
  "season" "Season" NOT NULL,
  "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "personalization_scores_userId_entityType_entityId_season_key"
    UNIQUE ("userId", "entityType", "entityId", "season")
);

-- Recommendations
CREATE TABLE "recommendations" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL,

  -- Recommendation type
  "type" "RecommendationType" NOT NULL,

  -- Recommended entity
  "entityType" VARCHAR(50) NOT NULL,
  "entityId" TEXT NOT NULL,

  -- Scoring
  "score" DECIMAL(5, 2) NOT NULL,
  "confidence" DECIMAL(5, 4) NOT NULL,

  -- Reasons (JSONB array)
  "reasons" JSONB NOT NULL DEFAULT '[]',

  -- Context
  "season" "Season",
  "source" VARCHAR(50),

  -- Interaction tracking
  "shown" BOOLEAN NOT NULL DEFAULT FALSE,
  "shownAt" TIMESTAMP(3),
  "clicked" BOOLEAN NOT NULL DEFAULT FALSE,
  "clickedAt" TIMESTAMP(3),
  "converted" BOOLEAN NOT NULL DEFAULT FALSE,
  "convertedAt" TIMESTAMP(3),

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL
);

-- ============================================
-- A/B TESTING
-- ============================================

-- A/B tests configuration
CREATE TABLE "ab_tests" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,

  -- Test configuration
  "variants" JSONB NOT NULL DEFAULT '[]',
  "trafficSplit" JSONB NOT NULL DEFAULT '{}',

  -- Targeting
  "targetAudience" JSONB,

  -- Status
  "status" "ABTestStatus" NOT NULL DEFAULT 'DRAFT',
  "startedAt" TIMESTAMP(3),
  "endedAt" TIMESTAMP(3),

  -- Results (updated periodically)
  "results" JSONB,
  "winnerVariant" TEXT,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- A/B test user assignments
CREATE TABLE "ab_test_assignments" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "testId" TEXT NOT NULL,
  "userId" TEXT,
  "sessionId" VARCHAR(100) NOT NULL,

  "variant" VARCHAR(50) NOT NULL,
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ab_test_assignments_testId_fkey"
    FOREIGN KEY ("testId") REFERENCES "ab_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ab_test_assignments_testId_userId_key"
    UNIQUE ("testId", "userId"),
  CONSTRAINT "ab_test_assignments_testId_sessionId_key"
    UNIQUE ("testId", "sessionId")
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Saved searches indexes
CREATE INDEX "saved_search_folders_userId_idx" ON "saved_search_folders"("userId");
CREATE INDEX "saved_searches_userId_idx" ON "saved_searches"("userId");
CREATE INDEX "saved_searches_shareToken_idx" ON "saved_searches"("shareToken");
CREATE INDEX "saved_searches_createdAt_idx" ON "saved_searches"("createdAt");
CREATE INDEX "saved_searches_lastExecutedAt_idx" ON "saved_searches"("lastExecutedAt");
CREATE INDEX "saved_search_shares_savedSearchId_idx" ON "saved_search_shares"("savedSearchId");
CREATE INDEX "search_alerts_savedSearchId_idx" ON "search_alerts"("savedSearchId");
CREATE INDEX "search_alerts_userId_idx" ON "search_alerts"("userId");
CREATE INDEX "search_alerts_isActive_idx" ON "search_alerts"("isActive");

-- Analytics indexes
CREATE INDEX "search_events_userId_idx" ON "search_events"("userId");
CREATE INDEX "search_events_sessionId_idx" ON "search_events"("sessionId");
CREATE INDEX "search_events_timestamp_idx" ON "search_events"("timestamp");
CREATE INDEX "search_events_query_idx" ON "search_events"("query");
CREATE INDEX "user_interactions_userId_idx" ON "user_interactions"("userId");
CREATE INDEX "user_interactions_sessionId_idx" ON "user_interactions"("sessionId");
CREATE INDEX "user_interactions_entityType_entityId_idx" ON "user_interactions"("entityType", "entityId");
CREATE INDEX "user_interactions_type_idx" ON "user_interactions"("type");
CREATE INDEX "user_interactions_timestamp_idx" ON "user_interactions"("timestamp");
CREATE INDEX "search_analytics_periodType_periodStart_idx" ON "search_analytics"("periodType", "periodStart");

-- Preferences & personalization indexes
CREATE INDEX "user_preferences_userId_idx" ON "user_preferences"("userId");
CREATE INDEX "personalization_scores_userId_idx" ON "personalization_scores"("userId");
CREATE INDEX "personalization_scores_entityType_entityId_idx" ON "personalization_scores"("entityType", "entityId");
CREATE INDEX "personalization_scores_totalScore_idx" ON "personalization_scores"("totalScore");
CREATE INDEX "personalization_scores_expiresAt_idx" ON "personalization_scores"("expiresAt");
CREATE INDEX "recommendations_userId_idx" ON "recommendations"("userId");
CREATE INDEX "recommendations_type_idx" ON "recommendations"("type");
CREATE INDEX "recommendations_entityType_entityId_idx" ON "recommendations"("entityType", "entityId");
CREATE INDEX "recommendations_shown_clicked_converted_idx" ON "recommendations"("shown", "clicked", "converted");
CREATE INDEX "recommendations_expiresAt_idx" ON "recommendations"("expiresAt");

-- A/B testing indexes
CREATE INDEX "ab_tests_status_idx" ON "ab_tests"("status");
CREATE INDEX "ab_tests_startedAt_endedAt_idx" ON "ab_tests"("startedAt", "endedAt");
CREATE INDEX "ab_test_assignments_testId_idx" ON "ab_test_assignments"("testId");
CREATE INDEX "ab_test_assignments_userId_idx" ON "ab_test_assignments"("userId");

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_saved_search_folders_updated_at BEFORE UPDATE ON "saved_search_folders"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON "saved_searches"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_search_alerts_updated_at BEFORE UPDATE ON "search_alerts"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON "user_preferences"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ab_tests_updated_at BEFORE UPDATE ON "ab_tests"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE "saved_searches" IS 'User-saved search configurations with notification preferences';
COMMENT ON TABLE "search_events" IS 'Raw search event tracking for analytics';
COMMENT ON TABLE "search_analytics" IS 'Aggregated search metrics by time period';
COMMENT ON TABLE "user_preferences" IS 'User preferences for personalization and auto-filtering';
COMMENT ON TABLE "recommendations" IS 'Personalized product and farm recommendations';
COMMENT ON TABLE "ab_tests" IS 'A/B test configurations for experimentation';

COMMENT ON COLUMN "saved_searches"."filters" IS 'JSONB object containing all search filters (category, price, certifications, etc.)';
COMMENT ON COLUMN "saved_searches"."preferredFarms" IS 'Array of farm IDs for farm-specific searches';
COMMENT ON COLUMN "search_events"."clickedResults" IS 'Array of product IDs that were clicked in the search results';
COMMENT ON COLUMN "user_preferences"."seasonalPreference" IS 'JSONB object with seasonal product preferences';
COMMENT ON COLUMN "recommendations"."reasons" IS 'JSONB array explaining why this recommendation was made';
