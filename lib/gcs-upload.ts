import { Storage } from '@google-cloud/storage'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const BUCKET_NAME = 'recruitmentinstitute-media'
const PROJECT_ID = 'recruitmentinstitute-501106'

let storageClient: Storage | null = null

function getStorage(): Storage {
  if (!storageClient) {
    storageClient = new Storage({ projectId: PROJECT_ID })
  }
  return storageClient
}

/**
 * Uploads a file to Google Cloud Storage (and local fallback disk),
 * returning the public Google Cloud Storage URL.
 */
export async function uploadMediaFile(
  file: File,
  folder: string = 'uploads'
): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // 1. Write to local disk in public/uploads for local preview / fallback
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, safeName), buffer)
  } catch (err) {
    console.warn('Local disk write warning:', err)
  }

  // 2. Upload to GCS Bucket for permanent Cloud Run persistence
  try {
    const storage = getStorage()
    const bucket = storage.bucket(BUCKET_NAME)
    const gcsPath = `uploads/${folder}/${safeName}`
    const gcsFile = bucket.file(gcsPath)

    await gcsFile.save(buffer, {
      contentType: file.type || 'image/jpeg',
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    })

    return `https://storage.googleapis.com/${BUCKET_NAME}/${gcsPath}`
  } catch (gcsErr) {
    console.warn('GCS upload error, using local path:', gcsErr)
    return `/uploads/${folder}/${safeName}`
  }
}
