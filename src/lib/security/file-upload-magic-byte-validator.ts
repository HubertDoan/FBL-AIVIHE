/**
 * File upload validator — magic byte + size + filename sanitization.
 *
 * Mục đích: chặn malware upload, path traversal, polyglot file, MIME spoofing.
 * Không trust client-provided `file.type` — verify bằng magic byte thực tế.
 *
 * Allowed: JPEG, PNG, PDF, HEIC, WebP (medical documents, photos of reports).
 * Max: 10MB mặc định (có thể override per route).
 */

export type FileValidationResult =
  | { ok: true; detectedMime: string; extension: string }
  | { ok: false; error: string; code: string }

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024 // 10MB

/**
 * Magic byte signatures — check first N bytes of file.
 * Reference: https://en.wikipedia.org/wiki/List_of_file_signatures
 */
const MAGIC_BYTES: Array<{
  mime: string
  ext: string
  signatures: Array<{ offset: number; bytes: number[] }>
}> = [
  {
    mime: 'image/jpeg',
    ext: 'jpg',
    signatures: [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  },
  {
    mime: 'image/png',
    ext: 'png',
    signatures: [
      { offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
    ],
  },
  {
    mime: 'application/pdf',
    ext: 'pdf',
    signatures: [{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }], // %PDF
  },
  {
    mime: 'image/webp',
    ext: 'webp',
    // RIFF....WEBP — check RIFF prefix + WEBP at offset 8
    signatures: [
      { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
      { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
    ],
  },
  {
    mime: 'image/heic',
    ext: 'heic',
    // ftypheic, ftypheix, ftyphevc, ftypmif1, ftypmsf1 at offset 4
    signatures: [
      { offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }, // ftyp
    ],
  },
]

/**
 * Dangerous filename patterns — reject outright.
 */
const DANGEROUS_FILENAME_PATTERNS = [
  /\.\./, // path traversal
  /[\x00-\x1f]/, // control chars (null byte, etc.)
  /[<>:"|?*]/, // Windows reserved chars
  /\.(exe|bat|cmd|sh|ps1|vbs|js|jar|scr|dll|com)$/i, // executable extensions
  /\.(htaccess|php|phtml|asp|aspx|jsp)$/i, // server-side script extensions
]

/**
 * Sanitize filename cho storage — giữ tên có ý nghĩa nhưng loại bỏ ký tự nguy hiểm.
 * Giới hạn 100 ký tự để tránh filesystem issue.
 */
export function sanitizeFilename(raw: string): string {
  const cleaned = raw
    .normalize('NFC')
    .replace(/[\x00-\x1f]/g, '') // control chars
    .replace(/[<>:"|?*\\/]/g, '_') // path separators + reserved
    .replace(/\.+/g, '.') // collapse multiple dots
    .replace(/^\.+/, '') // no leading dots
    .trim()
  return cleaned.slice(0, 100) || 'unnamed'
}

/**
 * Verify magic bytes match expected MIME.
 * @returns MIME thực tế detect được, hoặc null nếu không match bất kỳ signature nào.
 */
function detectMimeByMagicBytes(buffer: Uint8Array): {
  mime: string
  ext: string
} | null {
  for (const entry of MAGIC_BYTES) {
    const allMatch = entry.signatures.every((sig) => {
      if (buffer.length < sig.offset + sig.bytes.length) return false
      for (let i = 0; i < sig.bytes.length; i++) {
        if (buffer[sig.offset + i] !== sig.bytes[i]) return false
      }
      return true
    })
    if (allMatch) return { mime: entry.mime, ext: entry.ext }
  }
  return null
}

export type ValidateUploadOptions = {
  maxBytes?: number
  allowedMimes?: string[] // whitelist — default: tất cả MAGIC_BYTES entries
}

/**
 * Validate file upload — check size, filename, magic bytes, MIME consistency.
 *
 * @param file      File từ FormData
 * @param options   maxBytes (default 10MB), allowedMimes (default all supported)
 */
export async function validateUploadedFile(
  file: File,
  options: ValidateUploadOptions = {}
): Promise<FileValidationResult> {
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES
  const allowedMimes =
    options.allowedMimes ?? MAGIC_BYTES.map((m) => m.mime)

  // Size check
  if (file.size === 0) {
    return { ok: false, error: 'Tệp rỗng.', code: 'EMPTY_FILE' }
  }
  if (file.size > maxBytes) {
    const mb = (maxBytes / 1024 / 1024).toFixed(1)
    return {
      ok: false,
      error: `Tệp quá lớn, tối đa ${mb}MB.`,
      code: 'FILE_TOO_LARGE',
    }
  }

  // Filename check
  const filename = file.name || ''
  for (const pattern of DANGEROUS_FILENAME_PATTERNS) {
    if (pattern.test(filename)) {
      return {
        ok: false,
        error: 'Tên tệp không hợp lệ hoặc chứa ký tự nguy hiểm.',
        code: 'DANGEROUS_FILENAME',
      }
    }
  }

  // Magic byte check — đọc 32 bytes đầu (đủ cho mọi signature hiện có)
  const headerSize = 32
  const headerBuf = new Uint8Array(
    await file.slice(0, headerSize).arrayBuffer()
  )
  const detected = detectMimeByMagicBytes(headerBuf)

  if (!detected) {
    return {
      ok: false,
      error: 'Định dạng tệp không được hỗ trợ hoặc nội dung không hợp lệ.',
      code: 'UNKNOWN_FORMAT',
    }
  }

  // MIME whitelist check (based on actual detected, not client-claimed)
  if (!allowedMimes.includes(detected.mime)) {
    return {
      ok: false,
      error: `Định dạng ${detected.ext.toUpperCase()} không được chấp nhận cho endpoint này.`,
      code: 'MIME_NOT_ALLOWED',
    }
  }

  // MIME spoofing check — client-claimed MIME phải khớp detected (hoặc empty)
  // Cho phép client không gửi type (browser đôi khi empty với HEIC)
  if (file.type && file.type !== detected.mime) {
    // HEIC có nhiều variant (image/heic, image/heif, application/octet-stream)
    const isHeicVariant =
      detected.mime === 'image/heic' &&
      (file.type === 'image/heif' || file.type === 'application/octet-stream')
    if (!isHeicVariant) {
      return {
        ok: false,
        error: 'Định dạng tệp không khớp với nội dung thực tế.',
        code: 'MIME_SPOOF',
      }
    }
  }

  return { ok: true, detectedMime: detected.mime, extension: detected.ext }
}
