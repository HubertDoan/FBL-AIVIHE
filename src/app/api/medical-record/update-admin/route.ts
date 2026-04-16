// POST /api/medical-record/update-admin — cập nhật thông tin hành chính (Section I)
// Người dùng sửa trực tiếp các trường: họ tên, CCCD, SĐT, địa chỉ, BHYT...

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import { getMedicalRecord } from '@/lib/demo/demo-medical-record-eleven-sections-data'

export async function POST(request: NextRequest) {
  if (!isDemoMode()) {
    return NextResponse.json({ error: 'Chưa khả dụng production' }, { status: 503 })
  }

  const user = await getDemoUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const record = getMedicalRecord(user.id)

    // Merge updated fields into administrative section
    record.administrative = {
      full_name: body.full_name || record.administrative?.full_name || '',
      date_of_birth: body.date_of_birth || record.administrative?.date_of_birth || '',
      gender: body.gender || record.administrative?.gender || 'male',
      national_id: body.national_id || record.administrative?.national_id || '',
      phone: body.phone || record.administrative?.phone || '',
      address: body.address || record.administrative?.address || '',
      insurance_number: body.insurance_number || null,
      insurance_facility: body.insurance_facility || null,
      ethnicity: body.ethnicity || null,
      occupation: body.occupation || null,
      emergency_contact: record.administrative?.emergency_contact || null,
    }

    return NextResponse.json({ ok: true, administrative: record.administrative })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
