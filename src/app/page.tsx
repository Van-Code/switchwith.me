import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import { ArrowRight, Shield, MessageSquare, Search, Heart, Users } from "lucide-react"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-16 pb-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-16 px-4 bg-gradient-to-b from-amber-50/50 via-white to-transparent">
        <div className="max-w-3xl mx-auto space-y-5">
          <h1 className="text-6xl font-bold text-slate-900 tracking-tight">
            Valkyries Seat Swap
          </h1>
          <div className="h-1 w-24 mx-auto bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full"></div>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Connect with fellow Golden State Valkyries fans to swap tickets and find your perfect seats.
          </p>
          <p className="text-sm text-amber-700 italic">
            Because we're better when we sit together
          </p>
        </div>
        <div className="flex gap-4 justify-center pt-6">
          {session ? (
            <>
              <Link href="/listings">
                <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-md">
                  Browse Listings
                </Button>
              </Link>
              <Link href="/listings/new">
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                  Create Listing
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/signup">
                <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-md">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        <Card className="border-cyan-200 bg-cyan-50/30 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="h-14 w-14 rounded-full bg-cyan-100 flex items-center justify-center mb-3">
              <Search className="h-7 w-7 text-cyan-600" />
            </div>
            <CardTitle className="text-slate-900">Find Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 leading-relaxed">
              List the seats you have and specify what you want. Our matching system helps surface compatible swaps.
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/30 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center mb-3">
              <MessageSquare className="h-7 w-7 text-amber-600" />
            </div>
            <CardTitle className="text-slate-900">Direct Messaging</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 leading-relaxed">
              Connect directly with other fans through in app messaging to compare seats and work out the details.
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/30 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
              <Shield className="h-7 w-7 text-emerald-600" />
            </div>
            <CardTitle className="text-slate-900">Trust and Safety</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 leading-relaxed">
              Clear listing statuses, safety tips, and transparent conversations help you decide who to swap with,
              while you keep transfers in the official ticketing app.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-slate-50 to-amber-50/30 rounded-2xl p-10 max-w-4xl mx-auto shadow-sm border border-slate-200/50">
        <h2 className="text-3xl font-bold mb-8 text-slate-900">How It Works</h2>
        <ol className="space-y-5">
          <li className="flex gap-4 items-start">
            <span className="flex-shrink-0 h-8 w-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-sm">
              1
            </span>
            <span className="text-slate-700 pt-1">Create an account and list the seats you have.</span>
          </li>
          <li className="flex gap-4 items-start">
            <span className="flex-shrink-0 h-8 w-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-sm">
              2
            </span>
            <span className="text-slate-700 pt-1">Specify what sections or zones you would like to swap for.</span>
          </li>
          <li className="flex gap-4 items-start">
            <span className="flex-shrink-0 h-8 w-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-sm">
              3
            </span>
            <span className="text-slate-700 pt-1">Browse other listings or let people find yours.</span>
          </li>
          <li className="flex gap-4 items-start">
            <span className="flex-shrink-0 h-8 w-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-sm">
              4
            </span>
            <span className="text-slate-700 pt-1">Message potential swap partners to compare seats and see if it feels fair.</span>
          </li>
          <li className="flex gap-4 items-start">
            <span className="flex-shrink-0 h-8 w-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-sm">
              5
            </span>
            <span className="text-slate-700 pt-1">
              Complete your swap through Ticketmaster or the official ticketing app. This site does not handle
              transfers or payments.
            </span>
          </li>
        </ol>
      </section>

      {/* Support Card */}
      <section className="max-w-4xl mx-auto px-4">
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-50 shadow-lg">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center">
                <Heart className="h-9 w-9 text-rose-600 fill-rose-200" />
              </div>
            </div>
            <CardTitle className="text-4xl text-slate-900">Support This Community Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pb-8">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <p className="text-lg text-slate-700 leading-relaxed">
                This site is a solo passion project from a Valkyries fan who wanted an easier way for us to sit
                together instead of being scattered around the arena. The goal is to keep it free, simple, and
                community first.
              </p>
              <div className="flex items-center justify-center gap-2 text-amber-700">
                <Users className="h-5 w-5" />
                <p className="text-sm font-medium">Built for fans, by a fan</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 space-y-5 border border-amber-200/50">
              <div className="text-center space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-3 text-slate-900">Help Keep It Running</h3>
                  <p className="text-slate-600 leading-relaxed mb-6 max-w-xl mx-auto">
                    Hosting, maintenance, and new features take real time and resources. If this tool has helped you,
                    you can support it so it stays online for the community.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <form
                    action="https://www.paypal.com/donate"
                    method="post"
                    target="_top"
                    className="flex justify-center"
                  >
                    <input type="hidden" name="business" value="YOUR_PAYPAL_EMAIL" />
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

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-amber-700 border-amber-300 hover:bg-amber-50"
                    asChild
                  >
                    <a href="mailto:youremail@example.com">Sponsor or Partner</a>
                  </Button>

                  <p className="text-xs text-slate-500 text-center max-w-md leading-relaxed">
                    Every contribution goes toward hosting, maintenance, and future improvements, not ticket fees.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-amber-300/40 pt-6 text-center text-xs text-slate-500 leading-relaxed max-w-2xl mx-auto">
              This is an independent fan project and is not affiliated with or endorsed by the Golden State
              Valkyries, the WNBA, or Ticketmaster.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
