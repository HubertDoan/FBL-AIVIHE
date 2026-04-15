// Demo data for AIVIHE medical record — 11 sections theo TT 13/2025/TT-BYT
// Port từ AIVIHE_WIDGET_V7 prototype

export interface AdministrativeInfo {
  full_name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
  national_id: string              // CCCD
  phone: string
  address: string
  insurance_number: string | null  // BHYT
  insurance_facility: string | null
  ethnicity: string | null
  occupation: string | null
  emergency_contact: { name: string; phone: string; relation: string } | null
}

export interface AllergyRecord {
  id: string
  type: 'food' | 'drug' | 'environment'
  agent: string                    // "Penicillin", "Tôm", "Phấn hoa"
  severity: 'mild' | 'moderate' | 'severe'
  reaction: string
  noted_at: string
}

export interface IllnessHistory {
  id: string
  condition: string
  since: string                    // "2018" hoặc YYYY-MM
  notes: string
  status: 'active' | 'resolved'
}

export interface FamilyHistory {
  id: string
  relation: string                 // "Cha", "Mẹ"
  condition: string                // "Đái tháo đường type 2"
  note: string
}

export interface VitalSignsRecord {
  id: string
  measured_at: string
  blood_pressure_systolic: number  // mmHg
  blood_pressure_diastolic: number
  pulse: number                    // bpm
  temperature: number              // °C
  respiratory_rate: number         // /min
  weight_kg: number
  height_cm: number
  bmi: number
  spo2: number | null              // %
  consciousness: string            // "Tỉnh táo"
  skin: string                     // "Hồng, ẩm"
  notes: string | null
  source: string                   // "Daycare" / "BSGĐ" / "Home device"
}

export interface OrganSystemExam {
  id: string
  date: string
  system: 'ent' | 'cardiovascular' | 'respiratory' | 'gastrointestinal' | 'neurological' | 'musculoskeletal' | 'skin' | 'psychiatric' | 'gu' | 'other'
  findings: string
  status: 'normal' | 'abnormal' | 'watch'
  examined_by: string
}

export interface ChronicCondition {
  id: string
  condition: string
  icd10: string | null
  since: string
  status: 'active' | 'controlled' | 'remission'
  medications: string[]            // Thuốc đang dùng
  monitoring_frequency: string     // "Hàng tháng"
  notes: string
}

export interface LabResult {
  id: string
  date: string
  category: 'hematology' | 'biochemistry' | 'immunology' | 'urine' | 'stool' | 'microbiology' | 'genetic' | 'other'
  test_name: string
  value: string                    // Text format để support "âm tính", "+++"
  unit: string | null
  reference_range: string | null
  flag: 'H' | 'L' | 'W' | 'N' | null   // High/Low/Watch/Normal
  facility: string
  notes: string | null
}

export interface ImagingResult {
  id: string
  date: string
  modality: 'xray' | 'ct' | 'mri' | 'ultrasound' | 'endoscopy' | 'other'
  body_part: string
  findings: string
  conclusion: string
  status: 'normal' | 'abnormal' | 'severe'
  facility: string
  doctor: string
}

export interface FunctionalTest {
  id: string
  date: string
  test_type: string                // "ECG", "Siêu âm tim", "Spirometry"
  result: string
  status: 'normal' | 'limited' | 'abnormal'
  severity: 'mild' | 'moderate' | 'severe' | null
  facility: string
  notes: string | null
}

export interface Immunization {
  id: string
  vaccine_name: string
  date: string
  dose_number: number
  facility: string
  status: 'completed' | 'partial' | 'pending'
}

export interface MedicalRecord11Sections {
  administrative: AdministrativeInfo | null
  allergies: AllergyRecord[]
  illness_history: IllnessHistory[]
  family_history: FamilyHistory[]
  vital_signs: VitalSignsRecord[]
  organ_exams: OrganSystemExam[]
  chronic_conditions: ChronicCondition[]
  lab_results: LabResult[]
  imaging: ImagingResult[]
  functional_tests: FunctionalTest[]
  immunizations: Immunization[]
}

declare global {
  // eslint-disable-next-line no-var
  var __demoMedicalRecords11: Record<string, MedicalRecord11Sections> | undefined
}

const MINH_ID = 'demo-0001-0000-0000-000000000001'

function seedForMinh(): MedicalRecord11Sections {
  return {
    administrative: {
      full_name: 'Nguyễn Văn Minh',
      date_of_birth: '1955-03-12',
      gender: 'male',
      national_id: '001055123456',
      phone: '0912345678',
      address: 'Thanh Xuân, Hà Nội',
      insurance_number: 'HT4123456789',
      insurance_facility: 'BV Bạch Mai',
      ethnicity: 'Kinh',
      occupation: 'Hưu trí',
      emergency_contact: { name: 'Trần Thị Lan', phone: '0901234002', relation: 'Vợ' },
    },
    allergies: [
      { id: 'al-1', type: 'drug', agent: 'Penicillin', severity: 'severe', reaction: 'Phát ban, khó thở', noted_at: '2010-05-20' },
      { id: 'al-2', type: 'food', agent: 'Tôm', severity: 'moderate', reaction: 'Ngứa, nổi mề đay', noted_at: '2015-08-10' },
    ],
    illness_history: [
      { id: 'ih-1', condition: 'Viêm loét dạ dày', since: '2016', notes: 'Điều trị H.Pylori thành công', status: 'resolved' },
      { id: 'ih-2', condition: 'Sỏi thận', since: '2019', notes: 'Đã tán sỏi ngoại khoa', status: 'resolved' },
    ],
    family_history: [
      { id: 'fh-1', relation: 'Cha', condition: 'Đái tháo đường type 2', note: 'Mất do biến chứng tim mạch' },
      { id: 'fh-2', relation: 'Mẹ', condition: 'Tăng huyết áp', note: 'Điều trị đều' },
    ],
    vital_signs: [
      { id: 'vs-1', measured_at: '2026-04-14T08:00:00+07:00', blood_pressure_systolic: 135, blood_pressure_diastolic: 85, pulse: 78, temperature: 36.8, respiratory_rate: 18, weight_kg: 68, height_cm: 158, bmi: 27.2, spo2: 97, consciousness: 'Tỉnh táo', skin: 'Hồng, ẩm', notes: null, source: 'BSGĐ' },
      { id: 'vs-2', measured_at: '2026-04-13T09:15:00+07:00', blood_pressure_systolic: 125, blood_pressure_diastolic: 80, pulse: 76, temperature: 36.9, respiratory_rate: 18, weight_kg: 68, height_cm: 158, bmi: 27.2, spo2: 97, consciousness: 'Tỉnh táo', skin: 'Hồng, ẩm', notes: 'Đo buổi sáng tại Daycare', source: 'Daycare' },
    ],
    organ_exams: [
      { id: 'oe-1', date: '2026-04-14', system: 'cardiovascular', findings: 'Nhịp tim đều, không âm thổi', status: 'normal', examined_by: 'BS. Nguyễn Hải' },
      { id: 'oe-2', date: '2026-04-14', system: 'respiratory', findings: 'Rì rào phế nang rõ 2 phế trường', status: 'normal', examined_by: 'BS. Nguyễn Hải' },
      { id: 'oe-3', date: '2026-04-14', system: 'musculoskeletal', findings: 'Đau nhẹ khớp gối 2 bên', status: 'watch', examined_by: 'BS. Nguyễn Hải' },
    ],
    chronic_conditions: [
      { id: 'cc-1', condition: 'Đái tháo đường type 2', icd10: 'E11', since: '2020-01', status: 'controlled', medications: ['Metformin 1000mg 2v/ngày'], monitoring_frequency: 'HbA1c/3 tháng', notes: 'Kiểm soát tốt' },
      { id: 'cc-2', condition: 'Tăng huyết áp', icd10: 'I10', since: '2018-06', status: 'controlled', medications: ['Amlodipine 5mg 1v/ngày'], monitoring_frequency: 'Hàng tuần tại Daycare', notes: '' },
    ],
    lab_results: [
      { id: 'lb-1', date: '2026-04-10', category: 'biochemistry', test_name: 'HbA1c', value: '6.8', unit: '%', reference_range: '< 6.0', flag: 'H', facility: 'BV Bạch Mai', notes: 'Tăng nhẹ' },
      { id: 'lb-2', date: '2026-04-10', category: 'biochemistry', test_name: 'Glucose đói', value: '7.2', unit: 'mmol/L', reference_range: '3.9 - 6.1', flag: 'H', facility: 'BV Bạch Mai', notes: null },
      { id: 'lb-3', date: '2026-04-10', category: 'hematology', test_name: 'Hemoglobin', value: '12.5', unit: 'g/dL', reference_range: '13.0 - 17.5', flag: 'L', facility: 'BV Bạch Mai', notes: 'Nhẹ' },
      { id: 'lb-4', date: '2026-04-10', category: 'immunology', test_name: 'CRP', value: '18.5', unit: 'mg/L', reference_range: '< 5', flag: 'H', facility: 'BV Bạch Mai', notes: 'Cần theo dõi' },
    ],
    imaging: [
      { id: 'im-1', date: '2026-03-15', modality: 'xray', body_part: 'Gối 2 bên', findings: 'Hẹp khe khớp độ II', conclusion: 'Thoái hóa khớp gối', status: 'abnormal', facility: 'BV PHCN Hà Nội', doctor: 'BS. Phạm Văn Đức' },
    ],
    functional_tests: [
      { id: 'ft-1', date: '2026-03-20', test_type: 'ECG', result: 'Nhịp xoang, không ST-T thay đổi', status: 'normal', severity: null, facility: 'BV Bạch Mai', notes: null },
    ],
    immunizations: [
      { id: 'iz-1', vaccine_name: 'Vaccine cúm (Influenza)', date: '2025-10-15', dose_number: 1, facility: 'Trạm y tế xã', status: 'completed' },
      { id: 'iz-2', vaccine_name: 'Vaccine phế cầu', date: '2024-05-10', dose_number: 1, facility: 'BV Bạch Mai', status: 'completed' },
    ],
  }
}

function emptyRecord(): MedicalRecord11Sections {
  return {
    administrative: null,
    allergies: [], illness_history: [], family_history: [],
    vital_signs: [], organ_exams: [], chronic_conditions: [],
    lab_results: [], imaging: [], functional_tests: [], immunizations: [],
  }
}

function getStore() {
  if (!globalThis.__demoMedicalRecords11) {
    globalThis.__demoMedicalRecords11 = { [MINH_ID]: seedForMinh() }
  }
  return globalThis.__demoMedicalRecords11
}

export function getMedicalRecord(citizenId: string): MedicalRecord11Sections {
  const store = getStore()
  if (!store[citizenId]) store[citizenId] = emptyRecord()
  return store[citizenId]
}
