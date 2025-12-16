"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Trash2, ChevronUp, ChevronDown, Info } from "lucide-react"
import { useAvatarUrl } from "@/hooks/useAvatarUrl"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

interface ProfilePhoto {
  id: string
  url: string
  order: number
}

interface ProfilePhotosEditProps {
  photos: ProfilePhoto[]
}

const PHOTO_SLOTS = [
  {
    order: 0,
    label: "You",
    helper: "A clear photo of you. Face visible recommended, not required.",
  },
  {
    order: 1,
    label: "Fan energy",
    helper: "Game day, merch, stadium vibes, or you in your element.",
  },
  {
    order: 2,
    label: "Anything you'd like to share",
    helper: "Hobby, pet, view from your seat, or something that feels like you.",
  },
]

export function ProfilePhotosEdit({ photos }: ProfilePhotosEditProps) {
  const router = useRouter()
  const [photoStates, setPhotoStates] = useState<Record<number, ProfilePhoto | null>>(
    () => {
      const initial: Record<number, ProfilePhoto | null> = { 0: null, 1: null, 2: null }
      photos.forEach((photo) => {
        initial[photo.order] = photo
      })
      return initial
    }
  )
  const [uploading, setUploading] = useState<Record<number, boolean>>({})
  const [deleting, setDeleting] = useState<Record<string, boolean>>({})
  const [showGuidelines, setShowGuidelines] = useState(false)

  const handlePhotoUpload = async (order: number, file: File) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Only JPEG, PNG, and WebP are allowed")
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert("File too large. Maximum size is 5MB")
      return
    }

    setUploading({ ...uploading, [order]: true })

    try {
      // Get file extension
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"

      // Get presigned URL
      const response = await fetch(`/api/profile/photos?order=${order}&ext=${ext}`)
      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Failed to get upload URL")
        return
      }

      const { uploadUrl, key } = await response.json()

      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })

      if (!uploadResponse.ok) {
        alert("Failed to upload photo")
        return
      }

      // Confirm upload
      const confirmResponse = await fetch("/api/profile/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, order }),
      })

      if (!confirmResponse.ok) {
        const error = await confirmResponse.json()
        alert(error.error || "Failed to save photo")
        return
      }

      const { photo } = await confirmResponse.json()
      setPhotoStates({ ...photoStates, [order]: photo })
      router.refresh()
    } catch (error) {
      console.error("Error uploading photo:", error)
      alert("An error occurred while uploading photo")
    } finally {
      setUploading({ ...uploading, [order]: false })
    }
  }

  const handlePhotoDelete = async (photoId: string, order: number) => {
    if (!confirm("Are you sure you want to delete this photo?")) {
      return
    }

    setDeleting({ ...deleting, [photoId]: true })

    try {
      const response = await fetch(`/api/profile/photos?id=${photoId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Failed to delete photo")
        return
      }

      setPhotoStates({ ...photoStates, [order]: null })
      router.refresh()
    } catch (error) {
      console.error("Error deleting photo:", error)
      alert("An error occurred while deleting photo")
    } finally {
      setDeleting({ ...deleting, [photoId]: false })
    }
  }

  const handleReorder = async (photoId: string, direction: "up" | "down") => {
    try {
      const response = await fetch("/api/profile/photos/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, direction }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Failed to reorder photos")
        return
      }

      router.refresh()
    } catch (error) {
      console.error("Error reordering photos:", error)
      alert("An error occurred while reordering photos")
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile photos</CardTitle>
            <Button
              variant="link"
              onClick={() => setShowGuidelines(true)}
              className="text-cyan-600 hover:text-cyan-700 p-0"
            >
              <Info className="h-4 w-4 mr-1" />
              Photo guidelines
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Add up to 3 photos to help others recognize you and build trust. Optional.
            Public. You're always in control.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {PHOTO_SLOTS.map((slot) => (
            <PhotoSlot
              key={slot.order}
              slot={slot}
              photo={photoStates[slot.order]}
              uploading={uploading[slot.order] || false}
              deleting={
                photoStates[slot.order]
                  ? deleting[photoStates[slot.order]!.id] || false
                  : false
              }
              onUpload={handlePhotoUpload}
              onDelete={handlePhotoDelete}
              onReorder={handleReorder}
              canMoveUp={slot.order > 0 && !!photoStates[slot.order]}
              canMoveDown={slot.order < 2 && !!photoStates[slot.order]}
            />
          ))}
        </CardContent>
      </Card>

      {/* Photo Guidelines Modal */}
      <Dialog open={showGuidelines} onOpenChange={setShowGuidelines}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Photo guidelines</DialogTitle>
            <DialogDescription className="space-y-2 text-sm">
              <p>
                Photos must not include contact info like phone numbers, emails, or
                social handles.
              </p>
              <p>
                Screenshots are okay as long as no contact info is visible.
              </p>
              <p>Keep it respectful and safe for the community.</p>
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowGuidelines(false)}>Got it</Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface PhotoSlotProps {
  slot: { order: number; label: string; helper: string }
  photo: ProfilePhoto | null
  uploading: boolean
  deleting: boolean
  onUpload: (order: number, file: File) => void
  onDelete: (photoId: string, order: number) => void
  onReorder: (photoId: string, direction: "up" | "down") => void
  canMoveUp: boolean
  canMoveDown: boolean
}

function PhotoSlot({
  slot,
  photo,
  uploading,
  deleting,
  onUpload,
  onDelete,
  onReorder,
  canMoveUp,
  canMoveDown,
}: PhotoSlotProps) {
  const photoUrl = useAvatarUrl(photo?.url || null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(slot.order, file)
    }
    // Reset input value to allow re-uploading the same file
    e.target.value = ""
  }

  return (
    <div className="border border-slate-200 rounded-lg p-4">
      <div className="flex items-start gap-4">
        {/* Photo Preview */}
        <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={slot.label}
              className="w-full h-full object-cover"
            />
          ) : (
            <Upload className="h-8 w-8 text-slate-400" />
          )}
        </div>

        {/* Photo Controls */}
        <div className="flex-1 space-y-2">
          <div>
            <Label className="text-base font-semibold">{slot.label}</Label>
            <p className="text-xs text-muted-foreground mt-1">{slot.helper}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Label
              htmlFor={`photo-${slot.order}`}
              className="cursor-pointer inline-block"
            >
              <div className="flex items-center gap-2 text-sm border rounded px-3 py-1.5 hover:bg-slate-50 transition-colors">
                <Upload className="h-4 w-4" />
                <span>
                  {uploading
                    ? "Uploading..."
                    : photo
                    ? "Replace"
                    : "Upload"}
                </span>
              </div>
            </Label>
            <Input
              id={`photo-${slot.order}`}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />

            {photo && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(photo.id, slot.order)}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? "Deleting..." : "Delete"}
                </Button>

                {canMoveUp && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReorder(photo.id, "up")}
                  >
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Move up
                  </Button>
                )}

                {canMoveDown && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReorder(photo.id, "down")}
                  >
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Move down
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
