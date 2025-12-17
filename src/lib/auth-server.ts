import { buildAuthOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

export async function auth() {
  return getServerSession(buildAuthOptions)
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) return null
  return session
}
