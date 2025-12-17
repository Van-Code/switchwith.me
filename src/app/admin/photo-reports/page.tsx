import { redirect } from "next/navigation"
import { requireUserId } from "@/lib/auth-api"

import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PhotoReportsTable } from "@/components/PhotoReportsTable"

export default async function PhotoReportsAdminPage() {
  const auth = await requireUserId()

  if (!auth.ok) {
    redirect("/auth/signin")
  }

  const userId = auth.userId
  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (user?.role !== "ADMIN") {
    redirect("/")
  }

  // Fetch all photo reports
  const reports = await prisma.photoReport.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: {
        include: {
          profile: {
            select: {
              firstName: true,
              lastInitial: true,
            },
          },
        },
      },
      reportedUser: {
        include: {
          profile: {
            select: {
              firstName: true,
              lastInitial: true,
            },
          },
        },
      },
      photo: true,
    },
  })

  const pendingReports = reports.filter((r) => !r.resolved)
  const resolvedReports = reports.filter((r) => r.resolved)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Photo Reports</h1>
        <p className="text-slate-600 mt-2">Review and moderate reported profile photos</p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <Badge variant="default" className="bg-orange-500">
              {pendingReports.length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReports.length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Reports</CardTitle>
            <Badge variant="secondary">{resolvedReports.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedReports.length}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reports */}
      {pendingReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoReportsTable reports={pendingReports} />
          </CardContent>
        </Card>
      )}

      {/* Resolved Reports */}
      {resolvedReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resolved Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoReportsTable reports={resolvedReports} />
          </CardContent>
        </Card>
      )}

      {reports.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-slate-600">
            No photo reports yet.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
