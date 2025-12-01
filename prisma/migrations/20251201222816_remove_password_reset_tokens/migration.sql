-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "team_id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "lastInitial" DROP NOT NULL;
