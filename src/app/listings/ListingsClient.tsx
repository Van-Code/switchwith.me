"use client"

import { ListingCard } from "@/components/ListingCard"
import { CreditModal } from "@/components/CreditModal"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { isPayToChatEnabled } from "@/lib/features"
import { apiClientJson, SessionExpiredError } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface ListingsClientProps {
  listings: any[]
  currentUserId?: string
  badgeVariant?: "primary" | "subtle"
}

export function ListingsClient({ listings, currentUserId, badgeVariant = "primary" }: ListingsClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [userCredits, setUserCredits] = useState(0)
  const [selectedListing, setSelectedListing] = useState<any>(null)

  // Fetch user credits if pay-to-chat is enabled
  useEffect(() => {
    if (isPayToChatEnabled() && currentUserId) {
      fetchUserCredits()
    }
  }, [currentUserId])

  const fetchUserCredits = async () => {
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setUserCredits(data.profile?.credits ?? 0)
      }
    } catch (error) {
      console.error("Error fetching credits:", error)
    }
  }

  const handleMessageOwner = async (listing: any) => {
    if (listing.user?.id === currentUserId) {
      alert("This is your own listing!")
      return
    }

    // If pay-to-chat is enabled, show credit modal first
    if (isPayToChatEnabled()) {
      setSelectedListing(listing)
      setShowCreditModal(true)
      return
    }

    // Otherwise, create conversation directly (free mode)
    await createConversation(listing)
  }

  const createConversation = async (listing: any) => {
    setLoading(listing.id)

    try {
      // Create or get conversation WITH listingId
      const data = await apiClientJson("/api/conversations", {
        method: "POST",
        body: JSON.stringify({
          otherUserId: listing.user.id,
          listingId: listing.id // Pass the listing ID
        }),
      })

      router.push(`/messages/${data.conversation.id}`)
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        // Session expired, user will be redirected to sign-in
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please sign in again.",
          variant: "destructive",
        })
        return
      }

      console.error("Error:", error)
      const errorMessage = error instanceof Error ? error.message : "An error occurred"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleConfirmStartConversation = () => {
    if (selectedListing) {
      createConversation(selectedListing)
    }
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            isAuthenticated={!!currentUserId}
            badgeVariant={badgeVariant}
            onMessage={
              currentUserId && listing.user?.id !== currentUserId
                ? () => handleMessageOwner(listing)
                : undefined
            }
          />
        ))}
      </div>

      {/* Credit Modal for Pay-to-Chat */}
      {isPayToChatEnabled() && (
        <CreditModal
          isOpen={showCreditModal}
          onClose={() => {
            setShowCreditModal(false)
            setSelectedListing(null)
          }}
          onConfirm={handleConfirmStartConversation}
          userCredits={userCredits}
          recipientName={
            selectedListing?.user?.profile?.firstName
              ? `${selectedListing.user.profile.firstName} ${selectedListing.user.profile.lastInitial || ""}`
              : "this user"
          }
        />
      )}
    </>
  )
}