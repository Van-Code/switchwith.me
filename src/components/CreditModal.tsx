"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Sparkles, AlertCircle } from "lucide-react"

interface CreditModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userCredits: number
  recipientName?: string
}

export function CreditModal({
  isOpen,
  onClose,
  onConfirm,
  userCredits,
  recipientName = "this user",
}: CreditModalProps) {
  const [isPurchasing, setIsPurchasing] = useState(false)
  const hasEnoughCredits = userCredits >= 1

  const handlePurchaseCredits = async () => {
    setIsPurchasing(true)
    try {
      const response = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 5 }), // Purchase 5 credits
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to purchase credits")
      }

      // Reload the page to refresh credit balance
      window.location.reload()
    } catch (error) {
      console.error("Error purchasing credits:", error)
      alert(error instanceof Error ? error.message : "Failed to purchase credits")
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleStartConversation = () => {
    if (hasEnoughCredits) {
      onConfirm()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-cyan-600" />
            Start Conversation
          </DialogTitle>
          <DialogDescription>
            Send a message to {recipientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Credit Balance */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <p className="text-sm font-medium text-slate-700">Your Credit Balance</p>
              <p className="text-xs text-slate-500 mt-0.5">Credits are used to start conversations</p>
            </div>
            <Badge
              variant={hasEnoughCredits ? "default" : "destructive"}
              className="text-lg px-3 py-1"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              {userCredits}
            </Badge>
          </div>

          {/* Cost Information */}
          <div className="flex items-start gap-3 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <MessageCircle className="h-5 w-5 text-cyan-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-cyan-900">Starting a conversation costs 1 credit</p>
              <p className="text-xs text-cyan-700 mt-1">
                This helps maintain quality connections and prevents spam.
              </p>
            </div>
          </div>

          {/* Insufficient Credits Warning */}
          {!hasEnoughCredits && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">Insufficient Credits</p>
                <p className="text-xs text-amber-700 mt-1">
                  You need at least 1 credit to start a conversation. Purchase more credits to continue.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!hasEnoughCredits ? (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePurchaseCredits}
                disabled={isPurchasing}
                className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isPurchasing ? "Purchasing..." : "Buy 5 Credits"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartConversation}
                className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Conversation (1 credit)
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
