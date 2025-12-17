import { requireUserId } from "@/lib/auth-api"
import { redirect } from "next/navigation"
import { MatchesClient } from "./MatchesClient"

export default async function MatchesPage() {
  const auth = await requireUserId()
  if (!auth.ok) {
    redirect("/auth/signin")
  }

  // For now, we'll fetch matches client-side since it's complex
  return <MatchesClient currentUserId={auth.userId} />
}
