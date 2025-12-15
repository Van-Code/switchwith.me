/**
 * Global API client wrapper that handles session expiration and 401 errors
 */

import { signOut } from "next-auth/react"

export interface ApiClientOptions extends RequestInit {
  showToast?: boolean
}

export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired")
    this.name = "SessionExpiredError"
  }
}

/**
 * Fetch wrapper that handles 401 errors and session expiration
 *
 * When a 401 is detected:
 * 1. Signs out the user
 * 2. Redirects to sign-in page with callback to original URL
 * 3. Throws SessionExpiredError
 */
export async function apiClient(
  url: string,
  options: ApiClientOptions = {}
): Promise<Response> {
  try {
    const response = await fetch(url, options)

    // Handle 401 Unauthorized - session expired
    if (response.status === 401) {
      console.log("[API Client] 401 detected - session expired, signing out")

      // Get current URL for callback after sign-in
      const currentPath = window.location.pathname + window.location.search

      // Sign out and redirect to sign-in with callback
      await signOut({
        callbackUrl: `/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`,
        redirect: true,
      })

      throw new SessionExpiredError()
    }

    return response
  } catch (error) {
    // Re-throw SessionExpiredError
    if (error instanceof SessionExpiredError) {
      throw error
    }

    // For other errors, just re-throw
    throw error
  }
}

/**
 * Convenience method for JSON API calls
 */
export async function apiClientJson<T = any>(
  url: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const response = await apiClient(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `API error: ${response.status}`)
  }

  return response.json()
}
