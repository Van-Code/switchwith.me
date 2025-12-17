import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/auth-api"
import { prisma } from "@/lib/prisma"

// PATCH /api/conversations/[id]/archive - Archive/unarchive a conversation for current user
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireUserId()
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = auth.userId
    const body = await req.json()
    const { archived } = body

    if (typeof archived !== "boolean") {
      return NextResponse.json({ error: "archived must be a boolean" }, { status: 400 })
    }

    // Find the participant record for this user
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: params.id,
        userId: userId,
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
    return NextResponse.json({ error: "Failed to archive conversation" }, { status: 500 })
  }
}
