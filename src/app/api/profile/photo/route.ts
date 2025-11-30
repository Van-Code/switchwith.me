import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

// Force dynamic rendering - this route needs to access headers for authentication
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("photo") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const fileExtension = file.name.split(".").pop()
    const filename = `${session.user.id}-${uniqueSuffix}.${fileExtension}`

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Save file
    const filepath = path.join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    // Update user profile with photo URL
    const photoUrl = `/uploads/${filename}`
    await prisma.profile.update({
      where: { userId: session.user.id },
      data: { avatarUrl: photoUrl },
    })

    return NextResponse.json({ 
      success: true,
      photoUrl 
    })
  } catch (error) {
    console.error("Error uploading photo:", error)
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    )
  }
}

// Note: For production, replace the file saving logic with S3 upload:
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
// const s3Client = new S3Client({ region: process.env.AWS_REGION })
// await s3Client.send(new PutObjectCommand({
//   Bucket: process.env.S3_BUCKET,
//   Key: filename,
//   Body: buffer,
//   ContentType: file.type,
// }))
// const photoUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${filename}`