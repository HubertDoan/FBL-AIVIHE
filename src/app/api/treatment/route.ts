// Treatment list API — GET returns all treatment episodes for the current citizen
// POST not implemented: treatments are auto-created from completed exam registrations

import { NextRequest } from 'next/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
} from '@/lib/demo/demo-api-helper'
import { getTreatments } from '@/lib/demo/demo-treatment-data'

export async function GET(request: NextRequest) {
  if (!isDemoMode()) return demoResponse([])
  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()
  const treatments = getTreatments(user.id)
  return demoResponse({ treatments })
}
