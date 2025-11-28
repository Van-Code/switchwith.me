"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import Link from "next/link"
import { signIn } from "next-auth/react"

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      firstName: formData.get("firstName") as string,
      lastInitial: formData.get("lastInitial") as string,
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        // Auto sign in after registration
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        })

        if (result?.ok) {
          router.push("/listings")
          router.refresh()
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create account")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl text-slate-900">Sign Up</CardTitle>
          <CardDescription className="text-slate-600">Create your Valkyries Seat Swap account</CardDescription>
        </CardHeader>
        <CardContent>
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
                minLength={6}
                className="border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-slate-700">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  required
                  placeholder="Jane"
                  className="border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>
              <div>
                <Label htmlFor="lastInitial" className="text-slate-700">Last Initial</Label>
                <Input
                  id="lastInitial"
                  name="lastInitial"
                  required
                  placeholder="D"
                  maxLength={1}
                  className="border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-cyan-600 hover:text-cyan-700 font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}