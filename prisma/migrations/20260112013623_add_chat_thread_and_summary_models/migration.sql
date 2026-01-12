-- CreateEnum
CREATE TYPE "NotificationFrequency" AS ENUM ('REALTIME', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "SearchAlertType" AS ENUM ('NEW_PRODUCTS', 'PRICE_CHANGE', 'BACK_IN_STOCK', 'SEASONAL_AVAILABLE', 'FARM_UPDATE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SharePermission" AS ENUM ('VIEW', 'EDIT', 'ADMIN');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('SEARCH', 'VIEW', 'CLICK', 'ADD_TO_CART', 'PURCHASE', 'FAVORITE', 'REVIEW', 'SHARE');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('HOUR', 'DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR');

-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('SIMILAR_PRODUCT', 'SIMILAR_PRODUCTS', 'COMPLEMENTARY', 'FREQUENTLY_BOUGHT_TOGETHER', 'TRENDING', 'SEASONAL', 'POPULAR_IN_AREA', 'FARM_DISCOVERY', 'PERSONALIZED', 'PERSONALIZED_PRODUCTS', 'COLLABORATIVE', 'BASED_ON_BROWSING', 'NEW_ARRIVALS');

-- CreateEnum
CREATE TYPE "ABTestStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AnalyticsGranularity" AS ENUM ('MINUTE', 'HOUR', 'DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR');

-- CreateEnum
CREATE TYPE "TrendDirection" AS ENUM ('RISING', 'FALLING', 'STABLE', 'VOLATILE', 'SEASONAL');

-- CreateEnum
CREATE TYPE "MLModelType" AS ENUM ('RECOMMENDATION', 'DEMAND_FORECASTING', 'PRICE_OPTIMIZATION', 'CHURN_PREDICTION', 'SEASONALITY_DETECTION', 'QUALITY_PREDICTION', 'SENTIMENT_ANALYSIS');

-- CreateEnum
CREATE TYPE "MLModelStatus" AS ENUM ('TRAINING', 'READY', 'DEPLOYED', 'DEPRECATED', 'FAILED');

-- CreateEnum
CREATE TYPE "MLTrainingStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('ORDER_CONFIRMATION', 'ORDER_STATUS_UPDATE', 'ORDER_SHIPPED', 'ORDER_DELIVERED', 'ORDER_CANCELLED', 'PASSWORD_RESET', 'VERIFICATION', 'WELCOME', 'FARM_APPROVED', 'FARM_REJECTED', 'FARM_UPDATE', 'NEW_PRODUCT', 'PROMOTION', 'SEASONAL_NEWS', 'SHIPPING_NOTIFICATION', 'DELIVERY_REMINDER', 'ACCOUNT_UPDATE', 'SECURITY_ALERT', 'PRICE_ALERT', 'INVENTORY_ALERT', 'SURVEY_REQUEST', 'NEWSLETTER', 'PRODUCT_RECOMMENDATION', 'OTHER');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED', 'DROPPED', 'DEFERRED');

-- CreateEnum
CREATE TYPE "ChatProvider" AS ENUM ('OLLAMA', 'PERPLEXITY', 'OPENAI', 'ANTHROPIC');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('SYSTEM', 'USER', 'ASSISTANT', 'FUNCTION');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "seasonality" "Season"[];

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "eventId" VARCHAR(255),
    "provider" VARCHAR(50) NOT NULL,
    "eventType" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_searches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "query" VARCHAR(500),
    "filters" JSONB NOT NULL DEFAULT '{}',
    "sortBy" VARCHAR(50),
    "location" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "shareToken" VARCHAR(100),
    "folderId" TEXT,
    "tags" TEXT[],
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "notificationFrequency" "NotificationFrequency" NOT NULL DEFAULT 'DAILY',
    "lastNotificationSent" TIMESTAMP(3),
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "lastExecutedAt" TIMESTAMP(3),
    "resultsCount" INTEGER,
    "seasonalPreference" "Season",
    "preferredFarms" TEXT[],
    "biodynamicOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_search_folders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(50),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "color" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_search_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_search_shares" (
    "id" TEXT NOT NULL,
    "savedSearchId" TEXT NOT NULL,
    "sharedWithEmail" VARCHAR(255) NOT NULL,
    "sharedWithId" TEXT,
    "permission" "SharePermission" NOT NULL DEFAULT 'VIEW',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_search_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_alerts" (
    "id" TEXT NOT NULL,
    "savedSearchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "SearchAlertType" NOT NULL DEFAULT 'NEW_PRODUCTS',
    "conditions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggered" TIMESTAMP(3),
    "triggerCount" INTEGER NOT NULL DEFAULT 0,
    "channels" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" VARCHAR(100) NOT NULL,
    "query" VARCHAR(500),
    "filters" JSONB,
    "sortBy" VARCHAR(50),
    "categoryId" TEXT,
    "farmId" TEXT,
    "location" JSONB,
    "priceRange" JSONB,
    "seasonalFilter" "Season",
    "resultsCount" INTEGER NOT NULL,
    "resultsShown" INTEGER,
    "clickedResults" TEXT[],
    "clickedResultIds" JSONB,
    "hasResults" BOOLEAN,
    "responseTime" INTEGER,
    "responseTimeMs" INTEGER,
    "cacheHit" BOOLEAN NOT NULL DEFAULT false,
    "databaseTimeMs" INTEGER,
    "renderTimeMs" INTEGER,
    "source" VARCHAR(50),
    "userAgent" VARCHAR(500),
    "ipAddress" VARCHAR(45),
    "referrer" VARCHAR(500),
    "deviceId" VARCHAR(100),
    "currentSeason" "Season",
    "lunarPhase" VARCHAR(50),
    "agriculturalContext" JSONB,
    "biodynamicFactors" JSONB,
    "seasonalRelevance" DECIMAL(5,2),
    "savedSearch" BOOLEAN NOT NULL DEFAULT false,
    "refinedSearch" BOOLEAN NOT NULL DEFAULT false,
    "exitedAt" TIMESTAMP(3),
    "sessionDepth" INTEGER NOT NULL DEFAULT 1,
    "abTestVariant" VARCHAR(50),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_interactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" VARCHAR(100) NOT NULL,
    "type" "InteractionType" NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" TEXT NOT NULL,
    "searchEventId" TEXT,
    "recommendationId" TEXT,
    "abTestId" TEXT,
    "abTestVariant" VARCHAR(50),
    "source" VARCHAR(50),
    "metadata" JSONB,
    "durationMs" INTEGER,
    "scrollDepth" DECIMAL(5,2),
    "clickPosition" INTEGER,
    "timeInSession" INTEGER,
    "sessionDepth" INTEGER NOT NULL DEFAULT 1,
    "agriculturalContext" JSONB,
    "userAgent" VARCHAR(500),
    "deviceId" VARCHAR(100),
    "value" DECIMAL(10,2),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_analytics" (
    "id" TEXT NOT NULL,
    "query" VARCHAR(500),
    "categoryId" TEXT,
    "farmId" TEXT,
    "season" "Season",
    "periodType" "PeriodType" NOT NULL,
    "period" "PeriodType",
    "periodKey" VARCHAR(50),
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalSearches" INTEGER NOT NULL DEFAULT 0,
    "uniqueUsers" INTEGER NOT NULL DEFAULT 0,
    "uniqueSessions" INTEGER NOT NULL DEFAULT 0,
    "uniqueQueries" INTEGER NOT NULL DEFAULT 0,
    "averageResultsCount" DECIMAL(10,2) NOT NULL,
    "noResultsCount" INTEGER NOT NULL DEFAULT 0,
    "refinementRate" DECIMAL(5,4) NOT NULL,
    "saveRate" DECIMAL(5,4) NOT NULL,
    "bounceRate" DECIMAL(5,4) NOT NULL,
    "avgResponseTime" INTEGER NOT NULL,
    "averageResponseTime" DECIMAL(10,2) NOT NULL,
    "cacheHitRate" DECIMAL(5,4) NOT NULL,
    "p95ResponseTime" INTEGER NOT NULL,
    "p99ResponseTime" DECIMAL(10,2) NOT NULL,
    "avgResultsCount" DECIMAL(10,2) NOT NULL,
    "avgClickThrough" DECIMAL(5,4) NOT NULL,
    "clickThroughRate" DECIMAL(5,4) NOT NULL,
    "conversionRate" DECIMAL(5,4) NOT NULL,
    "seasonalRelevanceAvg" DECIMAL(5,2),
    "biodynamicEngagement" DECIMAL(5,4),
    "seasonalTrends" JSONB,
    "farmPopularity" JSONB,
    "topQueries" JSONB,
    "topFilters" JSONB,
    "topCategories" JSONB,
    "topClickedResults" JSONB,
    "topConvertedItems" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "search_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dietaryRestrictions" TEXT[],
    "allergens" TEXT[],
    "certifications" TEXT[],
    "preferOrganic" BOOLEAN NOT NULL DEFAULT false,
    "preferLocal" BOOLEAN NOT NULL DEFAULT false,
    "priceRangeMin" DECIMAL(10,2),
    "priceRangeMax" DECIMAL(10,2),
    "favoriteFarms" TEXT[],
    "favoriteCategories" TEXT[],
    "budgetRange" JSONB,
    "defaultLocation" JSONB,
    "preferredLocations" JSONB[],
    "maxDistance" INTEGER,
    "preferredPickupDays" TEXT[],
    "preferredDeliveryTime" TEXT,
    "springPreferences" JSONB,
    "summerPreferences" JSONB,
    "fallPreferences" JSONB,
    "winterPreferences" JSONB,
    "lunarPhaseAware" BOOLEAN NOT NULL DEFAULT false,
    "biodynamicOnly" BOOLEAN NOT NULL DEFAULT false,
    "allowPersonalization" BOOLEAN NOT NULL DEFAULT true,
    "shareDataForAnalytics" BOOLEAN NOT NULL DEFAULT true,
    "autoApplyFilters" BOOLEAN NOT NULL DEFAULT true,
    "autoApplySort" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personalization_scores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" TEXT NOT NULL,
    "relevanceScore" INTEGER NOT NULL,
    "affinityScore" INTEGER NOT NULL,
    "seasonalScore" INTEGER NOT NULL,
    "proximityScore" INTEGER NOT NULL,
    "popularityScore" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "season" "Season" NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personalization_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "RecommendationType" NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" TEXT NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL,
    "reasons" JSONB NOT NULL,
    "season" "Season",
    "source" VARCHAR(50),
    "shown" BOOLEAN NOT NULL DEFAULT false,
    "shownAt" TIMESTAMP(3),
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "clickedAt" TIMESTAMP(3),
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "convertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ab_tests" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "variants" JSONB NOT NULL,
    "trafficSplit" JSONB NOT NULL,
    "targetAudience" JSONB,
    "status" "ABTestStatus" NOT NULL DEFAULT 'DRAFT',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "results" JSONB,
    "winnerVariant" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ab_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ab_test_assignments" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" VARCHAR(100) NOT NULL,
    "variantId" VARCHAR(50) NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ab_test_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ab_test_events" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "variantId" VARCHAR(50) NOT NULL,
    "event" VARCHAR(100) NOT NULL,
    "value" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ab_test_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_search_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalSearches" INTEGER NOT NULL,
    "uniqueQueriesCount" INTEGER NOT NULL,
    "averageSessionDepth" DECIMAL(5,2) NOT NULL,
    "averageSearchesPerDay" DECIMAL(10,2) NOT NULL,
    "preferredSortBy" VARCHAR(50),
    "topCategories" JSONB NOT NULL,
    "favoriteFarms" JSONB NOT NULL,
    "seasonalPreferences" JSONB NOT NULL,
    "dietaryPatterns" JSONB,
    "priceRangeTendency" JSONB NOT NULL,
    "clickThroughRate" DECIMAL(5,4) NOT NULL,
    "conversionRate" DECIMAL(5,4) NOT NULL,
    "averageOrderValue" DECIMAL(10,2),
    "repeatPurchaseRate" DECIMAL(5,4),
    "peakSearchHours" JSONB NOT NULL,
    "peakSearchDays" JSONB NOT NULL,
    "lastSearchAt" TIMESTAMP(3),
    "firstSearchAt" TIMESTAMP(3),
    "savedSearchesCount" INTEGER NOT NULL DEFAULT 0,
    "activeAlertsCount" INTEGER NOT NULL DEFAULT 0,
    "sharedSearchesCount" INTEGER NOT NULL DEFAULT 0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "biodynamicEngagement" DECIMAL(5,4) NOT NULL,
    "seasonalAwareness" DECIMAL(5,4) NOT NULL,
    "localFarmSupport" DECIMAL(5,4) NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_search_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_metrics" (
    "id" TEXT NOT NULL,
    "metricName" VARCHAR(100) NOT NULL,
    "metricType" VARCHAR(50) NOT NULL,
    "period" "PeriodType" NOT NULL,
    "periodKey" VARCHAR(50) NOT NULL,
    "count" INTEGER NOT NULL,
    "sum" DECIMAL(15,2) NOT NULL,
    "average" DECIMAL(10,2) NOT NULL,
    "min" DECIMAL(10,2) NOT NULL,
    "max" DECIMAL(10,2) NOT NULL,
    "median" DECIMAL(10,2) NOT NULL,
    "p50" DECIMAL(10,2) NOT NULL,
    "p75" DECIMAL(10,2) NOT NULL,
    "p90" DECIMAL(10,2) NOT NULL,
    "p95" DECIMAL(10,2) NOT NULL,
    "p99" DECIMAL(10,2) NOT NULL,
    "stdDev" DECIMAL(10,4) NOT NULL,
    "context" JSONB,
    "cpuUsage" DECIMAL(5,2),
    "memoryUsage" DECIMAL(5,2),
    "gpuUsage" DECIMAL(5,2),
    "threadCount" INTEGER,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_trends" (
    "id" TEXT NOT NULL,
    "query" VARCHAR(500),
    "categoryId" TEXT,
    "farmId" TEXT,
    "season" "Season",
    "trendType" VARCHAR(50) NOT NULL,
    "currentVolume" INTEGER NOT NULL,
    "previousVolume" INTEGER NOT NULL,
    "growthRate" DECIMAL(10,4) NOT NULL,
    "volatility" DECIMAL(5,4) NOT NULL,
    "trendScore" DECIMAL(5,2) NOT NULL,
    "period" "PeriodType" NOT NULL,
    "periodKey" VARCHAR(50) NOT NULL,
    "comparisonPeriodKey" VARCHAR(50) NOT NULL,
    "forecast" JSONB,
    "seasonality" JSONB,
    "agriculturalFactors" JSONB,
    "biodynamicInfluence" DECIMAL(5,2),
    "rank" INTEGER,
    "previousRank" INTEGER,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_trends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_dashboards" (
    "id" TEXT NOT NULL,
    "dashboardType" VARCHAR(50) NOT NULL,
    "entityId" TEXT,
    "period" "PeriodType" NOT NULL,
    "periodKey" VARCHAR(50) NOT NULL,
    "metrics" JSONB NOT NULL,
    "kpis" JSONB NOT NULL,
    "timeSeriesData" JSONB,
    "distributionData" JSONB,
    "comparisonData" JSONB,
    "seasonalInsights" JSONB,
    "farmPerformance" JSONB,
    "productTrends" JSONB,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_dashboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ml_models" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "version" VARCHAR(20) NOT NULL,
    "type" "MLModelType" NOT NULL,
    "description" TEXT,
    "status" "MLModelStatus" NOT NULL DEFAULT 'TRAINING',
    "trainedAt" TIMESTAMP(3),
    "trainingJobId" TEXT,
    "accuracy" DECIMAL(5,4),
    "precision" DECIMAL(5,4),
    "recall" DECIMAL(5,4),
    "f1Score" DECIMAL(5,4),
    "hyperparameters" JSONB,
    "features" JSONB NOT NULL,
    "modelPath" VARCHAR(500),
    "modelSize" INTEGER,
    "inferenceTime" INTEGER,
    "predictionsCount" INTEGER NOT NULL DEFAULT 0,
    "successRate" DECIMAL(5,4),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ml_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ml_predictions" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "context" JSONB,
    "inferenceTime" INTEGER NOT NULL,
    "wasCorrect" BOOLEAN,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ml_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ml_training_jobs" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "status" "MLTrainingStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "datasetSize" INTEGER NOT NULL,
    "trainingSize" INTEGER NOT NULL,
    "validationSize" INTEGER NOT NULL,
    "testSize" INTEGER NOT NULL,
    "finalAccuracy" DECIMAL(5,4),
    "finalLoss" DECIMAL(10,6),
    "bestEpoch" INTEGER,
    "totalEpochs" INTEGER,
    "config" JSONB,
    "logs" JSONB,
    "error" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ml_training_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderConfirmation" BOOLEAN NOT NULL DEFAULT true,
    "orderStatusUpdates" BOOLEAN NOT NULL DEFAULT true,
    "shippingNotifications" BOOLEAN NOT NULL DEFAULT true,
    "deliveryReminders" BOOLEAN NOT NULL DEFAULT true,
    "farmUpdates" BOOLEAN NOT NULL DEFAULT true,
    "newProducts" BOOLEAN NOT NULL DEFAULT true,
    "promotions" BOOLEAN NOT NULL DEFAULT true,
    "seasonalNews" BOOLEAN NOT NULL DEFAULT true,
    "newsletter" BOOLEAN NOT NULL DEFAULT true,
    "productRecommendations" BOOLEAN NOT NULL DEFAULT true,
    "securityAlerts" BOOLEAN NOT NULL DEFAULT true,
    "accountUpdates" BOOLEAN NOT NULL DEFAULT true,
    "priceAlerts" BOOLEAN NOT NULL DEFAULT true,
    "inventoryAlerts" BOOLEAN NOT NULL DEFAULT true,
    "surveyRequests" BOOLEAN NOT NULL DEFAULT true,
    "unsubscribedAll" BOOLEAN NOT NULL DEFAULT false,
    "unsubscribedAt" TIMESTAMP(3),
    "unsubscribeToken" VARCHAR(64),
    "unsubscribeReason" VARCHAR(500),
    "unsubscribeFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(255),
    "recipient" VARCHAR(255) NOT NULL,
    "emailType" "EmailType" NOT NULL DEFAULT 'OTHER',
    "subject" VARCHAR(500) NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "jobId" VARCHAR(255),
    "queueName" VARCHAR(100),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationPreferences" JSONB,
    "theme" VARCHAR(20) NOT NULL DEFAULT 'light',
    "language" VARCHAR(10) NOT NULL DEFAULT 'en',
    "timezone" VARCHAR(100) NOT NULL DEFAULT 'UTC',
    "distanceUnit" VARCHAR(20) NOT NULL DEFAULT 'miles',
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "profileVisibility" VARCHAR(20) NOT NULL DEFAULT 'public',
    "showEmail" BOOLEAN NOT NULL DEFAULT false,
    "showPhone" BOOLEAN NOT NULL DEFAULT false,
    "allowMessaging" BOOLEAN NOT NULL DEFAULT true,
    "dataSharing" BOOLEAN NOT NULL DEFAULT false,
    "contactMethod" VARCHAR(20) NOT NULL DEFAULT 'email',
    "communicationFrequency" VARCHAR(20) NOT NULL DEFAULT 'normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences_v2" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailFrequency" VARCHAR(20) NOT NULL DEFAULT 'immediate',
    "emailQuietHoursStart" VARCHAR(5),
    "emailQuietHoursEnd" VARCHAR(5),
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "smsFrequency" VARCHAR(20) NOT NULL DEFAULT 'immediate',
    "smsQuietHoursStart" VARCHAR(5),
    "smsQuietHoursEnd" VARCHAR(5),
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushFrequency" VARCHAR(20) NOT NULL DEFAULT 'immediate',
    "pushQuietHoursStart" VARCHAR(5),
    "pushQuietHoursEnd" VARCHAR(5),
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppSound" BOOLEAN NOT NULL DEFAULT true,
    "inAppBadge" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_settings" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "deliveryAreas" JSONB,
    "deliveryFee" DOUBLE PRECISION,
    "minOrderValue" DOUBLE PRECISION,
    "acceptedPaymentMethods" TEXT[],
    "requireDepositOnOrders" BOOLEAN NOT NULL DEFAULT false,
    "depositPercentage" DOUBLE PRECISION,
    "returnPolicy" TEXT,
    "cancellationPolicy" TEXT,
    "termsAndConditions" TEXT,
    "enablePreOrders" BOOLEAN NOT NULL DEFAULT false,
    "enableSubscriptions" BOOLEAN NOT NULL DEFAULT false,
    "enableGiftCards" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farm_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_hours" (
    "id" TEXT NOT NULL,
    "farmSettingsId" TEXT NOT NULL,
    "dayOfWeek" SMALLINT NOT NULL,
    "openTime" VARCHAR(5) NOT NULL,
    "closeTime" VARCHAR(5) NOT NULL,
    "timezone" VARCHAR(100) NOT NULL DEFAULT 'UTC',
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "value" JSONB NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isEditable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "message" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "messageId" VARCHAR(255),
    "errorMessage" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_notification_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "status" VARCHAR(20) NOT NULL,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "platform" VARCHAR(20) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_threads" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "farmId" TEXT,
    "title" VARCHAR(255),
    "provider" "ChatProvider" NOT NULL DEFAULT 'OLLAMA',
    "model" VARCHAR(100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "tokens" INTEGER,
    "model" VARCHAR(100),
    "confidence" DOUBLE PRECISION,
    "citations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_summaries" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "keyTopics" JSONB,
    "keyEntities" JSONB,
    "userIntent" VARCHAR(500),
    "messagesCovered" INTEGER NOT NULL DEFAULT 0,
    "tokensCondensed" INTEGER,
    "summaryTokens" INTEGER,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "chat_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_eventId_key" ON "webhook_events"("eventId");

-- CreateIndex
CREATE INDEX "webhook_events_eventId_idx" ON "webhook_events"("eventId");

-- CreateIndex
CREATE INDEX "webhook_events_provider_idx" ON "webhook_events"("provider");

-- CreateIndex
CREATE INDEX "webhook_events_processed_idx" ON "webhook_events"("processed");

-- CreateIndex
CREATE INDEX "webhook_events_attempts_idx" ON "webhook_events"("attempts");

-- CreateIndex
CREATE INDEX "webhook_events_createdAt_idx" ON "webhook_events"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "saved_searches_shareToken_key" ON "saved_searches"("shareToken");

-- CreateIndex
CREATE INDEX "saved_searches_userId_idx" ON "saved_searches"("userId");

-- CreateIndex
CREATE INDEX "saved_searches_shareToken_idx" ON "saved_searches"("shareToken");

-- CreateIndex
CREATE INDEX "saved_searches_createdAt_idx" ON "saved_searches"("createdAt");

-- CreateIndex
CREATE INDEX "saved_searches_lastExecutedAt_idx" ON "saved_searches"("lastExecutedAt");

-- CreateIndex
CREATE INDEX "saved_search_folders_userId_idx" ON "saved_search_folders"("userId");

-- CreateIndex
CREATE INDEX "saved_search_shares_savedSearchId_idx" ON "saved_search_shares"("savedSearchId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_search_shares_savedSearchId_sharedWithEmail_key" ON "saved_search_shares"("savedSearchId", "sharedWithEmail");

-- CreateIndex
CREATE INDEX "search_alerts_savedSearchId_idx" ON "search_alerts"("savedSearchId");

-- CreateIndex
CREATE INDEX "search_alerts_userId_idx" ON "search_alerts"("userId");

-- CreateIndex
CREATE INDEX "search_alerts_isActive_idx" ON "search_alerts"("isActive");

-- CreateIndex
CREATE INDEX "search_events_userId_idx" ON "search_events"("userId");

-- CreateIndex
CREATE INDEX "search_events_sessionId_idx" ON "search_events"("sessionId");

-- CreateIndex
CREATE INDEX "search_events_timestamp_idx" ON "search_events"("timestamp");

-- CreateIndex
CREATE INDEX "search_events_query_idx" ON "search_events"("query");

-- CreateIndex
CREATE INDEX "search_events_userId_sessionId_query_createdAt_idx" ON "search_events"("userId", "sessionId", "query", "createdAt");

-- CreateIndex
CREATE INDEX "user_interactions_userId_idx" ON "user_interactions"("userId");

-- CreateIndex
CREATE INDEX "user_interactions_sessionId_idx" ON "user_interactions"("sessionId");

-- CreateIndex
CREATE INDEX "user_interactions_entityType_entityId_idx" ON "user_interactions"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "user_interactions_type_idx" ON "user_interactions"("type");

-- CreateIndex
CREATE INDEX "user_interactions_timestamp_idx" ON "user_interactions"("timestamp");

-- CreateIndex
CREATE INDEX "user_interactions_userId_sessionId_type_entityType_entityId_idx" ON "user_interactions"("userId", "sessionId", "type", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "search_analytics_periodType_periodStart_idx" ON "search_analytics"("periodType", "periodStart");

-- CreateIndex
CREATE INDEX "search_analytics_query_idx" ON "search_analytics"("query");

-- CreateIndex
CREATE INDEX "search_analytics_categoryId_idx" ON "search_analytics"("categoryId");

-- CreateIndex
CREATE INDEX "search_analytics_farmId_idx" ON "search_analytics"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "search_analytics_periodType_periodStart_key" ON "search_analytics"("periodType", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "search_analytics_query_categoryId_farmId_season_period_peri_key" ON "search_analytics"("query", "categoryId", "farmId", "season", "period", "periodKey");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_preferences_userId_idx" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "personalization_scores_userId_idx" ON "personalization_scores"("userId");

-- CreateIndex
CREATE INDEX "personalization_scores_entityType_entityId_idx" ON "personalization_scores"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "personalization_scores_totalScore_idx" ON "personalization_scores"("totalScore");

-- CreateIndex
CREATE INDEX "personalization_scores_expiresAt_idx" ON "personalization_scores"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "personalization_scores_userId_entityType_entityId_season_key" ON "personalization_scores"("userId", "entityType", "entityId", "season");

-- CreateIndex
CREATE INDEX "recommendations_userId_idx" ON "recommendations"("userId");

-- CreateIndex
CREATE INDEX "recommendations_type_idx" ON "recommendations"("type");

-- CreateIndex
CREATE INDEX "recommendations_entityType_entityId_idx" ON "recommendations"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "recommendations_shown_clicked_converted_idx" ON "recommendations"("shown", "clicked", "converted");

-- CreateIndex
CREATE INDEX "recommendations_expiresAt_idx" ON "recommendations"("expiresAt");

-- CreateIndex
CREATE INDEX "ab_tests_status_idx" ON "ab_tests"("status");

-- CreateIndex
CREATE INDEX "ab_tests_startedAt_endedAt_idx" ON "ab_tests"("startedAt", "endedAt");

-- CreateIndex
CREATE INDEX "ab_test_assignments_testId_idx" ON "ab_test_assignments"("testId");

-- CreateIndex
CREATE INDEX "ab_test_assignments_userId_idx" ON "ab_test_assignments"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ab_test_assignments_testId_userId_key" ON "ab_test_assignments"("testId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ab_test_assignments_testId_sessionId_key" ON "ab_test_assignments"("testId", "sessionId");

-- CreateIndex
CREATE INDEX "ab_test_events_testId_idx" ON "ab_test_events"("testId");

-- CreateIndex
CREATE INDEX "ab_test_events_userId_idx" ON "ab_test_events"("userId");

-- CreateIndex
CREATE INDEX "ab_test_events_variantId_idx" ON "ab_test_events"("variantId");

-- CreateIndex
CREATE INDEX "ab_test_events_event_idx" ON "ab_test_events"("event");

-- CreateIndex
CREATE INDEX "ab_test_events_timestamp_idx" ON "ab_test_events"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "user_search_profiles_userId_key" ON "user_search_profiles"("userId");

-- CreateIndex
CREATE INDEX "user_search_profiles_userId_idx" ON "user_search_profiles"("userId");

-- CreateIndex
CREATE INDEX "user_search_profiles_calculatedAt_idx" ON "user_search_profiles"("calculatedAt");

-- CreateIndex
CREATE INDEX "performance_metrics_metricName_metricType_idx" ON "performance_metrics"("metricName", "metricType");

-- CreateIndex
CREATE INDEX "performance_metrics_period_periodKey_idx" ON "performance_metrics"("period", "periodKey");

-- CreateIndex
CREATE INDEX "performance_metrics_calculatedAt_idx" ON "performance_metrics"("calculatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "performance_metrics_metricName_metricType_period_periodKey_key" ON "performance_metrics"("metricName", "metricType", "period", "periodKey");

-- CreateIndex
CREATE INDEX "search_trends_trendType_idx" ON "search_trends"("trendType");

-- CreateIndex
CREATE INDEX "search_trends_period_periodKey_idx" ON "search_trends"("period", "periodKey");

-- CreateIndex
CREATE INDEX "search_trends_rank_idx" ON "search_trends"("rank");

-- CreateIndex
CREATE INDEX "search_trends_expiresAt_idx" ON "search_trends"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "search_trends_query_categoryId_farmId_season_period_periodK_key" ON "search_trends"("query", "categoryId", "farmId", "season", "period", "periodKey");

-- CreateIndex
CREATE INDEX "analytics_dashboards_dashboardType_idx" ON "analytics_dashboards"("dashboardType");

-- CreateIndex
CREATE INDEX "analytics_dashboards_period_periodKey_idx" ON "analytics_dashboards"("period", "periodKey");

-- CreateIndex
CREATE INDEX "analytics_dashboards_expiresAt_idx" ON "analytics_dashboards"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_dashboards_dashboardType_entityId_period_periodKe_key" ON "analytics_dashboards"("dashboardType", "entityId", "period", "periodKey");

-- CreateIndex
CREATE UNIQUE INDEX "ml_models_name_key" ON "ml_models"("name");

-- CreateIndex
CREATE INDEX "ml_models_type_idx" ON "ml_models"("type");

-- CreateIndex
CREATE INDEX "ml_models_status_idx" ON "ml_models"("status");

-- CreateIndex
CREATE INDEX "ml_models_trainedAt_idx" ON "ml_models"("trainedAt");

-- CreateIndex
CREATE INDEX "ml_predictions_modelId_idx" ON "ml_predictions"("modelId");

-- CreateIndex
CREATE INDEX "ml_predictions_userId_idx" ON "ml_predictions"("userId");

-- CreateIndex
CREATE INDEX "ml_predictions_createdAt_idx" ON "ml_predictions"("createdAt");

-- CreateIndex
CREATE INDEX "ml_training_jobs_modelId_idx" ON "ml_training_jobs"("modelId");

-- CreateIndex
CREATE INDEX "ml_training_jobs_status_idx" ON "ml_training_jobs"("status");

-- CreateIndex
CREATE INDEX "ml_training_jobs_createdAt_idx" ON "ml_training_jobs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "email_preferences_userId_key" ON "email_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "email_preferences_unsubscribeToken_key" ON "email_preferences"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "email_preferences_userId_idx" ON "email_preferences"("userId");

-- CreateIndex
CREATE INDEX "email_preferences_unsubscribeToken_idx" ON "email_preferences"("unsubscribeToken");

-- CreateIndex
CREATE UNIQUE INDEX "email_logs_jobId_key" ON "email_logs"("jobId");

-- CreateIndex
CREATE INDEX "email_logs_userId_idx" ON "email_logs"("userId");

-- CreateIndex
CREATE INDEX "email_logs_recipient_idx" ON "email_logs"("recipient");

-- CreateIndex
CREATE INDEX "email_logs_emailType_idx" ON "email_logs"("emailType");

-- CreateIndex
CREATE INDEX "email_logs_status_idx" ON "email_logs"("status");

-- CreateIndex
CREATE INDEX "email_logs_sentAt_idx" ON "email_logs"("sentAt");

-- CreateIndex
CREATE INDEX "email_logs_jobId_idx" ON "email_logs"("jobId");

-- CreateIndex
CREATE INDEX "email_logs_createdAt_idx" ON "email_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");

-- CreateIndex
CREATE INDEX "user_settings_userId_idx" ON "user_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_v2_userId_key" ON "notification_preferences_v2"("userId");

-- CreateIndex
CREATE INDEX "notification_preferences_v2_userId_idx" ON "notification_preferences_v2"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "farm_settings_farmId_key" ON "farm_settings"("farmId");

-- CreateIndex
CREATE INDEX "farm_settings_farmId_idx" ON "farm_settings"("farmId");

-- CreateIndex
CREATE INDEX "business_hours_farmSettingsId_idx" ON "business_hours"("farmSettingsId");

-- CreateIndex
CREATE INDEX "business_hours_dayOfWeek_idx" ON "business_hours"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "business_hours_farmSettingsId_dayOfWeek_key" ON "business_hours"("farmSettingsId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "system_settings_category_idx" ON "system_settings"("category");

-- CreateIndex
CREATE INDEX "system_settings_isPublic_idx" ON "system_settings"("isPublic");

-- CreateIndex
CREATE INDEX "system_settings_key_idx" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "sms_logs_userId_idx" ON "sms_logs"("userId");

-- CreateIndex
CREATE INDEX "sms_logs_status_idx" ON "sms_logs"("status");

-- CreateIndex
CREATE INDEX "sms_logs_createdAt_idx" ON "sms_logs"("createdAt");

-- CreateIndex
CREATE INDEX "sms_logs_phoneNumber_idx" ON "sms_logs"("phoneNumber");

-- CreateIndex
CREATE INDEX "push_notification_logs_userId_idx" ON "push_notification_logs"("userId");

-- CreateIndex
CREATE INDEX "push_notification_logs_notificationId_idx" ON "push_notification_logs"("notificationId");

-- CreateIndex
CREATE INDEX "push_notification_logs_status_idx" ON "push_notification_logs"("status");

-- CreateIndex
CREATE INDEX "push_notification_logs_createdAt_idx" ON "push_notification_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");

-- CreateIndex
CREATE INDEX "device_tokens_userId_idx" ON "device_tokens"("userId");

-- CreateIndex
CREATE INDEX "device_tokens_platform_idx" ON "device_tokens"("platform");

-- CreateIndex
CREATE INDEX "device_tokens_isActive_idx" ON "device_tokens"("isActive");

-- CreateIndex
CREATE INDEX "device_tokens_token_idx" ON "device_tokens"("token");

-- CreateIndex
CREATE INDEX "chat_threads_userId_idx" ON "chat_threads"("userId");

-- CreateIndex
CREATE INDEX "chat_threads_farmId_idx" ON "chat_threads"("farmId");

-- CreateIndex
CREATE INDEX "chat_threads_provider_idx" ON "chat_threads"("provider");

-- CreateIndex
CREATE INDEX "chat_threads_isActive_idx" ON "chat_threads"("isActive");

-- CreateIndex
CREATE INDEX "chat_threads_lastActivityAt_idx" ON "chat_threads"("lastActivityAt");

-- CreateIndex
CREATE INDEX "chat_threads_createdAt_idx" ON "chat_threads"("createdAt");

-- CreateIndex
CREATE INDEX "chat_messages_threadId_idx" ON "chat_messages"("threadId");

-- CreateIndex
CREATE INDEX "chat_messages_role_idx" ON "chat_messages"("role");

-- CreateIndex
CREATE INDEX "chat_messages_createdAt_idx" ON "chat_messages"("createdAt");

-- CreateIndex
CREATE INDEX "chat_summaries_threadId_idx" ON "chat_summaries"("threadId");

-- CreateIndex
CREATE INDEX "chat_summaries_createdAt_idx" ON "chat_summaries"("createdAt");

-- CreateIndex
CREATE INDEX "chat_summaries_expiresAt_idx" ON "chat_summaries"("expiresAt");

-- AddForeignKey
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "saved_search_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_search_folders" ADD CONSTRAINT "saved_search_folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_search_shares" ADD CONSTRAINT "saved_search_shares_savedSearchId_fkey" FOREIGN KEY ("savedSearchId") REFERENCES "saved_searches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_alerts" ADD CONSTRAINT "search_alerts_savedSearchId_fkey" FOREIGN KEY ("savedSearchId") REFERENCES "saved_searches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ab_test_assignments" ADD CONSTRAINT "ab_test_assignments_testId_fkey" FOREIGN KEY ("testId") REFERENCES "ab_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ml_predictions" ADD CONSTRAINT "ml_predictions_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ml_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ml_training_jobs" ADD CONSTRAINT "ml_training_jobs_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ml_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_preferences" ADD CONSTRAINT "email_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences_v2" ADD CONSTRAINT "notification_preferences_v2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_settings" ADD CONSTRAINT "farm_settings_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_farmSettingsId_fkey" FOREIGN KEY ("farmSettingsId") REFERENCES "farm_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_logs" ADD CONSTRAINT "sms_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_notification_logs" ADD CONSTRAINT "push_notification_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "chat_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_summaries" ADD CONSTRAINT "chat_summaries_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "chat_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
