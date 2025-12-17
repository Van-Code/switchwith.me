import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { buildAuthOptions } from "@/lib/auth"

export async function requireUserId() {
  const session = await getServerSession(buildAuthOptions)
  const userId = session?.user?.id

  if (!userId) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  return { ok: true as const, userId }
}
