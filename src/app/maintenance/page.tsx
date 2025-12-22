import { Wrench } from "lucide-react"
import { useRouter } from "next/router"

export default function MaintenancePage() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center space-y-8">
        {/* Icon / badge */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Wrench className="h-10 w-10 text-primary" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            We&rsquo;ll be back soon!
          </h1>

          <p className="text-sm text-muted-foreground">
            Sorry for the inconvenience but we&rsquo;re performing some maintenance at the
            moment. We&rsquo;ll be back online shortly!
          </p>
        </div>
      </div>
    </main>
  )
}
