import {
  getMatchTransactionType,
  formatSeatLabel,
  formatRequestLabel,
  getScoreLabel,
  getCtaText,
  getHeaderText,
  getSubtext,
  getHelperText,
  isNewMember,
  type ListingForMatch,
} from "./matchUtils"

describe("matchUtils", () => {
  describe("getMatchTransactionType", () => {
    it("returns SWAP when both have tickets and both want something", () => {
      const viewerListing: ListingForMatch = {
        listingType: "HAVE",
        wantZones: ["Upper Bowl"],
        wantSections: ["201"],
      }
      const otherListing: ListingForMatch = {
        listingType: "HAVE",
        wantZones: ["Lower Bowl"],
        wantSections: ["101"],
      }

      expect(getMatchTransactionType({ viewerListing, otherListing })).toBe("SWAP")
    })

    it("returns SELL when viewer has tickets, other wants tickets, viewer wants nothing", () => {
      const viewerListing: ListingForMatch = {
        listingType: "HAVE",
        wantZones: [],
        wantSections: [],
      }
      const otherListing: ListingForMatch = {
        listingType: "WANT",
        wantZones: ["Lower Bowl"],
      }

      expect(getMatchTransactionType({ viewerListing, otherListing })).toBe("SELL")
    })

    it("returns BUY when viewer wants tickets, other has tickets, other wants nothing", () => {
      const viewerListing: ListingForMatch = {
        listingType: "WANT",
        wantZones: ["Lower Bowl"],
      }
      const otherListing: ListingForMatch = {
        listingType: "HAVE",
        wantZones: [],
        wantSections: [],
      }

      expect(getMatchTransactionType({ viewerListing, otherListing })).toBe("BUY")
    })

    it("returns GENERIC_ASYMMETRIC when both have tickets but neither wants anything", () => {
      const viewerListing: ListingForMatch = {
        listingType: "HAVE",
        wantZones: [],
      }
      const otherListing: ListingForMatch = {
        listingType: "HAVE",
        wantZones: [],
      }

      expect(getMatchTransactionType({ viewerListing, otherListing })).toBe("GENERIC_ASYMMETRIC")
    })
  })

  describe("formatSeatLabel", () => {
    it("formats full seat info correctly", () => {
      const listing: ListingForMatch = {
        haveSection: "101",
        haveRow: "A",
        haveSeat: "5",
        haveZone: "Lower Bowl",
      }

      expect(formatSeatLabel(listing)).toBe("Section 101, Row A, Seat 5")
    })

    it("omits missing row and seat fields", () => {
      const listing: ListingForMatch = {
        haveSection: "101",
        haveRow: "",
        haveSeat: "",
        haveZone: "Lower Bowl",
      }

      expect(formatSeatLabel(listing)).toBe("Section 101")
    })

    it("shows fallback when section is missing", () => {
      const listing: ListingForMatch = {
        haveSection: "",
        haveRow: "A",
        haveSeat: "5",
        haveZone: "Lower Bowl",
      }

      expect(formatSeatLabel(listing)).toContain("Not specified")
    })

    it("shows zone with fallback when only zone is available", () => {
      const listing: ListingForMatch = {
        haveSection: "",
        haveRow: "",
        haveSeat: "",
        haveZone: "Lower Bowl",
      }

      expect(formatSeatLabel(listing)).toBe("Lower Bowl (section not specified)")
    })

    it("returns flexible message for WANT listings", () => {
      const listing: ListingForMatch = {
        listingType: "WANT",
        haveSection: "",
        haveRow: "",
        haveSeat: "",
        haveZone: "",
      }

      expect(formatSeatLabel(listing)).toBe("Flexible on exact seat")
    })

    it("handles whitespace-only values", () => {
      const listing: ListingForMatch = {
        haveSection: "  ",
        haveRow: "  ",
        haveSeat: "  ",
        haveZone: "Lower Bowl",
      }

      expect(formatSeatLabel(listing)).toBe("Lower Bowl (section not specified)")
    })
  })

  describe("formatRequestLabel", () => {
    it("formats zones and sections together", () => {
      const listing: ListingForMatch = {
        wantZones: ["Lower Bowl", "Club Level"],
        wantSections: ["101", "102"],
      }

      const result = formatRequestLabel(listing)
      expect(result).toContain("Lower Bowl, Club Level")
      expect(result).toContain("Sec 101, Sec 102")
    })

    it("returns flexible message when no wants specified", () => {
      const listing: ListingForMatch = {
        wantZones: [],
        wantSections: [],
      }

      expect(formatRequestLabel(listing)).toBe("Flexible on location")
    })

    it("returns not requesting for HAVE listings with no wants", () => {
      const listing: ListingForMatch = {
        listingType: "HAVE",
        wantZones: [],
        wantSections: [],
      }

      expect(formatRequestLabel(listing)).toBe("Not requesting a swap")
    })

    it("shows only zones when sections are empty", () => {
      const listing: ListingForMatch = {
        wantZones: ["Lower Bowl"],
        wantSections: [],
      }

      expect(formatRequestLabel(listing)).toBe("Lower Bowl")
    })

    it("shows only sections when zones are empty", () => {
      const listing: ListingForMatch = {
        wantZones: [],
        wantSections: ["101"],
      }

      expect(formatRequestLabel(listing)).toBe("Sec 101")
    })
  })

  describe("getScoreLabel", () => {
    it("returns 'Strong match' for scores >= 100", () => {
      expect(getScoreLabel(100)).toBe("Strong match")
      expect(getScoreLabel(150)).toBe("Strong match")
      expect(getScoreLabel(200)).toBe("Strong match")
    })

    it("returns 'Good match' for scores 50-99", () => {
      expect(getScoreLabel(50)).toBe("Good match")
      expect(getScoreLabel(75)).toBe("Good match")
      expect(getScoreLabel(99)).toBe("Good match")
    })

    it("returns 'Low match' for scores < 50", () => {
      expect(getScoreLabel(0)).toBe("Low match")
      expect(getScoreLabel(25)).toBe("Low match")
      expect(getScoreLabel(49)).toBe("Low match")
    })
  })

  describe("getCtaText", () => {
    it("returns correct CTA for each transaction type", () => {
      expect(getCtaText("SWAP")).toBe("Start swap chat")
      expect(getCtaText("SELL")).toBe("Offer your seat")
      expect(getCtaText("BUY")).toBe("Message seller")
      expect(getCtaText("GIVEAWAY")).toBe("Message giver")
      expect(getCtaText("GENERIC_ASYMMETRIC")).toBe("Start conversation")
    })
  })

  describe("getHeaderText", () => {
    it("returns correct header for each transaction type", () => {
      expect(getHeaderText("SWAP")).toBe("Swap match")
      expect(getHeaderText("SELL")).toBe("Someone wants your seat")
      expect(getHeaderText("BUY")).toBe("You requested their seat")
      expect(getHeaderText("GIVEAWAY")).toBe("Giveaway match")
      expect(getHeaderText("GENERIC_ASYMMETRIC")).toBe("Potential match")
    })
  })

  describe("getSubtext", () => {
    it("generates correct subtext for SWAP", () => {
      const viewerListing: ListingForMatch = {
        wantZones: ["Upper Bowl"],
      }
      const otherListing: ListingForMatch = {
        wantZones: ["Lower Bowl"],
      }

      const result = getSubtext("SWAP", viewerListing, otherListing)
      expect(result).toContain("You want")
      expect(result).toContain("they want")
    })

    it("generates correct subtext for SELL", () => {
      const viewerListing: ListingForMatch = {
        haveZone: "Lower Bowl",
      }
      const otherListing: ListingForMatch = {
        wantZones: ["Lower Bowl"],
      }

      const result = getSubtext("SELL", viewerListing, otherListing)
      expect(result).toContain("They're looking for")
      expect(result).toContain("You're offering")
    })

    it("generates correct subtext for BUY", () => {
      const viewerListing: ListingForMatch = {
        wantZones: ["Lower Bowl"],
      }
      const otherListing: ListingForMatch = {
        haveZone: "Lower Bowl",
      }

      const result = getSubtext("BUY", viewerListing, otherListing)
      expect(result).toContain("You're looking for")
      expect(result).toContain("They're offering")
    })

    it("generates correct subtext for GIVEAWAY", () => {
      const result = getSubtext("GIVEAWAY", {} as any, {} as any)
      expect(result).toContain("free")
      expect(result).toContain("chat")
    })

    it("generates correct subtext for GENERIC_ASYMMETRIC", () => {
      const result = getSubtext("GENERIC_ASYMMETRIC", {} as any, {} as any)
      expect(result).toContain("Compare")
      expect(result).toContain("message")
    })
  })

  describe("getHelperText", () => {
    it("returns correct helper text for each transaction type", () => {
      expect(getHelperText("SWAP")).toContain("confirm seats, game, and transfer")
      expect(getHelperText("SELL")).toContain("not swapping seats")
      expect(getHelperText("BUY")).toContain("This is a request")
      expect(getHelperText("GIVEAWAY")).toContain("transfer method")
      expect(getHelperText("GENERIC_ASYMMETRIC")).toContain("Review both listings")
    })
  })

  describe("isNewMember", () => {
    it("returns true for users created within last 30 days", () => {
      const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      expect(isNewMember(fifteenDaysAgo)).toBe(true)
    })

    it("returns false for users created more than 30 days ago", () => {
      const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
      expect(isNewMember(fortyDaysAgo)).toBe(false)
    })

    it("returns true for users created exactly 29 days ago", () => {
      const twentyNineDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
      expect(isNewMember(twentyNineDaysAgo)).toBe(true)
    })

    it("returns false for users created exactly 31 days ago", () => {
      const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000)
      expect(isNewMember(thirtyOneDaysAgo)).toBe(false)
    })

    it("accepts string dates", () => {
      const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      expect(isNewMember(fifteenDaysAgo)).toBe(true)
    })
  })
})
