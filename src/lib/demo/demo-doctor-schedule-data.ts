// Demo doctor schedule and referral data
// Used for doctor appointment booking feature

// IDs from demo-accounts.ts
const MINH_ID = 'demo-0001-0000-0000-000000000001'
const DUC_ID = 'demo-0004-0000-0000-000000000004'

export interface DoctorTimeSlot {
  id: string
  doctor_id: string
  doctor_name: string
  date: string           // "2026-03-25"
  start_time: string     // "09:00"
  end_time: string       // "09:30"
  is_available: boolean
  booked_by: string | null      // citizen_id
  booked_by_name: string | null
  booked_at: string | null
  notes: string | null          // BS ghi chú
}

export interface DoctorReferralRequest {
  id: string
  citizen_id: string
  citizen_name: string
  specialties_needed: string[]
  description: string           // mô tả nhu cầu
  status: 'pending' | 'assigned' | 'completed'
  assigned_doctor_id: string | null
  assigned_doctor_name: string | null
  admin_notes: string | null
  created_at: string
}

// Helper: get date string N days from today
function dateOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

let _slotCounter = 10

// Seed: BS Hải has 6 slots over 3 days (2/day), 1 booked by Minh
let _slots: DoctorTimeSlot[] = [
  // Day +1
  {
    id: 'slot-001',
    doctor_id: 'demo-doctor-hai',
    doctor_name: 'BS. Nguyễn Hải',
    date: dateOffset(1),
    start_time: '09:00',
    end_time: '09:30',
    is_available: false,
    booked_by: MINH_ID,
    booked_by_name: 'Nguyễn Văn Minh',
    booked_at: new Date().toISOString(),
    notes: null,
  },
  {
    id: 'slot-002',
    doctor_id: 'demo-doctor-hai',
    doctor_name: 'BS. Nguyễn Hải',
    date: dateOffset(1),
    start_time: '14:00',
    end_time: '14:30',
    is_available: true,
    booked_by: null,
    booked_by_name: null,
    booked_at: null,
    notes: null,
  },
  // Day +2
  {
    id: 'slot-003',
    doctor_id: 'demo-doctor-hai',
    doctor_name: 'BS. Nguyễn Hải',
    date: dateOffset(2),
    start_time: '09:00',
    end_time: '09:30',
    is_available: true,
    booked_by: null,
    booked_by_name: null,
    booked_at: null,
    notes: null,
  },
  {
    id: 'slot-004',
    doctor_id: 'demo-doctor-hai',
    doctor_name: 'BS. Nguyễn Hải',
    date: dateOffset(2),
    start_time: '14:00',
    end_time: '14:30',
    is_available: true,
    booked_by: null,
    booked_by_name: null,
    booked_at: null,
    notes: null,
  },
  // Day +3
  {
    id: 'slot-005',
    doctor_id: 'demo-doctor-hai',
    doctor_name: 'BS. Nguyễn Hải',
    date: dateOffset(3),
    start_time: '09:00',
    end_time: '09:30',
    is_available: true,
    booked_by: null,
    booked_by_name: null,
    booked_at: null,
    notes: null,
  },
  {
    id: 'slot-006',
    doctor_id: 'demo-doctor-hai',
    doctor_name: 'BS. Nguyễn Hải',
    date: dateOffset(3),
    start_time: '14:00',
    end_time: '14:30',
    is_available: true,
    booked_by: null,
    booked_by_name: null,
    booked_at: null,
    notes: null,
  },
]

let _referrals: DoctorReferralRequest[] = [
  {
    id: 'ref-001',
    citizen_id: DUC_ID,
    citizen_name: 'Trần Văn Đức',
    specialties_needed: ['Tim mạch', 'Nội tiết'],
    description: 'Tôi bị cao huyết áp và tiểu đường type 2. Cần bác sĩ có kinh nghiệm quản lý bệnh mãn tính.',
    status: 'pending',
    assigned_doctor_id: null,
    assigned_doctor_name: null,
    admin_notes: null,
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
]

// ── Time slot CRUD ─────────────────────────────────────────────────────────────

export function getSlotsByDoctor(doctorId: string): DoctorTimeSlot[] {
  return _slots.filter((s) => s.doctor_id === doctorId)
    .sort((a, b) => `${a.date}${a.start_time}`.localeCompare(`${b.date}${b.start_time}`))
}

export function getAvailableSlotsByDoctor(doctorId: string): DoctorTimeSlot[] {
  return _slots.filter((s) => s.doctor_id === doctorId && s.is_available)
    .sort((a, b) => `${a.date}${a.start_time}`.localeCompare(`${b.date}${b.start_time}`))
}

export function getSlotById(slotId: string): DoctorTimeSlot | undefined {
  return _slots.find((s) => s.id === slotId)
}

export function createSlot(
  data: Omit<DoctorTimeSlot, 'id' | 'is_available' | 'booked_by' | 'booked_by_name' | 'booked_at'>
): DoctorTimeSlot {
  const slot: DoctorTimeSlot = {
    ...data,
    id: `slot-${Date.now()}-${++_slotCounter}`,
    is_available: true,
    booked_by: null,
    booked_by_name: null,
    booked_at: null,
  }
  _slots.push(slot)
  return slot
}

export function bookSlot(
  slotId: string,
  citizenId: string,
  citizenName: string
): DoctorTimeSlot | null {
  const idx = _slots.findIndex((s) => s.id === slotId)
  if (idx === -1 || !_slots[idx].is_available) return null
  _slots[idx] = {
    ..._slots[idx],
    is_available: false,
    booked_by: citizenId,
    booked_by_name: citizenName,
    booked_at: new Date().toISOString(),
  }
  return _slots[idx]
}

export function cancelSlot(slotId: string): DoctorTimeSlot | null {
  const idx = _slots.findIndex((s) => s.id === slotId)
  if (idx === -1) return null
  _slots[idx] = {
    ..._slots[idx],
    is_available: true,
    booked_by: null,
    booked_by_name: null,
    booked_at: null,
  }
  return _slots[idx]
}

export function deleteSlot(slotId: string): boolean {
  const idx = _slots.findIndex((s) => s.id === slotId)
  if (idx === -1 || !_slots[idx].is_available) return false
  _slots.splice(idx, 1)
  return true
}

// ── Referral CRUD ──────────────────────────────────────────────────────────────

export function getReferrals(status?: DoctorReferralRequest['status']): DoctorReferralRequest[] {
  if (status) return _referrals.filter((r) => r.status === status)
  return [..._referrals]
}

export function getReferralsByCitizen(citizenId: string): DoctorReferralRequest[] {
  return _referrals.filter((r) => r.citizen_id === citizenId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

let _refCounter = 1

export function createReferral(
  citizenId: string,
  citizenName: string,
  specialties: string[],
  description: string
): DoctorReferralRequest {
  const ref: DoctorReferralRequest = {
    id: `ref-${Date.now()}-${++_refCounter}`,
    citizen_id: citizenId,
    citizen_name: citizenName,
    specialties_needed: specialties,
    description,
    status: 'pending',
    assigned_doctor_id: null,
    assigned_doctor_name: null,
    admin_notes: null,
    created_at: new Date().toISOString(),
  }
  _referrals.push(ref)
  return ref
}

export function assignReferral(
  referralId: string,
  doctorId: string,
  doctorName: string,
  adminNotes: string | null
): DoctorReferralRequest | null {
  const idx = _referrals.findIndex((r) => r.id === referralId)
  if (idx === -1) return null
  _referrals[idx] = {
    ..._referrals[idx],
    status: 'assigned',
    assigned_doctor_id: doctorId,
    assigned_doctor_name: doctorName,
    admin_notes: adminNotes,
  }
  return _referrals[idx]
}
