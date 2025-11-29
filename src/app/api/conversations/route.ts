import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import { prisma } from "../../../lib/prisma"

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

    // Create new conversation
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

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    )
  }
}