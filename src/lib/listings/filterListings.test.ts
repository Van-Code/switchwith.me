import { filterListingsByTab, filterListingsBySeatCount } from "./filterListings"

describe("filterListingsByTab", () => {
  const mockListings = [
    {
      id: "1",
      listingType: "HAVE",
      haveSection: "101",
      haveRow: "A",
      haveSeat: "1",
      wantZones: ["Lower Bowl"],
      wantSections: [],
    },
    {
      id: "2",
      listingType: "HAVE",
      haveSection: "102",
      haveRow: "B",
      haveSeat: "2",
      wantZones: [],
      wantSections: [],
      priceCents: 5000,
    },
    {
      id: "3",
      listingType: "WANT",
      wantZones: ["Upper Bowl"],
      wantSections: ["201"],
    },
  ]

  it("should return all listings for 'all' tab", () => {
    const result = filterListingsByTab(mockListings, "all")
    expect(result).toHaveLength(3)
  })

  it("should filter to show only 'For Sale' listings", () => {
    const result = filterListingsByTab(mockListings, "for-sale")
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("2")
  })

  it("should filter to show only 'Looking For' listings", () => {
    const result = filterListingsByTab(mockListings, "looking-for")
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("3")
  })

  it("should filter to show only 'Swap' listings", () => {
    const result = filterListingsByTab(mockListings, "swap")
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("1")
  })
})

describe("filterListingsBySeatCount", () => {
  const mockListings = [
    {
      id: "1",
      listingType: "HAVE",
      haveSection: "101",
      haveRow: "A",
      haveSeat: "1",
      wantZones: [],
      seatCount: 2,
    },
    {
      id: "2",
      listingType: "WANT",
      wantZones: ["Lower Bowl"],
      seatCount: 4,
    },
    {
      id: "3",
      listingType: "HAVE",
      haveSection: "102",
      haveRow: "B",
      haveSeat: "2",
      wantZones: [],
      seatCount: null,
    },
  ]

  it("should return all listings for 'any' seat count", () => {
    const result = filterListingsBySeatCount(mockListings, "any")
    expect(result).toHaveLength(3)
  })

  it("should filter FOR_SALE listings with at least requested seats", () => {
    const result = filterListingsBySeatCount(mockListings, 2)
    expect(result.map((l) => l.id)).toContain("1")
    expect(result.map((l) => l.id)).toContain("3") // null seatCount is included
  })

  it("should filter LOOKING_FOR listings by exact seat count", () => {
    const result = filterListingsBySeatCount(mockListings, 4)
    expect(result.map((l) => l.id)).toContain("2")
  })

  it("should exclude LOOKING_FOR listings with different seat count", () => {
    const result = filterListingsBySeatCount(mockListings, 2)
    expect(result.map((l) => l.id)).not.toContain("2")
  })

  it("should include LOOKING_FOR listings with null seat count", () => {
    const listingsWithNull = [
      {
        id: "4",
        listingType: "WANT",
        wantZones: ["Any"],
        seatCount: null,
      },
    ]
    const result = filterListingsBySeatCount(listingsWithNull, 2)
    expect(result).toHaveLength(1)
  })
})
