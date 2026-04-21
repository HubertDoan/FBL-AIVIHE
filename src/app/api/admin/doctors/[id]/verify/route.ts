// PATCH /api/admin/doctors/[id]/verify — admin verifies a doctor profile, sets status to active
// Also sets available_for_family_doctor=true and records verified_by + verified_at

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ADMIN_ROLES = ['admin', 'super_admin']

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const { data: admin } = await supabase
      .from('citizens')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!admin || !ADMIN_ROLES.includes(admin.role)) {
      return NextResponse.json({ error: 'Chỉ admin mới có quyền xác minh bác sĩ.' }, { status: 403 })
    }

    const { id } = await params

    const { data: profile, error } = await supabase
      .from('doctor_profiles')
      .update({
        status: 'active',
        available_for_family_doctor: true,
        verified_by: admin.id,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!profile) return NextResponse.json({ error: 'Không tìm thấy hồ sơ bác sĩ.' }, { status: 404 })

    return NextResponse.json({ profile })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
