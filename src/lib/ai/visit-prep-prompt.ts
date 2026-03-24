import type { ConfirmedRecord, ChronicDisease, Medication } from '@/types/database'

/**
 * Build system + user prompts for visit preparation summaries.
 * Output is structured for both patient and doctor to read.
 */
export function buildVisitPrepPrompt(
  specialty: string,
  symptoms: string[],
  confirmedRecords: ConfirmedRecord[],
  chronicDiseases: ChronicDisease[],
  medications: Medication[]
): {
  systemPrompt: string
  userPrompt: string
} {
  const systemPrompt = `You are a Vietnamese visit preparation assistant.

TASK: Generate a structured visit preparation summary for a patient visiting a specific medical specialty. The summary should be useful for both the patient and the doctor.

OUTPUT STRUCTURE (use these exact headings):
## Lý do khám
Brief description of why the patient is seeking this visit, based on reported symptoms.

## Bệnh nền liên quan
Chronic diseases relevant to the specialty being visited. Include status and current treatment. Cite diagnosis dates.

## Thuốc đang dùng
All current medications with dosage and frequency. Important for the doctor to review drug interactions.

## Chỉ số gần đây
Recent lab values and vital signs relevant to this specialty. Include date of each measurement. Cite source.

## Câu hỏi gợi ý cho bác sĩ
3-5 suggested questions the patient could ask the doctor, based on their data. These should be practical and relevant.

CITATION RULES:
1. Every data point MUST cite its source date and origin.
2. Format: "Theo kết quả ngày DD/MM/YYYY..."
3. For medications: include prescriber if known.

HARD RULES:
- NEVER diagnose or prescribe medication.
- Vietnamese language, clear for both patient and elderly family members.
- Keep each section concise but complete.
- End with this exact disclaimer:

---
⚠️ **Lưu ý quan trọng:** Đây là bản chuẩn bị gợi ý dựa trên dữ liệu bạn cung cấp. AI không chẩn đoán bệnh và không thay thế bác sĩ. Vui lòng mang theo tài liệu gốc khi đi khám.`

  const recentRecords = confirmedRecords.map((r) => ({
    field: r.confirmed_value,
    unit: r.confirmed_unit,
    date: r.record_date,
    category: r.category,
  }))

  const diseaseList = chronicDiseases.map((d) => ({
    name: d.disease_name,
    status: d.status,
    treatment: d.current_treatment,
    diagnosedAt: d.diagnosis_date,
  }))

  const medicationList = medications
    .filter((m) => m.is_active)
    .map((m) => ({
      name: m.drug_name,
      dosage: m.dosage,
      frequency: m.frequency,
      prescribedBy: m.prescribed_by,
    }))

  const userPrompt = `Tạo bản chuẩn bị khám bệnh cho chuyên khoa: **${specialty}**

**Triệu chứng:**
${symptoms.length > 0 ? symptoms.map((s) => `- ${s}`).join('\n') : 'Không có mô tả triệu chứng'}

**Bệnh mạn tính:**
${diseaseList.length > 0 ? JSON.stringify(diseaseList, null, 2) : 'Không có'}

**Thuốc đang dùng:**
${medicationList.length > 0 ? JSON.stringify(medicationList, null, 2) : 'Không có'}

**Chỉ số xét nghiệm gần đây:**
${recentRecords.length > 0 ? JSON.stringify(recentRecords, null, 2) : 'Không có dữ liệu'}

Hãy tạo bản chuẩn bị theo đúng cấu trúc và quy tắc đã hướng dẫn.`

  return { systemPrompt, userPrompt }
}
