import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../lib/auth"
import { prisma } from "../../../../../lib/prisma"

// PATCH /api/conversations/[id]/end - End a conversation
export async function PATCH(
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

    const body = await req.json()
    const { reason, otherReasonText } = body

    // Validate reason
    const validReasons = ["completed", "unsafe", "not_interested", "other"]
    if (!reason || !validReasons.includes(reason)) {
      return NextResponse.json(
        { error: "Invalid reason" },
        { status: 400 }
      )
    }

    // Verify user is participant
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
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    const isParticipant = conversation.participants.some(
      (p: {userId: string}) => p.userId === session.user.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Map reason to user-friendly text
    const reasonMap: Record<string, string> = {
      completed: "Swap completed",
      unsafe: "Safety concern",
      not_interested: "No longer interested",
      other: otherReasonText || "Other reason",
    }

    const endedReason = reasonMap[reason]

    // Update conversation status
    const updatedConversation = await prisma.conversation.update({
      where: { id: params.id },
      data: {
        status: "ENDED",
        endedAt: new Date(),
        endedBy: session.user.id,
        endedReason,
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
        listing: true,
      },
    })

    // Create a system message to notify participants
    const currentUser = conversation.participants.find(
      (p: {userId: string}) => p.userId === session.user.id
    )
    const userName = currentUser?.user.profile
      ? `${currentUser.user.profile.firstName} ${currentUser.user.profile.lastInitial}.`
      : "A user"

    await prisma.message.create({
      data: {
        conversationId: params.id,
        senderId: session.user.id,
        text: `🔒 ${userName} ended this conversation: ${endedReason}`,
      },
    })

    return NextResponse.json({ conversation: updatedConversation })
  } catch (error) {
    console.error("Error ending conversation:", error)
    return NextResponse.json(
      { error: "Failed to end conversation" },
      { status: 500 }
    )
  }
}
