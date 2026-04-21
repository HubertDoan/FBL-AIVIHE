// PATCH /api/family-doctor-registrations/[id] — director/admin approves or rejects a registration
// On approve: also updates citizen's family_doctor_id field if column exists
// On reject: stores rejected_reason

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const APPROVER_ROLES = ['director', 'branch_director', 'admin', 'super_admin']

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const { data: approver } = await supabase
      .from('citizens')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!approver || !APPROVER_ROLES.includes(approver.role)) {
      return NextResponse.json({ error: 'Bạn không có quyền duyệt yêu cầu.' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, notes, rejected_reason } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'action phải là "approve" hoặc "reject".' }, { status: 400 })
    }

    // Fetch registration
    const { data: reg } = await supabase
      .from('family_doctor_registrations')
      .select('id, status, citizen_id, doctor_id')
      .eq('id', id)
      .single()

    if (!reg) {
      return NextResponse.json({ error: 'Không tìm thấy yêu cầu đăng ký.' }, { status: 404 })
    }

    if (reg.status !== 'pending') {
      return NextResponse.json({ error: 'Yêu cầu này đã được xử lý.' }, { status: 409 })
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      approved_by: approver.id,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (notes) updatePayload.notes = notes
    if (action === 'reject' && rejected_reason) {
      updatePayload.rejected_reason = rejected_reason
    }

    const { data: updated, error } = await supabase
      .from('family_doctor_registrations')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // On approve: update citizen's assigned doctor if citizens table has family_doctor_id
    if (action === 'approve') {
      await supabase
        .from('citizens')
        .update({ family_doctor_id: reg.doctor_id, updated_at: new Date().toISOString() })
        .eq('id', reg.citizen_id)
        // Silent fail — column may not exist yet; migration adds it separately
    }

    return NextResponse.json({ registration: updated })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
