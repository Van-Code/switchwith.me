"use client"

import { ListingCard } from "@/components/ListingCard"
import { CreditModal } from "@/components/CreditModal"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { isPayToChatEnabled } from "@/lib/features"

interface ListingsClientProps {
  listings: any[]
  currentUserId?: string
}

export function ListingsClient({ listings, currentUserId }: ListingsClientProps) {
  const router = useRouter()
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
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otherUserId: listing.user.id,
          listingId: listing.id // Pass the listing ID
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/messages/${data.conversation.id}`)
      } else {
        // Handle insufficient credits error
        if (response.status === 402) {
          alert(`Insufficient credits. You have ${data.currentCredits} credits but need ${data.creditsRequired}.`)
        } else {
          alert(data.error || "Failed to start conversation")
        }
      }
    } catch (error) {
      console.error("Error:", error)
      alert("An error occurred")
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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            isAuthenticated={!!currentUserId}
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