// T26: GET /api/sleepcare/doctor-patients
// Doctor xem danh sách bệnh nhân đã cấp quyền xem dữ liệu ngủ
// Trả về: consent info + last session stats

import { NextRequest } from 'next/server'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized, demoForbidden } from '@/lib/demo/demo-api-helper'
import { getConsentsByDoctor } from '@/lib/sleepcare/sleepcare-demo-consents-and-doctor-notes-in-memory-store'
import { getSessionsByUser } from '@/lib/sleepcare/sleepcare-demo-pods-and-sessions-in-memory-store'

const DOCTOR_ROLES = ['doctor', 'specialist']

const DEMO_CITIZEN_NAMES: Record<string, string> = {
  'demo-0001-0000-0000-000000000001': 'Nguyễn Văn Minh',
  'demo-0002-0000-0000-000000000002': 'Trần Thị Lan',
  'demo-0003-0000-0000-000000000003': 'Nguyễn Tuấn',
  'demo-0004-0000-0000-000000000004': 'Phạm Văn Đức',
}

export async function GET(request: NextRequest) {
  if (!isDemoMode()) return demoResponse({ error: 'Chức năng chưa khả dụng.' }, 503)
  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()
  if (!DOCTOR_ROLES.includes(user.role)) return demoForbidden()

  const consents = getConsentsByDoctor(user.id)

  const patients = consents.map(c => {
    const sessions = getSessionsByUser(c.citizen_id, 5).filter(s => s.status === 'completed')
    const lastSession = sessions[0] ?? null
    return {
      citizen_id: c.citizen_id,
      citizen_name: DEMO_CITIZEN_NAMES[c.citizen_id] ?? 'Bệnh nhân',
      consent_id: c.id,
      consent_type: c.consent_type,
      scope: c.scope,
      expires_at: c.expires_at,
      granted_at: c.granted_at,
      last_sleep_score: lastSession?.sleep_score ?? null,
      last_session_at: lastSession?.end_time ?? null,
      session_count: sessions.length,
      has_ai_report: sessions.some(s => s.ai_report_markdown !== null),
    }
  })

  return demoResponse({ patients })
}
