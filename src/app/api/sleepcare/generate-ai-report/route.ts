// T22: POST /api/sleepcare/generate-ai-report
// Sinh báo cáo AI cho 1 session (demo: mock markdown; production: Claude API)
// Body: { session_id: string }

import { NextRequest } from 'next/server'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized, demoForbidden } from '@/lib/demo/demo-api-helper'
import { getSessionById, updateSessionAiReport } from '@/lib/sleepcare/sleepcare-demo-pods-and-sessions-in-memory-store'
import { getEventsBySession, getReadingCount } from '@/lib/sleepcare/sleepcare-demo-events-readings-and-commands-in-memory-store'

const ALLOWED_ROLES = ['member', 'admin', 'super_admin', 'doctor']

export async function POST(request: NextRequest) {
  if (!isDemoMode()) return demoResponse({ error: 'Chức năng chưa khả dụng.' }, 503)
  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()
  if (!ALLOWED_ROLES.includes(user.role)) return demoForbidden()

  let body: Record<string, unknown>
  try { body = await request.json() } catch { return demoResponse({ error: 'Body không hợp lệ.' }, 400) }

  const { session_id } = body
  if (!session_id) return demoResponse({ error: 'Thiếu session_id.' }, 400)

  const session = getSessionById(String(session_id))
  if (!session) return demoResponse({ error: 'Phiên ngủ không tồn tại.' }, 404)
  if (user.role === 'member' && session.citizen_id !== user.id) return demoForbidden()
  if (session.status !== 'completed') return demoResponse({ error: 'Phiên ngủ chưa kết thúc.' }, 400)
  if (session.ai_report_markdown) return demoResponse({ message: 'Báo cáo đã tồn tại.', session })

  const events = getEventsBySession(String(session_id))
  const readingsCount = getReadingCount(String(session_id))
  const score = session.sleep_score ?? 75
  const durationH = session.duration_minutes ? Math.floor(session.duration_minutes / 60) : 7
  const durationM = session.duration_minutes ? session.duration_minutes % 60 : 30
  const snoreEvents = events.filter(e => e.event_type === 'snore_detected').length
  const postureChanges = events.filter(e => e.event_type === 'posture_change').length
  const scoreLabel = score >= 80 ? 'Tốt' : score >= 60 ? 'Trung bình' : 'Cần cải thiện'
  const trend = score >= 80 ? '↑ Tốt hơn tuần trước' : score >= 60 ? '→ Ổn định' : '↓ Thấp hơn tuần trước'

  // Demo: sinh báo cáo mock có cấu trúc thực tế
  const reportDate = session.end_time
    ? new Date(session.end_time).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const markdown = `## Báo cáo giấc ngủ — ${reportDate}

**Điểm giấc ngủ: ${score}/100** (${scoreLabel} · ${trend})

---

### Tóm tắt đêm

| Chỉ số | Kết quả | Đánh giá |
|---|---|---|
| Thời lượng | ${durationH} giờ ${durationM} phút | ${durationH >= 7 ? '✅ Đạt mục tiêu (7–9h)' : '⚠️ Dưới mục tiêu'} |
| Số lần ngáy ghi nhận | ${snoreEvents} lần | ${snoreEvents <= 2 ? '✅ Bình thường' : '⚠️ Cần chú ý'} |
| Đổi tư thế | ${postureChanges} lần | ${postureChanges <= 5 ? '✅ Bình thường' : '⚠️ Nhiều'} |
| Dữ liệu cảm biến | ${readingsCount} điểm đo | ✅ Đầy đủ |

---

### 3 điểm tích cực đêm qua

1. **Thời gian đi ngủ ổn định** — đi ngủ đúng giờ giúp đồng hồ sinh học duy trì nhịp đều.
2. **Tư thế ngủ đa dạng** — đổi tư thế tự nhiên trong đêm giúp giảm áp lực lên khớp và cột sống.
3. **Môi trường phòng ngủ tốt** — nhiệt độ và CO₂ trong ngưỡng khuyến nghị, thuận lợi cho giấc ngủ sâu.

---

### 3 gợi ý cho 7 ngày tới

1. **Hạn chế caffeine sau 14h** — caffeine có thể kéo dài lên đến 8–10 giờ trong cơ thể, ảnh hưởng đến chất lượng giấc ngủ sâu.
2. **Tập thở 4-7-8 trước ngủ 10 phút** — hít vào 4 giây, giữ 7 giây, thở ra 8 giây. Giúp kích hoạt hệ thần kinh phó giao cảm.
3. **Giữ nhiệt độ phòng 22–24°C** — nhiệt độ mát nhẹ giúp cơ thể hạ thân nhiệt lõi nhanh hơn, vào giấc ngủ sâu sớm hơn.

---

### Khi nào nên trao đổi với bác sĩ gia đình

${snoreEvents >= 3 ? '- ⚠️ **Ngáy nhiều đêm liên tiếp** — Nếu hiện tượng này lặp lại ≥ 3 đêm, hãy trao đổi với bác sĩ để loại trừ khả năng ngưng thở khi ngủ (sleep apnea).' : '- Không có dấu hiệu bất thường cần theo dõi thêm đêm nay.'}
- Nếu bạn cảm thấy mệt mỏi vào ban ngày dù ngủ đủ giờ, hãy ghi nhận và chia sẻ với bác sĩ gia đình qua AIVIHE.

---

*Báo cáo sinh tự động lúc 07:00. AI tổng hợp dựa trên dữ liệu cảm biến SmartBed.*
*Đây là gợi ý wellness, không thay thế ý kiến bác sĩ. Liên hệ bác sĩ gia đình qua AIVIHE nếu có lo ngại.*
*Dữ liệu sức khỏe thuộc về bạn và chỉ được chia sẻ khi có sự cho phép của bạn.*`

  const updated = updateSessionAiReport(String(session_id), markdown)
  return demoResponse({ session: updated, report_markdown: markdown })
}
