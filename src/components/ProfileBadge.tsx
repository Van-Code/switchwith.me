import { Badge } from "./ui/badge"
import { CheckCircle2, Shield, Star } from "lucide-react"

interface ProfileBadgeProps {
  successfulSwapsCount?: number
}

export function ProfileBadge({
  successfulSwapsCount = 0,
}: ProfileBadgeProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {successfulSwapsCount > 0 && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          {successfulSwapsCount} Successful Swap{successfulSwapsCount !== 1 ? "s" : ""}
        </Badge>
      )}
    </div>
  )
}