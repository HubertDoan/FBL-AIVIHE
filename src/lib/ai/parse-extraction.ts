import { z } from 'zod'

// ─── Schema for a single extracted record ────────────────────────────────────

const extractedFieldSchema = z.object({
  fieldName: z.string().min(1),
  fieldValue: z.string(),
  unit: z.string().nullable(),
  referenceRange: z.string().nullable(),
  category: z.enum([
    'hematology',
    'biochemistry',
    'immunology',
    'urinalysis',
    'imaging',
    'vital_signs',
    'diagnosis',
    'medication',
    'other',
  ]),
  confidence: z.number().min(0).max(1),
})

const documentInfoSchema = z.object({
  date: z.string().nullable(),
  facility: z.string().nullable(),
  doctor: z.string().nullable(),
  documentType: z.enum([
    'lab_report',
    'prescription',
    'imaging',
    'discharge_summary',
    'vaccination_record',
    'medical_certificate',
    'referral',
    'other',
  ]),
})

const extractionResponseSchema = z.object({
  documentInfo: documentInfoSchema,
  records: z.array(extractedFieldSchema),
})

// ─── Exported types ──────────────────────────────────────────────────────────

export type ExtractionResult = z.infer<typeof extractionResponseSchema>
export type ExtractedField = z.infer<typeof extractedFieldSchema>
export type DocumentInfo = z.infer<typeof documentInfoSchema>

// ─── Parser ──────────────────────────────────────────────────────────────────

/**
 * Parse Claude's raw response into a typed ExtractionResult.
 * Handles markdown code blocks and validates with Zod.
 */
export function parseExtractionResponse(rawResponse: string): ExtractionResult {
  const jsonString = extractJsonFromResponse(rawResponse)

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    throw new Error(
      'Không thể phân tích phản hồi từ AI. Phản hồi không phải JSON hợp lệ.'
    )
  }

  const result = extractionResponseSchema.safeParse(parsed)

  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 3)
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ')
    throw new Error(
      `Phản hồi AI không đúng định dạng: ${issues}`
    )
  }

  return result.data
}

/**
 * Extract JSON string from a response that may be wrapped in markdown code blocks.
 */
function extractJsonFromResponse(raw: string): string {
  const trimmed = raw.trim()

  // Handle ```json ... ``` or ``` ... ```
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim()
  }

  // Try to find JSON object directly
  const jsonStart = trimmed.indexOf('{')
  const jsonEnd = trimmed.lastIndexOf('}')
  if (jsonStart !== -1 && jsonEnd > jsonStart) {
    return trimmed.slice(jsonStart, jsonEnd + 1)
  }

  return trimmed
}
