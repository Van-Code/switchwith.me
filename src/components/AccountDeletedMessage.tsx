"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, X } from "lucide-react"

export default function AccountDeletedMessage() {
  const searchParams = useSearchParams()
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check if the deleted parameter is present
    if (searchParams.get("deleted") === "true") {
      setShow(true)

      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShow(false)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!show) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-top-2 duration-300">
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-green-900">Account Deleted</h3>
          <p className="text-sm text-green-700 mt-1">
            Your account and all associated data have been permanently deleted.
          </p>
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-green-600 hover:text-green-800 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
