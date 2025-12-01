"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Card, CardContent } from "./ui/card"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { useSocket } from "../contexts/SocketContext"
import { EndChatDialog } from "./EndChatDialog"
import { MoreVertical, XCircle, CheckCircle2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

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
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const { socket, isConnected } = useSocket()

  const isEnded = conversationStatus === "ENDED"

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    // Join conversation room
    socket.emit("join-conversation", conversationId)

    // Listen for new messages
    socket.on("new-message", (message: Message) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m:{id:string}) => m.id === message.id)) {
          return prev
        }
        return [...prev, message]
      })
    })

    // Listen for typing indicators
    socket.on("user-typing", ({ userId, isTyping }: { userId: string, isTyping: boolean }) => {
      if (userId === currentUserId) return
      
      setTypingUsers((prev) => {
        const updated = new Set(prev)
        if (isTyping) {
          updated.add(userId)
        } else {
          updated.delete(userId)
        }
        return updated
      })
    })

    return () => {
      socket.emit("leave-conversation", conversationId)
      socket.off("new-message")
      socket.off("user-typing")
    }
  }, [socket, conversationId, currentUserId])

  const handleTyping = (text: string) => {
    setNewMessage(text)

    if (!socket) return

    // Emit typing event
    socket.emit("typing", {
      conversationId,
      userId: currentUserId,
      isTyping: text.length > 0,
    })

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing after 2 seconds of inactivity
    if (text.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", {
          conversationId,
          userId: currentUserId,
          isTyping: false,
        })
      }, 2000)
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim() || sending || isEnded) return

    setSending(true)
    try {
      await onSendMessage(newMessage)
      setNewMessage("")

      // Stop typing indicator
      if (socket) {
        socket.emit("typing", {
          conversationId,
          userId: currentUserId,
          isTyping: false,
        })
      }
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
    <div className="flex flex-col h-[600px]">
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

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-500/10 text-yellow-700 text-xs px-3 py-2 text-center">
          Reconnecting...
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.sender.id === currentUserId
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
            >
              <Card className={`max-w-[70%] ${isOwnMessage ? "bg-primary text-primary-foreground" : ""}`}>
                <CardContent className="p-3">
                  {!isOwnMessage && message.sender.profile && (
                    <p className="text-xs font-semibold mb-1">
                      {message.sender.profile.firstName} {message.sender.profile.lastInitial}.
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(message.createdAt).toLocaleTimeString([], { 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })}
                  </p>
                </CardContent>
              </Card>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsers.size > 0 && (
        <div className="px-4 py-2 text-sm text-muted-foreground italic">
          Someone is typing...
        </div>
      )}

      <div className="border-t p-4">
        {isEnded ? (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">This chat has been ended. You can still read past messages.</p>
          </div>
        ) : (
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
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