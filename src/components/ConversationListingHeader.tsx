import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, DollarSign } from "lucide-react"

interface ConversationListingHeaderProps {
  listing: {
    haveSection: string
    haveRow: string
    haveSeat: string
    haveZone: string
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

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-muted-foreground">Seat Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Seat Info */}
        <div>
          <div className="text-2xl font-bold mb-1">
            Section {listing.haveSection} • Row {listing.haveRow} • Seat{" "}
            {listing.haveSeat}
          </div>
          <Badge variant="secondary" className="text-sm">
            {listing.haveZone}
          </Badge>
        </div>

        {/* Game Info */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Game Date</div>
              <div className="text-muted-foreground">
                {gameDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            You're discussing this seat swap
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
