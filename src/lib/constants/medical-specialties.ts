export interface MedicalSpecialty {
  id: string
  name: string
}

export const MEDICAL_SPECIALTIES: MedicalSpecialty[] = [
  { id: 'cardiology', name: 'Tim mạch' },
  { id: 'endocrinology', name: 'Nội tiết' },
  { id: 'gastroenterology', name: 'Tiêu hóa' },
  { id: 'neurology', name: 'Thần kinh' },
  { id: 'pulmonology', name: 'Hô hấp' },
  { id: 'rheumatology', name: 'Cơ xương khớp' },
  { id: 'dermatology', name: 'Da liễu' },
  { id: 'ent', name: 'Tai mũi họng' },
  { id: 'ophthalmology', name: 'Mắt' },
  { id: 'dentistry', name: 'Răng hàm mặt' },
  { id: 'nephrology', name: 'Thận - Tiết niệu' },
  { id: 'obstetrics', name: 'Sản phụ khoa' },
  { id: 'pediatrics', name: 'Nhi khoa' },
  { id: 'oncology', name: 'Ung bướu' },
  { id: 'rehabilitation', name: 'Phục hồi chức năng' },
  { id: 'psychiatry', name: 'Tâm thần' },
] as const

/**
 * Get specialty name by id.
 */
export function getSpecialtyName(id: string): string | undefined {
  return MEDICAL_SPECIALTIES.find((s) => s.id === id)?.name
}

/**
 * Flat list of specialty names for use in dropdowns / selects.
 */
export const SPECIALTY_NAMES = MEDICAL_SPECIALTIES.map((s) => s.name)
