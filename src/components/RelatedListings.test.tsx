import { render, screen, waitFor } from "@testing-library/react"
import { RelatedListings } from "./RelatedListings"

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>
  }
})

// Mock fetch
global.fetch = jest.fn()

describe("RelatedListings", () => {
  const mockListingId = "listing-123"
  const mockCurrentUserId = "user-123"

  const mockRelatedListings = [
    {
      id: "listing-1",
      gameDate: "2024-12-25",
      haveSection: "101",
      haveRow: "A",
      haveSeat: "5",
      haveZone: "Lower Bowl",
      wantZones: ["Upper Bowl"],
      wantSections: ["201"],
      status: "ACTIVE",
      boosted: true,
      team: {
        id: 1,
        name: "Lakers",
        slug: "lakers",
        logoUrl: "/teams/lakers.png",
      },
      user: {
        id: "user-456",
        profile: {
          firstName: "John",
          lastInitial: "D",
        },
      },
    },
    {
      id: "listing-2",
      gameDate: "2024-11-26",
      haveSection: "102",
      haveRow: "B",
      haveSeat: "6",
      haveZone: "Club Level",
      wantZones: [],
      wantSections: [],
      status: "ACTIVE",
      boosted: false,
      team: {
        id: 1,
        name: "Lakers",
        slug: "lakers",
        logoUrl: "/teams/lakers.png",
      },
      user: {
        id: "user-789",
        profile: {
          firstName: "Jane",
          lastInitial: "S",
        },
      },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Loading State", () => {
    it("shows loading spinner while fetching", () => {
      ;(global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      render(
        <RelatedListings listingId={mockListingId} currentUserId={mockCurrentUserId} />
      )

      expect(screen.getByText(/related listings/i)).toBeInTheDocument()
      // Check for loading spinner
      const spinner = document.querySelector(".animate-spin")
      expect(spinner).toBeInTheDocument()
    })
  })

  describe("Empty State", () => {
    it("renders nothing when no related listings found", async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ listings: [] }),
      })

      const { container } = render(
        <RelatedListings listingId={mockListingId} currentUserId={mockCurrentUserId} />
      )

      await waitFor(() => {
        expect(screen.queryByText(/related listings/i)).not.toBeInTheDocument()
      })

      expect(container.firstChild).toBeNull()
    })
  })

  describe("Related Listings Display", () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ listings: mockRelatedListings }),
      })
    })

    it("fetches related listings on mount", async () => {
      render(
        <RelatedListings listingId={mockListingId} currentUserId={mockCurrentUserId} />
      )

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/listings/${mockListingId}/related`
        )
      })
    })

    it("displays all related listings", async () => {
      render(
        <RelatedListings listingId={mockListingId} currentUserId={mockCurrentUserId} />
      )

      await waitFor(() => {
        expect(screen.getByText(/section 101, row a, seat 5/i)).toBeInTheDocument()
        expect(screen.getByText(/section 102, row b, seat 6/i)).toBeInTheDocument()
      })
    })

    it("shows boosted badge for boosted listings", async () => {
      render(
        <RelatedListings listingId={mockListingId} currentUserId={mockCurrentUserId} />
      )

      await waitFor(() => {
        expect(screen.getByText(/boosted/i)).toBeInTheDocument()
      })
    })

    it("displays team information", async () => {
      render(
        <RelatedListings listingId={mockListingId} currentUserId={mockCurrentUserId} />
      )

      await waitFor(() => {
        const teamNames = screen.getAllByText("Lakers")
        expect(teamNames.length).toBeGreaterThan(0)
      })
    })

    it("displays game dates correctly", async () => {
      render(
        <RelatedListings listingId={mockListingId} currentUserId={mockCurrentUserId} />
      )

      await waitFor(() => {
        expect(screen.getByText(/dec/i)).toBeInTheDocument()
      })
    })

    it("displays want zones and sections", async () => {
      render(
        <RelatedListings listingId={mockListingId} currentUserId={mockCurrentUserId} />
      )

      await waitFor(() => {
        expect(screen.getByText("Upper Bowl")).toBeInTheDocument()
        expect(screen.getByText(/sec 201/i)).toBeInTheDocument()
      })
    })
  })

  describe("View Details Links", () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ listings: mockRelatedListings }),
      })
    })

    it('shows "View Details" for other users listings', async () => {
      render(
        <RelatedListings listingId={mockListingId} currentUserId={mockCurrentUserId} />
      )

      await waitFor(() => {
        const viewDetailsButtons = screen.getAllByText(/view details/i)
        expect(viewDetailsButtons.length).toBeGreaterThan(0)
      })
    })

    it('shows "View Your Listing" for own listings', async () => {
      const listingsWithOwnListing = [
        {
          ...mockRelatedListings[0],
          user: {
            id: mockCurrentUserId, // Same as current user
            profile: {
              firstName: "Me",
              lastInitial: "U",
            },
          },
        },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ listings: listingsWithOwnListing }),
      })

      render(
        <RelatedListings listingId={mockListingId} currentUserId={mockCurrentUserId} />
      )

      await waitFor(() => {
        expect(screen.getByText(/view your listing/i)).toBeInTheDocument()
      })
    })

    it("links to listings page with highlight parameter", async () => {
      render(
        <RelatedListings listingId={mockListingId} currentUserId={mockCurrentUserId} />
      )

      await waitFor(() => {
        const link = screen.getAllByRole("link")[0]
        expect(link.getAttribute("href")).toContain("highlight=listing-1")
      })
    })
  })

  describe("Browse All Button", () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ listings: mockRelatedListings }),
      })
    })

    it('shows "Browse All Listings" button when listings exist', async () => {
      render(
        <RelatedListings listingId={mockListingId} currentUserId={mockCurrentUserId} />
      )

      await waitFor(() => {
        expect(screen.getByText(/browse all listings/i)).toBeInTheDocument()
      })
    })

    it("links to listings page", async () => {
      render(
        <RelatedListings listingId={mockListingId} currentUserId={mockCurrentUserId} />
      )

      await waitFor(() => {
        const browseLink = screen.getByText(/browse all listings/i).closest("a")
        expect(browseLink?.getAttribute("href")).toBe("/listings")
      })
    })
  })

  describe("Error Handling", () => {
    it("handles fetch errors gracefully", async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"))

      const { container } = render(
        <RelatedListings listingId={mockListingId} currentUserId={mockCurrentUserId} />
      )

      await waitFor(() => {
        const spinner = container.querySelector(".animate-spin")
        expect(spinner).not.toBeInTheDocument()
      })

      // Should render nothing on error
      expect(container.firstChild).toBeNull()
    })

    it("handles non-ok response", async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      })

      const { container } = render(
        <RelatedListings listingId={mockListingId} currentUserId={mockCurrentUserId} />
      )

      await waitFor(() => {
        const spinner = container.querySelector(".animate-spin")
        expect(spinner).not.toBeInTheDocument()
      })

      // Should render nothing on error
      expect(container.firstChild).toBeNull()
    })
  })
})
