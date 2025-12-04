import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Calendar, MapPin, DollarSign, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface ListingCardProps {
  listing: {
    id: string
    gameDate: Date | string
    haveSection: string
    haveRow: string
    haveSeat: string
    haveZone: string
    faceValue: number
    wantZones: string[]
    wantSections: string[]
    status: string
    boosted?: boolean
    boostedAt?: Date | string | null
    team?: {
      id: number
      name: string
      slug: string
      logoUrl: string | null
    }
    user?: {
      id: string
      profile?: {
        firstName: string
        lastInitial: string | null
      } | null
    }
  }
  onMessage?: () => void
  isAuthenticated?: boolean
}

export function ListingCard({ listing, onMessage, isAuthenticated = false }: ListingCardProps) {
  const gameDate = new Date(listing.gameDate)

  // Determine zone category for preview mode
  const getZoneCategory = (zone: string): string => {
    const zoneLower = zone.toLowerCase()
    if (zoneLower.includes('lower') || zoneLower.includes('floor')) return 'Lower Bowl'
    if (zoneLower.includes('upper')) return 'Upper Bowl'
    if (zoneLower.includes('club') || zoneLower.includes('suite')) return 'Club/Suite'
    return 'General Seating'
  }

  return (
    <Card className={listing.boosted ? "border-2 border-amber-400 bg-gradient-to-br from-amber-50/50 to-transparent shadow-lg" : ""}>
      <CardHeader>
        {listing.team && (
          <div className="flex items-center gap-2 mb-3">
            {listing.team.logoUrl && (
              <div className="relative w-6 h-6">
                <Image
                  src={listing.team.logoUrl}
                  alt={`${listing.team.name} logo`}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <span className="text-sm font-semibold text-slate-700">
              {listing.team.name}
            </span>
          </div>
        )}
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {isAuthenticated ? (
                <>Section {listing.haveSection}, Row {listing.haveRow}</>
              ) : (
                <>{getZoneCategory(listing.haveZone)}</>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isAuthenticated ? (
                <>Seat {listing.haveSeat} • {listing.haveZone}</>
              ) : (
                <>Sign in to see exact location</>
              )}
            </p>
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            {listing.boosted && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                Boosted
              </Badge>
            )}
            <Badge variant={listing.status === "ACTIVE" ? "default" : "secondary"}>
              {listing.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{gameDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
          })}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span>Face Value: ${listing.faceValue.toFixed(2)}</span>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">Wants:</p>
          <div className="flex flex-wrap gap-1">
            {listing.wantZones.length > 0 ? (
              listing.wantZones.map((zone, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {zone}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Any zone</span>
            )}
          </div>
          {listing.wantSections.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {listing.wantSections.map((section, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  Section {section}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {isAuthenticated && listing.user?.profile && (
          <div className="pt-3 border-t">
            <span className="text-xs text-muted-foreground">Listed by</span>
            <p className="text-sm font-medium mt-0.5">
              {listing.user.profile.firstName} {listing.user.profile.lastInitial}.
            </p>
          </div>
        )}
      </CardContent>

      {listing.status === "ACTIVE" && (
        <CardFooter>
          {!isAuthenticated ? (
            <Link href="/auth/signin" className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                Sign in to contact
              </Button>
            </Link>
          ) : onMessage ? (
            <Button onClick={onMessage} className="w-full">
              Message Owner
            </Button>
          ) : null}
        </CardFooter>
      )}
    </Card>
  )
}