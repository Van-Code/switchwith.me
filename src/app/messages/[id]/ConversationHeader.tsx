"use client"

import React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "../../../components/ui/button"
import { ArrowLeft, Flag } from "lucide-react"
import { ReportUserModal } from "../../../components/ReportUserModal"

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
  conversationId: string
}

export function ConversationHeader({
  otherParticipant,
  conversationId,
}: ConversationHeaderProps) {
  const [showReportModal, setShowReportModal] = useState(false)

  const otherUserName = otherParticipant?.user.profile
    ? `${otherParticipant.user.profile.firstName} ${otherParticipant.user.profile.lastInitial}.`
    : "Unknown User"

  return (
    <>
      <div className="flex items-center justify-between gap-4">
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

        {otherParticipant && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReportModal(true)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Flag className="h-4 w-4 mr-2" />
            Report
          </Button>
        )}
      </div>

      {otherParticipant && (
        <ReportUserModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportedUserId={otherParticipant.user.id}
          reportedUserName={otherUserName}
          conversationId={conversationId}
        />
      )}
    </>
  )
}
