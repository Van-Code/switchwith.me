import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ListingDetail from "@/components/ListingDetail"
import { requireUserId } from "@/lib/auth-api"

export default async function ListingPage({ params }: { params: { listingId: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.listingId },
  })
  const auth = await requireUserId()

  if (!listing) return notFound()

  return <ListingDetail listingId={params.listingId} currentUserId={auth.userId} />
}
