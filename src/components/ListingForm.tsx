"use client"

import { useState, useEffect } from "react"
import { LoadingButton } from "./LoadingButton"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { useRouter } from "next/navigation"

interface Team {
  id: number
  name: string
  slug: string
  logoUrl: string | null
}

export function ListingForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [formData, setFormData] = useState({
    teamId: "",
    gameDate: "",
    listingType: "HAVE",
    haveSection: "",
    haveRow: "",
    haveSeat: "",
    wantZones: "",
    wantSections: "",
    willingToAddCash: false,
    price: "",
    seatCount: "",
    flexible: false,
  })

  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data.teams))
      .catch((err) => console.error("Failed to fetch teams:", err))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const priceCents = formData.price ? Math.round(parseFloat(formData.price) * 100) : null
      const seatCount = formData.seatCount ? parseInt(formData.seatCount) : null

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          teamId: parseInt(formData.teamId),
          gameDate: formData.gameDate, // Send as YYYY-MM-DD string, let API handle conversion
          listingType: formData.listingType,
          wantZones: formData.wantZones
            .split(",")
            .map((z) => z.trim())
            .filter(Boolean),
          wantSections: formData.wantSections
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          priceCents,
          seatCount,
          flexible: formData.flexible,
        }),
      })

      if (response.ok) {
        router.push("/listings")
      } else {
        alert("Failed to create listing")
      }
    } catch (error) {
      console.error("Error creating listing:", error)
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Listing Type</Label>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {formData.listingType === "HAVE" ? "Has tickets" : "Wants tickets"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.listingType === "HAVE"
                    ? "You currently have tickets and want to trade them"
                    : "You're looking for tickets and want someone to trade with you"}
                </p>
              </div>
              <Switch
                id="listingTypeSwitch"
                checked={formData.listingType === "WANT"}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, listingType: checked ? "WANT" : "HAVE" })
                }
                aria-label="Toggle listing type between Has tickets and Wants tickets"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="teamId">
              Team{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </Label>
            <select
              id="teamId"
              required
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="gameDate">
              Game Date{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </Label>
            <Input
              id="gameDate"
              type="date"
              required
              value={formData.gameDate}
              onChange={(e) => setFormData({ ...formData, gameDate: e.target.value })}
            />
          </div>

          {formData.listingType === "HAVE" && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="haveSection">
                    Section{" "}
                    <span className="text-red-500" aria-label="required">
                      *
                    </span>
                  </Label>
                  <Input
                    id="haveSection"
                    required={formData.listingType === "HAVE"}
                    placeholder="101"
                    value={formData.haveSection}
                    onChange={(e) =>
                      setFormData({ ...formData, haveSection: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="haveRow">
                    Row{" "}
                    <span className="text-red-500" aria-label="required">
                      *
                    </span>
                  </Label>
                  <Input
                    id="haveRow"
                    required={formData.listingType === "HAVE"}
                    placeholder="A"
                    value={formData.haveRow}
                    onChange={(e) =>
                      setFormData({ ...formData, haveRow: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="haveSeat">
                    Seat{" "}
                    <span className="text-red-500" aria-label="required">
                      *
                    </span>
                  </Label>
                  <Input
                    id="haveSeat"
                    required={formData.listingType === "HAVE"}
                    placeholder="1"
                    value={formData.haveSeat}
                    onChange={(e) =>
                      setFormData({ ...formData, haveSeat: e.target.value })
                    }
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="wantZones">Want Zones (comma-separated)</Label>
            <Input
              id="wantZones"
              placeholder="Lower Bowl Center, Lower Bowl Corner"
              value={formData.wantZones}
              onChange={(e) => setFormData({ ...formData, wantZones: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to accept any zone
            </p>
          </div>

          <div>
            <Label htmlFor="wantSections">Want Sections (comma-separated)</Label>
            <Input
              id="wantSections"
              placeholder="101, 102, 103"
              value={formData.wantSections}
              onChange={(e) => setFormData({ ...formData, wantSections: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to accept any section
            </p>
          </div>

          <div>
            <Label htmlFor="price">Selling Price (optional)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty if not selling for a specific price
            </p>
          </div>

          <div>
            <Label htmlFor="seatCount">Number of Seats</Label>
            <Input
              id="seatCount"
              type="number"
              min="1"
              max="10"
              placeholder="1"
              value={formData.seatCount}
              onChange={(e) => setFormData({ ...formData, seatCount: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              How many seats are you listing?
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="willingToAddCash"
              checked={formData.willingToAddCash}
              onChange={(e) =>
                setFormData({ ...formData, willingToAddCash: e.target.checked })
              }
              className="h-4 w-4"
            />
            <Label htmlFor="willingToAddCash" className="font-normal">
              Willing to add cash for upgrade
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="flexible"
              checked={formData.flexible}
              onChange={(e) =>
                setFormData({ ...formData, flexible: e.target.checked })
              }
              className="h-4 w-4"
            />
            <Label htmlFor="flexible" className="font-normal">
              Flexible (open to options outside exact wants)
            </Label>
          </div>

          <LoadingButton
            type="submit"
            isLoading={loading}
            loadingText="Creating..."
            className="w-full"
          >
            Create Listing
          </LoadingButton>
        </form>
      </CardContent>
    </Card>
  )
}
