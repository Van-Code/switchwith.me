import React from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ArrowRight, Shield, MessageSquare, Search, Heart, Users } from "lucide-react"
import { AccountDeletedMessage } from "@/components/AccountDeletedMessage"


export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
  <div className="space-y-16 pb-8">
    <AccountDeletedMessage />

    <section className="text-center space-y-6 py-16 px-4 bg-gradient-to-b from-amber-50/50 via-white to-transparent">
      <div className="max-w-3xl mx-auto space-y-5">
        <h1 className="text-6xl font-bold text-slate-900 tracking-tight">
          Switch With Me
        </h1>
        <div className="h-1 w-24 mx-auto bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full"></div>
        <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
        A community-powered seat swap for W+ sports fans
        </p>
        <p className="text-l text-slate-600 leading-relaxed max-w-2xl mx-auto">
        Trade single seats, a few games, or your whole season with fans who actually care about the culture. Browse open tickets, try new sections, or let someone awesome take that extra seat off your hands. Simple, safe, and built by the community that shows up. </p>
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
              <Link href="/auth/signin">
                <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-md">
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
              List the seats you have or the seats you're looking for. Our matching system helps surface compatible swaps.
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
            <span className="text-slate-700 pt-1">Sign in with Google and create a listing for seats you have or want.</span>
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
        <div className="text-center space-y-3 p-6 rounded-2xl bg-gradient-to-b from-white to-amber-50/60 border border-amber-100 shadow-sm">
            <h3 className="text-xl font-semibold flex items-center justify-center gap-2 text-slate-800">
              <Heart className="h-5 w-5 text-teal-500" />
              Support the Project
            </h3>

            <p className="text-sm text-slate-700 max-w-xl mx-auto">
              This site is built and run by one person. If it helps you find better seats,
              you can support the work with a small donation.
            </p>

            <a
              href="https://ko-fi.com/van889926"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-full bg-amber-500 hover:bg-amber-600 text-white transition"
            >
              Support with a small donation
            </a>

            <p className="text-xs text-slate-500">
              Powered by Ko-fi, a simple tip jar for creators.
            </p>
          </div>
      </section>
    </div>
  )
}
