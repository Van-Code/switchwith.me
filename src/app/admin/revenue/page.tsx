import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, CreditCard, TrendingUp, Users } from "lucide-react"

export default async function RevenueAdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  // TODO: Add proper admin role check
  // For now, allow all authenticated users to view this page
  // In production, you should check if the user has admin privileges

  // Fetch boosted listings
  const boostedListings = await prisma.listing.findMany({
    where: {
      boosted: true,
    },
    orderBy: {
      boostedAt: "desc",
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      team: {
        select: {
          name: true,
          logoUrl: true,
        },
      },
    },
    take: 20,
  })

  // Fetch recent credit transactions
  const creditTransactions = await prisma.creditTransaction.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
    take: 50,
  })

  // Calculate statistics
  const totalCreditsIssued = await prisma.creditTransaction.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      amount: {
        gt: 0,
      },
    },
  })

  const totalCreditsSpent = await prisma.creditTransaction.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      amount: {
        lt: 0,
      },
    },
  })

  const totalBoostedListings = await prisma.listing.count({
    where: {
      boosted: true,
    },
  })

  const totalUsers = await prisma.user.count()

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Revenue Dashboard</h1>
        <p className="text-slate-600 mt-2">Monitor boosted listings and credit transactions</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Boosted Listings</CardTitle>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBoostedListings}</div>
            <p className="text-xs text-muted-foreground">Total active boosted listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Issued</CardTitle>
            <CreditCard className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCreditsIssued._sum.amount || 0}</div>
            <p className="text-xs text-muted-foreground">Total credits granted/purchased</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.abs(totalCreditsSpent._sum.amount || 0)}</div>
            <p className="text-xs text-muted-foreground">Total credits consumed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
      </div>

      {/* Boosted Listings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Boosted Listings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {boostedListings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No boosted listings yet</p>
          ) : (
            <div className="space-y-3">
              {boostedListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {listing.team.logoUrl && (
                        <img
                          src={listing.team.logoUrl}
                          alt={listing.team.name}
                          className="h-6 w-6 object-contain"
                        />
                      )}
                      <p className="font-medium text-slate-900">
                        {listing.team.name} - Section {listing.haveSection}, Row {listing.haveRow}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Boosted by {listing.user.profile?.firstName} {listing.user.profile?.lastInitial}.
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-amber-500">Boosted</Badge>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(listing.boostedAt!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credit Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-cyan-500" />
            Recent Credit Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {creditTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {creditTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg text-sm"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {transaction.user.profile?.firstName} {transaction.user.profile?.lastInitial}.
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {transaction.note || "No description"}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={transaction.amount > 0 ? "default" : "secondary"}
                      className={transaction.amount > 0 ? "bg-green-500" : "bg-slate-500"}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount}
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
