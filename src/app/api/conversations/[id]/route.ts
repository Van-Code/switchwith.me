import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/prisma"

// GET /api/conversations/[id] - Get a single conversation with messages
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
        
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
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
          include: {
            sender: {
              include: {
                profile: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        listing: true, // Include listing
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(
      (p: {userId: string}) => p.userId === session.user.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    )
  }
}