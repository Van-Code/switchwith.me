import { Badge } from "./ui/badge"
import { CheckCircle2, Shield, Star } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ProfileBadgeProps {
  successfulSwapsCount?: number
  isEmailVerified?: boolean
}

export function ProfileBadge({
  successfulSwapsCount = 0,
  isEmailVerified = false,
}: ProfileBadgeProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {isEmailVerified && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="flex items-center gap-1 border-green-600 text-green-700 bg-green-50">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Email verified via Google</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {successfulSwapsCount > 0 && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          {successfulSwapsCount} Successful Swap{successfulSwapsCount !== 1 ? "s" : ""}
        </Badge>
      )}
    </div>
  )
}