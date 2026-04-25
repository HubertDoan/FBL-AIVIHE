// Demo data for AIVIHE health record — 4 categories per customer:
// 1. Daycare activities (mirrored from Thong Dong Daycare via webhook)
// 2. Bác sĩ gia đình (family doctor encounters)
// 3. Phục hồi chức năng (rehab sessions)
// 4. Khám chữa bệnh (hospital/clinic visits)

export interface DaycareActivity {
  id: string
  citizen_id: string
  date: string               // YYYY-MM-DD
  checkin_at: string | null  // ISO
  checkout_at: string | null
  activities: string[]       // ['Yoga', 'Khí công', 'Ăn trưa']
  meal_status: string | null // 'ăn đầy đủ' / 'ăn ít'
  nap_duration_minutes: number | null
  mood_rating: number | null // 1-5
  staff_notes: string | null
  vitals_snapshot: {
    blood_pressure?: string
    heart_rate?: number
    blood_glucose?: number
    spo2?: number
    weight?: number
  }
  incidents: Array<{ type: string; description: string; severity: string }>
  source: 'daycare_webhook'
}

export interface FamilyDoctorEncounter {
  id: string
  citizen_id: string
  doctor_name: string
  doctor_id: string
  date: string
  reason: string             // Lý do khám
  symptoms: string
  diagnosis: string | null
  diagnosis_icd10: string | null
  vital_signs: string | null
  prescription: string | null
  follow_up_plan: string | null
  recommendations: string[]
  next_visit: string | null
}

export interface RehabSession {
  id: string
  citizen_id: string
  date: string
  technician_name: string
  session_type: string       // 'Vật lý trị liệu' / 'Tập vận động'
  location: 'center' | 'home'
  duration_minutes: number
  exercises: string[]
  pain_level_before: number | null  // 0-10
  pain_level_after: number | null
  mobility_score: number | null     // 0-100
  notes: string
  next_session: string | null
}

export interface ClinicVisit {
  id: string
  citizen_id: string
  date: string
  facility: string           // BV tên, PK chuyên khoa
  specialty: string          // Tim mạch, Nội khoa, Khớp
  doctor_name: string
  reason: string
  diagnosis: string
  tests_done: string[]       // Xét nghiệm đã làm
  treatments: string[]       // Điều trị
  medications_prescribed: string[]
  document_ids: string[]     // Reference source_documents
  follow_up: string | null
}

declare global {
  // eslint-disable-next-line no-var
  var __demoHealthRecord: {
    daycare: DaycareActivity[]
    familyDoctor: FamilyDoctorEncounter[]
    rehab: RehabSession[]
    clinicVisits: ClinicVisit[]
  } | undefined
}

const MINH_ID = 'demo-0001-0000-0000-000000000001'

function seedData(): {
  daycare: DaycareActivity[]
  familyDoctor: FamilyDoctorEncounter[]
  rehab: RehabSession[]
  clinicVisits: ClinicVisit[]
} {
  const today = new Date()
  const daysAgo = (n: number) => new Date(today.getTime() - n * 24 * 3600 * 1000).toISOString().slice(0, 10)

  return {
    daycare: [
      {
        id: 'dc-001', citizen_id: MINH_ID, date: daysAgo(1),
        checkin_at: daysAgo(1) + 'T08:15:00+07:00', checkout_at: daysAgo(1) + 'T17:00:00+07:00',
        activities: ['Yoga buổi sáng', 'Khí công', 'Ăn trưa cùng nhóm', 'Nghỉ trưa', 'Trò chơi trí tuệ'],
        meal_status: 'Ăn đầy đủ, hấp thu tốt',
        nap_duration_minutes: 60, mood_rating: 5,
        staff_notes: 'Ông Minh tham gia tích cực, vui vẻ, không có dấu hiệu bất thường.',
        vitals_snapshot: { blood_pressure: '125/82', heart_rate: 76, blood_glucose: 105, spo2: 97, weight: 65.5 },
        incidents: [], source: 'daycare_webhook' as const,
      },
      {
        id: 'dc-002', citizen_id: MINH_ID, date: daysAgo(2),
        checkin_at: daysAgo(2) + 'T08:20:00+07:00', checkout_at: daysAgo(2) + 'T17:05:00+07:00',
        activities: ['Đi bộ sân vườn', 'Âm nhạc trị liệu', 'Ăn trưa', 'Nghỉ trưa'],
        meal_status: 'Ăn vừa phải', nap_duration_minutes: 75, mood_rating: 4,
        staff_notes: 'Hơi mệt buổi chiều, cần theo dõi huyết áp.',
        vitals_snapshot: { blood_pressure: '148/92', heart_rate: 95, blood_glucose: 155, spo2: 96 },
        incidents: [], source: 'daycare_webhook' as const,
      },
      {
        id: 'dc-003', citizen_id: MINH_ID, date: daysAgo(4),
        checkin_at: daysAgo(4) + 'T08:10:00+07:00', checkout_at: daysAgo(4) + 'T16:55:00+07:00',
        activities: ['Yoga', 'Trà đạo', 'Ăn trưa'],
        meal_status: 'Ăn đầy đủ', nap_duration_minutes: 50, mood_rating: 5,
        staff_notes: 'Tinh thần rất tốt.',
        vitals_snapshot: { blood_pressure: '122/80', heart_rate: 74, blood_glucose: 92, spo2: 98 },
        incidents: [], source: 'daycare_webhook' as const,
      },
    ],
    familyDoctor: [
      {
        id: 'fd-001', citizen_id: MINH_ID,
        doctor_name: 'BS. Nguyễn Hải', doctor_id: 'doc-1',
        date: daysAgo(7),
        reason: 'Khám định kỳ theo dõi huyết áp',
        symptoms: 'Huyết áp dao động 130-140/85-90, đôi khi chóng mặt buổi sáng',
        diagnosis: 'Tăng huyết áp nguyên phát — kiểm soát tốt',
        diagnosis_icd10: 'I10',
        vital_signs: 'HA: 135/85 · Nhịp tim: 78 · SpO2: 97%',
        prescription: 'Amlodipine 5mg 1 viên/ngày',
        follow_up_plan: 'Theo dõi huyết áp hàng ngày tại Daycare, tái khám sau 1 tháng',
        recommendations: ['Giảm muối', 'Đi bộ 30 phút/ngày', 'Tránh stress'],
        next_visit: daysAgo(-23),
      },
    ],
    rehab: [
      {
        id: 'rh-001', citizen_id: MINH_ID, date: daysAgo(3),
        technician_name: 'KTV Trần Minh', session_type: 'Vật lý trị liệu khớp gối',
        location: 'center', duration_minutes: 45,
        exercises: ['Co duỗi gối có kháng lực', 'Đạp xe tại chỗ', 'Tập đi thăng bằng'],
        pain_level_before: 6, pain_level_after: 3, mobility_score: 72,
        notes: 'Đáp ứng tốt. Giảm đau sau buổi tập. Khuyến nghị tập đều 3 buổi/tuần.',
        next_session: daysAgo(-2),
      },
    ],
    clinicVisits: [
      {
        id: 'cv-001', citizen_id: MINH_ID, date: daysAgo(30),
        facility: 'Bệnh viện Phục hồi chức năng Hà Nội',
        specialty: 'Cơ xương khớp', doctor_name: 'BS. Phạm Văn Đức',
        reason: 'Đau khớp gối kéo dài 3 tháng',
        diagnosis: 'Thoái hóa khớp gối độ II',
        tests_done: ['X-quang gối 2 bên', 'Xét nghiệm máu cơ bản'],
        treatments: ['Tiêm acid hyaluronic', 'Chỉ định vật lý trị liệu'],
        medications_prescribed: ['Paracetamol 500mg PRN', 'Glucosamine 750mg 2v/ngày'],
        document_ids: [], follow_up: 'Tái khám sau 3 tháng',
      },
    ],
  }
}

function getStore() {
  if (!globalThis.__demoHealthRecord) {
    globalThis.__demoHealthRecord = seedData()
  }
  return globalThis.__demoHealthRecord
}

export function getDaycareActivities(citizenId: string): DaycareActivity[] {
  return getStore().daycare.filter(d => d.citizen_id === citizenId).sort((a, b) => b.date.localeCompare(a.date))
}

export function getFamilyDoctorEncounters(citizenId: string): FamilyDoctorEncounter[] {
  return getStore().familyDoctor.filter(d => d.citizen_id === citizenId).sort((a, b) => b.date.localeCompare(a.date))
}

export function getRehabSessions(citizenId: string): RehabSession[] {
  return getStore().rehab.filter(d => d.citizen_id === citizenId).sort((a, b) => b.date.localeCompare(a.date))
}

export function getClinicVisits(citizenId: string): ClinicVisit[] {
  return getStore().clinicVisits.filter(d => d.citizen_id === citizenId).sort((a, b) => b.date.localeCompare(a.date))
}

// Helpers to add records after upload + user verification
let _idCounter = 0
function makeRecordId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++_idCounter}`
}

export function addClinicVisit(data: Omit<ClinicVisit, 'id'>): ClinicVisit {
  const record: ClinicVisit = { ...data, id: makeRecordId('cv') }
  getStore().clinicVisits.unshift(record)
  return record
}

export function addFamilyDoctorEncounter(data: Omit<FamilyDoctorEncounter, 'id'>): FamilyDoctorEncounter {
  const record: FamilyDoctorEncounter = { ...data, id: makeRecordId('fd') }
  getStore().familyDoctor.unshift(record)
  return record
}

export function addRehabSession(data: Omit<RehabSession, 'id'>): RehabSession {
  const record: RehabSession = { ...data, id: makeRecordId('rh') }
  getStore().rehab.unshift(record)
  return record
}

export function addDaycareActivity(data: Omit<DaycareActivity, 'id'>): DaycareActivity {
  const record: DaycareActivity = { ...data, id: makeRecordId('dc') }
  getStore().daycare.unshift(record)
  return record
}
