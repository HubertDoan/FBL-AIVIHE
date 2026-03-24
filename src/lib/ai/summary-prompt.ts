import type { ConfirmedRecord, Citizen, ChronicDisease } from '@/types/database'

/**
 * Build system + user prompts for health summary generation.
 * Every claim MUST cite source data. Output in plain Vietnamese for elderly users.
 */
export function buildSummaryPrompt(
  confirmedRecords: ConfirmedRecord[],
  citizenProfile: Pick<Citizen, 'full_name' | 'date_of_birth' | 'gender'>,
  chronicDiseases: ChronicDisease[]
): {
  systemPrompt: string
  userPrompt: string
} {
  const systemPrompt = `You are a Vietnamese health data summarization assistant.

TASK: Generate a health summary in Vietnamese based on the provided confirmed medical records.

OUTPUT STRUCTURE (use these exact headings):
## Tổng quan sức khỏe
Brief overview of the person's current health status based on available data.

## Bệnh mạn tính
List chronic diseases with current status and treatment. Skip if none.

## Thuốc đang dùng
List current medications with dosage. Skip if none.

## Xu hướng chỉ số
Notable trends in lab values over time (improving, stable, worsening). Skip if insufficient data.

## Lưu ý
Important observations or values outside reference ranges that the user should be aware of.

CITATION RULES:
1. EVERY claim MUST cite its source: "Theo kết quả xét nghiệm ngày DD/MM/YYYY tại [facility]..."
2. When referencing a specific value, include the exact number and unit.
3. If comparing over time, cite both dates.

HARD RULES:
- NEVER diagnose or prescribe medication.
- NEVER interpret results beyond stating if they are within/outside reference range.
- Use plain Vietnamese that elderly users can understand.
- Avoid medical jargon; if a technical term is needed, explain it in parentheses.
- End with this exact disclaimer:

---
⚠️ **Lưu ý quan trọng:** Thông tin này chỉ mang tính tổng hợp từ dữ liệu bạn cung cấp. AI không chẩn đoán bệnh và không thay thế bác sĩ. Vui lòng tham khảo ý kiến bác sĩ để được tư vấn chuyên môn.`

  const recordsSummary = confirmedRecords.map((r) => ({
    field: r.confirmed_value,
    unit: r.confirmed_unit,
    date: r.record_date,
    category: r.category,
  }))

  const diseaseSummary = chronicDiseases.map((d) => ({
    name: d.disease_name,
    status: d.status,
    treatment: d.current_treatment,
    diagnosedAt: d.diagnosis_date,
  }))

  const userPrompt = `Tạo bản tổng hợp sức khỏe cho bệnh nhân dưới đây.

**Thông tin bệnh nhân:**
- Họ tên: ${citizenProfile.full_name}
- Ngày sinh: ${citizenProfile.date_of_birth ?? 'Không rõ'}
- Giới tính: ${citizenProfile.gender === 'male' ? 'Nam' : citizenProfile.gender === 'female' ? 'Nữ' : 'Khác'}

**Bệnh mạn tính:**
${diseaseSummary.length > 0 ? JSON.stringify(diseaseSummary, null, 2) : 'Không có thông tin'}

**Kết quả xét nghiệm đã xác nhận:**
${JSON.stringify(recordsSummary, null, 2)}

Hãy tổng hợp theo đúng cấu trúc và quy tắc trích dẫn đã hướng dẫn.`

  return { systemPrompt, userPrompt }
}
