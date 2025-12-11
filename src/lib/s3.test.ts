import {
  generateUploadPresignedUrl,
  generateViewPresignedUrl,
  deleteProfilePhoto,
  fileExists,
} from "./s3"
import { S3Client, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// Mock AWS SDK
jest.mock("@aws-sdk/client-s3")
jest.mock("@aws-sdk/s3-request-presigner")

const mockS3Client = S3Client as jest.MockedClass<typeof S3Client>
const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>

describe("S3 Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set up environment variables
    process.env.AWS_REGION = "us-east-1"
    process.env.AWS_ACCESS_KEY_ID = "test-key-id"
    process.env.AWS_SECRET_ACCESS_KEY = "test-secret-key"
    process.env.AWS_S3_BUCKET = "test-bucket"
  })

  describe("generateUploadPresignedUrl", () => {
    it("should generate presigned URL with correct key format", async () => {
      const userId = "user123"
      const fileExtension = "jpg"
      const expectedUrl = "https://s3.amazonaws.com/presigned-url"

      mockGetSignedUrl.mockResolvedValue(expectedUrl)

      const result = await generateUploadPresignedUrl(userId, fileExtension)

      expect(result).toEqual({
        uploadUrl: expectedUrl,
        key: `profile-photos/${userId}.${fileExtension}`,
      })
      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        { expiresIn: 300 }
      )
    })

    it("should handle different file extensions", async () => {
      const userId = "user456"
      const fileExtension = "png"
      const expectedUrl = "https://s3.amazonaws.com/presigned-url-png"

      mockGetSignedUrl.mockResolvedValue(expectedUrl)

      const result = await generateUploadPresignedUrl(userId, fileExtension)

      expect(result.key).toBe(`profile-photos/${userId}.${fileExtension}`)
    })
  })

  describe("generateViewPresignedUrl", () => {
    it("should generate view presigned URL for given key", async () => {
      const key = "profile-photos/user123.jpg"
      const expectedUrl = "https://s3.amazonaws.com/view-url"

      mockGetSignedUrl.mockResolvedValue(expectedUrl)

      const result = await generateViewPresignedUrl(key)

      expect(result).toBe(expectedUrl)
      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        { expiresIn: 3600 }
      )
    })
  })

  describe("deleteProfilePhoto", () => {
    it("should call S3 delete command with correct key", async () => {
      const key = "profile-photos/user123.jpg"
      const mockSend = jest.fn().mockResolvedValue({})

      mockS3Client.prototype.send = mockSend

      await deleteProfilePhoto(key)

      expect(mockSend).toHaveBeenCalledWith(expect.any(DeleteObjectCommand))
    })
  })

  describe("fileExists", () => {
    it("should return true if file exists", async () => {
      const key = "profile-photos/user123.jpg"
      const mockSend = jest.fn().mockResolvedValue({})

      mockS3Client.prototype.send = mockSend

      const result = await fileExists(key)

      expect(result).toBe(true)
      expect(mockSend).toHaveBeenCalledWith(expect.any(HeadObjectCommand))
    })

    it("should return false if file does not exist", async () => {
      const key = "profile-photos/nonexistent.jpg"
      const mockSend = jest.fn().mockRejectedValue(new Error("Not found"))

      mockS3Client.prototype.send = mockSend

      const result = await fileExists(key)

      expect(result).toBe(false)
    })
  })
})
