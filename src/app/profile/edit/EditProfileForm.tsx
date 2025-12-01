"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload } from "lucide-react"

interface EditProfileFormProps {
  profile: {
    firstName: string
    lastInitial: string | null
    avatarUrl: string | null
    bio: string | null
    favoritePlayer: string | null
  }
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: profile.firstName,
    lastInitial: profile.lastInitial || "",
    bio: profile.bio || "",
    favoritePlayer: profile.favoritePlayer || "",
  })
  const [previewUrl, setPreviewUrl] = useState(profile.avatarUrl)

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoLoading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to server
      const formData = new FormData()
      formData.append("photo", file)

      const response = await fetch("/api/profile/photo", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Failed to upload photo")
        setPreviewUrl(profile.avatarUrl)
      }
    } catch (error) {
      console.error("Error uploading photo:", error)
      alert("An error occurred while uploading photo")
      setPreviewUrl(profile.avatarUrl)
    } finally {
      setPhotoLoading(false)
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
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo Upload */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={previewUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {formData.firstName[0]}
                {formData.lastInitial}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="photo" className="cursor-pointer">
                <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>{photoLoading ? "Uploading..." : "Change photo"}</span>
                </div>
              </Label>
              <Input
                id="photo"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handlePhotoChange}
                disabled={photoLoading}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG or WebP. Max 5MB.
              </p>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
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
              <Label htmlFor="lastInitial">Last Initial</Label>
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

          {/* Favorite Player */}
          <div>
            <Label htmlFor="favoritePlayer">Favorite Player</Label>
            <Input
              id="favoritePlayer"
              value={formData.favoritePlayer}
              onChange={(e) =>
                setFormData({ ...formData, favoritePlayer: e.target.value })
              }
              placeholder="e.g., Satou Sabally"
            />
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Tell us a bit about yourself..."
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/profile")}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
