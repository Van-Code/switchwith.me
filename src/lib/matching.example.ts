/**
 * EXAMPLE: Match Generation with Notifications
 *
 * This file shows how to integrate notifications into your match generation logic.
 * Copy the relevant parts into your existing matching code.
 */

import { prisma } from "@/lib/db";
import { createMatchNotification } from "@/lib/notifications";

/**
 * Example: Find matches for a user's listing
 *
 * This function demonstrates how to create notifications when matches are found.
 * Adjust the matching logic to fit your actual algorithm.
 */
export async function findMatchesForListing(listingId: string) {
  try {
    // 1. Get the listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    // 2. Find potential matches
    // This is pseudo-code - adjust to your actual matching algorithm
    const potentialMatches = await prisma.listing.findMany({
      where: {
        // Example matching criteria:
        // - User wants what we have
        // - User has what we want
        // - Not the same user
        userId: {
          not: listing.userId,
        },
        // Add your actual matching criteria here
        // For example:
        // wantedSection: listing.currentSection,
        // currentSection: listing.wantedSection,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 3. For each match, create a notification
    for (const matchedListing of potentialMatches) {
      // Calculate a match score if you have a scoring algorithm
      const matchScore = calculateMatchScore(listing, matchedListing);

      // Create notification for the listing owner
      await createMatchNotification({
        userId: listing.userId,
        listingId: listing.id,
        matchedListingId: matchedListing.id,
        matchScore,
        description: `Great news! ${matchedListing.user.name || "Someone"} has what you're looking for.`,
      }).catch((error) => {
        console.error("Failed to create match notification:", error);
      });

      // Optionally: Create notification for the matched user too
      await createMatchNotification({
        userId: matchedListing.userId,
        listingId: matchedListing.id,
        matchedListingId: listing.id,
        matchScore,
        description: `Great news! ${listing.user.name || "Someone"} has what you're looking for.`,
      }).catch((error) => {
        console.error("Failed to create match notification:", error);
      });
    }

    return potentialMatches;
  } catch (error) {
    console.error("Error finding matches:", error);
    throw error;
  }
}

/**
 * Example match scoring function
 * Adjust to your actual algorithm
 */
function calculateMatchScore(listing1: any, listing2: any): number {
  // Implement your match scoring logic here
  // For example, based on section proximity, date preferences, etc.
  let score = 0;

  // Example: Perfect match gets 100 points
  if (
    listing1.wantedSection === listing2.currentSection &&
    listing2.wantedSection === listing1.currentSection
  ) {
    score = 100;
  }

  return score;
}

/**
 * ALTERNATIVE: If you have a cron job or scheduled task
 * that periodically generates matches for all users
 */
export async function generateAllMatches() {
  // Get all active listings
  const activeListings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE", // Adjust based on your status field
    },
  });

  // Find matches for each listing
  for (const listing of activeListings) {
    await findMatchesForListing(listing.id);
  }
}

/**
 * INTEGRATION NOTES:
 *
 * 1. Import the notification helper:
 *    import { createMatchNotification } from "@/lib/notifications";
 *
 * 2. When you find a match, call createMatchNotification with:
 *    - userId: The user who should receive the notification
 *    - listingId: The user's listing ID
 *    - matchedListingId: The matched listing ID
 *    - matchScore (optional): A numeric score for the match quality
 *    - description (optional): A human-friendly description
 *
 * 3. The notification helper will automatically:
 *    - Create an in-app notification
 *    - Send an email if the user has email notifications enabled
 *
 * 4. Consider:
 *    - Only notify for NEW matches (track previously notified matches)
 *    - Batch notifications to avoid spamming
 *    - Add a cooldown period between match notifications
 */

/**
 * BONUS: Track which matches have been notified
 *
 * You might want to add a MatchNotification table to avoid
 * notifying the same match multiple times:
 *
 * model MatchNotification {
 *   id                String   @id @default(cuid())
 *   userId            String
 *   listingId         String
 *   matchedListingId  String
 *   notifiedAt        DateTime @default(now())
 *
 *   @@unique([userId, listingId, matchedListingId])
 * }
 *
 * Then check before creating a notification:
 */
export async function createMatchNotificationOnce(
  userId: string,
  listingId: string,
  matchedListingId: string
) {
  // Check if already notified
  const existingNotification = await prisma.matchNotification.findUnique({
    where: {
      userId_listingId_matchedListingId: {
        userId,
        listingId,
        matchedListingId,
      },
    },
  });

  if (existingNotification) {
    console.log("Already notified about this match, skipping");
    return;
  }

  // Create the notification
  await createMatchNotification({
    userId,
    listingId,
    matchedListingId,
    description: "We found a new seat match for you!",
  });

  // Record that we notified
  await prisma.matchNotification.create({
    data: {
      userId,
      listingId,
      matchedListingId,
    },
  });
}
