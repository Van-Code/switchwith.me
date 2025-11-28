import { ProfileBadge } from "./ProfileBadge"

interface ProfileHeaderProps {
  firstName: string
  lastInitial: string
  avatarUrl?: string | null
  bio?: string | null
  successfulSwapsCount?: number,
  favoritePlayer:string | null
}

export function ProfileHeader({
  firstName,
  lastInitial,
  avatarUrl,
  bio,
  successfulSwapsCount,
}: ProfileHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          `${firstName[0]}${lastInitial}`
        )}
      </div>
      <div className="flex-1">
        <h2 className="text-2xl font-bold">
          {firstName} {lastInitial}.
        </h2>
        {bio && <p className="text-muted-foreground mt-1">{bio}</p>}
        <div className="mt-2">
          <ProfileBadge
            successfulSwapsCount={successfulSwapsCount}
          />
        </div>
      </div>
    </div>
  )
}