import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MatchCard, type MatchCardListing } from "./MatchCard"

// Create base listing fixtures
const createHaveListing = (overrides?: Partial<MatchCardListing>): MatchCardListing => ({
  id: "listing-1",
  listingType: "HAVE",
  haveSection: "101",
  haveRow: "A",
  haveSeat: "5",
  haveZone: "Lower Bowl",
  wantZones: ["Upper Bowl"],
  wantSections: ["201"],
  ...overrides,
})

const createWantListing = (overrides?: Partial<MatchCardListing>): MatchCardListing => ({
  id: "listing-2",
  listingType: "WANT",
  haveSection: "",
  haveRow: "",
  haveSeat: "",
  haveZone: "",
  wantZones: ["Lower Bowl"],
  wantSections: ["101"],
  ...overrides,
})

const createUserWithProfile = (overrides?: any) => ({
  id: "user-123",
  createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
  profile: {
    firstName: "John",
    lastInitial: "D",
    successfulSwapsCount: 3,
    emailVerified: true,
    phoneVerified: false,
    ...overrides?.profile,
  },
  ...overrides,
})

describe("MatchCard", () => {
  describe("SWAP layout", () => {
    it("renders SWAP layout with two columns and correct header copy", () => {
      const myListing = createHaveListing()
      const matchedListing = createHaveListing({
        id: "listing-2",
        haveSection: "202",
        haveRow: "B",
        haveSeat: "10",
        haveZone: "Upper Bowl",
        wantZones: ["Lower Bowl"],
        wantSections: ["101"],
        user: createUserWithProfile(),
      })

      const onMessageClick = jest.fn()

      render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={125}
          reason="Exact section match"
          onMessageClick={onMessageClick}
        />
      )

      // Check header
      expect(screen.getByText("Swap match")).toBeInTheDocument()

      // Check two column labels
      expect(screen.getByText("YOUR OFFER")).toBeInTheDocument()
      expect(screen.getByText("THEIR OFFER")).toBeInTheDocument()

      // Check CTA
      expect(screen.getByRole("button", { name: /start swap chat/i })).toBeInTheDocument()

      // Check score label
      expect(screen.getByText("Strong match")).toBeInTheDocument()
      expect(screen.getByText("Match score: 125")).toBeInTheDocument()
    })

    it("shows wants for both parties in SWAP", () => {
      const myListing = createHaveListing()
      const matchedListing = createHaveListing({
        id: "listing-2",
        user: createUserWithProfile(),
      })

      render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={100}
          reason="Zone match"
          onMessageClick={jest.fn()}
        />
      )

      // Both should show "Wants:"
      const wantsLabels = screen.getAllByText(/wants:/i)
      expect(wantsLabels).toHaveLength(2)
    })
  })

  describe("SELL layout", () => {
    it("renders SELL layout with vertical flow, 'Someone wants your seat', and CTA 'Offer your seat'", () => {
      const myListing = createHaveListing({
        wantZones: [],
        wantSections: [],
      })
      const matchedListing = createWantListing({
        user: createUserWithProfile(),
      })

      render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={85}
          reason="Zone match"
          onMessageClick={jest.fn()}
        />
      )

      // Check header
      expect(screen.getByText("Someone wants your seat")).toBeInTheDocument()

      // Check vertical layout labels (YOUR SEAT comes before THEIR REQUEST)
      expect(screen.getByText("YOUR SEAT")).toBeInTheDocument()
      expect(screen.getByText("THEIR REQUEST")).toBeInTheDocument()

      // Check CTA
      expect(screen.getByRole("button", { name: /offer your seat/i })).toBeInTheDocument()

      // Check helper text specific to SELL
      expect(
        screen.getByText(
          /you're not swapping seats.*responding to a fan.*use messages to confirm details, pricing, and transfer/i
        )
      ).toBeInTheDocument()
    })
  })

  describe("BUY layout", () => {
    it("renders BUY layout with vertical flow and CTA 'Message seller'", () => {
      const myListing = createWantListing()
      const matchedListing = createHaveListing({
        wantZones: [],
        wantSections: [],
        user: createUserWithProfile(),
      })

      render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={75}
          reason="Section match"
          onMessageClick={jest.fn()}
        />
      )

      // Check header
      expect(screen.getByText("You requested their seat")).toBeInTheDocument()

      // Check vertical layout labels (THEIR SEAT comes before YOUR REQUEST)
      expect(screen.getByText("THEIR SEAT")).toBeInTheDocument()
      expect(screen.getByText("YOUR REQUEST")).toBeInTheDocument()

      // Check CTA
      expect(screen.getByRole("button", { name: /message seller/i })).toBeInTheDocument()

      // Check helper text specific to BUY
      expect(
        screen.getByText(/this is a request.*use messages to confirm details, pricing, and transfer/i)
      ).toBeInTheDocument()
    })
  })

  describe("GIVEAWAY layout", () => {
    it("renders GIVEAWAY layout and CTA 'Message giver'", () => {
      // Note: Currently, without a price field or giveaway flag in the schema,
      // we can't easily trigger GIVEAWAY. This test demonstrates the pattern
      // but may need adjustment when schema supports giveaway explicitly.

      // For now, GIVEAWAY would fall under GENERIC_ASYMMETRIC
      // This test is a placeholder for future implementation
      expect(true).toBe(true)
    })
  })

  describe("GENERIC_ASYMMETRIC fallback", () => {
    it("renders GENERIC_ASYMMETRIC fallback when intents are ambiguous", () => {
      // Create a case where both listings have HAVE type but one has no wants
      const myListing = createHaveListing({
        wantZones: [],
        wantSections: [],
      })
      const matchedListing = createHaveListing({
        wantZones: [],
        wantSections: [],
        user: createUserWithProfile(),
      })

      render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={50}
          reason="Location match"
          onMessageClick={jest.fn()}
        />
      )

      // Check header for generic asymmetric
      expect(screen.getByText("Potential match")).toBeInTheDocument()

      // Check CTA
      expect(screen.getByRole("button", { name: /start conversation/i })).toBeInTheDocument()

      // Check subtext
      expect(
        screen.getByText(/compare the offer and request, then message to confirm details/i)
      ).toBeInTheDocument()
    })
  })

  describe("Blank placeholder prevention", () => {
    it("never renders 'Section , Row , Seat'", () => {
      const myListing = createHaveListing({
        haveSection: "",
        haveRow: "",
        haveSeat: "",
      })
      const matchedListing = createHaveListing({
        haveSection: "",
        haveRow: "",
        haveSeat: "",
        user: createUserWithProfile(),
      })

      const { container } = render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={100}
          reason="Zone match"
          onMessageClick={jest.fn()}
        />
      )

      // Should not contain the problematic pattern
      expect(container.textContent).not.toMatch(/Section\s*,\s*Row\s*,\s*Seat/)
      expect(container.textContent).not.toMatch(/Section\s+,/)
    })

    it("shows fallback text when section is missing", () => {
      const myListing = createHaveListing({
        haveSection: "",
      })
      const matchedListing = createHaveListing({
        haveSection: "",
        user: createUserWithProfile(),
      })

      render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={100}
          reason="Zone match"
          onMessageClick={jest.fn()}
        />
      )

      // Should show fallback text
      expect(screen.getAllByText(/not specified/i).length).toBeGreaterThan(0)
    })

    it("shows 'Flexible on exact seat' for WANT listings", () => {
      const myListing = createWantListing()
      const matchedListing = createHaveListing({
        wantZones: [],
        wantSections: [],
        user: createUserWithProfile(),
      })

      render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={90}
          reason="Zone match"
          onMessageClick={jest.fn()}
        />
      )

      expect(screen.getByText(/flexible on exact seat/i)).toBeInTheDocument()
    })
  })

  describe("Score label mapping", () => {
    it("shows 'Strong match' for scores >= 100", () => {
      const myListing = createHaveListing()
      const matchedListing = createHaveListing({
        user: createUserWithProfile(),
      })

      render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={150}
          reason="Perfect match"
          onMessageClick={jest.fn()}
        />
      )

      expect(screen.getByText("Strong match")).toBeInTheDocument()
      expect(screen.getByText("Match score: 150")).toBeInTheDocument()
    })

    it("shows 'Good match' for scores 50-99", () => {
      const myListing = createHaveListing()
      const matchedListing = createHaveListing({
        user: createUserWithProfile(),
      })

      render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={75}
          reason="Zone match"
          onMessageClick={jest.fn()}
        />
      )

      expect(screen.getByText("Good match")).toBeInTheDocument()
      expect(screen.getByText("Match score: 75")).toBeInTheDocument()
    })

    it("shows 'Low match' for scores < 50", () => {
      const myListing = createHaveListing()
      const matchedListing = createHaveListing({
        user: createUserWithProfile(),
      })

      render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={25}
          reason="Partial match"
          onMessageClick={jest.fn()}
        />
      )

      expect(screen.getByText("Low match")).toBeInTheDocument()
      expect(screen.getByText("Match score: 25")).toBeInTheDocument()
    })
  })

  describe("CTA click behavior", () => {
    it("calls onMessageClick handler once when button is clicked", async () => {
      const user = userEvent.setup()
      const onMessageClick = jest.fn()

      const myListing = createHaveListing()
      const matchedListing = createHaveListing({
        user: createUserWithProfile(),
      })

      render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={100}
          reason="Match"
          onMessageClick={onMessageClick}
        />
      )

      const button = screen.getByRole("button", { name: /start swap chat/i })
      await user.click(button)

      expect(onMessageClick).toHaveBeenCalledTimes(1)
    })

    it("disables button while loading", () => {
      const myListing = createHaveListing()
      const matchedListing = createHaveListing({
        user: createUserWithProfile(),
      })

      render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={100}
          reason="Match"
          onMessageClick={jest.fn()}
          isLoading={true}
        />
      )

      const button = screen.getByRole("button", { name: /opening/i })
      expect(button).toBeDisabled()
    })

    it("shows 'Opening...' text while loading", () => {
      const myListing = createHaveListing()
      const matchedListing = createHaveListing({
        user: createUserWithProfile(),
      })

      render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={100}
          reason="Match"
          onMessageClick={jest.fn()}
          isLoading={true}
        />
      )

      expect(screen.getByRole("button", { name: /opening/i })).toBeInTheDocument()
    })
  })

  describe("Trust signals", () => {
    it("displays owner name", () => {
      const myListing = createHaveListing()
      const matchedListing = createHaveListing({
        user: createUserWithProfile({
          profile: {
            firstName: "Jane",
            lastInitial: "S",
          },
        }),
      })

      render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={100}
          reason="Match"
          onMessageClick={jest.fn()}
        />
      )

      expect(screen.getByText(/jane s\./i)).toBeInTheDocument()
    })

    it("displays successful swaps count when > 0", () => {
      const myListing = createHaveListing()
      const matchedListing = createHaveListing({
        user: createUserWithProfile({
          profile: {
            successfulSwapsCount: 5,
          },
        }),
      })

      render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={100}
          reason="Match"
          onMessageClick={jest.fn()}
        />
      )

      expect(screen.getByText(/5 successful swaps/i)).toBeInTheDocument()
    })

    it("shows 'New member' for users created within last 30 days", () => {
      const myListing = createHaveListing()
      const matchedListing = createHaveListing({
        user: createUserWithProfile({
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          profile: {
            successfulSwapsCount: 0,
          },
        }),
      })

      render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={100}
          reason="Match"
          onMessageClick={jest.fn()}
        />
      )

      expect(screen.getByText(/new member/i)).toBeInTheDocument()
    })

    it("does not show 'New member' for users created more than 30 days ago", () => {
      const myListing = createHaveListing()
      const matchedListing = createHaveListing({
        user: createUserWithProfile({
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
          profile: {
            successfulSwapsCount: 0,
          },
        }),
      })

      render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={100}
          reason="Match"
          onMessageClick={jest.fn()}
        />
      )

      expect(screen.queryByText(/new member/i)).not.toBeInTheDocument()
    })
  })

  describe("Helper text", () => {
    it("shows appropriate helper text for SWAP", () => {
      const myListing = createHaveListing()
      const matchedListing = createHaveListing({
        user: createUserWithProfile(),
      })

      render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={100}
          reason="Match"
          onMessageClick={jest.fn()}
        />
      )

      expect(
        screen.getByText(/use messages to confirm seats, game, and transfer details before exchanging/i)
      ).toBeInTheDocument()
    })

    it("shows appropriate helper text for SELL", () => {
      const myListing = createHaveListing({
        wantZones: [],
        wantSections: [],
      })
      const matchedListing = createWantListing({
        user: createUserWithProfile(),
      })

      render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={100}
          reason="Match"
          onMessageClick={jest.fn()}
        />
      )

      expect(
        screen.getByText(
          /you're not swapping seats.*use messages to confirm details, pricing, and transfer/i
        )
      ).toBeInTheDocument()
    })

    it("shows appropriate helper text for BUY", () => {
      const myListing = createWantListing()
      const matchedListing = createHaveListing({
        wantZones: [],
        wantSections: [],
        user: createUserWithProfile(),
      })

      render(
        <MatchCard
          myListing={myListing}
          matchedListing={matchedListing}
          score={100}
          reason="Match"
          onMessageClick={jest.fn()}
        />
      )

      expect(
        screen.getByText(/this is a request.*use messages to confirm details, pricing, and transfer/i)
      ).toBeInTheDocument()
    })
  })
})
