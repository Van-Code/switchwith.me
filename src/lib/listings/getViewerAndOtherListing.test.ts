import {
  getViewerAndOtherListing,
  ParticipantWithListings,
} from "./getViewerAndOtherListing"

describe("getViewerAndOtherListing", () => {
  const mockTeamId = 1
  const mockGameDate = "2024-01-15T00:00:00.000Z"

  const createParticipant = (
    userId: string,
    firstName: string,
    listings: any[] = []
  ): ParticipantWithListings => ({
    userId,
    user: {
      id: userId,
      profile: {
        firstName,
        lastInitial: "D",
      },
      listings,
    },
  })

  const createListing = (userId: string, teamId: number, gameDate: string) => ({
    id: `listing-${userId}`,
    listingType: "HAVE" as const,
    haveSection: "101",
    haveRow: "A",
    haveSeat: "1",
    haveZone: "Lower Bowl",
    wantZones: ["Upper Bowl"],
    wantSections: [],
    flexible: false,
    teamId,
    gameDate,
  })

  it("should return viewer and other listings when both exist", () => {
    const viewerListing = createListing("user1", mockTeamId, mockGameDate)
    const otherUserListing = createListing("user2", mockTeamId, mockGameDate)

    const participants = [
      createParticipant("user1", "Alice", [viewerListing]),
      createParticipant("user2", "Bob", [otherUserListing]),
    ]

    const result = getViewerAndOtherListing({
      participants,
      currentUserId: "user1",
      conversationTeamId: mockTeamId,
      conversationGameDate: mockGameDate,
    })

    expect(result.viewerListing).toEqual(viewerListing)
    expect(result.otherListing).toEqual(otherUserListing)
  })

  it("should work regardless of participant array order", () => {
    const viewerListing = createListing("user1", mockTeamId, mockGameDate)
    const otherUserListing = createListing("user2", mockTeamId, mockGameDate)

    // Reverse order - other user first
    const participants = [
      createParticipant("user2", "Bob", [otherUserListing]),
      createParticipant("user1", "Alice", [viewerListing]),
    ]

    const result = getViewerAndOtherListing({
      participants,
      currentUserId: "user1",
      conversationTeamId: mockTeamId,
      conversationGameDate: mockGameDate,
    })

    expect(result.viewerListing).toEqual(viewerListing)
    expect(result.otherListing).toEqual(otherUserListing)
  })

  it("should return null for viewerListing when viewer has no listings", () => {
    const otherUserListing = createListing("user2", mockTeamId, mockGameDate)

    const participants = [
      createParticipant("user1", "Alice", []), // No listings
      createParticipant("user2", "Bob", [otherUserListing]),
    ]

    const result = getViewerAndOtherListing({
      participants,
      currentUserId: "user1",
      conversationTeamId: mockTeamId,
      conversationGameDate: mockGameDate,
    })

    expect(result.viewerListing).toBeNull()
    expect(result.otherListing).toEqual(otherUserListing)
  })

  it("should return null for otherListing when other user has no listings", () => {
    const viewerListing = createListing("user1", mockTeamId, mockGameDate)

    const participants = [
      createParticipant("user1", "Alice", [viewerListing]),
      createParticipant("user2", "Bob", []), // No listings
    ]

    const result = getViewerAndOtherListing({
      participants,
      currentUserId: "user1",
      conversationTeamId: mockTeamId,
      conversationGameDate: mockGameDate,
    })

    expect(result.viewerListing).toEqual(viewerListing)
    expect(result.otherListing).toBeNull()
  })

  it("should return null for both when no listings match the game/team", () => {
    const differentTeamListing = createListing("user1", 999, mockGameDate)
    const differentDateListing = createListing("user2", mockTeamId, "2025-12-31T00:00:00.000Z")

    const participants = [
      createParticipant("user1", "Alice", [differentTeamListing]),
      createParticipant("user2", "Bob", [differentDateListing]),
    ]

    const result = getViewerAndOtherListing({
      participants,
      currentUserId: "user1",
      conversationTeamId: mockTeamId,
      conversationGameDate: mockGameDate,
    })

    expect(result.viewerListing).toBeNull()
    expect(result.otherListing).toBeNull()
  })

  it("should handle multiple listings and find the correct one by team and date", () => {
    const viewerListing1 = createListing("user1", 1, mockGameDate)
    const viewerListing2 = createListing("user1", mockTeamId, mockGameDate)
    const viewerListing3 = createListing("user1", 3, mockGameDate)

    const otherUserListing = createListing("user2", mockTeamId, mockGameDate)

    const participants = [
      createParticipant("user1", "Alice", [viewerListing1, viewerListing2, viewerListing3]),
      createParticipant("user2", "Bob", [otherUserListing]),
    ]

    const result = getViewerAndOtherListing({
      participants,
      currentUserId: "user1",
      conversationTeamId: mockTeamId,
      conversationGameDate: mockGameDate,
    })

    expect(result.viewerListing).toEqual(viewerListing2)
    expect(result.otherListing).toEqual(otherUserListing)
  })

  it("should handle date comparison correctly across timezones", () => {
    const viewerListing = createListing("user1", mockTeamId, "2024-01-15T08:00:00.000Z")
    const otherUserListing = createListing("user2", mockTeamId, "2024-01-15T20:00:00.000Z")

    const participants = [
      createParticipant("user1", "Alice", [viewerListing]),
      createParticipant("user2", "Bob", [otherUserListing]),
    ]

    // Different times but same date
    const result = getViewerAndOtherListing({
      participants,
      currentUserId: "user1",
      conversationTeamId: mockTeamId,
      conversationGameDate: "2024-01-15T12:00:00.000Z",
    })

    expect(result.viewerListing).toEqual(viewerListing)
    expect(result.otherListing).toEqual(otherUserListing)
  })

  it("should handle empty participants array", () => {
    const result = getViewerAndOtherListing({
      participants: [],
      currentUserId: "user1",
      conversationTeamId: mockTeamId,
      conversationGameDate: mockGameDate,
    })

    expect(result.viewerListing).toBeNull()
    expect(result.otherListing).toBeNull()
  })

  it("should handle missing conversationTeamId", () => {
    const viewerListing = createListing("user1", mockTeamId, mockGameDate)
    const otherUserListing = createListing("user2", mockTeamId, mockGameDate)

    const participants = [
      createParticipant("user1", "Alice", [viewerListing]),
      createParticipant("user2", "Bob", [otherUserListing]),
    ]

    const result = getViewerAndOtherListing({
      participants,
      currentUserId: "user1",
      conversationTeamId: undefined,
      conversationGameDate: mockGameDate,
    })

    expect(result.viewerListing).toBeNull()
    expect(result.otherListing).toBeNull()
  })
})
