// API: POST upload ảnh máy đo (HA, đường huyết, máy cân...) → Claude Vision OCR
// → extract giá trị + map đúng indicator_type → trả về JSON gợi ý cho UI

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `Bạn là AI assistant chuyên đọc màn hình thiết bị y tế gia đình.

Nhiệm vụ: Phân tích ảnh chụp màn hình máy đo (huyết áp / đường huyết / cân điện tử / nhiệt kế) và trích xuất các chỉ số y tế.

Trả về JSON duy nhất với schema:
{
  "indicator_type": "blood_pressure" | "blood_glucose" | "weight" | "height" | "heart_rate" | "spo2" | "temperature",
  "value": object,            // tùy indicator_type, xem dưới
  "unit": string,             // ví dụ "mmHg", "mg/dL", "kg", "cm", "bpm", "%", "°C"
  "measured_at": "ISO_DATE_OR_NULL",  // nếu thấy timestamp trên màn hình, dùng ISO; nếu không, null
  "confidence": "high" | "medium" | "low",
  "notes": string             // ghi chú giải thích thêm cho user (vd: "Đã đọc 2 chỉ số HA + nhịp tim từ máy Omron")
}

Schema cho 'value' theo từng indicator_type:
- blood_pressure: { sys: number, dia: number, pulse: number }   (mmHg, mmHg, lần/phút)
- blood_glucose: { value: number }                              (mg/dL hoặc mmol/L — auto-detect từ unit)
- weight: { value: number }                                     (kg)
- height: { value: number }                                     (cm)
- heart_rate: { value: number }                                 (bpm)
- spo2: { value: number }                                       (%)
- temperature: { value: number }                                (°C)

Quy tắc:
- Nếu thấy SYS/DIA/PULSE → blood_pressure
- Nếu thấy mg/dL hoặc Glucose → blood_glucose
- Nếu thấy kg/lbs → weight
- Nếu confidence thấp (chữ mờ, ảnh kém), báo confidence: "low" và notes giải thích
- KHÔNG đoán giá trị. Nếu không đọc được → trả về { "error": "Không đọc được chỉ số từ ảnh" }
- Chỉ trả JSON, không markdown, không giải thích thêm.`

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI service chưa cấu hình' }, { status: 503 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Thiếu ảnh' }, { status: 400 })
    }

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')
    const mediaTypeRaw = file.type || 'image/jpeg'
    type MediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
    const VALID_MEDIA: MediaType[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const mediaType: MediaType = VALID_MEDIA.includes(mediaTypeRaw as MediaType)
      ? mediaTypeRaw as MediaType
      : 'image/jpeg'

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: 'Hãy đọc màn hình máy đo này và trích xuất chỉ số. Trả JSON theo schema.' },
        ],
      }],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'Không nhận được phản hồi AI' }, { status: 502 })
    }
    const text = textBlock.text.trim()

    // Try parse JSON (Claude có thể wrap trong ```json ... ```)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI không trả JSON hợp lệ', raw: text }, { status: 502 })
    }
    let extracted
    try {
      extracted = JSON.parse(jsonMatch[0])
    } catch {
      return NextResponse.json({ error: 'JSON parse lỗi', raw: text }, { status: 502 })
    }

    if (extracted.error) {
      return NextResponse.json({ error: extracted.error }, { status: 422 })
    }

    return NextResponse.json({ ok: true, extracted })
  } catch (err) {
    console.error('[vitals/extract] error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
