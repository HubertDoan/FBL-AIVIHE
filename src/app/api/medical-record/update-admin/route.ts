// POST /api/medical-record/update-admin — cập nhật thông tin hành chính (Section I)
// Người dùng sửa trực tiếp các trường: họ tên, CCCD, SĐT, địa chỉ, BHYT...

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import { getMedicalRecord } from '@/lib/demo/demo-medical-record-eleven-sections-data'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Body không hợp lệ' }, { status: 400 })

  // Demo mode: merge vào in-memory record
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const record = getMedicalRecord(user.id)
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
  }

  // Production: update citizens table
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Chuẩn hóa địa chỉ: viết hoa chữ đầu mỗi phần tách bởi dấu phẩy
  const normalizeAddress = (addr: string | null | undefined): string | null => {
    if (!addr) return null
    return addr.split(',').map(part => {
      const trimmed = part.trim()
      if (!trimmed) return ''
      // Viết hoa chữ đầu mỗi từ (Title Case cho địa danh VN)
      return trimmed.split(/\s+/).map(w =>
        w.length === 0 ? w : w.charAt(0).toLocaleUpperCase('vi-VN') + w.slice(1)
      ).join(' ')
    }).filter(s => s.length > 0).join(', ')
  }

  // Chuẩn hóa text chung: trim + capitalize first letter
  const normalizeText = (t: string | null | undefined): string | null => {
    if (!t) return null
    const trimmed = t.trim()
    if (!trimmed) return null
    return trimmed.charAt(0).toLocaleUpperCase('vi-VN') + trimmed.slice(1)
  }

  const updates: Record<string, unknown> = {}
  if (body.full_name !== undefined) updates.full_name = normalizeText(body.full_name)
  if (body.date_of_birth !== undefined) updates.date_of_birth = body.date_of_birth || null
  if (body.gender !== undefined) updates.gender = body.gender || null
  if (body.national_id !== undefined) updates.national_id = (body.national_id || '').trim() || null
  if (body.phone !== undefined) updates.phone = (body.phone || '').trim()
  if (body.address !== undefined) updates.address = normalizeAddress(body.address)
  if (body.ethnicity !== undefined) updates.ethnicity = normalizeText(body.ethnicity)
  if (body.occupation !== undefined) updates.occupation = normalizeText(body.occupation)

  const { data, error } = await supabase
    .from('citizens')
    .update(updates)
    .eq('id', user.id)
    .select('full_name, date_of_birth, gender, national_id, phone, address, ethnicity, occupation')
    .single()

  if (error) return NextResponse.json({ error: 'Lưu thất bại: ' + error.message }, { status: 500 })

  return NextResponse.json({
    ok: true,
    administrative: {
      full_name: data.full_name ?? '',
      date_of_birth: data.date_of_birth ?? '',
      gender: (data.gender as 'male' | 'female' | 'other') ?? 'male',
      national_id: data.national_id ?? '',
      phone: data.phone ?? '',
      address: data.address ?? '',
      insurance_number: body.insurance_number ?? null,
      insurance_facility: body.insurance_facility ?? null,
      ethnicity: data.ethnicity ?? null,
      occupation: data.occupation ?? null,
      emergency_contact: null,
    },
  })
}
