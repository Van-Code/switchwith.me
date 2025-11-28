import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { ProfileBadge } from "./ProfileBadge"
import { Calendar, MapPin, DollarSign } from "lucide-react"

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
        successfulSwapsCount: number
      } | null
    }
  }
  onMessage?: () => void
  showOwner?: boolean
}

export function ListingCard({ listing, onMessage, showOwner = true }: ListingCardProps) {
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

        {showOwner && listing.user?.profile && (
          <div className="pt-3 border-t">
            <p className="text-sm font-medium mb-2">
              {listing.user.profile.firstName} {listing.user.profile.lastInitial}.
            </p>
            <ProfileBadge
              successfulSwapsCount={listing.user.profile.successfulSwapsCount}
            />
          </div>
        )}
      </CardContent>
      
      {onMessage && listing.status === "ACTIVE" && (
        <CardFooter>
          <Button onClick={onMessage} className="w-full">
            Message Owner
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}