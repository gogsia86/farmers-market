/*
  Warnings:

  - You are about to drop the column `approvedById` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `suspendedById` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `suspensionDuration` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "public";

-- CreateEnum
CREATE TYPE "FarmVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AdminActionType" AS ENUM ('USER_APPROVED', 'USER_SUSPENDED', 'USER_DELETED', 'USER_REACTIVATED', 'USER_ACTIVATED', 'USER_PROMOTED_ADMIN', 'USER_DEMOTED_ADMIN', 'USER_PASSWORD_RESET', 'FARM_VERIFIED', 'FARM_REJECTED', 'FARM_SUSPENDED', 'ORDER_REFUNDED', 'PRODUCT_REMOVED', 'SETTING_CHANGED', 'ANNOUNCEMENT_CREATED');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('SPRING', 'SUMMER', 'FALL', 'WINTER');

-- CreateEnum
CREATE TYPE "GrowthPhase" AS ENUM ('PREPARING', 'SEEDING', 'SPROUTING', 'GROWING', 'FLOWERING', 'RIPENING', 'HARVESTING', 'RESTING');

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_performedById_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_suspendedById_fkey";

-- AlterTable
ALTER TABLE "farms" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "verificationStatus" "FarmVerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "approvedById",
DROP COLUMN "suspendedById",
DROP COLUMN "suspensionDuration",
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "suspendedBy" TEXT;

-- DropTable
DROP TABLE "audit_logs";

-- CreateTable
CREATE TABLE "admin_actions" (
    "id" TEXT NOT NULL,
    "type" "AdminActionType" NOT NULL,
    "adminId" TEXT NOT NULL,
    "targetId" TEXT,
    "targetType" VARCHAR(50),
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasonal_cycles" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "season" "Season" NOT NULL,
    "phase" "GrowthPhase" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "lunarPhase" VARCHAR(50),
    "soilConditions" JSONB,
    "energyLevel" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seasonal_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_actions_adminId_idx" ON "admin_actions"("adminId");

-- CreateIndex
CREATE INDEX "admin_actions_type_idx" ON "admin_actions"("type");

-- CreateIndex
CREATE INDEX "admin_actions_createdAt_idx" ON "admin_actions"("createdAt");

-- CreateIndex
CREATE INDEX "admin_actions_targetId_targetType_idx" ON "admin_actions"("targetId", "targetType");

-- CreateIndex
CREATE INDEX "seasonal_cycles_productId_idx" ON "seasonal_cycles"("productId");

-- CreateIndex
CREATE INDEX "seasonal_cycles_season_idx" ON "seasonal_cycles"("season");

-- CreateIndex
CREATE INDEX "seasonal_cycles_phase_idx" ON "seasonal_cycles"("phase");

-- CreateIndex
CREATE INDEX "seasonal_cycles_startDate_endDate_idx" ON "seasonal_cycles"("startDate", "endDate");

-- AddForeignKey
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seasonal_cycles" ADD CONSTRAINT "seasonal_cycles_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
