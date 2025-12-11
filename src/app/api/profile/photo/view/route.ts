import { NextResponse } from "next/server"
import { generateViewPresignedUrl } from "@/lib/s3"

export const dynamic = "force-dynamic"

/**
 * GET /api/profile/photo/view?key=xxx
 * Returns a presigned URL for viewing a profile photo
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const key = searchParams.get("key")

    if (!key) {
      return NextResponse.json({ error: "S3 key required" }, { status: 400 })
    }

    const viewUrl = await generateViewPresignedUrl(key)

    return NextResponse.json({ viewUrl })
  } catch (error) {
    console.error("Error generating view URL:", error)
    return NextResponse.json(
      { error: "Failed to generate view URL" },
      { status: 500 }
    )
  }
}
