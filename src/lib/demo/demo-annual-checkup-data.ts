// In-memory annual health checkup store for demo mode
// Tracks yearly checkup records per citizen

export type CheckupStatus = 'normal' | 'abnormal' | 'follow_up'

export interface AnnualCheckup {
  id: string
  citizenId: string
  year: number
  examDate: string
  facility: string
  doctorName: string
  generalHealth: string
  bloodPressure?: string
  heartRate?: number
  weight?: number
  height?: number
  bmi?: number
  bloodSugar?: string
  cholesterol?: string
  notes?: string
  status: CheckupStatus
}

// ── Shared in-memory store (persists across hot-reloads in dev) ───────────────
declare const globalThis: { __checkups?: AnnualCheckup[] }

function getStore(): AnnualCheckup[] {
  if (!globalThis.__checkups) {
    globalThis.__checkups = _seed()
  }
  return globalThis.__checkups
}

let _counter = 20
function makeId(): string { return `checkup-${Date.now()}-${++_counter}` }

// ── Seed data ─────────────────────────────────────────────────────────────────
const MINH_ID = 'demo-0001-0000-0000-000000000001'

function _seed(): AnnualCheckup[] {
  return [
    {
      id: 'checkup-2025-minh',
      citizenId: MINH_ID,
      year: 2025,
      examDate: '2025-03-15',
      facility: 'BV Đông Anh',
      doctorName: 'BS. Trần Văn Nam',
      generalHealth: 'Sức khỏe tổng quát trung bình. Huyết áp cao và đường huyết vượt ngưỡng cần theo dõi.',
      bloodPressure: '140/90',
      heartRate: 82,
      weight: 72,
      height: 168,
      bmi: 25.5,
      bloodSugar: '126 mg/dL',
      cholesterol: '210 mg/dL',
      notes: 'Khuyến nghị giảm muối, tăng vận động, tái khám sau 3 tháng.',
      status: 'abnormal',
    },
    {
      id: 'checkup-2024-minh',
      citizenId: MINH_ID,
      year: 2024,
      examDate: '2024-04-10',
      facility: 'BV Đông Anh',
      doctorName: 'BS. Trần Văn Nam',
      generalHealth: 'Sức khỏe ổn định, một số chỉ số cần theo dõi thêm.',
      bloodPressure: '135/85',
      heartRate: 78,
      weight: 71,
      height: 168,
      bmi: 25.1,
      bloodSugar: '118 mg/dL',
      cholesterol: '195 mg/dL',
      notes: 'Theo dõi huyết áp và đường huyết định kỳ.',
      status: 'follow_up',
    },
    {
      id: 'checkup-2023-minh',
      citizenId: MINH_ID,
      year: 2023,
      examDate: '2023-05-20',
      facility: 'Phòng khám Đa khoa',
      doctorName: 'BS. Lê Thị Hòa',
      generalHealth: 'Sức khỏe tốt, các chỉ số trong giới hạn bình thường.',
      bloodPressure: '130/80',
      heartRate: 76,
      weight: 70,
      height: 168,
      bmi: 24.8,
      notes: 'Tiếp tục duy trì lối sống lành mạnh.',
      status: 'normal',
    },
  ]
}

// ── CRUD helpers ──────────────────────────────────────────────────────────────

/** Lấy danh sách khám theo citizenId, sắp xếp mới nhất trước */
export function getCheckups(citizenId: string): AnnualCheckup[] {
  return getStore()
    .filter((c) => c.citizenId === citizenId)
    .sort((a, b) => b.year - a.year)
}

/** Thêm bản ghi khám mới */
export function addCheckup(data: Omit<AnnualCheckup, 'id'>): AnnualCheckup {
  const record: AnnualCheckup = { id: makeId(), ...data }
  getStore().push(record)
  return record
}

/** Cập nhật bản ghi khám */
export function updateCheckup(
  id: string,
  data: Partial<Omit<AnnualCheckup, 'id'>>
): AnnualCheckup | null {
  const store = getStore()
  const idx = store.findIndex((c) => c.id === id)
  if (idx === -1) return null
  store[idx] = { ...store[idx], ...data }
  return store[idx]
}
