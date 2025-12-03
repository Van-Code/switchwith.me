import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import Link from "next/link"
import { Calendar, MapPin, XCircle } from "lucide-react"

interface ConversationListItemProps {
  conversation: {
    id: string
    updatedAt: Date | string
    status?: "ACTIVE" | "ENDED"
    participants: Array<{
      user: {
        id: string
        profile: {
          firstName: string
          lastInitial: string | null
        } | null
      }
    }>
    messages: Array<{
      text: string
      createdAt: Date | string
    }>
    listing?: {
      haveSection: string
      haveRow: string
      haveSeat: string
      haveZone: string
      gameDate: Date | string
      faceValue: number
    } | null
  }
  currentUserId: string
}

export function ConversationListItem({ conversation, currentUserId }: ConversationListItemProps) {
  const otherParticipant = conversation.participants.find(
    (p:any) => p.user.id !== currentUserId
  )
  const lastMessage = conversation.messages[0]
  const isEnded = conversation.status === "ENDED"

  return (
    <Link href={`/messages/${conversation.id}`}>
      <Card className={`transition-all
        bg-white
        hover:shadow-md
        hover:-translate-y-0.5
        hover:bg-white
        cursor-pointer
        rounded-xl ${isEnded ? "opacity-75" : ""}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">
                  {otherParticipant?.user.profile
                    ? `${otherParticipant.user.profile.firstName} ${otherParticipant.user.profile.lastInitial}.`
                    : "Unknown User"}
                </h3>
                {isEnded && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Ended
                  </Badge>
                )}
              </div>
              {lastMessage && (
                <p className="text-sm text-muted-foreground truncate max-w-md mt-1">
                  {lastMessage.text}
                </p>
              )}
            </div>
            <span className="text-xs text-muted-foreground ml-4">
              {new Date(conversation.updatedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Seat Summary */}
          {conversation.listing ? (
            <div className="mt-3 pt-3 border-t space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">
                  Sec {conversation.listing.haveSection} • Row {conversation.listing.haveRow} • Seat {conversation.listing.haveSeat}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {conversation.listing.haveZone}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(conversation.listing.gameDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <Badge variant="outline" className="text-xs">
                  ${conversation.listing.faceValue}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground italic">No seat attached</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}