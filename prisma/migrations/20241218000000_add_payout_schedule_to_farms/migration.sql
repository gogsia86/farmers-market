-- AlterTable
ALTER TABLE "farms" ADD COLUMN IF NOT EXISTS "payoutSchedule" JSONB;
