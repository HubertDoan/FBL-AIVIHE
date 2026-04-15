// POST /api/ai-chat — AI health Q&A chatbot
// Demo: mock responses dựa trên keyword matching
// Production: gọi Claude API với context từ hồ sơ y tế của user

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import { getMedicalRecord } from '@/lib/demo/demo-medical-record-eleven-sections-data'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const SAFETY_FOOTER = '\n\n⚠️ AIVIHE không chẩn đoán bệnh, không thay thế bác sĩ. Vui lòng tư vấn BS gia đình của bạn.'

function generateMockResponse(lastMessage: string, medicalContext: string): string {
  const q = lastMessage.toLowerCase()

  if (/huy[eê]t\s*[aá]p|blood\s*pressure|ha\b/i.test(lastMessage)) {
    return `Dựa trên dữ liệu gần nhất của bạn, tôi thấy huyết áp đang trong ngưỡng chấp nhận được. Một số lưu ý:\n
• Đo đều 2 lần/ngày (sáng và chiều), ghi lại kết quả
• Hạn chế muối (dưới 5g/ngày)
• Tập thể dục nhẹ 30 phút/ngày
• Không bỏ thuốc huyết áp nếu đã được kê đơn

${medicalContext ? '\nVới hồ sơ hiện tại của bạn, nên tái khám BS gia đình nếu HA > 140/90 kéo dài 3 ngày.' : ''}${SAFETY_FOOTER}`
  }

  if (/\b(hba1c|\u0111\u01b0\u1eddng huy\u1ebft|ti\u1ec3u \u0111\u01b0\u1eddng|ddai? \u0111\u01b0\u1eddng|diabetes)\b/i.test(lastMessage)) {
    return `Về đường huyết / ĐTĐ:\n
• HbA1c mục tiêu cho người lớn tuổi: < 7.0% (có thể 7.5-8.0% nếu có nhiều bệnh đồng mắc)
• Đo đường huyết đói hằng ngày, ghi vào AIVIHE
• Metformin thường uống sau ăn để giảm tác dụng phụ tiêu hóa
• Chế độ ăn: giảm carb tinh chế, tăng rau xanh, chia nhiều bữa nhỏ
• Vận động sau ăn 30 phút giúp hạ đường huyết

${medicalContext ? 'Tôi thấy bạn đang điều trị ĐTĐ — nên đặt lịch tái khám BS Nội tiết định kỳ 3 tháng/lần.' : ''}${SAFETY_FOOTER}`
  }

  if (/\b(xet|x\u00e9t|lab|test|k\u1ebft qu\u1ea3 kham)\b/i.test(lastMessage)) {
    return `Để đọc kết quả xét nghiệm:\n
• Mỗi chỉ số có "khoảng tham chiếu" bên cạnh — nằm trong khoảng này là bình thường
• H (High) = cao, L (Low) = thấp — đều cần chú ý
• Không hoảng khi thấy 1 chỉ số lệch — cần xem tổng thể + xu hướng theo thời gian
• Chụp ảnh tải lên AIVIHE, AI sẽ trích xuất tự động

Bạn có thể hỏi cụ thể chỉ số nào đang băn khoăn, tôi sẽ giải thích.${SAFETY_FOOTER}`
  }

  if (/\b(\u0111au|pain|nh\u1ee9c)\b/i.test(lastMessage)) {
    return `Về cơn đau:\n
• Ghi lại mức độ đau (0-10) và thời gian
• Vị trí đau, lan tỏa không, tăng lên khi nào
• Thuốc đã dùng (nếu có)
• Các triệu chứng kèm theo (sốt, khó thở, chóng mặt...)

Nếu đau ngực đột ngột, khó thở, đau lan cánh tay → gọi 115 ngay.${SAFETY_FOOTER}`
  }

  // Default
  return `Cảm ơn bạn đã hỏi. Tôi là trợ lý AI sức khỏe của AIVIHE, có thể giúp bạn:\n
• Giải thích kết quả xét nghiệm
• Hướng dẫn cách đo các chỉ số tại nhà
• Tư vấn chế độ ăn uống, tập luyện
• Nhắc nhở lịch khám / uống thuốc
• Hỗ trợ chuẩn bị câu hỏi khi gặp BS

Bạn hãy hỏi cụ thể hơn nhé!${SAFETY_FOOTER}`
}

function buildMedicalContextSummary(citizenId: string): string {
  try {
    const record = getMedicalRecord(citizenId)
    const parts: string[] = []
    if (record.chronic_conditions.length > 0) {
      parts.push(`Bệnh mạn tính: ${record.chronic_conditions.map(c => c.condition).join(', ')}.`)
    }
    if (record.allergies.length > 0) {
      parts.push(`Dị ứng: ${record.allergies.map(a => a.agent).join(', ')}.`)
    }
    if (record.vital_signs.length > 0) {
      const v = record.vital_signs[0]
      parts.push(`HA gần nhất: ${v.blood_pressure_systolic}/${v.blood_pressure_diastolic} mmHg.`)
    }
    return parts.join(' ')
  } catch {
    return ''
  }
}

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
      const body = await request.json()
      const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : []
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
      if (!lastUserMsg) {
        return NextResponse.json({ error: 'Không có câu hỏi' }, { status: 400 })
      }

      const context = buildMedicalContextSummary(user.id)
      const reply = generateMockResponse(lastUserMsg.content, context)

      return NextResponse.json({
        ok: true,
        reply,
        suggested_questions: [
          'Huyết áp của tôi có ổn không?',
          'HbA1c 6.8% có cao không?',
          'Tôi nên ăn gì để kiểm soát đường huyết?',
          'Lần tái khám tiếp theo khi nào?',
        ],
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown'
      return NextResponse.json({ error: msg }, { status: 500 })
    }
  }

  // Production mode — Claude API integration
  // TODO: wire up Anthropic SDK with system prompt + medical context
  return NextResponse.json({ error: 'AI chat chưa khả dụng production' }, { status: 503 })
}
