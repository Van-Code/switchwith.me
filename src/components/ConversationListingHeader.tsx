import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"

interface ConversationListingHeaderProps {
  listing: {
    listingType: string
    haveSection: string
    haveRow: string
    haveSeat: string
    haveZone: string
    wantZones: string[]
    wantSections: string[]
    gameDate: Date | string
    gameId?: string | null
  } | null
}

export function ConversationListingHeader({ listing }: ConversationListingHeaderProps) {
  if (!listing) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center italic">
            No listing attached to this conversation
          </p>
        </CardContent>
      </Card>
    )
  }

  const gameDate = new Date(listing.gameDate)
  const isHaveListing = listing.listingType === "HAVE"

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-muted-foreground">
          {isHaveListing ? "Seat Details" : "Looking For"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Seat Info */}
        {isHaveListing ? (
          <div>
            <div className="text-2xl font-bold mb-1">
              Section {listing.haveSection} • Row {listing.haveRow} • Seat {listing.haveSeat}
            </div>
            <Badge variant="secondary" className="text-sm">
              {listing.haveZone}
            </Badge>
          </div>
        ) : (
          <div>
            <div className="text-lg font-semibold mb-2">
              This person is looking for tickets
            </div>
            {listing.wantZones.length > 0 && (
              <div className="mb-2">
                <span className="text-sm text-muted-foreground">Preferred Zones: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {listing.wantZones.map((zone, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {zone}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {listing.wantSections.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground">Preferred Sections: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {listing.wantSections.map((section, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {section}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {listing.wantZones.length === 0 && listing.wantSections.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Open to any section or zone
              </p>
            )}
          </div>
        )}

        {/* Game Info */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">Game Date</div>
            <div className="text-muted-foreground">
              {gameDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                timeZone: 'UTC'
              })}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            {isHaveListing ? "You're discussing this seat swap" : "You're discussing this ticket request"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
