import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import Link from "next/link"
import { Button } from "../components/ui/button"
import { isSeatMapEnabled } from "../lib/features"
import { SocketProvider } from "../contexts/SocketContext"
import Footer from "../components/Footer"
import { NotificationBell } from "../components/notification-bell"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Valkyries Seat Swap",
  description: "Find and swap Golden State Valkyries tickets with other fans",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <SocketProvider>
          <nav className="border-b">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <Link href="/" className="text-xl font-bold">
                Valkyries Seat Swap
              </Link>

              <div className="flex items-center gap-4">
                {session ? (
                  <>
                    <Link href="/listings">
                      <Button variant="ghost">Browse</Button>
                    </Link>
                    {isSeatMapEnabled() && (

                    <Link href="/listings/map">
                      <Button variant="ghost">Map View</Button>
                      </Link>
                    )}
                    <Link href="/listings/new">
                      <Button variant="ghost">Create Listing</Button>
                    </Link>
                    <Link href="/matches">
                      <Button variant="ghost">Matches</Button>
                    </Link>
                    <Link href="/messages">
                      <Button variant="ghost">Messages</Button>
                    </Link>
                    <Link href="/profile">
                      <Button variant="ghost">Profile</Button>
                    </Link>
                    <Link href="/about">
                      <Button variant="ghost">About the Creator</Button>
                    </Link>
                    <NotificationBell />
                    <form action="/api/auth/signout" method="post">
                      <Button variant="outline" type="submit">Sign Out</Button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link href="/about">
                      <Button variant="ghost">About the Creator</Button>
                    </Link>
                    <Link href="/auth/signin">
                      <Button variant="ghost">Sign In</Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button>Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>

          <main className="container mx-auto px-4 py-8 flex-1">
            {children}
          </main>

          <Footer />
        </SocketProvider>
      </body>
    </html>
  )
}