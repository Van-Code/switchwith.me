import React from "react"
import { requireUserId } from "@/lib/auth-api"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { MessageThreadClient } from "./MessageThreadClient"
import { ConversationSidebar } from "@/components/ConversationSidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ConversationHeader } from "./ConversationHeader"

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const auth = await requireUserId()
  if (!auth.ok) {
    redirect("/auth/signin")
  }
  const userId = auth.userId

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      participants: {
        include: {
          user: {
            include: {
              profile: {
                select: {
                  firstName: true,
                  lastInitial: true,
                  avatarUrl: true,
                  emailVerified: true,
                  phoneVerified: true,
                  seasonTicketHolderVerified: true,
                  successfulSwapsCount: true,
                  createdAt: true,
                  updatedAt: true,
                  id: true,
                  userId: true,
                },
              },
              listings: {
                where: {
                  status: "ACTIVE",
                },
                select: {
                  id: true,
                  listingType: true,
                  haveSection: true,
                  haveRow: true,
                  haveSeat: true,
                  haveZone: true,
                  wantZones: true,
                  wantSections: true,
                  flexible: true,
                  teamId: true,
                  gameDate: true,
                },
              },
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
      listing: {
        include: {
          team: true,
        },
      }, // Include listing with team info
    },
  })

  if (!conversation) {
    return <div>Conversation not found</div>
  }

  // Check if user is participant
  const isParticipant = conversation.participants.some(
    (p: { userId: string }) => p.userId === userId
  )

  if (!isParticipant) {
    redirect("/messages")
  }

  const otherParticipant = conversation.participants.find(
    (p: { userId: string }) => p.userId !== userId
  )

  // Serialize dates
  const serializedMessages = conversation.messages.map((m: any) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    sender: {
      ...m.sender,
      createdAt: m.sender.createdAt.toISOString(),
      updatedAt: m.sender.updatedAt.toISOString(),
      profile: m.sender.profile
        ? {
            ...m.sender.profile,
            createdAt: m.sender.profile.createdAt.toISOString(),
            updatedAt: m.sender.profile.updatedAt.toISOString(),
          }
        : null,
    },
  }))

  const serializedListing = conversation.listing
    ? {
        ...conversation.listing,
        gameDate: conversation.listing.gameDate.toISOString(),
        createdAt: conversation.listing.createdAt.toISOString(),
        updatedAt: conversation.listing.updatedAt.toISOString(),
      }
    : null

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <ConversationHeader otherParticipant={otherParticipant} />

      {/* Main Content - Side by Side Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[350px_1fr] gap-6">
          {/* Left Sidebar - Listing Details & Related */}
          <ConversationSidebar
            listing={serializedListing}
            listingId={conversation.listingId}
            currentUserId={userId}
            participants={conversation.participants}
          />

          {/* Right - Message Thread */}
          <main className="min-h-[600px]">
            <MessageThreadClient
              conversationId={conversation.id}
              initialMessages={serializedMessages}
              currentUserId={userId}
              conversationStatus={conversation.status}
              listingId={conversation.listingId}
              otherParticipant={otherParticipant}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
