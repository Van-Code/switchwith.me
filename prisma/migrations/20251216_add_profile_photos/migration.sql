-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PhotoReportReason" AS ENUM ('CONTACT_INFO', 'INAPPROPRIATE', 'HARASSMENT', 'OTHER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "ProfilePhoto" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfilePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoReport" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedUserId" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "reason" "PhotoReportReason" NOT NULL,
    "details" VARCHAR(300),
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhotoReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfilePhoto_userId_idx" ON "ProfilePhoto"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfilePhoto_userId_order_key" ON "ProfilePhoto"("userId", "order");

-- CreateIndex
CREATE INDEX "PhotoReport_reportedUserId_idx" ON "PhotoReport"("reportedUserId");

-- CreateIndex
CREATE INDEX "PhotoReport_reporterId_idx" ON "PhotoReport"("reporterId");

-- CreateIndex
CREATE INDEX "PhotoReport_resolved_idx" ON "PhotoReport"("resolved");

-- CreateIndex
CREATE INDEX "PhotoReport_photoId_idx" ON "PhotoReport"("photoId");

-- AddForeignKey
ALTER TABLE "ProfilePhoto" ADD CONSTRAINT "ProfilePhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoReport" ADD CONSTRAINT "PhotoReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoReport" ADD CONSTRAINT "PhotoReport_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoReport" ADD CONSTRAINT "PhotoReport_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "ProfilePhoto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
