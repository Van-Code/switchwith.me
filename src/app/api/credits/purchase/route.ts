import { NextResponse } from "next/server"
import { requireUserId } from "@/lib/auth-api"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering - this route needs to access headers for authentication
export const dynamic = "force-dynamic"

// POST /api/credits/purchase - Purchase credits (simulated payment)
export async function POST(req: Request) {
  try {
    const auth = await requireUserId()
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = auth.userId

    const body = await req.json()
    const { amount } = body

    // Validate amount
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid credit amount" }, { status: 400 })
    }

    // TODO: In the future, integrate with Stripe for payment
    // For now, we simulate payment success

    // Use a transaction to ensure atomic updates
    const result = await prisma.$transaction(async (tx) => {
      // Add credits to user
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          credits: {
            increment: amount,
          },
        },
        select: {
          id: true,
          email: true,
          credits: true,
        },
      })

      // Create credit transaction record
      const transaction = await tx.creditTransaction.create({
        data: {
          userId: userId,
          amount: amount,
          note: `Purchase of ${amount} credits (simulated)`,
        },
      })

      return { user, transaction }
    })

    return NextResponse.json({
      success: true,
      credits: result.user.credits,
      transaction: result.transaction,
      message: `Successfully purchased ${amount} credits`,
    })
  } catch (error) {
    console.error("Error purchasing credits:", error)
    return NextResponse.json({ error: "Failed to purchase credits" }, { status: 500 })
  }
}
