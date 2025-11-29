"use client"

import { ListingCard } from "../../components/ListingCard"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface ListingsClientProps {
  listings: any[]
  currentUserId?: string
}

export function ListingsClient({ listings, currentUserId }: ListingsClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleMessageOwner = async (listing: any) => {
    if (listing.user?.id === currentUserId) {
      alert("This is your own listing!")
      return
    }

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

      if (response.ok) {
        const { conversation } = await response.json()
        router.push(`/messages/${conversation.id}`)
      } else {
        alert("Failed to start conversation")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("An error occurred")
    } finally {
      setLoading(null)
    }
  }

  return (
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
  )
}