-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "flexible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priceCents" INTEGER,
ADD COLUMN     "seatCount" INTEGER;
