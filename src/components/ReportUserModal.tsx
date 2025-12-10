"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

interface ReportUserModalProps {
  isOpen: boolean
  onClose: () => void
  reportedUserId: string
  reportedUserName: string
  conversationId?: string
}

const REPORT_REASONS = [
  { value: "HARASSMENT", label: "Harassment or bullying" },
  { value: "INAPPROPRIATE_CONTENT", label: "Inappropriate content" },
  { value: "SPAM", label: "Spam or unwanted messages" },
  { value: "SCAM", label: "Scam or fraud attempt" },
  { value: "FAKE_PROFILE", label: "Fake or impersonation profile" },
  { value: "OTHER", label: "Other" },
]

export function ReportUserModal({
  isOpen,
  onClose,
  reportedUserId,
  reportedUserName,
  conversationId,
}: ReportUserModalProps) {
  const [reason, setReason] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!reason) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedUserId,
          conversationId,
          reason,
          description: description.trim() || undefined,
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => {
          handleClose()
        }, 2000)
      } else {
        const data = await response.json()
        alert(data.error || "Failed to submit report")
      }
    } catch (error) {
      console.error("Error submitting report:", error)
      alert("An error occurred while submitting the report")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setReason("")
    setDescription("")
    setSubmitted(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {submitted ? (
          <>
            <DialogHeader>
              <DialogTitle>Report Submitted</DialogTitle>
              <DialogDescription>
                Thank you for your report. Our team will review it and take appropriate action.
              </DialogDescription>
            </DialogHeader>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Report User</DialogTitle>
              <DialogDescription>
                Report {reportedUserName} for violating community guidelines. All reports are reviewed by our team.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for reporting *</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger id="reason">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_REASONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Additional details (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide any additional information that would help us understand the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {description.length}/500 characters
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!reason || loading}
                variant="destructive"
              >
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
