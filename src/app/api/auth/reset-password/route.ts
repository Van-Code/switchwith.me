import { NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"
import * as bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { token, newPassword } = body

        if (!token || !newPassword) {
            return NextResponse.json(
                { error: "Token and new password are required" },
                { status: 400 }
            )
        }

        // Validate password strength
        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters long" },
                { status: 400 }
            )
        }

        // Find all unused, non-expired reset tokens
        const resetTokens = await prisma.passwordResetToken.findMany({
            where: {
                usedAt: null,
                expiresAt: {
                    gt: new Date()
                }
            },
            include: {
                user: true
            }
        })

        // Check which token matches the provided token
        let matchedToken = null
        for (const dbToken of resetTokens) {
            const isMatch = await bcrypt.compare(token, dbToken.tokenHash)
            if (isMatch) {
                matchedToken = dbToken
                break
            }
        }

        if (!matchedToken) {
            return NextResponse.json(
                { error: "Invalid or expired reset token" },
                { status: 400 }
            )
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update user password
        await prisma.user.update({
            where: { id: matchedToken.userId },
            data: { password: hashedPassword }
        })

        // Mark token as used
        await prisma.passwordResetToken.update({
            where: { id: matchedToken.id },
            data: { usedAt: new Date() }
        })

        return NextResponse.json({
            message: "Password reset successfully"
        })
    } catch (error) {
        console.error("Reset password error:", error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}
