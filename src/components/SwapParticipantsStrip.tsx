"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAvatarUrl } from "@/hooks/useAvatarUrl"
import { Card, CardContent } from "@/components/ui/card"

interface Participant {
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

interface SwapParticipantsStripProps {
  participants: Participant[]
}

function ParticipantAvatar({ participant }: { participant: Participant }) {
  const displayName = participant.user.profile
    ? `${participant.user.profile.firstName} ${participant.user.profile.lastInitial}.`
    : "Unknown User"

  const avatarUrl = participant.user.profile?.avatarUrl
  const avatarViewUrl = useAvatarUrl(avatarUrl)

  const getInitials = () => {
    if (participant.user.profile) {
      const { firstName, lastInitial } = participant.user.profile
      return `${firstName.charAt(0)}${lastInitial || ""}`.toUpperCase()
    }
    return "U"
  }

  return (
    <div className="flex flex-col items-center gap-1 shrink-0" title={displayName}>
      <Avatar className="h-8 w-8 ring-2 ring-background">
        <AvatarImage src={avatarViewUrl || undefined} alt={`${displayName}'s avatar`} />
        <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white font-semibold text-xs">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs text-muted-foreground truncate max-w-[80px]" aria-label={displayName}>
        {participant.user.profile?.firstName || "Unknown"}
      </span>
    </div>
  )
}

export function SwapParticipantsStrip({ participants }: SwapParticipantsStripProps) {
  if (!participants || participants.length === 0) {
    return null
  }

  const displayedParticipants = participants.slice(0, 5)
  const remainingCount = participants.length - 5

  return (
    <Card className="border bg-muted/30">
      <CardContent className="pt-4 pb-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          People in this swap
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {displayedParticipants.map((participant) => (
            <ParticipantAvatar key={participant.userId} participant={participant} />
          ))}
          {remainingCount > 0 && (
            <div className="flex flex-col items-center gap-1 shrink-0" title={`${remainingCount} more participant${remainingCount > 1 ? 's' : ''}`}>
              <div className="h-8 w-8 rounded-full bg-muted ring-2 ring-background flex items-center justify-center">
                <span className="text-xs font-semibold text-muted-foreground">
                  +{remainingCount}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                more
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
