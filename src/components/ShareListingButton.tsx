"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Share2, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { isMobileDeviceUserAgent } from "@/lib/mobile"

interface ShareListingButtonProps {
  listingId: string
  listingTitle?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}
function baseUrlFromWindow() {
  if (typeof window === "undefined") return ""
  return window.location.origin
}
export function ShareListingButton({
  listingId,
  listingTitle = "Check out this ticket listing",
  variant = "outline",
  size = "sm",
}: ShareListingButtonProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const base = baseUrlFromWindow()
    const shareUrl = `${base}/listings/${listingId}`
    const shareData = {
      title: "Switch With Me - Ticket Listing",
      text: listingTitle,
      url: shareUrl,
    }
    // Check if native share is available (mobile)
    if (isMobileDeviceUserAgent() && navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
        toast({
          title: "Shared successfully",
          description: "Thanks for sharing!",
        })
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error)
        }
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        toast({
          title: "Link copied",
          description: "The listing link has been copied to your clipboard",
        })

        // Reset copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error("Failed to copy:", error)
        toast({
          title: "Failed to copy",
          description: "Please try again",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleShare} className="gap-2">
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          Share
        </>
      )}
    </Button>
  )
}
