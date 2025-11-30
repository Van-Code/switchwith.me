import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { ListingsPageClient } from "./ListingsPageClient";

export default async function ListingsPage() {
  const session = await getServerSession(authOptions);

  return <ListingsPageClient currentUserId={session?.user?.id} />;
}
