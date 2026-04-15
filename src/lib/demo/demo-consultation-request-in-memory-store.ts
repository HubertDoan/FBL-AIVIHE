/**
 * In-memory store for consultation requests (demo mode)
 * Dùng globalThis để persist across API route invocations trong cùng Node process
 *
 * Workflow: trang chủ → submit form → lưu ở đây → reception xem, bổ sung info → GĐ duyệt
 */

export interface ConsultationRequest {
  id: string
  full_name: string
  phone: string
  channel: 'daycare' | 'family-doctor' | 'rehabilitation' | 'unsure' | null
  status: 'new' | 'contacted' | 'info_completed' | 'approved' | 'rejected' | 'converted'
  // Info bổ sung sau khi NV liên hệ (optional, điền bởi reception)
  extended_info?: {
    date_of_birth?: string
    gender?: 'male' | 'female' | 'other'
    national_id?: string
    address?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
    interested_packages?: string[]
    notes?: string
  }
  contacted_by?: string // reception user id
  contacted_at?: string
  approved_by?: string // director user id
  approved_at?: string
  rejected_reason?: string
  converted_to_citizen_id?: string // sau khi tạo account
  created_at: string
  updated_at: string
}

type Store = { __AIVIHE_CONSULTATION_REQUESTS?: ConsultationRequest[] }
const g = globalThis as unknown as Store

if (!g.__AIVIHE_CONSULTATION_REQUESTS) {
  // Seed với vài request mẫu để reception có data test
  g.__AIVIHE_CONSULTATION_REQUESTS = [
    {
      id: 'cr-demo-001',
      full_name: 'Trần Thị Lan Anh',
      phone: '0912345001',
      channel: 'family-doctor',
      status: 'new',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'cr-demo-002',
      full_name: 'Nguyễn Văn Bình',
      phone: '0912345002',
      channel: 'daycare',
      status: 'contacted',
      contacted_by: 'demo-reception',
      contacted_at: new Date(Date.now() - 1800000).toISOString(),
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 1800000).toISOString(),
    },
  ]
}

const STORE = g.__AIVIHE_CONSULTATION_REQUESTS!

export function getAllConsultationRequests(): ConsultationRequest[] {
  return [...STORE].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export function getConsultationRequestById(id: string): ConsultationRequest | null {
  return STORE.find(r => r.id === id) || null
}

export function createConsultationRequest(input: {
  full_name: string
  phone: string
  channel: ConsultationRequest['channel']
}): ConsultationRequest {
  const now = new Date().toISOString()
  const newReq: ConsultationRequest = {
    id: `cr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    full_name: input.full_name,
    phone: input.phone,
    channel: input.channel,
    status: 'new',
    created_at: now,
    updated_at: now,
  }
  STORE.unshift(newReq)
  return newReq
}

export function updateConsultationRequest(
  id: string,
  patch: Partial<ConsultationRequest>
): ConsultationRequest | null {
  const idx = STORE.findIndex(r => r.id === id)
  if (idx === -1) return null
  STORE[idx] = {
    ...STORE[idx],
    ...patch,
    updated_at: new Date().toISOString(),
  }
  return STORE[idx]
}

export function countByStatus(): Record<ConsultationRequest['status'], number> {
  const counts: Record<string, number> = {
    new: 0, contacted: 0, info_completed: 0,
    approved: 0, rejected: 0, converted: 0,
  }
  STORE.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1 })
  return counts as Record<ConsultationRequest['status'], number>
}
