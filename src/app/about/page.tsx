import Image from "next/image"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { HeartHandshake } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      {/* Top section - portrait + bio side by side on desktop */}
      <Card className="bg-muted/30 border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Portrait */}
            <div className="flex-shrink-0 self-center md:self-auto">
              <div className="rounded-full overflow-hidden border shadow-md w-32 h-32 md:w-40 md:h-40 bg-muted">
                <Image
                  src="/images/sketch.png" // update to your actual file path
                  alt="Cartoon illustration of Van"
                  width={160}
                  height={160}
                  className="object-cover"
                />
              </div>
            </div>

            {/* Text */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  About the Creator
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  The human behind the seat swap experiment
                </p>
              </div>

              <div className="space-y-3 text-base md:text-lg leading-relaxed text-muted-foreground">
                <p>
                  Hi, I am Van. I am a queer BIPOC developer who built this project after
                  hearing a friend talk about how chaotic it was to renew season tickets
                  and try to sit near other queer fans. I am not the loudest Valkyries
                  superfan in the building, but I love going to games and being surrounded
                  by queer joy in the stands. The community is what makes it special.
                </p>

                <p>
                  I enjoy making small, community centered tools that reduce friction for
                  real people. A lot of my time goes into helping nonprofits and community
                  spaces keep their sites running, updating content and fixing the little
                  technical things that tend to pile up.
                </p>

                <p>
                  Outside of screens, I am usually hanging out with my dogs, playing board
                  games, cooking for friends, or planning a trip I probably have not fully
                  thought through yet. I like slow nights with good conversation as much as
                  I like yelling at a great play from the stands.
                </p>

                <p>
                  I am currently between jobs, so this project is part passion, part
                  portfolio, and part love letter to queer sports fans who just want to
                  sit near their people. If this site helps you move around the arena in a
                  way that feels better, that is a win.
                </p>

                <p>
                  If you would like to reach out about work, collaboration, or feedback on
                  the project, you can email me at <strong>youremail@example.com</strong>.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support / Sponsorship - smaller, not its own huge block */}
      <Card className="bg-background/70 border-dashed border-purple-400/40">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <HeartHandshake className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-semibold">Support and Sponsorship</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm md:text-base text-muted-foreground">
          <p>
            This site is a solo, fan run project. If it has been useful and you want to
            support it, there are a few simple ways to help.
          </p>

          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="font-medium">Share it</span> with other fans who might want
              to swap seats or sit closer to community.
            </li>
            <li>
              <span className="font-medium">Offer feedback</span> so I can keep improving
              the experience over time.
            </li>
            <li>
              <span className="font-medium">Sponsor or support</span> if you have a
              business or organization that aligns with this crowd and want to help keep
              it running.
            </li>
          </ul>

          <p>
            For sponsorship or collaboration conversations, email{" "}
            <strong>youremail@example.com</strong> with a few lines about who you are and
            how you would like to be involved.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
