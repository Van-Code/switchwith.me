-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('HAVE', 'WANT');

-- AlterTable: Add listingType column with default HAVE
ALTER TABLE "Listing" ADD COLUMN "listingType" "ListingType" NOT NULL DEFAULT 'HAVE';

-- AlterTable: Drop faceValue column
ALTER TABLE "Listing" DROP COLUMN "faceValue";
