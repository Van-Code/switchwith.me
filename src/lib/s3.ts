import { S3Client, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.AWS_S3_BUCKET!

/**
 * Generate a presigned URL for uploading a profile photo
 * @param userId - The user's ID
 * @param fileExtension - File extension (jpg, png, webp)
 * @returns Presigned URL and the S3 key
 */
export async function generateUploadPresignedUrl(
  userId: string,
  fileExtension: string
): Promise<{ uploadUrl: string; key: string }> {
  const key = `profile-photos/${userId}.${fileExtension}`

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`,
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }) // 5 minutes

  return { uploadUrl, key }
}

/**
 * Generate a presigned URL for viewing a profile photo
 * @param key - The S3 key
 * @returns Presigned URL for viewing
 */
export async function generateViewPresignedUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 }) // 1 hour
}

/**
 * Delete a profile photo from S3
 * @param key - The S3 key to delete
 */
export async function deleteProfilePhoto(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  await s3Client.send(command)
}

/**
 * Check if a file exists in S3
 * @param key - The S3 key to check
 * @returns true if exists, false otherwise
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
    await s3Client.send(command)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Generate a presigned URL for uploading a profile photo (multiple photos per user)
 * @param userId - The user's ID
 * @param photoIndex - The photo index (0, 1, or 2)
 * @param fileExtension - File extension (jpg, png, webp)
 * @returns Presigned URL and the S3 key
 */
export async function generateProfilePhotoUploadUrl(
  userId: string,
  photoIndex: number,
  fileExtension: string
): Promise<{ uploadUrl: string; key: string }> {
  const timestamp = Date.now()
  const key = `profile-photos/${userId}/${photoIndex}-${timestamp}.${fileExtension}`

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`,
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }) // 5 minutes

  return { uploadUrl, key }
}

/**
 * Delete multiple profile photos from S3
 * @param keys - Array of S3 keys to delete
 */
export async function deleteProfilePhotos(keys: string[]): Promise<void> {
  for (const key of keys) {
    await deleteProfilePhoto(key)
  }
}
