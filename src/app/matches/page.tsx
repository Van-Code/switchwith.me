import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MatchesClient } from "./MatchesClient"

export default async function MatchesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  // For now, we'll fetch matches client-side since it's complex
  return <MatchesClient currentUserId={session.user.id} />
}