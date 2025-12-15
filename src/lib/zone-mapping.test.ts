import { inferZoneFromSection, hasKnownZone } from "./zone-mapping"

describe("zone-mapping", () => {
  describe("inferZoneFromSection", () => {
    it("should infer Lower Bowl for 100-series sections", () => {
      expect(inferZoneFromSection("101")).toBe("Lower Bowl")
      expect(inferZoneFromSection("110")).toBe("Lower Bowl")
      expect(inferZoneFromSection("119")).toBe("Lower Bowl")
      expect(inferZoneFromSection("129")).toBe("Lower Bowl")
    })

    it("should infer Upper Bowl for 200-series sections", () => {
      expect(inferZoneFromSection("201")).toBe("Upper Bowl")
      expect(inferZoneFromSection("210")).toBe("Upper Bowl")
      expect(inferZoneFromSection("229")).toBe("Upper Bowl")
      expect(inferZoneFromSection("239")).toBe("Upper Bowl")
    })

    it("should infer Club Level for C-prefix sections", () => {
      expect(inferZoneFromSection("C1")).toBe("Club Level")
      expect(inferZoneFromSection("C12")).toBe("Club Level")
      expect(inferZoneFromSection("c5")).toBe("Club Level") // case insensitive
    })

    it("should infer Suite for S-prefix sections", () => {
      expect(inferZoneFromSection("S1")).toBe("Suite")
      expect(inferZoneFromSection("S10")).toBe("Suite")
      expect(inferZoneFromSection("s3")).toBe("Suite") // case insensitive
    })

    it("should infer Floor for FL or F prefix sections", () => {
      expect(inferZoneFromSection("FL1")).toBe("Floor")
      expect(inferZoneFromSection("FL10")).toBe("Floor")
      expect(inferZoneFromSection("F5")).toBe("Floor")
      expect(inferZoneFromSection("fl2")).toBe("Floor") // case insensitive
    })

    it("should return Unknown for unrecognized sections", () => {
      expect(inferZoneFromSection("999")).toBe("Unknown")
      expect(inferZoneFromSection("XYZ")).toBe("Unknown")
      expect(inferZoneFromSection("50")).toBe("Unknown")
      expect(inferZoneFromSection("")).toBe("Unknown")
    })

    it("should handle edge cases", () => {
      expect(inferZoneFromSection("100")).toBe("Lower Bowl")
      expect(inferZoneFromSection("130")).toBe("Unknown")
      expect(inferZoneFromSection("200")).toBe("Upper Bowl")
      expect(inferZoneFromSection("240")).toBe("Unknown")
    })

    it("should trim whitespace", () => {
      expect(inferZoneFromSection(" 101 ")).toBe("Lower Bowl")
      expect(inferZoneFromSection(" C1 ")).toBe("Club Level")
    })
  })

  describe("hasKnownZone", () => {
    it("should return true for sections with known zones", () => {
      expect(hasKnownZone("101")).toBe(true)
      expect(hasKnownZone("201")).toBe(true)
      expect(hasKnownZone("C1")).toBe(true)
    })

    it("should return false for sections without known zones", () => {
      expect(hasKnownZone("999")).toBe(false)
      expect(hasKnownZone("XYZ")).toBe(false)
      expect(hasKnownZone("")).toBe(false)
    })
  })
})
