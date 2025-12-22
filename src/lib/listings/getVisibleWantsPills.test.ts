import { getVisibleWantsPills } from "./getVisibleWantsPills"

describe("getVisibleWantsPills", () => {
  it("should return all items when count is 2 or less", () => {
    const result = getVisibleWantsPills(["Zone A", "Zone B"])
    expect(result.visible).toEqual(["Zone A", "Zone B"])
    expect(result.overflowCount).toBe(0)
  })

  it("should return first 2 items and overflow count for more than 2", () => {
    const result = getVisibleWantsPills(["Zone A", "Zone B", "Zone C", "Zone D"])
    expect(result.visible).toEqual(["Zone A", "Zone B"])
    expect(result.overflowCount).toBe(2)
  })

  it("should handle single item", () => {
    const result = getVisibleWantsPills(["Zone A"])
    expect(result.visible).toEqual(["Zone A"])
    expect(result.overflowCount).toBe(0)
  })

  it("should handle empty array", () => {
    const result = getVisibleWantsPills([])
    expect(result.visible).toEqual([])
    expect(result.overflowCount).toBe(0)
  })

  it("should handle exactly 3 items", () => {
    const result = getVisibleWantsPills(["Zone A", "Zone B", "Zone C"])
    expect(result.visible).toEqual(["Zone A", "Zone B"])
    expect(result.overflowCount).toBe(1)
  })

  it("should handle large arrays", () => {
    const largeArray = Array.from({ length: 10 }, (_, i) => `Zone ${i + 1}`)
    const result = getVisibleWantsPills(largeArray)
    expect(result.visible).toEqual(["Zone 1", "Zone 2"])
    expect(result.overflowCount).toBe(8)
  })
})
