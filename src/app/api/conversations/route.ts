import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/auth-api"
import { prisma } from "@/lib/prisma"
import { isPayToChatEnabled } from "@/lib/features"

// Force dynamic rendering - this route needs to access headers for authentication
export const dynamic = "force-dynamic"

// GET /api/conversations - Get all conversations for current user
export async function GET(req: Request) {
  try {
    const auth = await requireUserId()
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = auth.userId
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        listing: true, // Include listing data
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

// POST /api/conversations - Create or get existing conversation with another user
export async function POST(req: Request) {
  try {
    const auth = await requireUserId()
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = auth.userId

    const body = await req.json()
    const { otherUserId, listingId } = body

    if (listingId) {
      const clickedListing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { id: true, userId: true },
      })

      if (!clickedListing) {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 })
      }

      if (clickedListing.userId !== otherUserId) {
        return NextResponse.json(
          { error: "listingId does not belong to otherUserId" },
          { status: 400 }
        )
      }
    }

    if (!otherUserId) {
      return NextResponse.json({ error: "Missing otherUserId" }, { status: 400 })
    }

    // DEFENSIVE CHECK: If listingId is provided, check if conversation already exists for this specific listing + current user
    // This prevents duplicate conversations for the same listing
    if (listingId) {
      const existingListingConversation = await prisma.conversation.findFirst({
        where: {
          listingId,
          participants: {
            some: { userId },
          },
          AND: [
            {
              participants: {
                some: { userId: otherUserId },
              },
            },
          ],
        },
        include: {
          participants: { include: { user: { include: { profile: true } } } },
          messages: { orderBy: { createdAt: "asc" } },
          listing: true,
        },
      })

      if (existingListingConversation) {
        return NextResponse.json({ conversation: existingListingConversation })
      }
    }

    // Check if conversation already exists between these two users
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: otherUserId } } },
          ...(listingId ? [{ listingId }] : []),
        ],
      },
      include: {
        participants: { include: { user: { include: { profile: true } } } },
        messages: { orderBy: { createdAt: "asc" } },
        listing: true,
      },
    })

    if (existingConversation) {
      // If a listingId is provided and conversation doesn't have one, update it
      if (listingId && !existingConversation.listingId) {
        const updatedConversation = await prisma.conversation.update({
          where: { id: existingConversation.id },
          data: { listingId },
          include: {
            participants: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
            messages: {
              orderBy: {
                createdAt: "asc",
              },
            },
            listing: true,
          },
        })
        return NextResponse.json({ conversation: updatedConversation })
      }
      return NextResponse.json({ conversation: existingConversation })
    }

    // Credit system for pay-to-chat (if enabled)
    if (isPayToChatEnabled()) {
      // Get current user with credits
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      })

      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Check if user has enough credits
      if (currentUser.credits < 1) {
        return NextResponse.json(
          {
            error: "Insufficient credits",
            creditsRequired: 1,
            currentCredits: currentUser.credits,
          },
          { status: 402 } // Payment Required
        )
      }

      // Use transaction to deduct credit and create conversation atomically
      const result = await prisma.$transaction(async (tx) => {
        // Deduct 1 credit from user
        await tx.user.update({
          where: { id: userId },
          data: {
            credits: {
              decrement: 1,
            },
          },
        })

        // Get other user's name for transaction note
        const otherUser = await tx.user.findUnique({
          where: { id: otherUserId },
          include: { profile: true },
        })

        // Create credit transaction record
        await tx.creditTransaction.create({
          data: {
            userId: userId,
            amount: -1,
            note: `Start conversation with ${otherUser?.profile?.firstName || "user"}`,
          },
        })

        // Create new conversation
        const conversation = await tx.conversation.create({
          data: {
            ...(listingId && { listingId }),
            participants: {
              create: [{ userId }, { userId: otherUserId }],
            },
          },
          include: {
            participants: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
            messages: true,
            listing: true,
          },
        })

        return conversation
      })

      return NextResponse.json({ conversation: result })
    }

    // Early launch mode (free conversations)
    // FINAL DEFENSIVE CHECK: Double-check no conversation was created in a race condition
    // This handles the edge case where two requests come in simultaneously
    const finalCheck = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                userId: userId,
              },
            },
          },
          {
            participants: {
              some: {
                userId: otherUserId,
              },
            },
          },
          ...(listingId ? [{ listingId }] : []),
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        messages: true,
        listing: true,
      },
    })

    if (finalCheck) {
      console.log(
        `[RACE_CONDITION_PREVENTION] Conversation already exists, returning existing one`
      )
      return NextResponse.json({ conversation: finalCheck })
    }

    // Create new conversation without credit deduction
    const conversation = await prisma.conversation.create({
      data: {
        ...(listingId && { listingId }), // Only include if listingId exists
        participants: {
          create: [{ userId }, { userId: otherUserId }],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        messages: true,
        listing: true,
      },
    })

    // Optionally log a free transaction for analytics
    await prisma.creditTransaction
      .create({
        data: {
          userId: userId,
          amount: 0,
          note: "Free conversation (early launch)",
        },
      })
      .catch(() => {
        // Silently fail if transaction logging fails
      })

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
