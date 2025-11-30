"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import Link from "next/link"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState("")
  const [passwordMismatch, setPasswordMismatch] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (!tokenParam) {
      setError("Invalid reset link. Please request a new password reset.")
    } else {
      setToken(tokenParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setPasswordMismatch(false)

    const formData = new FormData(e.currentTarget)
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setPasswordMismatch(true)
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Redirect to sign in after 2 seconds
        setTimeout(() => {
          router.push("/auth/signin")
        }, 2000)
      } else {
        setError(data.error || "Failed to reset password")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!token && !error) {
    return (
      <div className="max-w-md mx-auto mt-12 px-4">
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center text-slate-600">Loading...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl text-slate-900">Set New Password</CardTitle>
          <CardDescription className="text-slate-600">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-3 rounded-lg text-sm">
                Password reset successfully! Redirecting to sign in...
              </div>
            </div>
          ) : token ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-rose-50 text-rose-700 border border-rose-200 px-4 py-3 rounded-lg text-sm">
                  {error}
                  {error.includes("expired") && (
                    <div className="mt-2">
                      <Link
                        href="/auth/forgot-password"
                        className="underline hover:text-rose-800"
                      >
                        Request a new reset link
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="newPassword" className="text-slate-700">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
                  disabled={loading}
                />
                <p className="text-xs text-slate-500 mt-1">At least 6 characters</p>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-slate-700">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
                  disabled={loading}
                />
                {passwordMismatch && (
                  <p className="text-xs text-rose-600 mt-1">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>

              <div className="text-center text-sm text-slate-600">
                Remember your password?{" "}
                <Link href="/auth/signin" className="text-cyan-600 hover:text-cyan-700 font-medium hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-rose-50 text-rose-700 border border-rose-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
              <div className="text-center">
                <Link
                  href="/auth/forgot-password"
                  className="text-cyan-600 hover:text-cyan-700 font-medium hover:underline"
                >
                  Request a new reset link
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
