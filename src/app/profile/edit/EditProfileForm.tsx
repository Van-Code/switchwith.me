"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProfilePhotosEdit } from "@/components/ProfilePhotosEdit"
import { redirect } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Trash2, ChevronDown } from "lucide-react"
import { useAvatarUrl } from "@/hooks/useAvatarUrl"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
interface ProfilePhoto {
  id: string
  url: string
  order: number
}

interface EditProfileFormProps {
  user: {
    profile: {
      firstName: string
      lastInitial: string | null
      avatarUrl: string | null
    } | null
    profilePhotos: ProfilePhoto[]
  }
}

export function EditProfileForm({ user }: EditProfileFormProps) {
  const { profile, profilePhotos } = user
  if (!user || !profile) {
    redirect("/auth/signin")
  }
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: profile.firstName,
    lastInitial: profile.lastInitial || "",
  })
  const [avatarKey, setAvatarKey] = useState(profile.avatarUrl)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const currentAvatarUrl = useAvatarUrl(avatarKey)

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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

    setPhotoLoading(true)

    try {
      // Create local preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Get file extension
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"

      // Get presigned URL from server
      const response = await fetch(`/api/profile/photo?ext=${ext}`)
      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Failed to get upload URL")
        setPreviewUrl(null)
        return
      }

      const { uploadUrl, key } = await response.json()

      // Upload to S3 using presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })

      if (!uploadResponse.ok) {
        alert("Failed to upload photo to S3")
        setPreviewUrl(null)
        return
      }

      // Confirm upload to server
      const confirmResponse = await fetch("/api/profile/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      })

      if (!confirmResponse.ok) {
        const error = await confirmResponse.json()
        alert(error.error || "Failed to save photo")
        setPreviewUrl(null)
        return
      }

      setAvatarKey(key)
      router.refresh()
    } catch (error) {
      console.error("Error uploading photo:", error)
      alert("An error occurred while uploading photo")
      setPreviewUrl(null)
    } finally {
      setPhotoLoading(false)
    }
  }

  const handleDeletePhoto = async () => {
    if (!avatarKey) return

    setDeleting(true)

    try {
      const response = await fetch("/api/profile/photo", {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Failed to delete photo")
        return
      }

      setAvatarKey(null)
      setPreviewUrl(null)
      setShowDeleteDialog(false)
      router.refresh()
    } catch (error) {
      console.error("Error deleting photo:", error)
      alert("An error occurred while deleting photo")
    } finally {
      setDeleting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/profile")
        router.refresh()
      } else {
        alert("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Profile</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Avatar + basics */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={previewUrl || currentAvatarUrl || undefined} />
              <AvatarFallback className="text-lg">
                {formData.firstName?.[0]}
                {formData.lastInitial}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Label htmlFor="photo" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors border rounded px-3 py-2">
                    <Upload className="h-4 w-4" />
                    <span>{photoLoading ? "Uploading..." : "Change photo"}</span>
                  </div>
                </Label>

                {avatarKey && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}

                <span className="text-xs text-muted-foreground">
                  JPEG, PNG or WebP. Max 5MB.
                </span>
              </div>

              <Input
                id="photo"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handlePhotoChange}
                disabled={photoLoading}
                className="hidden"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lastInitial">Last initial</Label>
                  <Input
                    id="lastInitial"
                    value={formData.lastInitial}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lastInitial: e.target.value.toUpperCase(),
                      })
                    }
                    maxLength={1}
                  />
                </div>
              </div>
            </div>
            {/* Sticky footer actions */}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/profile")}
              >
                Cancel
              </Button>
            </div>
          </div>

          <ProfilePhotosEdit photos={profilePhotos} />
        </CardContent>
      </Card>

      {/* Delete Photo Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Profile Photo</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your profile photo? Your avatar will revert
              to your first initial.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePhoto} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}
