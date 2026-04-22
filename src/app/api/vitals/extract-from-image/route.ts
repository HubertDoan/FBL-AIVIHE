// API: POST upload ảnh máy đo (HA, đường huyết, máy cân...) → Claude Vision OCR
// Trả về extracted data + UPLOAD ảnh vào Supabase Storage để lưu nguồn gốc

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { validateUploadedFile } from '@/lib/security/file-upload-magic-byte-validator'
import {
  checkRateLimit,
  getClientIp,
} from '@/lib/security/rate-limit-upstash-sliding-window'

const SYSTEM_PROMPT = `Bạn là AI assistant chuyên đọc màn hình thiết bị y tế gia đình.

Nhiệm vụ: Phân tích ảnh chụp màn hình máy đo (huyết áp / đường huyết / cân điện tử / nhiệt kế) và trích xuất các chỉ số y tế.

Trả về JSON duy nhất với schema:
{
  "indicator_type": "blood_pressure" | "blood_glucose" | "weight" | "height" | "heart_rate" | "spo2" | "temperature",
  "value": object,
  "unit": string,
  "measured_at": "ISO_DATE_OR_NULL",
  "confidence": "high" | "medium" | "low",
  "notes": string
}

Schema cho 'value':
- blood_pressure: { sys: number, dia: number, pulse: number }
- blood_glucose: { value: number }
- weight/height: { value: number }
- heart_rate: { value: number }
- spo2: { value: number }
- temperature: { value: number }

Quy tắc:
- Nếu thấy SYS/DIA/PULSE → blood_pressure
- Nếu thấy mg/dL hoặc Glucose → blood_glucose
- KHÔNG đoán giá trị. Nếu không đọc được → trả về { "error": "Không đọc được chỉ số từ ảnh" }
- Chỉ trả JSON, không markdown.`

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI service chưa cấu hình' }, { status: 503 })
  }

  try {
    // Rate limit: 20 OCR calls/day/IP (Anthropic API cost control)
    const clientIp = getClientIp(request)
    const limited = await checkRateLimit('aiOcrByUser', clientIp)
    if (limited) return limited

    const formData = await request.formData()
    const file = formData.get('image') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Thiếu ảnh' }, { status: 400 })
    }

    // Hardened validation — magic byte verify (chặn spoofing/malware)
    type MediaType = 'image/jpeg' | 'image/png' | 'image/webp'
    const ALLOWED: MediaType[] = ['image/jpeg', 'image/png', 'image/webp']
    const validation = await validateUploadedFile(file, {
      maxBytes: 10 * 1024 * 1024,
      allowedMimes: ALLOWED,
    })
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    const mediaType = validation.detectedMime as MediaType

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')

    // Run AI OCR + Storage upload in parallel
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const ocrPromise = anthropic.messages.create({
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

    // Upload image to Supabase Storage để lưu nguồn gốc minh chứng
    let source_image_url: string | null = null
    try {
      const { createServiceClient } = await import('@/lib/supabase/server')
      const supabase = await createServiceClient()
      const { data: { user } } = await supabase.auth.getUser()
      const citizenId = user?.id || 'anonymous'

      const ext = mediaType.split('/')[1] || 'jpg'
      const filename = `${citizenId}/vital-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const { error: upErr } = await supabase.storage.from('documents').upload(filename, buffer, {
        contentType: mediaType, cacheControl: '3600', upsert: false,
      })
      if (!upErr) {
        const { data: pub } = supabase.storage.from('documents').getPublicUrl(filename)
        source_image_url = pub.publicUrl
      } else {
        console.warn('[vitals/extract] Storage upload failed:', upErr.message)
      }
    } catch (err) {
      console.warn('[vitals/extract] Storage error:', (err as Error).message)
    }

    const response = await ocrPromise
    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'Không nhận được phản hồi AI' }, { status: 502 })
    }
    const text = textBlock.text.trim()

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
      return NextResponse.json({ error: extracted.error, source_image_url }, { status: 422 })
    }

    return NextResponse.json({ ok: true, extracted, source_image_url })
  } catch (err) {
    console.error('[vitals/extract] error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
