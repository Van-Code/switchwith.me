import { requireUserId } from "@/lib/auth-api"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

interface PageProps {
  searchParams: { listingId?: string }
}

export default async function ListingMessagePage({ searchParams }: PageProps) {
  // Verify user is authenticated

  const auth = await requireUserId()
  if (!auth.ok) {
    // Should not happen since middleware protects this route, but just in case
    redirect("/auth/signin")
  }
  const userId = auth.userId
  const { listingId } = searchParams

  // Fallback: Listing ID missing or invalid
  if (!listingId || typeof listingId !== "string") {
    redirect("/listings?error=missing_listing")
  }

  // Fetch the listing and verify it exists and is active
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      team: true,
    },
  })

  // Fallback: Listing doesn't exist
  if (!listing) {
    redirect("/listings?error=listing_not_found")
  }

  // Fallback: Listing is inactive
  if (listing.status !== "ACTIVE") {
    // Redirect to browse with filters for similar listings
    const teamSlug = listing.team?.slug || ""
    redirect(`/listings?error=listing_inactive&team=${teamSlug}`)
  }

  // Prevent messaging your own listing
  if (listing.user.id === userId) {
    redirect(`/listings?error=own_listing`)
  }

  // Check if conversation already exists for this user + listing
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      listingId: listingId,
      participants: {
        some: {
          userId: userId,
        },
      },
    },
    select: {
      id: true,
    },
  })

  // If conversation exists, redirect to it
  if (existingConversation) {
    redirect(`/messages/${existingConversation.id}`)
  }

  // Create new conversation via client component that will handle the API call
  redirect(`/listings/message/create?listingId=${listingId}&ownerId=${listing.user.id}`)
}
