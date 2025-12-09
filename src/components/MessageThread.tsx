"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Card, CardContent } from "./ui/card"
import { ArrowDown, MoreVertical, XCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { EndChatDialog } from "./EndChatDialog"

interface Message {
  id: string
  text: string
  createdAt: Date | string
  sender: {
    id: string
    profile: {
      firstName: string
      lastInitial: string | null
    } | null
  }
}

interface MessageThreadProps {
  conversationId: string
  messages: Message[]
  currentUserId: string
  onSendMessage: (text: string) => Promise<void>
  conversationStatus?: "ACTIVE" | "ENDED"
  onEndConversation?: () => void
  onArchiveConversation?: () => void
}

export function MessageThread({
  conversationId,
  messages: initialMessages,
  currentUserId,
  onSendMessage,
  conversationStatus = "ACTIVE",
  onEndConversation,
  onArchiveConversation,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)

  const threadRef = useRef<HTMLDivElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const isInitialMount = useRef(true)

  const isEnded = conversationStatus === "ENDED"

  // Keep local messages in sync if parent sends new initialMessages
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages, conversationId])

  const scrollMessagesToBottom = (smooth = true) => {
    const container = messagesContainerRef.current
    if (!container) return

    const top = container.scrollHeight - container.clientHeight

    if ("scrollTo" in container && smooth) {
      container.scrollTo({ top, behavior: "smooth" })
    } else {
      container.scrollTop = top
    }
  }

  const scrollToBottom = (smooth = true) => {
    scrollMessagesToBottom(smooth)
  }

  const userIsNearBottom = () => {
    const container = messagesContainerRef.current
    if (!container) return true

    const threshold = 120
    const position =
      container.scrollHeight - container.scrollTop - container.clientHeight

    return position <= threshold
  }

  // Auto-scroll when new messages arrive and user is at bottom
  useEffect(() => {
    if (!isInitialMount.current && userIsNearBottom()) {
      scrollMessagesToBottom()
    }
  }, [messages])

  const handleScroll = () => {
    setShowScrollButton(!userIsNearBottom())
  }

  // Initial scroll on mount
  useEffect(() => {
    if (isInitialMount.current) {
      threadRef.current?.scrollIntoView({
        behavior: "auto",
        block: "center",
      })

      scrollMessagesToBottom(false)
      isInitialMount.current = false
    }
  }, [])

  // ------- POLLING USING /api/conversations/[id] -------

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        cache: "no-store",
      })

      if (!res.ok) {
        console.error("Failed to fetch conversation", await res.text())
        return
      }

      const data = await res.json()
      const updatedMessages: Message[] = data.conversation?.messages ?? []
      setMessages(updatedMessages)
    } catch (error) {
      console.error("Error fetching conversation", error)
    }
  }, [conversationId])

  useEffect(() => {
    let intervalId: number | null = null

    const start = () => {
      // Initial load + polling
      fetchMessages()
      intervalId = window.setInterval(fetchMessages, 4000)
    }

    const stop = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId)
        intervalId = null
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        start()
      } else {
        stop()
      }
    }

    handleVisibility()
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      stop()
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [fetchMessages])

  // ------- END POLLING -------

  const handleSend = async () => {
    if (!newMessage.trim() || sending || isEnded) return

    setSending(true)
    try {
      await onSendMessage(newMessage)
      setNewMessage("")
      // Immediately refresh from server so the new message + other side's replies show up
      await fetchMessages()
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleEndChat = async (reason: string, otherText?: string) => {
    setIsEnding(true)
    try {
      const response = await fetch(`/api/conversations/${conversationId}/end`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, otherReasonText: otherText }),
      })

      if (response.ok) {
        setShowEndDialog(false)
        onEndConversation?.()
      } else {
        const data = await response.json()
        console.error("Failed to end conversation:", data.error)
        alert("Failed to end conversation. Please try again.")
      }
    } catch (error) {
      console.error("Error ending conversation:", error)
      alert("Failed to end conversation. Please try again.")
    } finally {
      setIsEnding(false)
    }
  }

  const handleArchive = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      })

      if (response.ok) {
        onArchiveConversation?.()
      } else {
        const data = await response.json()
        console.error("Failed to archive conversation:", data.error)
        alert("Failed to archive conversation. Please try again.")
      }
    } catch (error) {
      console.error("Error archiving conversation:", error)
      alert("Failed to archive conversation. Please try again.")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div ref={threadRef} className="flex flex-col h-[600px]">
      {/* Options Menu */}
      <div className="flex justify-between items-center px-3 py-2 border-b">
        <div className="text-sm font-medium">
          {isEnded && (
            <span className="text-muted-foreground flex items-center gap-1">
              <XCircle className="h-4 w-4" />
              Chat Ended
            </span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isEnded && (
              <DropdownMenuItem onClick={() => setShowEndDialog(true)}>
                <XCircle className="mr-2 h-4 w-4" />
                End chat
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleArchive}>
              Archive conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Safety Disclaimer */}
      <div className="bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs px-3 py-2 text-center border-b border-blue-200 dark:border-blue-800">
        <strong>Friendly reminder:</strong> This is a peer-to-peer chat. Please double-check tickets
        in the original ticketing app, and only swap with people you trust. This platform doesn&apos;t
        verify ticket ownership or handle payments.
      </div>

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pb-4 space-y-4 relative"
      >
        {messages.map((message) => {
          const isOwnMessage = message.sender.id === currentUserId

          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`max-w-[70%] ${
                  isOwnMessage ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                <CardContent className="p-3">
                  {!isOwnMessage && message.sender.profile && (
                    <p className="text-xs font-semibold mb-1">
                      {message.sender.profile.firstName}{" "}
                      {message.sender.profile.lastInitial}.
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </CardContent>
              </Card>
            </div>
          )
        })}
        <div ref={messagesEndRef} />

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <div className="sticky bottom-4 left-0 right-0 flex justify-center pointer-events-none">
            <Button
              onClick={() => scrollToBottom()}
              className="pointer-events-auto shadow-lg"
              size="sm"
              variant="secondary"
            >
              <ArrowDown className="h-4 w-4 mr-2" />
              Scroll to bottom
            </Button>
          </div>
        )}
      </div>

      <div className="border-t p-4">
        {isEnded ? (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">This chat has been ended. You can still read past messages.</p>
          </div>
        ) : (
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="resize-none"
              rows={2}
            />
            <Button onClick={handleSend} disabled={sending || !newMessage.trim()}>
              {sending ? "..." : "Send"}
            </Button>
          </div>
        )}
      </div>

      <EndChatDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
        onConfirm={handleEndChat}
        isEnding={isEnding}
      />
    </div>
  )
}
