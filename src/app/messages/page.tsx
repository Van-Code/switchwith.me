import { requireUserId } from "@/lib/auth-api"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { MessagesListClient } from "./MessagesListClient"

export default async function MessagesPage() {
  const auth = await requireUserId()
  if (!auth.ok) {
    redirect("/auth/signin")
  }
  const userId = auth.userId

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId: userId,
        },
      },
      messages: {
        some: {}, // Only include conversations with at least one message
      },
    },
    include: {
      participants: {
        include: {
          user: {
            include: {
              profile: true,
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
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
      listing: {
        include: {
          team: true,
        },
      }, // Include listing with team info
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  // Serialize dates
  // @ts-ignore
  const serializedConversations = conversations.map((conv) => ({
    ...conv,
    createdAt: conv.createdAt.toISOString(),
    updatedAt: conv.updatedAt.toISOString(),
    participants: conv.participants.map((p: any) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      user: {
        ...p.user,
        createdAt: p.user.createdAt.toISOString(),
        updatedAt: p.user.updatedAt.toISOString(),
        profile: p.user.profile
          ? {
              ...p.user.profile,
              createdAt: p.user.profile.createdAt.toISOString(),
              updatedAt: p.user.profile.updatedAt.toISOString(),
            }
          : null,
        listings: p.user.listings?.map((listing: any) => ({
          ...listing,
          gameDate: listing.gameDate.toISOString(),
        })) || [],
      },
    })),
    messages: conv.messages.map((m: any) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
    listing: conv.listing
      ? {
          ...conv.listing,
          gameDate: conv.listing.gameDate.toISOString(),
          createdAt: conv.listing.createdAt.toISOString(),
          updatedAt: conv.listing.updatedAt.toISOString(),
        }
      : null,
  }))

  return (
    <MessagesListClient conversations={serializedConversations} currentUserId={userId} />
  )
}
