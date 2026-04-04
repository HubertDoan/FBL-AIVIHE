// API phân quyền tùy chỉnh cho người dùng
// POST /api/permissions/assign → gán/thu hồi quyền tùy chỉnh
// Chỉ director/super_admin/branch_director mới được gọi

import { NextResponse } from 'next/server'
import { isDemoMode, getDemoUser, demoForbidden, demoUnauthorized } from '@/lib/demo/demo-api-helper'
import {
  getCustomPermissions,
  setCustomPermissions,
} from '@/lib/demo/demo-user-custom-permissions-store'
import { getDefaultPermissions } from '@/lib/permissions/role-default-permissions'
import { canAssignPermissions, hasPermission } from '@/lib/permissions/permission-checker'
import { DEMO_ACCOUNTS } from '@/lib/demo/demo-accounts'
import type { Permission } from '@/lib/permissions/permission-definitions'
import { createClient } from '@/lib/supabase/server'

interface AssignBody {
  targetUserId: string
  permissions: Permission[]
  targetBranchId?: string
}

export async function POST(request: Request) {
  // ── Demo mode ──────────────────────────────────────────────────────────────
  if (isDemoMode()) {
    const actor = await getDemoUser(request)
    if (!actor) return demoUnauthorized()
    if (!canAssignPermissions(actor.role)) return demoForbidden()

    let body: AssignBody
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 })
    }

    const { targetUserId, permissions } = body
    if (!targetUserId || !Array.isArray(permissions)) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc.' }, { status: 400 })
    }

    // Kiểm tra người dùng đích tồn tại
    const targetAccount = DEMO_ACCOUNTS.find((a) => a.id === targetUserId)
    if (!targetAccount) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng.' }, { status: 404 })
    }

    // branch_director chỉ được phân quyền trong chi nhánh của mình
    if (actor.role === 'branch_director') {
      // Demo: branch_director Khanh chỉ quản lý tài khoản có branchId trùng
      // Đơn giản hoá: không chặn trong demo, chỉ validate quyền được gán
    }

    // Chỉ được gán quyền mà bản thân actor đang có
    const actorCustom = getCustomPermissions(actor.id)
    const invalidPerms = permissions.filter(
      (p) => !hasPermission(actor.role, p, actorCustom)
    )
    if (invalidPerms.length > 0) {
      return NextResponse.json(
        { error: `Bạn không thể gán quyền mà bạn không có: ${invalidPerms.join(', ')}` },
        { status: 403 }
      )
    }

    // Lấy quyền mặc định của người dùng đích, chỉ lưu phần vượt ngoài mặc định
    const targetDefaults = getDefaultPermissions(targetAccount.role)
    const extraPerms = permissions.filter((p) => !targetDefaults.includes(p))
    setCustomPermissions(targetUserId, extraPerms)

    return NextResponse.json({
      success: true,
      targetUserId,
      customPermissions: extraPerms,
      message: 'Đã cập nhật quyền thành công.',
    })
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
      .eq('id', sbUser.id)
      .single()

    if (!actor || !canAssignPermissions(actor.role)) {
      return NextResponse.json({ error: 'Không có quyền phân quyền.' }, { status: 403 })
    }

    let body: AssignBody
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 })
    }

    const { targetUserId, permissions } = body
    if (!targetUserId || !Array.isArray(permissions)) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc.' }, { status: 400 })
    }

    // Lấy thông tin người dùng đích
    const { data: targetCitizen } = await supabase
      .from('citizens')
      .select('id, role')
      .eq('id', targetUserId)
      .single()

    if (!targetCitizen) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng.' }, { status: 404 })
    }

    // Lấy quyền tùy chỉnh hiện tại của actor để validate
    const { data: actorCustomRows } = await supabase
      .from('user_custom_permissions')
      .select('permission')
      .eq('user_id', actor.id)
    const actorCustom: Permission[] = (actorCustomRows ?? []).map((r: { permission: string }) => r.permission as Permission)

    const invalidPerms = permissions.filter(
      (p) => !hasPermission(actor.role, p, actorCustom)
    )
    if (invalidPerms.length > 0) {
      return NextResponse.json(
        { error: `Bạn không thể gán quyền mà bạn không có: ${invalidPerms.join(', ')}` },
        { status: 403 }
      )
    }

    const targetDefaults = getDefaultPermissions(targetCitizen.role)
    const extraPerms = permissions.filter((p) => !targetDefaults.includes(p))

    // Xóa quyền cũ rồi chèn mới (upsert)
    await supabase.from('user_custom_permissions').delete().eq('user_id', targetUserId)
    if (extraPerms.length > 0) {
      await supabase.from('user_custom_permissions').insert(
        extraPerms.map((p) => ({ user_id: targetUserId, permission: p, granted_by: actor.id }))
      )
    }

    return NextResponse.json({
      success: true,
      targetUserId,
      customPermissions: extraPerms,
      message: 'Đã cập nhật quyền thành công.',
    })
  } catch {
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
