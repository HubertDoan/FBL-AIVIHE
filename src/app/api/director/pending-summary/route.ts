// GET /api/director/pending-summary
// Returns pending counts for director KPI dashboard:
// - consultations (status = 'new' | 'contacted' | 'info_completed')
// - family_doctors (status = 'pending')
// - services (status = 'pending_approval')
// Access: director, branch_director, admin, super_admin

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized, demoForbidden } from '@/lib/demo/demo-api-helper'
import { countByStatus } from '@/lib/demo/demo-consultation-request-in-memory-store'
import { getAllServiceRegistrations } from '@/lib/demo/demo-service-registration-in-memory-store'

const ALLOWED_ROLES = ['director', 'branch_director', 'admin', 'super_admin']

export async function GET(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!ALLOWED_ROLES.includes(demoUser.role)) return demoForbidden()

    const statusCounts = countByStatus()
    const consultations = (statusCounts.new ?? 0) + (statusCounts.contacted ?? 0) + (statusCounts.info_completed ?? 0)

    const allServices = getAllServiceRegistrations()
    const services = allServices.filter(s => s.status === 'pending_approval').length

    return demoResponse({ consultations, family_doctors: 0, services })
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data: citizen } = await supabase.from('citizens').select('role').eq('id', user.id).single()
    if (!citizen || !ALLOWED_ROLES.includes(citizen.role)) {
      return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 })
    }

    const [consultRes, familyRes, serviceRes] = await Promise.all([
      supabase.from('consultation_requests').select('id', { count: 'exact', head: true }).in('status', ['new', 'contacted', 'info_completed']),
      supabase.from('family_doctor_registrations').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('service_registrations').select('id', { count: 'exact', head: true }).eq('status', 'pending_approval'),
    ])

    return NextResponse.json({
      consultations: consultRes.count ?? 0,
      family_doctors: familyRes.count ?? 0,
      services: serviceRes.count ?? 0,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
