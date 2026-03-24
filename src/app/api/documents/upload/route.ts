import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadDocument } from '@/lib/supabase/storage'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'image/heic',
]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Bạn chưa đăng nhập.' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const citizenId = formData.get('citizenId') as string | null
    const notes = formData.get('notes') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'Vui lòng chọn tệp để tải lên.' },
        { status: 400 }
      )
    }

    if (!citizenId) {
      return NextResponse.json(
        { error: 'Thiếu ID công dân.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Tệp quá lớn, tối đa 10MB.' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Định dạng không hỗ trợ. Chấp nhận: JPEG, PNG, PDF, HEIC.' },
        { status: 400 }
      )
    }

    const { path, publicUrl } = await uploadDocument(supabase, citizenId, file)

    const { data: doc, error: dbError } = await supabase
      .from('source_documents')
      .insert({
        citizen_id: citizenId,
        file_url: path,
        file_type: file.type,
        file_size_bytes: file.size,
        original_filename: file.name,
        document_type: 'other',
        notes: notes || null,
        is_classified: false,
        uploaded_by: user.id,
        metadata: {},
      })
      .select('id')
      .single()

    if (dbError) {
      return NextResponse.json(
        { error: 'Lưu tài liệu thất bại: ' + dbError.message },
        { status: 500 }
      )
    }

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'upload_document',
      target_table: 'source_documents',
      target_id: doc.id,
      details: { filename: file.name, fileType: file.type, citizenId },
    })

    return NextResponse.json({
      documentId: doc.id,
      fileUrl: publicUrl,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json(
      { error: 'Tải lên thất bại: ' + message },
      { status: 500 }
    )
  }
}
