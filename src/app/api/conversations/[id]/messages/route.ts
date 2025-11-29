import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../lib/auth"
import { prisma } from "../../../../../lib/prisma"
import { createMessageNotification } from "../../../../../lib/notifications"

// Force dynamic rendering - this route needs to access headers for authentication
export const dynamic = 'force-dynamic';

export async function POST(
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
    const { text } = body

    if (!text || text.trim() === "") {
      return NextResponse.json(
        { error: "Message text is required" },
        { status: 400 }
      )
    }

    // Verify user is participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        participants: true,
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

    // Check if conversation is ended
    if (conversation.status === "ENDED") {
      return NextResponse.json(
        { error: "Cannot send messages in an ended conversation" },
        { status: 400 }
      )
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: params.id,
        senderId: session.user.id,
        text: text.trim(),
      },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
      },
    })

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    })

    // Detect potential swap completion
    const completionKeywords = [
      "transferred",
      "sent you the ticket",
      "sent the ticket",
      "got the ticket",
      "received the ticket",
      "swap is done",
      "swap complete",
      "all set",
      "we're good",
      "thanks for the swap",
      "swap successful",
      "ticket transferred",
    ]

    const messageTextLower = text.trim().toLowerCase()
    const suggestSetInactive = completionKeywords.some((keyword) =>
      messageTextLower.includes(keyword)
    )

    // If swap might be complete and conversation has a listing owned by sender
    let listingId = null
    if (suggestSetInactive && conversation.listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: conversation.listingId },
      })
      // Only suggest if the sender owns the listing and it's still active
      if (listing && listing.userId === session.user.id && listing.status === "ACTIVE") {
        listingId = listing.id
      }
    }

    // Emit socket event to all clients in the conversation room
    if (global.io) {
      global.io.to(`conversation:${params.id}`).emit("new-message", {
        id: message.id,
        text: message.text,
        createdAt: message.createdAt.toISOString(),
        sender: {
          id: message.sender.id,
          profile: message.sender.profile ? {
            firstName: message.sender.profile.firstName,
            lastInitial: message.sender.profile.lastInitial,
          } : null,
        },
      })
    }

    // Create notification for the recipient (don't notify the sender!)
    const recipient = conversation.participants.find(
      (p: {userId: string}) => p.userId !== session.user.id
    )

    if (recipient) {
      // Get sender name for notification
      const senderName = message.sender.profile
        ? `${message.sender.profile.firstName} ${message.sender.profile.lastInitial}.`
        : "Someone"

      // Create notification asynchronously - don't block the response
      createMessageNotification({
        recipientId: recipient.userId,
        conversationId: params.id,
        messageId: message.id,
        senderName,
        messagePreview: text.trim(),
      }).catch((error) => {
        // Log but don't fail the request if notification fails
        console.error("Failed to create message notification:", error)
      })
    }

    return NextResponse.json({
      message,
      suggestSetInactive: !!listingId,
      listingId,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}