// T29: GET/POST /api/sleepcare/consents
// Citizen xem + cấp/thu hồi consent cho BS/gia đình/coach xem dữ liệu ngủ

import { NextRequest } from 'next/server'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized, demoForbidden } from '@/lib/demo/demo-api-helper'
import {
  getConsentsByCitizen, grantConsent, revokeConsent,
  type ConsentType, type ConsentScope,
} from '@/lib/sleepcare/sleepcare-demo-consents-and-doctor-notes-in-memory-store'

export async function GET(request: NextRequest) {
  if (!isDemoMode()) return demoResponse({ error: 'Chức năng chưa khả dụng.' }, 503)
  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()
  if (user.role !== 'member') return demoForbidden()

  const consents = getConsentsByCitizen(user.id)
  return demoResponse({ consents })
}

export async function POST(request: NextRequest) {
  if (!isDemoMode()) return demoResponse({ error: 'Chức năng chưa khả dụng.' }, 503)
  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()
  if (user.role !== 'member') return demoForbidden()

  let body: Record<string, unknown>
  try { body = await request.json() } catch { return demoResponse({ error: 'Body không hợp lệ.' }, 400) }

  const { action, consent_id, consent_type, grantee_user_id, grantee_name, scope, expires_in_days } = body

  if (action === 'revoke') {
    if (!consent_id) return demoResponse({ error: 'Thiếu consent_id.' }, 400)
    const updated = revokeConsent(String(consent_id), user.id)
    if (!updated) return demoResponse({ error: 'Consent không tồn tại hoặc không thuộc về bạn.' }, 404)
    return demoResponse({ consent: updated })
  }

  // action === 'grant' (default)
  const VALID_TYPES: ConsentType[] = ['doctor_share', 'family_share', 'coach_share']
  const VALID_SCOPES: ConsentScope[] = ['full', 'summary_only']

  if (!VALID_TYPES.includes(consent_type as ConsentType))
    return demoResponse({ error: 'consent_type không hợp lệ.' }, 400)
  if (!VALID_SCOPES.includes(scope as ConsentScope))
    return demoResponse({ error: 'scope không hợp lệ.' }, 400)
  if (!grantee_user_id || !grantee_name)
    return demoResponse({ error: 'Thiếu grantee_user_id hoặc grantee_name.' }, 400)

  const consent = grantConsent(
    user.id,
    consent_type as ConsentType,
    String(grantee_user_id),
    String(grantee_name),
    scope as ConsentScope,
    expires_in_days ? Number(expires_in_days) : null
  )
  return demoResponse({ consent }, 201)
}
