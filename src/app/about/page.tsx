import React from 'react'
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Heart } from "lucide-react"
import ContactForm from "@/components/contact-form"


export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <Card className="bg-muted/30 border-border">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0 self-center md:self-auto">
                <Image
                  src="/images/thiswilldo.jpeg"
                  alt="Cartoon illustration of Van"
                  width={128}
                  height={128}
                  className="object-cover"
                />
            </div>

              <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                  About the Creator
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-1 mb-2">
                  The human behind the Switch With Me experiment
                </p>
                <p>
                  Hi, I&apos;m Van. I&apos;m a queer Viet American developer who built 
                  this project after hearing how chaotic it was to renew season tickets 
                  and still end up scattered away from other queer fans. I made Switch 
                  With Me because I wanted a simple, safe, community-powered way for Valkyries fans (and the broader women&apos;s + gender-expansive sports crowd) to trade seats with each otherm — without fees, markups, or weirdness. Just fans helping fans.
                </p>
                <p>
                  Offline, I&apos;m usually hanging out with my dogs, playing board games,
                  cooking for friends, or planning a trip I probably haven&apos;t fully
                  thought through yet. I like slow nights with good conversation just as much
                  as I like a loud queer social event.
                </p>
                <p>
                  If you would like to reach out about work, collaboration, or feedback on
                  the project, you can email me at <strong>bonsaitrees@gmail.com</strong>.
                </p>
            </div>
          </div>
            
          <div className="mt-2 p-3 rounded-md bg-muted/60 text-xs md:text-sm text-muted-foreground border border-border/40">
            <p>
              <strong>Quick note:</strong> this is a one-person project. I can&apos;t
              moderate every message or swap. If someone gives you a weird vibe, that&apos;s
              on them — not a reason to cancel the creator of the platform, and definitely not
              the platform. Community projects take real energy, so thanks for keeping
              things human and kind.
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-12 rounded-2xl bg-gradient-to-b from-white to-amber-50/60 border border-amber-100 px-6 py-8 text-center">
        <CardHeader>
          <h2 className="text-2xl font-semibold mb-3 text-slate-900">Support the Project</h2>
        </CardHeader>
        <CardContent className="space-y-6">
         
        <p className="text-sm sm:text-base text-slate-700 max-w-2xl mx-auto mb-6">
            I am currently between jobs, and this is a one person project that takes real time,
            hosting costs, and energy to keep going. If the site makes your game day better
            and you want to help me keep it online, you can chip in with a small donation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* Ko-fi primary */}
            <a
              href="https://ko-fi.com/van889926"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-full bg-amber-500 hover:bg-amber-600 text-white transition"
            >
              Support with a small donation
            </a>

            {/* Sponsor / partner secondary */}
            <a
              href="mailto:bonsaitrees@gmail.com?subject=Sponsorship%20or%20partnership%20for%20Switch%20With%20Me"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-full border border-teal-400 text-teal-700 bg-white hover:bg-teal-50 transition"
            >
              Sponsor or partner
            </a>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Ko-fi is a secure, one time tip jar for creators. No account needed.
          </p>
        </CardContent>
      </Card>
      <Card className="bg-muted/30 border-purple-300/20" id="contact">
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
