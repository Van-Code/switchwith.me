/**
 * @jest-environment node
 */

import { GET, POST, DELETE } from "./route"

import { prisma } from "@/lib/prisma"
import { generateUploadPresignedUrl, deleteProfilePhoto } from "@/lib/s3"

// Mock dependencies
jest.mock("next-auth")
jest.mock("@/lib/prisma", () => ({
  prisma: {
    profile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))
jest.mock("@/lib/s3")

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>
const mockGenerateUploadPresignedUrl = generateUploadPresignedUrl as jest.MockedFunction<
  typeof generateUploadPresignedUrl
>
const mockDeleteProfilePhoto = deleteProfilePhoto as jest.MockedFunction<
  typeof deleteProfilePhoto
>

describe("/api/profile/photo", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("GET", () => {
    it("should return 401 if not authenticated", async () => {
      mockGetServerSession.mockResolvedValue(null)

      const req = new Request("http://localhost:3000/api/profile/photo?ext=jpg")
      const response = await GET(req)

      expect(response.status).toBe(401)
      const json = await response.json()
      expect(json.error).toBe("Unauthorized")
    })

    it("should return 400 if file extension is missing", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user123", email: "test@example.com" },
        expires: "2099-01-01",
      })

      const req = new Request("http://localhost:3000/api/profile/photo")
      const response = await GET(req)

      expect(response.status).toBe(400)
      const json = await response.json()
      expect(json.error).toBe("File extension required")
    })

    it("should return 400 if file extension is invalid", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user123", email: "test@example.com" },
        expires: "2099-01-01",
      })

      const req = new Request("http://localhost:3000/api/profile/photo?ext=exe")
      const response = await GET(req)

      expect(response.status).toBe(400)
      const json = await response.json()
      expect(json.error).toContain("Invalid file extension")
    })

    it("should return presigned URL for valid request", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user123", email: "test@example.com" },
        expires: "2099-01-01",
      })

      mockGenerateUploadPresignedUrl.mockResolvedValue({
        uploadUrl: "https://s3.amazonaws.com/presigned-upload-url",
        key: "profile-photos/user123.jpg",
      })

      const req = new Request("http://localhost:3000/api/profile/photo?ext=jpg")
      const response = await GET(req)

      expect(response.status).toBe(200)
      const json = await response.json()
      expect(json.uploadUrl).toBe("https://s3.amazonaws.com/presigned-upload-url")
      expect(json.key).toBe("profile-photos/user123.jpg")
    })
  })

  describe("POST", () => {
    it("should return 401 if not authenticated", async () => {
      mockGetServerSession.mockResolvedValue(null)

      const req = new Request("http://localhost:3000/api/profile/photo", {
        method: "POST",
        body: JSON.stringify({ key: "profile-photos/user123.jpg" }),
      })
      const response = await POST(req)

      expect(response.status).toBe(401)
    })

    it("should return 400 if key is missing", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user123", email: "test@example.com" },
        expires: "2099-01-01",
      })

      const req = new Request("http://localhost:3000/api/profile/photo", {
        method: "POST",
        body: JSON.stringify({}),
      })
      const response = await POST(req)

      expect(response.status).toBe(400)
      const json = await response.json()
      expect(json.error).toBe("S3 key required")
    })

    it("should delete old photo and update profile with new key", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user123", email: "test@example.com" },
        expires: "2099-01-01",
      })
      ;(prisma.profile.findUnique as jest.Mock).mockResolvedValue({
        avatarUrl: "profile-photos/old-photo.jpg",
      })
      ;(prisma.profile.update as jest.Mock).mockResolvedValue({
        avatarUrl: "profile-photos/user123.jpg",
      })

      const req = new Request("http://localhost:3000/api/profile/photo", {
        method: "POST",
        body: JSON.stringify({ key: "profile-photos/user123.jpg" }),
      })
      const response = await POST(req)

      expect(response.status).toBe(200)
      expect(mockDeleteProfilePhoto).toHaveBeenCalledWith("profile-photos/old-photo.jpg")
      expect(prisma.profile.update).toHaveBeenCalledWith({
        where: { userId: "user123" },
        data: { avatarUrl: "profile-photos/user123.jpg" },
      })
    })
  })

  describe("DELETE", () => {
    it("should return 401 if not authenticated", async () => {
      mockGetServerSession.mockResolvedValue(null)

      const response = await DELETE()

      expect(response.status).toBe(401)
    })

    it("should return 404 if no photo to delete", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user123", email: "test@example.com" },
        expires: "2099-01-01",
      })
      ;(prisma.profile.findUnique as jest.Mock).mockResolvedValue({
        avatarUrl: null,
      })

      const response = await DELETE()

      expect(response.status).toBe(404)
      const json = await response.json()
      expect(json.error).toBe("No photo to delete")
    })

    it("should delete photo from S3 and clear avatarUrl", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user123", email: "test@example.com" },
        expires: "2099-01-01",
      })
      ;(prisma.profile.findUnique as jest.Mock).mockResolvedValue({
        avatarUrl: "profile-photos/user123.jpg",
      })
      ;(prisma.profile.update as jest.Mock).mockResolvedValue({
        avatarUrl: null,
      })

      const response = await DELETE()

      expect(response.status).toBe(200)
      expect(mockDeleteProfilePhoto).toHaveBeenCalledWith("profile-photos/user123.jpg")
      expect(prisma.profile.update).toHaveBeenCalledWith({
        where: { userId: "user123" },
        data: { avatarUrl: null },
      })
    })
  })
})
