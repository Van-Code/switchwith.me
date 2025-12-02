"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function BoostListingButton({ listingId }: { listingId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleBoost = async () => {
    if (!confirm("Boost this listing? This will promote it to appear first in search results.")) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/listings/${listingId}/boost`, {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to boost listing")
      }

      // Refresh the page to show updated listing
      router.refresh()
      alert("Listing boosted successfully!")
    } catch (error) {
      console.error("Error boosting listing:", error)
      alert(error instanceof Error ? error.message : "Failed to boost listing")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleBoost}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="w-full border-amber-500 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
    >
      <Sparkles className="h-4 w-4 mr-2" />
      {isLoading ? "Boosting..." : "Boost Listing"}
    </Button>
  )
}
