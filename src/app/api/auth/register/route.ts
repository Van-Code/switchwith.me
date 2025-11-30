import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password, firstName, lastInitial } = body

        if (!email || !password || !firstName || !lastInitial) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                profile: {
                    create: {
                        firstName,
                        lastInitial,
                    }
                }
            },
            include: {
                profile: true
            }
        })

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                profile: user.profile
            }
        })
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}