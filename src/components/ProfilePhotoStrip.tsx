"use client"

import { useState } from "react"
import { useAvatarUrl } from "@/hooks/useAvatarUrl"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Flag, X, ChevronLeft, ChevronRight, Upload } from "lucide-react"

interface ProfilePhoto {
  id: string
  url: string
  order: number
}

interface ProfilePhotoStripProps {
  photos: ProfilePhoto[]
  isOwnProfile: boolean
  reportedUserId?: string
}

export function ProfilePhotoStrip({
  photos,
  isOwnProfile,
  reportedUserId,
}: ProfilePhotoStripProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportingPhotoId, setReportingPhotoId] = useState<string | null>(null)

  const sortedPhotos = [...photos].sort((a, b) => a.order - b.order)

  if (photos.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        This user hasn't added profile photos.
      </div>
    )
  }

  const openLightbox = (index: number) => {
    setCurrentPhotoIndex(index)
    setLightboxOpen(true)
  }

  const openReportModal = (photoId: string) => {
    setReportingPhotoId(photoId)
    setReportModalOpen(true)
    setLightboxOpen(false)
  }

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % sortedPhotos.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + sortedPhotos.length) % sortedPhotos.length)
  }

  const slots = [0, 1, 2].map(
    (order) => sortedPhotos.find((p) => p.order === order) || null
  )

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {slots.map((photo, slotIndex) =>
          photo ? (
            <PhotoThumbnail
              key={photo.id}
              photo={photo}
              onClick={() =>
                openLightbox(sortedPhotos.findIndex((p) => p.id === photo.id))
              }
            />
          ) : (
            <EmptyPhotoTile
              key={`empty-${slotIndex}`}
              label={
                slotIndex === 0 ? "You" : slotIndex === 1 ? "Fan energy" : "Anything"
              }
              showAddHint={isOwnProfile}
            />
          )
        )}
      </div>

      <PhotoLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        photo={sortedPhotos[currentPhotoIndex]}
        onNext={sortedPhotos.length > 1 ? nextPhoto : undefined}
        onPrev={sortedPhotos.length > 1 ? prevPhoto : undefined}
        onReport={
          !isOwnProfile && sortedPhotos.length > 0
            ? () => openReportModal(sortedPhotos[currentPhotoIndex].id)
            : undefined
        }
        currentIndex={currentPhotoIndex}
        totalPhotos={sortedPhotos.length}
      />

      {reportingPhotoId && reportedUserId && (
        <ReportPhotoModal
          open={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false)
            setReportingPhotoId(null)
          }}
          photoId={reportingPhotoId}
          reportedUserId={reportedUserId}
        />
      )}
    </>
  )
}
function EmptyPhotoTile({ label, showAddHint }: { label: string; showAddHint: boolean }) {
  return (
    <div className="aspect-square rounded-lg border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 text-center px-3">
      <Upload className="h-7 w-7 text-slate-400" />
      <div className="text-sm font-medium text-slate-700">{label}</div>
      {showAddHint ? (
        <div className="text-xs text-muted-foreground">Add a photo in Edit Profile</div>
      ) : (
        <div className="text-xs text-muted-foreground">No photo yet</div>
      )}
    </div>
  )
}

function PhotoThumbnail({
  photo,
  onClick,
}: {
  photo: ProfilePhoto
  onClick: () => void
}) {
  const photoUrl = useAvatarUrl(photo.url)

  return (
    <button
      onClick={onClick}
      className="aspect-square rounded-lg overflow-hidden bg-slate-100 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-cyan-500"
    >
      {photoUrl && (
        <img src={photoUrl} alt="Profile photo" className="w-full h-full object-cover" />
      )}
    </button>
  )
}

function PhotoLightbox({
  open,
  onClose,
  photo,
  onNext,
  onPrev,
  onReport,
  currentIndex,
  totalPhotos,
}: {
  open: boolean
  onClose: () => void
  photo?: ProfilePhoto
  onNext?: () => void
  onPrev?: () => void
  onReport?: () => void
  currentIndex: number
  totalPhotos: number
}) {
  const photoUrl = useAvatarUrl(photo?.url || null)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-black">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Photo counter */}
          {totalPhotos > 1 && (
            <div className="absolute top-4 left-4 z-10 text-white text-sm bg-black/50 px-3 py-1 rounded">
              {currentIndex + 1} / {totalPhotos}
            </div>
          )}

          {/* Report button */}
          {onReport && (
            <button
              onClick={onReport}
              className="absolute bottom-4 right-4 z-10 text-white hover:text-gray-300 transition-colors flex items-center gap-2 bg-black/50 px-3 py-2 rounded"
            >
              <Flag className="h-4 w-4" />
              Report photo
            </button>
          )}

          {/* Previous button */}
          {onPrev && (
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 p-2 rounded-full"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Next button */}
          {onNext && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 p-2 rounded-full"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Photo */}
          <div className="flex items-center justify-center min-h-[400px] max-h-[80vh]">
            {photoUrl && (
              <img
                src={photoUrl}
                alt="Profile photo"
                className="max-w-full max-h-[80vh] object-contain"
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ReportPhotoModal({
  open,
  onClose,
  photoId,
  reportedUserId,
}: {
  open: boolean
  onClose: () => void
  photoId: string
  reportedUserId: string
}) {
  const [reason, setReason] = useState<string>("")
  const [details, setDetails] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason) {
      alert("Please select a reason")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/profile/photos/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId,
          reason,
          details: details || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Failed to submit report")
        return
      }

      alert("Report submitted successfully. Thank you for keeping our community safe.")
      onClose()
    } catch (error) {
      console.error("Error submitting report:", error)
      alert("An error occurred while submitting report")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Report photo</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Help us keep the community safe by reporting inappropriate content.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason</label>
            <div className="space-y-2">
              {[
                { value: "CONTACT_INFO", label: "Contact info" },
                { value: "INAPPROPRIATE", label: "Inappropriate" },
                { value: "HARASSMENT", label: "Harassment" },
                { value: "OTHER", label: "Other" },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="reason"
                    value={option.value}
                    checked={reason === option.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="text-cyan-600"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={300}
              className="w-full min-h-[100px] px-3 py-2 border border-slate-200 rounded-md text-sm"
              placeholder="Provide any additional context..."
            />
            <p className="text-xs text-muted-foreground">
              {details.length} / 300 characters
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
