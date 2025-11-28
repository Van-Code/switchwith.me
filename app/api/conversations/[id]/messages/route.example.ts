/**
 * EXAMPLE: Message Creation Route with Notifications
 *
 * This file shows how to integrate notifications into your message creation endpoint.
 * Copy the relevant parts into your existing route.
 *
 * POST /api/conversations/[id]/messages
 * Creates a new message and triggers notifications
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createMessageNotification } from "@/lib/notifications";

interface CreateMessageRequest {
  content: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate the user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const conversationId = params.id;
    const body: CreateMessageRequest = await request.json();

    // 2. Validate input
    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // 3. Verify the conversation exists and get participants
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        // Adjust these fields based on your actual Conversation model
        // This assumes you have a participants relation or similar
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // 4. Verify the user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.id === session.user.id
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: "You are not a participant in this conversation" },
        { status: 403 }
      );
    }

    // 5. Create the message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        content: body.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 6. Create notification for the recipient (don't notify the sender!)
    const recipient = conversation.participants.find(
      (p) => p.id !== session.user.id
    );

    if (recipient) {
      // Create notification asynchronously - don't block the response
      createMessageNotification({
        recipientId: recipient.id,
        conversationId: conversation.id,
        messageId: message.id,
        senderName: message.sender.name || "Someone",
        messagePreview: body.content,
      }).catch((error) => {
        // Log but don't fail the request if notification fails
        console.error("Failed to create message notification:", error);
      });
    }

    // 7. Return the created message
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * INTEGRATION NOTES:
 *
 * 1. Import the notification helper at the top:
 *    import { createMessageNotification } from "@/lib/notifications";
 *
 * 2. After creating the message, identify the recipient (the other participant)
 *
 * 3. Call createMessageNotification with:
 *    - recipientId: The user who should receive the notification
 *    - conversationId: The conversation ID
 *    - messageId: The newly created message ID
 *    - senderName: The name of the person who sent the message
 *    - messagePreview: A snippet of the message content
 *
 * 4. Wrap in .catch() to handle errors gracefully without blocking the response
 *
 * 5. The notification helper will automatically:
 *    - Create an in-app notification
 *    - Send an email if the user has email notifications enabled
 */
