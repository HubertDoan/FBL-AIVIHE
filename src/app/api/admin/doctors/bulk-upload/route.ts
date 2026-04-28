// POST /api/admin/doctors/bulk-upload
// Admin imports a validated list of doctors from CSV/XLSX (parsed client-side → JSON)
// For each row: find-or-create citizen account (phone-based) → upsert doctor_profile
// Requires admin / super_admin role

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import {
  validateAndNormalizeRow,
  type DoctorImportRawRow,
} from '@/lib/doctors/doctor-gphn-import-row-validator-and-column-normalizer'
import { isDemoMode } from '@/lib/demo/demo-api-helper'

const ADMIN_ROLES = ['admin', 'super_admin']

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    return NextResponse.json({ created: 1, updated: 0, skipped: 0, errors: [] })
  }

  try {
    // Auth check with regular client (session-based)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data: admin } = await supabase
      .from('citizens').select('role').eq('id', user.id).single()
    if (!admin || !ADMIN_ROLES.includes(admin.role))
      return NextResponse.json({ error: 'Chỉ admin mới có quyền nhập danh sách.' }, { status: 403 })

    const body = await request.json()
    const rawRows: DoctorImportRawRow[] = body.rows ?? []
    if (!rawRows.length)
      return NextResponse.json({ error: 'Không có dữ liệu.' }, { status: 400 })

    // Service client — bypasses RLS, allows auth.admin.createUser
    const svc = await createServiceClient()

    const results = { created: 0, updated: 0, skipped: 0, errors: [] as string[] }

    for (let i = 0; i < rawRows.length; i++) {
      const rowNum = i + 2 // header = row 1
      const v = validateAndNormalizeRow(rawRows[i])

      if (v.errors.length) {
        results.errors.push(`Dòng ${rowNum} (${v.full_name || '?'}): ${v.errors.join(', ')}`)
        results.skipped++
        continue
      }

      try {
        // ── Step 1: find or create citizen ────────────────────────────────────
        const { data: existing } = await svc
          .from('citizens').select('id').eq('phone', v.phone).maybeSingle()

        let citizenId: string

        if (existing) {
          citizenId = existing.id
          await svc.from('citizens').update({
            full_name:     v.full_name,
            date_of_birth: v.date_of_birth,
            email:         v.email,
            address:       v.address,
            updated_at:    new Date().toISOString(),
          }).eq('id', citizenId)
        } else {
          const { data: authData, error: authErr } = await svc.auth.admin.createUser({
            phone:         v.phone,
            phone_confirm: true,
            user_metadata: { full_name: v.full_name },
          })
          if (authErr || !authData.user) {
            results.errors.push(`Dòng ${rowNum}: Tạo tài khoản thất bại — ${authErr?.message}`)
            results.skipped++
            continue
          }
          citizenId = authData.user.id
          const { error: ciErr } = await svc.from('citizens').insert({
            id:            citizenId,
            full_name:     v.full_name,
            date_of_birth: v.date_of_birth,
            phone:         v.phone,
            email:         v.email,
            address:       v.address,
            role:          'doctor',
            has_consented: false,
          })
          if (ciErr) {
            await svc.auth.admin.deleteUser(citizenId)
            results.errors.push(`Dòng ${rowNum}: Lưu thông tin thất bại — ${ciErr.message}`)
            results.skipped++
            continue
          }
        }

        // Ensure role = doctor
        await svc.from('citizens').update({ role: 'doctor' }).eq('id', citizenId)

        // ── Step 2: upsert doctor_profile ─────────────────────────────────────
        const profilePayload = {
          specialty:           v.specialty,
          qualification:       v.qualification,
          license_number:      v.license_number,
          license_issued_date: v.license_issued_date,
          workplace:           v.workplace,
          employment_type:     v.employment_type,
          home_care:           v.home_care,
          updated_at:          new Date().toISOString(),
        }

        const { data: existingProfile } = await svc
          .from('doctor_profiles').select('id').eq('doctor_citizen_id', citizenId).maybeSingle()

        if (existingProfile) {
          await svc.from('doctor_profiles').update(profilePayload).eq('id', existingProfile.id)
          results.updated++
        } else {
          await svc.from('doctor_profiles').insert({
            ...profilePayload,
            doctor_citizen_id:           citizenId,
            status:                      'pending_verification',
            available_for_family_doctor: false,
          })
          results.created++
        }
      } catch (rowErr) {
        const msg = rowErr instanceof Error ? rowErr.message : 'Lỗi không xác định'
        results.errors.push(`Dòng ${rowNum}: ${msg}`)
        results.skipped++
      }
    }

    return NextResponse.json(results)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Lỗi server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
