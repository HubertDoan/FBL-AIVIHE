// GET /api/sleepcare/pods
// Citizen: thấy pods được gán cho mình (demo: tất cả pods của facility)
// Staff: thấy tất cả pods (option ?facility=...)

import { NextRequest } from 'next/server'
import {
  isDemoMode, getDemoUser, demoResponse, demoUnauthorized, demoForbidden,
} from '@/lib/demo/demo-api-helper'
import { getPodsForFacility } from '@/lib/sleepcare/sleepcare-demo-pods-and-sessions-in-memory-store'

const ALLOWED_ROLES = ['member', 'doctor', 'specialist', 'reception', 'admin', 'super_admin', 'director', 'branch_director']

export async function GET(request: NextRequest) {
  if (!isDemoMode()) {
    return demoResponse({ error: 'Chức năng này chưa khả dụng trên môi trường production.' }, 503)
  }

  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()
  if (!ALLOWED_ROLES.includes(user.role)) return demoForbidden()

  const { searchParams } = new URL(request.url)
  const facility = searchParams.get('facility') ?? undefined

  const pods = getPodsForFacility(facility)
  return demoResponse({ pods, total: pods.length })
}
