import { withAuth } from "next-auth/middleware"
import { NextResponse, NextRequest } from "next/server"
import { get } from "@vercel/edge-config"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
)
export async function middleware(req) {
  const isInMaintenanceMode = (await get) < boolean > "isInMaintenanceMode"

  // If not in maintenance mode, allow the request to proceed as normal
  if (!isInMaintenanceMode) {
    return NextResponse.next()
  }

  // If in maintenance mode, redirect to the maintenance page
  req.nextUrl.pathname = "/maintenance"
  return NextResponse.rewrite(req.nextUrl)
}

export const config = {
  matcher: [
    "/messages(.*)",
    "/profile",
    "/settings",
    "/listings/new",
    "/listings/message(.*)",
    "/matches",
  ],
}
