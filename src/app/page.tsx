import React from 'react';
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
      <section className="max-w-xl mx-auto">
  <div className="text-center space-y-3 p-6 rounded-lg bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20">
    <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
      <Heart className="h-5 w-5 text-pink-500" />
      Support the Project
    </h3>

    <p className="text-sm text-muted-foreground">
      This site is a community project built and maintained by one fan.  
      If you’d like to help keep it running, you can chip in below.
    </p>

    <form
      action="https://www.paypal.com/donate"
      method="post"
      target="_top"
      className="flex justify-center"
    >
      <input type="hidden" name="business" value="YOUR_PAYPAL_EMAIL" />
      <input type="hidden" name="no_recurring" value="0" />
      <input type="hidden" name="item_name" value="Support Golden State Valkyries Ticket Swap" />
      <input type="hidden" name="currency_code" value="USD" />

      <Button
        type="submit"
        size="sm"
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        <Heart className="mr-2 h-4 w-4" />
        Donate
      </Button>
    </form>

    <p className="text-xs text-muted-foreground">
      Optional, appreciated, never expected.
    </p>
  </div>
</section>

    </div>
  )
}
