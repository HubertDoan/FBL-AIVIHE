// In-memory store for service registrations in demo mode
// Uses globalThis pattern to persist across hot-reloads (same as other demo data files)
//
// Full lifecycle: pending_approval → approved → payment_pending → active → expired/cancelled
// Free package (type 0) auto-activates. Paid packages go through GĐ approval + SePay payment.
// After SePay confirms, system auto-generates service_code (SVC-HN-xxxxxx) to deduct visits.

export type ServiceRegistrationStatus =
  | 'pending_approval'
  | 'payment_pending'
  | 'active'
  | 'expired'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | 'suspended'

export interface ServiceRegistration {
  id: string
  citizen_id: string
  package_type: number
  status: ServiceRegistrationStatus
  selected_doctor_id: string | null
  phcn_location: 'center' | 'home' | null
  specialist_type: string | null
  service_code: string | null                          // SVC-HN-000001 (sinh sau khi thanh toán)
  total_visits: number                                 // Số lượt sử dụng tối đa (0 = unlimited)
  used_visits: number                                  // Số lượt đã dùng
  price_amount: number                                 // VND (0 = miễn phí)
  payment_content: string | null                       // "SVC {id_short}" — nội dung chuyển khoản
  director_notes: string | null
  approved_by: string | null
  approved_at: string | null
  rejected_reason: string | null
  payment_confirmed_at: string | null
  sepay_transaction_id: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

declare global {
  // eslint-disable-next-line no-var
  var __demoServiceRegistrations: ServiceRegistration[] | undefined
  // eslint-disable-next-line no-var
  var __demoServiceCodeSeq: number | undefined
}

const MINH_ID = 'demo-0001-0000-0000-000000000001'

const PACKAGE_PRICES: Record<number, number> = {
  0: 0,        // Cơ bản — miễn phí
  1: 500000,   // BSGĐ — 500k/tháng (thuê bao + 4 lần tư vấn)
  2: 300000,   // PHCN — 300k/buổi (gói 10 buổi = 3M)
  3: 800000,   // Chuyên khoa sâu — 800k/lần
}

const PACKAGE_VISITS: Record<number, number> = {
  0: 0,   // Unlimited (miễn phí, không trừ lượt)
  1: 4,   // 4 lần tư vấn BSGĐ
  2: 10,  // 10 buổi PHCN
  3: 1,   // 1 lần chuyên khoa
}

function seedStore(): ServiceRegistration[] {
  return [
    {
      id: 'svc-reg-demo-0001',
      citizen_id: MINH_ID,
      package_type: 0,
      status: 'active',
      selected_doctor_id: null,
      phcn_location: null,
      specialist_type: null,
      service_code: null,
      total_visits: 0,
      used_visits: 0,
      price_amount: 0,
      payment_content: null,
      director_notes: null,
      approved_by: null,
      approved_at: null,
      rejected_reason: null,
      payment_confirmed_at: null,
      sepay_transaction_id: null,
      expires_at: null,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

function getStore(): ServiceRegistration[] {
  if (!globalThis.__demoServiceRegistrations) {
    globalThis.__demoServiceRegistrations = seedStore()
  }
  return globalThis.__demoServiceRegistrations
}

function nextServiceCodeSeq(): number {
  if (globalThis.__demoServiceCodeSeq === undefined) globalThis.__demoServiceCodeSeq = 0
  globalThis.__demoServiceCodeSeq += 1
  return globalThis.__demoServiceCodeSeq
}

let _idCounter = 0
function makeId(): string {
  return `svc-reg-${Date.now()}-${++_idCounter}`
}

export function generateServiceCode(location = 'HN'): string {
  const seq = nextServiceCodeSeq()
  return `SVC-${location}-${String(seq).padStart(6, '0')}`
}

export function getAllServiceRegistrations(): ServiceRegistration[] {
  return [...getStore()].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export function getServiceRegistrations(citizenId: string): ServiceRegistration[] {
  return getStore()
    .filter((r) => r.citizen_id === citizenId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function getServiceRegistrationById(id: string): ServiceRegistration | null {
  return getStore().find((r) => r.id === id) || null
}

export function createServiceRegistration(
  data: Pick<ServiceRegistration, 'citizen_id' | 'package_type' | 'selected_doctor_id' | 'phcn_location' | 'specialist_type'>
): ServiceRegistration {
  const now = new Date().toISOString()
  const priceAmount = PACKAGE_PRICES[data.package_type] ?? 0
  // Gói miễn phí auto-active
  const isFree = data.package_type === 0
  const shortId = makeId()

  const reg: ServiceRegistration = {
    ...data,
    id: shortId,
    status: isFree ? 'active' : 'pending_approval',
    service_code: isFree ? generateServiceCode() : null,
    total_visits: PACKAGE_VISITS[data.package_type] ?? 0,
    used_visits: 0,
    price_amount: priceAmount,
    payment_content: null,
    director_notes: null,
    approved_by: null,
    approved_at: isFree ? now : null,
    rejected_reason: null,
    payment_confirmed_at: null,
    sepay_transaction_id: null,
    expires_at: null,
    created_at: now,
    updated_at: now,
  }
  getStore().push(reg)
  return reg
}

export function updateServiceRegistration(
  id: string,
  patch: Partial<ServiceRegistration>
): ServiceRegistration | null {
  const store = getStore()
  const idx = store.findIndex(r => r.id === id)
  if (idx === -1) return null
  store[idx] = { ...store[idx], ...patch, updated_at: new Date().toISOString() }
  return store[idx]
}

export function approveServiceRegistration(id: string, approverId: string, notes?: string): ServiceRegistration | null {
  const reg = getServiceRegistrationById(id)
  if (!reg) return null
  const shortId = id.slice(-6).toUpperCase()
  return updateServiceRegistration(id, {
    status: 'payment_pending',
    approved_by: approverId,
    approved_at: new Date().toISOString(),
    director_notes: notes || null,
    payment_content: `SVC${shortId}`,
  })
}

export function rejectServiceRegistration(id: string, approverId: string, reason: string): ServiceRegistration | null {
  return updateServiceRegistration(id, {
    status: 'rejected',
    approved_by: approverId,
    approved_at: new Date().toISOString(),
    rejected_reason: reason,
  })
}

export function confirmPaymentForServiceRegistration(id: string, sepayTxnId?: string): ServiceRegistration | null {
  const reg = getServiceRegistrationById(id)
  if (!reg) return null
  const code = reg.service_code || generateServiceCode()
  return updateServiceRegistration(id, {
    status: 'active',
    service_code: code,
    payment_confirmed_at: new Date().toISOString(),
    sepay_transaction_id: sepayTxnId || null,
  })
}

export function recordServiceUsage(id: string): ServiceRegistration | null {
  const reg = getServiceRegistrationById(id)
  if (!reg) return null
  if (reg.total_visits > 0 && reg.used_visits >= reg.total_visits) return null
  const newUsed = reg.used_visits + 1
  const newStatus: ServiceRegistrationStatus =
    reg.total_visits > 0 && newUsed >= reg.total_visits ? 'completed' : reg.status
  return updateServiceRegistration(id, { used_visits: newUsed, status: newStatus })
}

export function findByServiceCode(code: string): ServiceRegistration | null {
  return getStore().find((r) => r.service_code === code) || null
}

export function findByPaymentContent(content: string): ServiceRegistration | null {
  const upper = content.toUpperCase()
  return getStore().find((r) => r.payment_content && upper.includes(r.payment_content.toUpperCase())) || null
}
