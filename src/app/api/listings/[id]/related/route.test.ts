/**
 * @jest-environment node
 */
import { GET } from "./route"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    listing: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

describe("GET /api/listings/[id]/related", () => {
  const mockListingId = "listing-123"
  const mockGameDate = new Date("2024-12-25")

  const mockOriginalListing = {
    id: mockListingId,
    teamId: 1,
    gameDate: mockGameDate,
    haveSection: "101",
    haveRow: "A",
    haveSeat: "5",
    haveZone: "Lower Bowl",
    team: {
      id: 1,
      name: "Lakers",
      slug: "lakers",
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Validation", () => {
    it("returns 404 if listing not found", async () => {
      ;(prisma.listing.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await GET(
        new NextRequest("http://localhost/api/listings/listing-123/related"),
        { params: { id: mockListingId } }
      )

      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe("Listing not found")
    })
  })

  describe("Related Listings Query", () => {
    beforeEach(() => {
      ;(prisma.listing.findUnique as jest.Mock).mockResolvedValue(mockOriginalListing)
    })

    it("excludes the current listing from results", async () => {
      ;(prisma.listing.findMany as jest.Mock).mockResolvedValue([])

      await GET(new NextRequest("http://localhost/api/listings/listing-123/related"), {
        params: { id: mockListingId },
      })

      expect(prisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({ id: { not: mockListingId } }),
            ]),
          }),
        })
      )
    })

    it("only returns ACTIVE listings", async () => {
      ;(prisma.listing.findMany as jest.Mock).mockResolvedValue([])

      await GET(new NextRequest("http://localhost/api/listings/listing-123/related"), {
        params: { id: mockListingId },
      })

      expect(prisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([expect.objectContaining({ status: "ACTIVE" })]),
          }),
        })
      )
    })

    it("filters by same team", async () => {
      ;(prisma.listing.findMany as jest.Mock).mockResolvedValue([])

      await GET(new NextRequest("http://localhost/api/listings/listing-123/related"), {
        params: { id: mockListingId },
      })

      expect(prisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({ teamId: mockOriginalListing.teamId }),
            ]),
          }),
        })
      )
    })

    it("filters by game date within 2 weeks", async () => {
      ;(prisma.listing.findMany as jest.Mock).mockResolvedValue([])

      await GET(new NextRequest("http://localhost/api/listings/listing-123/related"), {
        params: { id: mockListingId },
      })

      // Verify date range is applied
      expect(prisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                gameDate: expect.objectContaining({
                  gte: expect.any(Date),
                  lte: expect.any(Date),
                }),
              }),
            ]),
          }),
        })
      )
    })

    it("limits results to 6 listings", async () => {
      ;(prisma.listing.findMany as jest.Mock).mockResolvedValue([])

      await GET(new NextRequest("http://localhost/api/listings/listing-123/related"), {
        params: { id: mockListingId },
      })

      expect(prisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 6,
        })
      )
    })

    it("prioritizes boosted listings", async () => {
      ;(prisma.listing.findMany as jest.Mock).mockResolvedValue([])

      await GET(new NextRequest("http://localhost/api/listings/listing-123/related"), {
        params: { id: mockListingId },
      })

      expect(prisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expect.arrayContaining([expect.objectContaining({ boosted: "desc" })]),
        })
      )
    })
  })

  describe("Relevance Scoring", () => {
    beforeEach(() => {
      ;(prisma.listing.findUnique as jest.Mock).mockResolvedValue(mockOriginalListing)
    })

    it("returns listings sorted by relevance score", async () => {
      const relatedListings = [
        {
          id: "listing-1",
          teamId: 1,
          gameDate: new Date("2024-12-26"),
          haveSection: "101", // Same section (+5 points)
          haveRow: "B",
          haveSeat: "6",
          haveZone: "Lower Bowl", // Same zone (+3 points)
          wantZones: [],
          wantSections: [],
          team: mockOriginalListing.team,
          user: { id: "user-1", profile: {} },
        },
        {
          id: "listing-2",
          teamId: 1,
          gameDate: new Date("2024-12-30"),
          haveSection: "201",
          haveRow: "C",
          haveSeat: "7",
          haveZone: "Upper Bowl",
          wantZones: ["Lower Bowl"], // Wants include original zone (+2 points)
          wantSections: [],
          team: mockOriginalListing.team,
          user: { id: "user-2", profile: {} },
        },
      ]

      ;(prisma.listing.findMany as jest.Mock).mockResolvedValue(relatedListings)

      const response = await GET(
        new NextRequest("http://localhost/api/listings/listing-123/related"),
        { params: { id: mockListingId } }
      )

      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.listings).toHaveLength(2)

      // First listing should have higher score (same section + zone + close price)
      // vs second listing (only wants match)
      expect(data.listings[0].id).toBe("listing-1")
    })

    it("returns maximum of 6 listings even if more match", async () => {
      const manyListings = Array.from({ length: 10 }, (_, i) => ({
        id: `listing-${i}`,
        teamId: 1,
        gameDate: new Date("2024-12-26"),
        haveSection: "102",
        haveRow: "A",
        haveSeat: "1",
        haveZone: "Lower Bowl",
        wantZones: [],
        wantSections: [],
        team: mockOriginalListing.team,
        user: { id: `user-${i}`, profile: {} },
      }))

      ;(prisma.listing.findMany as jest.Mock).mockResolvedValue(manyListings)

      const response = await GET(
        new NextRequest("http://localhost/api/listings/listing-123/related"),
        { params: { id: mockListingId } }
      )

      const data = await response.json()

      expect(data.listings.length).toBeLessThanOrEqual(6)
    })
  })

  describe("Error Handling", () => {
    it("returns 500 on database error", async () => {
      ;(prisma.listing.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      )

      const response = await GET(
        new NextRequest("http://localhost/api/listings/listing-123/related"),
        { params: { id: mockListingId } }
      )

      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe("Failed to fetch related listings")
    })
  })
})
