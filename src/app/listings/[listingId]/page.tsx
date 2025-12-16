import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ListingDetail from "@/components/ListingDetail"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function ListingPage({ params }: { params: { listingId: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.listingId },
  })
  const session = await getServerSession(authOptions)

  if (!listing) return notFound()

  return <ListingDetail listingId={params.listingId} currentUserId={session?.user?.id} />
}
