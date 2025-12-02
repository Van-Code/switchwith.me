import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering - this route needs to access headers for authentication
export const dynamic = "force-dynamic"

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { firstName, lastInitial, bio, favoritePlayer } = body

    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastInitial !== undefined && { lastInitial }),
        ...(bio !== undefined && { bio }),
        ...(favoritePlayer !== undefined && { favoritePlayer }),
      },
    })

    return NextResponse.json({ profile: updatedProfile })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
