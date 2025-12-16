"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAvatarUrl } from "@/hooks/useAvatarUrl"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PhotoReport {
  id: string
  reporterId: string
  reportedUserId: string
  photoId: string
  reason: string
  details: string | null
  resolved: boolean
  createdAt: Date
  reporter: {
    profile: {
      firstName: string
      lastInitial: string | null
    } | null
  }
  reportedUser: {
    profile: {
      firstName: string
      lastInitial: string | null
    } | null
  }
  photo: {
    id: string
    url: string
    order: number
  }
}

interface PhotoReportsTableProps {
  reports: PhotoReport[]
}

export function PhotoReportsTable({ reports }: PhotoReportsTableProps) {
  const router = useRouter()
  const [selectedReport, setSelectedReport] = useState<PhotoReport | null>(null)
  const [showPhotoPreview, setShowPhotoPreview] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const handleRemovePhoto = async (reportId: string) => {
    if (
      !confirm(
        "Are you sure you want to remove this photo? This action cannot be undone."
      )
    ) {
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(
        `/api/admin/photo-reports/${reportId}/remove-photo`,
        {
          method: "POST",
        }
      )

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Failed to remove photo")
        return
      }

      alert("Photo removed successfully")
      setSelectedReport(null)
      setShowPhotoPreview(false)
      router.refresh()
    } catch (error) {
      console.error("Error removing photo:", error)
      alert("An error occurred while removing photo")
    } finally {
      setActionLoading(false)
    }
  }

  const handleResolve = async (reportId: string) => {
    setActionLoading(true)
    try {
      const response = await fetch(
        `/api/admin/photo-reports/${reportId}/resolve`,
        {
          method: "POST",
        }
      )

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Failed to resolve report")
        return
      }

      setSelectedReport(null)
      setShowPhotoPreview(false)
      router.refresh()
    } catch (error) {
      console.error("Error resolving report:", error)
      alert("An error occurred while resolving report")
    } finally {
      setActionLoading(false)
    }
  }

  const openPhotoPreview = (report: PhotoReport) => {
    setSelectedReport(report)
    setShowPhotoPreview(true)
  }

  const formatReason = (reason: string) => {
    const reasons: Record<string, string> = {
      CONTACT_INFO: "Contact info",
      INAPPROPRIATE: "Inappropriate",
      HARASSMENT: "Harassment",
      OTHER: "Other",
    }
    return reasons[reason] || reason
  }

  return (
    <>
      <div className="space-y-3">
        {reports.map((report) => (
          <div
            key={report.id}
            className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {/* Photo Thumbnail */}
            <PhotoThumbnail
              url={report.photo.url}
              onClick={() => openPhotoPreview(report)}
            />

            {/* Report Details */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">
                    Reported user:{" "}
                    {report.reportedUser.profile?.firstName}{" "}
                    {report.reportedUser.profile?.lastInitial}.
                  </p>
                  <p className="text-sm text-slate-600">
                    Reported by: {report.reporter.profile?.firstName}{" "}
                    {report.reporter.profile?.lastInitial}.
                  </p>
                </div>
                {report.resolved ? (
                  <Badge variant="secondary">Resolved</Badge>
                ) : (
                  <Badge variant="default" className="bg-orange-500">
                    Pending
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline">{formatReason(report.reason)}</Badge>
                <span className="text-xs text-slate-500">
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>

              {report.details && (
                <p className="text-sm text-slate-600 italic">
                  "{report.details}"
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openPhotoPreview(report)}
                >
                  View photo
                </Button>
                {!report.resolved && (
                  <>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemovePhoto(report.id)}
                      disabled={actionLoading}
                    >
                      Remove photo
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleResolve(report.id)}
                      disabled={actionLoading}
                    >
                      Mark resolved
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Preview Modal */}
      {selectedReport && (
        <PhotoPreviewModal
          open={showPhotoPreview}
          onClose={() => {
            setShowPhotoPreview(false)
            setSelectedReport(null)
          }}
          report={selectedReport}
          onRemove={handleRemovePhoto}
          onResolve={handleResolve}
          loading={actionLoading}
        />
      )}
    </>
  )
}

function PhotoThumbnail({
  url,
  onClick,
}: {
  url: string
  onClick: () => void
}) {
  const photoUrl = useAvatarUrl(url)

  return (
    <button
      onClick={onClick}
      className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 hover:opacity-90 transition-opacity flex-shrink-0"
    >
      {photoUrl && (
        <img
          src={photoUrl}
          alt="Reported photo"
          className="w-full h-full object-cover"
        />
      )}
    </button>
  )
}

function PhotoPreviewModal({
  open,
  onClose,
  report,
  onRemove,
  onResolve,
  loading,
}: {
  open: boolean
  onClose: () => void
  report: PhotoReport
  onRemove: (reportId: string) => void
  onResolve: (reportId: string) => void
  loading: boolean
}) {
  const photoUrl = useAvatarUrl(report.photo.url)

  const formatReason = (reason: string) => {
    const reasons: Record<string, string> = {
      CONTACT_INFO: "Contact info",
      INAPPROPRIATE: "Inappropriate",
      HARASSMENT: "Harassment",
      OTHER: "Other",
    }
    return reasons[reason] || reason
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Photo Report Details</DialogTitle>
          <DialogDescription>
            Review the reported photo and take appropriate action
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Photo */}
          <div className="flex items-center justify-center bg-slate-100 rounded-lg p-4">
            {photoUrl && (
              <img
                src={photoUrl}
                alt="Reported photo"
                className="max-w-full max-h-96 object-contain"
              />
            )}
          </div>

          {/* Report Info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Reported user:</span>
              <span>
                {report.reportedUser.profile?.firstName}{" "}
                {report.reportedUser.profile?.lastInitial}.
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Reported by:</span>
              <span>
                {report.reporter.profile?.firstName}{" "}
                {report.reporter.profile?.lastInitial}.
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Reason:</span>
              <span>{formatReason(report.reason)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date:</span>
              <span>
                {new Date(report.createdAt).toLocaleDateString()}
              </span>
            </div>
            {report.details && (
              <div>
                <span className="font-medium">Details:</span>
                <p className="text-slate-600 mt-1 italic">"{report.details}"</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Close
          </Button>
          {!report.resolved && (
            <>
              <Button
                variant="secondary"
                onClick={() => onResolve(report.id)}
                disabled={loading}
              >
                Mark resolved
              </Button>
              <Button
                variant="destructive"
                onClick={() => onRemove(report.id)}
                disabled={loading}
              >
                Remove photo
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
