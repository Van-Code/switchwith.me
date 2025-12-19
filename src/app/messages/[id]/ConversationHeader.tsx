"use client"

import React from "react"
import Link from "next/link"
import { Button } from "../../../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { ArrowLeft } from "lucide-react"
import { useAvatarUrl } from "@/hooks/useAvatarUrl"

interface ConversationHeaderProps {
  otherParticipant?: {
    userId: string
    user: {
      id: string
      profile: {
        firstName: string
        lastInitial: string | null
        avatarUrl?: string | null
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

  const avatarUrl = otherParticipant?.user.profile?.avatarUrl
  const avatarViewUrl = useAvatarUrl(avatarUrl)

  // Get initials for fallback avatar
  const getInitials = () => {
    if (otherParticipant?.user.profile) {
      const { firstName, lastInitial } = otherParticipant.user.profile
      return `${firstName.charAt(0)}${lastInitial || ""}`.toUpperCase()
    }
    return "U"
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/messages">
        <Button variant="ghost" size="icon" aria-label="Back to messages">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>
      <Avatar className="h-10 w-10">
        <AvatarImage src={avatarViewUrl || undefined} alt={`${otherUserName}'s avatar`} />
        <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white font-semibold">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      <div>
        {otherParticipant?.user.id ? (
          <Link href={`/users/${otherParticipant.user.id}`}>
            <h1 className="text-2xl font-bold hover:underline hover:text-cyan-700 cursor-pointer">
              {otherUserName}
            </h1>
          </Link>
        ) : (
          <h1 className="text-2xl font-bold">{otherUserName}</h1>
        )}
        <p className="text-sm text-muted-foreground">Conversation</p>
      </div>
    </div>
  )
}
