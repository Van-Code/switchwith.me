import { useState, useEffect } from "react"

/**
 * Hook to fetch and cache presigned URLs for viewing S3 avatars
 */
export function useAvatarUrl(s3Key: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!s3Key) {
      setUrl(null)
      return
    }

    let mounted = true

    const fetchUrl = async () => {
      try {
        const response = await fetch(`/api/profile/photo/view?key=${encodeURIComponent(s3Key)}`)
        if (!response.ok) {
          console.error("Failed to fetch avatar URL")
          return
        }

        const { viewUrl } = await response.json()
        if (mounted) {
          setUrl(viewUrl)
        }
      } catch (error) {
        console.error("Error fetching avatar URL:", error)
      }
    }

    fetchUrl()

    return () => {
      mounted = false
    }
  }, [s3Key])

  return url
}
