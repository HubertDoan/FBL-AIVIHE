import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDocumentUrl } from '@/lib/supabase/storage'
import { callClaudeVision } from '@/lib/ai/claude-client'
import { buildClassificationPrompt } from '@/lib/ai/classify-prompt'
import { classificationResultSchema } from '@/lib/validators/document-schemas'

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

    const signedUrl = await getDocumentUrl(supabase, doc.file_url)
    const response = await fetch(signedUrl)
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    let mimeType = doc.file_type
    if (mimeType === 'application/pdf' || mimeType === 'image/heic') {
      mimeType = 'image/png'
    }

    const { systemPrompt, userPrompt } = buildClassificationPrompt()
    const rawResponse = await callClaudeVision(
      base64,
      mimeType,
      systemPrompt,
      userPrompt
    )

    // Parse JSON from response
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Phản hồi AI không hợp lệ.' },
        { status: 500 }
      )
    }

    const parsed = classificationResultSchema.parse(JSON.parse(jsonMatch[0]))

    await supabase
      .from('source_documents')
      .update({
        document_type: parsed.documentType,
        document_date: parsed.documentDate,
        facility_name: parsed.facilityName,
        is_classified: true,
        ai_classification: JSON.stringify(parsed),
      })
      .eq('id', documentId)

    return NextResponse.json({
      documentType: parsed.documentType,
      confidence: parsed.confidence,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json(
      { error: 'Phân loại thất bại: ' + message },
      { status: 500 }
    )
  }
}
