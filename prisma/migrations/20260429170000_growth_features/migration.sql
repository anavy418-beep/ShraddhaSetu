-- CreateEnum
CREATE TYPE "PanditSubscriptionPlan" AS ENUM ('BASIC', 'PREMIUM', 'FEATURED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('pending', 'active', 'expired', 'rejected');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'partial';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "amountPaid" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PanditProfile" ADD COLUMN     "subscriptionApprovedAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionApprovedById" TEXT,
ADD COLUMN     "subscriptionExpiresAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionPlan" "PanditSubscriptionPlan" NOT NULL DEFAULT 'BASIC',
ADD COLUMN     "subscriptionSelectedAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "gatewaySignature" TEXT,
ADD COLUMN     "method" TEXT,
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "ShopOrder" ADD COLUMN     "amountPaid" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "serviceSlug" TEXT,
    "citySlug" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- AddForeignKey
ALTER TABLE "PanditProfile" ADD CONSTRAINT "PanditProfile_subscriptionApprovedById_fkey" FOREIGN KEY ("subscriptionApprovedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
