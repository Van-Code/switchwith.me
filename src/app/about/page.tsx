import React from 'react'
import Image from "next/image"
import {Button} from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Heart } from "lucide-react"
import ContactForm from "@/components/contact-form"


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
                  src="/images/thiswilldo.jpeg" // update to your actual file path
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
                  the project, you can email me at <strong>bonsaitrees@gmail.com</strong>.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

     {/* Support Section */}
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
