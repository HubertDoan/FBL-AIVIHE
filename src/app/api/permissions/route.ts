// API lấy quyền hiệu lực của người dùng hiện tại
// GET /api/permissions → { role, defaultPermissions, customPermissions, effectivePermissions }

import { NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import { getCustomPermissions } from '@/lib/demo/demo-user-custom-permissions-store'
import { getServiceRegistrations } from '@/lib/demo/demo-service-registration-in-memory-store'
import { getDefaultPermissions } from '@/lib/permissions/role-default-permissions'
import { getEffectivePermissions } from '@/lib/permissions/permission-checker'
import { createClient } from '@/lib/supabase/server'
import { PERMISSIONS, type Permission } from '@/lib/permissions/permission-definitions'

/**
 * Compute extra permissions based on active service registrations.
 * Khi KH có active registration cho package_type=1 (BSGĐ) → grant MODULE_HEALTH_RECORD_FAMILY_DOCTOR
 * Tương tự cho PHCN (2), Chuyên khoa (3)
 */
function computeExtraPermissionsFromRegistrations(citizenId: string): Permission[] {
  const regs = getServiceRegistrations(citizenId)
  const activeTypes = new Set(regs.filter(r => r.status === 'active').map(r => r.package_type))
  const extras: Permission[] = []
  if (activeTypes.has(1)) extras.push(PERMISSIONS.MODULE_HEALTH_RECORD_FAMILY_DOCTOR)
  if (activeTypes.has(2)) extras.push(PERMISSIONS.MODULE_HEALTH_RECORD_REHAB)
  if (activeTypes.has(3)) extras.push(PERMISSIONS.MODULE_HEALTH_RECORD_CLINIC)
  return extras
}

export async function GET(request: Request) {
  // ── Demo mode ──────────────────────────────────────────────────────────────
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })
    }

    const custom = getCustomPermissions(user.id)
    const extras = computeExtraPermissionsFromRegistrations(user.id)
    const allCustom = [...custom, ...extras]
    const defaults = getDefaultPermissions(user.role)
    const effective = getEffectivePermissions(user.role, allCustom)

    return NextResponse.json({
      role: user.role,
      userId: user.id,
      defaultPermissions: defaults,
      customPermissions: allCustom,
      effectivePermissions: effective,
    })
  }

  // ── Supabase mode ──────────────────────────────────────────────────────────
  try {
    const supabase = await createClient()
    const { data: { user: sbUser } } = await supabase.auth.getUser()
    if (!sbUser) {
      return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })
    }

    const { data: citizen } = await supabase
      .from('citizens')
      .select('id, role')
      .eq('id', sbUser.id)
      .single()

    if (!citizen) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản.' }, { status: 404 })
    }

    // Lấy quyền tùy chỉnh từ bảng user_custom_permissions (nếu có)
    const { data: customRows } = await supabase
      .from('user_custom_permissions')
      .select('permission')
      .eq('user_id', citizen.id)

    const custom: Permission[] = (customRows ?? []).map((r: { permission: string }) => r.permission as Permission)

    // Tự động unlock module theo gói dịch vụ đã đăng ký
    // FD (BS gia đình) → MODULE_HEALTH_RECORD_FAMILY_DOCTOR
    // RH (PHCN)        → MODULE_HEALTH_RECORD_REHAB
    // SP/clinic        → MODULE_HEALTH_RECORD_CLINIC
    const extras: Permission[] = []
    try {
      const { data: enrollments } = await supabase
        .from('service_enrollments')
        .select('service_type,status')
        .eq('citizen_id', citizen.id)
        .eq('status', 'active')
      const activeTypes = new Set((enrollments ?? []).map((e: { service_type: string }) => e.service_type))
      if (activeTypes.has('FD')) extras.push(PERMISSIONS.MODULE_HEALTH_RECORD_FAMILY_DOCTOR)
      if (activeTypes.has('RH')) extras.push(PERMISSIONS.MODULE_HEALTH_RECORD_REHAB)
      if (activeTypes.has('SP')) extras.push(PERMISSIONS.MODULE_HEALTH_RECORD_CLINIC)
    } catch {
      // bảng service_enrollments chưa migrate — bỏ qua
    }

    const allCustom = [...custom, ...extras]
    const defaults = getDefaultPermissions(citizen.role)
    const effective = getEffectivePermissions(citizen.role, allCustom)

    return NextResponse.json({
      role: citizen.role,
      userId: citizen.id,
      defaultPermissions: defaults,
      customPermissions: allCustom,
      effectivePermissions: effective,
    })
  } catch {
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
