import { z } from 'zod'

// ─── Extraction Status ───────────────────────────────────────────────────────

const EXTRACTION_STATUSES = ['pending', 'confirmed', 'rejected'] as const

const EVENT_TYPES = [
  'visit',
  'lab_result',
  'medication',
  'vaccination',
  'diagnosis',
  'imaging',
  'vital_sign',
  'lifestyle',
  'document_upload',
  'other',
] as const

const RECORD_CATEGORIES = [
  'hematology',
  'biochemistry',
  'immunology',
  'urinalysis',
  'imaging',
  'vital_signs',
  'diagnosis',
  'medication',
  'other',
] as const

// ─── Extracted Record Schema ─────────────────────────────────────────────────

export const extractedRecordSchema = z.object({
  documentId: z.string().uuid('ID tài liệu không hợp lệ.'),
  fieldName: z.string().min(1, 'Tên trường không được để trống.'),
  fieldValue: z.string().nullable(),
  unit: z.string().nullable(),
  referenceRange: z.string().nullable(),
  confidenceScore: z
    .number()
    .min(0, 'Độ tin cậy tối thiểu là 0.')
    .max(1, 'Độ tin cậy tối đa là 1.')
    .nullable(),
  aiModel: z.string().min(1, 'Tên model AI không được để trống.'),
  status: z.enum(EXTRACTION_STATUSES).default('pending'),
})

// ─── Confirmed Record Schema ─────────────────────────────────────────────────

export const confirmedRecordSchema = z.object({
  extractedRecordId: z.string().uuid('ID bản ghi trích xuất không hợp lệ.'),
  citizenId: z.string().uuid('ID công dân không hợp lệ.'),
  confirmedValue: z.string().min(1, 'Giá trị xác nhận không được để trống.'),
  confirmedUnit: z.string().nullable(),
  recordDate: z.string().nullable(),
  category: z.enum(RECORD_CATEGORIES).nullable(),
})

// ─── Health Event Schema ─────────────────────────────────────────────────────

export const healthEventSchema = z.object({
  citizenId: z.string().uuid('ID công dân không hợp lệ.'),
  eventType: z.enum(EVENT_TYPES),
  occurredAt: z.string().min(1, 'Ngày sự kiện không được để trống.'),
  title: z
    .string()
    .min(1, 'Tiêu đề không được để trống.')
    .max(200, 'Tiêu đề tối đa 200 ký tự.'),
  description: z
    .string()
    .max(2000, 'Mô tả tối đa 2000 ký tự.')
    .nullable(),
  sourceDocumentId: z.string().uuid().nullable(),
  metadata: z.record(z.string(), z.unknown()).default({}),
})

// ─── Update Extraction Status ────────────────────────────────────────────────

export const updateExtractionStatusSchema = z.object({
  recordId: z.string().uuid('ID bản ghi không hợp lệ.'),
  status: z.enum(EXTRACTION_STATUSES),
})

// ─── Exported Types ──────────────────────────────────────────────────────────

export type ExtractedRecordInput = z.infer<typeof extractedRecordSchema>
export type ConfirmedRecordInput = z.infer<typeof confirmedRecordSchema>
export type HealthEventInput = z.infer<typeof healthEventSchema>
export type UpdateExtractionStatusInput = z.infer<typeof updateExtractionStatusSchema>
