"use client"

import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "", // honeypot field
  })

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage("Please fill in all required fields.")
      setStatus("error")
      return
    }

    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address.")
      setStatus("error")
      return
    }

    setStatus("loading")
    setErrorMessage("")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send message")
      }

      setStatus("success")
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        website: "",
      })

      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus("idle")
      }, 5000)
    } catch (error) {
      setStatus("error")
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot field - hidden from users */}
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-rose-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Your name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={status === "loading"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-rose-500">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="your.email@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={status === "loading"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          type="text"
          placeholder="What's this about? (optional)"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          disabled={status === "loading"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          Message <span className="text-rose-500">*</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          required
          placeholder="Tell me what's on your mind..."
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          disabled={status === "loading"}
          className="resize-none"
        />
      </div>

      {status === "success" && (
        <div
          className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm"
          role="alert"
          aria-live="polite"
        >
          Thanks for reaching out! I'll get back to you soon.
        </div>
      )}

      {status === "error" && errorMessage && (
        <div
          className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-sm"
          role="alert"
          aria-live="polite"
        >
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}