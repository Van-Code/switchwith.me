import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isPayToChatEnabled } from "@/lib/features"

// Force dynamic rendering - this route needs to access headers for authentication
export const dynamic = 'force-dynamic';

// GET /api/conversations - Get all conversations for current user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
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
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}

// POST /api/conversations - Create or get existing conversation with another user
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { otherUserId, listingId } = body

    if (!otherUserId) {
      return NextResponse.json(
        { error: "Missing otherUserId" },
        { status: 400 }
      )
    }

    // DEFENSIVE CHECK: If listingId is provided, check if conversation already exists for this specific listing + current user
    // This prevents duplicate conversations for the same listing
    if (listingId) {
      const existingListingConversation = await prisma.conversation.findFirst({
        where: {
          listingId,
          participants: {
            some: {
              userId: session.user.id,
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
              createdAt: "asc",
            },
          },
          listing: true,
        },
      })

      if (existingListingConversation) {
        console.log(`[DUPLICATE_PREVENTION] Found existing conversation for listing ${listingId} and user ${session.user.id}`)
        return NextResponse.json({ conversation: existingListingConversation })
      }
    }

    // Check if conversation already exists between these two users
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                userId: session.user.id,
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
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
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
        where: { id: session.user.id },
        select: { credits: true },
      })

      if (!currentUser) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        )
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
          where: { id: session.user.id },
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
            userId: session.user.id,
            amount: -1,
            note: `Start conversation with ${otherUser?.profile?.firstName || 'user'}`,
          },
        })

        // Create new conversation
        const conversation = await tx.conversation.create({
          data: {
            ...(listingId && { listingId }),
            participants: {
              create: [
                { userId: session.user.id },
                { userId: otherUserId },
              ],
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
                userId: session.user.id,
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
      console.log(`[RACE_CONDITION_PREVENTION] Conversation already exists, returning existing one`)
      return NextResponse.json({ conversation: finalCheck })
    }

    // Create new conversation without credit deduction
    const conversation = await prisma.conversation.create({
      data: {
        ...(listingId && { listingId }), // Only include if listingId exists
        participants: {
          create: [
            { userId: session.user.id },
            { userId: otherUserId },
          ],
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
    await prisma.creditTransaction.create({
      data: {
        userId: session.user.id,
        amount: 0,
        note: "Free conversation (early launch)",
      },
    }).catch(() => {
      // Silently fail if transaction logging fails
    })

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    )
  }
}