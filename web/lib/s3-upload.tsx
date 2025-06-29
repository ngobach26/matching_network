"use client"

import { s3API } from "@/lib/api-client"

/**
 * Upload a file (image, etc.) to S3 using a presigned URL from your backend.
 * @param file File object (from input type="file" etc)
 * @returns public S3 url
 */
export async function uploadFileToS3(file: File): Promise<string> {
  // 1. Gọi API lấy presigned url từ backend
  const { url, s3_url } = await s3API.getPresignedUrl(file.name, file.type)
  if (!url || !s3_url) throw new Error("No presigned url returned")

  // 2. Upload file lên S3 qua presigned url (PUT)
  const uploadRes = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  })
  if (!uploadRes.ok) {
    throw new Error("Failed to upload to S3: " + uploadRes.statusText)
  }
  // 3. Trả về public url
  return s3_url
}
