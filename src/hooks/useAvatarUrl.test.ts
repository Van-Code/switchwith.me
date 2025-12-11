import { renderHook, waitFor } from "@testing-library/react"
import { useAvatarUrl } from "./useAvatarUrl"

// Mock fetch
global.fetch = jest.fn()

describe("useAvatarUrl", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should return null if s3Key is null", () => {
    const { result } = renderHook(() => useAvatarUrl(null))
    expect(result.current).toBeNull()
  })

  it("should return null if s3Key is undefined", () => {
    const { result } = renderHook(() => useAvatarUrl(undefined))
    expect(result.current).toBeNull()
  })

  it("should fetch and return presigned URL", async () => {
    const mockViewUrl = "https://s3.amazonaws.com/presigned-view-url"
    const s3Key = "profile-photos/user123.jpg"

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ viewUrl: mockViewUrl }),
    })

    const { result } = renderHook(() => useAvatarUrl(s3Key))

    await waitFor(() => {
      expect(result.current).toBe(mockViewUrl)
    })

    expect(global.fetch).toHaveBeenCalledWith(
      `/api/profile/photo/view?key=${encodeURIComponent(s3Key)}`
    )
  })

  it("should handle fetch errors gracefully", async () => {
    const s3Key = "profile-photos/user123.jpg"

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    })

    const { result } = renderHook(() => useAvatarUrl(s3Key))

    // Should remain null on error
    await waitFor(() => {
      expect(result.current).toBeNull()
    })
  })

  it("should update when s3Key changes", async () => {
    const mockViewUrl1 = "https://s3.amazonaws.com/presigned-view-url-1"
    const mockViewUrl2 = "https://s3.amazonaws.com/presigned-view-url-2"
    const s3Key1 = "profile-photos/user123.jpg"
    const s3Key2 = "profile-photos/user456.jpg"

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ viewUrl: mockViewUrl1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ viewUrl: mockViewUrl2 }),
      })

    const { result, rerender } = renderHook(({ key }) => useAvatarUrl(key), {
      initialProps: { key: s3Key1 },
    })

    await waitFor(() => {
      expect(result.current).toBe(mockViewUrl1)
    })

    rerender({ key: s3Key2 })

    await waitFor(() => {
      expect(result.current).toBe(mockViewUrl2)
    })
  })
})
