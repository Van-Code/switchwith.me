"use client"

import React from "react"
import Link from "next/link"
import { Button } from "../../../components/ui/button"
import { ArrowLeft } from "lucide-react"

interface ConversationHeaderProps {
  otherParticipant?: {
    userId: string
    user: {
      id: string
      profile: {
        firstName: string
        lastInitial: string | null
      } | null
    }
  }
}

export function ConversationHeader({
  otherParticipant,
}: ConversationHeaderProps) {
  const otherUserName = otherParticipant?.user.profile
    ? `${otherParticipant.user.profile.firstName} ${otherParticipant.user.profile.lastInitial}.`
    : "Unknown User"

  return (
    <div className="flex items-center gap-4">
      <Link href="/messages">
        <Button variant="ghost" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{otherUserName}</h1>
        <p className="text-sm text-muted-foreground">Conversation</p>
      </div>
    </div>
  )
}
