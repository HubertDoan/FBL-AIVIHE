// API lấy quyền hiệu lực của người dùng hiện tại
// GET /api/permissions → { role, defaultPermissions, customPermissions, effectivePermissions }

import { NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import { getCustomPermissions } from '@/lib/demo/demo-user-custom-permissions-store'
import { getDefaultPermissions } from '@/lib/permissions/role-default-permissions'
import { getEffectivePermissions } from '@/lib/permissions/permission-checker'
import { createClient } from '@/lib/supabase/server'
import type { Permission } from '@/lib/permissions/permission-definitions'

export async function GET(request: Request) {
  // ── Demo mode ──────────────────────────────────────────────────────────────
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })
    }

    const custom = getCustomPermissions(user.id)
    const defaults = getDefaultPermissions(user.role)
    const effective = getEffectivePermissions(user.role, custom)

    return NextResponse.json({
      role: user.role,
      userId: user.id,
      defaultPermissions: defaults,
      customPermissions: custom,
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
      .eq('auth_id', sbUser.id)
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
    const defaults = getDefaultPermissions(citizen.role)
    const effective = getEffectivePermissions(citizen.role, custom)

    return NextResponse.json({
      role: citizen.role,
      userId: citizen.id,
      defaultPermissions: defaults,
      customPermissions: custom,
      effectivePermissions: effective,
    })
  } catch {
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
