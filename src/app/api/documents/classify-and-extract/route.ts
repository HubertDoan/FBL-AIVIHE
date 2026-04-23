// POST /api/documents/classify-and-extract
// Production: dùng Claude Vision OCR để nhận diện và trích xuất dữ liệu từ ảnh/tài liệu thật.
// Demo: suy luận từ tên file + trả mock data.

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import { callClaudeVision } from '@/lib/ai/claude-client'
import { createServiceClient, createClient } from '@/lib/supabase/server'
import { getDocumentUrl } from '@/lib/supabase/storage'

type Category = 'family-doctor' | 'rehab' | 'clinic' | 'daycare'

interface ClassifyResult {
  category: Category
  category_label: string
  confidence: number
  extracted_patient_name: string
  extracted_date: string | null
  extracted_facility: string | null
  extracted_doctor: string | null
  extracted_diagnosis: string | null
  extracted_specialty: string | null
  extracted_reason: string | null
  extracted_tests: string[]
  extracted_medications: string[]
  extracted_recommendations: string[]
  raw_text_preview: string
}

const CATEGORY_LABELS: Record<Category, string> = {
  'family-doctor': 'Bác sĩ gia đình',
  rehab: 'Phục hồi chức năng',
  clinic: 'Khám chữa bệnh chuyên khoa',
  daycare: 'Daycare',
}

const VISION_SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

/** Rule-based fallback — dựa trên filename keywords */
function classifyByFilename(filename: string): Category {
  const lower = filename.toLowerCase()
  if (/phcn|rehab|tri[ -]?li[eê]u|ph[uụ]c[ -]?h[oồ]i/.test(lower)) return 'rehab'
  if (/daycare|sinh[ -]?ho[aạ]t|check[ -]?in/.test(lower)) return 'daycare'
  if (/bsgd|bs[ -]?gia[ -]?d[iì]nh|family[ -]?doctor|kham[ -]?t[uư][ -]?v[aấ]n/.test(lower)) return 'family-doctor'
  if (/xquang|xn |xet[ -]?nghi[eệ]m|sieu[ -]?am|mri|ct[ -]|ket[ -]?qua|benh[ -]?vien|bv[ -]|chuy[eê]n[ -]?khoa|huyet|mau[ -]|sinh[ -]?hoa/.test(lower)) return 'clinic'
  return 'clinic'
}

function buildOcrPrompt(customerName: string) {
  const system = `Bạn là AI chuyên đọc tài liệu y tế tiếng Việt. Nhiệm vụ: trích xuất thông tin từ ảnh tài liệu y tế và trả về JSON thuần túy (không có markdown, không có code block).`

  const user = `Đọc tài liệu y tế trong ảnh và trả về JSON với cấu trúc sau (tất cả giá trị đều là string hoặc array of string, null nếu không tìm thấy):

{
  "category": "clinic" | "family-doctor" | "rehab" | "daycare",
  "category_label": "tên loại tài liệu tiếng Việt",
  "confidence": 0.0-1.0,
  "extracted_patient_name": "họ tên bệnh nhân",
  "extracted_date": "YYYY-MM-DD hoặc null",
  "extracted_facility": "tên cơ sở y tế",
  "extracted_doctor": "tên bác sĩ/kỹ thuật viên",
  "extracted_diagnosis": "chẩn đoán hoặc mục đích khám",
  "extracted_specialty": "chuyên khoa",
  "extracted_reason": "lý do khám",
  "extracted_tests": ["TÊN XÉT NGHIỆM::KẾT QUẢ::ĐƠN VỊ::THAM CHIẾU", ...],
  "extracted_medications": ["thuốc: liều dùng", ...],
  "extracted_recommendations": ["hướng dẫn 1", ...],
  "raw_text_preview": "tóm tắt nội dung chính tối đa 200 ký tự"
}

Phân loại category:
- "clinic": xét nghiệm, X-quang, siêu âm, MRI, CT, kết quả, bệnh viện, phòng khám chuyên khoa
- "family-doctor": khám tổng quát, BS gia đình, tư vấn sức khỏe
- "rehab": vật lý trị liệu, PHCN, phục hồi chức năng
- "daycare": sinh hoạt ngày, check-in, hoạt động

Tên bệnh nhân mặc định nếu không đọc được: "${customerName}".
Trả về JSON thuần túy, không giải thích thêm.`

  return { system, user }
}

/** Claude Vision OCR thật — dùng documentId để lấy file từ storage */
async function classifyWithVision(documentId: string, customerName: string): Promise<ClassifyResult | null> {
  try {
    const svc = await createServiceClient()
    const { data: doc } = await svc
      .from('source_documents')
      .select('file_url, file_type, original_filename')
      .eq('id', documentId)
      .single()

    if (!doc) return null

    const mimeType = doc.file_type || 'image/jpeg'
    if (!VISION_SUPPORTED_TYPES.includes(mimeType)) return null // PDF/HEIC: fallback

    const signedUrl = await getDocumentUrl(svc, doc.file_url)
    const response = await fetch(signedUrl)
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    const { system, user } = buildOcrPrompt(customerName)
    const rawResponse = await callClaudeVision(base64, mimeType, system, user)

    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0]) as ClassifyResult
    if (!parsed.category || !CATEGORY_LABELS[parsed.category]) {
      parsed.category = classifyByFilename(doc.original_filename || '')
    }
    parsed.category_label = CATEGORY_LABELS[parsed.category]
    return parsed
  } catch {
    return null
  }
}

/** Mock extraction cho demo */
function generateMockExtraction(category: Category, filename: string, customerName: string): ClassifyResult {
  const today = new Date().toISOString().slice(0, 10)
  const base: ClassifyResult = {
    category,
    category_label: CATEGORY_LABELS[category],
    confidence: 0.75 + Math.random() * 0.2,
    extracted_patient_name: customerName,
    extracted_date: today,
    extracted_facility: null,
    extracted_doctor: null,
    extracted_diagnosis: null,
    extracted_specialty: null,
    extracted_reason: null,
    extracted_tests: [],
    extracted_medications: [],
    extracted_recommendations: [],
    raw_text_preview: `[Demo] AI đã trích xuất nội dung từ "${filename}".`,
  }
  if (category === 'clinic') {
    return { ...base, extracted_facility: 'Bệnh viện đa khoa', extracted_doctor: 'BS. Phạm Văn Đức', extracted_specialty: 'Cơ xương khớp', extracted_diagnosis: 'Khám định kỳ', extracted_reason: 'Kiểm tra sức khỏe', extracted_tests: ['X-quang', 'Xét nghiệm máu cơ bản'] }
  }
  if (category === 'family-doctor') {
    return { ...base, extracted_facility: 'Phòng khám BS gia đình Thong Dong', extracted_doctor: 'BS. Nguyễn Hải', extracted_diagnosis: 'Khám định kỳ', extracted_reason: 'Theo dõi sức khỏe tổng quát', extracted_medications: ['Vitamin D3 1000IU/ngày'] }
  }
  if (category === 'rehab') {
    return { ...base, extracted_facility: 'Thong Dong Daycare — khu PHCN', extracted_doctor: 'KTV Trần Minh', extracted_diagnosis: 'Trị liệu vận động' }
  }
  return { ...base, extracted_facility: 'Thong Dong Daycare HaPu', extracted_reason: 'Ghi nhận hoạt động hằng ngày' }
}

export async function POST(request: NextRequest) {
  try {
    let customerName = 'Khách hàng'
    const body = await request.json()
    const filename: string = body.filename || 'unnamed'
    const documentId: string | null = body.document_id || null

    if (isDemoMode()) {
      const user = await getDemoUser(request)
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      customerName = body.customer_name || user.fullName || customerName
      const category = classifyByFilename(filename)
      const result = generateMockExtraction(category, filename, customerName)
      return NextResponse.json({ ok: true, result })
    }

    // Production: auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Lấy tên bệnh nhân từ citizens
    const { data: citizen } = await supabase.from('citizens').select('full_name').eq('id', user.id).single()
    customerName = body.customer_name || citizen?.full_name || customerName

    // Thử OCR với Claude Vision nếu có documentId + API key
    if (documentId && process.env.ANTHROPIC_API_KEY) {
      const visionResult = await classifyWithVision(documentId, customerName)
      if (visionResult) {
        return NextResponse.json({ ok: true, result: visionResult })
      }
    }

    // Fallback: phân loại theo tên file
    const category = classifyByFilename(filename)
    const result: ClassifyResult = {
      category,
      category_label: CATEGORY_LABELS[category],
      confidence: 0.5,
      extracted_patient_name: customerName,
      extracted_date: null,
      extracted_facility: null,
      extracted_doctor: null,
      extracted_diagnosis: null,
      extracted_specialty: null,
      extracted_reason: null,
      extracted_tests: [],
      extracted_medications: [],
      extracted_recommendations: [],
      raw_text_preview: `Phân loại theo tên file "${filename}". Vui lòng kiểm tra và điều chỉnh.`,
    }
    return NextResponse.json({ ok: true, result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
