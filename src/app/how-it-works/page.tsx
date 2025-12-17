import React from "react"
import {
  ArrowRight,
  Eye,
  MessageCircle,
  Sparkles,
  Shield,
  Search,
  Ticket,
} from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/auth-server"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { isReportUserEnabled } from "@/lib/features"

export default async function HowItWorksPage() {
  const session = await auth()

  return (
    <div className="space-y-16 pb-16">
      {/* Hero */}
      <section className="py-8 px-4 bg-gradient-to-b from-amber-50/60 via-white to-transparent">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            How Switch With Me works
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Trade seats and coordinate the ticket exchange directly with the other fan
            using trusted transfer options.
          </p>

          {/* <div className="flex flex-wrap justify-center gap-3 mt-4">
            <Link href="/browse">
              <Button size="lg" className="gap-2">
                Preview listings
                <Search className="w-4 h-4" />
              </Button>
            </Link>
            {!session && (
              <Link href="/signin">
                <Button size="lg" variant="outline" className="gap-2">
                  Sign in with Google
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div> */}
        </div>
      </section>

      {/* 3 step overview */}
      {/* <section className="px-4">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">
              The flow in three simple steps
            </h2>
            <p className="text-slate-600">
              Browse, connect, and swap seats for the same game. You decide how to
              exchange tickets using methods you already trust.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="h-full border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full p-2 bg-cyan-50 border border-cyan-100">
                    <Eye className="w-5 h-5 text-cyan-700" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Step 1
                    </p>
                    <CardTitle className="text-base">Browse seat swap listings</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                <p>
                  Start on the browse page. Filter by team and game date. In preview mode
                  you will see a small sample of real listings before you sign in.
                </p>
                <p className="text-xs text-slate-500">
                  Listings are for swapping seats within the same event. No ticket
                  resales.
                </p>
              </CardContent>
            </Card>

            <Card className="h-full border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full p-2 bg-amber-50 border border-amber-100">
                    <MessageCircle className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Step 2
                    </p>
                    <CardTitle className="text-base">
                      Sign in and start messaging
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                <p>
                  To see full details and message another fan, sign in with Google. If you
                  click "Sign in to Message" on a listing, you will be returned directly
                  to a conversation for that listing after you sign in.
                </p>
                <p className="text-xs text-slate-500">
                  You can edit the name that appears on your profile. Google sign in keeps
                  account setup fast and limits how much sensitive data we store.
                </p>
              </CardContent>
            </Card>

            <Card className="h-full border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full p-2 bg-emerald-50 border border-emerald-100">
                    <Sparkles className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Step 3
                    </p>
                    <CardTitle className="text-base">Agree on a swap and enjoy</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                <p>
                  Once you and another fan agree, you decide together how to handle the
                  ticket exchange. Most fans transfer tickets using the official team app
                  or another method you both already trust.
                </p>
                <p className="text-xs text-slate-500">
                  Switch With Me does not hold or transfer tickets. You and the other fan
                  choose the method and confirm the details in chat.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}

      {/* Detailed sections + ticket panel */}
      <section className="px-4">
        <div className="max-w-5xl mx-auto grid gap-10 lg:grid-cols-[1.2fr_minmax(0,1fr)]">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">What you can do</h2>

            <div className="space-y-4 text-sm text-slate-700">
              <div>
                <h3 className="font-semibold text-slate-900">Create a listing</h3>
                <p>
                  List seats you have and want to trade, or create a listing if you're
                  looking for tickets. Choose your game, specify your preferences, and
                  connect with other fans. You can keep exact seat numbers private until
                  you feel comfortable.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">Find compatible swaps</h3>
                <p>
                  Use filters to find other fans who want something similar. When you see
                  a listing that looks promising, open a conversation and talk it through
                  in one place.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">Boost your listing</h3>
                <p>
                  If you need more visibility, you can choose to boost your listing so
                  more fans see it when they browse. Pricing and availability will be
                  shown in the app wherever boosting is offered.
                </p>
              </div>
            </div>

            {/* Ticket exchange methods panel */}
            <Card
              id="ticket-exchange"
              className="border-dashed border-slate-300 mt-4 bg-white/70"
            >
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-full p-2 bg-violet-50 border border-violet-100">
                    <Ticket className="w-4 h-4 text-violet-700" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Ticket exchange
                    </p>
                    <CardTitle className="text-base">
                      How fans usually swap tickets
                    </CardTitle>
                  </div>
                </div>
                <p className="text-sm text-slate-700">
                  Switch With Me stays out of the actual transfer. You and the other fan
                  handle that part using tools you already know.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <ul className="space-y-2 list-disc pl-5">
                  <li>Use the official team or venue app to send tickets.</li>
                  <li>Use the ticketing site where you originally bought your seats.</li>
                  <li>
                    Add tickets to mobile wallet apps if that is what you both prefer.
                  </li>
                </ul>
                <p className="text-xs text-slate-500">
                  Switch With Me is not connected to any ticketing company. We do not see
                  your tickets, and we do not store them.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Safety / trust card */}
          <Card className="border-slate-200 bg-slate-50/70" id="ticket-safety">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full p-2 bg-slate-900 text-amber-300">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Safety and trust
                  </p>
                  <CardTitle className="text-base">Fans helping fans</CardTitle>
                </div>
              </div>
              <p className="text-sm text-slate-700">
                We want this to feel like trading seats with people you could actually sit
                next to. A few simple guidelines help.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <ul className="space-y-2 list-disc pl-5">
                <li>Only swap with people you feel comfortable chatting with.</li>
                <li>Keep payment info and sensitive personal details out of the chat.</li>
                <li>
                  Only transfer tickets using official or trusted apps and never through
                  random links.
                </li>
                <li>Double check game, date, and team before you agree on a swap.</li>

                {isReportUserEnabled() && (
                  <li>
                    If something feels off, you can report a listing or block a user.
                  </li>
                )}
              </ul>
              <p className="text-xs text-slate-500 pt-1">
                Switch With Me is a fan project. It is not affiliated with any team,
                league, Ticketmaster, or venue.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-semibold text-slate-900 text-center">
            Frequently asked questions
          </h2>

          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <p className="font-semibold">Do I have to sign in to see anything?</p>
              <p>
                No. You can see a preview of real listings before you sign in. To see full
                details and start messaging, you will need to sign in with Google.
              </p>
            </div>

            <div>
              <p className="font-semibold">Do I send my tickets through the app?</p>
              <p>
                No. Switch With Me does not transfer or store tickets. When you agree to a
                swap, you and the other fan exchange tickets using the official ticketing
                app or another secure method you both trust.
              </p>
            </div>

            <div>
              <p className="font-semibold">Is it free to use?</p>
              <p>
                Basic use is free. If we offer paid features like boosted listings,
                pricing will be clearly labeled in the app before you choose anything.
              </p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <Link href="/browse">
              <Button size="lg" className="gap-2">
                Start exploring
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
