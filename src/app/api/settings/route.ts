import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/auth-api"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering - this route needs to access headers for authentication
export const dynamic = "force-dynamic"

export async function PATCH(req: Request) {
  try {
    const auth = await requireUserId()
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = auth.userId
    const body = await req.json()
    const { firstName, lastInitial } = body

    const updatedProfile = await prisma.profile.update({
      where: { userId: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastInitial !== undefined && { lastInitial }),
      },
    })

    return NextResponse.json({ profile: updatedProfile })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
