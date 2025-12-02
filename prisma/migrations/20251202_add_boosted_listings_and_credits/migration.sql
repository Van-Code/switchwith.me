-- Add credits to User model
ALTER TABLE "User" ADD COLUMN "credits" INTEGER NOT NULL DEFAULT 5;

-- Add boosted fields to Listing model
ALTER TABLE "Listing" ADD COLUMN "boosted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Listing" ADD COLUMN "boostedAt" TIMESTAMP(3);

-- Create CreditTransaction table
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- Create indexes for CreditTransaction
CREATE INDEX "CreditTransaction_userId_createdAt_idx" ON "CreditTransaction"("userId", "createdAt");

-- Add foreign key constraint
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
