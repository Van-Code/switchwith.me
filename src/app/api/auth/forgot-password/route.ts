import { NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"
import * as crypto from "crypto"
import * as bcrypt from "bcryptjs"
import { sendPasswordResetEmail } from "../../../../lib/passwordResetEmail"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email } = body

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            )
        }

        // Look up user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        })

        // Always return success to prevent email enumeration
        // Even if the user doesn't exist, we respond the same way
        if (!user) {
            return NextResponse.json({
                message: "If an account exists for that email, we have sent password reset instructions."
            })
        }

        // Generate a secure random token (32 bytes = 256 bits)
        const resetToken = crypto.randomBytes(32).toString("hex")

        // Hash the token before storing
        const tokenHash = await bcrypt.hash(resetToken, 10)

        // Set expiration to 1 hour from now
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        // Delete any existing unused reset tokens for this user
        await prisma.passwordResetToken.deleteMany({
            where: {
                userId: user.id,
                usedAt: null
            }
        })

        // Create new reset token
        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt
            }
        })

        // Send reset email
        try {
            await sendPasswordResetEmail({
                to: user.email,
                token: resetToken, // Send the raw token, not the hash
                userName: user.email.split("@")[0]
            })
        } catch (emailError) {
            console.error("Failed to send password reset email:", emailError)
            // Don't fail the request if email fails - log it but return success
        }

        return NextResponse.json({
            message: "If an account exists for that email, we have sent password reset instructions."
        })
    } catch (error) {
        console.error("Forgot password error:", error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}
