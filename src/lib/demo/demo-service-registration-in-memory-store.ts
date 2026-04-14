// In-memory store for service registrations in demo mode
// Uses globalThis pattern to persist across hot-reloads (same as other demo data files)

export type ServiceRegistrationStatus =
  | 'pending_approval'
  | 'active'
  | 'suspended'
  | 'cancelled'

export interface ServiceRegistration {
  id: string
  citizen_id: string          // References DemoAccount.id
  package_type: number        // 0=free, 1=family-doctor, 2=rehab, 3=specialist
  status: ServiceRegistrationStatus
  selected_doctor_id: string | null   // For packageType 1+
  phcn_location: 'center' | 'home' | null  // For packageType 2
  specialist_type: string | null      // For packageType 3
  created_at: string
  updated_at: string
}

// Use globalThis so the store survives Next.js hot-reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var __demoServiceRegistrations: ServiceRegistration[] | undefined
}

const MINH_ID = 'demo-0001-0000-0000-000000000001'

// Seed with one active free package for demo citizen "minh"
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

let _idCounter = 0
function makeId(): string {
  return `svc-reg-${Date.now()}-${++_idCounter}`
}

/** Return all registrations for a given citizen */
export function getServiceRegistrations(citizenId: string): ServiceRegistration[] {
  return getStore().filter((r) => r.citizen_id === citizenId)
}

/** Create a new registration with status pending_approval */
export function createServiceRegistration(
  data: Pick<ServiceRegistration, 'citizen_id' | 'package_type' | 'selected_doctor_id' | 'phcn_location' | 'specialist_type'>
): ServiceRegistration {
  const now = new Date().toISOString()
  const reg: ServiceRegistration = {
    ...data,
    id: makeId(),
    status: 'pending_approval',
    created_at: now,
    updated_at: now,
  }
  getStore().push(reg)
  return reg
}
