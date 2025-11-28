/**
 * EXAMPLE: Navigation with NotificationBell
 *
 * This shows how to integrate the NotificationBell component
 * into your navigation/header.
 *
 * Copy the relevant parts into your existing navbar or layout.
 */

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NotificationBell } from "@/components/notification-bell";
import { Button } from "@/components/ui/button";

export async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo / Brand */}
        <Link href="/" className="font-bold text-xl">
          Valkyries Seat Swap
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          {session?.user ? (
            <>
              <Link
                href="/listings"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Browse Seats
              </Link>
              <Link
                href="/matches"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                My Matches
              </Link>
              <Link
                href="/conversations"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Messages
              </Link>

              {/* Notification Bell - Only show when authenticated */}
              <NotificationBell />

              <Link
                href="/profile"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/**
 * INTEGRATION NOTES:
 *
 * 1. Import the NotificationBell component:
 *    import { NotificationBell } from "@/components/notification-bell";
 *
 * 2. Add it to your navigation, typically:
 *    - After your main navigation links
 *    - Before the profile/settings menu
 *    - Only show when user is authenticated
 *
 * 3. Example placement:
 *    <NotificationBell />
 *
 * 4. The component is a client component but can be used in a server component
 *    (like this navbar) without issues.
 *
 * 5. The bell icon will automatically:
 *    - Show unread count badge
 *    - Poll for new notifications every 30 seconds
 *    - Update when dropdown is opened
 *    - Navigate to the appropriate page when clicked
 */

/**
 * ALTERNATIVE: If you use this in app/layout.tsx directly
 */
/*
import { NotificationBell } from "@/components/notification-bell";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <nav>
          // ... your nav content ...
          {session?.user && <NotificationBell />}
        </nav>
        {children}
      </body>
    </html>
  );
}
*/
