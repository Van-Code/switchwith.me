import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/auth-api"
import { prisma } from "@/lib/prisma"
import { isPayToChatEnabled } from "@/lib/features"

export const dynamic = "force-dynamic"

export async function GET(_req: Request) {
  try {
    const auth = await requireUserId()
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = auth.userId

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              include: { profile: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        listing: true,
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireUserId()
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = auth.userId
    const body = await req.json()
    const { otherUserId, listingId } = body as {
      otherUserId?: string
      listingId?: string
    }

    if (!otherUserId) {
      return NextResponse.json({ error: "Missing otherUserId" }, { status: 400 })
    }

    if (otherUserId === userId) {
      return NextResponse.json(
        { error: "Cannot create conversation with yourself" },
        { status: 400 }
      )
    }

    // If listingId is provided, validate it exists and belongs to otherUserId.
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

      // Duplicate prevention for same viewer, same other user, same listing
      const existingListingConversation = await prisma.conversation.findFirst({
        where: {
          listingId,
          participants: { some: { userId } },
          AND: [{ participants: { some: { userId: otherUserId } } }],
        },
        include: {
          participants: {
            include: {
              user: { include: { profile: true } },
            },
          },
          messages: { orderBy: { createdAt: "asc" } },
          listing: true,
        },
      })

      if (existingListingConversation) {
        return NextResponse.json({ conversation: existingListingConversation })
      }
    }

    // Check if a conversation already exists between these two users, optionally scoped to listingId.
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: otherUserId } } },
          ...(listingId ? [{ listingId }] : []),
        ],
      },
      include: {
        participants: {
          include: {
            user: { include: { profile: true } },
          },
        },
        messages: { orderBy: { createdAt: "asc" } },
        listing: true,
      },
    })

    if (existingConversation) {
      // If listingId is provided and conversation doesn't have one, attach it.
      if (listingId && !existingConversation.listingId) {
        const updatedConversation = await prisma.conversation.update({
          where: { id: existingConversation.id },
          data: { listingId },
          include: {
            participants: {
              include: {
                user: { include: { profile: true } },
              },
            },
            messages: { orderBy: { createdAt: "asc" } },
            listing: true,
          },
        })
        return NextResponse.json({ conversation: updatedConversation })
      }

      return NextResponse.json({ conversation: existingConversation })
    }

    // Pay to chat mode
    if (isPayToChatEnabled()) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      })

      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      if (currentUser.credits < 1) {
        return NextResponse.json(
          {
            error: "Insufficient credits",
            creditsRequired: 1,
            currentCredits: currentUser.credits,
          },
          { status: 402 }
        )
      }

      const result = await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { credits: { decrement: 1 } },
        })

        const otherUser = await tx.user.findUnique({
          where: { id: otherUserId },
          include: { profile: true },
        })

        await tx.creditTransaction.create({
          data: {
            userId,
            amount: -1,
            note: `Start conversation with ${otherUser?.profile?.firstName || "user"}`,
          },
        })

        const conversation = await tx.conversation.create({
          data: {
            ...(listingId ? { listingId } : {}),
            participants: {
              create: [{ userId }, { userId: otherUserId }],
            },
          },
          include: {
            participants: {
              include: {
                user: { include: { profile: true } },
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

    // Free mode race condition check for same viewer, same other user, same listing (if present)
    const finalCheck = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: otherUserId } } },
          ...(listingId ? [{ listingId }] : []),
        ],
      },
      include: {
        participants: {
          include: {
            user: { include: { profile: true } },
          },
        },
        messages: true,
        listing: true,
      },
    })

    if (finalCheck) {
      return NextResponse.json({ conversation: finalCheck })
    }

    const conversation = await prisma.conversation.create({
      data: {
        ...(listingId ? { listingId } : {}),
        participants: {
          create: [{ userId }, { userId: otherUserId }],
        },
      },
      include: {
        participants: {
          include: {
            user: { include: { profile: true } },
          },
        },
        messages: true,
        listing: true,
      },
    })

    await prisma.creditTransaction
      .create({
        data: {
          userId,
          amount: 0,
          note: "Free conversation (early launch)",
        },
      })
      .catch(() => {})

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
