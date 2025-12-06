import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function Header() {
  const session = await getServerSession(authOptions)

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Main Nav */}
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold">
              <div className="flex items-center gap-3">
                <div className="square-full overflow-hidden w-8 h-8 bg-muted">
                  <Image
                    src="/images/switch_logo--white.jpg"
                    alt="Switch With Me logo"
                    width={60}
                    height={60}
                    className="object-cover"
                  />
                </div>
                <span className="hidden sm:inline">Switch With Me</span>
              </div>
            </Link>

            {session && (
              <div className="hidden md:flex items-center gap-1">
                <Link href="/listings">
                  <Button variant="ghost" size="sm">
                    Browse
                  </Button>
                </Link>
                <Link href="/matches">
                  <Button variant="ghost" size="sm">
                    Matches
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button variant="ghost" size="sm">
                    Messages
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Link href="/listings/new">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
                  >
                    Create Listing
                  </Button>
                </Link>
                <NotificationBell />
                <ProfileDropdown user={session.user} />
              </>
            ) : (
              <>
                <Link href="/listings">
                  <Button variant="ghost" size="sm">
                    Browse
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button size="sm">Sign In</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
