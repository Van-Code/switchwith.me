import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import { ArrowRight, Shield, MessageSquare, Search, Heart, Users } from "lucide-react"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4 py-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Valkyries Seat Swap
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connect with fellow Golden State Valkyries fans to swap tickets and find your perfect seats.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          {session ? (
            <>
              <Link href="/listings">
                <Button size="lg">Browse Listings</Button>
              </Link>
              <Link href="/listings/new">
                <Button size="lg" variant="outline">
                  Create Listing
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/signup">
                <Button size="lg">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <Search className="h-8 w-8 mb-2 text-purple-600" />
            <CardTitle>Find Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              List the seats you have and specify what you want. Our matching system helps surface compatible swaps.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MessageSquare className="h-8 w-8 mb-2 text-purple-600" />
            <CardTitle>Direct Messaging</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Connect directly with other fans through in app messaging to compare seats and work out the details.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 mb-2 text-purple-600" />
            <CardTitle>Trust and Safety</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Clear listing statuses, safety tips, and transparent conversations help you decide who to swap with,
              while you keep transfers in the official ticketing app.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="bg-muted/50 rounded-lg p-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <ol className="space-y-3">
          <li className="flex gap-3">
            <span className="font-bold text-purple-600">1.</span>
            <span>Create an account and list the seats you have.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-purple-600">2.</span>
            <span>Specify what sections or zones you would like to swap for.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-purple-600">3.</span>
            <span>Browse other listings or let people find yours.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-purple-600">4.</span>
            <span>Message potential swap partners to compare seats and see if it feels fair.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-purple-600">5.</span>
            <span>
              Complete your swap through Ticketmaster or the official ticketing app. This site does not handle
              transfers or payments.
            </span>
          </li>
        </ol>
      </section>

      <section className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-purple-600/20 border-purple-500/30">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
              <Heart className="h-10 w-10 text-pink-500" />
            </div>
            <CardTitle className="text-3xl">Support This Community Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-3">
              <p className="text-lg">
                This site is a solo passion project from a Valkyries fan who wanted an easier way for us to sit
                together instead of being scattered around the arena. The goal is to keep it free, simple, and
                community first.
              </p>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Users className="h-5 w-5" />
                <p className="text-sm">Built for fans, by a fan</p>
              </div>
            </div>

            <div className="bg-background/50 rounded-lg p-6 space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2 text-purple-300">Help Keep It Running</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Hosting, maintenance, and new features take real time and resources. If this tool has helped you,
                  you can support it so it stays online for the community.
                </p>

                <div className="flex flex-col items-center gap-3">
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
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Heart className="mr-2 h-5 w-5" />
                      Donate via PayPal
                    </Button>
                  </form>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-purple-600 border-purple-300 hover:bg-purple-50"
                    asChild
                  >
                     <a href="mailto:youremail@example.com">Sponsor or Partner</a>
                  </Button>

                  <p className="text-xs text-muted-foreground text-center max-w-xs">
                    Every contribution goes toward hosting, maintenance, and future improvements, not ticket fees.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-purple-500/30 pt-4 text-center text-xs text-muted-foreground">
              This is an independent fan project and is not affiliated with or endorsed by the Golden State
              Valkyries, the WNBA, or Ticketmaster.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
