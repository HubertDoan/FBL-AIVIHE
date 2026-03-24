export interface LabTestType {
  name: string
  code: string
  unit: string
  reference_range_text: string
  category: LabTestCategory
}

export type LabTestCategory =
  | 'hematology'
  | 'biochemistry'
  | 'immunology'
  | 'urinalysis'

export const LAB_TEST_CATEGORIES: Record<LabTestCategory, string> = {
  hematology: 'Huyết học',
  biochemistry: 'Sinh hóa',
  immunology: 'Miễn dịch',
  urinalysis: 'Nước tiểu',
}

export const LAB_TEST_TYPES: LabTestType[] = [
  // ── Huyết học ───────────────────────────────────────────────────────────
  { name: 'Công thức máu (CBC)', code: 'CBC', unit: '', reference_range_text: 'Tổng hợp', category: 'hematology' },
  { name: 'Bạch cầu (WBC)', code: 'WBC', unit: 'G/L', reference_range_text: '4.0 - 10.0', category: 'hematology' },
  { name: 'Hồng cầu (RBC)', code: 'RBC', unit: 'T/L', reference_range_text: 'Nam: 4.5-5.5 | Nữ: 3.8-4.8', category: 'hematology' },
  { name: 'Hemoglobin (Hb)', code: 'HGB', unit: 'g/dL', reference_range_text: 'Nam: 13-17 | Nữ: 12-16', category: 'hematology' },
  { name: 'Hematocrit (Hct)', code: 'HCT', unit: '%', reference_range_text: 'Nam: 40-50 | Nữ: 36-44', category: 'hematology' },
  { name: 'Tiểu cầu (PLT)', code: 'PLT', unit: 'G/L', reference_range_text: '150 - 400', category: 'hematology' },

  // ── Sinh hóa ────────────────────────────────────────────────────────────
  { name: 'Glucose', code: 'GLU', unit: 'mmol/L', reference_range_text: '3.9 - 6.4', category: 'biochemistry' },
  { name: 'HbA1c', code: 'HBA1C', unit: '%', reference_range_text: '< 5.7 (bình thường)', category: 'biochemistry' },
  { name: 'Cholesterol toàn phần', code: 'CHOL', unit: 'mmol/L', reference_range_text: '< 5.2', category: 'biochemistry' },
  { name: 'Triglyceride', code: 'TG', unit: 'mmol/L', reference_range_text: '< 1.7', category: 'biochemistry' },
  { name: 'HDL-Cholesterol', code: 'HDL', unit: 'mmol/L', reference_range_text: '> 1.0 (nam) | > 1.2 (nữ)', category: 'biochemistry' },
  { name: 'LDL-Cholesterol', code: 'LDL', unit: 'mmol/L', reference_range_text: '< 3.4', category: 'biochemistry' },
  { name: 'AST (SGOT)', code: 'AST', unit: 'U/L', reference_range_text: '< 40', category: 'biochemistry' },
  { name: 'ALT (SGPT)', code: 'ALT', unit: 'U/L', reference_range_text: '< 40', category: 'biochemistry' },
  { name: 'GGT', code: 'GGT', unit: 'U/L', reference_range_text: 'Nam: < 60 | Nữ: < 40', category: 'biochemistry' },
  { name: 'Bilirubin toàn phần', code: 'TBIL', unit: 'µmol/L', reference_range_text: '5.1 - 17.0', category: 'biochemistry' },
  { name: 'Creatinin', code: 'CREA', unit: 'µmol/L', reference_range_text: 'Nam: 62-106 | Nữ: 44-80', category: 'biochemistry' },
  { name: 'Ure', code: 'UREA', unit: 'mmol/L', reference_range_text: '2.5 - 7.5', category: 'biochemistry' },
  { name: 'Acid Uric', code: 'UA', unit: 'µmol/L', reference_range_text: 'Nam: 200-430 | Nữ: 140-360', category: 'biochemistry' },
  { name: 'Albumin', code: 'ALB', unit: 'g/L', reference_range_text: '35 - 52', category: 'biochemistry' },
  { name: 'Protein toàn phần', code: 'TP', unit: 'g/L', reference_range_text: '64 - 83', category: 'biochemistry' },
  { name: 'Canxi', code: 'CA', unit: 'mmol/L', reference_range_text: '2.15 - 2.55', category: 'biochemistry' },

  // ── Miễn dịch ───────────────────────────────────────────────────────────
  { name: 'HBsAg (Viêm gan B)', code: 'HBSAG', unit: '', reference_range_text: 'Âm tính', category: 'immunology' },
  { name: 'Anti-HCV (Viêm gan C)', code: 'ANTIHCV', unit: '', reference_range_text: 'Âm tính', category: 'immunology' },
  { name: 'Anti-HIV', code: 'ANTIHIV', unit: '', reference_range_text: 'Âm tính', category: 'immunology' },

  // ── Nước tiểu ───────────────────────────────────────────────────────────
  { name: 'pH nước tiểu', code: 'UPH', unit: '', reference_range_text: '4.5 - 8.0', category: 'urinalysis' },
  { name: 'Protein niệu', code: 'UPRO', unit: '', reference_range_text: 'Âm tính', category: 'urinalysis' },
  { name: 'Glucose niệu', code: 'UGLU', unit: '', reference_range_text: 'Âm tính', category: 'urinalysis' },
  { name: 'Bạch cầu niệu', code: 'UWBC', unit: '/µL', reference_range_text: '< 10', category: 'urinalysis' },
  { name: 'Hồng cầu niệu', code: 'URBC', unit: '/µL', reference_range_text: '< 5', category: 'urinalysis' },
] as const

/**
 * Look up a lab test definition by code.
 */
export function getLabTestByCode(code: string): LabTestType | undefined {
  return LAB_TEST_TYPES.find((t) => t.code === code)
}

/**
 * Filter lab tests by category.
 */
export function getLabTestsByCategory(category: LabTestCategory): LabTestType[] {
  return LAB_TEST_TYPES.filter((t) => t.category === category)
}
