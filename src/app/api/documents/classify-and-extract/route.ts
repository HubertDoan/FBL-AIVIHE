// POST /api/documents/classify-and-extract
// Nhận filename + content hint, trả về category (daycare/family-doctor/rehab/clinic)
// + extracted patient name + key fields (demo mock)
//
// Production: gọi Claude Vision API để classify + extract thật.
// Demo: suy luận từ tên file + trả mock data để user kiểm tra.

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'

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

/** Rule-based classifier — dựa trên filename keywords */
function classifyByFilename(filename: string): Category {
  const lower = filename.toLowerCase()
  if (/phcn|rehab|tri[ -]?li[eê]u|ph[uụ]c[ -]?h[oồ]i/.test(lower)) return 'rehab'
  if (/daycare|sinh[ -]?ho[aạ]t|check[ -]?in/.test(lower)) return 'daycare'
  if (/bsgd|bs[ -]?gia[ -]?d[iì]nh|family[ -]?doctor|kham[ -]?t[uư][ -]?v[aấ]n/.test(lower)) return 'family-doctor'
  // X-quang / siêu âm / xét nghiệm / kết quả / BV → chuyên khoa
  if (/xquang|xet[ -]?nghi[eệ]m|sieu[ -]?am|mri|ct|ket[ -]?qua|benh[ -]?vien|bv[ -]?|chuy[eê]n[ -]?khoa|tim[ -]?m[aạ]ch|khop|co[ -]?xuong/.test(lower)) return 'clinic'
  // Default
  return 'clinic'
}

/** Mock extracted fields — thực tế sẽ từ Claude Vision OCR */
function generateMockExtraction(category: Category, filename: string, customerName: string): ClassifyResult {
  const today = new Date().toISOString().slice(0, 10)
  const base = {
    category,
    category_label: CATEGORY_LABELS[category],
    confidence: 0.75 + Math.random() * 0.2,
    extracted_patient_name: customerName, // Demo: assume đúng tên KH
    extracted_date: today,
    extracted_tests: [] as string[],
    extracted_medications: [] as string[],
    extracted_recommendations: [] as string[],
    raw_text_preview: `[Mock] AI đã trích xuất nội dung từ "${filename}". Trong môi trường production, đây sẽ là đoạn text thật từ Claude Vision OCR.`,
  }

  if (category === 'clinic') {
    return {
      ...base,
      extracted_facility: 'Bệnh viện Phục hồi chức năng Hà Nội',
      extracted_doctor: 'BS. Phạm Văn Đức',
      extracted_specialty: 'Cơ xương khớp',
      extracted_diagnosis: 'Chưa có chẩn đoán rõ — cần BS xem xét',
      extracted_reason: 'Kiểm tra định kỳ',
      extracted_tests: ['X-quang', 'Xét nghiệm máu cơ bản'],
      extracted_medications: [],
      extracted_recommendations: ['Tái khám sau 3 tháng'],
    }
  }
  if (category === 'family-doctor') {
    return {
      ...base,
      extracted_facility: 'Phòng khám BS gia đình Thong Dong',
      extracted_doctor: 'BS. Nguyễn Hải',
      extracted_specialty: null,
      extracted_diagnosis: 'Khám định kỳ',
      extracted_reason: 'Theo dõi sức khỏe tổng quát',
      extracted_tests: [],
      extracted_medications: ['Vitamin D3 1000IU/ngày'],
      extracted_recommendations: ['Giữ chế độ ăn uống hợp lý', 'Tập thể dục nhẹ 30 phút/ngày'],
    }
  }
  if (category === 'rehab') {
    return {
      ...base,
      extracted_facility: 'Trung tâm Thong Dong Daycare — khu PHCN',
      extracted_doctor: 'KTV Trần Minh',
      extracted_specialty: null,
      extracted_diagnosis: 'Trị liệu vận động',
      extracted_reason: 'Buổi trị liệu định kỳ',
      extracted_tests: [],
      extracted_medications: [],
      extracted_recommendations: ['Tập bài tập tại nhà 2 lần/ngày'],
    }
  }
  // daycare
  return {
    ...base,
    extracted_facility: 'Thong Dong Daycare HaPu',
    extracted_doctor: null,
    extracted_specialty: null,
    extracted_diagnosis: null,
    extracted_reason: 'Ghi nhận hoạt động hằng ngày',
  }
}

export async function POST(request: NextRequest) {
  if (!isDemoMode()) {
    return NextResponse.json(
      { error: 'AI classify chưa khả dụng ở production (cần Claude API key).' },
      { status: 503 }
    )
  }

  const user = await getDemoUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const filename: string = body.filename || 'unnamed'
    const customerName: string = body.customer_name || user.fullName || 'Khách hàng'

    const category = classifyByFilename(filename)
    const result = generateMockExtraction(category, filename, customerName)

    return NextResponse.json({ ok: true, result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
