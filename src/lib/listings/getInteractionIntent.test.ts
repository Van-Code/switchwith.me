import { getInteractionIntent, ListingForInteraction } from "./getInteractionIntent"

describe("getInteractionIntent", () => {
  // Helper to create a HAVE listing (has tickets)
  const createHaveListing = (
    wantZones: string[] = [],
    wantSections: string[] = []
  ): ListingForInteraction => ({
    listingType: "HAVE",
    haveSection: "101",
    haveRow: "A",
    haveSeat: "1",
    haveZone: "Lower Bowl",
    wantZones,
    wantSections,
  })

  // Helper to create a WANT listing (looking for tickets)
  const createWantListing = (
    wantZones: string[] = ["Upper Bowl"],
    wantSections: string[] = []
  ): ListingForInteraction => ({
    listingType: "WANT",
    haveSection: "",
    haveRow: "",
    haveSeat: "",
    haveZone: "",
    wantZones,
    wantSections,
  })

  describe("Rule 1: Both have tickets AND both have wants → swap", () => {
    it("should return 'swap' when both listings have tickets and wants", () => {
      const viewerListing = createHaveListing(["Upper Bowl"], [])
      const otherListing = createHaveListing(["Lower Bowl"], [])

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("swap")
    })

    it("should return 'swap' when both have tickets with section wants", () => {
      const viewerListing = createHaveListing([], ["201", "202"])
      const otherListing = createHaveListing([], ["101", "102"])

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("swap")
    })

    it("should return 'swap' when both have tickets with mixed wants", () => {
      const viewerListing = createHaveListing(["Upper Bowl"], ["201"])
      const otherListing = createHaveListing([], ["101"])

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("swap")
    })
  })

  describe("Rule 2: Viewer has tickets AND other looking for → forSale", () => {
    it("should return 'forSale' when viewer has tickets with no wants, other is WANT listing", () => {
      const viewerListing = createHaveListing([], [])
      const otherListing = createWantListing(["Lower Bowl"], [])

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("forSale")
    })

    it("should return 'forSale' when viewer has tickets, other wants specific zones", () => {
      const viewerListing = createHaveListing([], [])
      const otherListing = createWantListing(["Lower Bowl", "Club Level"], [])

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("forSale")
    })

    it("should return 'forSale' when viewer has tickets, other wants specific sections", () => {
      const viewerListing = createHaveListing([], [])
      const otherListing = createWantListing([], ["101", "102"])

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("forSale")
    })
  })

  describe("Rule 3: Viewer looking for AND other has tickets → lookingFor", () => {
    it("should return 'lookingFor' when viewer is WANT listing and other has tickets with no wants", () => {
      const viewerListing = createWantListing(["Lower Bowl"], [])
      const otherListing = createHaveListing([], [])

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("lookingFor")
    })

    it("should return 'lookingFor' when viewer wants zones and other has tickets", () => {
      const viewerListing = createWantListing(["Upper Bowl", "Club Level"], [])
      const otherListing = createHaveListing([], [])

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("lookingFor")
    })

    it("should return 'lookingFor' when viewer wants sections and other has tickets", () => {
      const viewerListing = createWantListing([], ["201", "202"])
      const otherListing = createHaveListing([], [])

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("lookingFor")
    })
  })

  describe("Rule 4: Fallback based on viewer listing", () => {
    it("should return 'swap' when viewer has tickets + wants but other has neither", () => {
      const viewerListing = createHaveListing(["Upper Bowl"], [])
      const otherListing: ListingForInteraction = {
        listingType: "HAVE",
        haveSection: "",
        haveRow: "",
        haveSeat: "",
        haveZone: "",
        wantZones: [],
        wantSections: [],
      }

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("swap")
    })

    it("should return 'forSale' when viewer has only tickets (no wants) and other has neither", () => {
      const viewerListing = createHaveListing([], [])
      const otherListing: ListingForInteraction = {
        listingType: "WANT",
        wantZones: [],
        wantSections: [],
      }

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("forSale")
    })

    it("should return 'lookingFor' when viewer has only wants and other has neither", () => {
      const viewerListing = createWantListing(["Lower Bowl"], [])
      const otherListing: ListingForInteraction = {
        haveSection: "",
        haveRow: "",
        haveSeat: "",
        wantZones: [],
        wantSections: [],
      }

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("lookingFor")
    })

    it("should return 'lookingFor' when viewer has neither tickets nor wants", () => {
      const viewerListing: ListingForInteraction = {
        wantZones: [],
        wantSections: [],
      }
      const otherListing = createHaveListing([], [])

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("lookingFor")
    })
  })

  describe("Edge cases", () => {
    it("should handle empty listings gracefully", () => {
      const viewerListing: ListingForInteraction = {}
      const otherListing: ListingForInteraction = {}

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("lookingFor")
    })

    it("should detect tickets from fields even without listingType", () => {
      const viewerListing: ListingForInteraction = {
        haveSection: "101",
        haveRow: "A",
        haveSeat: "1",
        haveZone: "Lower Bowl",
        wantZones: [],
      }
      const otherListing = createWantListing(["Lower Bowl"], [])

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("forSale")
    })

    it("should detect wants from fields even without listingType", () => {
      const viewerListing: ListingForInteraction = {
        haveSection: "101",
        haveRow: "A",
        haveSeat: "1",
        wantZones: ["Upper Bowl"],
      }
      const otherListing: ListingForInteraction = {
        haveSection: "201",
        haveRow: "B",
        haveSeat: "2",
        wantZones: ["Lower Bowl"],
      }

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("swap")
    })

    it("should prioritize rule 1 over rules 2 and 3", () => {
      // Even if both have tickets and wants, it's still a swap (not forSale or lookingFor)
      const viewerListing = createHaveListing(["Upper Bowl"], [])
      const otherListing = createHaveListing(["Lower Bowl"], [])

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("swap")
    })

    it("should handle WANT listing with both zone and section wants", () => {
      const viewerListing = createWantListing(["Lower Bowl"], ["101", "102"])
      const otherListing = createHaveListing([], [])

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("lookingFor")
    })

    it("should handle partial seat information (missing some fields)", () => {
      const viewerListing: ListingForInteraction = {
        listingType: "HAVE",
        haveSection: "101",
        haveRow: "",
        haveSeat: "",
        wantZones: [],
      }
      const otherListing = createWantListing(["Lower Bowl"], [])

      // Viewer has section but missing row and seat - should not count as "has tickets"
      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("forSale")
    })
  })

  describe("Real-world scenarios", () => {
    it("should handle: I'm selling, they're buying", () => {
      const viewerListing = createHaveListing([], []) // Has tickets, no wants
      const otherListing = createWantListing(["Lower Bowl"], []) // Looking for tickets

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("forSale")
    })

    it("should handle: I'm buying, they're selling", () => {
      const viewerListing = createWantListing(["Lower Bowl"], []) // Looking for tickets
      const otherListing = createHaveListing([], []) // Has tickets, no wants

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("lookingFor")
    })

    it("should handle: Both want to swap", () => {
      const viewerListing = createHaveListing(["Upper Bowl"], []) // Has tickets, wants different zone
      const otherListing = createHaveListing(["Lower Bowl"], []) // Has tickets, wants different zone

      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("swap")
    })

    it("should handle: I want to swap, they want to sell", () => {
      const viewerListing = createHaveListing(["Upper Bowl"], []) // Has tickets + wants
      const otherListing = createHaveListing([], []) // Has tickets, no wants

      // Viewer wants to swap, but other doesn't want anything, so it's not a mutual swap
      // Falls back to viewer's intent: has tickets + wants = swap
      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("swap")
    })

    it("should handle: I want to sell, they want to swap", () => {
      const viewerListing = createHaveListing([], []) // Has tickets, no wants
      const otherListing = createHaveListing(["Lower Bowl"], []) // Has tickets + wants

      // Viewer has tickets, other has wants (they want to swap), viewer has no wants
      // This is Rule 2: forSale
      const result = getInteractionIntent({ viewerListing, otherListing })

      expect(result).toBe("forSale")
    })
  })
})
