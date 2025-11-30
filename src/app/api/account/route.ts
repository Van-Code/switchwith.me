import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering - this route needs to access headers for authentication
export const dynamic = 'force-dynamic';

/**
 * DELETE /api/account
 * Deletes the authenticated user's account and all related data
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - You must be logged in to delete your account" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Use a transaction to ensure all deletions happen atomically
    await prisma.$transaction(async (tx) => {
      // Verify user exists
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: {
          listings: true,
          notifications: true,
          conversations: true,
          sentMessages: true,
          profile: true,
          accounts: true,
          sessions: true,
        }
      })

      if (!user) {
        throw new Error("User not found")
      }

      // Due to onDelete: Cascade in the schema, we only need to delete the user
      // and all related records will be automatically deleted:
      // - Profile
      // - Listings
      // - Messages (sentMessages)
      // - ConversationParticipants
      // - Notifications
      // - Accounts (OAuth)
      // - Sessions

      // However, we need to handle orphaned Conversations
      // If a conversation has no participants after this user is deleted, delete it
      const conversationIds = user.conversations.map(cp => cp.conversationId)

      // Delete the user (this cascades to all related records)
      await tx.user.delete({
        where: { id: userId }
      })

      // Clean up orphaned conversations
      if (conversationIds.length > 0) {
        // Find conversations that now have no participants
        const orphanedConversations = await tx.conversation.findMany({
          where: {
            id: { in: conversationIds },
            participants: {
              none: {}
            }
          }
        })

        // Delete orphaned conversations
        if (orphanedConversations.length > 0) {
          await tx.conversation.deleteMany({
            where: {
              id: { in: orphanedConversations.map(c => c.id) }
            }
          })
        }
      }
    })

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Your account and all associated data have been permanently deleted"
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting account:", error)

    // Check if it's a user not found error
    if (error instanceof Error && error.message === "User not found") {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Failed to delete account. Please try again or contact support." },
      { status: 500 }
    )
  }
}
