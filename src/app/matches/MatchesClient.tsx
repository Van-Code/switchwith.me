"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MatchCard, type MatchCardListing } from "@/components/MatchCard"

interface MatchData {
  myListing: MatchCardListing
  matchedListing: MatchCardListing
  score: number
  reason: string
}

interface MatchesClientProps {
  currentUserId: string
}

export function MatchesClient({ currentUserId }: MatchesClientProps) {
  const router = useRouter()
  const [matches, setMatches] = useState<MatchData[]>([])
  const [loading, setLoading] = useState(true)
  const [messagingLoading, setMessagingLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const response = await fetch("/api/matches")
      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches)
      }
    } catch (error) {
      console.error("Error fetching matches:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMessageOwner = async (otherUserId: string, listingId: string) => {
    setMessagingLoading(otherUserId)
  
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          otherUserId,
          listingId // Pass the listing ID
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
      setMessagingLoading(null)
    }
  }

  if (loading) {
    return <div className="text-slate-600">Loading matches...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Your Matches</h1>
        <p className="text-slate-600">Matches and requests based on your listings</p>
      </div>

      {matches.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-12 text-center">
            <p className="text-slate-600 mb-4">No matches found yet.</p>
            <Link href="/listings/new">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">Create a listing to find matches</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {matches.map((match, index) => (
            <MatchCard
              key={index}
              myListing={match.myListing}
              matchedListing={match.matchedListing}
              score={match.score}
              reason={match.reason}
              onMessageClick={() => handleMessageOwner(
                match.matchedListing.user!.id,
                match.matchedListing.id
              )}
              isLoading={messagingLoading === match.matchedListing.user?.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}