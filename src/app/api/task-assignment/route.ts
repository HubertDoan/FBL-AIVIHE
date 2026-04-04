// Task assignment API: list tasks and create new tasks
// Demo mode: in-memory store from demo-task-assignment-data.ts
// GET  /api/task-assignment — list tasks (directors see all they created, staff see assigned)
// POST /api/task-assignment — create task (directors/super_admin/manager only)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'
import { getTasks, createTask } from '@/lib/demo/demo-task-assignment-data'
import { findDemoAccountById } from '@/lib/demo/demo-accounts'

const CREATOR_ROLES = ['director', 'branch_director', 'super_admin', 'admin', 'manager']

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()
    const tasks = getTasks(user.id, user.role)
    return demoResponse({ tasks })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .or(`assigned_to.eq.${user.id},assigned_by.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ tasks: data ?? [] })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()
    if (!CREATOR_ROLES.includes(user.role)) return demoForbidden()

    const body = await request.json()
    const { title, description, assignedTo, deadline } = body

    if (!title || !description || !assignedTo) {
      return demoResponse({ error: 'Thiếu title, description hoặc assignedTo.' }, 400)
    }

    const assignee = findDemoAccountById(assignedTo)
    if (!assignee) return demoResponse({ error: 'Không tìm thấy người được giao.' }, 404)

    const task = createTask({
      title,
      description,
      assignedTo,
      assignedToName: assignee.fullName,
      assignedBy: user.id,
      assignedByName: user.fullName,
      deadline,
    })
    return demoResponse(task, 201)
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const body = await request.json()
    const { title, description, assignedTo, deadline } = body
    if (!title || !description || !assignedTo) {
      return NextResponse.json({ error: 'Thiếu title, description hoặc assignedTo.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, description, assigned_to: assignedTo, assigned_by: user.id, deadline })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}
