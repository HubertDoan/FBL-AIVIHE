import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demo/demo-api-helper'
import {
  getDoctorRegistrationRequestById,
  updateDoctorRegistrationRequest,
} from '@/lib/demo/demo-doctor-registration-request-in-memory-store'

/**
 * PATCH /api/doctor-application/[id]
 * Reception: new → contacted → info_completed (bổ sung extended_info)
 * Director: info_completed → approved | rejected
 */

const RECEPTION_ROLES = ['reception', 'admin', 'admin_staff', 'manager', 'super_admin']
const DIRECTOR_ROLES = ['director', 'branch_director', 'super_admin']

function getDemoSession(request: NextRequest): { id: string; role: string } | null {
  const cookie = request.cookies.get('demo-auth-session')
  if (!cookie?.value) return null
  try { return JSON.parse(cookie.value) } catch { return null }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (isDemoMode()) {
    const req = getDoctorRegistrationRequestById(id)
    if (!req) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ request: req })
  }

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('doctor_registration_requests')
    .select('*').eq('id', id).single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ request: data })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  if (isDemoMode()) {
    const user = getDemoSession(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const existing = getDoctorRegistrationRequestById(id)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const patch: Record<string, unknown> = {}

    if (RECEPTION_ROLES.includes(user.role)) {
      if (body.status === 'contacted') {
        patch.status = 'contacted'
        patch.contacted_by = user.id
        patch.contacted_at = new Date().toISOString()
      }
      if (body.status === 'info_completed') {
        patch.status = 'info_completed'
      }
      if (body.extended_info && typeof body.extended_info === 'object') {
        patch.extended_info = { ...existing.extended_info, ...body.extended_info }
      }
    }

    if (DIRECTOR_ROLES.includes(user.role)) {
      if (body.status === 'approved') {
        patch.status = 'approved'
        patch.approved_by = user.id
        patch.approved_at = new Date().toISOString()
      }
      if (body.status === 'rejected') {
        patch.status = 'rejected'
        patch.approved_by = user.id
        patch.approved_at = new Date().toISOString()
        patch.rejected_reason = body.rejected_reason || null
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Không có thay đổi hợp lệ cho role này' }, { status: 400 })
    }

    const updated = updateDoctorRegistrationRequest(id, patch)
    return NextResponse.json({ ok: true, request: updated })
  }

  // Production
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: citizen } = await supabase
    .from('citizens').select('role').eq('id', user.id).single()
  if (!citizen) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (RECEPTION_ROLES.includes(citizen.role)) {
    if (body.status === 'contacted') {
      patch.status = 'contacted'
      patch.contacted_by = user.id
      patch.contacted_at = new Date().toISOString()
    }
    if (body.status === 'info_completed') patch.status = 'info_completed'
    if (body.extended_info) patch.extended_info = body.extended_info
  }

  if (DIRECTOR_ROLES.includes(citizen.role)) {
    if (body.status === 'approved') {
      patch.status = 'approved'
      patch.approved_by = user.id
      patch.approved_at = new Date().toISOString()
    }
    if (body.status === 'rejected') {
      patch.status = 'rejected'
      patch.approved_by = user.id
      patch.approved_at = new Date().toISOString()
      patch.rejected_reason = body.rejected_reason || null
    }
  }

  const { data, error } = await supabase
    .from('doctor_registration_requests')
    .update(patch).eq('id', id).select('*').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, request: data })
}
