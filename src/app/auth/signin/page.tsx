"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog"

export default function SignInPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Check for OAuth error on mount
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam === "no_account_for_oauth") {
      setError("No account found for that Google email. Try a different Google account, or contact the site owner if you think this is a mistake.")
    }
  }, [searchParams])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError("") // Clear any existing errors
    try {
      await signIn("google", { callbackUrl: "/listings" })
    } catch (error) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  // Check for sign-out success message
  const signoutSuccess = searchParams.get("error") === "signout_success"

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl text-slate-900">Sign In</CardTitle>
          <CardDescription className="text-slate-600">Welcome back to Switch With Me</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Success message for sign-out */}
          {signoutSuccess && (
            <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-3 rounded-lg text-sm mb-6">
              You have been signed out successfully.
            </div>
          )}

          {/* Error message for OAuth failures */}
          {error && (
            <div className="bg-rose-50 text-rose-700 border border-rose-200 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-11"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" opacity="0.9"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity="0.9"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" opacity="0.9"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity="0.9"/>
            </svg>
            {loading ? "Signing in..." : "Continue with Google"}
          </Button>

          {/* Why only Google? */}
          <div className="mt-6 text-center">
            <Dialog>
              <DialogTrigger asChild>
                <button className="text-sm text-slate-600 hover:text-slate-900 underline">
                  Why only Google?
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-slate-900">Why only Google?</DialogTitle>
                  <DialogDescription className="text-slate-600 text-left pt-4 space-y-3">
                    <p>
                      I do not want to store passwords or manage password resets. Using Google lets you keep your login with a provider that already handles security.
                    </p>
                    <p>
                      I only store the minimum account details needed to tie your listings to you—no passwords, no password recovery flows, and no extra security burden.
                    </p>
                    <p className="text-[10px] text-slate-700">
                      Curious who built this?{" "}
                      <a
                        href="/about"
                        className="underline underline-offset-2 hover:text-slate-700"
                      >
                        About the creator
                      </a>
                    </p>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
