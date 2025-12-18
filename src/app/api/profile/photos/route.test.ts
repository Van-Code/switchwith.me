/**
 * @jest-environment node
 */
import { describe, it, expect, jest, beforeEach } from "@jest/globals"
import { NextResponse } from "next/server"
import { GET, POST, DELETE } from "./route"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

// Mock dependencies
jest.mock("next-auth")
jest.mock("@/lib/prisma", () => ({
  prisma: {
    profilePhoto: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

jest.mock("@/lib/s3", () => ({
  generateProfilePhotoUploadUrl: jest.fn(),
  deleteProfilePhoto: jest.fn(),
}))

const mockSession = {
  user: {
    id: "test-user-id",
    email: "test@example.com",
  },
}

describe("Profile Photos API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("GET /api/profile/photos", () => {
    it("should return 401 if not authenticated", async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const request = new Request("http://localhost/api/profile/photos?order=0&ext=jpg")
      const response = await GET(request)

      expect(response.status).toBe(401)
    })

    it("should return 400 if order is invalid", async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const request = new Request("http://localhost/api/profile/photos?order=5&ext=jpg")
      const response = await GET(request)

      expect(response.status).toBe(400)
    })

    it("should return 400 if user already has 3 photos", async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
      ;(prisma.profilePhoto.findMany as jest.Mock).mockResolvedValue([
        { id: "1", order: 0, url: "test1.jpg" },
        { id: "2", order: 1, url: "test2.jpg" },
        { id: "3", order: 2, url: "test3.jpg" },
      ])

      const request = new Request("http://localhost/api/profile/photos?order=3&ext=jpg")
      const response = await GET(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe("Maximum 3 photos allowed")
    })
  })

  describe("POST /api/profile/photos", () => {
    it("should return 401 if not authenticated", async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const request = new Request("http://localhost/api/profile/photos", {
        method: "POST",
        body: JSON.stringify({ key: "test-key", order: 0 }),
      })
      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it("should create a new photo successfully", async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
      ;(prisma.profilePhoto.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.profilePhoto.create as jest.Mock).mockResolvedValue({
        id: "new-photo",
        userId: "test-user-id",
        url: "test-key",
        order: 0,
      })

      const request = new Request("http://localhost/api/profile/photos", {
        method: "POST",
        body: JSON.stringify({ key: "test-key", order: 0 }),
      })
      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.photo.url).toBe("test-key")
    })
  })

  describe("DELETE /api/profile/photos", () => {
    it("should return 401 if not authenticated", async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const request = new Request("http://localhost/api/profile/photos?id=test-photo-id")
      const response = await DELETE()

      expect(response.status).toBe(401)
    })

    it("should return 403 if user does not own the photo", async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
      ;(prisma.profilePhoto.findUnique as jest.Mock).mockResolvedValue({
        id: "test-photo-id",
        userId: "different-user-id",
        url: "test.jpg",
        order: 0,
      })

      const request = new Request("http://localhost/api/profile/photos?id=test-photo-id")
      const response = await DELETE()

      expect(response.status).toBe(403)
    })
  })
})
