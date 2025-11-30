"use client"

import { useState } from "react"
import { ConversationListItem } from "@/components/ConversationListItem"
import { Button } from "@/components/ui/button"

interface Conversation {
  id: string
  createdAt: string
  updatedAt: string
  status: "ACTIVE" | "ENDED"
  participants: Array<{
    id: string
    createdAt: string
    archived: boolean
    user: {
      id: string
      email: string
      createdAt: string
      updatedAt: string
      profile: {
        id: string
        firstName: string
        lastInitial: string
        createdAt: string
        updatedAt: string
      } | null
    }
  }>
  messages: Array<{
    id: string
    text: string
    createdAt: string
  }>
  listing: {
    id: string
    haveSection: string
    haveRow: string
    haveSeat: string
    haveZone: string
    gameDate: string
    faceValue: number
    createdAt: string
    updatedAt: string
  } | null
}

interface MessagesListClientProps {
  conversations: Conversation[]
  currentUserId: string
}

export function MessagesListClient({ conversations, currentUserId }: MessagesListClientProps) {
  const [showArchived, setShowArchived] = useState(false)

  // Filter conversations based on archived status
  const filteredConversations = conversations.filter((conversation) => {
    const currentUserParticipant = conversation.participants.find(
      (p) => p.user.id === currentUserId
    )
    return showArchived ? currentUserParticipant?.archived : !currentUserParticipant?.archived
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
          <p className="text-slate-600">Your conversations</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={!showArchived ? "default" : "outline"}
            onClick={() => setShowArchived(false)}
          >
            Active
          </Button>
          <Button
            variant={showArchived ? "default" : "outline"}
            onClick={() => setShowArchived(true)}
          >
            Archived
          </Button>
        </div>
      </div>

      {filteredConversations.length === 0 ? (
        <div className="text-center py-8 text-slate-600">
          {showArchived
            ? "No archived conversations."
            : "No conversations yet. Start by messaging someone from a listing!"}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
