import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering - this route needs to access headers for authentication
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = (searchParams.get("query") ?? "").trim()

    if (!query || query.length < 2) {
      return NextResponse.json({ sections: [], zones: [] })
    }

    // Query for distinct sections and zones matching the search query
    // Only search ACTIVE listings
    const [sectionsResult, zonesResult] = await Promise.all([
      prisma.listing.findMany({
        where: {
          status: "ACTIVE",
          haveSection: { contains: query, mode: "insensitive" },
        },
        select: { haveSection: true },
        distinct: ["haveSection"],
        take: 5,
        orderBy: { haveSection: "asc" },
      }),
      prisma.listing.findMany({
        where: {
          status: "ACTIVE",
          haveZone: { contains: query, mode: "insensitive" },
        },
        select: { haveZone: true },
        distinct: ["haveZone"],
        take: 5,
        orderBy: { haveZone: "asc" },
      }),
    ])

    const sections = sectionsResult.map(
      (item: { haveSection: string }) => item.haveSection
    )
    const zones = zonesResult.map((item: { haveZone: string }) => item.haveZone)

    return NextResponse.json({
      sections,
      zones,
    })
  } catch (error) {
    console.error("Error fetching suggestions:", error)
    return NextResponse.json(
      { sections: [], zones: [], error: "Failed to fetch suggestions" },
      { status: 500 }
    )
  }
}
