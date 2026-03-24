import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDocumentUrl } from '@/lib/supabase/storage'
import { callClaudeVision } from '@/lib/ai/claude-client'
import { buildExtractionPrompt } from '@/lib/ai/extract-prompt'
import { parseExtractionResponse } from '@/lib/ai/parse-extraction'

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

    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json(
        { error: 'Thiếu ID tài liệu.' },
        { status: 400 }
      )
    }

    const { data: doc } = await supabase
      .from('source_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (!doc) {
      return NextResponse.json(
        { error: 'Không tìm thấy tài liệu.' },
        { status: 404 }
      )
    }

    // Get signed URL and fetch file as base64
    const signedUrl = await getDocumentUrl(supabase, doc.file_url)
    const response = await fetch(signedUrl)
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    // Determine mime type for Claude Vision (convert pdf/heic to supported)
    let mimeType = doc.file_type
    if (mimeType === 'application/pdf' || mimeType === 'image/heic') {
      mimeType = 'image/png' // Supabase transforms or fallback
    }

    const { systemPrompt, userPrompt } = buildExtractionPrompt()
    const rawResponse = await callClaudeVision(
      base64,
      mimeType,
      systemPrompt,
      userPrompt
    )

    const extraction = parseExtractionResponse(rawResponse)

    // Save extracted records
    const recordsToInsert = extraction.records.map((r) => ({
      document_id: documentId,
      field_name: r.fieldName,
      field_value: r.fieldValue,
      unit: r.unit,
      reference_range: r.referenceRange,
      confidence_score: r.confidence,
      ai_model: 'claude-sonnet-4-20250514',
      status: 'pending' as const,
    }))

    const { data: records, error: insertError } = await supabase
      .from('extracted_records')
      .insert(recordsToInsert)
      .select()

    if (insertError) {
      return NextResponse.json(
        { error: 'Lưu kết quả trích xuất thất bại: ' + insertError.message },
        { status: 500 }
      )
    }

    // Update document info if available
    if (extraction.documentInfo) {
      await supabase
        .from('source_documents')
        .update({
          document_type: extraction.documentInfo.documentType,
          document_date: extraction.documentInfo.date,
          facility_name: extraction.documentInfo.facility,
          is_classified: true,
        })
        .eq('id', documentId)
    }

    // Create health event
    await supabase.from('health_events').insert({
      citizen_id: doc.citizen_id,
      event_type: 'document_upload',
      occurred_at: new Date().toISOString(),
      title: 'Trích xuất dữ liệu từ tài liệu',
      description: `Trích xuất ${records?.length ?? 0} trường dữ liệu`,
      source_document_id: documentId,
      metadata: { documentInfo: extraction.documentInfo },
      created_by: user.id,
    })

    return NextResponse.json({ records: records ?? [] })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json(
      { error: 'Trích xuất thất bại: ' + message },
      { status: 500 }
    )
  }
}
