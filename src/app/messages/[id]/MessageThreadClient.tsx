"use client"

import { useState } from "react"
import { MessageThread } from "../../../components/MessageThread"
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert"
import { Button } from "../../../components/ui/button"
import { useRouter } from "next/navigation"
import { CheckCircle2, X } from "lucide-react"

interface Message {
  id: string
  text: string
  createdAt: Date | string
  sender: {
    id: string
    profile: {
      firstName: string
      lastInitial: string
    } | null
  }
}

interface MessageThreadClientProps {
  conversationId: string
  initialMessages: Message[]
  currentUserId: string
  conversationStatus: "ACTIVE" | "ENDED"
  listingId?: string | null
}

export function MessageThreadClient({
  conversationId,
  initialMessages,
  currentUserId,
  conversationStatus,
  listingId,
}: MessageThreadClientProps) {
  const router = useRouter()
  const [showSwapPrompt, setShowSwapPrompt] = useState(false)
  const [suggestedListingId, setSuggestedListingId] = useState<string | null>(null)
  const [settingInactive, setSettingInactive] = useState(false)

  const handleSendMessage = async (text: string) => {
    const response = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      throw new Error("Failed to send message")
    }

    const data = await response.json()

    // Check if we should suggest marking listing inactive
    if (data.suggestSetInactive && data.listingId) {
      setSuggestedListingId(data.listingId)
      setShowSwapPrompt(true)
    }
  }

  const handleMarkInactive = async () => {
    if (!suggestedListingId) return

    setSettingInactive(true)
    try {
      const response = await fetch(`/api/listings/${suggestedListingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "INACTIVE" }),
      })

      if (response.ok) {
        setShowSwapPrompt(false)
        router.refresh()
      } else {
        console.error("Failed to update listing status")
        alert("Failed to mark listing as inactive. Please try again.")
      }
    } catch (error) {
      console.error("Error updating listing status:", error)
      alert("Failed to mark listing as inactive. Please try again.")
    } finally {
      setSettingInactive(false)
    }
  }

  const handleEndConversation = () => {
    router.refresh()
  }

  const handleArchiveConversation = () => {
    router.push("/messages")
  }

  return (
    <div className="space-y-4">
      {/* Swap completion prompt */}
      {showSwapPrompt && (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Looks like this swap might be done!</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Do you want to mark your listing as inactive so others know it&apos;s no longer
              available?
            </span>
            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                onClick={handleMarkInactive}
                disabled={settingInactive}
              >
                {settingInactive ? "Updating..." : "Mark inactive"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSwapPrompt(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <MessageThread
        conversationId={conversationId}
        messages={initialMessages}
        currentUserId={currentUserId}
        conversationStatus={conversationStatus}
        onSendMessage={handleSendMessage}
        onEndConversation={handleEndConversation}
        onArchiveConversation={handleArchiveConversation}
      />
    </div>
  )
}