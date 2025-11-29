import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../lib/auth"
import { prisma } from "../../../../../lib/prisma"

// PATCH /api/conversations/[id]/archive - Archive/unarchive a conversation for current user
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
    const { archived } = body

    if (typeof archived !== "boolean") {
      return NextResponse.json(
        { error: "archived must be a boolean" },
        { status: 400 }
      )
    }

    // Find the participant record for this user
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: params.id,
        userId: session.user.id,
      },
    })

    if (!participant) {
      return NextResponse.json(
        { error: "Not a participant in this conversation" },
        { status: 403 }
      )
    }

    // Update archived status
    const updatedParticipant = await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { archived },
    })

    return NextResponse.json({
      success: true,
      archived: updatedParticipant.archived,
    })
  } catch (error) {
    console.error("Error archiving conversation:", error)
    return NextResponse.json(
      { error: "Failed to archive conversation" },
      { status: 500 }
    )
  }
}
