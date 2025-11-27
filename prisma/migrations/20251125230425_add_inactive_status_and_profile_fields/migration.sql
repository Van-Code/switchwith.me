-- AlterEnum
ALTER TYPE "ListingStatus" ADD VALUE 'INACTIVE';

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "favoritePlayer" TEXT;
