import { z } from 'zod'

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
] as const

const DOCUMENT_TYPES = [
  'lab_report',
  'prescription',
  'imaging',
  'discharge_summary',
  'vaccination_record',
  'medical_certificate',
  'referral',
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

// ─── Upload Schema ───────────────────────────────────────────────────────────

export const uploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= MAX_FILE_SIZE, {
      message: 'Kích thước tệp tối đa là 10MB.',
    })
    .refine(
      (f) => (ALLOWED_FILE_TYPES as readonly string[]).includes(f.type),
      {
        message:
          'Định dạng tệp không hỗ trợ. Chấp nhận: JPEG, PNG, WebP, GIF, PDF.',
      }
    ),
  citizenId: z.string().uuid('ID công dân không hợp lệ.'),
  notes: z.string().max(500, 'Ghi chú tối đa 500 ký tự.').optional(),
})

// ─── Extraction Result Schema (validates AI output) ──────────────────────────

export const extractedFieldSchema = z.object({
  fieldName: z.string().min(1, 'Tên trường không được để trống.'),
  fieldValue: z.string(),
  unit: z.string().nullable(),
  referenceRange: z.string().nullable(),
  category: z.enum(RECORD_CATEGORIES),
  confidence: z
    .number()
    .min(0, 'Độ tin cậy tối thiểu là 0.')
    .max(1, 'Độ tin cậy tối đa là 1.'),
})

export const documentInfoSchema = z.object({
  date: z.string().nullable(),
  facility: z.string().nullable(),
  doctor: z.string().nullable(),
  documentType: z.enum(DOCUMENT_TYPES),
})

export const extractionResultSchema = z.object({
  documentInfo: documentInfoSchema,
  records: z.array(extractedFieldSchema),
})

// ─── Confirm Record Schema (user confirming extracted data) ──────────────────

export const confirmRecordSchema = z.object({
  extractedRecordId: z.string().uuid('ID bản ghi không hợp lệ.'),
  confirmedValue: z.string().min(1, 'Giá trị xác nhận không được để trống.'),
  confirmedUnit: z.string().nullable(),
  recordDate: z.string().nullable(),
  category: z.string().nullable(),
})

export const confirmBatchSchema = z.object({
  citizenId: z.string().uuid('ID công dân không hợp lệ.'),
  records: z
    .array(confirmRecordSchema)
    .min(1, 'Cần ít nhất 1 bản ghi để xác nhận.'),
})

// ─── Classification Result Schema (validates AI classification output) ───────

export const classificationResultSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPES),
  documentDate: z.string().nullable(),
  facilityName: z.string().nullable(),
  confidence: z.number().min(0).max(1),
})

// ─── Exported Types ──────────────────────────────────────────────────────────

export type UploadInput = z.infer<typeof uploadSchema>
export type ExtractionResultInput = z.infer<typeof extractionResultSchema>
export type ConfirmRecordInput = z.infer<typeof confirmRecordSchema>
export type ConfirmBatchInput = z.infer<typeof confirmBatchSchema>
export type ClassificationResultInput = z.infer<typeof classificationResultSchema>
