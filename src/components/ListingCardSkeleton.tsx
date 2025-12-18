import { Card, CardContent, CardFooter, CardHeader } from "./ui/card"
import { Skeleton } from "./ui/skeleton"

export function ListingCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        {/* Team logo and badge */}
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        {/* Title and description */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Game date */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-4 w-36" />
        </div>

        {/* Zone preferences */}
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>

        {/* Posted by */}
        <div className="pt-2 border-t">
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>

      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}
