import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Calendar, MapPin, DollarSign } from "lucide-react"
import Link from "next/link"

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
    user?: {
      id: string
      profile?: {
        firstName: string
        lastInitial: string
      } | null
    }
  }
  onMessage?: () => void
  isAuthenticated?: boolean
}

export function ListingCard({ listing, onMessage, isAuthenticated = false }: ListingCardProps) {
  const gameDate = new Date(listing.gameDate)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              Section {listing.haveSection}, Row {listing.haveRow}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Seat {listing.haveSeat} • {listing.haveZone}
            </p>
          </div>
          <Badge variant={listing.status === "ACTIVE" ? "default" : "secondary"}>
            {listing.status}
          </Badge>
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