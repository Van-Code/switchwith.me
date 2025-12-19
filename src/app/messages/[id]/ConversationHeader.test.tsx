import { render, screen } from "@testing-library/react"
import { ConversationHeader } from "./ConversationHeader"

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>
  }
})

// Mock useAvatarUrl hook
jest.mock("@/hooks/useAvatarUrl", () => ({
  useAvatarUrl: jest.fn((s3Key: string | null | undefined) => {
    if (!s3Key) return null
    return `https://presigned-url.com/${s3Key}`
  }),
}))

describe("ConversationHeader", () => {
  const mockOtherParticipant = {
    userId: "user-123",
    user: {
      id: "user-123",
      profile: {
        firstName: "Taylor",
        lastInitial: "T",
        avatarUrl: "profile-photos/user123.jpg",
      },
    },
  }

  describe("Rendering", () => {
    it("renders the participant name", () => {
      render(<ConversationHeader otherParticipant={mockOtherParticipant} />)

      expect(screen.getByText("Taylor T.")).toBeInTheDocument()
    })

    it("renders 'Conversation' subtitle", () => {
      render(<ConversationHeader otherParticipant={mockOtherParticipant} />)

      expect(screen.getByText("Conversation")).toBeInTheDocument()
    })

    it("renders back arrow button", () => {
      render(<ConversationHeader otherParticipant={mockOtherParticipant} />)

      const backButton = screen.getByLabelText("Back to messages")
      expect(backButton).toBeInTheDocument()
    })

    it("links back to messages list", () => {
      render(<ConversationHeader otherParticipant={mockOtherParticipant} />)

      const backLink = screen.getByLabelText("Back to messages").closest("a")
      expect(backLink?.getAttribute("href")).toBe("/messages")
    })

    it("links participant name to their profile", () => {
      render(<ConversationHeader otherParticipant={mockOtherParticipant} />)

      const nameLink = screen.getByText("Taylor T.").closest("a")
      expect(nameLink?.getAttribute("href")).toBe("/users/user-123")
    })
  })

  describe("Avatar Display", () => {
    it("renders avatar component when avatarUrl is provided", () => {
      const { container } = render(<ConversationHeader otherParticipant={mockOtherParticipant} />)

      // Check that avatar container is present
      const avatarContainer = container.querySelector('[class*="rounded-full"]')
      expect(avatarContainer).toBeInTheDocument()
    })

    it("renders fallback with initials when no avatarUrl", () => {
      const participantWithoutAvatar = {
        ...mockOtherParticipant,
        user: {
          ...mockOtherParticipant.user,
          profile: {
            firstName: "Taylor",
            lastInitial: "T",
            avatarUrl: null,
          },
        },
      }

      render(<ConversationHeader otherParticipant={participantWithoutAvatar} />)

      expect(screen.getByText("TT")).toBeInTheDocument()
    })

    it("renders correct initials from firstName and lastInitial", () => {
      const participant = {
        userId: "user-456",
        user: {
          id: "user-456",
          profile: {
            firstName: "John",
            lastInitial: "D",
            avatarUrl: null,
          },
        },
      }

      render(<ConversationHeader otherParticipant={participant} />)

      expect(screen.getByText("JD")).toBeInTheDocument()
    })

    it("renders single initial when lastInitial is null", () => {
      const participant = {
        userId: "user-789",
        user: {
          id: "user-789",
          profile: {
            firstName: "Jane",
            lastInitial: null,
            avatarUrl: null,
          },
        },
      }

      render(<ConversationHeader otherParticipant={participant} />)

      expect(screen.getByText("J")).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("renders 'Unknown User' when no participant provided", () => {
      render(<ConversationHeader />)

      expect(screen.getByText("Unknown User")).toBeInTheDocument()
    })

    it("renders 'Unknown User' when participant has no profile", () => {
      const participantWithoutProfile = {
        userId: "user-123",
        user: {
          id: "user-123",
          profile: null,
        },
      }

      render(<ConversationHeader otherParticipant={participantWithoutProfile} />)

      expect(screen.getByText("Unknown User")).toBeInTheDocument()
      expect(screen.getByText("U")).toBeInTheDocument() // Fallback initial
    })

    it("does not link to profile when user id is missing", () => {
      const participantWithoutId = {
        userId: "user-123",
        user: {
          id: "",
          profile: {
            firstName: "Taylor",
            lastInitial: "T",
            avatarUrl: null,
          },
        },
      }

      render(<ConversationHeader otherParticipant={participantWithoutId} />)

      const heading = screen.getByText("Taylor T.")
      expect(heading.tagName).toBe("H1")
      expect(heading.closest("a")).toBeNull()
    })
  })

  describe("Accessibility", () => {
    it("renders avatar with proper structure", () => {
      const { container } = render(<ConversationHeader otherParticipant={mockOtherParticipant} />)

      // Avatar should be present
      const avatarContainer = container.querySelector('[class*="rounded-full"]')
      expect(avatarContainer).toBeInTheDocument()
    })

    it("has aria-label for back button", () => {
      render(<ConversationHeader otherParticipant={mockOtherParticipant} />)

      const backButton = screen.getByLabelText("Back to messages")
      expect(backButton).toBeInTheDocument()
    })
  })
})
