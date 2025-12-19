import { render, screen } from "@testing-library/react"
import { SwapParticipantsStrip } from "./SwapParticipantsStrip"

// Mock useAvatarUrl hook
jest.mock("@/hooks/useAvatarUrl", () => ({
  useAvatarUrl: jest.fn((s3Key: string | null | undefined) => {
    if (!s3Key) return null
    return `https://presigned-url.com/${s3Key}`
  }),
}))

describe("SwapParticipantsStrip", () => {
  const mockParticipants = [
    {
      userId: "user-1",
      user: {
        id: "user-1",
        profile: {
          firstName: "Alice",
          lastInitial: "A",
          avatarUrl: "profile-photos/user1.jpg",
        },
      },
    },
    {
      userId: "user-2",
      user: {
        id: "user-2",
        profile: {
          firstName: "Bob",
          lastInitial: "B",
          avatarUrl: null,
        },
      },
    },
  ]

  describe("Rendering", () => {
    it("renders the 'People in this swap' heading", () => {
      render(<SwapParticipantsStrip participants={mockParticipants} />)

      expect(screen.getByText("People in this swap")).toBeInTheDocument()
    })

    it("renders all participants when less than or equal to 5", () => {
      render(<SwapParticipantsStrip participants={mockParticipants} />)

      expect(screen.getByText("Alice")).toBeInTheDocument()
      expect(screen.getByText("Bob")).toBeInTheDocument()
    })

    it("renders avatars with proper structure", () => {
      const { container } = render(<SwapParticipantsStrip participants={mockParticipants} />)

      // Check that avatar containers are present
      const avatarContainers = container.querySelectorAll('[class*="rounded-full"]')
      expect(avatarContainers.length).toBeGreaterThan(0)
    })

    it("renders fallback with initials when no avatarUrl", () => {
      render(<SwapParticipantsStrip participants={mockParticipants} />)

      expect(screen.getByText("BB")).toBeInTheDocument()
    })
  })

  describe("Overflow Behavior", () => {
    it("shows only first 5 participants and +N indicator when more than 5", () => {
      const manyParticipants = [
        ...mockParticipants,
        {
          userId: "user-3",
          user: {
            id: "user-3",
            profile: { firstName: "Charlie", lastInitial: "C", avatarUrl: null },
          },
        },
        {
          userId: "user-4",
          user: {
            id: "user-4",
            profile: { firstName: "Diana", lastInitial: "D", avatarUrl: null },
          },
        },
        {
          userId: "user-5",
          user: {
            id: "user-5",
            profile: { firstName: "Eve", lastInitial: "E", avatarUrl: null },
          },
        },
        {
          userId: "user-6",
          user: {
            id: "user-6",
            profile: { firstName: "Frank", lastInitial: "F", avatarUrl: null },
          },
        },
        {
          userId: "user-7",
          user: {
            id: "user-7",
            profile: { firstName: "Grace", lastInitial: "G", avatarUrl: null },
          },
        },
      ]

      render(<SwapParticipantsStrip participants={manyParticipants} />)

      // Should show first 5 names
      expect(screen.getByText("Alice")).toBeInTheDocument()
      expect(screen.getByText("Bob")).toBeInTheDocument()
      expect(screen.getByText("Charlie")).toBeInTheDocument()
      expect(screen.getByText("Diana")).toBeInTheDocument()
      expect(screen.getByText("Eve")).toBeInTheDocument()

      // Should not show 6th and 7th names
      expect(screen.queryByText("Frank")).not.toBeInTheDocument()
      expect(screen.queryByText("Grace")).not.toBeInTheDocument()

      // Should show +2 indicator
      expect(screen.getByText("+2")).toBeInTheDocument()
      expect(screen.getByText("more")).toBeInTheDocument()
    })

    it("shows correct count in +N indicator", () => {
      const eightParticipants = [
        ...mockParticipants,
        ...Array.from({ length: 6 }, (_, i) => ({
          userId: `user-${i + 3}`,
          user: {
            id: `user-${i + 3}`,
            profile: {
              firstName: `User${i + 3}`,
              lastInitial: "U",
              avatarUrl: null,
            },
          },
        })),
      ]

      render(<SwapParticipantsStrip participants={eightParticipants} />)

      expect(screen.getByText("+3")).toBeInTheDocument()
    })

    it("does not show +N indicator when exactly 5 participants", () => {
      const fiveParticipants = [
        ...mockParticipants,
        {
          userId: "user-3",
          user: {
            id: "user-3",
            profile: { firstName: "Charlie", lastInitial: "C", avatarUrl: null },
          },
        },
        {
          userId: "user-4",
          user: {
            id: "user-4",
            profile: { firstName: "Diana", lastInitial: "D", avatarUrl: null },
          },
        },
        {
          userId: "user-5",
          user: {
            id: "user-5",
            profile: { firstName: "Eve", lastInitial: "E", avatarUrl: null },
          },
        },
      ]

      render(<SwapParticipantsStrip participants={fiveParticipants} />)

      expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument()
      expect(screen.queryByText("more")).not.toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("renders nothing when participants array is empty", () => {
      const { container } = render(<SwapParticipantsStrip participants={[]} />)

      expect(container.firstChild).toBeNull()
    })

    it("renders nothing when participants is undefined", () => {
      // @ts-expect-error Testing undefined case
      const { container } = render(<SwapParticipantsStrip participants={undefined} />)

      expect(container.firstChild).toBeNull()
    })

    it("renders 'Unknown' when participant has no profile", () => {
      const participantsWithoutProfile = [
        {
          userId: "user-1",
          user: {
            id: "user-1",
            profile: null,
          },
        },
      ]

      render(<SwapParticipantsStrip participants={participantsWithoutProfile} />)

      expect(screen.getByText("Unknown")).toBeInTheDocument()
      expect(screen.getByText("U")).toBeInTheDocument() // Fallback initial
    })

    it("handles participant with null lastInitial", () => {
      const participant = [
        {
          userId: "user-1",
          user: {
            id: "user-1",
            profile: {
              firstName: "SingleName",
              lastInitial: null,
              avatarUrl: null,
            },
          },
        },
      ]

      render(<SwapParticipantsStrip participants={participant} />)

      expect(screen.getByText("S")).toBeInTheDocument() // Only first initial
      expect(screen.getByText("SingleName")).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("renders avatars with proper structure", () => {
      const { container } = render(<SwapParticipantsStrip participants={mockParticipants} />)

      const avatarContainers = container.querySelectorAll('[class*="rounded-full"]')
      expect(avatarContainers.length).toBeGreaterThan(0)
    })

    it("has title attributes for hover tooltips", () => {
      const { container } = render(<SwapParticipantsStrip participants={mockParticipants} />)

      const participantDivs = container.querySelectorAll("[title]")
      expect(participantDivs.length).toBeGreaterThan(0)

      // Check first participant has correct title
      const aliceDiv = Array.from(participantDivs).find((div) =>
        div.getAttribute("title")?.includes("Alice")
      )
      expect(aliceDiv).toHaveAttribute("title", "Alice A.")
    })

    it("has aria-label for participant names", () => {
      render(<SwapParticipantsStrip participants={mockParticipants} />)

      const aliceLabel = screen.getByLabelText("Alice A.")
      expect(aliceLabel).toBeInTheDocument()
    })

    it("has descriptive title for overflow indicator", () => {
      const manyParticipants = [
        ...mockParticipants,
        ...Array.from({ length: 5 }, (_, i) => ({
          userId: `user-${i + 3}`,
          user: {
            id: `user-${i + 3}`,
            profile: {
              firstName: `User${i + 3}`,
              lastInitial: "U",
              avatarUrl: null,
            },
          },
        })),
      ]

      const { container } = render(<SwapParticipantsStrip participants={manyParticipants} />)

      const overflowDiv = container.querySelector("[title*='more participant']")
      // mockParticipants has 2, plus 5 more = 7 total. Show 5, hide 2.
      expect(overflowDiv).toHaveAttribute("title", "2 more participants")
    })
  })

  describe("Responsive Design", () => {
    it("has horizontal scroll container", () => {
      const { container } = render(<SwapParticipantsStrip participants={mockParticipants} />)

      const scrollContainer = container.querySelector(".overflow-x-auto")
      expect(scrollContainer).toBeInTheDocument()
    })

    it("prevents avatar shrinking with shrink-0 class", () => {
      const { container } = render(<SwapParticipantsStrip participants={mockParticipants} />)

      const avatarContainers = container.querySelectorAll(".shrink-0")
      expect(avatarContainers.length).toBeGreaterThan(0)
    })
  })
})
