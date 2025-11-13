-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paymentIntentId" VARCHAR(255),
ADD COLUMN     "shippingService" VARCHAR(100);
