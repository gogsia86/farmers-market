-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PERMISSION_CHANGE', 'STATUS_CHANGE', 'APPROVE', 'REJECT', 'SUSPEND', 'RESTORE');

-- AlterTable
ALTER TABLE "farms" ADD COLUMN     "payoutSchedule" JSONB;

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "farmId" TEXT,
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailOrders" BOOLEAN NOT NULL DEFAULT true,
    "emailReviews" BOOLEAN NOT NULL DEFAULT true,
    "emailPromotions" BOOLEAN NOT NULL DEFAULT false,
    "emailNewsletter" BOOLEAN NOT NULL DEFAULT false,
    "inAppOrders" BOOLEAN NOT NULL DEFAULT true,
    "inAppReviews" BOOLEAN NOT NULL DEFAULT true,
    "inAppMessages" BOOLEAN NOT NULL DEFAULT true,
    "pushOrders" BOOLEAN NOT NULL DEFAULT true,
    "pushReviews" BOOLEAN NOT NULL DEFAULT true,
    "pushPromotions" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "download_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "resourceId" VARCHAR(255) NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "download_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" VARCHAR(100) NOT NULL,
    "entityId" VARCHAR(255) NOT NULL,
    "changes" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring_reports" (
    "id" TEXT NOT NULL,
    "report_id" VARCHAR(255) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "total_runs" INTEGER NOT NULL DEFAULT 0,
    "successful_runs" INTEGER NOT NULL DEFAULT 0,
    "failed_runs" INTEGER NOT NULL DEFAULT 0,
    "total_duration_ms" INTEGER NOT NULL DEFAULT 0,
    "avg_duration_ms" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "success_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "report_type" TEXT NOT NULL DEFAULT 'PERIODIC',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "notified_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monitoring_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_executions" (
    "id" TEXT NOT NULL,
    "run_id" VARCHAR(255) NOT NULL,
    "workflow_name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "duration_ms" INTEGER,
    "tests_passed" INTEGER NOT NULL DEFAULT 0,
    "tests_failed" INTEGER NOT NULL DEFAULT 0,
    "tests_total" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "error_stack" TEXT,
    "triggered_by" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "environment" TEXT NOT NULL DEFAULT 'production',
    "metadata" JSONB,
    "report_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_metrics" (
    "id" TEXT NOT NULL,
    "workflow_id" VARCHAR(255) NOT NULL,
    "metric_name" TEXT NOT NULL,
    "metric_value" DOUBLE PRECISION NOT NULL,
    "metric_unit" TEXT,
    "threshold_value" DOUBLE PRECISION,
    "is_within_threshold" BOOLEAN NOT NULL DEFAULT true,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" JSONB,
    "metadata" JSONB,
    "execution_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_health_checks" (
    "id" TEXT NOT NULL,
    "check_id" TEXT NOT NULL,
    "check_name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "response_time_ms" INTEGER NOT NULL,
    "details" JSONB,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endpoint" TEXT,
    "expected_status" INTEGER,
    "actual_status" INTEGER,
    "error_message" TEXT,
    "metadata" JSONB,
    "execution_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_health_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL,
    "log_id" VARCHAR(255) NOT NULL,
    "channel" TEXT NOT NULL,
    "notification_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recipient" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivery_status" TEXT,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "execution_id" TEXT,
    "report_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_schedules" (
    "id" TEXT NOT NULL,
    "schedule_id" VARCHAR(255) NOT NULL,
    "workflow_name" TEXT NOT NULL,
    "cron_expression" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_run_at" TIMESTAMP(3),
    "next_run_at" TIMESTAMP(3),
    "run_count" INTEGER NOT NULL DEFAULT 0,
    "failure_count" INTEGER NOT NULL DEFAULT 0,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "tags" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favorites_userId_idx" ON "favorites"("userId");

-- CreateIndex
CREATE INDEX "favorites_farmId_idx" ON "favorites"("farmId");

-- CreateIndex
CREATE INDEX "favorites_productId_idx" ON "favorites"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_farmId_key" ON "favorites"("userId", "farmId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_productId_key" ON "favorites"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- CreateIndex
CREATE INDEX "notification_preferences_userId_idx" ON "notification_preferences"("userId");

-- CreateIndex
CREATE INDEX "download_logs_userId_idx" ON "download_logs"("userId");

-- CreateIndex
CREATE INDEX "download_logs_resourceId_idx" ON "download_logs"("resourceId");

-- CreateIndex
CREATE INDEX "download_logs_createdAt_idx" ON "download_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "monitoring_reports_report_id_key" ON "monitoring_reports"("report_id");

-- CreateIndex
CREATE INDEX "monitoring_reports_report_id_idx" ON "monitoring_reports"("report_id");

-- CreateIndex
CREATE INDEX "monitoring_reports_status_idx" ON "monitoring_reports"("status");

-- CreateIndex
CREATE INDEX "monitoring_reports_generated_at_idx" ON "monitoring_reports"("generated_at");

-- CreateIndex
CREATE INDEX "monitoring_reports_start_time_idx" ON "monitoring_reports"("start_time");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_executions_run_id_key" ON "workflow_executions"("run_id");

-- CreateIndex
CREATE INDEX "workflow_executions_run_id_idx" ON "workflow_executions"("run_id");

-- CreateIndex
CREATE INDEX "workflow_executions_workflow_name_idx" ON "workflow_executions"("workflow_name");

-- CreateIndex
CREATE INDEX "workflow_executions_status_idx" ON "workflow_executions"("status");

-- CreateIndex
CREATE INDEX "workflow_executions_started_at_idx" ON "workflow_executions"("started_at");

-- CreateIndex
CREATE INDEX "workflow_executions_report_id_idx" ON "workflow_executions"("report_id");

-- CreateIndex
CREATE INDEX "workflow_metrics_workflow_id_idx" ON "workflow_metrics"("workflow_id");

-- CreateIndex
CREATE INDEX "workflow_metrics_metric_name_idx" ON "workflow_metrics"("metric_name");

-- CreateIndex
CREATE INDEX "workflow_metrics_recorded_at_idx" ON "workflow_metrics"("recorded_at");

-- CreateIndex
CREATE INDEX "workflow_metrics_execution_id_idx" ON "workflow_metrics"("execution_id");

-- CreateIndex
CREATE INDEX "workflow_metrics_is_within_threshold_idx" ON "workflow_metrics"("is_within_threshold");

-- CreateIndex
CREATE UNIQUE INDEX "system_health_checks_check_id_key" ON "system_health_checks"("check_id");

-- CreateIndex
CREATE INDEX "system_health_checks_check_id_idx" ON "system_health_checks"("check_id");

-- CreateIndex
CREATE INDEX "system_health_checks_check_name_idx" ON "system_health_checks"("check_name");

-- CreateIndex
CREATE INDEX "system_health_checks_status_idx" ON "system_health_checks"("status");

-- CreateIndex
CREATE INDEX "system_health_checks_checked_at_idx" ON "system_health_checks"("checked_at");

-- CreateIndex
CREATE INDEX "system_health_checks_execution_id_idx" ON "system_health_checks"("execution_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_logs_log_id_key" ON "notification_logs"("log_id");

-- CreateIndex
CREATE INDEX "notification_logs_log_id_idx" ON "notification_logs"("log_id");

-- CreateIndex
CREATE INDEX "notification_logs_channel_idx" ON "notification_logs"("channel");

-- CreateIndex
CREATE INDEX "notification_logs_status_idx" ON "notification_logs"("status");

-- CreateIndex
CREATE INDEX "notification_logs_sent_at_idx" ON "notification_logs"("sent_at");

-- CreateIndex
CREATE INDEX "notification_logs_execution_id_idx" ON "notification_logs"("execution_id");

-- CreateIndex
CREATE INDEX "notification_logs_report_id_idx" ON "notification_logs"("report_id");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_schedules_schedule_id_key" ON "workflow_schedules"("schedule_id");

-- CreateIndex
CREATE INDEX "workflow_schedules_schedule_id_idx" ON "workflow_schedules"("schedule_id");

-- CreateIndex
CREATE INDEX "workflow_schedules_workflow_name_idx" ON "workflow_schedules"("workflow_name");

-- CreateIndex
CREATE INDEX "workflow_schedules_enabled_idx" ON "workflow_schedules"("enabled");

-- CreateIndex
CREATE INDEX "workflow_schedules_next_run_at_idx" ON "workflow_schedules"("next_run_at");

-- CreateIndex
CREATE INDEX "farms_status_verificationStatus_idx" ON "farms"("status", "verificationStatus");

-- CreateIndex
CREATE INDEX "farms_verificationStatus_idx" ON "farms"("verificationStatus");

-- CreateIndex
CREATE INDEX "farms_stripeOnboarded_idx" ON "farms"("stripeOnboarded");

-- CreateIndex
CREATE INDEX "farms_averageRating_idx" ON "farms"("averageRating");

-- CreateIndex
CREATE INDEX "farms_totalRevenueUSD_idx" ON "farms"("totalRevenueUSD");

-- CreateIndex
CREATE INDEX "orders_farmId_createdAt_idx" ON "orders"("farmId", "createdAt");

-- CreateIndex
CREATE INDEX "orders_customerId_createdAt_idx" ON "orders"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "orders_status_createdAt_idx" ON "orders"("status", "createdAt");

-- CreateIndex
CREATE INDEX "orders_status_farmId_idx" ON "orders"("status", "farmId");

-- CreateIndex
CREATE INDEX "orders_status_customerId_idx" ON "orders"("status", "customerId");

-- CreateIndex
CREATE INDEX "orders_paymentStatus_status_idx" ON "orders"("paymentStatus", "status");

-- CreateIndex
CREATE INDEX "orders_scheduledDate_idx" ON "orders"("scheduledDate");

-- CreateIndex
CREATE INDEX "products_farmId_inStock_idx" ON "products"("farmId", "inStock");

-- CreateIndex
CREATE INDEX "products_status_category_idx" ON "products"("status", "category");

-- CreateIndex
CREATE INDEX "products_farmId_status_idx" ON "products"("farmId", "status");

-- CreateIndex
CREATE INDEX "products_featured_status_idx" ON "products"("featured", "status");

-- CreateIndex
CREATE INDEX "products_seasonal_status_idx" ON "products"("seasonal", "status");

-- CreateIndex
CREATE INDEX "products_price_idx" ON "products"("price");

-- CreateIndex
CREATE INDEX "products_averageRating_idx" ON "products"("averageRating");

-- CreateIndex
CREATE INDEX "products_farmId_category_inStock_idx" ON "products"("farmId", "category", "inStock");

-- CreateIndex
CREATE INDEX "products_quantityAvailable_idx" ON "products"("quantityAvailable");

-- CreateIndex
CREATE INDEX "reviews_productId_createdAt_idx" ON "reviews"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "reviews_farmId_rating_idx" ON "reviews"("farmId", "rating");

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "download_logs" ADD CONSTRAINT "download_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "monitoring_reports"("report_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_metrics" ADD CONSTRAINT "workflow_metrics_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "workflow_executions"("run_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_health_checks" ADD CONSTRAINT "system_health_checks_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "workflow_executions"("run_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "workflow_executions"("run_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "monitoring_reports"("report_id") ON DELETE SET NULL ON UPDATE CASCADE;
