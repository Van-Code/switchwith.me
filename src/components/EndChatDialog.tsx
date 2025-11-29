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
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"

interface EndChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string, otherText?: string) => Promise<void>
  isEnding: boolean
}

type EndReason = "completed" | "unsafe" | "not_interested" | "other"

export function EndChatDialog({
  open,
  onOpenChange,
  onConfirm,
  isEnding,
}: EndChatDialogProps) {
  const [reason, setReason] = useState<EndReason>("completed")
  const [otherReasonText, setOtherReasonText] = useState("")

  const handleConfirm = async () => {
    await onConfirm(reason, otherReasonText)
    // Reset state
    setReason("completed")
    setOtherReasonText("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>End this chat?</DialogTitle>
          <DialogDescription>
            You can end this conversation if the swap is done or you&apos;re not comfortable
            continuing. This won&apos;t affect any tickets you haven&apos;t transferred yet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={reason} onValueChange={(value) => setReason(value as EndReason)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="completed" id="completed" />
              <Label htmlFor="completed" className="font-normal cursor-pointer">
                We completed the swap
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unsafe" id="unsafe" />
              <Label htmlFor="unsafe" className="font-normal cursor-pointer">
                I don&apos;t feel safe or comfortable
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not_interested" id="not_interested" />
              <Label htmlFor="not_interested" className="font-normal cursor-pointer">
                We couldn&apos;t agree on a swap
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="font-normal cursor-pointer">
                Other
              </Label>
            </div>
          </RadioGroup>

          {reason === "other" && (
            <div className="space-y-2">
              <Label htmlFor="other-reason">Please specify (optional)</Label>
              <Textarea
                id="other-reason"
                placeholder="Enter your reason..."
                value={otherReasonText}
                onChange={(e) => setOtherReasonText(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isEnding}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isEnding}>
            {isEnding ? "Ending..." : "End chat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
