import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadDocument } from '@/lib/supabase/storage'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import {
  validateUploadedFile,
  sanitizeFilename,
} from '@/lib/security/file-upload-magic-byte-validator'
import {
  checkRateLimit,
  getClientIp,
} from '@/lib/security/rate-limit-upstash-sliding-window'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'image/heic',
  'image/webp',
]

/**
 * POST /api/documents/upload
 * Accepts multipart/form-data: file, citizenId, notes
 *
 * Demo mode: không upload Supabase Storage, chỉ sinh id giả + log
 * Production: upload lên bucket "documents" + insert source_documents
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 20 uploads/day/IP (cost control + abuse)
    const clientIp = getClientIp(request)
    const limited = await checkRateLimit('aiOcrByUser', clientIp)
    if (limited) return limited

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const citizenId = formData.get('citizenId') as string | null
    const notes = formData.get('notes') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Vui lòng chọn tệp để tải lên.' }, { status: 400 })
    }
    if (!citizenId) {
      return NextResponse.json({ error: 'Thiếu ID công dân.' }, { status: 400 })
    }

    // Hardened validation — magic byte + size + filename sanitization
    const validation = await validateUploadedFile(file, {
      maxBytes: MAX_FILE_SIZE,
      allowedMimes: ALLOWED_MIME_TYPES,
    })
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    const safeFilename = sanitizeFilename(file.name)

    // ── Demo mode — trả về document id giả để flow tiếp tục ──────────────────
    if (isDemoMode()) {
      const demoUser = await getDemoUser(request)
      if (!demoUser) {
        return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
      }
      const fakeId = `demo-doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      console.log(`[Upload demo] ${file.name} (${file.size} bytes) by ${demoUser.id}; notes="${notes}"`)
      return NextResponse.json({
        documentId: fakeId,
        fileUrl: null,
        message: 'Tải lên thành công (demo mode).',
      })
    }

    // ── Supabase production mode ────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const { path, publicUrl } = await uploadDocument(supabase, citizenId, file)

    const { data: doc, error: dbError } = await supabase
      .from('source_documents')
      .insert({
        citizen_id: citizenId,
        file_url: path,
        // Dùng MIME verify bằng magic byte — không trust client
        file_type: validation.detectedMime,
        file_size_bytes: file.size,
        // Sanitize filename trước khi lưu DB (tránh XSS ở UI list)
        original_filename: safeFilename,
        document_type: 'other',
        notes: notes || null,
        is_classified: false,
        uploaded_by: user.id,
        metadata: {},
      })
      .select('id')
      .single()

    if (dbError) {
      return NextResponse.json({ error: 'Lưu tài liệu thất bại: ' + dbError.message }, { status: 500 })
    }

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'upload_document',
      target_table: 'source_documents',
      target_id: doc.id,
      details: { filename: file.name, fileType: file.type, citizenId },
    })

    return NextResponse.json({ documentId: doc.id, fileUrl: publicUrl })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: 'Tải lên thất bại: ' + message }, { status: 500 })
  }
}
