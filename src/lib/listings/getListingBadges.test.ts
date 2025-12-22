import { getListingBadges } from "./getListingBadges"

describe("getListingBadges", () => {
  describe("Primary badge determination", () => {
    it("should return 'Swap' for listings with both tickets and wants", () => {
      const result = getListingBadges({
        listingType: "HAVE",
        haveSection: "101",
        haveRow: "A",
        haveSeat: "1",
        wantZones: ["Lower Bowl"],
        wantSections: [],
      })

      expect(result.primary).toBe("Swap")
    })

    it("should return 'For Sale' for listings with only tickets", () => {
      const result = getListingBadges({
        listingType: "HAVE",
        haveSection: "101",
        haveRow: "A",
        haveSeat: "1",
        wantZones: [],
        wantSections: [],
      })

      expect(result.primary).toBe("For Sale")
    })

    it("should return 'For Sale' for listings with tickets and price", () => {
      const result = getListingBadges({
        listingType: "HAVE",
        haveSection: "101",
        haveRow: "A",
        haveSeat: "1",
        wantZones: [],
        wantSections: [],
        priceCents: 5000,
      })

      expect(result.primary).toBe("For Sale")
    })

    it("should return 'Looking For' for WANT listings", () => {
      const result = getListingBadges({
        listingType: "WANT",
        wantZones: ["Lower Bowl"],
        wantSections: ["101", "102"],
      })

      expect(result.primary).toBe("Looking For")
    })

    it("should return 'Looking For' for listings with only wants", () => {
      const result = getListingBadges({
        wantZones: ["Lower Bowl"],
        wantSections: [],
      })

      expect(result.primary).toBe("Looking For")
    })
  })

  describe("Secondary badge (Flexible) determination", () => {
    it("should return 'Flexible' when flexible field is true", () => {
      const result = getListingBadges({
        listingType: "HAVE",
        haveSection: "101",
        haveRow: "A",
        haveSeat: "1",
        wantZones: ["Lower Bowl"],
        flexible: true,
      })

      expect(result.secondary).toBe("Flexible")
    })

    it("should return 'Flexible' when wantZones includes 'Any'", () => {
      const result = getListingBadges({
        listingType: "WANT",
        wantZones: ["Any"],
      })

      expect(result.secondary).toBe("Flexible")
    })

    it("should return 'Flexible' when wantZones includes 'any' (case insensitive)", () => {
      const result = getListingBadges({
        listingType: "WANT",
        wantZones: ["any zone"],
      })

      expect(result.secondary).toBe("Flexible")
    })

    it("should return null when flexible is false and no 'any' zone", () => {
      const result = getListingBadges({
        listingType: "WANT",
        wantZones: ["Lower Bowl"],
        flexible: false,
      })

      expect(result.secondary).toBeNull()
    })

    it("should return null when no flexible indicator is present", () => {
      const result = getListingBadges({
        listingType: "HAVE",
        haveSection: "101",
        haveRow: "A",
        haveSeat: "1",
      })

      expect(result.secondary).toBeNull()
    })
  })

  describe("Edge cases", () => {
    it("should handle empty listing", () => {
      const result = getListingBadges({})

      expect(result.primary).toBe("Looking For")
      expect(result.secondary).toBeNull()
    })

    it("should handle Swap with Flexible", () => {
      const result = getListingBadges({
        listingType: "HAVE",
        haveSection: "101",
        haveRow: "A",
        haveSeat: "1",
        wantZones: ["Any"],
        flexible: true,
      })

      expect(result.primary).toBe("Swap")
      expect(result.secondary).toBe("Flexible")
    })

    it("should handle For Sale with price but also wants (Swap takes precedence)", () => {
      const result = getListingBadges({
        listingType: "HAVE",
        haveSection: "101",
        haveRow: "A",
        haveSeat: "1",
        wantZones: ["Lower Bowl"],
        priceCents: 5000,
      })

      expect(result.primary).toBe("Swap")
    })
  })
})
