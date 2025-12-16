import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ListingCard } from "@/components/ListingCard"

interface PageProps {
  listingId: string
  currentUserId?: string | null
}

export default async function ListingDetailPage({ listingId, currentUserId }: PageProps) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      team: true,
    },
  })

  if (!listing) return notFound()

  const title =
    `${listing.team.name ?? ""} ${listing.gameDate ? "· " + new Date(listing.gameDate).toLocaleDateString() : ""}`.trim()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{title || "Listing"}</h1>
          {!!currentUserId && (
            <div className="text-sm text-slate-600">
              Posted by{" "}
              <Link className="underline" href={`/users/${listing.user.id}`}>
                {listing.user?.profile?.firstName || "User"}
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border p-4 space-y-2">
        <div className="text-sm text-slate-600">Seat details</div>
        <ListingCard
          key={listing.id}
          listing={listing}
          isAuthenticated={!!currentUserId}
        />
      </div>

      <div className="flex gap-3">
        <Link className="underline" href="/listings">
          Back to browse
        </Link>
      </div>
    </div>
  )
}
