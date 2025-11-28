import React from 'react'
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Heart } from "lucide-react"
import ContactForm from "@/components/contact-form"


export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      {/* Top section - portrait + bio */}
      <Card className="bg-muted/30 border-border">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Portrait */}
            <div className="flex-shrink-0 self-center md:self-auto">
              <div className="rounded-full overflow-hidden border shadow-md w-28 h-28 md:w-32 md:h-32 bg-muted">
                <Image
                  src="/images/thiswilldo.jpeg" // update to your actual file path
                  alt="Cartoon illustration of Van"
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
            </div>

            {/* Text */}
            <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                  About the Creator
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  The human behind the Valkyries seat swap experiment
                </p>
              </div>

              <p>
                Hi, I&apos;m Van. I&apos;m a queer BIPOC developer who built this project
                after hearing how chaotic it was to renew season tickets and still end up
                scattered away from other queer fans. I&apos;m not the loudest Valkyries
                superfan in the arena, but I love being in the building, yelling for good
                plays, and sitting in a sea of queer joy.
              </p>

              <p>
                I like making small, community-centered tools that reduce friction for real
                people. A lot of my time goes into helping nonprofits and community spaces
                keep their sites running, updating content, and fixing all the little
                technical things that pile up.
              </p>

              <p>
                Offline, I&apos;m usually hanging out with my dogs, playing board games,
                cooking for friends, or planning a trip I probably haven&apos;t fully
                thought through yet. I like slow nights with good conversation just as much
                as I like a loud fourth quarter.
              </p>

                <p>
                  I am currently between jobs, so this project is part passion, part
                  portfolio, and part love letter to queer sports fans who just want to
                  sit near their people. If this site helps you move around the arena in a
                  way that feels better, that is a win.
                </p>

                <p>
                  If you would like to reach out about work, collaboration, or feedback on
                  the project, you can email me at <strong>bonsaitrees@gmail.com</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Quick note / cancel blurb */}
          <div className="mt-2 p-3 rounded-md bg-muted/60 text-xs md:text-sm text-muted-foreground border border-border/40">
            <p>
              <strong>Quick note:</strong> this is a one-person project. I can&apos;t
              moderate every message or swap. If someone gives you a weird vibe, that&apos;s
              on them — not a reason to cancel the person you dealt with, and definitely not
              the platform. Community projects take real energy, so thanks for keeping
              things human and kind.
            </p>
          </div>
        </CardContent>
      </Card>

     <Card className="bg-gradient-to-br from-rose-50/50 to-purple-50/50 border-rose-200/30">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-center">Support the Project</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <form
            action="https://www.paypal.com/donate"
            method="post"
            target="_top"
            className="flex justify-center"
          >
            <input type="hidden" name="business" value="this.props@gmail.com" />
            <input type="hidden" name="no_recurring" value="0" />
            <input
              type="hidden"
              name="item_name"
              value="Support Golden State Valkyries Ticket Swap"
            />
            <input type="hidden" name="currency_code" value="USD" />
            <Button
              type="submit"
              size="lg"
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-md"
            >
              <Heart className="mr-2 h-5 w-5" />
              Donate via PayPal
            </Button>
          </form>
          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              className="text-amber-700 border-amber-300 hover:bg-amber-50"
              asChild
            >
              <a href="mailto:bonsaitrees@gmail.com">Sponsor or Partner</a>
            </Button>
          </div>
        </CardContent>
      </Card>
       {/* Contact Section */}
       <Card className="bg-muted/30 border-purple-300/20">
        <CardHeader>
          <h2 className="text-2xl font-semibold">Get in Touch</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Have feedback, questions, or ideas for collaboration? Want to discuss sponsorship
            opportunities or just say hi? I'd love to hear from you!
          </p>
          <ContactForm />
        </CardContent>
      </Card>
    </div>
  )
}
