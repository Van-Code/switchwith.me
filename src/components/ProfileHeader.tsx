"use client"

import { ProfileBadge } from "./ProfileBadge"
import { useAvatarUrl } from "@/hooks/useAvatarUrl"

interface ProfileHeaderProps {
  firstName: string
  lastInitial?: string | null
  avatarUrl?: string | null
  successfulSwapsCount?: number
  isEmailVerified?: boolean
}

export function ProfileHeader({
  firstName,
  lastInitial,
  avatarUrl,
  successfulSwapsCount,
  isEmailVerified,
}: ProfileHeaderProps) {
  const avatarViewUrl = useAvatarUrl(avatarUrl)

  return (
    <div className="flex items-start gap-4">
      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
        {avatarViewUrl ? (
          <img
            src={avatarViewUrl}
            alt="Avatar"
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          `${firstName[0]}${lastInitial}`
        )}
      </div>
      <div className="flex-1">
        <h2 className="text-2xl font-bold">
          {firstName} {lastInitial}
        </h2>
        <div className="mt-2">
          <ProfileBadge
            successfulSwapsCount={successfulSwapsCount}
            isEmailVerified={isEmailVerified}
          />
        </div>
      </div>
    </div>
  )
}
