import { Card, CardContent } from "./ui/card"
import Link from "next/link"

interface ConversationListProps {
  conversations: Array<{
    id: string
    updatedAt: Date | string
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
  }>
  currentUserId: string
}

export function ConversationList({ conversations, currentUserId }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No conversations yet. Start by messaging someone from a listing!
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const otherParticipant = conversation.participants.find(
          p => p.user.id !== currentUserId
        )
        const lastMessage = conversation.messages[0]
        
        return (
          <Link key={conversation.id} href={`/messages/${conversation.id}`}>
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {otherParticipant?.user.profile
                        ? `${otherParticipant.user.profile.firstName} ${otherParticipant.user.profile.lastInitial}.`
                        : "Unknown User"}
                    </h3>
                    {lastMessage && (
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {lastMessage.text}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(conversation.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}