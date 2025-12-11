"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface PageProps {
  searchParams: { listingId?: string; ownerId?: string }
}

export default function CreateListingMessagePage({ searchParams }: PageProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const { listingId, ownerId } = searchParams

  console.log(searchParams)
  useEffect(() => {
    if (!listingId || !ownerId) {
      router.push("/listings?error=missing_params")
      return
    }

    const createConversation = async () => {
      try {
        const response = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            otherUserId: ownerId,
            listingId: listingId,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          // Redirect to the conversation
          router.push(`/messages/${data.conversation.id}`)
        } else {
          // Handle errors
          if (response.status === 402) {
            // Insufficient credits
            router.push(
              `/listings?error=insufficient_credits&required=${data.creditsRequired}&current=${data.currentCredits}`
            )
          } else {
            setError(data.error || "Failed to start conversation")
          }
        }
      } catch (err) {
        console.error("Error creating conversation:", err)
        setError("An unexpected error occurred")
      }
    }

    createConversation()
  }, [listingId, ownerId, router])

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-rose-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">{error}</p>
            <button
              onClick={() => router.push("/listings")}
              className="mt-4 text-cyan-600 hover:text-cyan-700 text-sm font-medium"
            >
              Return to listings
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Starting conversation...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Please wait while we set up your conversation.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
