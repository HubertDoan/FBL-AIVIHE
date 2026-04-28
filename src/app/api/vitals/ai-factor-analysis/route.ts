// POST /api/vitals/ai-factor-analysis
// Claude phân tích tương quan bối cảnh (thuốc, ăn uống, vận động, tinh thần)
// với sự thay đổi chỉ số sức khỏe → đưa ra nhận xét + gợi ý điều chỉnh

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'

export interface FactorInsight {
  factor: string       // "ăn mặn" | "không vận động" | "căng thẳng" | ...
  factor_type: 'diet' | 'exercise' | 'medication' | 'mental'
  indicator: string    // "blood_pressure" | "blood_glucose" | "weight"
  effect: string       // "+12 mmHg TB so với ngày bình thường"
  direction: 'up' | 'down' | 'neutral'
  confidence: 'high' | 'medium' | 'low'
}

export interface AiFactorAnalysisResult {
  summary: string
  insights: FactorInsight[]
  recommendations: string[]
  records_analyzed: number
  generated_at: string
}

const DEMO_RESULT: AiFactorAnalysisResult = {
  summary: 'Phân tích 12 lần đo trong 4 tuần qua cho thấy huyết áp tăng rõ khi căng thẳng và ăn mặn.',
  insights: [
    { factor: 'Căng thẳng', factor_type: 'mental', indicator: 'blood_pressure', effect: '+18 mmHg TB so với ngày bình thường', direction: 'up', confidence: 'high' },
    { factor: 'Ăn mặn / nhiều muối', factor_type: 'diet', indicator: 'blood_pressure', effect: '+12 mmHg TB', direction: 'up', confidence: 'medium' },
    { factor: 'Vận động nhẹ', factor_type: 'exercise', indicator: 'blood_pressure', effect: '−8 mmHg TB', direction: 'down', confidence: 'medium' },
    { factor: 'Thuốc huyết áp', factor_type: 'medication', indicator: 'blood_pressure', effect: '−15 mmHg khi dùng đúng giờ', direction: 'down', confidence: 'high' },
  ],
  recommendations: [
    'Duy trì thói quen vận động nhẹ 20–30 phút/ngày để hỗ trợ kiểm soát huyết áp.',
    'Giảm lượng muối trong chế độ ăn, ưu tiên thực phẩm tươi, ít chế biến sẵn.',
    'Thực hành các kỹ thuật thở sâu hoặc thiền 5–10 phút trước khi đo huyết áp.',
  ],
  records_analyzed: 12,
  generated_at: new Date().toISOString(),
}

function buildAnalysisPrompt(
  vitalsWithContext: Array<{ indicator_type: string; value: Record<string, number>; measured_at: string; alert_level: string | null; context_notes: Record<string, unknown> | null }>
): string {
  const dataJson = JSON.stringify(vitalsWithContext.slice(0, 60), null, 2)

  return `Phân tích dữ liệu chỉ số sức khỏe dưới đây và tìm mối tương quan giữa bối cảnh (thuốc, ăn uống, vận động, tinh thần) với sự thay đổi chỉ số.

Dữ liệu (JSON, mỗi bản ghi có indicator_type, value, alert_level, context_notes):
${dataJson}

Trả về JSON với cấu trúc sau (không có markdown, không giải thích):
{
  "summary": "1-2 câu tóm tắt xu hướng chính",
  "insights": [
    {
      "factor": "tên yếu tố cụ thể (VD: ăn mặn, vận động nhiều, căng thẳng...)",
      "factor_type": "diet|exercise|medication|mental",
      "indicator": "blood_pressure|blood_glucose|weight|heart_rate",
      "effect": "mô tả hiệu ứng định lượng nếu có (VD: +12 mmHg TB)",
      "direction": "up|down|neutral",
      "confidence": "high|medium|low"
    }
  ],
  "recommendations": ["gợi ý 1", "gợi ý 2", "gợi ý 3"],
  "records_analyzed": <số bản ghi có context_notes>
}

Chỉ đưa insights khi có ít nhất 2 bản ghi cùng yếu tố. Ngắn gọn, thực tiễn, bằng tiếng Việt.`
}

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await new Promise(r => setTimeout(r, 1200)) // simulate delay
    return NextResponse.json({ ok: true, result: DEMO_RESULT })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI chưa được cấu hình' }, { status: 503 })
    }

    // Lấy 90 ngày gần nhất có context_notes
    const { createServiceClient } = await import('@/lib/supabase/server')
    const svc = await createServiceClient()
    const since = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString()

    const { data: vitals } = await svc
      .from('vitals')
      .select('indicator_type, value, measured_at, alert_level, context_notes')
      .eq('citizen_id', user.id)
      .gte('measured_at', since)
      .not('context_notes', 'is', null)
      .order('measured_at', { ascending: false })
      .limit(60)

    const recordsWithContext = vitals ?? []
    if (recordsWithContext.length < 3) {
      return NextResponse.json({
        error: 'Cần ít nhất 3 lần đo có ghi bối cảnh để phân tích. Hãy tiếp tục đo và ghi nhận thêm.',
        code: 'INSUFFICIENT_DATA',
      }, { status: 422 })
    }

    const { callClaudeText } = await import('@/lib/ai/claude-client')
    const rawResponse = await callClaudeText(
      'Bạn là chuyên gia phân tích sức khỏe. Trả về JSON thuần túy, không markdown.',
      buildAnalysisPrompt(recordsWithContext)
    )

    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Claude không trả về JSON hợp lệ')

    const parsed = JSON.parse(jsonMatch[0]) as Omit<AiFactorAnalysisResult, 'generated_at'>
    const result: AiFactorAnalysisResult = {
      ...parsed,
      records_analyzed: recordsWithContext.length,
      generated_at: new Date().toISOString(),
    }

    return NextResponse.json({ ok: true, result })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown' }, { status: 500 })
  }
}
