import { type SupabaseClient } from '@supabase/supabase-js'

const BUCKET_NAME = 'documents'
const SIGNED_URL_EXPIRY_SECONDS = 3600 // 1 hour

/**
 * Upload a document to Supabase Storage.
 * Files are stored at: {citizenId}/{uuid}.{ext}
 */
export async function uploadDocument(
  supabase: SupabaseClient,
  citizenId: string,
  file: File
): Promise<{ path: string; publicUrl: string }> {
  const ext = extractExtension(file.name)
  const uuid = crypto.randomUUID()
  const path = `${citizenId}/${uuid}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path)

  return { path, publicUrl }
}

/**
 * Get a time-limited signed URL for a stored document.
 */
export async function getDocumentUrl(
  supabase: SupabaseClient,
  path: string,
  expiresInSeconds: number = SIGNED_URL_EXPIRY_SECONDS
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresInSeconds)

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to generate signed URL: ${error?.message ?? 'Unknown error'}`)
  }

  return data.signedUrl
}

/**
 * Delete a document from storage.
 */
export async function deleteDocument(
  supabase: SupabaseClient,
  path: string
): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

function extractExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : 'bin'
}
