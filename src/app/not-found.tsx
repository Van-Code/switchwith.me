// src/app/not-found.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center space-y-8">
        {/* Icon / badge */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Search className="h-10 w-10 text-primary" />
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-xs font-medium text-accent-foreground shadow-sm">
              404
            </span>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Seat not found
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            The page you are looking for is not here.  
            Maybe that link expired or never quite made it out of the nosebleeds.
          </p>
          <p className="text-sm text-muted-foreground">
            Try heading back home or browsing open listings to find your next spot in the arena.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Button>
          </Link>
          <Link href="/listings">
            <Button variant="outline">
              Browse listings
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
