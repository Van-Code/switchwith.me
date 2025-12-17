import { requireUserId } from "@/lib/auth-api"
import { ListingsPageClient } from "./ListingsPageClient"

export default async function ListingsPage() {
  const auth = await requireUserId()

  return <ListingsPageClient currentUserId={auth.userId} />
}
