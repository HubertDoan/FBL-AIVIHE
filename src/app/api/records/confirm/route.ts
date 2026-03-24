import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { confirmRecordSchema } from '@/lib/validators/document-schemas'

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

    const body = await request.json()
    const parsed = confirmRecordSchema.safeParse(body)

    if (!parsed.success) {
      const msg = parsed.error.issues
        .map((i) => i.message)
        .join('; ')
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const { extractedRecordId, confirmedValue, confirmedUnit, recordDate, category } =
      parsed.data

    // Get extracted record to find citizen_id
    const { data: extracted } = await supabase
      .from('extracted_records')
      .select('*, source_documents!inner(citizen_id)')
      .eq('id', extractedRecordId)
      .single()

    if (!extracted) {
      return NextResponse.json(
        { error: 'Không tìm thấy bản ghi.' },
        { status: 404 }
      )
    }

    const citizenId = (extracted.source_documents as { citizen_id: string }).citizen_id

    // Create confirmed record
    const { data: confirmed, error: confirmError } = await supabase
      .from('confirmed_records')
      .insert({
        extracted_record_id: extractedRecordId,
        citizen_id: citizenId,
        confirmed_value: confirmedValue,
        confirmed_unit: confirmedUnit,
        record_date: recordDate,
        category,
        confirmed_by: user.id,
      })
      .select()
      .single()

    if (confirmError) {
      return NextResponse.json(
        { error: 'Xác nhận thất bại: ' + confirmError.message },
        { status: 500 }
      )
    }

    // Update extracted record status
    await supabase
      .from('extracted_records')
      .update({ status: 'confirmed' })
      .eq('id', extractedRecordId)

    // Create health event
    await supabase.from('health_events').insert({
      citizen_id: citizenId,
      event_type: 'lab_result',
      occurred_at: recordDate || new Date().toISOString(),
      title: `Xác nhận: ${extracted.field_name}`,
      description: `${confirmedValue} ${confirmedUnit || ''}`.trim(),
      source_document_id: extracted.document_id,
      metadata: { confirmedRecordId: confirmed.id },
      created_by: user.id,
    })

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'confirm_record',
      target_table: 'confirmed_records',
      target_id: confirmed.id,
      details: { extractedRecordId, confirmedValue },
    })

    return NextResponse.json(confirmed)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json(
      { error: 'Xác nhận thất bại: ' + message },
      { status: 500 }
    )
  }
}
