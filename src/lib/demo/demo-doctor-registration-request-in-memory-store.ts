/**
 * In-memory store for doctor registration requests (demo mode)
 * Dùng globalThis để persist across API route invocations trong cùng Node process
 *
 * Workflow: BS submit form trang chủ → reception liên hệ, bổ sung extended_info → GĐ duyệt → tạo acc doctor
 */

export interface DoctorRegistrationRequest {
  id: string
  full_name: string
  phone: string
  email?: string
  license_number: string
  doctor_type: 'general' | 'oriental' | 'family_medicine' | 'specialist'
  specialties: string[]
  main_qualification?: string
  additional_certifications: string[]
  employment_type: 'fulltime' | 'parttime'
  status: 'new' | 'contacted' | 'info_completed' | 'approved' | 'rejected' | 'converted'
  extended_info?: {
    fee_per_session?: number
    fee_per_day?: number
    fee_per_patient?: number
    house_visit?: boolean
    location?: string
    languages?: string[]
    bio?: string
    experience_years?: number
    schedule_notes?: string
    bank_info?: { bank_name?: string; account_number?: string; account_name?: string }
    contract_signed?: boolean
    contract_signed_at?: string
  }
  contacted_by?: string
  contacted_at?: string
  approved_by?: string
  approved_at?: string
  rejected_reason?: string
  converted_to_doctor_id?: string
  created_at: string
  updated_at: string
}

type Store = { __AIVIHE_DOCTOR_REG_REQUESTS?: DoctorRegistrationRequest[] }
const g = globalThis as unknown as Store

if (!g.__AIVIHE_DOCTOR_REG_REQUESTS) {
  // Seed với vài request mẫu để test
  g.__AIVIHE_DOCTOR_REG_REQUESTS = [
    {
      id: 'drr-demo-001',
      full_name: 'BS. Nguyễn Thành Tâm',
      phone: '0912000001',
      email: 'tamnt@example.com',
      license_number: '009999/HNO-GPHN',
      doctor_type: 'family_medicine',
      specialties: [],
      main_qualification: 'Bác sĩ Y học Gia đình',
      additional_certifications: ['Chứng chỉ Lão khoa cơ bản'],
      employment_type: 'fulltime',
      status: 'new',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'drr-demo-002',
      full_name: 'BS. Trần Minh Đức',
      phone: '0912000002',
      email: 'ducbsgd@example.com',
      license_number: '012345/HNO-GPHN',
      doctor_type: 'general',
      specialties: ['Nội tổng quát', 'Tim mạch cơ bản'],
      main_qualification: 'Bác sĩ Đa khoa',
      additional_certifications: [],
      employment_type: 'parttime',
      status: 'contacted',
      contacted_by: 'demo-reception',
      contacted_at: new Date(Date.now() - 1800000).toISOString(),
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 1800000).toISOString(),
    },
  ]
}

const STORE = g.__AIVIHE_DOCTOR_REG_REQUESTS!

export function getAllDoctorRegistrationRequests(): DoctorRegistrationRequest[] {
  return [...STORE].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export function getDoctorRegistrationRequestById(id: string): DoctorRegistrationRequest | null {
  return STORE.find(r => r.id === id) || null
}

export function createDoctorRegistrationRequest(
  input: Omit<DoctorRegistrationRequest, 'id' | 'status' | 'created_at' | 'updated_at'>
): DoctorRegistrationRequest {
  const now = new Date().toISOString()
  const newReq: DoctorRegistrationRequest = {
    ...input,
    id: `drr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: 'new',
    created_at: now,
    updated_at: now,
  }
  STORE.unshift(newReq)
  return newReq
}

export function updateDoctorRegistrationRequest(
  id: string,
  patch: Partial<DoctorRegistrationRequest>
): DoctorRegistrationRequest | null {
  const idx = STORE.findIndex(r => r.id === id)
  if (idx === -1) return null
  STORE[idx] = { ...STORE[idx], ...patch, updated_at: new Date().toISOString() }
  return STORE[idx]
}

export function countDoctorRequestsByStatus(): Record<DoctorRegistrationRequest['status'], number> {
  const counts: Record<string, number> = {
    new: 0, contacted: 0, info_completed: 0,
    approved: 0, rejected: 0, converted: 0,
  }
  STORE.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1 })
  return counts as Record<DoctorRegistrationRequest['status'], number>
}
