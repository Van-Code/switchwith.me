"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import Link from "next/link"

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/listings")
        router.refresh()
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: "google" | "facebook") => {
    setLoading(true)
    try {
      await signIn(provider, { callbackUrl: "/listings" })
    } catch (error) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl text-slate-900">Sign In</CardTitle>
          <CardDescription className="text-slate-600">Welcome back to Switch With Me</CardDescription>
        </CardHeader>
        <CardContent>
          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full border-slate-300 hover:bg-slate-50"
              onClick={() => handleOAuthSignIn("google")}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
            {/* <Button
              type="button"
              variant="outline"
              className="w-full border-slate-300 hover:bg-slate-50"
              onClick={() => handleOAuthSignIn("facebook")}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </Button> */}
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-50 text-rose-700 border border-rose-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-700">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-cyan-600 hover:text-cyan-700 font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}