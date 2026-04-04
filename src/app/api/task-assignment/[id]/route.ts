// Task assignment detail API: update task status and notes
// PATCH /api/task-assignment/[id] — update status + notes
// Directors can cancel; staff can set in_progress or completed

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'
import { getTaskById, updateTaskStatus, type TaskStatus } from '@/lib/demo/demo-task-assignment-data'

const CREATOR_ROLES = ['director', 'branch_director', 'super_admin', 'admin', 'manager']

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()

    const task = getTaskById(id)
    if (!task) return demoResponse({ error: 'Không tìm thấy công việc.' }, 404)

    const body = await request.json()
    const { status, notes } = body as { status: TaskStatus; notes?: string }

    const isCreator = CREATOR_ROLES.includes(user.role)
    const isAssignee = task.assignedTo === user.id

    if (!isCreator && !isAssignee) return demoForbidden()

    // Staff can only set in_progress or completed; directors can also cancel
    const allowedForStaff: TaskStatus[] = ['in_progress', 'completed']
    if (!isCreator && !allowedForStaff.includes(status)) {
      return demoResponse({ error: 'Nhân viên chỉ có thể cập nhật trạng thái đang làm hoặc hoàn thành.' }, 403)
    }

    const updated = updateTaskStatus(id, status, notes)
    return demoResponse(updated)
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const body = await request.json()
    const { status, notes } = body

    const { data, error } = await supabase
      .from('tasks')
      .update({ status, notes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}
