import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/auth-api"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const auth = await requireUserId()
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = auth.userId
    const body = await req.json()
    const { reportedUserId, conversationId, reason, description } = body

    // Validation
    if (!reportedUserId) {
      return NextResponse.json({ error: "Reported user ID is required" }, { status: 400 })
    }

    if (!reason) {
      return NextResponse.json({ error: "Report reason is required" }, { status: 400 })
    }

    // Prevent users from reporting themselves
    //@ts-ignore
    if (reportedUserId === userId) {
      return NextResponse.json({ error: "You cannot report yourself" }, { status: 400 })
    }

    // Verify reported user exists
    const reportedUser = await prisma.user.findUnique({
      where: { id: reportedUserId },
    })

    if (!reportedUser) {
      return NextResponse.json({ error: "Reported user not found" }, { status: 404 })
    }

    // If conversationId is provided, verify the reporter is a participant
    if (conversationId) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          participants: true,
        },
      })

      if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      }

      const isParticipant = conversation.participants.some(
        //@ts-ignore
        (p: { userId: string }) => p.userId === userId
      )

      if (!isParticipant) {
        return NextResponse.json(
          { error: "You must be a participant in the conversation to report" },
          { status: 403 }
        )
      }
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        //@ts-ignore
        reporterId: userId,
        reportedUserId,
        conversationId: conversationId || null,
        reason,
        description: description?.trim() || null,
      },
      include: {
        reporter: {
          include: {
            profile: true,
          },
        },
        reportedUser: {
          include: {
            profile: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        reason: report.reason,
        status: report.status,
        createdAt: report.createdAt,
      },
    })
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 })
  }
}
