"use client"

import { X } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { ScrollArea } from "./ui/scroll-area"
import { ProfileBadge } from "./ProfileBadge"

interface SectionListingsPanelProps {
  section: string | null
  zone: string
  listings: any[]
  onClose: () => void
  onMessageOwner: (listing: any) => void
  currentUserId: string
}

export function SectionListingsPanel({
  section,
  zone,
  listings,
  onClose,
  onMessageOwner,
  currentUserId,
}: SectionListingsPanelProps) {
  if (!section) return null

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-40 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Section {section}</h2>
          <p className="text-sm text-muted-foreground">{zone}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {listings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No listings in this section
            </div>
          ) : (
            listings.map((listing) => (
              <Card key={listing.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">
                        Row {listing.haveRow}, Seat {listing.haveSeat}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(listing.gameDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Wants:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {listing.wantZones.length > 0 ? (
                        listing.wantZones.map((zone: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {zone}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">Any zone</span>
                      )}
                    </div>
                  </div>

                  {listing.user?.profile && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium mb-2">
                        {listing.user.profile.firstName}{" "}
                        {listing.user.profile.lastInitial}.
                      </p>
                      <ProfileBadge
                        successfulSwapsCount={listing.user.profile.successfulSwapsCount}
                      />
                    </div>
                  )}

                  {listing.user?.id !== currentUserId && (
                    <Button
                      onClick={() => onMessageOwner(listing)}
                      size="sm"
                      className="w-full"
                    >
                      Message Owner
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
