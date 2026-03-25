// API lấy quyền tùy chỉnh của một người dùng cụ thể (dùng cho trang phân quyền)
// GET /api/permissions/user?userId=xxx → { customPermissions }
// Chỉ super_admin / director / branch_director mới được gọi

import { NextResponse } from 'next/server'
import { isDemoMode, getDemoUser, demoUnauthorized, demoForbidden } from '@/lib/demo/demo-api-helper'
import { getCustomPermissions } from '@/lib/demo/demo-user-custom-permissions-store'
import { canAssignPermissions } from '@/lib/permissions/permission-checker'
import { createClient } from '@/lib/supabase/server'
import type { Permission } from '@/lib/permissions/permission-definitions'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const targetUserId = url.searchParams.get('userId')

  if (!targetUserId) {
    return NextResponse.json({ error: 'Thiếu userId.' }, { status: 400 })
  }

  // ── Demo mode ──────────────────────────────────────────────────────────────
  if (isDemoMode()) {
    const actor = await getDemoUser(request)
    if (!actor) return demoUnauthorized()
    if (!canAssignPermissions(actor.role)) return demoForbidden()

    const custom = getCustomPermissions(targetUserId)
    return NextResponse.json({ userId: targetUserId, customPermissions: custom })
  }

  // ── Supabase mode ──────────────────────────────────────────────────────────
  try {
    const supabase = await createClient()
    const { data: { user: sbUser } } = await supabase.auth.getUser()
    if (!sbUser) {
      return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })
    }

    const { data: actor } = await supabase
      .from('citizens')
      .select('id, role')
      .eq('auth_id', sbUser.id)
      .single()

    if (!actor || !canAssignPermissions(actor.role)) {
      return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 })
    }

    const { data: customRows } = await supabase
      .from('user_custom_permissions')
      .select('permission')
      .eq('user_id', targetUserId)

    const custom: Permission[] = (customRows ?? []).map((r: { permission: string }) => r.permission as Permission)
    return NextResponse.json({ userId: targetUserId, customPermissions: custom })
  } catch {
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
