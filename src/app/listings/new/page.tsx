import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ListingForm } from "@/components/ListingForm"

export default async function NewListingPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Create a Listing</h1>
        <p className="text-slate-600">List the seats you have and what you want</p>
      </div>

      <ListingForm />
    </div>
  )
}