-- CreateTable
CREATE TABLE "teams" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_url" TEXT,
    "primary_color" TEXT,
    "secondary_color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teams_slug_key" ON "teams"("slug");

-- Insert initial teams
INSERT INTO "teams" (name, slug) VALUES
('Bay FC', 'bayfc'),
('Seattle Valkyries', 'valkyries');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "team_id" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "Listing_team_id_idx" ON "Listing"("team_id");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
